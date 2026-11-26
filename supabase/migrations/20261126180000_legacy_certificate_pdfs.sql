-- Původní PDF certifikáty z LearnWorlds: majitel si je stáhne ve svém profilu (Osvědčení).
-- PDF nahrává správce v Administraci › Prodej › Převedené certifikáty; párují se podle ID certifikátu v názvu souboru.

ALTER TABLE public.pending_certificates
  ADD COLUMN lw_cert_id TEXT UNIQUE,
  ADD COLUMN issued_at TIMESTAMPTZ,
  ADD COLUMN pdf_path TEXT;
ALTER TABLE public.certificates ADD COLUMN legacy_pdf TEXT;

INSERT INTO storage.buckets (id, name, public)
VALUES ('legacy-certificates', 'legacy-certificates', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Původní certifikát čte majitel" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'legacy-certificates' AND (public.is_admin() OR EXISTS (
    SELECT 1 FROM public.certificates c WHERE c.user_id = auth.uid() AND c.legacy_pdf = storage.objects.name)));
CREATE POLICY "Původní certifikáty nahrává správce" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'legacy-certificates' AND public.is_admin());
CREATE POLICY "Původní certifikáty mění správce" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'legacy-certificates' AND public.is_admin());

-- Vystavení převzaté z předchozí migrace, navíc s původním datem a PDF.
CREATE OR REPLACE FUNCTION public.apply_pending_certificates(p_user UUID, p_email TEXT)
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  r RECORD;
  v_code TEXT;
  v_n INTEGER := 0;
BEGIN
  FOR r IN SELECT * FROM pending_certificates
            WHERE applied_at IS NULL AND lower(email) = lower(btrim(p_email)) ORDER BY id FOR UPDATE LOOP
    SELECT code INTO v_code FROM certificates
     WHERE user_id = p_user AND kind = r.kind AND bonus_key = r.bonus_key;
    IF NOT FOUND THEN
      LOOP
        v_code := 'V7-' || upper(substr(md5(gen_random_uuid()::text), 1, 4)) || '-' || upper(substr(md5(gen_random_uuid()::text), 1, 4));
        EXIT WHEN NOT EXISTS (SELECT 1 FROM certificates WHERE code = v_code);
      END LOOP;
      INSERT INTO certificates (code, user_id, project_id, kind, phase, holder_name, project_name, bonus_key, issued_at, legacy_pdf)
      VALUES (v_code, p_user, NULL, r.kind, NULL, r.holder_name, '', r.bonus_key, COALESCE(r.issued_at, NOW()), r.pdf_path);
    ELSIF r.pdf_path IS NOT NULL THEN
      UPDATE certificates SET legacy_pdf = r.pdf_path WHERE code = v_code AND legacy_pdf IS NULL;
    END IF;
    UPDATE pending_certificates SET applied_at = NOW(), certificate_code = v_code WHERE id = r.id;
    v_n := v_n + 1;
  END LOOP;
  RETURN v_n;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.apply_pending_certificates(UUID, TEXT) FROM PUBLIC, anon, authenticated;

-- Správce připojí nahrané PDF k převedenému certifikátu (i když už je vystavený).
CREATE OR REPLACE FUNCTION public.admin_attach_legacy_pdf(p_lw_cert_id TEXT, p_path TEXT)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE r RECORD;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Jen pro správce'; END IF;
  UPDATE pending_certificates SET pdf_path = p_path WHERE lw_cert_id = p_lw_cert_id RETURNING * INTO r;
  IF NOT FOUND THEN RETURN NULL; END IF;
  IF r.certificate_code IS NOT NULL THEN
    UPDATE certificates SET legacy_pdf = p_path WHERE code = r.certificate_code;
  END IF;
  RETURN r.holder_name;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.admin_attach_legacy_pdf(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_attach_legacy_pdf(TEXT, TEXT) TO authenticated;
