-- Osvědčení o absolvování kurzu (e-learning). Samoplátci se hlásí na kurz, ne na bránu.
-- Kurz = několik karet s videi (block_key). Osvědčení patří uživateli (bez projektu) a vydá se,
-- jen když má člověk zhlédnuté všechny kapitoly kurzu. Stejná kapitola ve dvou kartách (stejné
-- Vimeo video a časy) se počítá jednou, stačí ji vidět v kterékoli z nich.
-- Klíč kurzu se ukládá do sloupce bonus_key (stejný formát jako u bonusů).

ALTER TABLE public.certificates DROP CONSTRAINT certificates_kind_check;
ALTER TABLE public.certificates ADD CONSTRAINT certificates_kind_check
  CHECK (kind = ANY (ARRAY['phase'::text, 'zamer'::text, 'gold'::text, 'bonus'::text, 'course'::text]));
ALTER TABLE public.certificates DROP CONSTRAINT certificates_bonus_check;
ALTER TABLE public.certificates ADD CONSTRAINT certificates_bonus_check
  CHECK ((kind IN ('bonus', 'course')) = (bonus_key IS NOT NULL) AND (kind IN ('bonus', 'course') OR project_id IS NOT NULL));
CREATE UNIQUE INDEX certificates_unique_course ON public.certificates (user_id, bonus_key) WHERE kind = 'course';

-- Které karty patří ke kurzu (shodně s FEATURED_COURSES v src/lib/courses.ts).
CREATE TABLE public.course_blocks (
  course_id TEXT PRIMARY KEY CHECK (course_id ~ '^[a-z0-9_]{2,40}$'),
  block_keys TEXT[] NOT NULL
);
ALTER TABLE public.course_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY course_blocks_read ON public.course_blocks FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.course_blocks (course_id, block_keys) VALUES
  ('web', ARRAY['tvorba:domena','tvorba:hosting','tvorba:vzhled','tvorba:woo','tvorba:clanky','tvorba:poptavka','tvorba:pravni','tvorba:kurz']),
  ('shoptet', ARRAY['tvorba:shoptet','tvorba:produkty','tvorba:platby']),
  ('copy', ARRAY['tvorba:texty','tvorba:prodejni','marketing:texty']),
  ('affiliate', ARRAY['tvorba:affiliate','marketing:affiliate_program']),
  ('ppc', ARRAY['marketing:google_klic','marketing:google_kampan','marketing:sklik_kampan']),
  ('meta', ARRAY['marketing:meta_strategie','marketing:meta_ucet','marketing:meta_kreativy','marketing:meta_kampan']),
  ('seo', ARRAY['marketing:seo_zaklad','marketing:seo_obsah']),
  ('znacka', ARRAY['start:znacka']),
  ('data', ARRAY['rust:data']),
  ('ga4', ARRAY['tvorba:mereni','marketing:mereni']);

CREATE OR REPLACE FUNCTION public.issue_course_certificate(p_course TEXT, p_holder_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_name TEXT := btrim(COALESCE(p_holder_name, ''));
  v_keys TEXT[];
  v_total INTEGER;
  v_seen INTEGER;
  v_code TEXT;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Nejste přihlášeni.';
  END IF;
  SELECT block_keys INTO v_keys FROM course_blocks WHERE course_id = p_course;
  IF v_keys IS NULL THEN
    RAISE EXCEPTION 'Neznámý kurz.';
  END IF;
  IF char_length(v_name) < 3 THEN
    RAISE EXCEPTION 'Zadejte celé jméno.';
  END IF;

  SELECT count(DISTINCT v.vimeo_id || ':' || COALESCE(v.start_sec::text, '') || ':' || COALESCE(v.end_sec::text, ''))
    INTO v_total
    FROM block_videos v
   WHERE v.block_key = ANY (v_keys) AND v.published;
  -- Kapitola je zhlédnutá, když ji člověk viděl v kterékoli kartě: dopočítáme přes podpis.
  WITH seg AS (
    SELECT v.id, v.vimeo_id || ':' || COALESCE(v.start_sec::text, '') || ':' || COALESCE(v.end_sec::text, '') AS sig
      FROM block_videos v
     WHERE v.block_key = ANY (v_keys) AND v.published
  )
  SELECT count(DISTINCT s.sig) INTO v_seen
    FROM seg s
   WHERE EXISTS (
     SELECT 1 FROM block_videos o JOIN block_video_views w ON w.video_id = o.id AND w.user_id = v_uid
      WHERE o.vimeo_id || ':' || COALESCE(o.start_sec::text, '') || ':' || COALESCE(o.end_sec::text, '') = s.sig);

  IF v_total = 0 THEN
    RAISE EXCEPTION 'Kurz zatím nemá žádná videa.';
  END IF;
  IF v_seen < v_total THEN
    RAISE EXCEPTION 'Nejdřív zhlédněte všechny lekce (% z %).', v_seen, v_total;
  END IF;

  SELECT code INTO v_code FROM certificates WHERE user_id = v_uid AND kind = 'course' AND bonus_key = p_course;
  IF FOUND THEN
    RETURN v_code;
  END IF;

  LOOP
    v_code := 'V7-' || upper(substr(md5(gen_random_uuid()::text), 1, 4)) || '-' || upper(substr(md5(gen_random_uuid()::text), 1, 4));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM certificates WHERE code = v_code);
  END LOOP;

  INSERT INTO certificates (code, user_id, project_id, kind, phase, holder_name, project_name, bonus_key)
  VALUES (v_code, v_uid, NULL, 'course', NULL, v_name, '', p_course);
  RETURN v_code;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.issue_course_certificate(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.issue_course_certificate(TEXT, TEXT) TO authenticated;
