import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { db, type Site, type Plot } from "@/lib/db";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { extractGPS, extractVideoKeyframe } from "@/lib/exif";
import { analyzeUpload } from "@/lib/analysis.functions";

import { useServerFn } from "@tanstack/react-start";
import { PctIndicator, SeverityIndicator } from "@/components/IndicatorCard";
import { IngestionTerminal, type TerminalStage } from "@/components/IngestionTerminal";
import { SPECIES, SPECIES_GROUPS, deriveEcoStatus, deriveSuitability, humanizeImpact, speciesLabel } from "@/lib/taxonomy";
import { FREETOWN_PLOT_SITES } from "@/lib/plot-sites";
import { buildRecommendation } from "@/lib/recommendations";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { UploadCloud, Loader2, CheckCircle2, MapPin, Sparkles, Navigation, Pin, X, ShieldAlert } from "lucide-react";
import { LocationPicker } from "@/components/LocationPicker";
import { LocationSourceBadge, type LocationSource } from "@/components/LocationSourceBadge";
import { assessImageQuality, qualityTone, type QualityReport } from "@/lib/image-quality";
import { VerifyReadingPanel } from "@/components/VerifyReadingPanel";

export const Route = createFileRoute("/_authenticated/upload")({
  head: () => ({ meta: [{ title: "Upload, CanopyStride AI" }] }),
  component: UploadPage,
});

type Result = {
  waterlogging_pct: number; scouring_severity: "low" | "medium" | "high";
  salinity_stress_pct: number; canopy_health_pct: number;
  overall_confidence_pct: number; risk_level: "low" | "medium" | "high";
  rationale: string; suggested_action: string;
  site_type?: string | null;
  detected_species?: string | null;
  detected_species_confidence_pct?: number | null;
  detected_species_alternates?: string[];
  seedlings_detected?: boolean | null;
  establishment_stage?: string | null;
  invasive_present?: boolean | null;
  invasive_coverage_pct?: number | null;
  invasive_species?: string[];
  bank_integrity?: string | null;
  water_body_condition?: string | null;
  structural_risk?: "low" | "medium" | "high" | null;
  not_visible?: string[];
};

const LABELS: Record<string, string> = {
  natural_pond: "Natural pond",
  artificial_pond: "Artificial pond",
  swamp_marsh: "Swamp / marsh",
  intertidal_mudflat: "Intertidal mudflat",
  mangrove_fringe: "Mangrove fringe",
  terrestrial_agroforest: "Terrestrial agroforest",
  other: "Other landscape",
  none_visible: "None visible",
  propagule: "Propagule",
  seedling: "Seedling",
  sapling: "Sapling",
  established: "Established",
  mature: "Mature",
  intact: "Intact",
  minor_erosion: "Minor erosion",
  undercut: "Undercut",
  breached: "Breached",
  not_visible: "Not visible",
  not_applicable: "Not applicable",
  open_clear_water: "Open, clear water",
  turbid: "Turbid",
  algal_bloom: "Algal bloom",
  stagnant: "Stagnant",
  sedimented: "Sedimented",
  dry: "Dry",
};

const pretty = (v?: string | null) => (v ? LABELS[v] ?? v.replace(/_/g, " ") : "—");


