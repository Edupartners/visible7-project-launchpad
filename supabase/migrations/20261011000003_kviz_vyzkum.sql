-- Kvíz: souhlas s výzkumem jako samostatný druh souhlasu a zkušební přístup jen při zapnutém paywallu
-- (v pilotním režimu bez plateb je vše odemčené a nárok na zkušební přístup se nespotřebuje).

ALTER TABLE public.consents DROP CONSTRAINT IF EXISTS consents_kind_check;
ALTER TABLE public.consents ADD CONSTRAINT consents_kind_check
  CHECK (kind IN ('podminky', 'zasady', 'klub', 'marketing', 'vyzkum'));

CREATE OR REPLACE FUNCTION public.start_trial()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_row public.user_access%ROWTYPE;
  v_days INT := public.setting_int('trial_days', 7);
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Nejste přihlášeni.';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.project_data d JOIN public.projects p ON p.id = d.project_id
    WHERE p.user_id = v_uid AND d.data_key = 'entrepreneur_quiz'
  ) THEN
    RAISE EXCEPTION 'Nejdřív dokončete kvíz.';
  END IF;
  IF NOT public.paywall_enabled() THEN
    RETURN jsonb_build_object('status', 'free_mode');
  END IF;

  INSERT INTO public.user_access (user_id) VALUES (v_uid) ON CONFLICT (user_id) DO NOTHING;
  SELECT * INTO v_row FROM public.user_access WHERE user_id = v_uid FOR UPDATE;

  IF v_row.trial_used_at IS NOT NULL THEN
    RETURN jsonb_build_object('status', 'used', 'until', v_row.access_until);
  END IF;
  IF public.is_paid(v_uid) THEN
    UPDATE public.user_access SET trial_used_at = NOW() WHERE user_id = v_uid;
    RETURN jsonb_build_object('status', 'paid');
  END IF;

  UPDATE public.user_access
     SET plan = 'trial', access_until = NOW() + make_interval(days => v_days), trial_used_at = NOW()
   WHERE user_id = v_uid
  RETURNING * INTO v_row;
  PERFORM public.log_event(v_uid, NULL, 'trial_started', jsonb_build_object('days', v_days));
  RETURN jsonb_build_object('status', 'started', 'until', v_row.access_until);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.start_trial() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.start_trial() TO authenticated;
