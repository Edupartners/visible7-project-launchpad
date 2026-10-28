/**
 * Náhledové obrázky k videím v public/video-covers/:
 * - podle přednášky: <vimeo_id>.webp (např. 1190043020.webp) – mají přednost, kapitoly jedné přednášky sdílí obrázek,
 * - podle karty: <oblast>-<karta>.webp (např. marketing-meta_kampan.webp).
 * Bez obrázku zůstane barevný přechod. Nový soubor je potřeba zapsat do seznamu níže.
 */
const LECTURE_COVERS = new Set<string>([]);
const CARD_COVERS = new Set<string>([]);

export const videoCover = (key: string, vimeoId?: string | null): string | null => {
  if (vimeoId && LECTURE_COVERS.has(vimeoId)) return `/video-covers/${vimeoId}.webp`;
  return CARD_COVERS.has(key) ? `/video-covers/${key.replace(":", "-")}.webp` : null;
};
