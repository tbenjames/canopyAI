import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const Input = z.object({
  uploadId: z.string().uuid(),
});

const ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    site_type: {
      type: "string",
      enum: [
        "natural_pond",
        "artificial_pond",
        "swamp_marsh",
        "intertidal_mudflat",
        "mangrove_fringe",
        "terrestrial_agroforest",
        "other",
      ],
      description: "Scene classification for the photo",
    },
    waterlogging_pct: { type: "integer", description: "0-100, % of frame showing standing water or saturated soil" },
    scouring_severity: { type: "string", enum: ["low", "medium", "high"] },
    salinity_stress_pct: { type: "integer", description: "0-100, severity of visible salt crust + leaf chlorosis/necrosis indicating saline stress" },
    canopy_health_pct: { type: "integer", description: "0-100, mangrove/Moringa canopy vigor, higher is healthier" },
    detected_species: {
      type: "string",
      description: "Best-match species value from the supplied vocabulary, or 'unidentified'",
    },
    detected_species_confidence_pct: { type: "integer", description: "0-100 confidence in the species match" },
    detected_species_alternates: {
      type: "array",
      description: "Up to two alternate species values from the vocabulary",
      items: { type: "string" },
    },
    seedlings_detected: { type: "boolean", description: "True when seedlings, propagules or young transplants are visible" },
    establishment_stage: {
      type: "string",
      enum: ["none_visible", "propagule", "seedling", "sapling", "established", "mature"],
    },
    invasive_present: { type: "boolean", description: "True when weeds or invasive plants encroach on the plot" },
    invasive_coverage_pct: { type: "integer", description: "0-100, share of the frame covered by weeds or invasives" },
    invasive_species: {
      type: "array",
      description: "Named suspected weeds or invasives, e.g. Nypa fruticans, water hyacinth, Typha",
      items: { type: "string" },
    },
    bank_integrity: {
      type: "string",
      enum: ["intact", "minor_erosion", "undercut", "breached", "not_visible"],
      description: "Condition of banks, bunds or pond walls",
    },
    water_body_condition: {
      type: "string",
      enum: ["not_applicable", "open_clear_water", "turbid", "algal_bloom", "stagnant", "sedimented", "dry"],
    },
    structural_risk: { type: "string", enum: ["low", "medium", "high"] },
    not_visible: {
      type: "array",
      description: "Indicator names that could not be assessed from this image",
      items: { type: "string" },
    },
    overall_confidence_pct: { type: "integer", description: "0-100, model confidence in the visual indicators" },
    risk_level: { type: "string", enum: ["low", "medium", "high"] },
    rationale: { type: "string", description: "2-4 sentences explaining the visual evidence" },
    suggested_action: { type: "string", description: "1 sentence with a recommended field action" },
  },
  required: [
    "site_type",
    "waterlogging_pct",
    "scouring_severity",
    "salinity_stress_pct",
    "canopy_health_pct",
    "detected_species",
    "detected_species_confidence_pct",
    "detected_species_alternates",
    "seedlings_detected",
    "establishment_stage",
    "invasive_present",
    "invasive_coverage_pct",
    "invasive_species",
    "bank_integrity",
    "water_body_condition",
    "structural_risk",
    "not_visible",
    "overall_confidence_pct",
    "risk_level",
    "rationale",
    "suggested_action",
  ],
  additionalProperties: false,
} as const;

// Species vocabulary mirrors src/lib/taxonomy.ts so detection stays inside the supported list.
const SPECIES_VOCABULARY = [
  "rhizophora_racemosa",
  "rhizophora_harrisonii",
  "laguncularia_racemosa",
  "avicennia_germinans",
  "conocarpus_erectus",
  "rhizophora_mangle",
  "rhizophora_mucronata",
  "avicennia_marina",
  "avicennia_africana",
  "bruguiera_gymnorrhiza",
  "sonneratia_alba",
  "ceriops_tagal",
  "xylocarpus_granatum",
  "heritiera_littoralis",
  "nypa_fruticans",
  "moringa_oleifera",
  "moringa_stenopetala",
  "moringa_peregrina",
  "other_restoration",
  "unidentified",
].join(", ");

