import { MyBusinessTeaser } from "@/components/business/MyBusinessTeaser";
import { QuizDashboardCard } from "@/components/quiz/QuizCards";
import { MembershipCard } from "@/components/access/MembershipCta";
import { DashboardAnnouncements } from "@/components/announcements/NotificationBell";
import { track } from "@/lib/track";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarLayout } from "./layout/AppSidebar";
import { Footer } from "./layout/Footer";
import { GateJourney } from "./GateJourney";
import { DashboardJourney } from "./diagnosis/DashboardJourney";
import { GrowthBadge } from "./GrowthBadge";
import { DIAGNOSIS_KEY } from "@/lib/diagnosis";
import { NSK_QUALIFICATION, qualificationMailto } from "@/lib/qualification";
import { GATE_NAMES, listMyCertificates } from "@/lib/certificates";
import { useSupabaseProgress } from "@/hooks/useSupabaseProgress";
import { useProject } from "@/contexts/ProjectContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  Award,
  Check,
  Clock,
  FlaskConical,
  Layers,
  Lightbulb,
  Pencil,
  Rocket,
  Target,
  TrendingUp,
  Wrench,
  BarChart3,
  X,
  PartyPopper,
} from "lucide-react";

const phases = [
  {
    id: 1,
    description: "Najděte místo mezi levnou a prémiovou konkurencí.",
    icon: Target,
    time: "45 min",
    route: "/vision",
  },
  {
    id: 2,
    description: "Celý byznys na jedné stránce, s návrhy od AI.",
    icon: Lightbulb,
    time: "25 min",
    route: "/ideation",
  },
  {
    id: 3,
    description: "Návratnost, PNO, bod zvratu a potřebný kapitál.",
    icon: TrendingUp,
    time: "60 min",
    route: "/strategy",
  },
  {
    id: 4,
    description: "Postup tvorby podle typu vašeho byznysu.",
    icon: Wrench,
    time: "20 min",
    route: "/implementation",
  },
  {
    id: 5,
    description: "Marketingové kanály seřazené podle vašeho zákazníka.",
    icon: BarChart3,
    time: "35 min",
    route: "/benchmarking-phase",
  },
  { id: 6, description: "Spuštění projektu a sledované ukazatele.", icon: Rocket, time: "40 min", route: "/launch" },
  { id: 7, description: "Jak projekt rozšiřovat, když už běží.", icon: Layers, time: "50 min", route: "/expansion" },
];

interface DashboardProps {
  userEmail: string;
  onLogout: () => void;
  isAuthenticated?: boolean;
}

/** Název projektu s možností přejmenovat přímo v nadpisu. */
const ProjectTitle = () => {
  const { currentProject, renameProject } = useProject();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");

  if (!currentProject) return <div className="h-12 w-64 animate-pulse rounded-xl bg-muted" />;

  if (editing) {
    return (
      <form
        className="flex max-w-xl items-center gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (name.trim()) await renameProject(currentProject.id, name);
          setEditing(false);
        }}
      >
        <Input value={name} onChange={(e) => setName(e.target.value)} className="h-12 text-xl font-bold" autoFocus />
        <Button type="submit" size="icon" className="h-12 w-12 shrink-0 rounded-xl" aria-label="Uložit název">
          <Check className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-12 w-12 shrink-0 rounded-xl"
          onClick={() => setEditing(false)}
          aria-label="Zrušit"
        >
          <X className="h-5 w-5" />
        </Button>
      </form>
    );
  }

  return (
    <div className="group flex items-center gap-2">
      <h1 className="break-words text-3xl font-extrabold tracking-tight sm:text-[2.5rem] sm:leading-tight">
        {currentProject.name}
      </h1>
      <button
        type="button"
        onClick={() => {
          setName(currentProject.name);
          setEditing(true);
        }}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Přejmenovat projekt"
        title="Přejmenovat projekt"
      >
        <Pencil className="h-4 w-4" />
      </button>
    </div>
  );
};

