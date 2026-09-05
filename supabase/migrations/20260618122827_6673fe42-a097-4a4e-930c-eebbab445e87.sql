
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'scientist', 'field_worker');
CREATE TYPE public.species_focus AS ENUM ('mangrove', 'moringa', 'mixed');
CREATE TYPE public.upload_kind AS ENUM ('photo', 'video');
CREATE TYPE public.analysis_status AS ENUM ('pending', 'processing', 'complete', 'failed');
CREATE TYPE public.severity_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.alert_kind AS ENUM ('waterlogging', 'scouring', 'salinity', 'canopy_decline');

-- Updated-at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','scientist'))
$$;

-- Auto-create profile + default role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  -- First user becomes admin, others are field_worker by default
  IF (SELECT count(*) FROM public.user_roles) = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'field_worker');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Sites
CREATE TABLE public.sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  region TEXT,
  species_focus public.species_focus NOT NULL DEFAULT 'mangrove',
  center_lat DOUBLE PRECISION,
  center_lng DOUBLE PRECISION,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sites TO authenticated;
GRANT ALL ON public.sites TO service_role;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sites_select_all_auth" ON public.sites FOR SELECT TO authenticated USING (true);
CREATE POLICY "sites_insert_staff" ON public.sites FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "sites_update_staff" ON public.sites FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "sites_delete_admin" ON public.sites FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_sites_updated BEFORE UPDATE ON public.sites FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Plots
CREATE TABLE public.plots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  center_lat DOUBLE PRECISION NOT NULL,
  center_lng DOUBLE PRECISION NOT NULL,
  radius_m INTEGER NOT NULL DEFAULT 50,
  planted_at DATE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plots TO authenticated;
GRANT ALL ON public.plots TO service_role;
ALTER TABLE public.plots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plots_select_all_auth" ON public.plots FOR SELECT TO authenticated USING (true);
CREATE POLICY "plots_insert_staff" ON public.plots FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "plots_update_staff" ON public.plots FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "plots_delete_admin" ON public.plots FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_plots_updated BEFORE UPDATE ON public.plots FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_plots_site ON public.plots(site_id);

-- Uploads
CREATE TABLE public.uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plot_id UUID REFERENCES public.plots(id) ON DELETE SET NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind public.upload_kind NOT NULL,
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  captured_lat DOUBLE PRECISION,
  captured_lng DOUBLE PRECISION,
  captured_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.uploads TO authenticated;
GRANT ALL ON public.uploads TO service_role;
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "uploads_select_staff_or_own" ON public.uploads FOR SELECT TO authenticated
  USING (uploaded_by = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "uploads_insert_own" ON public.uploads FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = auth.uid());
CREATE POLICY "uploads_update_own_or_staff" ON public.uploads FOR UPDATE TO authenticated
  USING (uploaded_by = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "uploads_delete_own_or_admin" ON public.uploads FOR DELETE TO authenticated
  USING (uploaded_by = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE INDEX idx_uploads_plot ON public.uploads(plot_id);
CREATE INDEX idx_uploads_user ON public.uploads(uploaded_by);

-- Analyses
CREATE TABLE public.analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID NOT NULL REFERENCES public.uploads(id) ON DELETE CASCADE,
  plot_id UUID REFERENCES public.plots(id) ON DELETE SET NULL,
  status public.analysis_status NOT NULL DEFAULT 'pending',
  waterlogging_pct INTEGER, -- 0..100
  scouring_severity public.severity_level,
  salinity_stress_pct INTEGER, -- 0..100
  canopy_health_pct INTEGER, -- 0..100 (higher = healthier)
  overall_confidence_pct INTEGER, -- 0..100
  risk_level public.severity_level,
  rationale TEXT,
  suggested_action TEXT,
  model TEXT,
  raw_response JSONB,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.analyses TO authenticated;
GRANT ALL ON public.analyses TO service_role;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "analyses_select_staff_or_own_upload" ON public.analyses FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()) OR EXISTS (
    SELECT 1 FROM public.uploads u WHERE u.id = analyses.upload_id AND u.uploaded_by = auth.uid()
  ));
CREATE POLICY "analyses_insert_own_upload" ON public.analyses FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.uploads u WHERE u.id = analyses.upload_id AND (u.uploaded_by = auth.uid() OR public.is_staff(auth.uid()))
  ));
CREATE POLICY "analyses_update_staff" ON public.analyses FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()) OR EXISTS (
    SELECT 1 FROM public.uploads u WHERE u.id = analyses.upload_id AND u.uploaded_by = auth.uid()
  ));
CREATE TRIGGER trg_analyses_updated BEFORE UPDATE ON public.analyses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_analyses_plot ON public.analyses(plot_id);
CREATE INDEX idx_analyses_upload ON public.analyses(upload_id);

-- Alerts
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plot_id UUID NOT NULL REFERENCES public.plots(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES public.analyses(id) ON DELETE SET NULL,
  kind public.alert_kind NOT NULL,
  severity public.severity_level NOT NULL,
  message TEXT NOT NULL,
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alerts TO authenticated;
GRANT ALL ON public.alerts TO service_role;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alerts_select_auth" ON public.alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "alerts_update_staff" ON public.alerts FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));
CREATE INDEX idx_alerts_plot ON public.alerts(plot_id);
