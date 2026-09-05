
-- Remove hardcoded admin backdoor
DROP FUNCTION IF EXISTS public.self_elevate_to_admin();

-- Lock down SECURITY DEFINER functions: revoke from anon/public
REVOKE EXECUTE ON FUNCTION public.deduct_credits(integer, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon;

-- Explicit RESTRICTIVE deny on analyses INSERT for all client roles.
-- Only service_role (used by server functions) bypasses RLS.
DROP POLICY IF EXISTS analyses_no_client_insert ON public.analyses;
CREATE POLICY analyses_no_client_insert
  ON public.analyses AS RESTRICTIVE
  FOR INSERT TO anon, authenticated
  WITH CHECK (false);

-- Explicit RESTRICTIVE deny on credit_ledger INSERT/DELETE for client roles.
DROP POLICY IF EXISTS credit_ledger_no_client_insert ON public.credit_ledger;
CREATE POLICY credit_ledger_no_client_insert
  ON public.credit_ledger AS RESTRICTIVE
  FOR INSERT TO anon, authenticated
  WITH CHECK (false);

DROP POLICY IF EXISTS credit_ledger_no_client_delete ON public.credit_ledger;
CREATE POLICY credit_ledger_no_client_delete
  ON public.credit_ledger AS RESTRICTIVE
  FOR DELETE TO anon, authenticated
  USING (false);
