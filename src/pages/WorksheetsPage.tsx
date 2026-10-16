import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Download, FileText, Lock, Mail } from "lucide-react";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/visible7/client";
import { track } from "@/lib/track";
import {
  BUNDLE,
  PHASE_LABELS,
  WORKSHEETS,
  type Worksheet,
  type WorksheetPhase,
  worksheetFile,
  worksheetPreview,
} from "@/lib/worksheets";

const MARKETING_TEXT =
  "Chci občas dostat e-mailem tipy a novinky VISIBLE7. Souhlas mohu kdykoli odvolat odkazem v e-mailu.";
const EMAIL_KEY = "v7_listy_email";

interface Target {
  slug: string;
  title: string;
  file: string;
}

const readEmail = () => {
  try {
    return localStorage.getItem(EMAIL_KEY) ?? "";
  } catch {
    return "";
  }
};

/** Veřejná stránka s pracovními listy ke stažení za e-mail (po vzoru Strategyzeru). */
const WorksheetsPage = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<WorksheetPhase | "all">("all");
  const [target, setTarget] = useState<Target | null>(null);
  const [email, setEmail] = useState(readEmail);
  const [marketing, setMarketing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<{ sent: boolean } | null>(null);

  useEffect(() => {
    document.title = "Pracovní listy ke stažení | VISIBLE7 MICEK";
  }, []);

  const list = useMemo(() => WORKSHEETS.filter((w) => phase === "all" || w.phase === phase), [phase]);
  const phases = Object.keys(PHASE_LABELS) as WorksheetPhase[];

  const open = (t: Target) => {
    setTarget(t);
    setErr(null);
    setDone(null);
    track("worksheet_open", { sheet: t.slug });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;
    setBusy(true);
    setErr(null);
    const { data, error } = await supabase.functions.invoke("worksheets", {
      body: {
        email,
        sheet: target.slug,
        title: target.title,
        file: target.file,
        marketing,
        consent_text: marketing ? MARKETING_TEXT : "",
        source: new URLSearchParams(window.location.search).get("utm_source") ?? "web",
      },
    });
    setBusy(false);
    if (error || !data?.ok) {
      setErr((data as { error?: string } | null)?.error ?? "Odeslání se nepodařilo, zkuste to prosím znovu.");
      return;
    }
    try {
      localStorage.setItem(EMAIL_KEY, email);
    } catch {
      /* soukromé okno */
    }
    track("worksheet_lead", { sheet: target.slug, marketing });
    setDone({ sent: !!data.sent });
  };

  const Card = ({ w }: { w: Worksheet }) => {
    const ph = PHASE_LABELS[w.phase];
    return (
      <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex aspect-[4/3] items-center justify-center bg-muted/60 p-3">
          <img
            src={worksheetPreview(w)}
            alt={`Náhled listu ${w.title}`}
            loading="lazy"
            className={`max-h-full max-w-full rounded shadow-[0_6px_20px_-8px_rgba(15,23,42,0.35)] ${w.free ? "" : "opacity-80"}`}
          />
        </div>
        <div className="flex flex-1 flex-col p-4">
          <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded bg-primary px-1 text-[11px] font-bold text-white">
              {ph.letter}
            </span>
            {ph.name} · {w.code}
          </p>
          <h3 className="mt-1.5 font-bold leading-snug">{w.title}</h3>
          <p className="mt-1 flex-1 text-sm leading-snug text-muted-foreground">{w.desc}</p>
          {w.free ? (
            <button
              type="button"
              onClick={() => open({ slug: w.slug, title: w.title, file: worksheetFile(w) })}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-[hsl(var(--primary-hover))]"
            >
              <Download className="h-4 w-4" aria-hidden="true" /> Stáhnout zdarma
            </button>
          ) : (
            <Link
              to="/cenik"
              onClick={() => track("worksheet_locked", { sheet: w.slug })}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary"
            >
              <Lock className="h-4 w-4" aria-hidden="true" /> Pro členy
            </Link>
          )}
        </div>
      </article>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader onStart={() => navigate("/home?novy")} />
      <main>
        <section className="mx-auto max-w-6xl px-4 pb-10 pt-14 sm:px-8 lg:px-12 md:pt-20">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700">Ke stažení</p>
          <h1 className="mt-2 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">Pracovní listy VISIBLE7</h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Osvědčené nástroje pro každou fázi cesty od nápadu po růst: modrý oceán, Lean Canvas, SWOT, měření i
            reklama. Vytiskněte si je a vyplňte, ke každému listu je video, jak na to.
          </p>

          <div className="mt-10 flex flex-col gap-5 rounded-2xl bg-primary p-6 text-white sm:flex-row sm:items-center sm:p-8">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10">
              <FileText className="h-7 w-7 text-orange-300" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-300">Zdarma</p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight">{BUNDLE.title}</h2>
              <p className="mt-1 text-white/80">{BUNDLE.desc}</p>
            </div>
            <button
              type="button"
              onClick={() => open({ slug: BUNDLE.slug, title: BUNDLE.title, file: BUNDLE.file })}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
            >
              <Download className="h-4 w-4" aria-hidden="true" /> Stáhnout balíček
            </button>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-8 lg:px-12">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Fáze">
            {(["all", ...phases] as const).map((p) => (
              <button
                key={p}
                type="button"
                role="tab"
                aria-selected={phase === p}
                onClick={() => setPhase(p)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold ${
                  phase === p
                    ? "border-primary bg-primary text-white"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {p === "all" ? "Všechny" : `${PHASE_LABELS[p].letter} · ${PHASE_LABELS[p].name}`}
              </button>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((w) => (
              <Card key={w.slug} w={w} />
            ))}
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            Listy označené „Pro členy“ najdete v aplikaci u příslušné fáze.{" "}
            <Link to="/cenik" className="font-semibold text-primary underline-offset-4 hover:underline">
              Co obsahuje členství
            </Link>
          </p>
        </section>
      </main>
      <Footer />

      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{done ? "Hotovo, listy jsou vaše" : `Stáhnout: ${target?.title ?? ""}`}</DialogTitle>
            <DialogDescription>
              {done
                ? done.sent
                  ? "Odkaz jsme vám poslali i e-mailem, ať ho máte po ruce."
                  : "Stáhněte si PDF tlačítkem níže."
                : "Zadejte e-mail a listy vám hned zpřístupníme. Odkaz pošleme i e-mailem."}
            </DialogDescription>
          </DialogHeader>
          {done && target ? (
            <div className="space-y-4">
              <a
                href={target.file}
                download
                onClick={() => track("worksheet_download", { sheet: target.slug })}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white hover:bg-[hsl(var(--primary-hover))]"
              >
                <Download className="h-4 w-4" aria-hidden="true" /> Stáhnout PDF
              </a>
              <button
                type="button"
                onClick={() => navigate("/home?novy")}
                className="w-full rounded-xl border border-border px-5 py-3 text-sm font-semibold hover:border-primary hover:text-primary"
              >
                Otestovat nápad zdarma do 10 minut
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <label className="block text-sm font-semibold">
                E-mail
                <span className="mt-1.5 flex items-center gap-2 rounded-lg border border-input px-3 focus-within:ring-2 focus-within:ring-primary/30">
                  <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 w-full bg-transparent text-base font-normal outline-none"
                    placeholder="vas@email.cz"
                  />
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-2.5 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[hsl(var(--primary))]"
                />
                {MARKETING_TEXT}
              </label>
              {err && <p className="text-sm font-semibold text-red-600">{err}</p>}
              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white hover:bg-[hsl(var(--primary-hover))] disabled:opacity-60"
              >
                {busy ? "Odesílám…" : "Zpřístupnit listy"}
              </button>
              <p className="text-xs text-muted-foreground">
                E-mail použijeme k zaslání odkazu na listy. Více v{" "}
                <Link to="/ochrana-osobnich-udaju" className="underline">
                  zásadách ochrany osobních údajů
                </Link>
                .
              </p>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorksheetsPage;
