-- Živé semináře: správce zakládá témata a termíny, uživatelé se registrují.
-- Odkaz na připojení a záznam nejsou v tabulce čitelné – dostane je jen člen
-- (nebo registrovaný u semináře zdarma) přes funkci seminar_links().

CREATE TABLE public.seminars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  description TEXT NOT NULL DEFAULT '' CHECK (char_length(description) <= 1500),
  gate SMALLINT CHECK (gate IS NULL OR gate BETWEEN 1 AND 7),
  starts_at TIMESTAMPTZ,
  duration_min SMALLINT NOT NULL DEFAULT 90 CHECK (duration_min BETWEEN 15 AND 480),
  place TEXT NOT NULL DEFAULT 'Online' CHECK (char_length(place) <= 120),
  access TEXT NOT NULL DEFAULT 'clenove' CHECK (access IN ('clenove', 'zdarma')),
  join_url TEXT CHECK (join_url IS NULL OR join_url ~ '^https://'),
  recording_url TEXT CHECK (recording_url IS NULL OR recording_url ~ '^https://'),
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.seminars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Zveřejněné semináře vidí přihlášení" ON public.seminars FOR SELECT TO authenticated
  USING (published OR public.is_admin());
CREATE POLICY "Správce zakládá semináře" ON public.seminars FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());
CREATE POLICY "Správce mění semináře" ON public.seminars FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Správce maže semináře" ON public.seminars FOR DELETE TO authenticated
  USING (public.is_admin());

REVOKE ALL ON public.seminars FROM anon, authenticated;
-- Odkazy (join_url, recording_url) nejdou číst přímo, jen přes funkce níže.
GRANT SELECT (id, title, description, gate, starts_at, duration_min, place, access, published, created_at)
  ON public.seminars TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.seminars TO authenticated;

CREATE TABLE public.seminar_registrations (
  seminar_id UUID NOT NULL REFERENCES public.seminars(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (seminar_id, user_id)
);
ALTER TABLE public.seminar_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vlastní registrace" ON public.seminar_registrations FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Registrace sebe" ON public.seminar_registrations FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Zrušení vlastní registrace" ON public.seminar_registrations FOR DELETE TO authenticated
  USING (user_id = auth.uid());
REVOKE ALL ON public.seminar_registrations FROM anon;
GRANT SELECT, INSERT, DELETE ON public.seminar_registrations TO authenticated;

-- Má uživatel plný přístup? (člen, nebo vypnutý paywall)
CREATE OR REPLACE FUNCTION public.seminar_member()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    public.is_admin()
    OR COALESCE((SELECT value = 'true'::jsonb FROM app_settings WHERE key = 'paywall_enabled'), false) = false
    OR EXISTS (
      SELECT 1 FROM user_access
      WHERE user_id = auth.uid()
        AND plan IN ('mesic', 'ctvrtleti', 'rok', 'kod', 'clenstvi')
        AND (access_until IS NULL OR access_until > NOW())
    );
$$;

-- Odkaz na připojení a záznam: člen vždy, u semináře zdarma každý registrovaný.
CREATE OR REPLACE FUNCTION public.seminar_links(p_id UUID)
RETURNS TABLE (join_url TEXT, recording_url TEXT)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  s seminars%ROWTYPE;
BEGIN
  SELECT * INTO s FROM seminars WHERE id = p_id AND (published OR public.is_admin());
  IF NOT FOUND THEN RETURN; END IF;
  IF public.seminar_member()
     OR (s.access = 'zdarma' AND EXISTS (
       SELECT 1 FROM seminar_registrations r WHERE r.seminar_id = p_id AND r.user_id = auth.uid()))
  THEN
    RETURN QUERY SELECT s.join_url, s.recording_url;
  END IF;
END;
$$;

-- Přehled pro správce včetně odkazů a počtu registrací.
CREATE OR REPLACE FUNCTION public.admin_seminars()
RETURNS TABLE (
  id UUID, title TEXT, description TEXT, gate SMALLINT, starts_at TIMESTAMPTZ, duration_min SMALLINT,
  place TEXT, access TEXT, join_url TEXT, recording_url TEXT, published BOOLEAN, registrations BIGINT
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Jen pro správce';
  END IF;
  RETURN QUERY
    SELECT s.id, s.title, s.description, s.gate, s.starts_at, s.duration_min, s.place, s.access,
           s.join_url, s.recording_url, s.published,
           (SELECT COUNT(*) FROM seminar_registrations r WHERE r.seminar_id = s.id)
    FROM seminars s
    ORDER BY s.starts_at NULLS LAST, s.created_at;
END;
$$;

REVOKE ALL ON FUNCTION public.seminar_member() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.seminar_links(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_seminars() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.seminar_member() TO authenticated;
GRANT EXECUTE ON FUNCTION public.seminar_links(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_seminars() TO authenticated;
