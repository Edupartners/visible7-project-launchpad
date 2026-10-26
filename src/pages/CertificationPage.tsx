import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Award, BadgeCheck, Briefcase, Check, FileText, Linkedin, QrCode, Rocket } from "lucide-react";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { SPECIALIST_TITLE, certificateSyllabus } from "@/lib/certificates";
import { NSK_QUALIFICATION } from "@/lib/qualification";

const LADDER = [
  {
    when: "Brány 1–5",
    title: "Osvědčení za každou fázi",
    text: "Vize, Ideace, Strategie a čísla, Implementace, Budování poptávky.",
  },
  {
    when: "Po bráně 5",
    title: SPECIALIST_TITLE,
    text: "Celková certifikace s přílohou obsahu programu a výčtem prokázaných dovedností.",
    main: true,
  },
  { when: "Brány 6–7", title: "VISIBLE7 Gold", text: "Za spuštěný projekt s ověřeným IČO a odkazem na web." },
  {
    when: "Volitelně",
    title: "Státní profesní kvalifikace",
    text: `${NSK_QUALIFICATION.name} (${NSK_QUALIFICATION.code}), zkouška u Edu Partners.`,
  },
];

const POSITIONS = [
  {
    icon: Rocket,
    title: "Podnikatel, OSVČ",
    text: "Rozjedete vlastní online projekt: od nápadu přes čísla k prvním zákazníkům.",
  },
  {
    icon: BadgeCheck,
    title: "Specialista online marketingu",
    text: "PPC, sociální sítě, SEO a měření. Vstupní pozice v agentuře i ve firmě.",
  },
  {
    icon: FileText,
    title: "E-commerce specialista",
    text: "Správa e-shopu, produkty, platby, doprava a obchodní podmínky.",
  },
  {
    icon: Briefcase,
    title: "Projektový manažer nových produktů",
    text: "Znáte celý proces startu byznysu. Uplatníte ho i ve firmě u nového produktu.",
  },
];

