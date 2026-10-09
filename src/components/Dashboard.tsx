import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarLayout } from "./layout/AppSidebar";
import { Footer } from "./layout/Footer";
import { GateJourney } from "./GateJourney";
import { PhaseCards } from "./PhaseCards";
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
  FileText,
  Layers,
  Lightbulb,
  Pencil,
  Rocket,
  Target,
  TrendingUp,
  Users,
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
  const [watched, setWatched] = useSupabaseProgress<number[]>("watched_videos", []);
  const [certCount, setCertCount] = useState<number | null>(null);
  const [certified, setCertified] = useState<number[]>([]);

  useEffect(() => {
    listMyCertificates().then((list) => {
      const mine = list.filter((c) => c.project_id === currentProject?.id);
      setCertCount(mine.length);
      setCertified(mine.filter((c) => c.kind === "phase" && c.phase).map((c) => c.phase as number));
    });
  }, [currentProject?.id]);

  const done = new Set(completedPhases);
  const next = phases.find((p) => !done.has(p.id)) ?? null;
  const doneCount = phases.filter((p) => done.has(p.id)).length;
  const certsAvailable = phases.filter((p) => done.has(p.id)).length - (certCount ?? 0);
  const allCoreCompleted = [1, 2, 3].every((id) => done.has(id));
  const NextIcon = next?.icon;

  return (
    <SidebarLayout>
      <main className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-8 sm:py-10">
        {/* Projekt */}
        <header>
          <p className="text-muted-foreground">Váš projekt</p>
          <ProjectTitle />
          <p className="mt-1 text-sm text-muted-foreground">Otevřeno {doneCount} ze 7 bran</p>
        </header>

        {/* Co dělat teď – jedna jasná akce */}
        {next && NextIcon ? (
          <section
            aria-label="Další krok"
            className="flex flex-col gap-5 rounded-2xl bg-orange-50 p-6 ring-1 ring-orange-200 sm:flex-row sm:items-center sm:justify-between sm:p-8"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xl font-bold text-white">
                {next.id}
              </span>
              <div>
                <p className="text-sm font-semibold text-orange-700">{doneCount === 0 ? "Začněte tady" : "Na řadě"}</p>
                <h2 className="text-2xl font-bold tracking-tight">
                  Brána {next.id}: {GATE_NAMES[next.id]}
                </h2>
                <p className="mt-1 text-muted-foreground">{next.description}</p>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" /> asi {next.time}
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate(next.route)}
              className="h-12 shrink-0 rounded-[10px] bg-orange-500 px-6 text-base font-semibold text-white hover:bg-orange-600"
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

        {/* Celá cesta */}
        <section aria-labelledby="cesta" className="space-y-4">
          <h2 id="cesta" className="text-lg font-bold">
            Celá cesta
          </h2>
          <GateJourney
            gates={phases.map((p) => ({ ...p, name: GATE_NAMES[p.id] }))}
            completed={completedPhases}
            onOpen={(route) => navigate(route)}
            showHeader={false}
            showList={false}
          />
          <PhaseCards
            phases={phases.map((p) => ({ ...p, name: GATE_NAMES[p.id] }))}
            completed={completedPhases}
            certified={certified}
            watched={watched}
            onOpen={(route) => navigate(route)}
            onWatched={(id) => !watched.includes(id) && setWatched([...watched, id])}
            onCertificate={() => navigate("/settings#osvedceni")}
          />
        </section>

        {/* Odměny a pomoc */}
        <section aria-label="Osvědčení a poradci" className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col rounded-2xl border border-border bg-card p-6">
            <Award className="h-6 w-6 text-primary" />
            <h2 className="mt-3 text-lg font-bold">Osvědčení</h2>
            <p className="mt-1 flex-1 text-sm text-muted-foreground">
              {certsAvailable > 0
                ? `${certsAvailable === 1 ? "Máte 1 osvědčení připravené" : `Máte ${certsAvailable} osvědčení připravená`} k vystavení.`
                : certCount
                  ? `Za tento projekt máte ${certCount} ${certCount === 1 ? "osvědčení" : "osvědčení"}.`
                  : "Za každou dokončenou fázi získáte osvědčení pro LinkedIn a životopis."}
            </p>
            <Button
              variant={certsAvailable > 0 ? "default" : "outline"}
              className="mt-4 self-start rounded-[10px]"
              onClick={() => navigate("/settings#osvedceni")}
            >
              {certsAvailable > 0 ? "Získat osvědčení" : "Moje osvědčení"}
            </Button>
          </div>
          <div className="flex flex-col rounded-2xl border border-border bg-card p-6">
            <Users className="h-6 w-6 text-primary" />
            <h2 className="mt-3 text-lg font-bold">Senioroví poradci</h2>
            <p className="mt-1 flex-1 text-sm text-muted-foreground">
              15 podnikatelů a lektorů Edu Partners. Konzultace 45 minut, orientačně 1 500 Kč.
            </p>
            <Button variant="outline" className="mt-4 self-start rounded-[10px]" onClick={() => navigate("/poradci")}>
              Vybrat poradce
            </Button>
          </div>
        </section>

        {allCoreCompleted && (
          <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <FileText className="mt-1 h-6 w-6 shrink-0 text-primary" />
              <div>
                <h2 className="text-lg font-bold">Prezentace pro investory</h2>
                <p className="text-sm text-muted-foreground">Z dat fází 1–3 sestavíme prezentaci vašeho projektu.</p>
              </div>
            </div>
            <Button onClick={() => navigate("/investor-pitch")} variant="outline" className="shrink-0 rounded-[10px]">
              Sestavit prezentaci
            </Button>
          </section>
        )}
      </main>
      <Footer />
    </SidebarLayout>
  );
};
