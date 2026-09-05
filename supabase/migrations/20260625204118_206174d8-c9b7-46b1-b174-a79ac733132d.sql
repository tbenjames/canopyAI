-- 1. Remove field-worker INSERT bypass on analyses
DROP POLICY IF EXISTS analyses_insert_own_upload ON public.analyses;
DROP POLICY IF EXISTS analyses_insert_staff ON public.analyses;

-- Only service_role may insert (server-side AI pipeline via supabaseAdmin).
-- No authenticated INSERT policy is created, so PostgREST will deny direct inserts.

-- 2. Scope staff UPDATE policy to authenticated role only
DROP POLICY IF EXISTS analyses_update_staff ON public.analyses;
CREATE POLICY analyses_update_staff
  ON public.analyses
  FOR UPDATE
  TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));
