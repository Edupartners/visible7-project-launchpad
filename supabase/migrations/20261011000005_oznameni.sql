-- Oznámení (notifikační centrum): správce píše zprávy, uživatelé je vidí ve zvonečku.
-- Správce může oznámení kdykoli vypnout (active) nebo nastavit, do kdy platí (ends_at).
-- Uživatel si oznámení přečte (zmizí odznak) nebo skryje (zmizí ze seznamu i z nástěnky).

CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  body TEXT NOT NULL DEFAULT '' CHECK (char_length(body) <= 1000),
  kind TEXT NOT NULL DEFAULT 'novinka' CHECK (kind IN ('novinka', 'akce', 'info')),
  link_url TEXT CHECK (link_url IS NULL OR link_url ~ '^(https://|/)'),
  link_label TEXT CHECK (link_label IS NULL OR char_length(link_label) <= 40),
  highlight BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Aktivní oznámení vidí přihlášení" ON public.announcements FOR SELECT TO authenticated
  USING ((active AND starts_at <= NOW() AND (ends_at IS NULL OR ends_at > NOW())) OR public.is_admin());
CREATE POLICY "Správce zakládá oznámení" ON public.announcements FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());
CREATE POLICY "Správce mění oznámení" ON public.announcements FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Správce maže oznámení" ON public.announcements FOR DELETE TO authenticated
  USING (public.is_admin());
REVOKE ALL ON public.announcements FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;

CREATE TABLE public.announcement_reads (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  announcement_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dismissed BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (user_id, announcement_id)
);
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vlastní přečtení" ON public.announcement_reads FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Zápis vlastního přečtení" ON public.announcement_reads FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Změna vlastního přečtení" ON public.announcement_reads FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
REVOKE ALL ON public.announcement_reads FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.announcement_reads TO authenticated;
CREATE INDEX announcement_reads_announcement_idx ON public.announcement_reads (announcement_id);
