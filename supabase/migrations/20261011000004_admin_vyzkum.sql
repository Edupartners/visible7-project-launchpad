-- Správce: rozložení odpovědí z kvízu (demografie, typy, bariéry) a pseudonymizovaný export pro výzkum.
-- Export obsahuje jen uživatele s platným souhlasem „vyzkum“ a místo identity jen pseudonym.

CREATE OR REPLACE FUNCTION public.admin_quiz_stats()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Přístup jen pro správce' USING ERRCODE = '42501';
  END IF;

  WITH attempts AS (
    SELECT p.user_id, a.value AS attempt
    FROM public.project_data d
    JOIN public.projects p ON p.id = d.project_id
    CROSS JOIN LATERAL jsonb_array_elements(COALESCE(d.data_value->'attempts', '[]'::jsonb)) a(value)
    WHERE d.data_key = 'entrepreneur_quiz'
  ),
  latest AS (
    SELECT DISTINCT ON (user_id) user_id, attempt
    FROM attempts WHERE attempt->>'stage' = 'start'
    ORDER BY user_id, attempt->>'at' DESC
  ),
  dims AS (
    SELECT 'gender' AS dim, attempt->'answers'->>'gender' AS val FROM latest
    UNION ALL SELECT 'age', attempt->'answers'->>'age' FROM latest
    UNION ALL SELECT 'region', attempt->'answers'->>'region' FROM latest
    UNION ALL SELECT 'education', attempt->'answers'->>'education' FROM latest
    UNION ALL SELECT 'status', attempt->'answers'->>'status' FROM latest
    UNION ALL SELECT 'type', attempt->'result'->>'type' FROM latest
    UNION ALL SELECT 'barrier', attempt->'result'->>'barrier' FROM latest
  )
  SELECT jsonb_build_object(
    'respondents', (SELECT COUNT(*) FROM latest),
    'research_consents', (
      SELECT COUNT(*) FROM (
        SELECT DISTINCT ON (user_id) user_id, granted FROM public.consents
        WHERE kind = 'vyzkum' ORDER BY user_id, created_at DESC
      ) c WHERE c.granted
    ),
    'repeated', (SELECT COUNT(DISTINCT user_id) FROM attempts WHERE attempt->>'stage' <> 'start'),
    'dims', COALESCE((
      SELECT jsonb_object_agg(dim, vals) FROM (
        SELECT dim, jsonb_agg(jsonb_build_object('value', COALESCE(val, '—'), 'count', c) ORDER BY c DESC) AS vals
        FROM (SELECT dim, val, COUNT(*) AS c FROM dims GROUP BY dim, val) x
        GROUP BY dim
      ) y
    ), '{}'::jsonb)
  ) INTO result;
  RETURN result;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.admin_quiz_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_quiz_stats() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_research_export()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Přístup jen pro správce' USING ERRCODE = '42501';
  END IF;

  WITH consented AS (
    SELECT user_id FROM (
      SELECT DISTINCT ON (user_id) user_id, granted FROM public.consents
      WHERE kind = 'vyzkum' ORDER BY user_id, created_at DESC
    ) c WHERE c.granted
  ),
  rows AS (
    SELECT
      substr(md5(p.user_id::text || 'visible7-vyzkum'), 1, 12) AS respondent,
      a.value->>'stage' AS stage,
      (a.value->>'at')::date AS day,
      a.value->>'version' AS version,
      a.value->'answers' AS answers,
      a.value->'result' AS result,
      (SELECT COALESCE(jsonb_agg(DISTINCT (e #>> '{}')::int), '[]'::jsonb)
         FROM public.project_data cp, jsonb_array_elements(
           CASE WHEN jsonb_typeof(cp.data_value) = 'array' THEN cp.data_value ELSE '[]'::jsonb END) e
        WHERE cp.project_id = p.id AND cp.data_key = 'completed_phases') AS gates_done
    FROM public.project_data d
    JOIN public.projects p ON p.id = d.project_id
    JOIN consented c ON c.user_id = p.user_id
    CROSS JOIN LATERAL jsonb_array_elements(COALESCE(d.data_value->'attempts', '[]'::jsonb)) a(value)
    WHERE d.data_key = 'entrepreneur_quiz'
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(rows) ORDER BY respondent, stage), '[]'::jsonb) INTO result FROM rows;
  RETURN result;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.admin_research_export() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_research_export() TO authenticated;
