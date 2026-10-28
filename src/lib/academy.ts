/**
 * Akademie online podnikání s AI (Edu Partners) – vyšší balíček nad členstvím VISIBLE7.
 * Objednávka a platba běží na webu Edu Partners. Ceny a termíny držet shodně s tou stránkou.
 */
export const ACADEMY = {
  name: "Akademie online podnikání s AI",
  url: "https://www.edu-partners.cz/akademie-online-podnikani-s-ai/",
  sessions: 20,
  months: 5,
  hours: 60,
  lecturers: 10,
  start: "2027-02-11",
  earlyUntil: "2027-01-15",
  earlyPrice: 14990,
  price: 17900,
  installments: "3 × 5 500 Kč",
  /** Cena jednotlivých kurzů: 20 setkání × 3 000 Kč (uvedeno na stránce Edu Partners). */
  separateValue: 60000,
};

export const ACADEMY_ITEMS = [
  "Vše z členství VISIBLE7",
  "20 živých online setkání s lektory (5 měsíců, 60 hodin)",
  "10 lektorů z praxe a konzultace vašeho projektu",
  "Weby, e-shopy, marketing, GA4 a právo pro online podnikání",
  "Možnost zkoušky profesní kvalifikace Specialista internetového obchodu",
];

const day = (iso: string) => new Date(`${iso}T23:59:59+01:00`);

/** Aktuální cena podle data: early bird do 15. 1., pak plná cena. Po startu se prodej zavře. */
export const academyOffer = (now = new Date()) => {
  const early = now <= day(ACADEMY.earlyUntil);
  const open = now < new Date(`${ACADEMY.start}T17:00:00+01:00`);
  return { early, open, price: early ? ACADEMY.earlyPrice : ACADEMY.price };
};

export const czDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric" });
