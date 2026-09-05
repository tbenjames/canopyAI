import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const VerdictSchema = z.object({
  status: z.enum(["confirmed", "corrected", "not_assessable"]),
  value: z.union([z.string().max(120), z.number(), z.boolean(), z.null()]).optional(),
});

const SaveInput = z.object({
  analysisId: z.string().uuid(),
  verdicts: z.record(z.string().max(64), VerdictSchema),
  note: z.string().trim().max(1000).optional(),
  reviewerConfidencePct: z.number().int().min(0).max(100).optional(),
});

const ListInput = z.object({ analysisId: z.string().uuid() });

/** Saves or replaces the caller's expert review of one analysis. */
export const saveAnalysisReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SaveInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: staff } = await supabase.rpc("is_staff", { _user_id: userId });
    if (!staff) throw new Error("Only field ecologists and admins can verify readings");

    const { error } = await supabase
      .from("analysis_reviews")
      .upsert(
        {
          analysis_id: data.analysisId,
          reviewer_id: userId,
          verdicts: data.verdicts,
          note: data.note ?? null,
          reviewer_confidence_pct: data.reviewerConfidencePct ?? null,
        },
        { onConflict: "analysis_id,reviewer_id" },
      );
    if (error) throw new Error(error.message);

    return { ok: true };
  });

/** Reviews recorded against one analysis, visible to staff and the reviewer. */
export const getAnalysisReviews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ListInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: rows, error } = await supabase
      .from("analysis_reviews")
      .select("id, analysis_id, reviewer_id, verdicts, note, reviewer_confidence_pct, created_at, updated_at")
      .eq("analysis_id", data.analysisId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { reviews: rows ?? [], myReviewerId: userId };
  });

/** Whether the caller may verify readings. */
export const getCanVerify = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("is_staff", { _user_id: context.userId });
    return { canVerify: Boolean(data) };
  });

/** Per-indicator expert agreement, for the validation dashboard. */
export const getAgreementRates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("analysis_agreement_rates")
      .select("indicator, reviewed_count, agreed_count, corrected_count, not_assessable_count, agreement_pct");
    if (error) throw new Error(error.message);

    const { count } = await context.supabase
      .from("analysis_reviews")
      .select("id", { count: "exact", head: true });

    return { rates: data ?? [], reviewedAnalyses: count ?? 0 };
  });
