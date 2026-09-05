ALTER TYPE public.alert_kind ADD VALUE IF NOT EXISTS 'invasive_encroachment';
ALTER TYPE public.alert_kind ADD VALUE IF NOT EXISTS 'structural_risk';

ALTER TABLE public.analyses
  ADD COLUMN IF NOT EXISTS site_type text,
  ADD COLUMN IF NOT EXISTS detected_species text,
  ADD COLUMN IF NOT EXISTS detected_species_confidence_pct int,
  ADD COLUMN IF NOT EXISTS detected_species_alternates jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS seedlings_detected boolean,
  ADD COLUMN IF NOT EXISTS establishment_stage text,
  ADD COLUMN IF NOT EXISTS invasive_present boolean,
  ADD COLUMN IF NOT EXISTS invasive_coverage_pct int,
  ADD COLUMN IF NOT EXISTS invasive_species jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS bank_integrity text,
  ADD COLUMN IF NOT EXISTS water_body_condition text,
  ADD COLUMN IF NOT EXISTS structural_risk public.severity_level,
  ADD COLUMN IF NOT EXISTS not_visible jsonb DEFAULT '[]'::jsonb;

ALTER TABLE public.profiles ALTER COLUMN evaluation_credits SET DEFAULT 60;

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
    60,
    'trial'
  );
  IF (SELECT count(*) FROM public.user_roles) = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'field_worker');
  END IF;
  INSERT INTO public.credit_ledger(user_id, amount, action_type)
    VALUES (NEW.id, 60, 'trial_bonus');
  RETURN NEW;
END;
$$;