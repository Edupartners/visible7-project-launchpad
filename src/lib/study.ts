/**
 * Studium Specialista internetového obchodu (Edu Partners): 20 online setkání s lektory, vlastní projekt,
 * závěrečný den v Praze se zkouškou profesní kvalifikace v ceně. Včetně členství VISIBLE7.
 * Nahrazuje dřívější „Akademii online podnikání s AI“.
 */
export const STUDY = {
  name: "Specialista internetového obchodu",
  sessions: 20,
  period: "únor–květen 2027",
  start: "2027-02-11",
  price: 25000,
  /** Celý kurz Specialista internetového obchodu s lektorem v Edu Partners. */
  usualPrice: 49000,
};

export const STUDY_ITEMS = [
  `${STUDY.sessions} online setkání s lektory z praxe (${STUDY.period})`,
  "Vlastní projekt: web nebo e-shop, marketing a čísla",
  "Konzultace vašeho byznysu s lektory",
  "Závěrečný den v Praze: obhajoba projektu a zkouška profesní kvalifikace",
  "Zkouška v ceně a k tomu vše z členství VISIBLE7",
];

/** Přihlášky do začátku studia. */
export const studyOpen = (now = new Date()) => now < new Date(`${STUDY.start}T17:00:00+01:00`);