/** Veřejná stránka certifikace: cesta k osvědčením, obsah programu a uplatnění. */
const CertificationPage = () => {
  const navigate = useNavigate();
  const start = () => navigate("/home?novy");
  const syllabus = certificateSyllabus("gold", null);
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" }), 50);
    return () => clearTimeout(t);
  }, [hash]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader onStart={start} />
      <main>
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-8 md:pt-16 lg:px-12">
          <p className="inline-flex items-center gap-2 rounded-full border border-leaf-200 bg-leaf-50 px-3.5 py-1.5 text-sm font-semibold text-leaf-800">
            <Award className="h-4 w-4" aria-hidden="true" /> Certifikace VISIBLE7 MICEK®
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl">{SPECIALIST_TITLE}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Kompletní program online podnikání a marketingu. Projdete pět bran na vlastním projektu, každou zakončíte
            výstupem a získáte certifikaci s ověřovacím kódem, kterou přidáte do životopisu i na LinkedIn.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={start}
              className="v7-trap-btn pl-6 pr-12 py-4 font-bold text-signal-foreground"
            >
              Otestovat nápad zdarma
            </button>
            <Link to="/cenik" className="px-2 font-semibold text-primary underline-offset-4 hover:underline">
              Ceník členství
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Vydává Edu Partners s.r.o., vzdělávací společnost s akreditacemi MŠMT a MPO, vzděláváme od roku 2011.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-8 lg:px-12">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Cesta k certifikaci</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-4">
            {LADDER.map((s, i) => (
              <li
                key={s.when}
                className={`rounded-2xl p-6 ${s.main ? "bg-primary text-white" : "border border-border bg-card"}`}
              >
                <p className={`text-sm font-semibold ${s.main ? "text-white/70" : "text-muted-foreground"}`}>
                  {i + 1} · {s.when}
                </p>
                <h3 className="mt-2 text-lg font-bold leading-snug">{s.title}</h3>
                <p className={`mt-2 text-sm leading-relaxed ${s.main ? "text-white/80" : "text-muted-foreground"}`}>
                  {s.text}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="px-3 py-2 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1280px] rounded-[2rem] bg-muted/50 py-16 md:py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-8 lg:px-12">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Co budete umět</h2>
              <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
                Brány 1–5 vedou k certifikaci, brány 6–7 k VISIBLE7 Gold. Stejný obsah uvádí příloha osvědčení.
              </p>
              <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {syllabus.map((s) => (
                  <div key={s.phase} id={`brana-${s.phase}`} className="scroll-mt-24 rounded-2xl bg-card p-6">
                    <p className="text-sm font-semibold text-leaf-700">
                      Brána {s.phase}
                      {s.phase > 5 && <span className="ml-2 text-muted-foreground">· pro VISIBLE7 Gold</span>}
                    </p>
                    <h3 className="mt-1 text-xl font-bold">{s.name}</h3>
                    <ul className="mt-3 space-y-2 text-sm">
                      {s.topics.map((t) => (
                        <li key={t} className="flex gap-2">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 border-t border-border pt-3 text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">Výstup:</span> {s.outputs.join(", ")}
                    </p>
                  </div>
                ))}
                <div className="flex flex-col justify-center rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">Na certifikaci</p>
                  <p className="mt-2 flex items-center gap-2">
                    <QrCode className="h-4 w-4" aria-hidden="true" /> QR kód a ověření pravosti
                  </p>
                  <p className="mt-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" aria-hidden="true" /> Příloha s obsahem programu
                  </p>
                  <p className="mt-2 flex items-center gap-2">
                    <Linkedin className="h-4 w-4" aria-hidden="true" /> Přidání na LinkedIn jedním klikem
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-8 lg:px-12">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Kde se uplatníte</h2>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            Program dává pevný základ pro vlastní podnikání i pro vstupní pozice v marketingu a e-commerce.
          </p>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2">
            {POSITIONS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4 rounded-2xl border border-border p-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-bold">{title}</h3>
                  <p className="mt-1 text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="px-3 py-2 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] bg-leaf-500 text-white">
            <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-8 lg:px-12 md:grid-cols-[1.3fr_1fr] md:py-20">
              <div>
                <p className="font-semibold text-white/80">Volitelně, po bráně {NSK_QUALIFICATION.unlockGate}</p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Státem uznaná profesní kvalifikace
                </h2>
                <p className="mt-4 text-lg text-white/85">
                  Můžete se přihlásit ke zkoušce profesní kvalifikace <strong>{NSK_QUALIFICATION.name}</strong>. Zkoušku
                  pořádá Edu Partners jako autorizovaná osoba. Aplikace vás na ni připraví, osvědčení o profesní
                  kvalifikaci vydává autorizovaná osoba po složení zkoušky.
                </p>
                <a
                  href={NSK_QUALIFICATION.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-block font-semibold underline underline-offset-4 hover:no-underline"
                >
                  Kvalifikace v Národní soustavě kvalifikací
                </a>
              </div>
              <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/20">
                {[
                  ["Kód kvalifikace", NSK_QUALIFICATION.code],
                  ["Úroveň", `EQF ${NSK_QUALIFICATION.eqf}`],
                  ["Uznává", "Národní soustava kvalifikací"],
                  ["Přihlášení", `po bráně ${NSK_QUALIFICATION.unlockGate}`],
                ].map(([l, v]) => (
                  <div key={l} className="bg-leaf-700 p-5">
                    <dt className="text-sm text-white/70">{l}</dt>
                    <dd className="mt-1 text-xl font-bold">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Začněte zdarma</h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Rentgen nápadu a první dvě brány vyzkoušíte bez platební karty.
          </p>
          <button
            type="button"
            onClick={start}
            className="v7-trap-btn mt-8 pl-6 pr-12 py-4 font-bold text-signal-foreground"
          >
            Otestovat nápad zdarma
          </button>
        </section>
      </main>
      <Footer variant="full" />
    </div>
  );
};

export default CertificationPage;