const SYSTEM_PROMPT = `You are an expert in mangrove, Moringa and wetland restoration ecology in West African coastal environments. You analyse field photos and video frames from restoration plots, natural and artificial ponds, swamps and agroforest belts.

Work in this order.

STEP 1 — Classify the scene. Decide the site_type first: natural_pond, artificial_pond (dug or lined, straight edges, bunds), swamp_marsh, intertidal_mudflat, mangrove_fringe, terrestrial_agroforest, or other.

STEP 2 — Score only what that scene supports. Assess:
1. Surface waterlogging / ponding: % of frame with standing water, saturated mud, sheen, dark wet soil.
2. Tidal scouring / erosion: channel cutting, undercut roots, sediment displacement, exposed bank profiles.
3. Salinity stress proxy: salt crust or white efflorescence, leaf chlorosis or necrosis typical of saline stress.
4. Canopy / seedling health: canopy density, greenness, seedling survival cues.

STEP 3 — Species and early detection. Identify the dominant restoration species using only this vocabulary: ${SPECIES_VOCABULARY}. Use "unidentified" when you cannot tell. Give up to two alternates. Report whether seedlings or propagules are present and the establishment stage.

STEP 4 — Weed and invasive encroachment. Report presence, approximate coverage of the frame, and name suspected weeds or invasives. Nypa fruticans is invasive in West Africa and must always be named when present. Also watch for water hyacinth (Eichhornia crassipes), Typha, Salvinia, and dense grass or fern mats smothering seedlings.

STEP 5 — Structural health. Assess bank, bund or pond wall integrity and the water body condition (clear, turbid, algal bloom, stagnant, sedimented, dry) and give an overall structural_risk.

Rules: never invent measurements you cannot see. When an indicator is not visible in the frame, list its name in not_visible and give a conservative value rather than a confident guess. Lower overall_confidence_pct when the image is blurry, dark, framed too close, or does not show ground, water or canopy. risk_level is your overall judgement across all indicators.

Always return JSON matching the provided schema.`;

