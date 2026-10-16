import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Download, Loader2, Lock } from "lucide-react";
import { SidebarLayout } from "@/components/layout/AppSidebar";
import { useAccess } from "@/lib/access";
import { track } from "@/lib/track";
import {
  BUNDLE,
  PHASE_LABELS,
  WORKSHEETS,
  type Worksheet,
  type WorksheetPhase,
  memberSheetUrl,
  worksheetFile,
  worksheetPreview,
} from "@/lib/worksheets";

/** Pracovní listy v aplikaci: zdarma rovnou ke stažení, listy pro členy z chráněného úložiště. */
const MemberWorksheetsPage = () => {
  const access = useAccess();
  const [params, setParams] = useSearchParams();
  const phase = (params.get("faze") as WorksheetPhase | null) ?? "all";
  const [busy, setBusy] = useState<string | null>(null);
  const [missing, setMissing] = useState<Set<string>>(new Set());
  const phases = Object.keys(PHASE_LABELS) as WorksheetPhase[];
  const list = useMemo(() => WORKSHEETS.filter((w) => phase === "all" || w.phase === phase), [phase]);

  const getMember = async (w: Worksheet) => {
    setBusy(w.slug);
    const url = await memberSheetUrl(w.slug);
    setBusy(null);
    if (!url) {
      setMissing((m) => new Set(m).add(w.slug));
      return;
    }
    track("worksheet_download", { sheet: w.slug, member: true });
    window.location.href = url;
  };

  const action = (w: Worksheet) => {
    const btn = "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold";
    if (w.free)
      return (
        <a
          href={worksheetFile(w)}
          download
          onClick={() => track("worksheet_download", { sheet: w.slug, member: false })}
          className={`${btn} bg-primary text-white hover:bg-[hsl(var(--primary-hover))]`}
        >
          <Download className="h-4 w-4" aria-hidden="true" /> Stáhnout PDF
        </a>
      );
    if (!access.full)
      return (
        <Link to="/cenik" className={`${btn} border border-border text-muted-foreground hover:border-primary`}>
          <Lock className="h-4 w-4" aria-hidden="true" /> Odemknout členstvím
        </Link>
      );
    if (missing.has(w.slug))
      return <p className="mt-3 text-center text-sm text-muted-foreground">List brzy doplníme.</p>;
    return (
      <button
        type="button"
        onClick={() => getMember(w)}
        disabled={busy === w.slug}
        className={`${btn} bg-primary text-white hover:bg-[hsl(var(--primary-hover))] disabled:opacity-60`}
      >
        {busy === w.slug ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Download className="h-4 w-4" aria-hidden="true" />
        )}{" "}
        Stáhnout PDF
      </button>
    );
  };

  return (
    <SidebarLayout>
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-8 sm:py-10">
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Pracovní listy</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Vytiskněte si list ke své fázi a vyplňte ho. Výsledky pak přepište do projektu, AI s nimi bude pracovat dál.
          </p>
          <a
            href={BUNDLE.file}
            download
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            <Download className="h-4 w-4" aria-hidden="true" /> {BUNDLE.title} (PDF)
          </a>
        </header>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Fáze">
          {(["all", ...phases] as const).map((p) => (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={phase === p}
              onClick={() => setParams(p === "all" ? {} : { faze: p })}
              className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
                phase === p
                  ? "border-primary bg-primary text-white"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {p === "all" ? "Všechny" : `${PHASE_LABELS[p].letter} · ${PHASE_LABELS[p].name}`}
            </button>
          ))}
        </div>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((w) => (
            <li key={w.slug} className="flex flex-col rounded-2xl border border-border bg-card p-3">
              <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-muted/60 p-2">
                <img src={worksheetPreview(w)} alt="" loading="lazy" className="max-h-full max-w-full rounded shadow" />
              </div>
              <p className="mt-3 text-xs font-semibold text-muted-foreground">
                {PHASE_LABELS[w.phase].name} · {w.code}
                {!w.free && " · pro členy"}
              </p>
              <h2 className="font-bold leading-snug">{w.title}</h2>
              <p className="mt-1 flex-1 text-sm leading-snug text-muted-foreground">{w.desc}</p>
              {action(w)}
            </li>
          ))}
        </ul>
      </div>
    </SidebarLayout>
  );
};

export default MemberWorksheetsPage;
