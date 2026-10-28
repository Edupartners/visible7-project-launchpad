/**
 * Náhledy videí: fotka podle tématu (public/video-covers/<téma>.webp) a štítek přednášky.
 * Kapitoly z dlouhé přednášky se poznají podle vimeo_id; ostatní videa dostanou fotku podle karty.
 */
type Topic =
  | "affiliate"
  | "ppc"
  | "znacka"
  | "copywriting"
  | "facebook"
  | "data"
  | "grafika"
  | "seo"
  | "web"
  | "eshop"
  | "ai"
  | "kurz";

/** Dlouhé přednášky rozdělené na kapitoly (vimeo_id → téma a název do štítku). */
const LECTURES: Record<string, { topic: Topic; name: string }> = {
  "1189761843": { topic: "affiliate", name: "Affiliate marketing" },
  "1189692519": { topic: "ppc", name: "PPC: Google Ads a Sklik, 1. část" },
  "1189706192": { topic: "ppc", name: "PPC: Google Ads a Sklik, 2. část" },
  "1192302865": { topic: "znacka", name: "Ochranná známka a právo" },
  "1191513624": { topic: "copywriting", name: "Copywriting, 1. část" },
  "1191518085": { topic: "copywriting", name: "Copywriting, 2. část" },
  "1190043020": { topic: "facebook", name: "Reklama na Facebooku a Instagramu, 1. část" },
  "1190052995": { topic: "facebook", name: "Reklama na Facebooku a Instagramu, 2. část" },
  "1189858739": { topic: "data", name: "Data a přehledy, 1. část" },
  "1189984574": { topic: "data", name: "Data a Power BI, 2. část" },
  "1191484977": { topic: "grafika", name: "Grafika ve Photopea, 1. část" },
  "1191484978": { topic: "grafika", name: "Grafika ve Photopea, 2. část" },
};

/** Téma fotky podle karty (pro videa, která nejsou kapitolou přednášky). */
const CARDS: Record<string, Topic> = {
  "marketing:affiliate_program": "affiliate",
  "tvorba:affiliate": "affiliate",
  "marketing:google_klic": "ppc",
  "marketing:google_kampan": "ppc",
  "marketing:sklik_kampan": "ppc",
  "start:znacka": "znacka",
  "marketing:texty": "copywriting",
  "marketing:meta_ucet": "facebook",
  "marketing:meta_kampan": "facebook",
  "rust:data": "data",
  "bonus:grafika": "grafika",
  "marketing:seo_zaklad": "seo",
  "marketing:seo_obsah": "seo",
  "tvorba:hosting": "web",
  "tvorba:domena": "web",
  "tvorba:vzhled": "web",
  "tvorba:texty": "web",
  "tvorba:clanky": "web",
  "tvorba:poptavka": "web",
  "tvorba:pravni": "web",
  "tvorba:prodejni": "web",
  "tvorba:woo": "eshop",
  "tvorba:kurz": "kurz",
  "bonus:ai_act": "ai",
};

const src = (t: Topic) => `/video-covers/${t}.webp`;

export const videoCover = (key: string, vimeoId?: string | null): string | null => {
  const lecture = vimeoId ? LECTURES[vimeoId] : undefined;
  if (lecture) return src(lecture.topic);
  const topic = CARDS[key];
  return topic ? src(topic) : null;
};

/** Název přednášky, ze které je kapitola (pro štítek na náhledu), jinak null. */
export const lectureName = (vimeoId?: string | null): string | null =>
  (vimeoId && LECTURES[vimeoId]?.name) || null;