export const analyzeUpload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Load upload. RLS already limits this to the caller's own uploads (or staff),
    // and we re-check ownership below before writing with elevated privileges.
    const { data: upload, error: uErr } = await supabase
      .from("uploads")
      .select("id, storage_path, kind, plot_id, captured_lat, captured_lng, uploaded_by, quality_score_pct, quality_flags")
      .eq("id", data.uploadId)
      .single();
    if (uErr || !upload) throw new Error("Upload not found");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Open access: every account carries a monthly allowance that refills itself.
    await supabaseAdmin.rpc("ensure_monthly_credits", { _user: userId });

    const cost = upload.kind === "video" ? 3 : 1;

    // The analyses table blocks all client-side inserts by policy, so the row is
    // created with the trusted server connection after verifying ownership.
    if (upload.uploaded_by !== userId) {
      const { data: staff } = await supabase.rpc("is_staff", { _user_id: userId });
      if (!staff) throw new Error("You do not have access to this upload");
    }

    const { data: analysis, error: aErr } = await supabaseAdmin
      .from("analyses")
      .insert({ upload_id: upload.id, plot_id: upload.plot_id, status: "processing" })
      .select()
      .single();
    if (aErr || !analysis) throw new Error(`Failed to create analysis row: ${aErr?.message ?? "unknown error"}`);

    try {
      // Signed URL for image (5 min)
      const { data: signed } = await supabase.storage
        .from("restoration-media")
        .createSignedUrl(upload.storage_path, 300);
      if (!signed?.signedUrl) throw new Error("Could not sign media URL");

      // Fetch and convert to base64 data URL (gateway-friendly)
      const mediaRes = await fetch(signed.signedUrl);
      if (!mediaRes.ok) throw new Error(`Media fetch failed: ${mediaRes.status}`);
      const arrayBuf = await mediaRes.arrayBuffer();
      const contentType = mediaRes.headers.get("content-type") ?? "image/jpeg";
      const base64 = Buffer.from(arrayBuf).toString("base64");
      const dataUrl = `data:${contentType};base64,${base64}`;

      const apiKey = process.env.LOVABLE_API_KEY;
      if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

      // Pre-flight quality flags recorded at capture time, so the model lowers
      // confidence consistently instead of guessing on a degraded frame.
      const flags = Array.isArray(upload.quality_flags) ? (upload.quality_flags as string[]) : [];
      const qualityNote = flags.length
        ? ` Capture quality check flagged: ${flags.join(", ")} (frame quality score ${upload.quality_score_pct ?? "unknown"}%). Reduce overall_confidence_pct accordingly and list any indicator these conditions prevent you assessing in not_visible.`
        : "";

      const body = {
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: `Analyse this restoration site image. Return only JSON matching the schema.${qualityNote}` },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { name: "restoration_indicators", strict: true, schema: ANALYSIS_SCHEMA },
        },
      };

      const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": apiKey,
        },
        body: JSON.stringify(body),
      });

      if (!aiRes.ok) {
        const txt = await aiRes.text();
        if (aiRes.status === 429) throw new Error("AI rate limit hit. Try again shortly.");
        if (aiRes.status === 402) throw new Error("AI credits exhausted. Add credits in Workspace billing.");
        throw new Error(`AI gateway error ${aiRes.status}: ${txt.slice(0, 200)}`);
      }

      const aiJson = await aiRes.json();
      const text: string = aiJson?.choices?.[0]?.message?.content ?? "{}";
      const parsed = JSON.parse(text);

      // Persist analysis using service-role client so scientific fields
      // cannot be overwritten directly via the user-scoped Data API.
      const update = {
        status: "complete" as const,
        site_type: parsed.site_type ?? null,
        waterlogging_pct: parsed.waterlogging_pct,
        scouring_severity: parsed.scouring_severity,
        salinity_stress_pct: parsed.salinity_stress_pct,
        canopy_health_pct: parsed.canopy_health_pct,
        detected_species: parsed.detected_species ?? null,
        detected_species_confidence_pct: parsed.detected_species_confidence_pct ?? null,
        detected_species_alternates: parsed.detected_species_alternates ?? [],
        seedlings_detected: parsed.seedlings_detected ?? null,
        establishment_stage: parsed.establishment_stage ?? null,
        invasive_present: parsed.invasive_present ?? null,
        invasive_coverage_pct: parsed.invasive_coverage_pct ?? null,
        invasive_species: parsed.invasive_species ?? [],
        bank_integrity: parsed.bank_integrity ?? null,
        water_body_condition: parsed.water_body_condition ?? null,
        structural_risk: parsed.structural_risk ?? null,
        not_visible: parsed.not_visible ?? [],
        overall_confidence_pct: parsed.overall_confidence_pct,
        risk_level: parsed.risk_level,
        rationale: parsed.rationale,
        suggested_action: parsed.suggested_action,
        model: "google/gemini-3-flash-preview",
        raw_response: parsed,
      };
      await supabaseAdmin.from("analyses").update(update).eq("id", analysis.id);

      // Alerts
      if (upload.plot_id) {
        type AlertKind = "waterlogging" | "scouring" | "salinity" | "canopy_decline" | "invasive_encroachment" | "structural_risk";
        type AlertSev = "low" | "medium" | "high";
        const alerts: Array<{ plot_id: string; analysis_id: string; kind: AlertKind; severity: AlertSev; message: string }> = [];
        if (parsed.waterlogging_pct >= 60) alerts.push({
          plot_id: upload.plot_id, analysis_id: analysis.id, kind: "waterlogging",
          severity: parsed.waterlogging_pct >= 80 ? "high" : "medium",
          message: `Severe surface waterlogging detected (${parsed.waterlogging_pct}%).`,
        });
        if (parsed.scouring_severity === "high") alerts.push({
          plot_id: upload.plot_id, analysis_id: analysis.id, kind: "scouring", severity: "high",
          message: "High tidal scouring / erosion visible. Inspect bank stability.",
        });
        if (parsed.salinity_stress_pct >= 60) alerts.push({
          plot_id: upload.plot_id, analysis_id: analysis.id, kind: "salinity",
          severity: parsed.salinity_stress_pct >= 80 ? "high" : "medium",
          message: `Salinity stress proxy elevated (${parsed.salinity_stress_pct}%).`,
        });
        if (parsed.canopy_health_pct <= 40) alerts.push({
          plot_id: upload.plot_id, analysis_id: analysis.id, kind: "canopy_decline",
          severity: parsed.canopy_health_pct <= 25 ? "high" : "medium",
          message: `Canopy health low (${parsed.canopy_health_pct}%). Possible die-back.`,
        });
        const invasiveNames: string[] = Array.isArray(parsed.invasive_species) ? parsed.invasive_species : [];
        const flaggedInvasive = invasiveNames.some((n) =>
          /nypa|hyacinth|eichhornia|typha|salvinia/i.test(String(n)),
        );
        if (parsed.invasive_present && ((parsed.invasive_coverage_pct ?? 0) >= 25 || flaggedInvasive)) {
          alerts.push({
            plot_id: upload.plot_id, analysis_id: analysis.id, kind: "invasive_encroachment",
            severity: (parsed.invasive_coverage_pct ?? 0) >= 50 || flaggedInvasive ? "high" : "medium",
            message: `Weed or invasive encroachment at ${parsed.invasive_coverage_pct ?? 0}%${invasiveNames.length ? `: ${invasiveNames.join(", ")}` : ""}.`,
          });
        }
        if (parsed.structural_risk === "high" || parsed.bank_integrity === "breached" || parsed.bank_integrity === "undercut") {
          alerts.push({
            plot_id: upload.plot_id, analysis_id: analysis.id, kind: "structural_risk",
            severity: parsed.bank_integrity === "breached" ? "high" : "medium",
            message: `Structural risk to bank or bund (${parsed.bank_integrity ?? "unknown"}). Inspect before the next tide or rain event.`,
          });
        }

        // Trend rule: three consecutive falling canopy readings raise an alert
        // even when no single reading crosses the absolute threshold.
        const { data: history } = await supabase
          .from("analyses")
          .select("canopy_health_pct, created_at")
          .eq("plot_id", upload.plot_id)
          .eq("status", "complete")
          .order("created_at", { ascending: true });
        const series = [
          ...((history ?? [])
            .map((h) => h.canopy_health_pct)
            .filter((v): v is number => typeof v === "number")),
          parsed.canopy_health_pct as number,
        ];
        if (series.length >= 3) {
          const [x, y, z] = series.slice(-3);
          if (y < x && z < y && x - z >= 5 && parsed.canopy_health_pct > 40) {
            alerts.push({
              plot_id: upload.plot_id, analysis_id: analysis.id, kind: "canopy_decline",
              severity: x - z >= 15 ? "high" : "medium",
              message: `Sustained canopy decline across the last three readings (${x}% to ${z}%). Investigate before it crosses the alert threshold.`,
            });
          }
        }

        if (alerts.length) await supabase.from("alerts").insert(alerts);
      }

      // Charge only once the diagnostic is complete and usable.
      const { error: cErr } = await supabase.rpc("deduct_credits", {
        _amount: cost,
        _action: `analyze_${upload.kind}`,
      });
      if (cErr && (cErr.message || "").includes("INSUFFICIENT_CREDITS")) {
        // Balance changed mid-run; the analysis still succeeded, so let it through.
      }

      return { ok: true, analysisId: analysis.id, ...update };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await supabaseAdmin.from("analyses").update({ status: "failed", error: msg }).eq("id", analysis.id);
      // No credits were deducted for a failed run, so there is nothing to refund.
      throw new Error(msg);
    }
  });
