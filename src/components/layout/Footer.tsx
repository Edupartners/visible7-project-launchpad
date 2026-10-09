import { Link } from "react-router-dom";
import { OPERATOR } from "@/lib/legal";

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

          <nav aria-label="Právní informace" className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm">
            <Link to="/podminky" className="text-muted-foreground hover:text-foreground hover:underline">
              Podmínky užívání
            </Link>
            <Link to="/ochrana-osobnich-udaju" className="text-muted-foreground hover:text-foreground hover:underline">
              Ochrana osobních údajů
            </Link>
          </nav>

          <div className="space-y-2 border-t border-border pt-4">
            <div className="text-sm font-medium text-foreground">© 2026 MICEK™ – Všechna práva vyhrazena</div>
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