export const Dashboard = (_props: DashboardProps) => {
  const navigate = useNavigate();
  const { currentProject } = useProject();
  const [completedPhases] = useSupabaseProgress<number[]>("completed_phases", []);
  const [diagnosis, , { loading: diagnosisLoading }] = useSupabaseProgress<unknown>(DIAGNOSIS_KEY, null);
  const [certCount, setCertCount] = useState<number | null>(null);

  useEffect(() => {
    listMyCertificates().then((list) => {
      const mine = list.filter((c) => c.project_id === currentProject?.id);
      setCertCount(mine.length);
    });
  }, [currentProject?.id]);

  const done = new Set(completedPhases);
  const next = phases.find((p) => !done.has(p.id)) ?? null;
  const doneCount = phases.filter((p) => done.has(p.id)).length;
  const certsAvailable = phases.filter((p) => done.has(p.id)).length - (certCount ?? 0);
  const NextIcon = next?.icon;

  // Jeden tip podle situace (KISS): nikdy víc karet najednou.
  const tip: "certs" | "web" | "nsk" | "quiz" | null =
    certsAvailable > 0
      ? "certs"
      : done.has(3) && !done.has(5)
        ? "web"
        : done.has(NSK_QUALIFICATION.unlockGate)
          ? "nsk"
          : !diagnosisLoading && (diagnosis || doneCount > 0)
            ? "quiz"
            : null;

  return (
    <SidebarLayout>
      <main className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-8 sm:py-10">
        {/* Projekt */}
        <header className="flex flex-col-reverse gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <ProjectTitle />
            <p className="mt-1 text-sm text-muted-foreground">Otevřeno {doneCount} ze 7 bran</p>
          </div>
          <div className="self-end sm:self-auto">
            <GrowthBadge currentCompleted={doneCount} />
          </div>
        </header>

        <DashboardAnnouncements />

        {/* Jen naléhavé stavy členství (končí zkušební přístup) */}
        <MembershipCard placement="top" />

        {/* Kdo už podniká: vstup do Můj podnik */}
        <MyBusinessTeaser />

        {/* Bez rentgenu na začátku cesty: rentgen je první krok */}
        {!diagnosisLoading && !diagnosis && doneCount === 0 && <DashboardJourney prominent />}

        {/* Co dělat teď – jedna jasná akce */}
        {!diagnosisLoading && !diagnosis && doneCount === 0 ? null : next && NextIcon ? (
          <section
            aria-label="Další krok"
            className="v7-trap flex flex-col gap-5 bg-primary p-6 pr-12 text-primary-foreground sm:flex-row sm:items-center sm:justify-between sm:p-8 sm:pr-16"
          >
            <div className="flex items-start gap-5">
              <span className="v7-para flex h-16 w-16 shrink-0 items-center justify-center bg-signal text-2xl font-extrabold text-signal-foreground">
                {next.id}
              </span>
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-signal">
                  {doneCount === 0 ? (diagnosis ? "Začněte tady" : "Potom") : "Na řadě"}
                </p>
                <h2 className="text-2xl font-bold tracking-tight">
                  Brána {next.id}: {GATE_NAMES[next.id]}
                </h2>
                <p className="mt-1 text-white/75">{next.description}</p>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-white/75">
                  <Clock className="h-4 w-4" /> asi {next.time}
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate(next.route)}
              className="v7-trap-btn h-12 shrink-0 self-start rounded-none pl-6 text-base font-bold text-signal-foreground focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-primary sm:self-auto"
            >
              {doneCount === 0 ? "Začít" : "Pokračovat"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </section>
        ) : (
          <section className="flex items-center gap-4 rounded-2xl bg-emerald-50 p-6 ring-1 ring-emerald-200 sm:p-8">
            <PartyPopper className="h-8 w-8 shrink-0 text-emerald-600" />
            <div>
              <h2 className="text-2xl font-bold">Všech 7 bran je otevřených</h2>
              <p className="text-muted-foreground">Gratulujeme. Získejte osvědčení VISIBLE7 Gold.</p>
            </div>
          </section>
        )}

        {/* Celá cesta – jeden řádek */}
        <GateJourney
          gates={phases.map((p) => ({ ...p, name: GATE_NAMES[p.id] }))}
          completed={completedPhases}
          onOpen={(route) => navigate(route)}
          showHeader={false}
          showList={false}
        />

        {/* Jeden tip na teď */}
        {tip === "certs" && (
          <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <Award className="mt-1 h-6 w-6 shrink-0 text-primary" />
              <div>
                <h2 className="text-lg font-bold">
                  {certsAvailable === 1 ? "Máte připravené osvědčení" : `Máte ${certsAvailable} osvědčení připravená`}
                </h2>
                <p className="text-sm text-muted-foreground">Vystavte si ho a přidejte na LinkedIn i do životopisu.</p>
              </div>
            </div>
            <Button className="shrink-0 rounded-[10px]" onClick={() => navigate("/settings#osvedceni")}>
              Získat osvědčení
            </Button>
          </section>
        )}
        {tip === "web" && (
          <section className="flex flex-col items-start gap-4 rounded-2xl bg-primary p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <p className="flex items-center gap-1.5 text-sm font-semibold text-signal">
                <FlaskConical className="h-4 w-4" /> Než začnete stavět
              </p>
              <h2 className="mt-1 text-xl font-bold">Otestujte zájem jednoduchou stránkou</h2>
              <p className="mt-1 max-w-xl text-white/75">
                Složíme ji z vašich bran 1–3. Přiveďte na ni 100 lidí a za pár dní víte, jestli o nabídku někdo stojí.
              </p>
            </div>
            <Button
              onClick={() => navigate("/testovaci-stranka")}
              className="h-11 shrink-0 rounded-[10px] bg-signal px-5 font-bold text-signal-foreground hover:bg-signal/90"
            >
              Otevřít web projektu
            </Button>
          </section>
        )}
        {tip === "nsk" && (
          <section className="flex flex-col gap-4 rounded-2xl bg-[hsl(var(--gate-copper))] p-6 text-white sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <Award className="mt-1 h-6 w-6 shrink-0" />
              <div>
                <h2 className="text-lg font-bold">Získejte státem uznanou profesní kvalifikaci</h2>
                <p className="text-sm text-white/85">
                  Prošli jste branou {NSK_QUALIFICATION.unlockGate}. Můžete se přihlásit ke zkoušce{" "}
                  {NSK_QUALIFICATION.name} ({NSK_QUALIFICATION.code}) u Edu Partners.
                </p>
              </div>
            </div>
            <Button asChild variant="secondary" className="shrink-0 rounded-[10px]">
              <a
                href={qualificationMailto(currentProject?.name)}
                onClick={() => track("nsk_interest", {}, currentProject?.id)}
              >
                Mám zájem o zkoušku
              </a>
            </Button>
          </section>
        )}
        {tip === "quiz" && <QuizDashboardCard />}
      </main>
      <Footer />
    </SidebarLayout>
  );
};
