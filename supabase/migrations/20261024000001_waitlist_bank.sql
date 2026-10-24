-- Čekací listina na napojení bankovního účtu (PSD2 přes GoodVeri).
-- Anonymní návštěvník smí e-mail jen vložit, nikdo z veřejnosti ho nesmí číst.
CREATE TABLE IF NOT EXISTS public.waitlist_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND char_length(email) <= 254),
  source TEXT NOT NULL DEFAULT 'bank_connect' CHECK (source = 'bank_connect'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS waitlist_bank_email_key ON public.waitlist_bank (lower(email));

ALTER TABLE public.waitlist_bank ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "waitlist_bank_insert" ON public.waitlist_bank;
CREATE POLICY "waitlist_bank_insert" ON public.waitlist_bank
  FOR INSERT TO anon, authenticated
  WITH CHECK (source = 'bank_connect');

REVOKE ALL ON public.waitlist_bank FROM anon, authenticated;
GRANT INSERT (email, source) ON public.waitlist_bank TO anon, authenticated;
