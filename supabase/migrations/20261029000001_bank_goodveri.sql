-- Cash flow z bankovního účtu přes Goodveri Finspector (PSD2: banka → Finbricks → Goodveri → VISIBLE7).
-- Pilot: funkce bank-sync pouští jen správce (BANK_SYNC_ACCESS=admins). Ostatní vidí ukázková data.
-- Zásady:
--  - VISIBLE7 nikdy nevidí přístupové údaje do banky. Drží jen clientCode připojení u Goodveri.
--  - Ukládáme jen měsíční souhrny (kategorie VISIBLE7 + součty podle štítků Goodveri),
--    žádné jednotlivé transakce ani protistrany.
--  - Data vidí jen majitel. Smazání účtu nebo projektu smaže i tato data (kaskáda).
--  - Číslo účtu jen maskované (např. „•••• 4821“).

-- 1) Připojené účty
CREATE TABLE IF NOT EXISTS public.bank_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  -- goodveri = PSD2 napojení, goodveri_pdf = nahrané PDF výpisy, demo = ukázka
  provider TEXT NOT NULL DEFAULT 'goodveri' CHECK (provider IN ('goodveri', 'goodveri_pdf', 'demo')),
  -- clientCode u Goodveri (ne přístupový údaj do banky)
  provider_ref TEXT NOT NULL,
  -- providerCode banky z Goodveri ProviderList
  bank_code TEXT,
  bank_name TEXT NOT NULL DEFAULT '',
  account_mask TEXT NOT NULL DEFAULT '',
  currency TEXT NOT NULL DEFAULT 'CZK',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'revoked', 'error')),
  consent_expires_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, provider_ref)
);
CREATE INDEX IF NOT EXISTS bank_connections_user_idx ON public.bank_connections (user_id);
ALTER TABLE public.bank_connections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Vlastník čte svá připojení" ON public.bank_connections;
CREATE POLICY "Vlastník čte svá připojení" ON public.bank_connections FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));
-- Zápis jen serverová funkce bank-sync (service role).
REVOKE ALL ON public.bank_connections FROM anon;
REVOKE ALL ON public.bank_connections FROM authenticated;
GRANT SELECT ON public.bank_connections TO authenticated;

-- 2) Měsíční souhrny
CREATE TABLE IF NOT EXISTS public.cashflow_months (
  connection_id UUID NOT NULL REFERENCES public.bank_connections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month DATE NOT NULL CHECK (EXTRACT(DAY FROM month) = 1),
  income NUMERIC(14, 2) NOT NULL DEFAULT 0,
  expense NUMERIC(14, 2) NOT NULL DEFAULT 0,
  -- { "trzby": 120000, "naklady_zbozi": -40000, "dane_odvody": -12000, ... }
  by_category JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- součty podle štítků Goodveri { "invoicecredit": 80000, "taxes_DPH": -9000, ... } – pro ladění mapování
  tags JSONB NOT NULL DEFAULT '{}'::jsonb,
  tx_count INTEGER NOT NULL DEFAULT 0,
  balance_end NUMERIC(14, 2),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (connection_id, month)
);
CREATE INDEX IF NOT EXISTS cashflow_months_user_idx ON public.cashflow_months (user_id, month);
ALTER TABLE public.cashflow_months ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Vlastník čte své souhrny" ON public.cashflow_months;
CREATE POLICY "Vlastník čte své souhrny" ON public.cashflow_months FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));
REVOKE ALL ON public.cashflow_months FROM anon;
REVOKE ALL ON public.cashflow_months FROM authenticated;
GRANT SELECT ON public.cashflow_months TO authenticated;

-- 3) Upozornění e-mailem (cash flow a vypršení souhlasu) – zapnuté ve výchozím stavu, jde vypnout
ALTER TABLE public.business_profile ADD COLUMN IF NOT EXISTS cashflow_alerts BOOLEAN NOT NULL DEFAULT true;
