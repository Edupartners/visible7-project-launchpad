-- 1) Promo kódy: správce je zakládá v administraci, uživatel je uplatní v aplikaci.
--    Kód dává placený přístup (plán „kod“) na daný počet dní. Každý uživatel může kód použít jen jednou.
--    Kódy se do migrací NEPÍŠOU (repozitář je veřejný).

ALTER TABLE public.promo_codes ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.promo_codes TO authenticated;
CREATE POLICY "Promo kódy spravuje správce" ON public.promo_codes FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.promo_redemptions (
  code_id UUID NOT NULL REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (code_id, user_id)
);
ALTER TABLE public.promo_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Uplatnění vidí správce" ON public.promo_redemptions FOR SELECT TO authenticated USING (public.is_admin());
REVOKE ALL ON public.promo_redemptions FROM anon, authenticated;
GRANT SELECT ON public.promo_redemptions TO authenticated;

CREATE OR REPLACE FUNCTION public.redeem_promo(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_code TEXT := upper(trim(coalesce(p_code, '')));
  v_promo public.promo_codes%ROWTYPE;
  v_until TIMESTAMPTZ;
  v_base TIMESTAMPTZ;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Nejste přihlášeni.';
  END IF;
  -- Ochrana proti hádání kódů: nejvýš 10 neúspěšných pokusů za hodinu.
  IF (SELECT COUNT(*) FROM public.events
       WHERE user_id = v_uid AND name = 'promo_failed' AND created_at > NOW() - INTERVAL '1 hour') >= 10 THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Příliš mnoho pokusů. Zkuste to za hodinu.');
  END IF;

  SELECT * INTO v_promo FROM public.promo_codes WHERE code = v_code FOR UPDATE;
  IF NOT FOUND OR NOT v_promo.is_active THEN
    PERFORM public.log_event(v_uid, NULL, 'promo_failed', '{}'::jsonb);
    RETURN jsonb_build_object('status', 'error', 'message', 'Tento kód neznáme. Zkontrolujte, jestli je správně opsaný.');
  END IF;
  IF v_promo.expires_at IS NOT NULL AND v_promo.expires_at < NOW() THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Platnost kódu už skončila.');
  END IF;
  IF v_promo.max_uses IS NOT NULL AND v_promo.times_used >= v_promo.max_uses THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Kód už byl vyčerpán.');
  END IF;
  IF EXISTS (SELECT 1 FROM public.promo_redemptions WHERE code_id = v_promo.id AND user_id = v_uid) THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Tento kód jste už uplatnili.');
  END IF;

  INSERT INTO public.user_access (user_id) VALUES (v_uid) ON CONFLICT (user_id) DO NOTHING;
  -- Přístup se prodlužuje: od konce stávajícího placeného přístupu, jinak ode dneška.
  SELECT CASE WHEN public.is_paid(v_uid) AND access_until IS NOT NULL AND access_until > NOW()
              THEN access_until ELSE NOW() END
    INTO v_base FROM public.user_access WHERE user_id = v_uid;
  IF public.is_paid(v_uid) AND (SELECT access_until FROM public.user_access WHERE user_id = v_uid) IS NULL THEN
    -- Neomezený placený přístup necháváme beze změny.
    v_until := NULL;
  ELSE
    v_until := v_base + make_interval(days => v_promo.extends_access_days);
    UPDATE public.user_access
       SET plan = CASE WHEN plan IN ('mesic', 'ctvrtleti', 'rok') AND public.is_paid(v_uid) THEN plan ELSE 'kod' END,
           access_until = v_until,
           promo_code_used = v_code,
           updated_at = NOW()
     WHERE user_id = v_uid;
  END IF;

  INSERT INTO public.promo_redemptions (code_id, user_id) VALUES (v_promo.id, v_uid);
  UPDATE public.promo_codes SET times_used = times_used + 1 WHERE id = v_promo.id;
  PERFORM public.log_event(v_uid, NULL, 'promo_redeemed', jsonb_build_object('days', v_promo.extends_access_days));
  RETURN jsonb_build_object('status', 'ok', 'until', v_until, 'days', v_promo.extends_access_days);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.redeem_promo(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_promo(TEXT) TO authenticated;

-- 2) Štítky uživatelů (jen pro správce): vlastní označení, filtrování a export.
CREATE TABLE public.user_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE CHECK (char_length(name) BETWEEN 1 AND 40),
  color TEXT NOT NULL DEFAULT 'slate' CHECK (color IN ('slate', 'blue', 'green', 'orange', 'red', 'purple')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE public.user_tag_links (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.user_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, tag_id)
);
ALTER TABLE public.user_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tag_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Štítky spravuje správce" ON public.user_tags FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Přiřazení štítků spravuje správce" ON public.user_tag_links FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
REVOKE ALL ON public.user_tags, public.user_tag_links FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_tags, public.user_tag_links TO authenticated;
