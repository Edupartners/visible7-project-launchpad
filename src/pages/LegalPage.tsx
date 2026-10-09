import { Link } from "react-router-dom";
import { LEGAL_VERSION, LegalDoc, OPERATOR } from "@/lib/legal";

/** Veřejná stránka s právním dokumentem (podmínky, zásady GDPR). */
const LegalPage = ({ doc }: { doc: LegalDoc }) => (
  <div className="min-h-screen bg-background">
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-8">
      <Link to="/home" className="text-sm font-semibold text-primary hover:underline">
        Zpět do aplikace VISIBLE7
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight">{doc.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">Platné od {new Date(LEGAL_VERSION).toLocaleDateString("cs-CZ")}</p>
      <p className="mt-6 leading-relaxed">{doc.intro}</p>
      {doc.sections.map((s) => (
        <section key={s.title} className="mt-8">
          <h2 className="text-lg font-bold">{s.title}</h2>
          {s.paragraphs.map((p, i) => (
            <p key={i} className="mt-2 leading-relaxed text-foreground/90">
              {p}
            </p>
          ))}
        </section>
      ))}
      <p className="mt-10 border-t border-border pt-4 text-sm text-muted-foreground">
        {OPERATOR.name}, IČO {OPERATOR.ico}, {OPERATOR.address}. Kontakt: {OPERATOR.email}
      </p>
    </div>
  </div>
);

export default LegalPage;
