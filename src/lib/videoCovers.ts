/**
 * Náhledové fotky k videím. Jedna fotka na kartu, soubor public/video-covers/<oblast>-<karta>.webp
 * (např. marketing-meta_kampan.webp). Karta bez fotky má barevný přechod jako dřív.
 */
const COVERS = new Set<string>([]);

export const videoCover = (key: string): string | null =>
  COVERS.has(key) ? `/video-covers/${key.replace(":", "-")}.webp` : null;
