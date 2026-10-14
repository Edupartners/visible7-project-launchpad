/**
 * Kvíz „Jaký jste typ začínajícího podnikatele?“
 * Slouží zároveň jako vstupní dotazník pro výzkum motivace dospělých ke vzdělávání.
 * POZOR: položky motivace a bariér jsou PRACOVNÍ VERZE – před ostrým sběrem dat je nahradit
 * validovanou škálou podle školitele a pak už neměnit (jinak nepůjdou odpovědi srovnat).
 */
import { Compass, Hammer, Heart, ShieldCheck, Zap } from "lucide-react";

export const QUIZ_KEY = "entrepreneur_quiz";
export const QUIZ_VERSION = "2026-10-pracovni";

export type TypeId = "svoboda" | "tvurce" | "jistota" | "lovec" | "poslani";
export type BarrierId = "penize" | "technika" | "urady" | "cas" | "dokoncovani";

export interface Choice {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  text: string;
  kind: "choice" | "scale";
  options?: Choice[];
  /** U škály: ke kterému typu nebo bariéře položka patří */
  target?: TypeId | BarrierId | "uceni";
}

export interface Round {
  id: string;
  title: string;
  intro: string;
  questions: Question[];
}

export const SCALE_LABELS = ["Vůbec ne", "Spíš ne", "Napůl", "Spíš ano", "Úplně"];

export const ROUNDS: Round[] = [
  {
    id: "o-vas",
    title: "O vás",
    intro: "Pár rychlých údajů, ať víme, s kým mluvíme.",
    questions: [
      {
        id: "gender",
        text: "Jste",
        kind: "choice",
        options: [
          { value: "zena", label: "Žena" },
          { value: "muz", label: "Muž" },
          { value: "jine", label: "Jinak" },
          { value: "neuvedeno", label: "Nechci uvést" },
        ],
      },
      {
        id: "age",
        text: "Kolik vám je let?",
        kind: "choice",
        options: ["18–24", "25–34", "35–44", "45–54", "55+"].map((v) => ({ value: v, label: v })),
      },
      {
        id: "region",
        text: "Kde žijete?",
        kind: "choice",
        options: [
          "Praha",
          "Středočeský",
          "Jihočeský",
          "Plzeňský",
          "Karlovarský",
          "Ústecký",
          "Liberecký",
          "Královéhradecký",
          "Pardubický",
          "Vysočina",
          "Jihomoravský",
          "Olomoucký",
          "Zlínský",
          "Moravskoslezský",
          "Slovensko",
          "Jinde",
        ].map((v) => ({ value: v, label: v })),
      },
      {
        id: "education",
        text: "Nejvyšší dosažené vzdělání",
        kind: "choice",
        options: [
          { value: "zs", label: "Základní" },
          { value: "ss", label: "Střední bez maturity" },
          { value: "ssm", label: "Střední s maturitou" },
          { value: "vos-bc", label: "VOŠ nebo bakalář" },
          { value: "vs", label: "Magistr a výš" },
        ],
      },
      {
        id: "status",
        text: "Co teď hlavně děláte?",
        kind: "choice",
        options: [
          { value: "zamestnanec", label: "Jsem zaměstnanec" },
          { value: "podnikam", label: "Už podnikám (OSVČ, firma)" },
          { value: "student", label: "Studuji" },
          { value: "rodicovska", label: "Jsem na rodičovské" },
          { value: "bez-prace", label: "Hledám práci" },
          { value: "jine", label: "Něco jiného" },
        ],
      },
    ],
  },
  {
    id: "motivace",
    title: "Co vás žene",
    intro: "Jak moc o vás platí tyhle věty? Neexistuje špatná odpověď.",
    questions: [
      { id: "m_svoboda", kind: "scale", target: "svoboda", text: "Chci si sám(a) rozhodovat o svém čase a práci." },
      { id: "m_tvurce", kind: "scale", target: "tvurce", text: "Baví mě vytvářet věci, pod kterými je moje jméno." },
      {
        id: "m_jistota",
        kind: "scale",
        target: "jistota",
        text: "Než do něčeho půjdu, chci mít jistotu, že to vyjde.",
      },
      { id: "m_lovec", kind: "scale", target: "lovec", text: "Chci vydělávat víc, než mi kdy dá zaměstnání." },
      { id: "m_poslani", kind: "scale", target: "poslani", text: "Chci, aby moje práce pomáhala druhým lidem." },
      {
        id: "m_uceni",
        kind: "scale",
        target: "uceni",
        text: "Učím se nové věci, protože mě to baví, ne protože musím.",
      },
    ],
  },
  {
    id: "bariery",
    title: "Co vás brzdí",
    intro: "Poslední kolo. Upřímnost se vyplatí – podle toho vám ukážeme, kde vám pomůžeme nejvíc.",
    questions: [
      {
        id: "b_penize",
        kind: "scale",
        target: "penize",
        text: "Bojím se, že do podnikání vložím peníze a přijdu o ně.",
      },
      {
        id: "b_technika",
        kind: "scale",
        target: "technika",
        text: "Nevím si rady s webem, e-shopem a online nástroji.",
      },
      { id: "b_urady", kind: "scale", target: "urady", text: "Odrazují mě úřady, daně a strach z pokut." },
      {
        id: "b_cas",
        kind: "scale",
        target: "cas",
        text: "Vedle práce a rodiny mi na vlastní podnikání nezbývá dost času.",
      },
      {
        id: "b_dokoncovani",
        kind: "scale",
        target: "dokoncovani",
        text: "Často něco nadšeně začnu, ale nedotáhnu to do konce.",
      },
    ],
  },
];

