-- Přístupy: zkušební přístup (7 dní za vyplnění kvízu), limit projektů a placené funkce.
--
-- Úrovně:
--   zdarma   – brány 1–2, rentgen, kvíz
--   trial    – 7 dní všechny brány a videa (jednou na uživatele), bez prémiových výstupů
--   placený  – vše včetně exportu do Excelu, osvědčení za brány 3–7 / záměr / Gold, pitche a plného limitu AI
--
-- Zámky placených funkcí se zapínají přepínačem app_settings.paywall_enabled (výchozí vypnuto,
-- dokud nejsou napojené platby). Limit aktivních projektů platí vždy.

-- 1) Nastavení aplikace (čte každý přihlášený, mění jen správce v Supabase)
CREATE TABLE public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Nastavení čte každý" ON public.app_settings FOR SELECT TO anon, authenticated USING (true);
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.app_settings FROM anon, authenticated;
GRANT SELECT ON public.app_settings TO anon, authenticated;
INSERT INTO public.app_settings (key, value) VALUES
  ('paywall_enabled', 'false'::jsonb),
  ('trial_days', '7'::jsonb),
  ('project_limit_free', '1'::jsonb),
  ('project_limit_paid', '5'::jsonb)
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.setting_int(p_key TEXT, p_default INT)
RETURNS INT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT (value #>> '{}')::int FROM public.app_settings WHERE key = p_key), p_default);
$$;
CREATE OR REPLACE FUNCTION public.paywall_enabled()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT (value #>> '{}')::boolean FROM public.app_settings WHERE key = 'paywall_enabled'), false);
$$;

-- 2) Zkušební přístup v user_access
ALTER TABLE public.user_access DROP CONSTRAINT IF EXISTS user_access_plan_check;
ALTER TABLE public.user_access ADD CONSTRAINT user_access_plan_check
  CHECK (plan IN ('free', 'trial', 'mesic', 'ctvrtleti', 'rok', 'kod'));
ALTER TABLE public.user_access ADD COLUMN IF NOT EXISTS trial_used_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.is_paid(p_user UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_access
    WHERE user_id = p_user AND plan IN ('mesic', 'ctvrtleti', 'rok', 'kod')
      AND (access_until IS NULL OR access_until > NOW())
  );
$$;

CREATE OR REPLACE FUNCTION public.has_full_access(p_user UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_paid(p_user) OR EXISTS (
    SELECT 1 FROM public.user_access
    WHERE user_id = p_user AND plan = 'trial' AND access_until > NOW()
  );
$$;

REVOKE EXECUTE ON FUNCTION public.setting_int(TEXT, INT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.paywall_enabled() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_paid(UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_full_access(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.paywall_enabled() TO anon, authenticated;

-- Zkušební přístup: jednou na uživatele, jen po vyplnění kvízu (data „entrepreneur_quiz“).
-- Kdo už platí, dostane jen záznam, že nárok využil (odměnou je odznak).
CREATE OR REPLACE FUNCTION public.start_trial()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_row public.user_access%ROWTYPE;
  v_days INT := public.setting_int('trial_days', 7);
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Nejste přihlášeni.';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.project_data d JOIN public.projects p ON p.id = d.project_id
    WHERE p.user_id = v_uid AND d.data_key = 'entrepreneur_quiz'
  ) THEN
    RAISE EXCEPTION 'Nejdřív dokončete kvíz.';
  END IF;

  INSERT INTO public.user_access (user_id) VALUES (v_uid) ON CONFLICT (user_id) DO NOTHING;
  SELECT * INTO v_row FROM public.user_access WHERE user_id = v_uid FOR UPDATE;

  IF v_row.trial_used_at IS NOT NULL THEN
    RETURN jsonb_build_object('status', 'used', 'until', v_row.access_until);
  END IF;
  IF public.is_paid(v_uid) THEN
    UPDATE public.user_access SET trial_used_at = NOW() WHERE user_id = v_uid;
    RETURN jsonb_build_object('status', 'paid');
  END IF;

  UPDATE public.user_access
     SET plan = 'trial', access_until = NOW() + make_interval(days => v_days), trial_used_at = NOW()
   WHERE user_id = v_uid
  RETURNING * INTO v_row;
  PERFORM public.log_event(v_uid, NULL, 'trial_started', jsonb_build_object('days', v_days));
  RETURN jsonb_build_object('status', 'started', 'until', v_row.access_until);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.start_trial() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.start_trial() TO authenticated;

-- 3) Limit aktivních projektů (zdarma a trial 1, placený 5, správce bez limitu)
CREATE OR REPLACE FUNCTION public.check_project_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_limit INT;
  v_active INT;
BEGIN
  IF TG_OP = 'UPDATE' AND NOT (OLD.archived_at IS NOT NULL AND NEW.archived_at IS NULL) THEN
    RETURN NEW;
  END IF;
  IF EXISTS (SELECT 1 FROM public.admins WHERE user_id = NEW.user_id) THEN
    RETURN NEW;
  END IF;
  v_limit := CASE WHEN public.is_paid(NEW.user_id)
                  THEN public.setting_int('project_limit_paid', 5)
                  ELSE public.setting_int('project_limit_free', 1) END;
  SELECT COUNT(*) INTO v_active FROM public.projects
   WHERE user_id = NEW.user_id AND archived_at IS NULL AND id <> NEW.id;
  IF v_active >= v_limit THEN
    RAISE EXCEPTION 'limit_projektu: Máte maximální počet aktivních projektů (%).', v_limit
      USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.check_project_limit() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER check_project_limit
  BEFORE INSERT OR UPDATE OF archived_at ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.check_project_limit();

-- 4) Osvědčení za brány 3–7, záměr a Gold jen v placeném přístupu (když je zámek zapnutý)
CREATE OR REPLACE FUNCTION public.check_certificate_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF public.paywall_enabled()
     AND (NEW.kind IN ('zamer', 'gold') OR (NEW.kind = 'phase' AND NEW.phase >= 3))
     AND NOT public.is_paid(NEW.user_id) THEN
    RAISE EXCEPTION 'Osvědčení za brány 3–7 je součástí placeného přístupu.' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.check_certificate_access() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER check_certificate_access
  BEFORE INSERT ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.check_certificate_access();
