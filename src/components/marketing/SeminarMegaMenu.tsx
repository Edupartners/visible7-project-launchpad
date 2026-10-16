import { Link } from "react-router-dom";

/**
 * Obsah mega menu „Živé semináře“. Semináře se opakují, termíny vypisuje správce v administraci.
 * Písmeno = fáze V-I-S-I-B-L-E, do které seminář patří (stejně jako v menu „Kurzy a videa“).
 */
interface SeminarTopic {
  letter: string;
  title: string;
  hint: string;
}

const START: SeminarTopic = {
  letter: "AI",
  title: "AI nástroje pro zrychlení práce",
  hint: "Úvodní seminář. Nástroje, které vám ušetří hodiny týdně, a jak je použít na vlastním projektu.",
};

const CORE: SeminarTopic[] = [
  { letter: "B", title: "Google Analytics 4", hint: "Měření návštěvnosti a konverzí, abyste věděli, co funguje" },
  { letter: "B", title: "SEO, GEO, AIO a AI trendy", hint: "Jak vás najde Google i AI vyhledávače" },
  { letter: "B", title: "Facebook reklama", hint: "Kampaně, publika a rozpočet, aby se reklama vyplatila" },
  { letter: "I", title: "WordPress + MCP AI", hint: "Web, který s pomocí AI postavíte a spravujete sami" },
];

const EXTRA: SeminarTopic = {
  letter: "V",
  title: "Byznysové strategie: Modrý oceán a Hooked",
  hint: "Jak nesoutěžit cenou a jak si udržet zákazníky, kteří se vracejí",
};

const Badge = ({ letter, accent = false }: { letter: string; accent?: boolean }) => (
  <span
    className={`inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-md px-1 text-[12px] font-extrabold ${
      accent ? "bg-orange-500 text-white" : "bg-foreground text-background"
    }`}
    aria-hidden="true"
  >
    {letter}
  </span>
);

const Topic = ({ t }: { t: SeminarTopic }) => (
  <li className="flex gap-2.5">
    <Badge letter={t.letter} />
    <span className="min-w-0">
      <span className="block font-semibold leading-snug">{t.title}</span>
      <span className="block text-[13px] leading-snug text-muted-foreground">{t.hint}</span>
    </span>
  </li>
);

export const SeminarMegaMenu = ({ id, onStart }: { id: string; onStart: () => void }) => (
  <div
    id={id}
    className="absolute inset-x-0 top-full max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-border bg-background shadow-[0_24px_48px_rgba(15,23,42,0.12)]"
  >
    <div className="mx-auto flex max-w-6xl flex-wrap gap-x-10 gap-y-8 px-4 py-7 sm:px-8 lg:px-12">
      <div className="min-w-0 flex-[999_1_640px]">
        <p className="text-xs font-bold uppercase tracking-[0.12em]">
          Živé semináře{" "}
          <span className="font-medium normal-case tracking-normal">opakují se, takže žádný nezmeškáte</span>
        </p>
        <div className="mb-5 mt-3 h-px bg-border" />

        <div className="flex gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4">
          <Badge letter={START.letter} accent />
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-orange-700">Začněte tady</p>
            <p className="mt-0.5 font-bold leading-snug">{START.title}</p>
            <p className="text-[13px] leading-snug text-muted-foreground">{START.hint}</p>
          </div>
        </div>

        <ul className="mt-6 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
          {CORE.map((t) => (
            <Topic key={t.title} t={t} />
          ))}
        </ul>

        <p className="mt-7 text-xs font-bold uppercase tracking-wider text-muted-foreground">Doplňující</p>
        <ul className="mt-2.5">
          <Topic t={EXTRA} />
        </ul>
      </div>

      <div className="min-w-0 flex-[1_1_220px]">
        <p className="text-xs font-bold uppercase tracking-[0.12em]">Jak semináře probíhají</p>
        <div className="mb-5 mt-3 h-px bg-border" />
        <ul className="space-y-2 text-[15px] text-foreground/80">
          <li>Online, naživo s lektorem z praxe</li>
          <li>Otázky k vašemu projektu</li>
          <li>Každý seminář se opakuje</li>
          <li>Písmeno ukazuje fázi V-I-S-I-B-L-E</li>
        </ul>
        <Link to="/clenstvi" className="mt-6 block font-semibold text-primary underline-offset-4 hover:underline">
          Termíny a členství
        </Link>
        <button
          type="button"
          onClick={onStart}
          className="mt-4 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-[hsl(var(--primary-hover))]"
        >
          Začít zdarma
        </button>
      </div>
    </div>
  </div>
);