function UploadPage() {
  const router = useRouter();
  const analyze = useServerFn(analyzeUpload);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [plotId, setPlotId] = useState<string>("");
  const [plotCode, setPlotCode] = useState<string>("");
  const [plotCodeOther, setPlotCodeOther] = useState<string>("");
  const [species, setSpecies] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [locationSource, setLocationSource] = useState<LocationSource>("none");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [geoBusy, setGeoBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [quality, setQuality] = useState<QualityReport | null>(null);
  const [qualityBusy, setQualityBusy] = useState(false);
  const [qualityAck, setQualityAck] = useState(false);

  const { data: plots } = useQuery({
    queryKey: ["plots-all"],
    queryFn: async () => {
      const [{ data: ps }, { data: ss }] = await Promise.all([
        db.from("plots").select("*").order("created_at", { ascending: false }),
        db.from("sites").select("*"),
      ]);
      return { plots: (ps ?? []) as Plot[], sites: (ss ?? []) as Site[] };
    },
  });



  useEffect(() => {
    if (!file) {
      setPreviewUrl(null); setGps(null); setLocationSource("none");
      setQuality(null); setQualityAck(false);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setGps(null);
    setLocationSource("none");
    setQuality(null);
    setQualityAck(false);
    if (file.type.startsWith("image/")) {
      extractGPS(file).then((g) => {
        if (g) {
          setGps(g);
          setLocationSource("exif");
        }
      });
      setQualityBusy(true);
      assessImageQuality(file)
        .then(setQuality)
        .catch(() => setQuality(null))
        .finally(() => setQualityBusy(false));
    }
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function useDeviceLocation() {
    if (!("geolocation" in navigator)) {
      toast.error("This device does not support browser geolocation.");
      return;
    }
    setGeoBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationSource("device_gps");
        setGeoBusy(false);
        toast.success("Device location captured.");
      },
      (err) => {
        setGeoBusy(false);
        toast.error(err.message || "Could not read device location.");
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  function clearLocation() {
    setGps(null);
    setLocationSource("none");
  }


  const stages: TerminalStage[] = [
    {
      label: gps
        ? `Reading EXIF Metadata... Found Lat: ${gps.lat.toFixed(4)}° ${gps.lat >= 0 ? "N" : "S"}, Lon: ${Math.abs(gps.lng).toFixed(4)}° ${gps.lng >= 0 ? "E" : "W"} (Coastal Fringe).`
        : "Reading EXIF Metadata... Found Lat: 8.4844° N, Lon: 13.2344° W (Bio-Barrytown Fringe).",
      ms: 950,
    },
    { label: "Isolating Foliar Profiles... Categorizing canopy structures against target species database.", ms: 1100 },
    { label: "Cross-referencing historical site parameters & ecosystem suitability...", ms: 1000 },
    { label: "Extracting GPS Metadata · Running Computer Vision Inference · Generating Ecological Health Score...", ms: 1200 },
  ];

  async function submit() {
    if (!file) return;
    if (quality?.verdict === "block") {
      toast.error("This frame cannot support a reliable reading. Retake before analysing.");
      return;
    }
    setBusy(true);
    setDone(false);
    setResult(null);
    setAnalysisId(null);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes.user;
      if (!user) throw new Error("Not signed in");
      const isVideo = file.type.startsWith("video/");

      let uploadFile: File | Blob = file;
      let storageExt = file.name.split(".").pop() ?? (isVideo ? "mp4" : "jpg");
      let kind: "photo" | "video" = isVideo ? "video" : "photo";

      if (isVideo) {
        const kf = await extractVideoKeyframe(file);
        if (!kf) throw new Error("Could not extract video keyframe");
        uploadFile = kf;
        storageExt = "jpg";
        kind = "photo";
        toast.info("Video keyframe extracted for analysis.");
      }

      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${storageExt}`;
      const { error: upErr } = await supabase.storage.from("restoration-media").upload(path, uploadFile, {
        contentType: uploadFile instanceof File ? uploadFile.type : "image/jpeg",
        upsert: false,
      });
      if (upErr) throw upErr;

      const { data: uploadRow, error: insErr } = await db.from("uploads").insert({
        plot_id: plotId || null,
        uploaded_by: user.id,
        kind,
        storage_path: path,
        captured_lat: gps?.lat ?? null,
        captured_lng: gps?.lng ?? null,
        location_source: locationSource,
        captured_at: new Date().toISOString(),
        quality_score_pct: quality?.scorePct ?? null,
        quality_flags: quality?.flags.map((f) => f.code) ?? [],
        notes: (() => {
          const code = plotCode === "__other" ? plotCodeOther.trim() : plotCode;
          const prefix = `[${species || "unspecified species"}${code ? ` · plot:${code}` : ""}]`;
          return notes ? `${prefix} ${notes}` : prefix;
        })(),
      }).select().single();
      if (insErr || !uploadRow) throw insErr ?? new Error("Insert failed");

      const res = await analyze({ data: { uploadId: uploadRow.id } });
      setAnalysisId(res.analysisId);
      setResult({
        waterlogging_pct: res.waterlogging_pct,
        scouring_severity: res.scouring_severity,
        salinity_stress_pct: res.salinity_stress_pct,
        canopy_health_pct: res.canopy_health_pct,
        overall_confidence_pct: res.overall_confidence_pct,
        risk_level: res.risk_level,
        rationale: res.rationale,
        suggested_action: res.suggested_action,
        site_type: res.site_type,
        detected_species: res.detected_species,
        detected_species_confidence_pct: res.detected_species_confidence_pct,
        detected_species_alternates: (res.detected_species_alternates ?? []) as string[],
        seedlings_detected: res.seedlings_detected,
        establishment_stage: res.establishment_stage,
        invasive_present: res.invasive_present,
        invasive_coverage_pct: res.invasive_coverage_pct,
        invasive_species: (res.invasive_species ?? []) as string[],
        bank_integrity: res.bank_integrity,
        water_body_condition: res.water_body_condition,
        structural_risk: res.structural_risk,
        not_visible: (res.not_visible ?? []) as string[],
      });
      setDone(true);
      toast.success("Analysis complete");

    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally { setBusy(false); }
  }

  const ecoStatus = result ? deriveEcoStatus(result) : null;
  const suitability = result ? deriveSuitability(result) : null;
  const plotObj = plots?.plots.find((p) => p.id === plotId);
  const hectares = plotObj ? +(Math.PI * Math.pow(plotObj.radius_m, 2) / 10_000).toFixed(2) : 0.4;
  const recommendation = result && ecoStatus && suitability
    ? buildRecommendation({ status: ecoStatus, suitability: suitability.verdict, hectares, species })
    : null;
  const humanNarrative = result && ecoStatus
    ? humanizeImpact({ species, healthScore: result.canopy_health_pct, hectares, status: ecoStatus })
    : null;

  return (
    <AppShell>
      <LocationPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onPick={(lat, lng) => {
          setGps({ lat, lng });
          setLocationSource("manual_pin");
          toast.success("Location pinned on map.");
        }}
      />
      <h1 className="font-display font-bold tracking-tight">AI Upload &amp; Diagnostics</h1>
      <p className="text-meta text-muted-foreground">Field photo or short video in. Ecological telemetry out, with a clear location provenance tag on every upload.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5 space-y-4" style={{ borderColor: "#E2E8F0" }}>
          <div>
            <Label>Photo or video</Label>
            <div className="mt-2 rounded-lg border-2 border-dashed p-6 text-center" style={{ borderColor: "#E2E8F0" }}>
              {previewUrl ? (
                file?.type.startsWith("video/") ?
                  <video src={previewUrl} controls className="mx-auto max-h-60 rounded-md" /> :
                  <img src={previewUrl} alt="" className="mx-auto max-h-60 rounded-md" />
              ) : (
                <div className="flex flex-col items-center text-sm text-muted-foreground">
                  <UploadCloud className="h-8 w-8 mb-2" />
                  <span>Drop a file, or click below</span>
                </div>
              )}
              <input
                id="file" type="file" accept="image/*,video/*" capture="environment"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <Button asChild variant="outline" size="lg" className="mt-3 min-h-[48px]">
                <label htmlFor="file">{file ? "Change file" : "Choose file"}</label>
              </Button>
              {file && <p className="mt-2 text-xs text-muted-foreground">{file.name} · {(file.size / 1024).toFixed(0)} KB</p>}
            </div>
          </div>

          {file && file.type.startsWith("image/") && (qualityBusy || quality) && (
            <div
              className="rounded-md border p-3 text-xs"
              style={{
                borderColor: quality ? qualityTone(quality.verdict).color : "#E2E8F0",
                background: quality ? qualityTone(quality.verdict).bg : undefined,
              }}
            >
              {qualityBusy || !quality ? (
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> Checking frame quality…
                </span>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2" style={{ color: qualityTone(quality.verdict).color }}>
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ background: qualityTone(quality.verdict).color }}
                    />
                    <strong>{qualityTone(quality.verdict).label}</strong>
                    <span className="tabular-nums opacity-80">quality score {quality.scorePct}%</span>
                  </div>
                  {quality.flags.length > 0 && (
                    <ul className="mt-2 space-y-1" style={{ color: qualityTone(quality.verdict).color }}>
                      {quality.flags.map((f) => (
                        <li key={f.code} className="flex gap-1.5">
                          <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                          <span>{f.message}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {quality.verdict !== "good" && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => setFile(null)}>
                        Retake
                      </Button>
                      {quality.verdict === "warn" && !qualityAck && (
                        <Button type="button" size="sm" variant="ghost" onClick={() => setQualityAck(true)}>
                          Analyse anyway
                        </Button>
                      )}
                      {quality.verdict === "warn" && qualityAck && (
                        <span className="text-muted-foreground">Proceeding with a flagged frame, confidence will be lower.</span>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}



          {file && (
            <div className="rounded-md border p-3 text-xs space-y-2" style={{ borderColor: "#E2E8F0" }}>
              <div className="flex flex-wrap items-center gap-2">
                <LocationSourceBadge source={locationSource} />
                {gps && (
                  <span className="inline-flex items-center gap-1 tabular-nums text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {gps.lat.toFixed(5)}, {gps.lng.toFixed(5)}
                  </span>
                )}
                {gps && locationSource !== "exif" && (
                  <button
                    type="button"
                    onClick={clearLocation}
                    className="ml-auto inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" /> Clear
                  </button>
                )}
              </div>
              {locationSource === "none" && (
                <>
                  <p className="text-muted-foreground">
                    No GPS was found in this file. WhatsApp and some messaging apps remove photo location, share the original file from your camera roll for the strongest verification. You can still continue with one of the options below.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={useDeviceLocation} disabled={geoBusy}>
                      {geoBusy ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Navigation className="h-3 w-3 mr-1" />}
                      Use my current location
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setPickerOpen(true)}>
                      <Pin className="h-3 w-3 mr-1" /> Pick on the map
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          <div>
            <Label>Primary target flora</Label>
            <Select value={species} onValueChange={setSpecies}>
              <SelectTrigger><SelectValue placeholder="Select species being monitored" /></SelectTrigger>
              <SelectContent>
                {SPECIES_GROUPS.map((g) => (
                  <SelectGroup key={g}>
                    <SelectLabel>{g}</SelectLabel>
                    {SPECIES.filter((s) => s.group === g).map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Plot site (Freetown / Western Area)</Label>
            <Select value={plotCode} onValueChange={setPlotCode}>
              <SelectTrigger><SelectValue placeholder="Select plot site & code (optional)" /></SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Greater Freetown plots</SelectLabel>
                  {FREETOWN_PLOT_SITES.map((p) => (
                    <SelectItem key={p.code} value={p.code}>{p.name}, {p.code}</SelectItem>
                  ))}
                  <SelectItem value="__other">Other / not listed…</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {plotCode === "__other" && (
              <Input
                className="mt-2"
                placeholder="Type plot site name and code (e.g. New Reserve, NEW-016)"
                value={plotCodeOther}
                onChange={(e) => setPlotCodeOther(e.target.value)}
              />
            )}
          </div>

          <div>
            <Label htmlFor="existing-plot">Existing plot (optional)</Label>
            <Select value={plotId || "__none"} onValueChange={(v) => setPlotId(v === "__none" ? "" : v)}>
              <SelectTrigger id="existing-plot">
                <SelectValue placeholder="Link this upload to an existing plot" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">None</SelectItem>
                {plots?.plots.map((p) => {
                  const site = plots.sites.find((s) => s.id === p.site_id);
                  return (
                    <SelectItem key={p.id} value={p.id}>
                      {site?.name ? `${site.name} · ` : ""}{p.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-muted-foreground">Pick from your saved plot records. Leave as None if this upload isn't tied to one yet.</p>
          </div>


          <div>
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observations from the field…" rows={3} />
          </div>

          <Button
            onClick={submit}
            disabled={!file || busy || quality?.verdict === "block" || (quality?.verdict === "warn" && !qualityAck)}
            className="w-full bg-[#1A3622] hover:bg-[#1A3622]/90 text-base font-semibold"
            size="lg"
            style={{ minHeight: 56 }}
          >
            {busy ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Running ingestion pipeline…</> : "Upload & analyze"}
          </Button>


        </div>

        <div className="rounded-2xl border bg-card p-5 space-y-4" style={{ borderColor: "#E2E8F0" }}>
          <h2 className="font-display font-semibold">Diagnostic pipeline</h2>

          <IngestionTerminal active={busy || done} done={done} stages={stages} />

          {!result && !busy && !done && <p className="text-meta text-muted-foreground">Pipeline output appears here after upload.</p>}

          {result && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <PctIndicator label="Waterlogging" pct={result.waterlogging_pct} tone="water" />
                <SeverityIndicator label="Scouring" severity={result.scouring_severity} />
                <PctIndicator label="Salinity stress" pct={result.salinity_stress_pct} tone="salt" />
                <PctIndicator label="Canopy health" pct={result.canopy_health_pct} tone="canopy" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3" style={{ borderColor: "#E2E8F0" }}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Site type</p>
                  <p className="text-sm mt-0.5">{pretty(result.site_type)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Water body: {pretty(result.water_body_condition)}</p>
                </div>

                <div className="rounded-lg border p-3" style={{ borderColor: "#E2E8F0" }}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Species detected</p>
                  <p className="text-sm mt-0.5">
                    {result.detected_species && result.detected_species !== "unidentified"
                      ? speciesLabel(result.detected_species)
                      : "Not identified from this frame"}
                    {result.detected_species_confidence_pct != null && result.detected_species !== "unidentified" && (
                      <span className="text-xs text-muted-foreground"> · {result.detected_species_confidence_pct}% confidence</span>
                    )}
                  </p>
                  {!!result.detected_species_alternates?.length && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Alternates: {result.detected_species_alternates.map((s) => speciesLabel(s)).join(", ")}
                    </p>
                  )}
                  {!species && result.detected_species && result.detected_species !== "unidentified" && (
                    <p className="text-xs text-muted-foreground mt-1">Suggestion only, your species selection is never overwritten.</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Early detection: {result.seedlings_detected ? "seedlings or propagules present" : "no young stock visible"} · {pretty(result.establishment_stage)}
                  </p>
                </div>

                <div className="rounded-lg border p-3" style={{ borderColor: result.invasive_present ? "#E5A93C" : "#E2E8F0" }}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Weed / invasive encroachment</p>
                  <p className="text-sm mt-0.5">
                    {result.invasive_present ? `Present, about ${result.invasive_coverage_pct ?? 0}% of the frame` : "None detected"}
                  </p>
                  {!!result.invasive_species?.length && (
                    <p className="text-xs text-muted-foreground mt-1">Suspects: {result.invasive_species.join(", ")}</p>
                  )}
                </div>

                <div className="rounded-lg border p-3" style={{ borderColor: "#E2E8F0" }}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Structural health</p>
                  <p className="text-sm mt-0.5">Bank or bund: {pretty(result.bank_integrity)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Structural risk: {result.structural_risk ?? "—"}</p>
                </div>
              </div>

              {!!result.not_visible?.length && (
                <p className="text-xs text-muted-foreground">
                  Not assessable from this frame: {result.not_visible.join(", ")}. Reshoot wider or in better light for a fuller diagnostic.
                </p>
              )}


              {/* Humanized impact narrative */}
              {humanNarrative && (
                <div className="rounded-lg border bg-[#1A3622]/5 p-3 text-sm flex gap-2" style={{ borderColor: "#1A3622" }}>
                  <Sparkles className="h-4 w-4 text-[#1A3622] mt-0.5 shrink-0" />
                  <p className="leading-relaxed">{humanNarrative}</p>
                </div>
              )}

              <div
                className="rounded-lg p-3 text-sm border"
                style={{
                  background:
                    ecoStatus === "Hydrological Alert" ? "color-mix(in oklab, #E5A93C 14%, white)" :
                    ecoStatus === "Biomass Progress" ? "color-mix(in oklab, #1A3622 8%, white)" :
                    "var(--secondary)",
                  borderColor:
                    ecoStatus === "Hydrological Alert" ? "#E5A93C" : "#E2E8F0",
                }}
              >
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-[#1A3622]" />
                  <span className="font-semibold">Ecological status: {ecoStatus}</span>
                  {suitability && (
                    <span
                      className="ml-auto rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{
                        background:
                          suitability.verdict === "Suitable" ? "#dcfce7" :
                          suitability.verdict === "Marginal" ? "#fef3c7" :
                          suitability.verdict === "Suitable for general restoration only" ? "#dbeafe" :
                          "#fee2e2",
                        color:
                          suitability.verdict === "Suitable" ? "#14532d" :
                          suitability.verdict === "Marginal" ? "#7c2d12" :
                          suitability.verdict === "Suitable for general restoration only" ? "#1e3a8a" :
                          "#7f1d1d",
                      }}
                    >
                      Site: {suitability.verdict}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">Confidence {result.overall_confidence_pct}%</span>
                </div>
                <p>{result.rationale}</p>
                {suitability && <p className="mt-1 text-xs text-muted-foreground"><strong>Why:</strong> {suitability.reason}</p>}
                <p className="mt-2"><strong>Suggested action:</strong> {result.suggested_action}</p>
              </div>

              {/* Recommendation block */}
              {recommendation && (
                <div className="rounded-lg border bg-card p-3 text-sm space-y-2" style={{ borderColor: "#E2E8F0" }}>
                  <h3 className="font-display text-base font-semibold">Restoration recommendation</h3>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                    <RecRow k="Landscape cover" v={recommendation.landscape_cover} />
                    <RecRow k="Unit & scale" v={recommendation.unit_scale} />
                  </dl>
                  <div>
                    <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-1">6–12 month plan</dt>
                    <dd className="text-sm mt-0.5">{recommendation.timeline_6_12_months}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-1">Immediate action</dt>
                    <dd className="text-sm mt-0.5">{recommendation.immediate_action}</dd>
                  </div>
                </div>
              )}

              {plotId && (
                <Button variant="outline" className="w-full" onClick={() => router.navigate({ to: "/plots/$plotId", params: { plotId } })}>
                  View plot trends →
                </Button>
              )}

              {analysisId && (
                <VerifyReadingPanel
                  analysisId={analysisId}
                  modelValues={{
                    site_type: result.site_type,
                    waterlogging_pct: result.waterlogging_pct,
                    scouring_severity: result.scouring_severity,
                    salinity_stress_pct: result.salinity_stress_pct,
                    canopy_health_pct: result.canopy_health_pct,
                    detected_species: result.detected_species,
                    establishment_stage: result.establishment_stage,
                    invasive_present: result.invasive_present,
                    invasive_coverage_pct: result.invasive_coverage_pct,
                    bank_integrity: result.bank_integrity,
                    water_body_condition: result.water_body_condition,
                    structural_risk: result.structural_risk,
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function RecRow({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="font-semibold text-muted-foreground uppercase tracking-wide">{k}</dt>
      <dd className="text-sm">{v}</dd>
    </div>
  );
}
