-- Součty délek publikovaných videí podle karty pro úvodní stránku (veřejné, bez odkazů na videa).
-- U kapitol z dlouhé přednášky se počítá end_sec − start_sec, jinak minutes.
CREATE OR REPLACE FUNCTION public.course_hours()
RETURNS TABLE (block_key TEXT, minutes NUMERIC, missing INTEGER)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT v.block_key,
         ROUND(SUM(COALESCE(CASE WHEN v.end_sec IS NOT NULL AND v.start_sec IS NOT NULL
                                 THEN (v.end_sec - v.start_sec) / 60.0 END, v.minutes, 0)), 1),
         COUNT(*) FILTER (WHERE v.minutes IS NULL AND (v.end_sec IS NULL OR v.start_sec IS NULL))::INTEGER
  FROM public.block_videos v
  WHERE v.published
  GROUP BY v.block_key;
$$;
REVOKE ALL ON FUNCTION public.course_hours() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.course_hours() TO anon, authenticated;
