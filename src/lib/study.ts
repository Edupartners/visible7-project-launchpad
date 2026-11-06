import type { ShopSettings } from "@/lib/shop";

/**
 * Studium Specialista internetového obchodu (Edu Partners): 20 online setkání s lektory, vlastní projekt,
 * závěrečný den v Praze se zkouškou profesní kvalifikace v ceně. Včetně členství VISIBLE7.
 * Cena: prvních 15 přihlášených 20 000 Kč, potom 25 000 Kč. Najednou, nebo v 5 platbách
 * (zápisné při přihlášce + platba za každý měsíc studia únor–květen; nejde o úvěr, každá platba je za daný měsíc).
 */
export const STUDY = {
  name: "Specialista internetového obchodu",
  sessions: 20,
  period: "únor–červen 2027",
  /** Pro texty: začátek a konec semestru */
  dates: "11. 2. – první týden v červnu 2027",
  start: "2027-02-11",
  price: 25000,
  earlyPrice: 20000,
  earlySeats: 15,
  payments: 5,
};

export const STUDY_ITEMS = [
  `${STUDY.sessions} online setkání s lektory z praxe (únor–květen)`,
  "Vlastní projekt: web nebo e-shop, marketing a čísla",
  "Konzultace vašeho byznysu s lektory",
  "Závěrečný den v Praze (první týden v červnu): obhajoba projektu a zkouška profesní kvalifikace",
  "Zkouška v ceně a k tomu vše z členství VISIBLE7",
];

/** Přihlášky do začátku studia. */
export const studyOpen = (now = new Date()) => now < new Date(`${STUDY.start}T17:00:00+01:00`);

/**
 * Aktuální nabídka podle nastavení v administraci (Prodej → zbývající místa za zvýhodněnou cenu).
 * Bez nastavení platí zvýhodněná cena se všemi 15 místy.
 */
export function studyOffer(shop: ShopSettings) {
  const left = Math.max(0, Math.min(STUDY.earlySeats, shop.study_early_left ?? STUDY.earlySeats));
  const early = left > 0;
  const price = early ? STUDY.earlyPrice : STUDY.price;
  return { early, left, price, monthly: Math.round(price / STUDY.payments) };
}

/** 1 místo, 2–4 místa, 5+ míst */
export const seatsLabel = (n: number) => `${n} ${n === 1 ? "místo" : n < 5 ? "místa" : "míst"}`;
