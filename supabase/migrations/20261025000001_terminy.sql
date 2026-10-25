-- Termíny podnikatele: připomínky e-mailem 7 dní předem (zdarma pro všechny).
-- Termíny spravuje správce v administraci. E-mail se posílá jen u termínů označených „ověřeno“.
-- Připomínka termínu je obecná informace, ne daňové poradenství; v e-mailu je odkaz na zdroj.

-- 1) Profil podnikatele: forma podnikání a plátcovství DPH (určuje, které termíny se ho týkají)
CREATE TABLE public.business_profile (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  form TEXT NOT NULL DEFAULT 'nezacal' CHECK (form IN ('nezacal', 'osvc_bezny', 'osvc_pausal', 'sro')),
  dph BOOLEAN NOT NULL DEFAULT false,
  deadline_reminders BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.business_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vlastní profil podnikatele" ON public.business_profile FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
REVOKE ALL ON public.business_profile FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.business_profile TO authenticated;

-- 2) Termíny (veřejné informace, upravuje jen správce)
CREATE TABLE public.deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  due_date DATE NOT NULL,
  audience TEXT[] NOT NULL,
  url TEXT,
  source_url TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX deadlines_due_idx ON public.deadlines (due_date);
ALTER TABLE public.deadlines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Termíny čte každý" ON public.deadlines FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Termíny spravuje správce" ON public.deadlines FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
GRANT SELECT ON public.deadlines TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deadlines TO authenticated;

-- 3) Splněné termíny uživatele
CREATE TABLE public.deadline_done (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  deadline_id UUID NOT NULL REFERENCES public.deadlines(id) ON DELETE CASCADE,
  done_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, deadline_id)
);
ALTER TABLE public.deadline_done ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vlastní splněné termíny" ON public.deadline_done FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
REVOKE ALL ON public.deadline_done FROM anon;
GRANT SELECT, INSERT, DELETE ON public.deadline_done TO authenticated;

-- 4) Komu poslat připomínku termínu (jen pro serverovou funkci).
--    Ověřené termíny v příštích 7 dnech, které se uživatele týkají, nejsou splněné a ještě o nich nepsal e-mail.
CREATE OR REPLACE FUNCTION public.deadline_candidates(p_limit INT DEFAULT 300)
RETURNS TABLE (user_id UUID, email TEXT, unsubscribe_token UUID, items JSONB)
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
  WITH today AS (SELECT (NOW() AT TIME ZONE 'Europe/Prague')::date AS d),
  prof AS (
    SELECT bp.user_id, au.email,
           ARRAY[bp.form] || CASE WHEN bp.dph THEN ARRAY['dph'] ELSE ARRAY[]::text[] END AS tags
    FROM public.business_profile bp
    JOIN auth.users au ON au.id = bp.user_id
    WHERE bp.deadline_reminders AND bp.form <> 'nezacal' AND au.email_confirmed_at IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM public.email_prefs p WHERE p.user_id = bp.user_id AND NOT p.reminders)
  ),
  due AS (
    SELECT p.user_id, p.email, d.id, d.title, d.detail, d.due_date, d.url, d.source_url
    FROM prof p
    JOIN public.deadlines d ON d.audience && p.tags
    CROSS JOIN today t
    WHERE d.verified AND d.due_date > t.d AND d.due_date <= t.d + 7
      AND NOT EXISTS (SELECT 1 FROM public.deadline_done x WHERE x.user_id = p.user_id AND x.deadline_id = d.id)
      AND NOT EXISTS (SELECT 1 FROM public.email_log l WHERE l.user_id = p.user_id AND l.kind = 'deadline'
                      AND l.meta -> 'ids' ? d.id::text)
  )
  SELECT due.user_id, due.email, ep.unsubscribe_token,
         jsonb_agg(jsonb_build_object('id', due.id, 'title', due.title, 'detail', due.detail, 'due', due.due_date,
                                      'url', due.url, 'source', due.source_url) ORDER BY due.due_date)
  FROM due
  LEFT JOIN public.email_prefs ep ON ep.user_id = due.user_id
  GROUP BY due.user_id, due.email, ep.unsubscribe_token
  LIMIT p_limit;
