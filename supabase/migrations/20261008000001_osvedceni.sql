-- ============================================================================
-- Osvědčení (certifikáty) za fáze, celkové osvědčení (fáze 1–4) a Gold (1–7 + spuštěný projekt).
-- Vydává je jen serverová funkce issue_certificate, která ověří splněné fáze.
-- Ověření pravosti je veřejné přes verify_certificate(kód).
-- ============================================================================

CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('phase', 'zamer', 'gold')),
  phase INTEGER CHECK (phase BETWEEN 1 AND 7),
  holder_name TEXT NOT NULL CHECK (char_length(holder_name) BETWEEN 3 AND 120),
  project_name TEXT NOT NULL,
  launch_url TEXT,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((kind = 'phase') = (phase IS NOT NULL))
);
CREATE UNIQUE INDEX certificates_unique_per_project
  ON public.certificates (project_id, kind, COALESCE(phase, 0));
CREATE INDEX idx_certificates_user ON public.certificates(user_id);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vlastník vidí svá osvědčení" ON public.certificates
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
REVOKE ALL ON public.certificates FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.certificates FROM authenticated;

-- Vydání osvědčení. Vrací kód (existující, pokud už bylo vydáno).
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

  INSERT INTO certificates (code, user_id, project_id, kind, phase, holder_name, project_name, launch_url)
  VALUES (v_code, v_uid, p_project_id, p_kind, CASE WHEN p_kind = 'phase' THEN p_phase END, v_name, v_project.name,
          CASE WHEN p_kind = 'gold' THEN v_url END);

  RETURN v_code;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.issue_certificate(UUID, TEXT, INTEGER, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.issue_certificate(UUID, TEXT, INTEGER, TEXT, TEXT) TO authenticated;

-- Veřejné ověření pravosti podle kódu (jen údaje, které jsou na osvědčení).
CREATE OR REPLACE FUNCTION public.verify_certificate(p_code TEXT)
RETURNS TABLE (code TEXT, kind TEXT, phase INTEGER, holder_name TEXT, project_name TEXT, launch_url TEXT, issued_at TIMESTAMPTZ)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.code, c.kind, c.phase, c.holder_name, c.project_name, c.launch_url, c.issued_at
    FROM certificates c
   WHERE c.code = upper(btrim(p_code));
$$;
REVOKE EXECUTE ON FUNCTION public.verify_certificate(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_certificate(TEXT) TO anon, authenticated;
