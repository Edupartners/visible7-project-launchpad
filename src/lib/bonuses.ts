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
      "Co je umělá inteligence podle AI Actu a na čem zákon stojí (GDPR, jednotný trh)",
      "Pyramida rizik: zakázané, vysoce rizikové a běžné systémy",
      "Limity AI a lidský dohled nad výstupy (human in the loop)",
      "Co do AI nikdy nevkládat a schválené nástroje ve firmě",
      "Označování výstupů z AI a transparentnost vůči klientům",
      "Odpovědnost za výstupy a sankce za porušení",
    ],
  },
  {
    id: "grafika",
    title: "Grafika zdarma ve Photopea",
    lead: "Dva celodenní workshopy krok za krokem: reklamní banner a produktový vizuál v bezplatné kopii Photoshopu.",
    why: "Banner do reklamy nebo obrázek na web si upravíte sami, bez grafika a bez placeného Photoshopu.",
    certificateFor: "za absolvování workshopu grafiky ve Photopea (tvorba bannerů a úprava fotografií)",
    skills: ["úprava fotografií", "tvorba reklamních bannerů", "práce s vrstvami a maskami"],
    topics: [
      "Fotobanky, ikony a písma zdarma i placené a jejich licence",
      "Prostředí Photopea: vrstvy, nástroje, rozměry a rozlišení",
      "Banner krok za krokem: fotka, text, tlačítko, efekty",
      "Export pro Google Ads a Sklik: rozměr a datová velikost",
      "Odstranění pozadí, masky a nástroje výběru",
      "Vrstvy úprav, pero, přechody, stíny a filtry",
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
      "Proč být vidět v AI a model E-E-A-T",
      "Jak AI čte web: schema.org, nadpisy a tvrdá data před textem",
      "Vlastní doména, odkazy, recenze, PR a Wikidata",
      "Sekce osobního webu, USP a časté dotazy (FAQ)",
      "Soubory pro roboty: sitemap, robots.txt, llms.txt",
      "Kdy se v AI objevíte a jak to měřit",
    ],
  },
];

export const bonusById = (id: string | null | undefined) => BONUSES.find((b) => b.id === id) ?? null;

/** Bonus jako „karta“ pro přehrávač videí a administraci. */
export const bonusBlock = (b: Bonus): BuildBlock => ({ id: b.id, title: b.title, goal: b.lead, steps: [], minutes: 0 });