$$;
REVOKE EXECUTE ON FUNCTION public.deadline_candidates(INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.deadline_candidates(INT) TO service_role;

-- 5) Výchozí termíny listopad 2026 až prosinec 2027.
--    Ověřeno (verified = true): jen položky z daňového kalendáře Finanční správy 2026.
--    Ostatní jsou dopočtené podle pravidel (posun na pracovní den) a čekají na kontrolu správcem.
INSERT INTO public.deadlines (title, detail, due_date, audience, url, source_url, verified) VALUES
  ('Paušální daň: záloha za listopad', 'Měsíční platba paušální daně (daň, sociální a zdravotní pojištění v jedné platbě).', '2026-11-20', ARRAY['osvc_pausal'], 'https://www.mojedane.cz/', 'https://financnisprava.gov.cz/cs/danovy-kalendar', true),
  ('Paušální daň: záloha za prosinec', 'Měsíční platba paušální daně (daň, sociální a zdravotní pojištění v jedné platbě).', '2026-12-21', ARRAY['osvc_pausal'], 'https://www.mojedane.cz/', 'https://financnisprava.gov.cz/cs/danovy-kalendar', true),
  ('DPH: přiznání a kontrolní hlášení za říjen', 'Přiznání k DPH, kontrolní hlášení a platba za říjen 2026 (měsíční plátci).', '2026-11-25', ARRAY['dph'], 'https://www.mojedane.cz/', 'https://financnisprava.gov.cz/cs/danovy-kalendar', true),
  ('DPH: přiznání a kontrolní hlášení za listopad', 'Přiznání k DPH, kontrolní hlášení a platba za listopad 2026 (měsíční plátci).', '2026-12-28', ARRAY['dph'], 'https://www.mojedane.cz/', 'https://financnisprava.gov.cz/cs/danovy-kalendar', true),
  ('Záloha na zdravotní pojištění za říjen', 'Platí se do 8. dne následujícího měsíce na účet vaší zdravotní pojišťovny.', '2026-11-09', ARRAY['osvc_bezny'], 'https://www.vzp.cz/', NULL, false),
  ('Záloha na sociální pojištění za říjen', 'Platí se do 20. dne následujícího měsíce na účet okresní správy sociálního zabezpečení.', '2026-11-20', ARRAY['osvc_bezny'], 'https://eportal.cssz.cz/', 'https://www.cssz.gov.cz/', false),
  ('Záloha na zdravotní pojištění za listopad', 'Platí se do 8. dne následujícího měsíce na účet vaší zdravotní pojišťovny.', '2026-12-08', ARRAY['osvc_bezny'], 'https://www.vzp.cz/', NULL, false),
  ('Záloha na sociální pojištění za listopad', 'Platí se do 20. dne následujícího měsíce na účet okresní správy sociálního zabezpečení.', '2026-12-21', ARRAY['osvc_bezny'], 'https://eportal.cssz.cz/', 'https://www.cssz.gov.cz/', false),
  ('Paušální daň: oznámení o vstupu na rok 2027', 'Kdo chce v roce 2027 platit paušální daň, oznámí to finančnímu úřadu nejpozději do 10. ledna.', '2027-01-11', ARRAY['osvc_pausal'], 'https://www.mojedane.cz/', 'https://financnisprava.gov.cz/cs/danovy-kalendar', false),
  ('Paušální daň: záloha za leden', 'Měsíční platba paušální daně (daň, sociální a zdravotní pojištění v jedné platbě).', '2027-01-20', ARRAY['osvc_pausal'], 'https://www.mojedane.cz/', 'https://financnisprava.gov.cz/cs/danovy-kalendar', false),
  ('DPH: přiznání a kontrolní hlášení za prosinec 2026', 'Přiznání k DPH, kontrolní hlášení a platba (měsíční plátci; čtvrtletní plátci po skončení čtvrtletí).', '2027-01-25', ARRAY['dph'], 'https://www.mojedane.cz/', 'https://financnisprava.gov.cz/cs/danovy-kalendar', false),
  ('Záloha na zdravotní pojištění za prosinec', 'Platí se do 8. dne následujícího měsíce na účet vaší zdravotní pojišťovny.', '2027-01-08', ARRAY['osvc_bezny'], 'https://www.vzp.cz/', NULL, false),
  ('Záloha na sociální pojištění za prosinec', 'Platí se do 20. dne následujícího měsíce na účet okresní správy sociálního zabezpečení.', '2027-01-20', ARRAY['osvc_bezny'], 'https://eportal.cssz.cz/', 'https://www.cssz.gov.cz/', false),
  ('Paušální daň: záloha za únor', 'Měsíční platba paušální daně (daň, sociální a zdravotní pojištění v jedné platbě).', '2027-02-22', ARRAY['osvc_pausal'], 'https://www.mojedane.cz/', 'https://financnisprava.gov.cz/cs/danovy-kalendar', false),
  ('DPH: přiznání a kontrolní hlášení za leden 2027', 'Přiznání k DPH, kontrolní hlášení a platba (měsíční plátci; čtvrtletní plátci po skončení čtvrtletí).', '2027-02-25', ARRAY['dph'], 'https://www.mojedane.cz/', 'https://financnisprava.gov.cz/cs/danovy-kalendar', false),
  ('Záloha na zdravotní pojištění za leden', 'Platí se do 8. dne následujícího měsíce na účet vaší zdravotní pojišťovny.', '2027-02-08', ARRAY['osvc_bezny'], 'https://www.vzp.cz/', NULL, false),
  ('Záloha na sociální pojištění za leden', 'Platí se do 20. dne následujícího měsíce na účet okresní správy sociálního zabezpečení.', '2027-02-22', ARRAY['osvc_bezny'], 'https://eportal.cssz.cz/', 'https://www.cssz.gov.cz/', false),
  ('Paušální daň: záloha za březen', 'Měsíční platba paušální daně (daň, sociální a zdravotní pojištění v jedné platbě).', '2027-03-22', ARRAY['osvc_pausal'], 'https://www.mojedane.cz/', 'https://financnisprava.gov.cz/cs/danovy-kalendar', false),
  ('DPH: přiznání a kontrolní hlášení za únor 2027', 'Přiznání k DPH, kontrolní hlášení a platba (měsíční plátci; čtvrtletní plátci po skončení čtvrtletí).', '2027-03-25', ARRAY['dph'], 'https://www.mojedane.cz/', 'https://financnisprava.gov.cz/cs/danovy-kalendar', false),
  ('Záloha na zdravotní pojištění za únor', 'Platí se do 8. dne následujícího měsíce na účet vaší zdravotní pojišťovny.', '2027-03-08', ARRAY['osvc_bezny'], 'https://www.vzp.cz/', NULL, false),
  ('Záloha na sociální pojištění za únor', 'Platí se do 20. dne následujícího měsíce na účet okresní správy sociálního zabezpečení.', '2027-03-22', ARRAY['osvc_bezny'], 'https://eportal.cssz.cz/', 'https://www.cssz.gov.cz/', false),
  ('Paušální daň: záloha za duben', 'Měsíční platba paušální daně (daň, sociální a zdravotní pojištění v jedné platbě).', '2027-04-20', ARRAY['osvc_pausal'], 'https://www.mojedane.cz/', 'https://financnisprava.gov.cz/cs/danovy-kalendar', false),
  ('DPH: přiznání a kontrolní hlášení za březen 2027', 'Přiznání k DPH, kontrolní hlášení a platba (měsíční plátci; čtvrtletní plátci po skončení čtvrtletí).', '2027-04-26', ARRAY['dph'], 'https://www.mojedane.cz/', 'https://financnisprava.gov.cz/cs/danovy-kalendar', false),
  ('Záloha na zdravotní pojištění za březen', 'Platí se do 8. dne následujícího měsíce na účet vaší zdravotní pojišťovny.', '2027-04-08', ARRAY['osvc_bezny'], 'https://www.vzp.cz/', NULL, false),
  ('Záloha na sociální pojištění za březen', 'Platí se do 20. dne následujícího měsíce na účet okresní správy sociálního zabezpečení.', '2027-04-20', ARRAY['osvc_bezny'], 'https://eportal.cssz.cz/', 'https://www.cssz.gov.cz/', false),
  ('Paušální daň: záloha za květen', 'Měsíční platba paušální daně (daň, sociální a zdravotní pojištění v jedné platbě).', '2027-05-20', ARRAY['osvc_pausal'], 'https://www.mojedane.cz/', 'https://financnisprava.gov.cz/cs/danovy-kalendar', false),
  ('DPH: přiznání a kontrolní hlášení za duben 2027', 'Přiznání k DPH, kontrolní hlášení a platba (měsíční plátci; čtvrtletní plátci po skončení čtvrtletí).', '2027-05-25', ARRAY['dph'], 'https://www.mojedane.cz/', 'https://financnisprava.gov.cz/cs/danovy-kalendar', false),
  ('Záloha na zdravotní pojištění za duben', 'Platí se do 8. dne následujícího měsíce na účet vaší zdravotní pojišťovny.', '2027-05-10', ARRAY['osvc_bezny'], 'https://www.vzp.cz/', NULL, false),
  ('Záloha na sociální pojištění za duben', 'Platí se do 20. dne následujícího měsíce na účet okresní správy sociálního zabezpečení.', '2027-05-20', ARRAY['osvc_bezny'], 'https://eportal.cssz.cz/', 'https://www.cssz.gov.cz/', false),
  ('Paušální daň: záloha za červen', 'Měsíční platba paušální daně (daň, sociální a zdravotní pojištění v jedné platbě).', '2027-06-21', ARRAY['osvc_pausal'], 'https://www.mojedane.cz/', 'https://financnisprava.gov.cz/cs/danovy-kalendar', false),
  ('DPH: přiznání a kontrolní hlášení za květen 2027', 'Přiznání k DPH, kontrolní hlášení a platba (měsíční plátci; čtvrtletní plátci po skončení čtvrtletí).', '2027-06-25', ARRAY['dph'], 'https://www.mojedane.cz/', 'https://financnisprava.gov.cz/cs/danovy-kalendar', false),
  ('Záloha na zdravotní pojištění za květen', 'Platí se do 8. dne následujícího měsíce na účet vaší zdravotní pojišťovny.', '2027-06-08', ARRAY['osvc_bezny'], 'https://www.vzp.cz/', NULL, false),
  ('Záloha na sociální pojištění za květen', 'Platí se do 20. dne následujícího měsíce na účet okresní správy sociálního zabezpečení.', '2027-06-21', ARRAY['osvc_bezny'], 'https://eportal.cssz.cz/', 'https://www.cssz.gov.cz/', false),
  ('Paušální daň: záloha za červenec', 'Měsíční platba paušální daně (daň, sociální a zdravotní pojištění v jedné platbě).', '2027-07-20', ARRAY['osvc_pausal'], 'https://www.mojedane.cz/', 'https://financnisprava.gov.cz/cs/danovy-kalendar', false),
  ('DPH: přiznání a kontrolní hlášení za červen 2027', 'Přiznání k DPH, kontrolní hlášení a platba (měsíční plátci; čtvrtletní plátci po skončení čtvrtletí).', '2027-07-26', ARRAY['dph'], 'https://www.mojedane.cz/', 'https://financnisprava.gov.cz/cs/danovy-kalendar', false),
  ('Záloha na zdravotní pojištění za červen', 'Platí se do 8. dne následujícího měsíce na účet vaší zdravotní pojišťovny.', '2027-07-08', ARRAY['osvc_bezny'], 'https://www.vzp.cz/', NULL, false),
  ('Záloha na sociální pojištění za červen', 'Platí se do 20. dne následujícího měsíce na účet okresní správy sociálního zabezpečení.', '2027-07-20', ARRAY['osvc_bezny'], 'https://eportal.cssz.cz/', 'https://www.cssz.gov.cz/', false),
  ('Paušální daň: záloha za srpen', 'Měsíční platba paušální daně (daň, sociální a zdravotní pojištění v jedné platbě).', '2027-08-20', ARRAY['osvc_pausal'], 'https://www.mojedane.cz/', 'https://financnisprava.gov.cz/cs/danovy-kalendar', false),
  ('DPH: přiznání a kontrolní hlášení za červenec 2027', 'Přiznání k DPH, kontrolní hlášení a platba (měsíční plátci; čtvrtletní plátci po skončení čtvrtletí).', '2027-08-25', ARRAY['dph'], 'https://www.mojedane.cz/', 'https://financnisprava.gov.cz/cs/danovy-kalendar', false),
  ('Záloha na zdravotní pojištění za červenec', 'Platí se do 8. dne následujícího měsíce na účet vaší zdravotní pojišťovny.', '2027-08-09', ARRAY['osvc_bezny'], 'https://www.vzp.cz/', NULL, false),
  ('Záloha na sociální pojištění za červenec', 'Platí se do 20. dne následujícího měsíce na účet okresní správy sociálního zabezpečení.', '2027-08-20', ARRAY['osvc_bezny'], 'https://eportal.cssz.cz/', 'https://www.cssz.gov.cz/', false),
  ('Paušální daň: záloha za září', 'Měsíční platba paušální daně (daň, sociální a zdravotní pojištění v jedné platbě).', '2027-09-20', ARRAY['osvc_pausal'], 'https://www.mojedane.cz/', 'https://financnisprava.gov.cz/cs/danovy-kalendar', false),
  ('DPH: přiznání a kontrolní hlášení za srpen 2027', 'Přiznání k DPH, kontrolní hlášení a platba (měsíční plátci; čtvrtletní plátci po skončení čtvrtletí).', '2027-09-27', ARRAY['dph'], 'https://www.mojedane.cz/', 'https://financnisprava.gov.cz/cs/danovy-kalendar', false),
  ('Záloha na zdravotní pojištění za srpen', 'Platí se do 8. dne následujícího měsíce na účet vaší zdravotní pojišťovny.', '2027-09-08', ARRAY['osvc_bezny'], 'https://www.vzp.cz/', NULL, false),
  ('Záloha na sociální pojištění za srpen', 'Platí se do 20. dne následujícího měsíce na účet okresní správy sociálního zabezpečení.', '2027-09-20', ARRAY['osvc_bezny'], 'https://eportal.cssz.cz/', 'https://www.cssz.gov.cz/', false),
  ('Paušální daň: záloha za říjen', 'Měsíční platba paušální daně (daň, sociální a zdravotní pojištění v jedné platbě).', '2027-10-20', ARRAY['osvc_pausal'], 'https://www.mojedane.cz/', 'https://financnisprava.gov.cz/cs/danovy-kalendar', false),
  ('DPH: přiznání a kontrolní hlášení za září 2027', 'Přiznání k DPH, kontrolní hlášení a platba (měsíční plátci; čtvrtletní plátci po skončení čtvrtletí).', '2027-10-25', ARRAY['dph'], 'https://www.mojedane.cz/', 'https://financnisprava.gov.cz/cs/danovy-kalendar', false),
  ('Záloha na zdravotní pojištění za září', 'Platí se do 8. dne následujícího měsíce na účet vaší zdravotní pojišťovny.', '2027-10-08', ARRAY['osvc_bezny'], 'https://www.vzp.cz/', NULL, false),
  ('Záloha na sociální pojištění za září', 'Platí se do 20. dne následujícího měsíce na účet okresní správy sociálního zabezpečení.', '2027-10-20', ARRAY['osvc_bezny'], 'https://eportal.cssz.cz/', 'https://www.cssz.gov.cz/', false),
  ('Paušální daň: záloha za listopad', 'Měsíční platba paušální daně (daň, sociální a zdravotní pojištění v jedné platbě).', '2027-11-22', ARRAY['osvc_pausal'], 'https://www.mojedane.cz/', 'https://financnisprava.gov.cz/cs/danovy-kalendar', false),
  ('DPH: přiznání a kontrolní hlášení za říjen 2027', 'Přiznání k DPH, kontrolní hlášení a platba (měsíční plátci; čtvrtletní plátci po skončení čtvrtletí).', '2027-11-25', ARRAY['dph'], 'https://www.mojedane.cz/', 'https://financnisprava.gov.cz/cs/danovy-kalendar', false),
  ('Záloha na zdravotní pojištění za říjen', 'Platí se do 8. dne následujícího měsíce na účet vaší zdravotní pojišťovny.', '2027-11-08', ARRAY['osvc_bezny'], 'https://www.vzp.cz/', NULL, false),
  ('Záloha na sociální pojištění za říjen', 'Platí se do 20. dne následujícího měsíce na účet okresní správy sociálního zabezpečení.', '2027-11-22', ARRAY['osvc_bezny'], 'https://eportal.cssz.cz/', 'https://www.cssz.gov.cz/', false),
  ('Paušální daň: záloha za prosinec', 'Měsíční platba paušální daně (daň, sociální a zdravotní pojištění v jedné platbě).', '2027-12-20', ARRAY['osvc_pausal'], 'https://www.mojedane.cz/', 'https://financnisprava.gov.cz/cs/danovy-kalendar', false),
  ('DPH: přiznání a kontrolní hlášení za listopad 2027', 'Přiznání k DPH, kontrolní hlášení a platba (měsíční plátci; čtvrtletní plátci po skončení čtvrtletí).', '2027-12-27', ARRAY['dph'], 'https://www.mojedane.cz/', 'https://financnisprava.gov.cz/cs/danovy-kalendar', false),
  ('Záloha na zdravotní pojištění za listopad', 'Platí se do 8. dne následujícího měsíce na účet vaší zdravotní pojišťovny.', '2027-12-08', ARRAY['osvc_bezny'], 'https://www.vzp.cz/', NULL, false),
  ('Záloha na sociální pojištění za listopad', 'Platí se do 20. dne následujícího měsíce na účet okresní správy sociálního zabezpečení.', '2027-12-20', ARRAY['osvc_bezny'], 'https://eportal.cssz.cz/', 'https://www.cssz.gov.cz/', false),
  ('Daňové přiznání za rok 2026 (papírově)', 'Přiznání k dani z příjmů a doplatek daně, když přiznání podáváte na papíře.', '2027-04-01', ARRAY['osvc_bezny','sro'], 'https://www.mojedane.cz/', 'https://financnisprava.gov.cz/cs/danovy-kalendar', false),
  ('Daňové přiznání za rok 2026 (elektronicky)', 'Přiznání k dani z příjmů a doplatek daně, když přiznání podáváte elektronicky (Moje daně nebo datová schránka).', '2027-05-03', ARRAY['osvc_bezny','sro'], 'https://www.mojedane.cz/', 'https://financnisprava.gov.cz/cs/danovy-kalendar', false),
  ('Přehledy pro ČSSZ a zdravotní pojišťovnu za rok 2026', 'Do měsíce od lhůty pro podání přiznání. Datum platí při elektronickém přiznání, při papírovém je o měsíc dřív.', '2027-06-03', ARRAY['osvc_bezny'], 'https://eportal.cssz.cz/', 'https://www.cssz.gov.cz/', false);
