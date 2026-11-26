/**
 * Bonusy: samostatné videokurzy mimo brány. Videa se spravují v Administraci › Videa ke kartám
 * pod oblastí „Bonusy“ (klíč karty "bonus:<id>"). Po zhlédnutí všech videí si člověk vystaví osvědčení.
 */
import type { BuildBlock } from "@/lib/buildPlans";

export interface Bonus {
  id: string;
  title: string;
  /** Krátký popis na kartu bonusu */
  lead: string;
  /** Proč to člověka zajímá (jedna věta) */
  why: string;
  /** Text osvědčení: „za absolvování …“ */
  certificateFor: string;
  skills: string[];
  topics: string[];
}

export const BONUSES: Bonus[] = [
  {
    id: "ai_act",
    title: "AI Act v praxi",
    lead: "Pravidla Evropské unie pro umělou inteligenci za 23 minut: co smíte, co ne a na co si dát pozor ve firmě.",
    why: "Firmy, které AI používají, mají podle AI Actu povinnost zajistit, aby lidé uměli s AI zacházet. Osvědčení to doloží.",
    certificateFor: "za absolvování videokurzu o pravidlech Evropské unie pro umělou inteligenci (AI Act)",
    skills: ["odpovědné používání AI", "orientace v pravidlech AI Actu"],
    topics: [
      "Rozumí základům AI Actu a pozná zakázané a vysoce rizikové systémy",
      "Používá AI s lidskou kontrolou výstupů",
      "Ví, jaká data do AI nevkládat a které nástroje jsou ve firmě schválené",
      "Označuje výstupy z AI a zná odpovědnost a sankce",
    ],
  },
  {
    id: "grafika",
    title: "Grafika ve Photopea",
    lead: "Dva celodenní workshopy krok za krokem: reklamní banner a produktový vizuál v bezplatné kopii Photoshopu.",
    why: "Banner do reklamy nebo obrázek na web si upravíte sami, bez grafika a bez placeného Photoshopu.",
    certificateFor: "za absolvování workshopu grafiky ve Photopea (tvorba bannerů a úprava fotografií)",
    skills: ["úprava fotografií", "tvorba reklamních bannerů", "práce s vrstvami a maskami"],
    topics: [
      "Vybere fotky, ikony a písma s ohledem na licence",
      "Vytvoří reklamní banner ve Photopea a exportuje ho pro Google Ads a Sklik",
      "Odstraní pozadí a pracuje s vrstvami, maskami a filtry",
    ],
  },
  {
    id: "ai_viditelnost",
    title: "Buď vidět pro lidi i AI",
    lead: "Jak se dostat do odpovědí ChatGPT, Gemini a Perplexity: osobní autoritní web, data pro roboty a digitální stopa.",
    why: "Lidé se čím dál častěji ptají AI místo Googlu. Kdo v jejích odpovědích není, toho zákazník nenajde.",
    certificateFor: "za absolvování videokurzu o viditelnosti webu a značky ve vyhledávání s umělou inteligencí",
    skills: ["optimalizace webu pro AI vyhledávání", "budování digitální autority"],
    topics: [
      "Vysvětlí, jak AI vybírá zdroje, a uplatní model E-E-A-T",
      "Připraví web pro AI: strukturovaná data, nadpisy a fakta",
      "Buduje digitální stopu: doména, odkazy, recenze a PR",
      "Nastaví soubory pro roboty a měří viditelnost v AI",
    ],
  },
  {
    id: "ai_prakticky",
    title: "AI v praxi: od promptu k webu bez programování",
    lead: "ChatGPT, Claude, NotebookLM, Google AI Studio a Lovable na ukázkách z praxe: jak AI zadávat práci a jak si s ní postavit první web.",
    why: "AI dnes udělá velkou část práce za vás, pokud víte, který nástroj na co použít a jak mu práci zadat.",
    certificateFor: "za absolvování videokurzu o praktickém využití umělé inteligence v podnikání",
    skills: ["práce s AI asistenty", "psaní promptů", "tvorba webu a aplikace pomocí AI"],
    topics: [
      "Vybere vhodný AI nástroj pro konkrétní úkol a zná jeho limity",
      "Napíše účinný prompt a nechá AI připravit zadání",
      "Využívá ChatGPT, Claude a NotebookLM v každodenní práci",
      "Postaví jednoduchou aplikaci a web pomocí AI bez programování",
    ],
  },
];

export const bonusById = (id: string | null | undefined) => BONUSES.find((b) => b.id === id) ?? null;

/** Bonus jako „karta“ pro přehrávač videí a administraci. */
export const bonusBlock = (b: Bonus): BuildBlock => ({ id: b.id, title: b.title, goal: b.lead, steps: [], minutes: 0 });
