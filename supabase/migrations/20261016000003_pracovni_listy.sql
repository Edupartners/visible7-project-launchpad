-- Pracovní listy ke stažení za e-mail (stránka /pracovni-listy).
-- Zápis jen přes edge funkci worksheets (service role); číst může správce.
CREATE TABLE IF NOT EXISTS public.worksheet_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL CHECK (char_length(email) <= 160),
  sheet TEXT NOT NULL CHECK (char_length(sheet) <= 60),
  marketing BOOLEAN NOT NULL DEFAULT false,
  consent_text TEXT NOT NULL DEFAULT '' CHECK (char_length(consent_text) <= 600),
  source TEXT NOT NULL DEFAULT 'web' CHECK (char_length(source) <= 40),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.worksheet_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Správce čte zájemce o listy" ON public.worksheet_leads FOR SELECT TO authenticated
  USING (public.is_admin());
CREATE POLICY "Správce maže zájemce o listy" ON public.worksheet_leads FOR DELETE TO authenticated
  USING (public.is_admin());
REVOKE ALL ON public.worksheet_leads FROM anon;
GRANT SELECT, DELETE ON public.worksheet_leads TO authenticated;
CREATE INDEX IF NOT EXISTS worksheet_leads_email_idx ON public.worksheet_leads (email, created_at);
