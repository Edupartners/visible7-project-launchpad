-- Pracovní listy pro členy: soukromé úložiště, číst smí jen kdo má plný přístup
-- (nebo když je paywall vypnutý – pilot bez plateb). Soubory nahrává správce v Administraci › Pracovní listy.
INSERT INTO storage.buckets (id, name, public)
VALUES ('listy-clenove', 'listy-clenove', false)
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.i_have_full_access()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT value FROM app_settings WHERE key = 'paywall_enabled') <> 'true'::jsonb, true)
      OR public.has_full_access(auth.uid());
$$;
REVOKE EXECUTE ON FUNCTION public.i_have_full_access() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.i_have_full_access() TO authenticated;

CREATE POLICY "Členové čtou listy" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'listy-clenove' AND (public.i_have_full_access() OR public.is_admin()));
CREATE POLICY "Správce nahrává listy" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'listy-clenove' AND public.is_admin());
CREATE POLICY "Správce mění listy" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'listy-clenove' AND public.is_admin());
