-- Rozvrh studia: povinná setkání (study_sessions) a lektoři u seminářů (nepovinná setkání).

alter table public.study_sessions alter column starts_at drop not null;
alter table public.study_sessions add column if not exists code text check (char_length(code) <= 10);
alter table public.study_sessions add column if not exists gate text check (char_length(gate) <= 10);
alter table public.study_sessions add column if not exists place text not null default 'Online' check (char_length(place) <= 120);
alter table public.study_sessions add column if not exists note text check (char_length(note) <= 300);
alter table public.study_sessions add column if not exists sort int not null default 0;

alter table public.seminars add column if not exists lecturer text check (char_length(lecturer) <= 120);
grant select (lecturer) on public.seminars to authenticated;

drop function if exists public.admin_seminars();
create function public.admin_seminars()
returns table(id uuid, title text, description text, gate smallint, starts_at timestamptz, duration_min smallint,
              place text, access text, join_url text, recording_url text, published boolean, lecturer text,
              registrations bigint)
language plpgsql
stable
security definer
set search_path to 'public'
as $$
begin
  if not public.is_admin() then
    raise exception 'Jen pro správce';
  end if;
  return query
    select s.id, s.title, s.description, s.gate, s.starts_at, s.duration_min, s.place, s.access,
           s.join_url, s.recording_url, s.published, s.lecturer,
           (select count(*) from seminar_registrations r where r.seminar_id = s.id)
    from seminars s
    order by s.starts_at nulls last, s.created_at;
end;
$$;
revoke all on function public.admin_seminars() from public, anon;
grant execute on function public.admin_seminars() to authenticated;

-- Studenti: správce je přidává podle e-mailu.
create or replace function public.admin_students()
returns table(user_id uuid, email text, added_at timestamptz)
language plpgsql
stable
security definer
set search_path to 'public'
as $$
begin
  if not public.is_admin() then raise exception 'Jen pro správce'; end if;
  return query select s.user_id, coalesce(s.email, u.email::text), s.added_at
    from study_students s left join auth.users u on u.id = s.user_id
    order by s.added_at;
end;
$$;

create or replace function public.admin_add_student(p_email text)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $$
declare v_id uuid;
begin
  if not public.is_admin() then raise exception 'Jen pro správce'; end if;
  select id into v_id from auth.users where lower(email) = lower(btrim(p_email));
  if v_id is null then
    raise exception 'Uživatel s tímto e-mailem není registrovaný. Ať se nejdřív zaregistruje na visible7.io.';
  end if;
  insert into study_students (user_id, email) values (v_id, lower(btrim(p_email)))
  on conflict (user_id) do nothing;
  return v_id;
end;
$$;

revoke all on function public.admin_students() from public, anon;
revoke all on function public.admin_add_student(text) from public, anon;
grant execute on function public.admin_students() to authenticated;
grant execute on function public.admin_add_student(text) to authenticated;
