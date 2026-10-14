-- Zpevnění podle doporučení Supabase (bezpečnost a výkon při větším počtu uživatelů).

-- Spouštěcí funkce nesmí být volatelná přes API.
REVOKE EXECUTE ON FUNCTION public.test_page_lead_notify() FROM PUBLIC, anon, authenticated;
ALTER FUNCTION public.test_page_source(TEXT) SET search_path = public;

-- auth.uid() vyhodnotit jednou na dotaz, ne pro každý řádek.
ALTER POLICY "Vlastní registrace" ON public.seminar_registrations
  USING (user_id = (SELECT auth.uid()) OR public.is_admin());
ALTER POLICY "Registrace sebe" ON public.seminar_registrations
  WITH CHECK (user_id = (SELECT auth.uid()));
ALTER POLICY "Zrušení vlastní registrace" ON public.seminar_registrations
  USING (user_id = (SELECT auth.uid()));

ALTER POLICY "Vlastník čte stránku" ON public.test_pages
  USING (user_id = (SELECT auth.uid()) OR public.is_admin());
ALTER POLICY "Vlastník zakládá stránku" ON public.test_pages
  WITH CHECK (user_id = (SELECT auth.uid())
    AND EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = (SELECT auth.uid())));
ALTER POLICY "Vlastník mění stránku" ON public.test_pages
  USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));
ALTER POLICY "Vlastník maže stránku" ON public.test_pages
  USING (user_id = (SELECT auth.uid()));

ALTER POLICY "Vlastník čte zájemce" ON public.test_page_leads
  USING (EXISTS (SELECT 1 FROM public.test_pages t WHERE t.id = page_id AND t.user_id = (SELECT auth.uid())));
ALTER POLICY "Vlastník maže zájemce" ON public.test_page_leads
  USING (EXISTS (SELECT 1 FROM public.test_pages t WHERE t.id = page_id AND t.user_id = (SELECT auth.uid())));
ALTER POLICY "Vlastník čte statistiky" ON public.test_page_stats
  USING (EXISTS (SELECT 1 FROM public.test_pages t WHERE t.id = page_id AND t.user_id = (SELECT auth.uid())));

-- Indexy pro cizí klíče, které se používají ve filtrech.
CREATE INDEX IF NOT EXISTS seminar_registrations_user_idx ON public.seminar_registrations (user_id);
CREATE INDEX IF NOT EXISTS test_pages_user_idx ON public.test_pages (user_id);
CREATE INDEX IF NOT EXISTS events_project_idx ON public.events (project_id);
CREATE INDEX IF NOT EXISTS shop_purchases_user_idx ON public.shop_purchases (user_id);
CREATE INDEX IF NOT EXISTS promo_redemptions_user_idx ON public.promo_redemptions (user_id);
CREATE INDEX IF NOT EXISTS test_page_leads_page_time_idx ON public.test_page_leads (page_id, created_at DESC);
