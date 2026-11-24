-- Student semestrálního studia dostane při přidání i členství VISIBLE7 na rok (365 dní od přidání).
-- Když už má delší placený přístup, zůstává mu ten delší.
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
    raise exception 'Uživatel s tímto e-mailem není registrovaný. Ať se nejdřív zaregistruje na micek.academy.';
  end if;
  insert into study_students (user_id, email) values (v_id, lower(btrim(p_email)))
  on conflict (user_id) do nothing;

  insert into user_access (user_id) values (v_id) on conflict (user_id) do nothing;
  update user_access
     set plan = 'clenstvi',
         access_until = greatest(
           case when public.is_paid(v_id) and access_until is not null then access_until else now() end,
           now() + interval '365 days'),
         updated_at = now()
   where user_id = v_id
     and not (public.is_paid(v_id) and access_until is null);
  return v_id;
end;
$$;

revoke all on function public.admin_add_student(text) from public, anon;
grant execute on function public.admin_add_student(text) to authenticated;
