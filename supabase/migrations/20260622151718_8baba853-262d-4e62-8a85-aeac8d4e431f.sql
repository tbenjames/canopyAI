
-- 1. Extend analyses with suitability fields
ALTER TABLE public.analyses
  ADD COLUMN IF NOT EXISTS suitability text,
  ADD COLUMN IF NOT EXISTS suitability_reason text;

-- 2. Feedback enum + table
DO $$ BEGIN
  CREATE TYPE public.feedback_category AS ENUM (
    'app_bug',
    'vision_wrong',
    'feature_request',
    'tool_calibration'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category public.feedback_category NOT NULL,
  note text,
  message_text text NOT NULL,
  audio_path text,
  language text DEFAULT 'en',
  status text NOT NULL DEFAULT 'open',
  admin_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.feedback TO authenticated;
GRANT ALL ON public.feedback TO service_role;

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feedback_insert_own"
  ON public.feedback FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "feedback_select_staff"
  ON public.feedback FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "feedback_update_staff"
  ON public.feedback FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE INDEX IF NOT EXISTS feedback_created_at_idx ON public.feedback (created_at DESC);
