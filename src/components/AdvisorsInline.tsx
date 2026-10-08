import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProject } from "@/contexts/ProjectContext";
import { Advisor, CONSULTATION, advisorsForChannel, advisorsForPhase, consultationMailto, initials } from "@/lib/advisors";

export const AdvisorAvatar = ({ advisor, size = "md" }: { advisor: Advisor; size?: "md" | "lg" }) => (
  <span
    aria-hidden
    className={`flex shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground ${
      size === "lg" ? "h-14 w-14 text-lg" : "h-11 w-11 text-sm"
    }`}
  >
    {initials(advisor.name)}
  </span>
);

/**
 * Nabídka seniorních poradců k dané fázi nebo marketingovému kanálu.
 * Konzultace se zatím objednává e-mailem s předvyplněným shrnutím.
 */
export const AdvisorsInline = ({
  phase,
  channel,
  title = "Projděte to se seniorním poradcem",
  topic,
  lines,
  limit = 3,
}: {
  phase?: number;
  channel?: string;
  title?: string;
  topic?: string;
  lines?: string[];
  limit?: number;
}) => {
  const { currentProject } = useProject();
  const list = (channel ? advisorsForChannel(channel) : phase ? advisorsForPhase(phase) : []).slice(0, limit);
  if (list.length === 0) return null;

  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-bold">{title}</h3>
          <p className="text-sm text-muted-foreground">
            Poradci jsou podnikatelé a lektoři Edu Partners s vlastní praxí. Konzultace {CONSULTATION.label}.
          </p>
        </div>
        <Link to="/poradci" className="shrink-0 text-sm font-semibold text-primary hover:underline">
          Všichni poradci
        </Link>
      </div>
      <ul className="divide-y divide-border">
        {list.map((a) => (
          <li key={a.id} className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <AdvisorAvatar advisor={a} />
              <div className="min-w-0">
                <p className="font-semibold">{a.name}</p>
                <p className="text-sm text-primary">{a.focus}</p>
                <p className="text-sm text-muted-foreground">{a.bio}</p>
              </div>
            </div>
            <Button asChild variant="outline" className="shrink-0 rounded-[10px]">
              <a href={consultationMailto(a, { project: currentProject?.name, topic, lines })}>
                <Mail className="mr-2 h-4 w-4" />
                Objednat konzultaci
              </a>
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
};
