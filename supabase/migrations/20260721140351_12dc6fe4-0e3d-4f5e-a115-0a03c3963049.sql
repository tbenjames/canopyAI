
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
  -- SECURITY: never trust client-supplied 'scientist' or 'admin'. Only
  -- 'donor' is self-selectable; everything else becomes field_worker.
  -- Admins must promote accounts to scientist/admin via a privileged path.
  IF _requested = 'donor' THEN
    _role := 'donor'::public.app_role;
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
