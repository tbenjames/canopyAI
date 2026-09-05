
-- analyses: block all client deletes (only service role can delete)
CREATE POLICY "analyses_delete_blocked" ON public.analyses
  AS RESTRICTIVE FOR DELETE TO anon, authenticated
  USING (false);

-- alerts: block all client deletes
CREATE POLICY "alerts_delete_blocked" ON public.alerts
  AS RESTRICTIVE FOR DELETE TO anon, authenticated
  USING (false);

-- donations: block all client updates and deletes
CREATE POLICY "donations_update_blocked" ON public.donations
  AS RESTRICTIVE FOR UPDATE TO anon, authenticated
  USING (false) WITH CHECK (false);

CREATE POLICY "donations_delete_blocked" ON public.donations
  AS RESTRICTIVE FOR DELETE TO anon, authenticated
  USING (false);
