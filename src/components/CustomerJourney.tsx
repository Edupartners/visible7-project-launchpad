import { ArrowDown, ArrowRight } from "lucide-react";
import type { FunnelStage, FunnelStep } from "@/lib/buildPlans";

const STAGE: Record<FunnelStage, { label: string; bar: string; dot: string; text: string }> = {
  zdroj: { label: "Odkud přijde", bar: "bg-sky-500", dot: "bg-sky-500", text: "text-sky-700" },
  web: { label: "Na webu", bar: "bg-primary", dot: "bg-primary", text: "text-primary" },
  konverze: { label: "Zaplatí nebo se ozve", bar: "bg-orange-500", dot: "bg-orange-500", text: "text-orange-700" },
  potom: { label: "Co je potom", bar: "bg-emerald-500", dot: "bg-emerald-500", text: "text-emerald-700" },
};

/** Krátká cesta do karty: Reklama → Prodejní stránka → Nákup. */
export const JourneyLine = ({ steps, light = false }: { steps: FunnelStep[]; light?: boolean }) => (
  <p
    className={`flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs ${light ? "text-white/80" : "text-muted-foreground"}`}
  >
    {steps.map((s, i) => (
      <span key={i} className="inline-flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${STAGE[s.stage].dot}`} aria-hidden="true" />
        {s.label}
        {i < steps.length - 1 && <ArrowRight className="h-3 w-3 opacity-60" aria-hidden="true" />}
      </span>
    ))}
  </p>
);

/** Cesta zákazníka (funnel) jako řada kroků se šipkami; na mobilu pod sebou. */
export const CustomerJourney = ({ steps }: { steps: FunnelStep[] }) => {
  const used = Array.from(new Set(steps.map((s) => s.stage)));
  return (
    <section aria-labelledby="cesta-zakaznika" className="rounded-3xl border border-border bg-card p-6 sm:p-8">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 id="cesta-zakaznika" className="text-xl font-bold">
            Cesta zákazníka
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Tudy k vám zákazník přijde a tady vyděláváte.</p>
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs" aria-label="Legenda">
          {used.map((st) => (
            <li key={st} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${STAGE[st].dot}`} aria-hidden="true" />
              {STAGE[st].label}
            </li>
          ))}
        </ul>
      </div>
      <ol className="mt-6 flex flex-col items-stretch gap-2 md:flex-row md:items-stretch md:gap-0">
        {steps.map((s, i) => (
          <li key={i} className="flex flex-col items-center md:flex-1 md:flex-row md:items-stretch">
            <div
              className={`relative w-full flex-1 overflow-hidden rounded-xl border p-3 pt-4 ${
                s.stage === "konverze" ? "border-orange-300 bg-orange-50/60" : "border-border bg-background"
              }`}
            >
              <span className={`absolute inset-x-0 top-0 h-1 ${STAGE[s.stage].bar}`} aria-hidden="true" />
              <p className={`text-xs font-semibold ${STAGE[s.stage].text}`}>
                {i + 1}
                {s.stage === "konverze" && " · tady vyděláváte"}
              </p>
              <p className="font-bold leading-tight">{s.label}</p>
              <p className="mt-1 text-xs leading-snug text-muted-foreground">{s.hint}</p>
            </div>
            {i < steps.length - 1 && (
              <>
                <ArrowDown className="my-1 h-4 w-4 shrink-0 text-muted-foreground md:hidden" aria-hidden="true" />
                <ArrowRight
                  className="mx-1 hidden h-4 w-4 shrink-0 self-center text-muted-foreground md:block"
                  aria-hidden="true"
                />
              </>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
};
