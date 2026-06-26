-- ============================================================================
-- 1) USER_PROGRESS
-- Nahrazuje localStorage. Jeden řádek = jeden klíč dat pro jednoho uživatele
-- (např. "vision_project_data", "vision_errc_data", "completed_phases"...).
-- Stejný princip jako dřívější usePersistedState(key, value), jen na serveru.
-- ============================================================================

CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_key TEXT NOT NULL,
  data_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, data_key)
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress"
ON public.user_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
ON public.user_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON public.user_progress FOR UPDATE
USING (auth.uid() = user_id);

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_user_progress_user_id ON public.user_progress(user_id);


-- ============================================================================
-- 2) SUBSCRIPTIONS
-- Server-side stav přístupu. Nahrazuje useTrial.ts (dříve v localStorage).
-- status: 'trial' | 'active' | 'expired'
-- Trial i promo kód se řídí datem v databázi - nelze obejít v DevTools.
-- ============================================================================

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'expired')),
  trial_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '14 days'),
  access_until TIMESTAMP WITH TIME ZONE, -- prodlouženo promo kódem nebo platbou
  promo_code_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
ON public.subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- Žádný INSERT/UPDATE policy pro běžné uživatele - subscription vytváří
-- a upravuje pouze trigger při registraci a Edge Function (service role)
-- při uplatnění promo kódu. Uživatel si nemůže sám "prodloužit" přístup.

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Automaticky vytvoří subscription (= spustí trial) při registraci nového uživatele
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();


-- ============================================================================
-- 3) PROMO_CODES
-- Nahrazuje natvrdo zapsané kódy v src/lib/promoCodes.ts (ty byly viditelné
-- v JS kódu stahovaném do prohlížeče). Teď žijí jen v databázi a ověřuje je
-- Edge Function pomocí service role klíče - kód není nikde v klientském kódu.
-- ============================================================================

CREATE TABLE public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  extends_access_days INTEGER NOT NULL DEFAULT 90,
  max_uses INTEGER, -- NULL = neomezeně
  times_used INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE, -- NULL = bez expirace
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Tabulka se čte/píše VÝHRADNĚ přes Edge Function (service role).
-- Žádná RLS policy pro authenticated/anon = běžný klient se sem nedostane,
-- ani na SELECT (takže nejde "vyčíst" platné kódy přes API).

-- Pár výchozích kódů pro studenty kurzů - uprav si klidně přímo v Supabase Table Editoru
INSERT INTO public.promo_codes (code, description, extends_access_days) VALUES
  ('KURZ2026', 'Studenti kurzu Edu Partners 2026', 90),
  ('VISIBLE7STUDENT', 'Obecný studentský přístup', 90);
