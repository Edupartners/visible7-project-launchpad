-- Evidence souhlasů a prohlášení uživatelů (podmínky, zásady GDPR, klub, marketing).
-- Záznamy se jen přidávají – nejnovější záznam daného druhu je platný stav.
-- Tak zůstává doložitelné, kdo, kdy a s jakou verzí dokumentu souhlasil nebo souhlas odvolal.

CREATE TABLE public.consents (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('podminky', 'zasady', 'klub', 'marketing')),
  version TEXT NOT NULL,
  granted BOOLEAN NOT NULL,
  source TEXT NOT NULL DEFAULT 'aplikace' CHECK (source IN ('registrace', 'aplikace')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_consents_user ON public.consents(user_id, kind, created_at DESC);
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Uživatel vidí své souhlasy" ON public.consents
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Uživatel zapisuje své souhlasy" ON public.consents
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id AND source = 'aplikace');

REVOKE ALL ON public.consents FROM anon;
REVOKE UPDATE, DELETE, TRUNCATE ON public.consents FROM authenticated;
GRANT SELECT, INSERT ON public.consents TO authenticated;
GRANT USAGE ON SEQUENCE public.consents_id_seq TO authenticated;

-- Souhlasy zaškrtnuté při registraci (posílají se v metadatech účtu) se zapíší hned při založení uživatele.
CREATE OR REPLACE FUNCTION public.handle_new_user_consents()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  c JSONB := NEW.raw_user_meta_data -> 'consents';
  v TEXT;
  k TEXT;
BEGIN
  IF c IS NULL OR jsonb_typeof(c) <> 'object' THEN
    RETURN NEW;
  END IF;
  v := COALESCE(c ->> 'version', 'neuvedeno');
  FOREACH k IN ARRAY ARRAY['podminky', 'zasady', 'klub', 'marketing'] LOOP
    IF c ? k THEN
      INSERT INTO public.consents (user_id, kind, version, granted, source)
      VALUES (NEW.id, k, left(v, 40), (c ->> k) = 'true', 'registrace');
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_consents() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER on_auth_user_created_consents
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_consents();
