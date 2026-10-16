-- Startovací cena pro prvních N členů: počítadlo volných míst na úvodní stránce.
-- Nastavení v app_settings.founder_offer: {"seats": 50, "next_price": 5990, "since": "2026-10-16"}
-- Počítají se nákupy ze SimpleShopu od data "since" (starší testovací objednávky se nepočítají).

INSERT INTO public.app_settings (key, value)
VALUES ('founder_offer', '{"seats": 50, "next_price": 5990, "since": "2026-10-16"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.founder_offer()
RETURNS JSONB
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  WITH s AS (
    SELECT COALESCE((SELECT value FROM app_settings WHERE key = 'founder_offer'), '{}'::jsonb) AS v
  ), sold AS (
    SELECT COUNT(*)::int AS n
    FROM shop_purchases, s
    WHERE created_at >= COALESCE((s.v->>'since')::date, '2026-10-16'::date)
      AND doc_id NOT LIKE 'TEST%'
  )
  SELECT jsonb_build_object(
    'seats', COALESCE((s.v->>'seats')::int, 50),
    'left', GREATEST(COALESCE((s.v->>'seats')::int, 50) - sold.n, 0),
    'next_price', COALESCE((s.v->>'next_price')::int, 5990)
  )
  FROM s, sold;
$$;
REVOKE EXECUTE ON FUNCTION public.founder_offer() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.founder_offer() TO anon, authenticated;
