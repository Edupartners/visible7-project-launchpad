-- Záznam událostí: co uživatelé v aplikaci dělají (produktová analytika a výzkum).
-- Klíčové milníky zapisuje databáze sama (spouště) – nejdou obejít a nezávisí na prohlížeči:
--   signup, rentgen_done, gate_complete, certificate_issued, ai_call.
-- Drobné akce (přehrání videa, export, klik na poradce…) zapisuje aplikace přes insert.
-- Uživatel smí jen zapisovat své události, číst je může jen správce přes admin funkce.

CREATE TABLE public.events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL CHECK (name ~ '^[a-z0-9_]{2,40}$'),
  props JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (pg_column_size(props) <= 2048),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_events_name_time ON public.events(name, created_at DESC);
CREATE INDEX idx_events_user_time ON public.events(user_id, created_at DESC);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Uživatel zapisuje své události" ON public.events
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND (project_id IS NULL OR EXISTS (
      SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = (SELECT auth.uid())))
  );
REVOKE ALL ON public.events FROM anon;
REVOKE SELECT, UPDATE, DELETE, TRUNCATE ON public.events FROM authenticated;
GRANT INSERT ON public.events TO authenticated;
GRANT USAGE ON SEQUENCE public.events_id_seq TO authenticated;

-- Pomocná funkce pro spouště (zapisuje s právy vlastníka tabulky).
CREATE OR REPLACE FUNCTION public.log_event(p_user UUID, p_project UUID, p_name TEXT, p_props JSONB DEFAULT '{}'::jsonb)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  INSERT INTO public.events (user_id, project_id, name, props) VALUES (p_user, p_project, p_name, COALESCE(p_props, '{}'::jsonb));
$$;
REVOKE EXECUTE ON FUNCTION public.log_event(UUID, UUID, TEXT, JSONB) FROM PUBLIC, anon, authenticated;

-- Registrace
CREATE OR REPLACE FUNCTION public.ev_signup() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.log_event(NEW.id, NULL, 'signup', '{}'::jsonb);
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.ev_signup() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER on_auth_user_created_event AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.ev_signup();

-- Brány a rentgen (z dat projektu)
CREATE OR REPLACE FUNCTION public.ev_project_data() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  owner UUID;
  gate TEXT;
  old_val JSONB := CASE WHEN TG_OP = 'UPDATE' THEN OLD.data_value ELSE '[]'::jsonb END;
BEGIN
  IF NEW.data_key NOT IN ('completed_phases', 'diagnosis') THEN
    RETURN NEW;
  END IF;
  SELECT user_id INTO owner FROM public.projects WHERE id = NEW.project_id;
  IF owner IS NULL THEN
    RETURN NEW;
  END IF;
  IF NEW.data_key = 'completed_phases' AND jsonb_typeof(NEW.data_value) = 'array' THEN
    FOR gate IN SELECT jsonb_array_elements_text(NEW.data_value) LOOP
      IF gate ~ '^[1-7]$' AND NOT (jsonb_typeof(old_val) = 'array' AND old_val ? gate)
         AND NOT (jsonb_typeof(old_val) = 'array' AND old_val @> to_jsonb(gate::int)) THEN
        PERFORM public.log_event(owner, NEW.project_id, 'gate_complete', jsonb_build_object('gate', gate::int));
      END IF;
    END LOOP;
  ELSIF NEW.data_key = 'diagnosis' AND (TG_OP = 'INSERT' OR OLD.data_value->>'createdAt' IS DISTINCT FROM NEW.data_value->>'createdAt') THEN
    PERFORM public.log_event(owner, NEW.project_id, 'rentgen_done', jsonb_build_object(
      'verdict', NEW.data_value->'ai'->'verdict'->>'color',
      'type', NEW.data_value->'ai'->>'businessType',
      'hours', NEW.data_value->'answers'->'hours',
      'goal', NEW.data_value->'answers'->>'goal'
    ));
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.ev_project_data() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER on_project_data_event AFTER INSERT OR UPDATE ON public.project_data
  FOR EACH ROW EXECUTE FUNCTION public.ev_project_data();

-- Osvědčení
CREATE OR REPLACE FUNCTION public.ev_certificate() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.log_event(NEW.user_id, NEW.project_id, 'certificate_issued',
    jsonb_build_object('kind', NEW.kind, 'phase', NEW.phase));
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.ev_certificate() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER on_certificate_event AFTER INSERT ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.ev_certificate();

-- Volání AI
CREATE OR REPLACE FUNCTION public.ev_ai_output() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.log_event(NEW.user_id, NEW.project_id, 'ai_call',
    jsonb_build_object('phase', NEW.phase, 'kind', NEW.kind));
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.ev_ai_output() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER on_ai_output_event AFTER INSERT ON public.ai_outputs
  FOR EACH ROW EXECUTE FUNCTION public.ev_ai_output();

-- Přehled pro správce: počty událostí a unikátních uživatelů za zvolené období.
CREATE OR REPLACE FUNCTION public.admin_event_stats(p_days INT DEFAULT 30)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  since TIMESTAMPTZ := NOW() - make_interval(days => LEAST(GREATEST(p_days, 1), 365));
  result JSONB;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Přístup jen pro správce' USING ERRCODE = '42501';
  END IF;
  SELECT jsonb_build_object(
    'days', LEAST(GREATEST(p_days, 1), 365),
    'events', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('name', name, 'count', c, 'users', u) ORDER BY c DESC)
      FROM (
        SELECT name, COUNT(*) AS c, COUNT(DISTINCT user_id) AS u
        FROM public.events WHERE created_at >= since GROUP BY name
      ) t
    ), '[]'::jsonb),
    'daily', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('day', d, 'users', u) ORDER BY d)
      FROM (
        SELECT date_trunc('day', created_at)::date AS d, COUNT(DISTINCT user_id) AS u
        FROM public.events WHERE created_at >= since GROUP BY 1
      ) t
    ), '[]'::jsonb)
  ) INTO result;
  RETURN result;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.admin_event_stats(INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_event_stats(INT) TO authenticated;
