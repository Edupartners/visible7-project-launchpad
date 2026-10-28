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
];

export const bonusById = (id: string | null | undefined) => BONUSES.find((b) => b.id === id) ?? null;

/** Bonus jako „karta“ pro přehrávač videí a administraci. */
export const bonusBlock = (b: Bonus): BuildBlock => ({ id: b.id, title: b.title, goal: b.lead, steps: [], minutes: 0 });
