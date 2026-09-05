CREATE TABLE public.analysis_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verdicts jsonb NOT NULL DEFAULT '{}'::jsonb,
  note text,
  reviewer_confidence_pct integer CHECK (reviewer_confidence_pct BETWEEN 0 AND 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (analysis_id, reviewer_id)
);

GRANT SELECT, INSERT, UPDATE ON public.analysis_reviews TO authenticated;
GRANT ALL ON public.analysis_reviews TO service_role;

ALTER TABLE public.analysis_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read all reviews"
  ON public.analysis_reviews FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()) OR reviewer_id = auth.uid());

CREATE POLICY "Staff can create their own reviews"
  ON public.analysis_reviews FOR INSERT TO authenticated
  WITH CHECK (reviewer_id = auth.uid() AND public.is_staff(auth.uid()));

CREATE POLICY "Staff can update their own reviews"
  ON public.analysis_reviews FOR UPDATE TO authenticated
  USING (reviewer_id = auth.uid() AND public.is_staff(auth.uid()))
  WITH CHECK (reviewer_id = auth.uid() AND public.is_staff(auth.uid()));

CREATE TRIGGER trg_analysis_reviews_updated
  BEFORE UPDATE ON public.analysis_reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_analysis_reviews_analysis ON public.analysis_reviews (analysis_id);

CREATE OR REPLACE VIEW public.analysis_agreement_rates
WITH (security_invoker = true) AS
SELECT
  v.key AS indicator,
  count(*)::int AS reviewed_count,
  count(*) FILTER (WHERE v.value->>'status' = 'confirmed')::int AS agreed_count,
  count(*) FILTER (WHERE v.value->>'status' = 'corrected')::int AS corrected_count,
  count(*) FILTER (WHERE v.value->>'status' = 'not_assessable')::int AS not_assessable_count,
  round(
    100.0 * count(*) FILTER (WHERE v.value->>'status' = 'confirmed')
    / NULLIF(count(*) FILTER (WHERE v.value->>'status' <> 'not_assessable'), 0)
  )::int AS agreement_pct
FROM public.analysis_reviews r
CROSS JOIN LATERAL jsonb_each(r.verdicts) AS v(key, value)
GROUP BY v.key;

GRANT SELECT ON public.analysis_agreement_rates TO authenticated;
GRANT SELECT ON public.analysis_agreement_rates TO service_role;

ALTER TABLE public.uploads
  ADD COLUMN quality_score_pct integer CHECK (quality_score_pct BETWEEN 0 AND 100),
  ADD COLUMN quality_flags jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_analyses_plot_created ON public.analyses (plot_id, created_at);