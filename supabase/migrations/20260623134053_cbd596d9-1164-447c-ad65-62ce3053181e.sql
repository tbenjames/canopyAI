DROP POLICY IF EXISTS analyses_update_staff ON public.analyses;
CREATE POLICY analyses_update_staff ON public.analyses
  FOR UPDATE
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));