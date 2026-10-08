-- ============================================================================
-- VISIBLE7 – nový datový základ ve vlastním Supabase projektu
-- Jeden uživatel může mít více projektů; veškerý postup patří k projektu.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 1) PROJEKTY ---------------------------------------------------------------
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Nový projekt',
  business_type TEXT, -- typ online podnikání (odhad AI, potvrzuje uživatel)
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vlastník vidí své projekty" ON public.projects
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Vlastník zakládá své projekty" ON public.projects
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Vlastník upravuje své projekty" ON public.projects
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Vlastník maže své projekty" ON public.projects
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) DATA PROJEKTU ----------------------------------------------------------
-- Stejný princip jako dřívější user_progress (klíč -> hodnota), jen k projektu.
CREATE TABLE public.project_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  data_key TEXT NOT NULL,
  data_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, data_key)
);
ALTER TABLE public.project_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vlastník vidí data projektu" ON public.project_data
  FOR SELECT TO authenticated USING (EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id AND p.user_id = (SELECT auth.uid())));
CREATE POLICY "Vlastník zapisuje data projektu" ON public.project_data
  FOR INSERT TO authenticated WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id AND p.user_id = (SELECT auth.uid())));
CREATE POLICY "Vlastník upravuje data projektu" ON public.project_data
  FOR UPDATE TO authenticated USING (EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id AND p.user_id = (SELECT auth.uid())))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id AND p.user_id = (SELECT auth.uid())));
CREATE POLICY "Vlastník maže data projektu" ON public.project_data
  FOR DELETE TO authenticated USING (EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id AND p.user_id = (SELECT auth.uid())));

CREATE TRIGGER update_project_data_updated_at
  BEFORE UPDATE ON public.project_data
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) VÝSTUPY AI -------------------------------------------------------------
-- Zapisuje pouze serverová funkce (service role). Slouží i k počítání limitů.
CREATE TABLE public.ai_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phase TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('navrh', 'vyhodnoceni')),
  output JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_ai_outputs_project ON public.ai_outputs(project_id, phase);
CREATE INDEX idx_ai_outputs_user ON public.ai_outputs(user_id, created_at);
ALTER TABLE public.ai_outputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vlastník čte výstupy AI" ON public.ai_outputs
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);

-- 4) PŘÍSTUPY ---------------------------------------------------------------
-- Fáze 1–2 jsou zdarma (plan = 'free'). Placený přístup platí do access_until.
-- Zapisuje pouze server (platba, promo kód) – uživatel si přístup sám neprodlouží.
CREATE TABLE public.user_access (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'mesic', 'ctvrtleti', 'rok', 'kod')),
  access_until TIMESTAMPTZ,
  promo_code_used TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.user_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Uživatel čte svůj přístup" ON public.user_access
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE TRIGGER update_user_access_updated_at
  BEFORE UPDATE ON public.user_access
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_access (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_access() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER on_auth_user_created_access
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_access();

-- 5) PROMO KÓDY -------------------------------------------------------------
-- Čte a zapisuje výhradně serverová funkce. Kódy se NEVKLÁDAJÍ v migraci
-- (repozitář je veřejný) – zakládají se přímo v Supabase.
CREATE TABLE public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  extends_access_days INTEGER NOT NULL DEFAULT 90,
  max_uses INTEGER,
  times_used INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