export interface TypeInfo {
  id: TypeId;
  name: string;
  tagline: string;
  icon: typeof Compass;
  color: string;
  strength: string;
  trap: string;
  gate: number;
  gateWhy: string;
  advisorId: string;
  motto: string;
}

export const TYPES: Record<TypeId, TypeInfo> = {
  svoboda: {
    id: "svoboda",
    name: "Svobodný duch",
    tagline: "Chcete být svým pánem.",
    icon: Compass,
    color: "from-sky-500 to-indigo-600",
    strength: "Máte odvahu jít vlastní cestou a nebojíte se změny.",
    trap: "Svoboda bez plánu se rychle změní v chaos a nejistý příjem.",
    gate: 3,
    gateWhy: "Byznys case vám ukáže, kolik musíte prodat, abyste byli opravdu svobodní.",
    advisorId: "michal-micek",
    motto: "Svoboda začíná plánem.",
  },
  tvurce: {
    id: "tvurce",
    name: "Tvůrce",
    tagline: "Chcete postavit něco svého.",
    icon: Hammer,
    color: "from-orange-500 to-rose-600",
    strength: "Umíte vytvořit produkt, na který jste hrdí.",
    trap: "Ladíte produkt donekonečna a prodej odkládáte.",
    gate: 5,
    gateWhy: "Marketing a testování vás přinutí ukázat produkt zákazníkům dřív, než bude „dokonalý“.",
    advisorId: "lukas-gvuzd",
    motto: "Hotové je lepší než dokonalé.",
  },
  jistota: {
    id: "jistota",
    name: "Strážce jistoty",
    tagline: "Nejdřív čísla, pak skok.",
    icon: ShieldCheck,
    color: "from-emerald-500 to-teal-700",
    strength: "Přemýšlíte o rizicích a neutrácíte zbytečně.",
    trap: "Čekáte na dokonalý okamžik, který nikdy nepřijde.",
    gate: 6,
    gateWhy: "Launch rozdělí start na malé bezpečné kroky – první zákazník bez velkého rizika.",
    advisorId: "jana-pincova",
    motto: "Malý krok je pořád krok.",
  },
  lovec: {
    id: "lovec",
    name: "Lovec příležitostí",
    tagline: "Vidíte peníze tam, kde ostatní ne.",
    icon: Zap,
    color: "from-amber-400 to-orange-600",
    strength: "Jste rychlí a rozhodní, rychle poznáte příležitost.",
    trap: "Skáčete z nápadu na nápad a žádný nedotáhnete.",
    gate: 1,
    gateWhy: "Strategie modrého oceánu vám pomůže vybrat jednu příležitost, která stojí za to.",
    advisorId: "monika-vesela",
    motto: "Jedna dotažená příležitost je víc než deset rozjetých.",
  },
  poslani: {
    id: "poslani",
    name: "Člověk s posláním",
    tagline: "Chcete, aby vaše práce měla smysl.",
    icon: Heart,
    color: "from-fuchsia-500 to-purple-700",
    strength: "Zákazníci vám věří, protože vám jde o ně.",
    trap: "Podceníte cenu a marži – a z poslání se nedá žít.",
    gate: 3,
    gateWhy: "Byznys case vám ukáže, za kolik musíte prodávat, aby poslání vydrželo.",
    advisorId: "monika-vesela",
    motto: "Aby šlo pomáhat dlouho, musí se to vyplatit.",
  },
};

