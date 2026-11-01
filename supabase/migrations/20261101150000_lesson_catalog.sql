-- Veřejný katalog lekcí pro stránku /e-learning: jen karta, název, pořadí a délka.
-- Žádné odkazy na Vimeo (vimeo_id ani hash) – videa zůstávají jen pro přihlášené.
create or replace function public.lesson_catalog()
returns table (block_key text, title text, "position" int, minutes numeric)
language sql
stable
security definer
set search_path = public
as $$
  select distinct on (v.block_key, v.vimeo_id, coalesce(v.start_sec, -1), coalesce(v.end_sec, -1))
         v.block_key,
         v.title,
         v.position,
         case
           when v.end_sec is not null then round((v.end_sec - coalesce(v.start_sec, 0)) / 60.0, 1)
           else v.minutes
         end as minutes
    from public.block_videos v
   where v.published
   order by v.block_key, v.vimeo_id, coalesce(v.start_sec, -1), coalesce(v.end_sec, -1), v.position;
$$;

revoke all on function public.lesson_catalog() from public;
grant execute on function public.lesson_catalog() to anon, authenticated;
