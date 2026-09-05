
-- Lock down SECURITY DEFINER funcs: revoke from public, grant only where needed
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;

-- Storage policies for restoration-media bucket
CREATE POLICY "media_select_auth" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'restoration-media');
CREATE POLICY "media_insert_own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'restoration-media' AND owner = auth.uid());
CREATE POLICY "media_update_own" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'restoration-media' AND owner = auth.uid());
CREATE POLICY "media_delete_own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'restoration-media' AND owner = auth.uid());
