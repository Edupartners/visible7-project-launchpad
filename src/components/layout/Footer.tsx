import { Link } from "react-router-dom";
import { OPERATOR } from "@/lib/legal";
import { openCookieSettings } from "@/lib/cookieConsent";
import { FREE_CONSULT_URL } from "@/lib/shop";

type FooterLink = { label: string; to: string; external?: boolean; strong?: boolean };

const GATE_NAMES = ["Vize", "Ideace", "Strategie a čísla", "Implementace", "Budování poptávky", "Launch", "Expanze"];
const sheet = (slug: string) => `/pracovni-listy?list=${slug}`;

/** Rozcestník na konci veřejných stránek: vše důležité ještě jednou na první klik. */
const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Začněte zdarma",
    links: [
      { label: "Otestovat nápad", to: "/home?novy", strong: true },
      { label: "Kvíz: Jaký jste typ podnikatele", to: "/kviz" },
      { label: "Konzultace 20 min zdarma", to: FREE_CONSULT_URL, external: true },
    ],
  },
  {
    title: "Ke stažení",
    links: [
      { label: "Všechny pracovní listy", to: "/pracovni-listy", strong: true },
      { label: "Plakát A3: Od vize k úspěchu", to: sheet("p1-plakat-cesta-visible7") },
      { label: "Startovní balíček: Vize a Ideace", to: sheet("startovni-balicek") },
      { label: "Karta projektu", to: sheet("v0-karta-projektu") },
      { label: "Checklist AI-first web", to: sheet("im3-checklist-ai-first-web") },
      { label: "Lean Canvas", to: sheet("i1-lean-canvas") },
    ],
  },
  {
    title: "Metodika: 7 bran",
    links: GATE_NAMES.map((name, i) => ({ label: `${i + 1} ${name}`, to: `/certifikace#brana-${i + 1}` })),
  },
  {
    title: "Členství",
    links: [
      { label: "Ceník", to: "/cenik" },
      { label: "Certifikace", to: "/certifikace" },
      { label: "Váš nápad a data", to: "/bezpecnost" },
      { label: "Digitální kancelář", to: "/digitalni-kancelar" },
      { label: "Poradci z praxe", to: "/#poradci" },
      { label: "Přihlásit se", to: "/home" },
    ],
  },
  {
    title: "O nás a kontakt",
    links: [
      { label: "Edu Partners", to: "https://www.edu-partners.cz/", external: true },
      { label: "Michal Míček", to: "https://www.michalmicek.cz/", external: true },
      { label: "Michal Míček na LinkedInu", to: "https://www.linkedin.com/in/michalmicek", external: true },
      { label: "Metodika na visible7.cz", to: "https://visible7.cz/", external: true },
      { label: OPERATOR.email, to: `mailto:${OPERATOR.email}`, external: true },
    ],
  },
];

const linkClass = (strong?: boolean) =>
  `inline-block py-1 hover:text-foreground hover:underline ${strong ? "font-semibold text-primary" : "text-muted-foreground"}`;

const ColumnLink = ({ l }: { l: FooterLink }) => {
  if (l.external)
    return (
      <a
        href={l.to}
        className={linkClass(l.strong)}
        {...(l.to.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})}
      >
        {l.label}
      </a>
    );
  // Kotva na úvodní stránce: obyčejný odkaz, aby posun fungoval i ze stejné stránky.
  if (l.to.startsWith("/#"))
    return (
      <a href={l.to} className={linkClass(l.strong)}>
        {l.label}
      </a>
    );
  return (
    <Link to={l.to} className={linkClass(l.strong)}>
      {l.label}
    </Link>
  );
};

const Legal = () => (
  <>
    <nav aria-label="Právní informace" className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm">
      <Link to="/podminky" className="text-muted-foreground hover:text-foreground hover:underline">
        Podmínky užívání
      </Link>
      <Link to="/ochrana-osobnich-udaju" className="text-muted-foreground hover:text-foreground hover:underline">
        Ochrana osobních údajů
      </Link>
      <button
        type="button"
        onClick={openCookieSettings}
        className="text-muted-foreground hover:text-foreground hover:underline"
      >
        Nastavení cookies
      </button>
    </nav>
    <div className="space-y-2 border-t border-border pt-4">
      <div className="text-sm font-medium text-foreground">© 2026 MICEK® – Všechna práva vyhrazena</div>
      <div className="mx-auto max-w-2xl text-xs text-muted-foreground">
        Provozovatel: {OPERATOR.name}, IČO {OPERATOR.ico}, {OPERATOR.address}. Toto dílo je chráněno autorským zákonem.
        Jakékoli neoprávněné užití, kopírování nebo šíření je zakázáno.
      </div>
    </div>
  </>
);

const EduPartners = () => (
  <a
    href="https://www.edu-partners.cz/"
    target="_blank"
    rel="noopener"
    className="mx-auto flex max-w-3xl flex-col items-center gap-1.5 rounded-2xl border border-border px-5 py-4 hover:border-primary/40 sm:flex-row sm:gap-4 sm:text-left"
  >
    <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
      Za projektem stojí
    </span>
    <img
      src="/edu-partners-logo.webp"
      alt="Edu Partners – In education we trust"
      width={480}
      height={91}
      loading="lazy"
      className="h-9 w-auto shrink-0"
    />
    <span className="text-xs text-muted-foreground">
      Vzdělávací společnost z Ostravy, od roku 2011. Akreditované kurzy a reference na edu-partners.cz
    </span>
  </a>
);

/**
 * `full` = velká patička s rozcestníkem pro veřejné stránky,
 * `compact` = malá patička v aplikaci, aby platícím členům nepřekážela nabídka.
 */
export const Footer = ({ variant = "compact" }: { variant?: "full" | "compact" }) => {
  if (variant === "full")
    return (
      <footer className="mt-8 border-t border-border bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 pb-8 pt-14 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-5">
            {COLUMNS.map((c) => (
              <nav key={c.title} aria-label={c.title}>
                <h2 className="text-sm font-bold text-foreground">{c.title}</h2>
                <ul className="mt-3 space-y-0.5 text-sm">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <ColumnLink l={l} />
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
          <div className="mt-12 space-y-5 text-center">
            <EduPartners />
            <Legal />
          </div>
        </div>
      </footer>
    );

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-4 text-center">
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">Máte otázky? Jsme tu pro vás!</div>
            <div className="text-sm text-muted-foreground">
              Napište nám na{" "}
              <a href={`mailto:${OPERATOR.email}`} className="text-primary hover:underline">
                {OPERATOR.email}
              </a>
            </div>
          </div>
          <nav aria-label="Odkazy" className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm">
            <Link to="/pracovni-listy" className="font-semibold text-primary hover:underline">
              Pracovní listy ke stažení
            </Link>
            <Link to="/certifikace" className="text-muted-foreground hover:text-foreground hover:underline">
              Certifikace
            </Link>
            <Link to="/cenik" className="text-muted-foreground hover:text-foreground hover:underline">
              Ceník
            </Link>
          </nav>
          <EduPartners />
          <Legal />
        </div>
      </div>
    </footer>
  );
};
