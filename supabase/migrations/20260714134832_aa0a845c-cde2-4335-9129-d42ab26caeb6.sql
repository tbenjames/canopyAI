CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _requested text;
  _role public.app_role;
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
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = auth.uid()
    AND role <> 'admin'
  ORDER BY
    CASE role
      WHEN 'scientist'::public.app_role THEN 1
      WHEN 'donor'::public.app_role THEN 2
      WHEN 'field_worker'::public.app_role THEN 3
      ELSE 4
    END
  LIMIT 1
$$;

REVOKE EXECUTE ON FUNCTION public.get_my_role() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_my_role() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;