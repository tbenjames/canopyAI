ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS credits_period_start date NOT NULL DEFAULT date_trunc('month', now())::date;

-- Allow trusted SECURITY DEFINER routines (owned by the database owner) to adjust
-- protected columns, while still blocking direct Data API edits by end users.
CREATE OR REPLACE FUNCTION public.profiles_guard_sensitive_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF current_setting('role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;
  IF current_user <> current_setting('role', true) THEN
    -- running inside a SECURITY DEFINER routine owned by the database owner
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
$function$;

-- New accounts start with the open-access monthly allowance.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url, evaluation_credits, account_tier, credits_period_start)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    200,
    'open-access',
    date_trunc('month', now())::date
  );
  IF (SELECT count(*) FROM public.user_roles) = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'field_worker');
  END IF;
  INSERT INTO public.credit_ledger(user_id, amount, action_type)
    VALUES (NEW.id, 200, 'monthly_allowance');
  RETURN NEW;
END;
$function$;

-- Monthly refill: resets the balance to 200 when a new calendar month starts.
CREATE OR REPLACE FUNCTION public.ensure_monthly_credits(_user uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _period date := date_trunc('month', now())::date;
  _bal int;
  _topup int;
BEGIN
  SELECT evaluation_credits INTO _bal FROM public.profiles WHERE id = _user;
  IF _bal IS NULL THEN RETURN NULL; END IF;

  UPDATE public.profiles
    SET evaluation_credits = 200,
        credits_period_start = _period,
        account_tier = 'open-access'
    WHERE id = _user AND credits_period_start < _period
    RETURNING 200 - _bal INTO _topup;

  IF _topup IS NOT NULL THEN
    INSERT INTO public.credit_ledger(user_id, amount, action_type)
      VALUES (_user, GREATEST(_topup, 0), 'monthly_allowance');
    RETURN 200;
  END IF;

  RETURN _bal;
END;
$function$;

REVOKE ALL ON FUNCTION public.ensure_monthly_credits(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ensure_monthly_credits(uuid) TO authenticated, service_role;

-- Bring every existing account onto the open-access allowance now.
UPDATE public.profiles
  SET evaluation_credits = GREATEST(evaluation_credits, 200),
      credits_period_start = date_trunc('month', now())::date,
      account_tier = 'open-access';