-- Žádosti o instalaci webu s podporou (brána 4). Instalaci dělá ručně tým Edu Partners (AIID).
-- Hosting a doména jsou vždy na jméno zákazníka; hesla se sem neukládají.
create table if not exists public.install_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) between 5 and 200),
  phone text check (char_length(phone) <= 40),
  hosting text not null check (hosting in ('mam', 'nemam')),
  domain text check (char_length(domain) <= 200),
  web_type text check (char_length(web_type) <= 60),
  billing text check (char_length(billing) <= 400),
  note text check (char_length(note) <= 1000),
  status text not null default 'nova' check (status in ('nova', 'zaplaceno', 'instalace', 'hotovo', 'zruseno')),
  site_url text check (char_length(site_url) <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists install_requests_user_idx on public.install_requests (user_id, created_at desc);

alter table public.install_requests enable row level security;

drop policy if exists "install_requests: vlastní čtení" on public.install_requests;
create policy "install_requests: vlastní čtení" on public.install_requests
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "install_requests: vlastní zápis" on public.install_requests;
create policy "install_requests: vlastní zápis" on public.install_requests
  for insert with check (user_id = auth.uid() and status = 'nova' and site_url is null);

drop policy if exists "install_requests: správce upravuje" on public.install_requests;
create policy "install_requests: správce upravuje" on public.install_requests
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "install_requests: správce maže" on public.install_requests;
create policy "install_requests: správce maže" on public.install_requests
  for delete using (public.is_admin());

grant select, insert on public.install_requests to authenticated;
grant update, delete on public.install_requests to authenticated;
