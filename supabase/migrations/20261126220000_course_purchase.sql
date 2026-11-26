-- Prodej jednotlivých kurzů přes SimpleShop.
-- Webhook podle ID produktu (app_settings.shop.courses) zapíše nákup s course_id.
-- apply_purchase pak místo členství odemkne jen ten kurz na shop.course_days dní.
-- Nákup před registrací čeká stejně jako u členství (trigger on_auth_user_created_purchases).

ALTER TABLE public.shop_purchases ADD COLUMN IF NOT EXISTS course_id TEXT
  CHECK (course_id IS NULL OR course_id ~ '^[a-z0-9_]{2,40}$');

CREATE TABLE public.course_access (
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  course_id TEXT NOT NULL CHECK (course_id ~ '^[a-z0-9_]{2,40}$'),
  access_until TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, course_id)
);
ALTER TABLE public.course_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Své kurzy vidí uživatel, všechny správce" ON public.course_access FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());
REVOKE ALL ON public.course_access FROM anon, authenticated;
GRANT SELECT ON public.course_access TO authenticated;

CREATE OR REPLACE FUNCTION public.apply_purchase(p_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_p public.shop_purchases%ROWTYPE;
  v_uid UUID;
  v_base TIMESTAMPTZ;
BEGIN
  SELECT * INTO v_p FROM public.shop_purchases WHERE id = p_id FOR UPDATE;
  IF NOT FOUND OR v_p.applied_at IS NOT NULL THEN
    RETURN false;
  END IF;
  SELECT id INTO v_uid FROM auth.users WHERE lower(email) = lower(trim(v_p.email)) LIMIT 1;
  IF v_uid IS NULL THEN
    RETURN false; -- počká na registraci
  END IF;

  IF v_p.course_id IS NOT NULL THEN
    -- Jeden kurz: prodlouží se od dnešního dne, nebo od konce dosavadního přístupu.
    INSERT INTO public.course_access (user_id, course_id, access_until)
    VALUES (v_uid, v_p.course_id, NOW() + make_interval(days => v_p.days))
    ON CONFLICT (user_id, course_id) DO UPDATE
      SET access_until = GREATEST(course_access.access_until, NOW()) + make_interval(days => v_p.days),
          updated_at = NOW();
  ELSE
    INSERT INTO public.user_access (user_id) VALUES (v_uid) ON CONFLICT (user_id) DO NOTHING;
    SELECT CASE WHEN public.is_paid(v_uid) AND access_until > NOW() THEN access_until ELSE NOW() END
      INTO v_base FROM public.user_access WHERE user_id = v_uid;
    UPDATE public.user_access
       SET plan = 'clenstvi',
           access_until = COALESCE(v_base, NOW()) + make_interval(days => v_p.days),
           updated_at = NOW()
     WHERE user_id = v_uid;
  END IF;

  UPDATE public.shop_purchases SET user_id = v_uid, applied_at = NOW() WHERE id = p_id;
  PERFORM public.log_event(v_uid, NULL, 'purchase',
    jsonb_build_object('days', v_p.days, 'total', v_p.total, 'course', v_p.course_id));
  RETURN true;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.apply_purchase(BIGINT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_purchase(BIGINT) TO service_role;
