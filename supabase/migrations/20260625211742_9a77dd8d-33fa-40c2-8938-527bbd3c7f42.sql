
-- Donations table security hardening
-- 1. Prevent clients from setting status/stripe_session_id on insert
-- 2. Restrict SELECT to staff only

DROP POLICY IF EXISTS "donations_insert_anyone" ON public.donations;

CREATE POLICY "donations_insert_basic_fields_only"
  ON public.donations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status IS NULL AND
    stripe_session_id IS NULL
  );

CREATE POLICY "donations_select_staff_only"
  ON public.donations
  FOR SELECT
  TO authenticated
  USING (public.is_staff(auth.uid()));
