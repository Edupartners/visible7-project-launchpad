-- Celkové osvědčení „Certifikovaný marketingový a projektový specialista“ (kind zamer) až po bránách 1–5.
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
    v_required := ARRAY[1, 2, 3, 4, 5];
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
