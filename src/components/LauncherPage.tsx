import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/Footer";
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  ExternalLink,
  Eye,
  GraduationCap,
  Hammer,
  Lightbulb,
  Lock,
  MessageSquareText,
  Play,
  Rocket,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

interface LauncherPageProps {
  onAccessGranted: () => void;
}

type GateStatus = "done" | "active" | "locked";

const METHODOLOGY_STEPS = [
  {
    id: 1,
    title: "Vize",
    icon: Eye,
    status: "done" as GateStatus,
    tool: "Blue Ocean Strategy / ERRC",
    criterion: "Formulovaná vize a jasné odlišení",
  },
  {
    id: 2,
    title: "Ideace",
    icon: Lightbulb,
    status: "active" as GateStatus,
    tool: "Lean Canvas",
    criterion: "Ověřený problém, řešení a zákazník",
  },
  {
    id: 3,
    title: "Strategie",
    icon: Target,
    status: "locked" as GateStatus,
    tool: "ROI a finanční plán",
    criterion: "Životaschopný model a cílová čísla",
  },
  {
    id: 4,
    title: "Implementace",
    icon: Hammer,
    status: "locked" as GateStatus,
    tool: "Roadmapy a šablony",
    criterion: "Funkční první verze řešení",
  },
  {
    id: 5,
    title: "Benchmarking",
    icon: BarChart3,
    status: "locked" as GateStatus,
    tool: "Marketingové testy",
    criterion: "Data potvrzující fungující kanály",
  },
  {
    id: 6,
    title: "Launch",
    icon: Rocket,
    status: "locked" as GateStatus,
    tool: "Go-to-market a KPI",
    criterion: "Připravený a vyhodnocený vstup na trh",
  },
  {
    id: 7,
    title: "Expanze",
    icon: TrendingUp,
    status: "locked" as GateStatus,
    tool: "Růstové kalkulačky",
    criterion: "Plán škálování s měřitelnými cíli",
  },
];

const AUDIENCES = [
  "Studenti VISIBLE7 MICEK, kteří chtějí převést teorii do praxe",
  "Absolventi Edu Partners připravení rozvíjet vlastní projekt",
  "Začínající podnikatelé, kteří potřebují jasný postup",
  "Tvůrci existujících projektů, kteří hledají další směr růstu",
];

const HOW_TO_JOIN = [
  { title: "Získej přístup", text: "Pilot je určen studentům a absolventům programu." },
  { title: "Vstup heslem", text: "Použij sdílené pilotní heslo na vstupní obrazovce." },
  { title: "Projdi sedm fází", text: "Postupuj branami a ukládej si výsledky jednotlivých kroků." },
  { title: "Sdílej zkušenost", text: "Řekni nám, co funguje a co máme pro další verzi zlepšit." },
];

const STATUS_LABELS: Record<GateStatus, string> = {
  done: "Hotovo",
  active: "Aktivní",
  locked: "Zamčeno",
};

const StatusIcon = ({ status }: { status: GateStatus }) => {
  if (status === "done") return <Check className="h-4 w-4" aria-hidden="true" />;
  if (status === "active") return <Play className="h-4 w-4 fill-current" aria-hidden="true" />;
  return <Lock className="h-4 w-4" aria-hidden="true" />;
};

