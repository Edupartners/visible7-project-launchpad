-- Bonusy: samostatné videokurzy mimo brány (první: AI Act). Videa jsou v block_videos pod klíčem "bonus:<id>".
-- Osvědčení za bonus patří uživateli, ne projektu, a vydá se jen tomu, kdo má zhlédnutá všechna videa bonusu.

ALTER TABLE public.certificates ADD COLUMN bonus_key TEXT CHECK (bonus_key IS NULL OR bonus_key ~ '^[a-z0-9_]{2,40}$');
ALTER TABLE public.certificates ALTER COLUMN project_id DROP NOT NULL;
ALTER TABLE public.certificates DROP CONSTRAINT certificates_kind_check;
ALTER TABLE public.certificates ADD CONSTRAINT certificates_kind_check
  CHECK (kind = ANY (ARRAY['phase'::text, 'zamer'::text, 'gold'::text, 'bonus'::text]));
ALTER TABLE public.certificates ADD CONSTRAINT certificates_bonus_check
  CHECK ((kind = 'bonus') = (bonus_key IS NOT NULL) AND (kind = 'bonus' OR project_id IS NOT NULL));
CREATE UNIQUE INDEX certificates_unique_bonus ON public.certificates (user_id, bonus_key) WHERE kind = 'bonus';

CREATE OR REPLACE FUNCTION public.issue_bonus_certificate(p_bonus TEXT, p_holder_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_name TEXT := btrim(COALESCE(p_holder_name, ''));
  v_key TEXT := 'bonus:' || COALESCE(p_bonus, '');
  v_total INTEGER;
  v_seen INTEGER;
  v_code TEXT;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Nejste přihlášeni.';
  END IF;
  IF p_bonus IS NULL OR p_bonus !~ '^[a-z0-9_]{2,40}$' THEN
    RAISE EXCEPTION 'Neplatný bonus.';
  END IF;
  IF char_length(v_name) < 3 THEN
    RAISE EXCEPTION 'Zadejte celé jméno.';
  END IF;

  SELECT count(*) INTO v_total FROM block_videos WHERE block_key = v_key AND published;
  SELECT count(*) INTO v_seen
    FROM block_videos v JOIN block_video_views w ON w.video_id = v.id AND w.user_id = v_uid
   WHERE v.block_key = v_key AND v.published;
  IF v_total = 0 THEN
    RAISE EXCEPTION 'Bonus zatím nemá žádná videa.';
  END IF;
  IF v_seen < v_total THEN
    RAISE EXCEPTION 'Nejdřív zhlédněte všechna videa (% z %).', v_seen, v_total;
  END IF;

  SELECT code INTO v_code FROM certificates WHERE user_id = v_uid AND kind = 'bonus' AND bonus_key = p_bonus;
  IF FOUND THEN
    RETURN v_code;
  END IF;

  LOOP
    v_code := 'V7-' || upper(substr(md5(gen_random_uuid()::text), 1, 4)) || '-' || upper(substr(md5(gen_random_uuid()::text), 1, 4));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM certificates WHERE code = v_code);
  END LOOP;

  INSERT INTO certificates (code, user_id, project_id, kind, phase, holder_name, project_name, bonus_key)
  VALUES (v_code, v_uid, NULL, 'bonus', NULL, v_name, '', p_bonus);
  RETURN v_code;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.issue_bonus_certificate(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.issue_bonus_certificate(TEXT, TEXT) TO authenticated;

-- Ověření osvědčení vrací i bonus_key (změna návratového typu = nová funkce).
DROP FUNCTION public.verify_certificate(TEXT);
CREATE FUNCTION public.verify_certificate(p_code TEXT)
RETURNS TABLE(code TEXT, kind TEXT, phase INTEGER, holder_name TEXT, project_name TEXT, launch_url TEXT,
              issued_at TIMESTAMPTZ, ico TEXT, bonus_key TEXT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT c.code, c.kind, c.phase, c.holder_name, c.project_name, c.launch_url, c.issued_at, c.ico, c.bonus_key
    FROM certificates c
   WHERE c.code = upper(btrim(p_code));
$$;
GRANT EXECUTE ON FUNCTION public.verify_certificate(TEXT) TO anon, authenticated;
