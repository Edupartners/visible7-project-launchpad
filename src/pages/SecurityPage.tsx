import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Bot, Building2, Eye, Globe2, Lock, Trash2, UserRound, Users, type LucideIcon } from "lucide-react";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { OPERATOR } from "@/lib/legal";
import { track } from "@/lib/track";

const WHO: { icon: LucideIcon; who: string; text: string }[] = [
  {
    icon: UserRound,
    who: "Vy",
    text: "Projekt vidíte jen vy. V aplikaci není sdílení projektu s jinými uživateli.",
  },
  {
    icon: Building2,
    who: "My, provozovatel",
    text: "Obsah projektů nečteme a nepoužíváme ho k vlastnímu podnikání. Administrace aplikace obsah projektů nezobrazuje. Výjimkou je technická podpora, o kterou nás sami požádáte.",
  },
  {
    icon: Bot,
    who: "AI",
    text: "Dostane jen údaje z projektu, které k úkolu potřebuje, a jen když na AI tlačítko kliknete. Vaše jméno ani e-mail neposíláme. Poskytovatel AI data podle svých smluvních podmínek nepoužívá k trénování modelů.",
  },
  {
    icon: Users,
    who: "Poradci",
    text: "Vidí jen to, co jim na konzultaci sami ukážete, a o vašem projektu zachovávají mlčenlivost. Každý z nich má vlastní byznys v jiném oboru.",
  },
  {
    icon: Eye,
    who: "Ostatní uživatelé",
    text: "Nevidí nic. Veřejný je jen web projektu, pokud ho sami zveřejníte, a osvědčení, pokud jeho odkaz sdílíte.",
  },
  {
    icon: Globe2,
    who: "Měření a reklama",
    text: "Do Google Analytics neposíláme jméno, e-mail ani obsah projektů. Měříme jen s vaším souhlasem v liště cookies.",
  },
];

const FAQ: [string, string][] = [
  [
    "Kde jsou moje data uložená?",
    "Databáze aplikace běží v datovém centru v Irsku (EU). Když použijete AI, text se zpracuje u poskytovatele Anthropic v USA. Přenos je chráněný standardními smluvními doložkami a rámcem EU–US Data Privacy Framework.",
  ],
  [
    "Učí se AI na mém nápadu?",
    "Ne. Používáme AI přes placené rozhraní (API) a podle smluvních podmínek poskytovatele se takto zaslaná data k trénování modelů nepoužívají.",
  ],
  [
    "Musím AI používat?",
    "AI se nikdy nespustí sama, vždy jen na vaše kliknutí. Test nápadu na AI stojí, ale brány i finanční plán můžete vyplnit ručně a výpočty aplikace AI nepotřebují.",
  ],
  [
    "Co se stane, když projekt smažu?",
    "Smaže se jeho obsah: všechny fáze, výstupy AI i web projektu se zájemci. Osvědčení, která jste za projekt získali, zůstanou platná. Projekt smažete v Nastavení.",
  ],
  [
    "Jak smažu celý účet?",
    "V Nastavení v části Smazání účtu. Smaže se účet, všechny projekty a vaše data. Zůstanou jen doklady o nákupu, které musíme podle zákona o účetnictví a o DPH uchovat.",
  ],
  [
    "Co sem raději nepsat?",
    "Hesla, čísla účtů a karet, rodná čísla ani údaje o konkrétních zákaznících aplikace nepotřebuje. Projekt může mít klidně krycí název.",
  ],
];

