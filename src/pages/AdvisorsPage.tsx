import { useState } from "react";
import { Mail } from "lucide-react";
import { SidebarLayout } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { AdvisorAvatar } from "@/components/AdvisorsInline";
import { useProject } from "@/contexts/ProjectContext";
import { ADVISORS, CONSULTATION, consultationMailto } from "@/lib/advisors";
import { GATE_NAMES } from "@/lib/certificates";

/** Přehled všech seniorních poradců s filtrem podle fáze. */
const AdvisorsPage = () => {
  const { currentProject } = useProject();
  const [phase, setPhase] = useState<number | null>(null);
  const list = phase ? ADVISORS.filter((a) => a.phases.includes(phase)) : ADVISORS;

  return (
    <SidebarLayout>
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-8 sm:py-10">
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Senioroví poradci</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Podnikatelé a lektoři Edu Partners, kteří si vlastní byznys sami rozjeli. Konzultace {CONSULTATION.label}.
            Termín a platbu domluvíme e-mailem.
          </p>
        </header>

        <div role="radiogroup" aria-label="Filtr podle fáze" className="flex flex-wrap gap-2">
          {[null, 1, 2, 3, 4, 5, 6, 7].map((p) => (
            <button
              key={p ?? 0}
              role="radio"
              aria-checked={phase === p}
              onClick={() => setPhase(p)}
              className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
                phase === p ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"
              }`}
            >
              {p ? `${p}. ${GATE_NAMES[p]}` : "Všichni"}
            </button>
          ))}
        </div>

        <ul className="grid gap-4 sm:grid-cols-2">
          {list.map((a) => (
            <li key={a.id} className="flex flex-col rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start gap-4">
                <AdvisorAvatar advisor={a} size="lg" />
                <div className="min-w-0">
                  <h2 className="text-lg font-bold leading-tight">{a.name}</h2>
                  <p className="text-sm font-semibold text-primary">{a.focus}</p>
                </div>
              </div>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">{a.bio}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                Pomůže ve fázích: {a.phases.map((p) => `${p}. ${GATE_NAMES[p]}`).join(", ")}
              </p>
              <Button asChild className="btn-apple mt-4 self-start py-2.5">
                <a href={consultationMailto(a, { project: currentProject?.name })}>
                  <Mail className="mr-2 h-4 w-4" />
                  Objednat konzultaci
                </a>
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </SidebarLayout>
  );
};

export default AdvisorsPage;
