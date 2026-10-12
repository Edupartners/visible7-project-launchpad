-- Platby přes SimpleShop: po zaplacení zavolá SimpleShop webhook (funkce simpleshop),
-- ta dá kupujícímu placené členství (plán „clenstvi“) na nastavený počet dní.
-- Když kupující ještě nemá účet, nákup počká a uplatní se při registraci se stejným e-mailem.

-- 1) Nový placený plán
ALTER TABLE public.user_access DROP CONSTRAINT IF EXISTS user_access_plan_check;
ALTER TABLE public.user_access ADD CONSTRAINT user_access_plan_check
  CHECK (plan IN ('free', 'trial', 'mesic', 'ctvrtleti', 'rok', 'kod', 'clenstvi'));

CREATE OR REPLACE FUNCTION public.is_paid(p_user UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_access
    WHERE user_id = p_user AND plan IN ('mesic', 'ctvrtleti', 'rok', 'kod', 'clenstvi')
      AND (access_until IS NULL OR access_until > NOW())
  );
$$;

-- 2) Nastavení prodeje (cena a odkaz na objednávku mění správce v administraci)
INSERT INTO public.app_settings (key, value) VALUES
  ('shop', jsonb_build_object(
     'price', 2990, 'months', 6, 'days', 183, 'checkout_url', '',
     'anchor', 'Kurz Specialista internetového obchodu s lektorem stojí 49 000 Kč.'))
ON CONFLICT (key) DO NOTHING;

GRANT UPDATE ON public.app_settings TO authenticated;
CREATE POLICY "Nastavení mění správce" ON public.app_settings FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 3) Nákupy
CREATE TABLE public.shop_purchases (
  id BIGSERIAL PRIMARY KEY,
  doc_id TEXT UNIQUE,
  email TEXT NOT NULL,
  id_product TEXT,
  days INT NOT NULL,
  total NUMERIC,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  applied_at TIMESTAMPTZ,
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX shop_purchases_email_idx ON public.shop_purchases (lower(email)) WHERE applied_at IS NULL;
ALTER TABLE public.shop_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Nákupy vidí správce" ON public.shop_purchases FOR SELECT TO authenticated USING (public.is_admin());
REVOKE ALL ON public.shop_purchases FROM anon, authenticated;
GRANT SELECT ON public.shop_purchases TO authenticated;

-- Připíše nákup uživateli: prodlouží placený přístup od jeho konce, jinak ode dneška.
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

  INSERT INTO public.user_access (user_id) VALUES (v_uid) ON CONFLICT (user_id) DO NOTHING;
  SELECT CASE WHEN public.is_paid(v_uid) AND access_until > NOW() THEN access_until ELSE NOW() END
    INTO v_base FROM public.user_access WHERE user_id = v_uid;
  UPDATE public.user_access
     SET plan = 'clenstvi',
         access_until = COALESCE(v_base, NOW()) + make_interval(days => v_p.days),
         updated_at = NOW()
   WHERE user_id = v_uid;
  UPDATE public.shop_purchases SET user_id = v_uid, applied_at = NOW() WHERE id = p_id;
  PERFORM public.log_event(v_uid, NULL, 'purchase', jsonb_build_object('days', v_p.days, 'total', v_p.total));
  RETURN true;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.apply_purchase(BIGINT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_purchase(BIGINT) TO service_role;

-- Nákup před registrací: uplatní se, jakmile vznikne účet se stejným e-mailem.
CREATE OR REPLACE FUNCTION public.apply_pending_purchases()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.shop_purchases
            WHERE applied_at IS NULL AND lower(email) = lower(NEW.email) ORDER BY id LOOP
    PERFORM public.apply_purchase(r.id);
  END LOOP;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.apply_pending_purchases() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER on_auth_user_created_purchases AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.apply_pending_purchases();

-- 4) Tajný klíč webhooku (ve Vault) a adresa pro správce
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'simpleshop_key') THEN
    PERFORM vault.create_secret(replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''), 'simpleshop_key');
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.check_shop_key(p_key TEXT)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, vault AS $$
  SELECT EXISTS (SELECT 1 FROM vault.decrypted_secrets WHERE name = 'simpleshop_key' AND decrypted_secret = p_key);
$$;
REVOKE EXECUTE ON FUNCTION public.check_shop_key(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_shop_key(TEXT) TO service_role;

CREATE OR REPLACE FUNCTION public.admin_shop_webhook_url()
RETURNS TEXT LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, vault AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Přístup jen pro správce' USING ERRCODE = '42501';
  END IF;
  RETURN 'https://mpftsyraaozarfpnnzjn.supabase.co/functions/v1/simpleshop?key='
    || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'simpleshop_key')
    || '&mail={mail}&product={id_product}&doc={id}&total={total}';
END;
$$;
REVOKE EXECUTE ON FUNCTION public.admin_shop_webhook_url() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_shop_webhook_url() TO authenticated;
