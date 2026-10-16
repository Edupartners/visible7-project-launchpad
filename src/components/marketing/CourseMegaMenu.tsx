import { BUILD_TYPES } from "@/lib/buildPlans";
import { CHANNELS } from "@/lib/marketingPlans";

/**
 * Obsah mega menu „Kurzy a videa“: celý kurz po fázích V-I-S-I-B-L-E.
 * Typy byznysu a kanály se berou přímo z aplikace, takže menu nikdy neslíbí víc, než v ní je.
 */
interface Item {
  title: string;
  hint?: string;
}
interface Phase {
  letter: string;
  name: string;
  note?: string;
  hint?: string;
  items?: Item[];
  groups?: { label: string; items: Item[] }[];
}

const paid = CHANNELS.filter((c) => c.kind === "Placený").map((c) => ({ title: c.name }));
const free = CHANNELS.filter((c) => c.kind === "Neplacený").map((c) => ({ title: c.name }));

const COURSE_PHASES: Phase[] = [
  {
    letter: "V",
    name: "Vize",
    items: [
      { title: "Strategie modrého oceánu", hint: "Jak nesoutěžit cenou a najít vlastní místo na trhu" },
      { title: "Hooked", hint: "Jak vytvořit produkt, ke kterému se lidé vracejí" },
    ],
  },
  {
    letter: "I",
    name: "Ideace",
    items: [
      { title: "Byznys model (Lean Canvas)", hint: "Celý byznys na jedné stránce: zákazník, problém, řešení, příjmy" },
    ],
  },
  {
    letter: "S",
    name: "Strategie a čísla",
    items: [
      { title: "Byznys case", hint: "Plán na 24 měsíců v Excelu" },
      { title: "Bod zvratu a ROI", hint: "Kdy se vám investice vrátí" },
    ],
  },
  {
    letter: "I",
    name: "Implementace",
    note: `${BUILD_TYPES.length - 1}+1 modelů byznysu`,
    items: BUILD_TYPES.map((t) => ({ title: t.name })),
  },
  {
    letter: "B",
    name: "Budování poptávky",
    hint: "Zjistíte, jestli o to lidé stojí, a přivedete je",
    groups: [
      { label: "Měření", items: [{ title: "Měření návštěvnosti a konverzí" }] },
      { label: "Placené kanály", items: paid },
      { label: "Neplacené kanály", items: free },
    ],
  },
  {
    letter: "L",
    name: "Launch",
    items: [
      { title: "MVP a milníky", hint: "Spustíte nejmenší funkční verzi" },
      { title: "První zákazníci a KPI" },
      { title: "Živnost, úřady, účetnictví" },
    ],
  },
  {
    letter: "E",
    name: "Expanze",
    items: [{ title: "Tým", hint: "Kdy a koho nabrat" }, { title: "Automatizace" }, { title: "Růstové pasti" }],
  },
];

const ItemList = ({ items }: { items: Item[] }) => (
  <ul className="space-y-1.5">
    {items.map((it) => (
      <li key={it.title} className="text-[15px] leading-snug text-foreground/80">
        {it.title}
        {it.hint && <span className="block text-[13px] text-muted-foreground">{it.hint}</span>}
      </li>
    ))}
  </ul>
);

const PhaseBlock = ({ p }: { p: Phase }) => (
  <div className="space-y-2.5">
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-bold">
      <span
        className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-foreground text-[13px] font-extrabold text-background"
        aria-hidden="true"
      >
        {p.letter}
      </span>
      <span>{p.name}</span>
      {p.note && <span className="text-[13px] font-medium text-muted-foreground">{p.note}</span>}
    </p>
    {p.hint && <p className="text-[13px] text-muted-foreground">{p.hint}</p>}
    {p.items && <ItemList items={p.items} />}
    {p.groups?.map((g) => (
      <div key={g.label} className="space-y-1.5 pt-1">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{g.label}</p>
        <ItemList items={g.items} />
      </div>
    ))}
  </div>
);

export const CourseMegaMenu = ({ id, onStart }: { id: string; onStart: () => void }) => {
  const [v, i, s, impl, b, l, e] = COURSE_PHASES;
  return (
    <div
      id={id}
      className="absolute inset-x-0 top-full max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-border bg-background shadow-[0_24px_48px_rgba(15,23,42,0.12)]"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap gap-x-10 gap-y-8 px-4 py-7 sm:px-8 lg:px-12">
        <div className="min-w-0 flex-[999_1_640px]">
          <p className="text-xs font-bold uppercase tracking-[0.12em]">
            Kompletní kurz · V-I-S-I-B-L-E{" "}
            <span className="font-medium normal-case tracking-normal">od nápadu po růst</span>
          </p>
          <div className="mb-5 mt-3 h-px bg-border" />
          <div className="grid grid-cols-1 gap-x-6 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-6">
              <PhaseBlock p={v} />
              <PhaseBlock p={i} />
              <PhaseBlock p={s} />
            </div>
            <PhaseBlock p={impl} />
            <PhaseBlock p={b} />
            <div className="space-y-6">
              <PhaseBlock p={l} />
              <PhaseBlock p={e} />
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-[1_1_220px]">
          <p className="text-xs font-bold uppercase tracking-[0.12em]">Ke každé fázi</p>
          <div className="mb-5 mt-3 h-px bg-border" />
          <ul className="space-y-2 text-[15px] text-foreground/80">
            <li>Videa, kde je vidět každé kliknutí</li>
            <li>AI, která zná váš projekt</li>
            <li>Osvědčení za každou bránu</li>
            <li>Živé semináře každých 14 dní</li>
            <li>Seniorní poradci z praxe</li>
          </ul>
          <button
            type="button"
            onClick={onStart}
            className="mt-6 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-[hsl(var(--primary-hover))]"
          >
            Začít zdarma
          </button>
        </div>
      </div>
    </div>
  );
};
