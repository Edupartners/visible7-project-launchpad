-- Testovací stránka (smoke test před bránou 4): jednoduchá konverzní stránka z dat bran 1–3,
-- sběr zájemců, vlastní počítadlo návštěv podle zdroje, volitelně Meta Pixel a GA4.
-- Provozovatelem stránky (správcem e-mailů zájemců) je uživatel; VISIBLE7 je zpracovatel.

CREATE TABLE public.test_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9](?:[a-z0-9-]{1,58}[a-z0-9])$'),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  template TEXT NOT NULL DEFAULT 'svetla' CHECK (template IN ('svetla', 'tmava', 'tepla')),
  accent TEXT NOT NULL DEFAULT '#f97316' CHECK (accent ~ '^#[0-9a-fA-F]{6}$'),
  content JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (pg_column_size(content) < 60000),
  logo_url TEXT CHECK (logo_url IS NULL OR logo_url ~ '^https://'),
  hero_url TEXT CHECK (hero_url IS NULL OR hero_url ~ '^https://'),
  operator_name TEXT NOT NULL DEFAULT '' CHECK (char_length(operator_name) <= 120),
  operator_email TEXT NOT NULL DEFAULT '' CHECK (char_length(operator_email) <= 160),
  meta_pixel_id TEXT CHECK (meta_pixel_id IS NULL OR meta_pixel_id ~ '^[0-9]{10,20}$'),
  ga4_id TEXT CHECK (ga4_id IS NULL OR ga4_id ~ '^G-[A-Z0-9]{4,16}$'),
  goal_visits INT NOT NULL DEFAULT 100 CHECK (goal_visits BETWEEN 10 AND 100000),
  goal_rate NUMERIC NOT NULL DEFAULT 10 CHECK (goal_rate > 0 AND goal_rate <= 100),
  notify_leads BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.test_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vlastník čte stránku" ON public.test_pages FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Vlastník zakládá stránku" ON public.test_pages FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid()));
CREATE POLICY "Vlastník mění stránku" ON public.test_pages FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Vlastník maže stránku" ON public.test_pages FOR DELETE TO authenticated
  USING (user_id = auth.uid());
REVOKE ALL ON public.test_pages FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.test_pages TO authenticated;

CREATE TABLE public.test_page_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.test_pages(id) ON DELETE CASCADE,
  email TEXT NOT NULL CHECK (char_length(email) <= 160),
  name TEXT NOT NULL DEFAULT '' CHECK (char_length(name) <= 120),
  source TEXT NOT NULL DEFAULT 'primo' CHECK (char_length(source) <= 40),
  consent_text TEXT NOT NULL CHECK (char_length(consent_text) <= 600),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (page_id, email)
);
ALTER TABLE public.test_page_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vlastník čte zájemce" ON public.test_page_leads FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.test_pages t WHERE t.id = page_id AND t.user_id = auth.uid()));
CREATE POLICY "Vlastník maže zájemce" ON public.test_page_leads FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.test_pages t WHERE t.id = page_id AND t.user_id = auth.uid()));
REVOKE ALL ON public.test_page_leads FROM anon;
GRANT SELECT, DELETE ON public.test_page_leads TO authenticated;

-- Anonymní součty bez osobních údajů (počítadlo nepotřebuje souhlas s cookies).
CREATE TABLE public.test_page_stats (
  page_id UUID NOT NULL REFERENCES public.test_pages(id) ON DELETE CASCADE,
  day DATE NOT NULL DEFAULT CURRENT_DATE,
  source TEXT NOT NULL DEFAULT 'primo',
  visits INT NOT NULL DEFAULT 0,
  clicks INT NOT NULL DEFAULT 0,
  leads INT NOT NULL DEFAULT 0,
  PRIMARY KEY (page_id, day, source)
);
ALTER TABLE public.test_page_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vlastník čte statistiky" ON public.test_page_stats FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.test_pages t WHERE t.id = page_id AND t.user_id = auth.uid()));
REVOKE ALL ON public.test_page_stats FROM anon;
GRANT SELECT ON public.test_page_stats TO authenticated;

CREATE OR REPLACE FUNCTION public.test_page_source(p_source TEXT)
RETURNS TEXT LANGUAGE sql IMMUTABLE AS $$
  SELECT COALESCE(NULLIF(left(regexp_replace(lower(COALESCE(p_source, '')), '[^a-z0-9_-]', '', 'g'), 40), ''), 'primo');
$$;