/** Stránka „Váš nápad a data“: srozumitelně, kdo co vidí, co jde do AI a jak data smazat. */
const SecurityPage = () => {
  const navigate = useNavigate();
  const start = () => {
    track("feature_cta_click", { page: "bezpecnost" });
    navigate("/home?novy");
  };

  useEffect(() => {
    document.title = "Váš nápad a data: kdo co vidí a co jde do AI | VISIBLE7 MICEK";
    const meta = document.querySelector('meta[name="description"]');
    const prev = meta?.getAttribute("content") ?? null;
    meta?.setAttribute(
      "content",
      "Projekt vidíte jen vy. AI se spouští jen na kliknutí, bez jména a e-mailu, a na vašem nápadu se neučí. Data v EU, projekt i účet smažete jedním tlačítkem.",
    );
    window.scrollTo(0, 0);
    return () => {
      if (meta && prev !== null) meta.setAttribute("content", prev);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader onStart={start} />
      <main>
        <section className="px-4 pb-14 pt-14 sm:px-8 md:pb-20 md:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-leaf-700">
              <Lock className="h-4 w-4" aria-hidden="true" /> Váš nápad a data
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-5xl lg:text-[3.25rem]">
              Váš nápad zůstává{" "}
              <span className="text-leaf-500 underline decoration-leaf-200 decoration-[0.12em] underline-offset-[0.14em]">
                jen váš
              </span>
              .
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-muted-foreground">
              Bojíte se, že vám někdo nápad vezme, nebo že AI s vašimi údaji naloží po svém? Tady je přesně, kdo co
              vidí, co jde do AI a jak všechno smažete.
            </p>
          </div>
        </section>

        <section className="bg-muted/40 px-4 py-16 sm:px-8 md:py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Kdo váš projekt vidí</h2>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {WHO.map((w) => (
                <div key={w.who} className="rounded-3xl border border-border bg-card p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-leaf-100 text-leaf-700">
                    <w.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold">{w.who}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{w.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-8 md:py-24">
          <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-leaf-700">Upřímně</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                A co když mi nápad někdo ukradne?
              </h2>
              <div className="mt-5 space-y-4 text-lg leading-relaxed text-muted-foreground">
                <p>
                  Samotný nápad právně chránit nejde. Zákon chrání až to, co z něj vytvoříte: značku, texty, design nebo
                  technické řešení. Hodnotu má realizace, ne myšlenka.
                </p>
                <p>
                  Proto u nás váš projekt nikdo nevidí a metodika vás vede k tomu, abyste nápad ověřili rychle a s
                  malými náklady. Kdo má první platící zákazníky, má náskok, který se ukrást nedá.
                </p>
              </div>
            </div>
            <div className="rounded-3xl bg-primary p-7 text-white sm:p-9">
              <h3 className="text-xl font-bold">Jak si nápad pohlídat</h3>
              <ul className="mt-5 space-y-4 text-white/85">
                {[
                  "Dejte projektu v aplikaci krycí název a nápad popište obecně.",
                  "Hesla, čísla účtů, rodná čísla ani údaje zákazníků do aplikace nepište.",
                  "Název značky si můžete chránit ochrannou známkou, technické řešení patentem nebo užitným vzorem.",
                  "S partnery a dodavateli, kterým nápad ukazujete, uzavřete dohodu o mlčenlivosti.",
                ].map((t) => (
                  <li key={t} className="flex gap-3">
                    <Lock className="mt-1 h-4 w-4 shrink-0 text-leaf-300" aria-hidden="true" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-muted/40 px-4 py-16 sm:px-8 md:py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Data, AI a smazání</h2>
            <div className="mt-10 divide-y divide-border rounded-3xl border border-border bg-card">
              {FAQ.map(([q, a]) => (
                <details key={q} className="group p-5 sm:p-6">
                  <summary className="cursor-pointer list-none text-lg font-semibold marker:hidden">{q}</summary>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{a}</p>
                </details>
              ))}
            </div>
            <div className="mt-8 flex flex-col items-start gap-3 rounded-3xl border border-border bg-card p-6 sm:flex-row sm:items-center">
              <Trash2 className="h-6 w-6 shrink-0 text-leaf-700" aria-hidden="true" />
              <p className="flex-1 text-sm leading-relaxed">
                Projekt i celý účet smažete sami v Nastavení aplikace, bez psaní e-mailů a čekání. Podrobnosti najdete v{" "}
                <Link to="/ochrana-osobnich-udaju" className="font-semibold text-primary underline underline-offset-4">
                  zásadách ochrany osobních údajů
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-8 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Kdo za tím stojí</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              VISIBLE7 provozuje {OPERATOR.name}, IČO {OPERATOR.ico}, vzdělávací společnost, která učí podnikat od roku
              2011. Za metodikou stojí Michal Míček. Na otázky k datům odpovíme na{" "}
              <a href={`mailto:${OPERATOR.email}`} className="font-semibold text-primary underline underline-offset-4">
                {OPERATOR.email}
              </a>
              .
            </p>
            <button
              type="button"
              onClick={start}
              className="v7-trap-btn mt-8 inline-flex h-14 items-center justify-center gap-2 pl-7 pr-12 text-base font-bold text-signal-foreground"
            >
              Začít zdarma <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </button>
            <p className="mt-3 text-sm text-muted-foreground">
              Pro registraci stačí e-mail. Platební kartu nezadáváte.
            </p>
          </div>
        </section>
      </main>
      <Footer variant="full" />
    </div>
  );
};

export default SecurityPage;
