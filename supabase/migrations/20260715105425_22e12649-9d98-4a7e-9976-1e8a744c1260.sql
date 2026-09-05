
DROP TRIGGER IF EXISTS profiles_guard_sensitive_columns_trg ON public.profiles;
CREATE TRIGGER profiles_guard_sensitive_columns_trg
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.profiles_guard_sensitive_columns();

ALTER TABLE public.donations
  DROP CONSTRAINT IF EXISTS donations_amount_cents_valid;
ALTER TABLE public.donations
  ADD CONSTRAINT donations_amount_cents_valid
  CHECK (amount_cents > 0 AND amount_cents <= 100000000);