export const LauncherPage = ({ onAccessGranted }: LauncherPageProps) => {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <main>
        <section className="relative overflow-hidden bg-ink text-paper">
          <div className="absolute inset-x-0 top-0 h-1 bg-gate-copper" aria-hidden="true" />
          <div className="mx-auto flex min-h-[620px] max-w-7xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
            <div className="mb-8 flex h-20 w-20 items-center justify-center border border-paper/20 bg-paper/10">
              <span className="text-2xl font-bold text-paper">V7</span>
            </div>
            <span className="mb-7 inline-flex items-center gap-2 border border-gate-copper/60 bg-gate-copper/10 px-4 py-2 text-sm font-semibold text-gate-copper">
              <GraduationCap className="h-4 w-4" aria-hidden="true" />
              Pilotní beta, jen pro studenty VISIBLE7 MICEK
            </span>
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-paper/65">VISIBLE7 MICEK™</p>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight text-paper sm:text-5xl lg:text-6xl">
              Proveď svůj nápad sedmi fázemi od vize po expanzi
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-paper/70">
              Praktický pracovní prostor pro systematický rozvoj podnikatelského nápadu — krok za krokem, s jasným výstupem každé fáze.
            </p>
            <Button
              onClick={onAccessGranted}
              size="lg"
              className="mt-10 h-14 bg-gate-copper px-8 text-base text-gate-copper-foreground shadow-none hover:bg-gate-copper/90"
            >
              Vstoupit do pilotu
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
        </section>

        <section className="bg-paper py-16 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-[0.7fr_1.3fr] md:items-start lg:px-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-brand-blue">Metodika</p>
              <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">Co je VISIBLE7</h2>
            </div>
            <div className="border-l-4 border-gate-copper pl-6">
              <p className="text-lg leading-8 text-ink/75">
                VISIBLE7 je praktická metodika, která propojuje strategii, finance, realizaci i růst. Pomáhá proměnit první nápad v ověřený projekt pomocí sedmi navazujících fází a jasných rozhodovacích bran.
              </p>
              <a
                href="https://visible7.cz"
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 font-semibold text-brand-blue underline decoration-brand-blue/30 underline-offset-4 transition-colors hover:text-gate-copper"
              >
                Více o metodice na visible7.cz
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section className="bg-ink py-16 text-paper sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-bold uppercase tracking-widest text-gate-copper">Stage-gate metodika</p>
            <h2 className="mt-3 text-3xl font-bold text-paper sm:text-4xl">Sedm fází, sedm bran</h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-paper/65">
              Každá fáze má vlastní nástroj a měřitelný výstup. Další brána dává smysl až ve chvíli, kdy je ta předchozí splněná.
            </p>

            <div className="relative mt-12">
              <div className="absolute bottom-0 left-6 top-0 w-px bg-paper/15 md:bottom-auto md:left-0 md:right-0 md:top-7 md:h-px md:w-auto" aria-hidden="true" />
              <div className="relative grid gap-4 md:grid-cols-7 md:gap-2">
                {METHODOLOGY_STEPS.map((step) => {
                  const StepIcon = step.icon;
                  const statusClass = step.status === "done"
                    ? "border-gate-teal bg-gate-teal text-gate-teal-foreground"
                    : step.status === "active"
                      ? "border-gate-copper bg-gate-copper text-gate-copper-foreground"
                      : "border-paper/25 bg-ink text-paper/55";

                  return (
                    <article key={step.id} className="grid grid-cols-[3rem_1fr] gap-4 bg-ink py-3 md:block md:py-0">
                      <div className={`relative z-10 flex h-12 w-12 items-center justify-center border-2 ${statusClass}`}>
                        <StatusIcon status={step.status} />
                      </div>
                      <div className="md:mt-5">
                        <div className="flex items-center gap-2 md:block">
                          <span className="text-xs font-bold uppercase tracking-widest text-paper/45">Brána {step.id}</span>
                          <span className={`text-xs font-semibold md:mt-2 md:flex md:items-center md:gap-1.5 ${step.status === "done" ? "text-gate-teal" : step.status === "active" ? "text-gate-copper" : "text-paper/45"}`}>
                            <StatusIcon status={step.status} />
                            {STATUS_LABELS[step.status]}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <StepIcon className="h-5 w-5 text-paper/70" aria-hidden="true" />
                          <h3 className="text-lg font-bold text-paper">{step.title}</h3>
                        </div>
                        <dl className="mt-4 space-y-3 text-sm leading-6">
                          <div>
                            <dt className="font-semibold text-paper/45">Nástroj</dt>
                            <dd className="text-paper/80">{step.tool}</dd>
                          </div>
                          <div>
                            <dt className="font-semibold text-paper/45">Výstupní kritérium</dt>
                            <dd className="text-paper/80">{step.criterion}</dd>
                          </div>
                        </dl>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-paper py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-bold uppercase tracking-widest text-brand-blue">Uzavřená skupina</p>
            <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">Pro koho je pilot</h2>
            <div className="mt-10 grid gap-px overflow-hidden border border-ink/10 bg-ink/10 md:grid-cols-2">
              {AUDIENCES.map((audience) => (
                <div key={audience} className="flex gap-4 bg-paper p-6 sm:p-8">
                  <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-gate-copper" aria-hidden="true" />
                  <p className="font-medium leading-7 text-ink/80">{audience}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-brand-blue py-16 text-paper sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-bold uppercase tracking-widest text-gate-copper">Začni jednoduše</p>
            <h2 className="mt-3 text-3xl font-bold text-paper sm:text-4xl">Jak se zapojit</h2>
            <ol className="mt-10 grid gap-8 md:grid-cols-4 md:gap-4">
              {HOW_TO_JOIN.map((item, index) => (
                <li key={item.title} className="border-t border-paper/25 pt-5">
                  <span className="text-4xl font-bold text-gate-copper">0{index + 1}</span>
                  <h3 className="mt-5 text-xl font-bold text-paper">{item.title}</h3>
                  <p className="mt-2 leading-7 text-paper/70">{item.text}</p>
                </li>
              ))}
            </ol>
            <Button
              onClick={onAccessGranted}
              size="lg"
              className="mt-12 h-14 bg-gate-copper px-8 text-base text-gate-copper-foreground shadow-none hover:bg-gate-copper/90"
            >
              Vstoupit do pilotu
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
        </section>

        <section className="bg-paper py-16 sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-[1fr_1.3fr] md:items-end lg:px-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-brand-blue">Autor metodiky</p>
              <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">Michal Míček</h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-ink/70">
                Podnikatel, lektor a autor metodiky VISIBLE7. Propojuje praktickou zkušenost s výukou, která vede od nápadu k reálnému výsledku.
              </p>
            </div>
            <dl className="grid gap-px overflow-hidden border border-ink/10 bg-ink/10 sm:grid-cols-3">
              <div className="bg-paper p-6">
                <dd className="text-3xl font-bold text-gate-copper">14+</dd>
                <dt className="mt-2 text-sm font-semibold text-ink/65">let praxe</dt>
              </div>
              <div className="bg-paper p-6">
                <dd className="text-3xl font-bold text-gate-copper">1000+</dd>
                <dt className="mt-2 text-sm font-semibold text-ink/65">absolventů</dt>
              </div>
              <div className="bg-paper p-6">
                <dd className="text-2xl font-bold text-gate-copper">MŠMT / MPO</dd>
                <dt className="mt-2 text-sm font-semibold text-ink/65">akreditace</dt>
              </div>
            </dl>
          </div>
        </section>

        <section className="bg-gate-copper py-10 text-gate-copper-foreground">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <div className="flex items-center gap-4">
              <MessageSquareText className="h-8 w-8 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-bold uppercase tracking-widest opacity-70">Společně tvoříme další verzi</p>
                <h2 className="mt-1 text-2xl font-bold">Tohle je beta. Tvoje zpětná vazba nás posouvá dál.</h2>
              </div>
            </div>
            <a href="mailto:michal.micek@edu-patners.cz?subject=Zpětná vazba k pilotu VISIBLE7" className="shrink-0 font-bold underline decoration-current/40 underline-offset-4 hover:decoration-current">
              Poslat zpětnou vazbu
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};