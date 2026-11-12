-- Semestrální studium: studenti a rozvrh setkání.
-- Rozvrh (včetně odkazu na Meet) vidí jen studenti a správci. Zapisují jen správci.
create table if not exists public.study_students (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text check (char_length(email) <= 200),
  semester text not null default '2027-jaro' check (char_length(semester) <= 40),
  added_at timestamptz not null default now()
);

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  semester text not null default '2027-jaro' check (char_length(semester) <= 40),
  starts_at timestamptz not null,
  duration_min int not null default 90 check (duration_min between 15 and 600),
  topic text not null check (char_length(topic) between 2 and 200),
  lecturer text check (char_length(lecturer) <= 120),
  meet_url text check (char_length(meet_url) <= 300),
  recording_url text check (char_length(recording_url) <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists study_sessions_start_idx on public.study_sessions (semester, starts_at);

create or replace function public.is_study_student()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.study_students s where s.user_id = auth.uid());
$$;

alter table public.study_students enable row level security;
alter table public.study_sessions enable row level security;

drop policy if exists "study_students: čtení" on public.study_students;
create policy "study_students: čtení" on public.study_students
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "study_students: správce" on public.study_students;
create policy "study_students: správce" on public.study_students
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "study_sessions: čtení" on public.study_sessions;
create policy "study_sessions: čtení" on public.study_sessions
  for select using (public.is_admin() or public.is_study_student());

drop policy if exists "study_sessions: správce" on public.study_sessions;
create policy "study_sessions: správce" on public.study_sessions
  for all using (public.is_admin()) with check (public.is_admin());

grant select, insert, update, delete on public.study_students to authenticated;
grant select, insert, update, delete on public.study_sessions to authenticated;
grant execute on function public.is_study_student() to authenticated;
