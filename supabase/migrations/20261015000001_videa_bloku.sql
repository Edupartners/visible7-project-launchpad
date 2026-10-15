-- Videa ke kartám (blokům). Správce vloží odkaz z Vimea a seřadí videa,
-- uživatel si odškrtává zhlédnutá. Videa zůstávají na Vimeu (přehrání jen na povolené doméně).
-- block_key = "<oblast>:<id bloku>", např. "marketing:seo_zaklad", "tvorba:domena", "start:forma", "rust:automatizace".

CREATE TABLE public.block_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_key TEXT NOT NULL CHECK (block_key ~ '^[a-z]+:[a-z0-9_]+$'),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 160),
  vimeo_id TEXT NOT NULL CHECK (vimeo_id ~ '^[0-9]{3,15}$'),
  vimeo_hash TEXT CHECK (vimeo_hash IS NULL OR vimeo_hash ~ '^[a-zA-Z0-9]{4,40}$'),
  minutes SMALLINT CHECK (minutes IS NULL OR minutes BETWEEN 1 AND 600),
  position INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX block_videos_block_idx ON public.block_videos (block_key, position);
ALTER TABLE public.block_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Videa vidí přihlášení" ON public.block_videos FOR SELECT TO authenticated
  USING (published OR (SELECT public.is_admin()));
CREATE POLICY "Správce přidává videa" ON public.block_videos FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY "Správce mění videa" ON public.block_videos FOR UPDATE TO authenticated
  USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY "Správce maže videa" ON public.block_videos FOR DELETE TO authenticated
  USING ((SELECT public.is_admin()));
REVOKE ALL ON public.block_videos FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.block_videos TO authenticated;

-- Zhlédnutá videa (odškrtává uživatel)
CREATE TABLE public.block_video_views (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  video_id UUID NOT NULL REFERENCES public.block_videos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, video_id)
);
CREATE INDEX block_video_views_video_idx ON public.block_video_views (video_id);
ALTER TABLE public.block_video_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vlastní zhlédnutí" ON public.block_video_views FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Označit zhlédnuté" ON public.block_video_views FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Zrušit zhlédnuté" ON public.block_video_views FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));
REVOKE ALL ON public.block_video_views FROM anon;
GRANT SELECT, INSERT, DELETE ON public.block_video_views TO authenticated;

-- Seřazení videí jedné karty najednou (pořadí = pořadí v poli)
CREATE OR REPLACE FUNCTION public.block_videos_reorder(p_block_key TEXT, p_ids UUID[])
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Jen pro správce';
  END IF;
  UPDATE block_videos v SET position = x.ord
  FROM unnest(p_ids) WITH ORDINALITY AS x(id, ord)
  WHERE v.id = x.id AND v.block_key = p_block_key;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.block_videos_reorder(TEXT, UUID[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.block_videos_reorder(TEXT, UUID[]) TO authenticated;
