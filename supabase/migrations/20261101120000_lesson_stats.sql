-- Počet krátkých lekcí a hodin videí pro úvodní stránku (bez zdvojení kapitol, které jsou ve více kartách).
CREATE OR REPLACE FUNCTION public.lesson_stats()
RETURNS TABLE(lessons integer, minutes numeric, missing integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH u AS (
    SELECT DISTINCT ON (v.vimeo_id, COALESCE(v.start_sec, -1), COALESCE(v.end_sec, -1))
           v.vimeo_id, v.start_sec, v.end_sec, v.minutes
    FROM public.block_videos v
    WHERE v.published
  )
  SELECT COUNT(*)::INTEGER,
         ROUND(SUM(COALESCE(CASE WHEN u.end_sec IS NOT NULL AND u.start_sec IS NOT NULL
                                 THEN (u.end_sec - u.start_sec) / 60.0 END, u.minutes, 0)), 1),
         COUNT(*) FILTER (WHERE u.minutes IS NULL AND (u.end_sec IS NULL OR u.start_sec IS NULL))::INTEGER
  FROM u;
$$;
GRANT EXECUTE ON FUNCTION public.lesson_stats() TO anon, authenticated;
