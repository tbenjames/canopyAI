
-- 1) profiles_credit_selfwrite: restrict column-level UPDATE and add trigger guard
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, avatar_url) ON public.profiles TO authenticated;

CREATE OR REPLACE FUNCTION public.profiles_guard_sensitive_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;
  IF NEW.evaluation_credits IS DISTINCT FROM OLD.evaluation_credits
     OR NEW.account_tier IS DISTINCT FROM OLD.account_tier
     OR NEW.id IS DISTINCT FROM OLD.id
     OR NEW.email IS DISTINCT FROM OLD.email THEN
    RAISE EXCEPTION 'Not allowed to modify protected profile fields';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_guard_sensitive_columns_trg ON public.profiles;
CREATE TRIGGER profiles_guard_sensitive_columns_trg
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.profiles_guard_sensitive_columns();

-- 2) donations_amount_unvalidated: enforce positive, bounded amounts
ALTER TABLE public.donations
  DROP CONSTRAINT IF EXISTS donations_amount_positive,
  DROP CONSTRAINT IF EXISTS donations_amount_max;

ALTER TABLE public.donations
  ADD CONSTRAINT donations_amount_positive CHECK (amount_cents > 0),
  ADD CONSTRAINT donations_amount_max CHECK (amount_cents <= 100000000);
