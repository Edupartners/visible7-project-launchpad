-- NÁVRH – zatím NEAPLIKOVÁNO do databáze. Aplikovat až po podpisu smlouvy se Sokordia Tech,
-- DPIA a úpravě zásad zpracování. Pak přesunout do supabase/migrations/ s aktuálním datem.
--
-- Cash flow z bankovního účtu (PSD2 přes Sokordia Tech → Finbricks).
-- Zásady:
--  - VISIBLE7 nikdy nevidí přístupové údaje do banky, drží jen odkaz na připojení u poskytovatele.
--  - Ukládáme jen měsíční souhrny podle kategorií (minimalizace), ne jednotlivé transakce
--    a ne protistrany (osobní údaje třetích osob).
--  - Data vidí jen majitel. Smazání účtu nebo projektu smaže i tato data (kaskáda).
--  - Číslo účtu jen maskované (např. „•••• 4821“).

-- 1) Připojené účty
CREATE TABLE public.bank_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'sokordia' CHECK (provider IN ('sokordia', 'demo')),
  -- identifikátor připojení u poskytovatele (ne přístupový údaj do banky)
  provider_ref TEXT NOT NULL,
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
CREATE INDEX bank_connections_user_idx ON public.bank_connections (user_id);
ALTER TABLE public.bank_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vlastník čte svá připojení" ON public.bank_connections FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));
-- Zápis jen serverová funkce (service role); uživatel může připojení jen odpojit přes funkci.
REVOKE ALL ON public.bank_connections FROM anon;
GRANT SELECT ON public.bank_connections TO authenticated;

-- 2) Měsíční souhrny
CREATE TABLE public.cashflow_months (
  connection_id UUID NOT NULL REFERENCES public.bank_connections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month DATE NOT NULL CHECK (EXTRACT(DAY FROM month) = 1),
  income NUMERIC(14, 2) NOT NULL DEFAULT 0,
  expense NUMERIC(14, 2) NOT NULL DEFAULT 0,
  -- { "trzby": 120000, "naklady_zbozi": -40000, "marketing": -8000, "dane_odvody": -12000, ... }
  by_category JSONB NOT NULL DEFAULT '{}'::jsonb,
  balance_end NUMERIC(14, 2),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (connection_id, month)
);
CREATE INDEX cashflow_months_user_idx ON public.cashflow_months (user_id, month);
ALTER TABLE public.cashflow_months ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vlastník čte své souhrny" ON public.cashflow_months FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));
REVOKE ALL ON public.cashflow_months FROM anon;
GRANT SELECT ON public.cashflow_months TO authenticated;

-- 3) Upozornění e-mailem (cash flow a vypršení souhlasu) – zapnuté ve výchozím stavu, jde vypnout
ALTER TABLE public.business_profile ADD COLUMN IF NOT EXISTS cashflow_alerts BOOLEAN NOT NULL DEFAULT true;

-- Pozn.: funkce privacy (delete_account, purge_project) spoléhá na kaskádu z auth.users / projects,
-- takže bankovní data se smažou s účtem i projektem bez úprav. Při odpojení účtu funkce bank-sync
-- nejdřív odvolá souhlas u poskytovatele a pak smaže řádek (souhrny jdou kaskádou).
