-- Nepřihlášený návštěvník nemá k tabulkám žádný přístup; promo kódy čte jen server.
REVOKE ALL ON public.promo_codes FROM anon, authenticated;
REVOKE ALL ON public.projects, public.project_data, public.ai_outputs, public.user_access FROM anon;
-- Výstupy AI a přístupy zapisuje jen server; přihlášený uživatel je pouze čte.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.ai_outputs, public.user_access FROM authenticated;
