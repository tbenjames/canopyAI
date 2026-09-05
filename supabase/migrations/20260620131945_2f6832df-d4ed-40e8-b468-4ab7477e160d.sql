
-- Profiles: restrict reads to self or staff
DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;
CREATE POLICY "profiles_select_self_or_staff" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_staff(auth.uid()));

-- Alerts: restrict to staff or owner of related upload
DROP POLICY IF EXISTS "alerts_select_auth" ON public.alerts;
CREATE POLICY "alerts_select_staff_or_own" ON public.alerts FOR SELECT TO authenticated
  USING (
    public.is_staff(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.analyses a
      JOIN public.uploads u ON u.id = a.upload_id
      WHERE a.id = alerts.analysis_id AND u.uploaded_by = auth.uid()
    )
  );

-- Storage: restrict SELECT on restoration-media to owner or staff
DROP POLICY IF EXISTS "media_select_auth" ON storage.objects;
CREATE POLICY "media_select_own_or_staff" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'restoration-media'
    AND (owner = auth.uid() OR public.is_staff(auth.uid()))
  );
