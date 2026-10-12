-- Připomínky e-mailem (Brevo): aby lidé dokončili práci.
-- Rozesílá je jednou denně funkce „reminders“ (spouští pg_cron). Servisní sdělení k vlastnímu účtu,
-- bez nabídek. Každý e-mail má odkaz na odhlášení; v Nastavení je přepínač.

CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 1) Nastavení e-mailů uživatele
CREATE TABLE public.email_prefs (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  reminders BOOLEAN NOT NULL DEFAULT true,
  unsubscribe_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.email_prefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vlastní nastavení e-mailů" ON public.email_prefs FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
REVOKE ALL ON public.email_prefs FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.email_prefs TO authenticated;

-- 2) Záznam odeslaných připomínek
CREATE TABLE public.email_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  meta JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX email_log_user_idx ON public.email_log (user_id, sent_at DESC);
ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Záznam e-mailů vidí správce" ON public.email_log FOR SELECT TO authenticated USING (public.is_admin());
REVOKE ALL ON public.email_log FROM anon, authenticated;
GRANT SELECT ON public.email_log TO authenticated;

-- 3) Odhlášení odkazem z e-mailu (bez přihlášení, jen se znalostí tokenu)
CREATE OR REPLACE FUNCTION public.unsubscribe_reminders(p_token UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.email_prefs SET reminders = false, updated_at = NOW() WHERE unsubscribe_token = p_token;
  RETURN FOUND;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.unsubscribe_reminders(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unsubscribe_reminders(UUID) TO anon, authenticated;

-- 4) Komu dnes poslat připomínku (jen pro serverovou funkci)
--    Pravidla: nejvýš 1 e-mail za 3 dny, jen potvrzený e-mail, ne správci, ne odhlášení.
--    Priorita: konec zkušebního přístupu > nezačatý Rentgen > rozdělaná cesta > 14 dní neaktivity.
CREATE OR REPLACE FUNCTION public.reminder_candidates(p_limit INT DEFAULT 200)
RETURNS TABLE (user_id UUID, email TEXT, name TEXT, kind TEXT, data JSONB, unsubscribe_token UUID)
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
  WITH u AS (
    SELECT au.id, au.email, au.created_at,
           NULLIF(trim(coalesce(au.raw_user_meta_data->>'first_name', au.raw_user_meta_data->>'name', '')), '') AS name,
           GREATEST(au.last_sign_in_at, (SELECT max(e.created_at) FROM public.events e WHERE e.user_id = au.id)) AS last_active
    FROM auth.users au
    WHERE au.email_confirmed_at IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = au.id)
      AND NOT EXISTS (SELECT 1 FROM public.email_prefs p WHERE p.user_id = au.id AND NOT p.reminders)
      AND NOT EXISTS (SELECT 1 FROM public.email_log l WHERE l.user_id = au.id AND l.sent_at > NOW() - INTERVAL '3 days')
  ),
  proj AS (
    SELECT DISTINCT ON (p.user_id) p.user_id, p.id AS project_id, p.name AS project_name,
      EXISTS (SELECT 1 FROM public.project_data d WHERE d.project_id = p.id AND d.data_key = 'diagnosis') AS has_diagnosis,
      COALESCE((SELECT jsonb_agg(DISTINCT (g #>> '{}')::int)
                  FROM public.project_data d, jsonb_array_elements(
                    CASE WHEN jsonb_typeof(d.data_value) = 'array' THEN d.data_value ELSE '[]'::jsonb END) g
                 WHERE d.project_id = p.id AND d.data_key = 'completed_phases'), '[]'::jsonb) AS gates
    FROM public.projects p
    WHERE p.archived_at IS NULL
    ORDER BY p.user_id, p.updated_at DESC NULLS LAST
  ),
  c AS (
    SELECT u.id, u.email, u.name, pr.project_name,
      COALESCE(jsonb_array_length(pr.gates), 0) AS done,
      (SELECT min(n) FROM generate_series(1, 7) n WHERE NOT COALESCE(pr.gates, '[]'::jsonb) @> to_jsonb(n)) AS next_gate,
      CASE
        WHEN ua.plan = 'trial' AND ua.access_until BETWEEN NOW() + INTERVAL '6 hours' AND NOW() + INTERVAL '36 hours'
             AND NOT EXISTS (SELECT 1 FROM public.email_log l WHERE l.user_id = u.id AND l.kind = 'trial_end'
                             AND l.sent_at > ua.access_until - INTERVAL '8 days')
          THEN 'trial_end'
        WHEN NOT COALESCE(pr.has_diagnosis, false) AND COALESCE(jsonb_array_length(pr.gates), 0) = 0
             AND u.created_at < NOW() - INTERVAL '1 day' AND u.created_at > NOW() - INTERVAL '14 days'
             AND NOT EXISTS (SELECT 1 FROM public.email_log l WHERE l.user_id = u.id AND l.kind = 'rentgen')
          THEN 'rentgen'
        WHEN (COALESCE(pr.has_diagnosis, false) OR COALESCE(jsonb_array_length(pr.gates), 0) > 0)
             AND COALESCE(jsonb_array_length(pr.gates), 0) < 7
             AND u.last_active < NOW() - INTERVAL '3 days' AND u.last_active > NOW() - INTERVAL '14 days'
             AND NOT EXISTS (SELECT 1 FROM public.email_log l WHERE l.user_id = u.id AND l.kind = 'gate'
                             AND l.sent_at > NOW() - INTERVAL '7 days')
          THEN 'gate'
        WHEN pr.project_name IS NOT NULL
             AND u.last_active < NOW() - INTERVAL '14 days' AND u.last_active > NOW() - INTERVAL '45 days'
             AND NOT EXISTS (SELECT 1 FROM public.email_log l WHERE l.user_id = u.id AND l.kind = 'inactive14'
                             AND l.sent_at > NOW() - INTERVAL '60 days')
          THEN 'inactive14'
      END AS kind,
      ua.access_until
    FROM u
    LEFT JOIN proj pr ON pr.user_id = u.id
    LEFT JOIN public.user_access ua ON ua.user_id = u.id
  )
  SELECT c.id, c.email, c.name, c.kind,
         jsonb_build_object('project', c.project_name, 'done', c.done, 'next_gate', c.next_gate, 'until', c.access_until),
         ep.unsubscribe_token
  FROM c
  LEFT JOIN public.email_prefs ep ON ep.user_id = c.id
  WHERE c.kind IS NOT NULL
  LIMIT p_limit;
$$;
REVOKE EXECUTE ON FUNCTION public.reminder_candidates(INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reminder_candidates(INT) TO service_role;

-- Zajistí řádek s tokenem pro odhlášení (volá serverová funkce před odesláním)
CREATE OR REPLACE FUNCTION public.ensure_email_prefs(p_user UUID)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  INSERT INTO public.email_prefs (user_id) VALUES (p_user) ON CONFLICT (user_id) DO NOTHING;
  SELECT unsubscribe_token FROM public.email_prefs WHERE user_id = p_user;
$$;
REVOKE EXECUTE ON FUNCTION public.ensure_email_prefs(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_email_prefs(UUID) TO service_role;

-- 5) Klíč pro denní spouštění (uložen ve Vault, nikde v kódu)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'reminders_cron_key') THEN
    PERFORM vault.create_secret(gen_random_uuid()::text || gen_random_uuid()::text, 'reminders_cron_key');
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.check_cron_key(p_key TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public, vault
AS $$
  SELECT EXISTS (SELECT 1 FROM vault.decrypted_secrets WHERE name = 'reminders_cron_key' AND decrypted_secret = p_key);
$$;
REVOKE EXECUTE ON FUNCTION public.check_cron_key(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_cron_key(TEXT) TO service_role;

-- 6) Přehled pro správce
CREATE OR REPLACE FUNCTION public.admin_reminder_stats(p_days INT DEFAULT 30)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Přístup jen pro správce' USING ERRCODE = '42501';
  END IF;
  RETURN jsonb_build_object(
    'days', p_days,
    'unsubscribed', (SELECT COUNT(*) FROM public.email_prefs WHERE NOT reminders),
    'kinds', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('kind', kind, 'sent', sent, 'returned', returned) ORDER BY kind)
      FROM (
        SELECT l.kind, COUNT(*) AS sent,
               COUNT(*) FILTER (WHERE EXISTS (
                 SELECT 1 FROM public.events e WHERE e.user_id = l.user_id
                   AND e.created_at BETWEEN l.sent_at AND l.sent_at + INTERVAL '3 days')) AS returned
        FROM public.email_log l
        WHERE l.sent_at > NOW() - make_interval(days => p_days)
        GROUP BY l.kind
      ) x
    ), '[]'::jsonb)
  );
END;
$$;
REVOKE EXECUTE ON FUNCTION public.admin_reminder_stats(INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_reminder_stats(INT) TO authenticated;

-- 7) Denní spuštění v 7:00 UTC (9:00 letního / 8:00 zimního času)
SELECT cron.schedule('pripominky-denne', '0 7 * * *', $cron$
  SELECT net.http_post(
    url := 'https://mpftsyraaozarfpnnzjn.supabase.co/functions/v1/reminders',
    headers := jsonb_build_object('content-type', 'application/json', 'x-cron-key',
      (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'reminders_cron_key')),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000);
$cron$);
