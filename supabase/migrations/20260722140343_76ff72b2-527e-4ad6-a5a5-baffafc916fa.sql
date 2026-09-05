
-- Lock down client-side donation inserts. All donation rows must originate
-- from a verified server context (Stripe webhook or admin insert via service_role).
DROP POLICY IF EXISTS "donations_insert_basic_fields_only" ON public.donations;

CREATE POLICY "donations_insert_service_only"
  ON public.donations
  AS RESTRICTIVE
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

-- Revoke client execute on privileged credit RPCs. These must only be
-- reachable from server contexts (webhooks, server functions using admin client).
REVOKE EXECUTE ON FUNCTION public.add_credits(uuid, integer, text, jsonb) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.add_credits(uuid, integer, text, jsonb) TO service_role;

-- deduct_credits stays callable by authenticated users (used by analyze server fn
-- which runs under the user's RLS via requireSupabaseAuth). It already validates
-- auth.uid() internally, so its existing grant is safe.
