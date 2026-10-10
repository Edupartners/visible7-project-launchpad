-- Administrace: přehled uživatelů, projektů a postupu branami pro provozovatele.
-- Správce se přidává ručně (INSERT INTO public.admins (user_id) VALUES ('…')) mimo repozitář,
-- aby v kódu nebyly osobní údaje. Data čte jen funkce admin_overview(), která ověří roli.

CREATE TABLE public.admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Správce vidí svůj záznam" ON public.admins
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
REVOKE ALL ON public.admins FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.admins FROM authenticated;
GRANT SELECT ON public.admins TO authenticated;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid());
$$;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Celý přehled jedním voláním. Obsah projektů (texty, čísla) nevrací – jen metadata a postup.
CREATE OR REPLACE FUNCTION public.admin_overview()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER SET search_path = public, auth
AS $$
DECLARE
  result JSONB;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Přístup jen pro správce' USING ERRCODE = '42501';
  END IF;

  WITH proj AS (
    SELECT
      p.id,
      p.user_id,
      p.name,
      p.business_type,
      p.created_at,
      p.archived_at,
      GREATEST(p.updated_at, COALESCE((SELECT MAX(d.updated_at) FROM public.project_data d WHERE d.project_id = p.id), p.updated_at)) AS last_activity,
      COALESCE((
        SELECT jsonb_agg(DISTINCT e::int ORDER BY e::int)
        FROM public.project_data d, jsonb_array_elements_text(
          CASE WHEN jsonb_typeof(d.data_value) = 'array' THEN d.data_value ELSE '[]'::jsonb END
        ) e
        WHERE d.project_id = p.id AND d.data_key = 'completed_phases' AND e ~ '^[1-7]$'
      ), '[]'::jsonb) AS gates,
      EXISTS (SELECT 1 FROM public.project_data d WHERE d.project_id = p.id AND d.data_key = 'diagnosis') AS has_diagnosis,
      (SELECT COUNT(*) FROM public.certificates c WHERE c.project_id = p.id) AS certificates,
      (SELECT COUNT(*) FROM public.ai_outputs a WHERE a.project_id = p.id) AS ai_calls
    FROM public.projects p
  ),
  usr AS (
    SELECT
      u.id,
      u.email,
      u.created_at,
      u.last_sign_in_at,
      u.email_confirmed_at IS NOT NULL AS confirmed,
      NULLIF(TRIM(CONCAT_WS(' ', u.raw_user_meta_data ->> 'first_name', u.raw_user_meta_data ->> 'last_name')), '') AS name,
      u.raw_user_meta_data ->> 'phone' AS phone,
      COALESCE(ua.plan, 'free') AS plan,
      ua.access_until,
      ua.promo_code_used,
      (SELECT c.granted FROM public.consents c WHERE c.user_id = u.id AND c.kind = 'klub' ORDER BY c.created_at DESC LIMIT 1) AS klub,
      (SELECT c.granted FROM public.consents c WHERE c.user_id = u.id AND c.kind = 'marketing' ORDER BY c.created_at DESC LIMIT 1) AS marketing,
      EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = u.id) AS is_admin
    FROM auth.users u
    LEFT JOIN public.user_access ua ON ua.user_id = u.id
  )
  SELECT jsonb_build_object(
    'generated_at', NOW(),
    'users', COALESCE((
      SELECT jsonb_agg(
        to_jsonb(usr) || jsonb_build_object(
          'paid', usr.plan <> 'free' AND (usr.access_until IS NULL OR usr.access_until > NOW()),
          'projects', COALESCE((
            SELECT jsonb_agg(to_jsonb(proj) - 'user_id' ORDER BY proj.last_activity DESC)
            FROM proj WHERE proj.user_id = usr.id
          ), '[]'::jsonb)
        )
        ORDER BY usr.created_at DESC
      )
      FROM usr
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.admin_overview() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_overview() TO authenticated;
