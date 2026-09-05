
CREATE TABLE public.policy_acceptances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  policy_type TEXT NOT NULL CHECK (policy_type IN ('terms','privacy')),
  version TEXT NOT NULL,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  method TEXT NOT NULL DEFAULT 'signup_checkbox',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX policy_acceptances_user_idx ON public.policy_acceptances(user_id, policy_type, accepted_at DESC);

GRANT SELECT ON public.policy_acceptances TO authenticated;
GRANT ALL ON public.policy_acceptances TO service_role;

ALTER TABLE public.policy_acceptances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own acceptances"
  ON public.policy_acceptances FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Staff read all acceptances"
  ON public.policy_acceptances FOR SELECT
  TO authenticated
  USING (public.is_staff(auth.uid()));

-- Block client writes; only service_role (via handle_new_user SECURITY DEFINER) inserts.
CREATE POLICY "No client inserts"
  ON public.policy_acceptances AS RESTRICTIVE FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "No client updates"
  ON public.policy_acceptances AS RESTRICTIVE FOR UPDATE
  TO authenticated
  USING (false) WITH CHECK (false);

CREATE POLICY "No client deletes"
  ON public.policy_acceptances AS RESTRICTIVE FOR DELETE
  TO authenticated
  USING (false);

-- Extend handle_new_user to persist accepted policy versions from signup metadata.
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _requested text;
  _role public.app_role;
  _terms_version text;
  _privacy_version text;
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

  _requested := NEW.raw_user_meta_data->>'requested_role';
  IF _requested IN ('field_worker','scientist','donor') THEN
    _role := _requested::public.app_role;
  ELSE
    _role := 'field_worker'::public.app_role;
  END IF;

  IF (SELECT count(*) FROM public.user_roles) = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role);
  END IF;

  INSERT INTO public.credit_ledger(user_id, amount, action_type)
    VALUES (NEW.id, 5, 'trial_bonus');

  _terms_version := NEW.raw_user_meta_data->>'terms_version';
  _privacy_version := NEW.raw_user_meta_data->>'privacy_version';

  IF _terms_version IS NOT NULL AND length(_terms_version) > 0 THEN
    INSERT INTO public.policy_acceptances(user_id, policy_type, version, method)
      VALUES (NEW.id, 'terms', _terms_version, 'signup_checkbox');
  END IF;

  IF _privacy_version IS NOT NULL AND length(_privacy_version) > 0 THEN
    INSERT INTO public.policy_acceptances(user_id, policy_type, version, method)
      VALUES (NEW.id, 'privacy', _privacy_version, 'signup_checkbox');
  END IF;

  RETURN NEW;
END;
$function$;
