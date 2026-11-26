-- Převedení uživatelé z LearnWorlds (účet založil správce) nedostanou automatické připomínky,
-- dokud se sami poprvé nepřihlásí.
DO $$
DECLARE d TEXT;
BEGIN
  d := pg_get_functiondef('public.reminder_candidates(int)'::regprocedure);
  IF position('learnworlds' IN d) = 0 THEN
    d := replace(d, 'WHERE au.email_confirmed_at IS NOT NULL',
      'WHERE au.email_confirmed_at IS NOT NULL' || chr(10) ||
      '      AND NOT (COALESCE(au.raw_user_meta_data->>''source'', '''') = ''learnworlds'' AND au.last_sign_in_at IS NULL)');
    EXECUTE d;
  END IF;
END $$;
