/**
 * Úvodní videa fází (Vimeo). Doplňte `vimeoId` (číslo z odkazu vimeo.com/123456789),
 * případně `hash` u neveřejných videí (vimeo.com/123456789/abcdef1234) a délku v minutách.
 * Volitelně `cover` = adresa vlastního náhledového obrázku; jinak se použije grafický náhled.
 */
export interface PhaseVideo {
  vimeoId?: string;
  hash?: string;
  minutes?: number;
  cover?: string;
}

export const PHASE_VIDEOS: Record<number, PhaseVideo> = {
  1: {},
  2: {},
  3: {},
  4: {},
  5: {},
  6: {},
  7: {},
};

export const hasVideo = (phase: number) => !!PHASE_VIDEOS[phase]?.vimeoId;

export const vimeoEmbedUrl = (v: PhaseVideo) =>
  `https://player.vimeo.com/video/${v.vimeoId}?autoplay=1&dnt=1${v.hash ? `&h=${v.hash}` : ""}`;
