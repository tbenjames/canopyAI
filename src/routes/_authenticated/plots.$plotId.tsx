import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { computeDeltas, hasSustainedCanopyDecline, summariseTrend, type TrendPoint } from "@/lib/trends";
import { VerifyReadingPanel } from "@/components/VerifyReadingPanel";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { db, type Plot, type Analysis, type Upload, getSignedUrl } from "@/lib/db";
import { PctIndicator, SeverityIndicator } from "@/components/IndicatorCard";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { ArrowLeft, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { analyzeUpload } from "@/lib/analysis.functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/plots/$plotId")({
  head: ({ params }) => ({
    meta: [
      { title: `Plot ${params.plotId.slice(0, 8)}, CanopyStride AI` },
      { name: "description", content: "Plot telemetry, waterlogging, salinity stress, scouring, and canopy health from field photo analysis." },
      { property: "og:title", content: `Plot ${params.plotId.slice(0, 8)}, CanopyStride AI` },
      { property: "og:url", content: `https://canopystride.dev/plots/${params.plotId}` },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: `https://canopystride.dev/plots/${params.plotId}` }],
  }),
  component: PlotDetail,
});

function PlotDetail() {
  const { plotId } = useParams({ from: "/_authenticated/plots/$plotId" });
  const qc = useQueryClient();
  const analyze = useServerFn(analyzeUpload);
  const [reanalyzing, setReanalyzing] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["plot", plotId],
    queryFn: async () => {
      const [{ data: plot }, { data: uploads }, { data: analyses }] = await Promise.all([
        db.from("plots").select("*").eq("id", plotId).single(),
        db.from("uploads").select("*").eq("plot_id", plotId).order("created_at", { ascending: false }),
        db.from("analyses").select("*").eq("plot_id", plotId).order("created_at", { ascending: true }),
      ]);
      return { plot: plot as Plot, uploads: (uploads ?? []) as Upload[], analyses: (analyses ?? []) as Analysis[] };
    },
  });

  if (isLoading || !data?.plot) return <AppShell><div className="p-12 text-center text-muted-foreground">Loading…</div></AppShell>;

  const complete = data.analyses.filter((a) => a.status === "complete");
  const latest = complete[complete.length - 1];
  const trend = complete.map((a) => ({
    date: new Date(a.created_at).toLocaleDateString("en-GB"),
    Waterlogging: a.waterlogging_pct ?? 0,
    "Salinity stress": a.salinity_stress_pct ?? 0,
    "Canopy health": a.canopy_health_pct ?? 0,
  }));
  const points: TrendPoint[] = complete.map((a) => ({
    id: a.id,
    created_at: a.created_at,
    canopy_health_pct: a.canopy_health_pct,
    waterlogging_pct: a.waterlogging_pct,
    salinity_stress_pct: a.salinity_stress_pct,
    invasive_coverage_pct: a.invasive_coverage_pct ?? null,
  }));
  const summary = summariseTrend(points);
  const deltas = points.length > 1 ? computeDeltas(points[0], points[points.length - 1]) : [];
  const sustainedDecline = hasSustainedCanopyDecline(points);

  async function reanalyze(uploadId: string) {
    setReanalyzing(uploadId);
    try {
      await analyze({ data: { uploadId } });
      toast.success("Analysis refreshed");
      qc.invalidateQueries({ queryKey: ["plot", plotId] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally { setReanalyzing(null); }
  }

  return (
    <AppShell>
      <Link to="/sites/$siteId" params={{ siteId: data.plot.site_id }} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to site
      </Link>
      <h1 className="mt-3 font-display text-3xl font-bold">{data.plot.name}</h1>
      <p className="text-sm text-muted-foreground">{data.plot.center_lat.toFixed(4)}, {data.plot.center_lng.toFixed(4)} · radius {data.plot.radius_m} m</p>

      {latest ? (
        <>
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            <PctIndicator label="Waterlogging" pct={latest.waterlogging_pct} tone="water" />
            <SeverityIndicator label="Scouring" severity={latest.scouring_severity} />
            <PctIndicator label="Salinity stress" pct={latest.salinity_stress_pct} tone="salt" />
            <PctIndicator label="Canopy health" pct={latest.canopy_health_pct} tone="canopy" />
          </div>

          <div className="mt-6 rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Latest analysis</h2>
              <span className="text-xs text-muted-foreground">Confidence {latest.overall_confidence_pct ?? ", "}% · {latest.model}</span>
            </div>
            <p className="mt-2 text-sm">{latest.rationale}</p>
            {latest.suggested_action && (
              <p className="mt-3 rounded-md bg-secondary p-3 text-sm"><strong>Suggested action:</strong> {latest.suggested_action}</p>
            )}
          </div>

          {trend.length > 1 && (
            <div className="mt-6 rounded-xl border bg-card p-5">
              <h2 className="font-display text-lg font-semibold mb-2">Trend over time</h2>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="Waterlogging" stroke="#3b82c4" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Salinity stress" stroke="#c08838" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Canopy health" stroke="#2f6d4f" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {points.length > 1 && (
            <div className="mt-6 rounded-xl border bg-card p-5">
              <h2 className="font-display text-lg font-semibold">Change since the first reading</h2>
              <p className="mt-2 text-sm text-muted-foreground">{summary.headline}</p>
              {summary.driver && <p className="mt-1 text-sm">{summary.driver}.</p>}
              {sustainedDecline && (
                <p className="mt-3 rounded-md bg-secondary p-3 text-sm">
                  Canopy health has fallen on each of the last three readings. Inspect before it crosses the alert threshold.
                </p>
              )}
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {deltas.map((d) => (
                  <div key={d.key} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                    <span>{d.label}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {d.from ?? "—"}% → {d.to ?? "—"}%
                      {d.delta !== null && ` (${d.delta > 0 ? "+" : ""}${d.delta})`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <VerifyReadingPanel
              analysisId={latest.id}
              modelValues={{
                site_type: latest.site_type,
                waterlogging_pct: latest.waterlogging_pct,
                scouring_severity: latest.scouring_severity,
                salinity_stress_pct: latest.salinity_stress_pct,
                canopy_health_pct: latest.canopy_health_pct,
                detected_species: latest.detected_species,
                establishment_stage: latest.establishment_stage,
                invasive_present: latest.invasive_present,
                invasive_coverage_pct: latest.invasive_coverage_pct,
                bank_integrity: latest.bank_integrity,
                water_body_condition: latest.water_body_condition,
                structural_risk: latest.structural_risk,
              }}
            />
          </div>
        </>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">No analyses yet for this plot.</p>
          <Link to="/upload" className="mt-3 inline-block text-sm font-medium text-primary underline">Upload a photo →</Link>
        </div>
      )}

      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold mb-3">Upload history</h2>
        {data.uploads.length === 0 ? (
          <p className="text-sm text-muted-foreground">No uploads yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.uploads.map((u) => (
              <UploadCard key={u.id} upload={u} analyses={data.analyses.filter((a) => a.upload_id === u.id)} onReanalyze={() => reanalyze(u.id)} reanalyzing={reanalyzing === u.id} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function UploadCard({ upload, analyses, onReanalyze, reanalyzing }: { upload: Upload; analyses: Analysis[]; onReanalyze: () => void; reanalyzing: boolean }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => { getSignedUrl(upload.storage_path).then(setUrl); }, [upload.storage_path]);
  const latest = analyses[analyses.length - 1];
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {url && upload.kind === "photo" ? (
        <img src={url} alt="" className="h-40 w-full object-cover" />
      ) : url && upload.kind === "video" ? (
        <video src={url} controls className="h-40 w-full object-cover bg-black" />
      ) : (
        <div className="h-40 bg-muted animate-pulse" />
      )}
      <div className="p-3 space-y-1">
        <p className="text-xs text-muted-foreground">{new Date(upload.created_at).toLocaleString()}</p>
        {upload.notes && <p className="text-sm line-clamp-2">{upload.notes}</p>}
        {latest && latest.status === "complete" && (
          <p className="text-xs">Risk: <strong style={{ color: latest.risk_level === "high" ? "#c0443b" : latest.risk_level === "medium" ? "#c08838" : "#2f6d4f" }}>{latest.risk_level}</strong></p>
        )}
        <Button variant="outline" size="sm" onClick={onReanalyze} disabled={reanalyzing} className="mt-2 w-full">
          {reanalyzing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />} Re-analyze
        </Button>
      </div>
    </div>
  );
}
