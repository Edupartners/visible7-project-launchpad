import { ArrowUpRight, Check } from "lucide-react";
import { Deadline, czDate, daysLeft } from "@/lib/deadlines";

const AUDIENCE_LABEL: Record<string, string> = {
  osvc_bezny: "OSVČ",
  osvc_pausal: "Paušál",
  sro: "s.r.o.",
  dph: "DPH",
};

const MONTHS = ["led", "úno", "bře", "dub", "kvě", "čvn", "čvc", "srp", "zář", "říj", "lis", "pro"];

const left = (iso: string) => {
  const n = daysLeft(iso);
  if (n <= 0) return "dnes";
  if (n === 1) return "zítra";
  if (n < 5) return `za ${n} dny`;
  return `za ${n} dní`;
};

/** Seznam termínů. S `done` a `onToggle` jde termín odškrtnout. */
export const DeadlineList = ({
  items,
  done,
  onToggle,
  showAudience,
}: {
  items: Deadline[];
  done?: Set<string>;
  onToggle?: (id: string, v: boolean) => void;
  showAudience?: boolean;
}) => (
  <ul className="divide-y divide-border rounded-3xl border border-border bg-card">
    {items.map((d) => {
      const isDone = done?.has(d.id) ?? false;
      const n = daysLeft(d.due_date);
      return (
        <li key={d.id} className="flex items-start gap-4 p-4 sm:p-5">
          <div
            className={`flex w-16 shrink-0 flex-col items-center rounded-2xl py-2 text-center ${
              isDone
                ? "bg-muted text-muted-foreground"
                : n <= 7
                  ? "bg-orange-50 text-orange-800"
                  : "bg-leaf-50 text-leaf-700"
            }`}
          >
            <span className="text-xl font-extrabold leading-none">{Number(d.due_date.slice(8, 10))}</span>
            <span className="mt-1 text-[11px] font-semibold">
              {MONTHS[Number(d.due_date.slice(5, 7)) - 1]} {d.due_date.slice(0, 4)}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className={`font-semibold ${isDone ? "text-muted-foreground line-through" : ""}`}>{d.title}</p>
            <p className="sr-only">Termín {czDate(d.due_date)}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{d.detail}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              {!isDone && <span className="font-semibold text-foreground">{left(d.due_date)}</span>}
              {showAudience &&
                d.audience.map((a) => (
                  <span key={a} className="rounded-full bg-muted px-2 py-0.5 font-semibold text-muted-foreground">
                    {AUDIENCE_LABEL[a] ?? a}
                  </span>
                ))}
              {d.url && (
                <a
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 font-semibold text-primary hover:underline"
                >
                  Otevřít portál <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                </a>
              )}
              {d.source_url && (
                <a
                  href={d.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:underline"
                >
                  Zdroj
                </a>
              )}
            </div>
          </div>
          {onToggle && (
            <button
              type="button"
              onClick={() => onToggle(d.id, !isDone)}
              aria-pressed={isDone}
              aria-label={isDone ? `Vrátit: ${d.title}` : `Hotovo: ${d.title}`}
              className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors ${
                isDone
                  ? "border-leaf-500 bg-leaf-500 text-white"
                  : "border-border text-muted-foreground hover:border-leaf-500 hover:text-leaf-700"
              }`}
            >
              <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" /> {isDone ? "Hotovo" : "Mám hotovo"}
            </button>
          )}
        </li>
      );
    })}
  </ul>
);
