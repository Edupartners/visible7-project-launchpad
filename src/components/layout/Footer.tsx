import { Link } from "react-router-dom";
import { OPERATOR } from "@/lib/legal";
import { openCookieSettings } from "@/lib/cookieConsent";

export const Footer = () => {
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
            <Link to="/cenik" className="text-muted-foreground hover:text-foreground hover:underline">
              Ceník
            </Link>
          </nav>
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

          <div className="space-y-2 border-t border-border pt-4">
            <div className="text-sm font-medium text-foreground">© 2026 MICEK® – Všechna práva vyhrazena</div>
            <div className="mx-auto max-w-2xl text-xs text-muted-foreground">
              Provozovatel: {OPERATOR.name}, IČO {OPERATOR.ico}, {OPERATOR.address}. Toto dílo je chráněno autorským
              zákonem. Jakékoli neoprávněné užití, kopírování nebo šíření je zakázáno.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
