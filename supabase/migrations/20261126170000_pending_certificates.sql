-- Převod osvědčení z původní e-learningové platformy (LearnWorlds).
-- Osvědčení čeká podle e-mailu a vystaví se, jakmile má člověk účet (hned, nebo při registraci).
-- Kód osvědčení je nový (V7-…), jméno a kurz jsou převzaté.

CREATE TABLE public.pending_certificates (
  id BIGSERIAL PRIMARY KEY,
  source_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('bonus', 'course')),
  bonus_key TEXT NOT NULL CHECK (bonus_key ~ '^[a-z0-9_]{2,40}$'),
  holder_name TEXT NOT NULL CHECK (char_length(holder_name) BETWEEN 3 AND 120),
  certificate_code TEXT,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX pending_certificates_email_idx ON public.pending_certificates (lower(email)) WHERE applied_at IS NULL;
ALTER TABLE public.pending_certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Převedená osvědčení vidí správce" ON public.pending_certificates FOR SELECT TO authenticated
  USING (public.is_admin());
REVOKE ALL ON public.pending_certificates FROM anon, authenticated;
GRANT SELECT ON public.pending_certificates TO authenticated;

-- Vystaví čekající osvědčení uživateli s daným e-mailem. Když už stejné osvědčení má, jen ho připíše.
CREATE OR REPLACE FUNCTION public.apply_pending_certificates(p_user UUID, p_email TEXT)
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  r RECORD;
  v_code TEXT;
  v_n INTEGER := 0;
BEGIN
  FOR r IN SELECT * FROM pending_certificates
            WHERE applied_at IS NULL AND lower(email) = lower(btrim(p_email)) ORDER BY id FOR UPDATE LOOP
    SELECT code INTO v_code FROM certificates
     WHERE user_id = p_user AND kind = r.kind AND bonus_key = r.bonus_key;
    IF NOT FOUND THEN
      LOOP
        v_code := 'V7-' || upper(substr(md5(gen_random_uuid()::text), 1, 4)) || '-' || upper(substr(md5(gen_random_uuid()::text), 1, 4));
        EXIT WHEN NOT EXISTS (SELECT 1 FROM certificates WHERE code = v_code);
      END LOOP;
      INSERT INTO certificates (code, user_id, project_id, kind, phase, holder_name, project_name, bonus_key)
      VALUES (v_code, p_user, NULL, r.kind, NULL, r.holder_name, '', r.bonus_key);
    END IF;
    UPDATE pending_certificates SET applied_at = NOW(), certificate_code = v_code WHERE id = r.id;
    v_n := v_n + 1;
  END LOOP;
  RETURN v_n;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.apply_pending_certificates(UUID, TEXT) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.apply_pending_certificates_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Chyba při převodu osvědčení nesmí zablokovat registraci.
  BEGIN
    PERFORM public.apply_pending_certificates(NEW.id, NEW.email);
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'apply_pending_certificates: %', SQLERRM;
  END;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.apply_pending_certificates_on_signup() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER on_auth_user_created_certificates AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.apply_pending_certificates_on_signup();
