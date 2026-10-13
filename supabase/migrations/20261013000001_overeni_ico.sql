-- ============================================================================
-- Ověření IČO projektu v registru ARES (Ministerstvo financí).
-- Zapisuje jen edge funkce `ares` (service role) po ověření na serveru,
-- uživatel může svůj záznam jen číst. Ukládáme jen veřejné údaje z ARES
-- (IČO, název, právní forma, datum vzniku) – adresu ani jiné osobní údaje ne.
-- Osvědčení Gold nově vyžaduje ověřené IČO a IČO se na něm zobrazí.
-- ============================================================================

CREATE TABLE public.business_verifications (
  project_id UUID PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ico TEXT NOT NULL CHECK (ico ~ '^[0-9]{8}$'),
  name TEXT NOT NULL,
  legal_form TEXT,
  established DATE,
  name_match BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_business_verifications_user ON public.business_verifications(user_id);

ALTER TABLE public.business_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vlastník vidí ověření svého projektu" ON public.business_verifications
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
REVOKE ALL ON public.business_verifications FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.business_verifications FROM authenticated;

-- IČO na osvědčení (jen Gold)
ALTER TABLE public.certificates ADD COLUMN ico TEXT;

-- Vydání osvědčení: Gold nově jen s ověřeným IČO.
CREATE OR REPLACE FUNCTION public.issue_certificate(
  p_project_id UUID,
  p_kind TEXT,
  p_phase INTEGER,
  p_holder_name TEXT,
  p_launch_url TEXT DEFAULT NULL
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_project RECORD;
  v_done INTEGER[];
  v_required INTEGER[];
  v_code TEXT;
  v_name TEXT := btrim(p_holder_name);
  v_url TEXT := NULLIF(btrim(COALESCE(p_launch_url, '')), '');
  v_ico TEXT;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Nejste přihlášeni.';
  END IF;

  SELECT id, name INTO v_project FROM projects WHERE id = p_project_id AND user_id = v_uid;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Projekt nenalezen.';
  END IF;

  IF char_length(COALESCE(v_name, '')) < 3 THEN
    RAISE EXCEPTION 'Zadejte celé jméno.';
  END IF;

  SELECT COALESCE(array_agg(DISTINCT x::INTEGER), '{}')
    INTO v_done
    FROM project_data d,
         jsonb_array_elements_text(CASE WHEN jsonb_typeof(d.data_value) = 'array' THEN d.data_value ELSE '[]'::jsonb END) AS x
   WHERE d.project_id = p_project_id
     AND d.data_key = 'completed_phases'
     AND x ~ '^[0-9]+$';

  IF p_kind = 'phase' THEN
    IF p_phase IS NULL OR p_phase NOT BETWEEN 1 AND 7 THEN
      RAISE EXCEPTION 'Neplatná fáze.';
    END IF;
    v_required := ARRAY[p_phase];
  ELSIF p_kind = 'zamer' THEN
    v_required := ARRAY[1, 2, 3, 4];
  ELSIF p_kind = 'gold' THEN
    v_required := ARRAY[1, 2, 3, 4, 5, 6, 7];
    IF v_url IS NULL OR v_url !~* '^https?://[^ ]+\.[^ ]+' THEN
      RAISE EXCEPTION 'Pro Gold je potřeba odkaz na spuštěný projekt.';
    END IF;
    SELECT ico INTO v_ico FROM business_verifications WHERE project_id = p_project_id AND user_id = v_uid;
    IF v_ico IS NULL THEN
      RAISE EXCEPTION 'Pro Gold je potřeba ověřené IČO. Ověříte ho na kartě Založte živnost online.';
    END IF;
  ELSE
    RAISE EXCEPTION 'Neplatný typ osvědčení.';
  END IF;

  IF NOT (v_done @> v_required) THEN
    RAISE EXCEPTION 'Nejsou dokončené všechny potřebné fáze.';
  END IF;

  SELECT code INTO v_code FROM certificates
   WHERE project_id = p_project_id AND kind = p_kind AND COALESCE(phase, 0) = COALESCE(CASE WHEN p_kind = 'phase' THEN p_phase END, 0);
  IF FOUND THEN
    RETURN v_code;
  END IF;

  LOOP
    v_code := 'V7-' || upper(substr(md5(gen_random_uuid()::text), 1, 4)) || '-' || upper(substr(md5(gen_random_uuid()::text), 1, 4));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM certificates WHERE code = v_code);
  END LOOP;

  INSERT INTO certificates (code, user_id, project_id, kind, phase, holder_name, project_name, launch_url, ico)
  VALUES (v_code, v_uid, p_project_id, p_kind, CASE WHEN p_kind = 'phase' THEN p_phase END, v_name, v_project.name,
          CASE WHEN p_kind = 'gold' THEN v_url END, CASE WHEN p_kind = 'gold' THEN v_ico END);

  RETURN v_code;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.issue_certificate(UUID, TEXT, INTEGER, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.issue_certificate(UUID, TEXT, INTEGER, TEXT, TEXT) TO authenticated;

-- Veřejné ověření pravosti – nově i s IČO (jen u Gold).
DROP FUNCTION public.verify_certificate(TEXT);
CREATE FUNCTION public.verify_certificate(p_code TEXT)
RETURNS TABLE (code TEXT, kind TEXT, phase INTEGER, holder_name TEXT, project_name TEXT, launch_url TEXT, issued_at TIMESTAMPTZ, ico TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.code, c.kind, c.phase, c.holder_name, c.project_name, c.launch_url, c.issued_at, c.ico
    FROM certificates c
   WHERE c.code = upper(btrim(p_code));
$$;
REVOKE EXECUTE ON FUNCTION public.verify_certificate(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_certificate(TEXT) TO anon, authenticated;

-- Pro správce: kolik projektů má ověřenou firmu (souhrnně, bez osobních údajů).
CREATE OR REPLACE FUNCTION public.admin_business_stats()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Jen pro správce';
  END IF;
  RETURN jsonb_build_object(
    'verified', (SELECT count(*) FROM business_verifications),
    'verified_users', (SELECT count(DISTINCT user_id) FROM business_verifications),
    'new_since_verification', (SELECT count(*) FROM business_verifications b
                                 JOIN projects p ON p.id = b.project_id
                                WHERE b.established >= p.created_at::date),
    'by_form', COALESCE((SELECT jsonb_object_agg(f, n) FROM (
        SELECT COALESCE(legal_form, '?') AS f, count(*) AS n FROM business_verifications GROUP BY 1) t), '{}'::jsonb)
  );
END;
$$;
REVOKE EXECUTE ON FUNCTION public.admin_business_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_business_stats() TO authenticated;
