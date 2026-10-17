/**
 * Obrázky metodiky (verze s vykáním). Zdroj: Documents › 02 PROJEKTY › VISIBLE7 › Kniha_michal › _zdroj_obrazku
 * (generátor dělá i verzi s tykáním pro knihu).
 */
export const FIGURES = {
  "01_krivka_rustu": "Křivka, po které se pohybujete",
  "02_mapa_visible7": "Cesta V-I-S-I-B-L-E",
  "03_hierarchie": "Víra, vize, strategie, cíle, prostředky",
  "04_errc": "Čtyři otázky ERRC",
  "05_mapa_oceanu": "Mapa modrého oceánu",
  "06_mapa_uzitku": "Mapa užitku",
  "07_lean_canvas": "Lean Canvas",
  "08_bod_zvratu": "Bod zvratu",
  "09_ltv_cac": "LTV a CAC",
  "10_trychtyr": "Prodejní trychtýř",
  "11_hooked": "Hooked model",
  "12_ab_test": "A/B test",
  "13_caesaruv_kvadrant": "Caesarův kvadrant",
  p04_01: "Jak funguje prezentační web",
  p04_02: "Jak funguje web s e-shopem",
  p04_03: "Jak funguje squeeze page",
  p04_04: "Jak funguje konverzní web",
  p04_05: "Jak funguje affiliate web",
  p04_06: "Jak funguje e-shop",
  p04_07: "Jak funguje online kurz",
  p04_08: "Jak funguje komunita",
  p04_09: "Jak funguje placený obsah",
  p04_10: "Jak funguje dropshipping",
  p04_11: "Jak funguje blog",
  p04_12: "Jak funguje marketplace",
  p04_13: "Jak funguje vlastní aplikace",
} as const;
export type FigureId = keyof typeof FIGURES;

/** Procesní diagram ke každému typu byznysu (fáze Implementace). */
export const TYPE_FIGURE: Record<string, FigureId> = {
  "web-prezentacni": "p04_01",
  "web-eshop": "p04_02",
  "squeeze-page": "p04_03",
  "konverzni-web": "p04_04",
  affiliate: "p04_05",
  eshop: "p04_06",
  lms: "p04_07",
  "forum-komunita": "p04_08",
  members: "p04_09",
  dropshipping: "p04_10",
  blog: "p04_11",
  marketplace: "p04_12",
  "vlastni-napad-app": "p04_13",
};

export const figureSrc = (id: FigureId) => `/obrazky/${id}.webp`;
