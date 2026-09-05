import { createServerFn } from "@tanstack/react-start";

/**
 * Public, aggregate-only accuracy figures for the marketing page.
 * Returns per-indicator expert agreement and the sample size behind it, so the
 * homepage can label figures as provisional until enough reviews exist.
 * No row-level or personal data is exposed.
 */
export const getPublicAccuracy = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("analysis_agreement_rates")
      .select("indicator, reviewed_count, agreement_pct");
    if (error) return { measured: [], sampleSize: 0 };

    const rows = (data ?? []) as { indicator: string; reviewed_count: number; agreement_pct: number | null }[];
    const sampleSize = rows.reduce((max, r) => Math.max(max, r.reviewed_count ?? 0), 0);
    return { measured: rows, sampleSize };
  } catch {
    return { measured: [], sampleSize: 0 };
  }
});
