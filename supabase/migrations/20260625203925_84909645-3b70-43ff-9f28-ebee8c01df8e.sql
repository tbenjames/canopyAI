
-- 1. Self-elevation RPC for the project owner email
CREATE OR REPLACE FUNCTION public.self_elevate_to_admin()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _email text;
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  SELECT email INTO _email FROM auth.users WHERE id = _uid;
  IF lower(coalesce(_email,'')) <> lower('supprttmrnhinitiative@gmail.com') THEN
    RAISE EXCEPTION 'Not authorized to self-elevate';
  END IF;
  INSERT INTO public.user_roles(user_id, role) VALUES (_uid, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  RETURN 'ok';
END;
$$;

GRANT EXECUTE ON FUNCTION public.self_elevate_to_admin() TO authenticated;

-- 2. Credits on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS evaluation_credits int NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS account_tier text NOT NULL DEFAULT 'trial';

-- 3. Credit ledger
CREATE TABLE IF NOT EXISTS public.credit_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount int NOT NULL,
  action_type text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.credit_ledger TO authenticated;
GRANT ALL ON public.credit_ledger TO service_role;
ALTER TABLE public.credit_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ledger_select_own" ON public.credit_ledger
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- 4. Deduct credits atomically
CREATE OR REPLACE FUNCTION public.deduct_credits(_amount int, _action text)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _bal int;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _amount <= 0 THEN RAISE EXCEPTION 'Amount must be positive'; END IF;
  UPDATE public.profiles
    SET evaluation_credits = evaluation_credits - _amount
    WHERE id = _uid AND evaluation_credits >= _amount
    RETURNING evaluation_credits INTO _bal;
  IF _bal IS NULL THEN
    RAISE EXCEPTION 'INSUFFICIENT_CREDITS';
  END IF;
  INSERT INTO public.credit_ledger(user_id, amount, action_type)
    VALUES (_uid, -_amount, _action);
  RETURN _bal;
END;
$$;
GRANT EXECUTE ON FUNCTION public.deduct_credits(int, text) TO authenticated;

-- 5. Add credits (service-role only)
CREATE OR REPLACE FUNCTION public.add_credits(_user uuid, _amount int, _action text, _meta jsonb DEFAULT '{}'::jsonb)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _bal int;
BEGIN
  UPDATE public.profiles
    SET evaluation_credits = evaluation_credits + _amount,
        account_tier = CASE WHEN _action = 'purchase' THEN 'pay-as-you-go' ELSE account_tier END
    WHERE id = _user
    RETURNING evaluation_credits INTO _bal;
  INSERT INTO public.credit_ledger(user_id, amount, action_type, metadata)
    VALUES (_user, _amount, _action, _meta);
  RETURN _bal;
END;
$$;
REVOKE ALL ON FUNCTION public.add_credits(uuid, int, text, jsonb) FROM PUBLIC, authenticated, anon;
GRANT EXECUTE ON FUNCTION public.add_credits(uuid, int, text, jsonb) TO service_role;

-- 6. Seed credits for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url, evaluation_credits, account_tier)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    5,
    'trial'
  );
  IF (SELECT count(*) FROM public.user_roles) = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'field_worker');
  END IF;
  INSERT INTO public.credit_ledger(user_id, amount, action_type)
    VALUES (NEW.id, 5, 'trial_bonus');
  RETURN NEW;
END;
$$;

-- 7. Donations table (public)
CREATE TABLE IF NOT EXISTS public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name text,
  donor_email text,
  amount_cents int NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  message text,
  stripe_session_id text UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.donations TO anon, authenticated;
GRANT ALL ON public.donations TO service_role;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "donations_insert_anyone" ON public.donations
  FOR INSERT TO anon, authenticated WITH CHECK (true);
-- No SELECT policy for anon/authenticated -> private by default; service_role bypasses.

-- 8. SECURITY FIX: restrict analyses INSERT to staff
DROP POLICY IF EXISTS "analyses_insert_own_upload" ON public.analyses;
DROP POLICY IF EXISTS "analyses_insert_staff" ON public.analyses;
CREATE POLICY "analyses_insert_staff" ON public.analyses
  FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));
