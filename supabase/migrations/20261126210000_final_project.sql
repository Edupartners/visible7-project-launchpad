-- Závěrečný projekt studia Specialista internetového obchodu (66-043-N).
-- Zadání (otázky a nápovědy) je materiál Edu Partners jen pro účastníky kurzu, proto není v repozitáři:
-- leží v tabulce final_project_template a čtou ho jen studenti semestru a správci.
-- Odpovědi si student ukládá do final_projects, lektor (správce) je může číst.

CREATE TABLE public.final_project_template (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  content JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.final_project_template ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Zadání čtou studenti a správci" ON public.final_project_template FOR SELECT TO authenticated
  USING (public.is_study_student() OR public.is_admin());
CREATE POLICY "Zadání mění správce" ON public.final_project_template FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
REVOKE ALL ON public.final_project_template FROM anon, authenticated;
GRANT SELECT, UPDATE ON public.final_project_template TO authenticated;

CREATE TABLE public.final_projects (
  user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (pg_column_size(answers) < 300000),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.final_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Svůj projekt čte student, všechny správce" ON public.final_projects FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Svůj projekt zakládá student" ON public.final_projects FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND (public.is_study_student() OR public.is_admin()));
CREATE POLICY "Svůj projekt upravuje student" ON public.final_projects FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
REVOKE ALL ON public.final_projects FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.final_projects TO authenticated;
