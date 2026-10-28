-- Kapitoly z dlouhých přednášek bez střihu: jedno video z Vimea může být na kartách víckrát,
-- pokaždé jen jeho úsek (začátek a konec v sekundách). Prázdné = celé video.
ALTER TABLE public.block_videos
  ADD COLUMN start_sec INTEGER CHECK (start_sec IS NULL OR start_sec BETWEEN 0 AND 86400),
  ADD COLUMN end_sec INTEGER CHECK (end_sec IS NULL OR end_sec BETWEEN 1 AND 86400);
ALTER TABLE public.block_videos
  ADD CONSTRAINT block_videos_usek_check CHECK (start_sec IS NULL OR end_sec IS NULL OR end_sec > start_sec);