-- Veřejný obsah zveřejněné stránky (bez ID uživatele a projektu).
CREATE OR REPLACE FUNCTION public.test_page_public(p_slug TEXT)
RETURNS JSONB
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'slug', t.slug, 'template', t.template, 'accent', t.accent, 'content', t.content,
    'logo_url', t.logo_url, 'hero_url', t.hero_url,
    'operator_name', t.operator_name, 'operator_email', t.operator_email,
    'meta_pixel_id', t.meta_pixel_id, 'ga4_id', t.ga4_id, 'project_name', p.name)
  FROM test_pages t JOIN projects p ON p.id = t.project_id
  WHERE t.slug = lower(p_slug) AND t.status = 'published';
$$;

-- Počítadlo: návštěva nebo klik na tlačítko.
CREATE OR REPLACE FUNCTION public.test_page_hit(p_slug TEXT, p_source TEXT, p_kind TEXT DEFAULT 'visit')
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  SELECT id INTO v_id FROM test_pages WHERE slug = lower(p_slug) AND status = 'published';
  IF v_id IS NULL THEN RETURN; END IF;
  INSERT INTO test_page_stats (page_id, day, source, visits, clicks)
  VALUES (v_id, CURRENT_DATE, test_page_source(p_source),
          CASE WHEN p_kind = 'click' THEN 0 ELSE 1 END, CASE WHEN p_kind = 'click' THEN 1 ELSE 0 END)
  ON CONFLICT (page_id, day, source) DO UPDATE SET
    visits = test_page_stats.visits + EXCLUDED.visits,
    clicks = test_page_stats.clicks + EXCLUDED.clicks;
END;
$$;

-- Zápis zájemce (jen se souhlasem). Vrací 'ok', 'dup' nebo chybu.
CREATE OR REPLACE FUNCTION public.test_page_lead(p_slug TEXT, p_email TEXT, p_name TEXT, p_source TEXT, p_consent TEXT)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_id UUID;
  v_email TEXT := lower(trim(COALESCE(p_email, '')));
  v_src TEXT := test_page_source(p_source);
BEGIN
  SELECT id INTO v_id FROM test_pages WHERE slug = lower(p_slug) AND status = 'published';
  IF v_id IS NULL THEN RAISE EXCEPTION 'Stránka neexistuje'; END IF;
  IF v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$' OR char_length(v_email) > 160 THEN
    RAISE EXCEPTION 'Neplatný e-mail';
  END IF;
  IF COALESCE(trim(p_consent), '') = '' THEN RAISE EXCEPTION 'Chybí souhlas'; END IF;
  -- Ochrana proti zahlcení: nejvýš 300 zápisů za hodinu na stránku.
  IF (SELECT COUNT(*) FROM test_page_leads WHERE page_id = v_id AND created_at > NOW() - INTERVAL '1 hour') >= 300 THEN
    RAISE EXCEPTION 'Zkuste to prosím později';
  END IF;
  INSERT INTO test_page_leads (page_id, email, name, source, consent_text)
  VALUES (v_id, v_email, left(trim(COALESCE(p_name, '')), 120), v_src, left(p_consent, 600))
  ON CONFLICT (page_id, email) DO NOTHING;
  IF NOT FOUND THEN RETURN 'dup'; END IF;
  INSERT INTO test_page_stats (page_id, day, source, leads) VALUES (v_id, CURRENT_DATE, v_src, 1)
  ON CONFLICT (page_id, day, source) DO UPDATE SET leads = test_page_stats.leads + 1;
  RETURN 'ok';
END;
$$;

REVOKE ALL ON FUNCTION public.test_page_public(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.test_page_hit(TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.test_page_lead(TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.test_page_public(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.test_page_hit(TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.test_page_lead(TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

-- Upozornění vlastníkovi na nového zájemce (funkce reminders, klíč z Vault).
CREATE OR REPLACE FUNCTION public.test_page_lead_notify()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, vault
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM test_pages WHERE id = NEW.page_id AND notify_leads) THEN
    PERFORM net.http_post(
      url := 'https://mpftsyraaozarfpnnzjn.supabase.co/functions/v1/reminders',
      headers := jsonb_build_object('content-type', 'application/json', 'x-cron-key',
        (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'reminders_cron_key')),
      body := jsonb_build_object('lead', NEW.id)
    );
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW; -- upozornění nesmí zablokovat zápis zájemce
END;
$$;
CREATE TRIGGER test_page_lead_notify AFTER INSERT ON public.test_page_leads
  FOR EACH ROW EXECUTE FUNCTION public.test_page_lead_notify();

-- Obrázky stránek (logo, úvodní fotka): veřejně čitelné, zápis jen do vlastní složky.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('test-pages', 'test-pages', true, 3145728, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Obrázky testovací stránky – nahrát" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'test-pages' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Obrázky testovací stránky – přepsat" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'test-pages' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Obrázky testovací stránky – smazat" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'test-pages' AND (storage.foldername(name))[1] = auth.uid()::text);