export const BARRIERS: Record<BarrierId, { name: string; tip: string }> = {
  penize: {
    name: "strach o peníze",
    tip: "Rentgen a byznys case vám ukážou, kolik opravdu potřebujete. Začínáme tím, kolik si můžete dovolit ztratit.",
  },
  technika: {
    name: "technika a web",
    tip: "Ke každému kroku tvorby je videonávod s každým kliknutím. Programovat nemusíte.",
  },
  urady: {
    name: "úřady a daně",
    tip: "Brána 6 vás provede živností, úřady i odvody. S účetnictvím pomůže Jana Pincová.",
  },
  cas: {
    name: "nedostatek času",
    tip: "Mapa A–D počítá s vašimi hodinami týdně. Každý krok je krátký, dá se zvládnout po večerech.",
  },
  dokoncovani: {
    name: "dotahování věcí do konce",
    tip: "Brány a osvědčení vás vedou krok za krokem. Každá brána je malé vítězství, které vás táhne dál.",
  },
};

export type Answers = Record<string, string | number>;

export interface QuizResult {
  type: TypeId;
  scores: Record<TypeId, number>;
  barrier: BarrierId;
  barrierScore: number;
}

const TYPE_ORDER: TypeId[] = ["svoboda", "tvurce", "jistota", "lovec", "poslani"];
const BARRIER_ORDER: BarrierId[] = ["penize", "technika", "urady", "cas", "dokoncovani"];

/** Typ = nejsilnější motivace; při shodě rozhodují bariéry (strach o peníze → Strážce, nedotahování → Lovec). */
export function scoreQuiz(a: Answers): QuizResult {
  const n = (id: string) => Number(a[id] ?? 0);
  const scores = {
    svoboda: n("m_svoboda") * 2,
    tvurce: n("m_tvurce") * 2,
    jistota: n("m_jistota") * 2 + n("b_penize") * 0.5,
    lovec: n("m_lovec") * 2 + n("b_dokoncovani") * 0.5,
    poslani: n("m_poslani") * 2,
  } as Record<TypeId, number>;
  const type = TYPE_ORDER.reduce((best, t) => (scores[t] > scores[best] ? t : best), TYPE_ORDER[0]);
  const barrier = BARRIER_ORDER.reduce((best, b) => (n(`b_${b}`) > n(`b_${best}`) ? b : best), BARRIER_ORDER[0]);
  return { type, scores, barrier, barrierScore: n(`b_${barrier}`) };
}

/** Průběžný odhad po kole „Co vás žene“. */
export const provisionalType = (a: Answers): TypeId | null =>
  ROUNDS[1].questions.every((q) => a[q.id] !== undefined) ? scoreQuiz(a).type : null;

export type QuizStage = "start" | "brana3" | "brana7";

export interface QuizAttempt {
  stage: QuizStage;
  at: string;
  version: string;
  answers: Answers;
  result: QuizResult;
}

export interface QuizData {
  attempts: QuizAttempt[];
}
