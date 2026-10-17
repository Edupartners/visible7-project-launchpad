import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Download, Lock, Mail } from "lucide-react";
import { WorksheetFan } from "@/components/marketing/WorksheetsTeaser";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/visible7/client";
import { track } from "@/lib/track";
import {
  BUNDLE,
  POSTER,
  WORKSHEET_BENEFITS,
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

  const BADGE: Record<string, string> = {
    "v0-karta-projektu": "Začněte tady",
    "im3-checklist-ai-first-web": "Novinka",
  };

  const Card = ({ w }: { w: Worksheet }) => {
    const ph = PHASE_LABELS[w.phase];
    const go = () => (w.free ? open({ slug: w.slug, title: w.title, file: worksheetFile(w) }) : navigate("/cenik"));
    return (
      <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(15,23,42,0.35)]">
        <button
          type="button"
          onClick={go}
          aria-label={w.free ? `Stáhnout ${w.title}` : `${w.title} – pro členy`}
          className="relative flex h-56 items-center justify-center overflow-hidden bg-muted/60 p-4"
        >
          <img
            src={worksheetPreview(w)}
            alt=""
            loading="lazy"
            className={`max-h-full max-w-full object-contain rounded shadow-[0_8px_24px_-10px_rgba(15,23,42,0.45)] transition-transform duration-300 group-hover:scale-[1.03] ${w.free ? "" : "blur-[1.5px] grayscale-[30%]"}`}
          />
          {w.free ? (
            <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-2.5 py-1 text-xs font-extrabold text-white">
              {BADGE[w.slug] ?? "ZDARMA"}
            </span>
          ) : (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex items-center gap-1.5 rounded-full bg-primary/90 px-3 py-1.5 text-xs font-bold text-white">
                <Lock className="h-3.5 w-3.5" aria-hidden="true" /> Pro členy
              </span>
            </span>
          )}
        </button>
        <div className="flex flex-1 flex-col p-4">
          <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded bg-primary px-1 text-[11px] font-bold text-white">
              {ph.letter}
            </span>
            {ph.name} · {w.code}
          </p>
          <h3 className="mt-1.5 text-lg font-bold leading-snug">{w.title}</h3>
          <p className="mt-1 flex-1 text-sm leading-snug text-muted-foreground">{w.desc}</p>
          {w.free ? (
            <button
              type="button"
              onClick={go}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
            >
              <Download className="h-4 w-4" aria-hidden="true" /> Stáhnout zdarma
            </button>
          ) : (
            <Link
              to="/cenik"
              onClick={() => track("worksheet_locked", { sheet: w.slug })}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary"
            >
              <Lock className="h-4 w-4" aria-hidden="true" /> Odemknout členstvím
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
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-12 pt-12 sm:px-8 md:grid-cols-[1.1fr_1fr] md:pt-16 lg:px-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700">Ke stažení zdarma</p>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Pracovní listy, se kterými se nápad mění v plán
            </h1>
            <ul className="mt-6 space-y-2.5 text-lg">
              {WORKSHEET_BENEFITS.map((b) => (
                <li key={b} className="flex gap-2.5">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-orange-600" strokeWidth={3} aria-hidden="true" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => open({ slug: BUNDLE.slug, title: BUNDLE.title, file: BUNDLE.file })}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-4 text-base font-semibold text-white shadow-[0_10px_24px_-10px_rgba(234,88,12,0.7)] hover:bg-orange-600"
            >
              <Download className="h-5 w-5" aria-hidden="true" /> Stáhnout startovní balíček zdarma
            </button>
            <p className="mt-3 text-sm text-muted-foreground">
              PDF · 13 stran A4 k tisku · Vize a Ideace + úvod do metodiky
            </p>
          </div>
          <WorksheetFan />
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-8 lg:px-12">
          <div className="grid items-center gap-6 overflow-hidden rounded-3xl bg-[#173663] p-5 text-white sm:p-8 md:grid-cols-[1.35fr_1fr]">
            <button
              type="button"
              onClick={() => open({ slug: POSTER.slug, title: POSTER.title, file: POSTER.file })}
              aria-label={`Stáhnout ${POSTER.title}`}
              className="group overflow-hidden rounded-xl bg-white p-2 shadow-[0_20px_40px_-18px_rgba(0,0,0,0.6)]"
            >
              <img
                src={POSTER.preview}
                alt="Náhled plakátu Od vize k úspěchu: 7 fází V-I-S-I-B-L-E"
                loading="lazy"
                className="w-full rounded transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </button>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-300">
                Plakát zdarma · A3 k tisku
              </p>
              <h2 className="mt-2 text-3xl font-extrabold leading-tight">Celá cesta na jedné stránce</h2>
              <p className="mt-3 text-base leading-relaxed text-white/80">{POSTER.desc}</p>
              <button
                type="button"
                onClick={() => open({ slug: POSTER.slug, title: POSTER.title, file: POSTER.file })}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3.5 font-semibold text-white hover:bg-orange-600"
              >
                <Download className="h-5 w-5" aria-hidden="true" /> Stáhnout plakát zdarma
              </button>
              <p className="mt-2 text-sm text-white/60">PDF · A3 na šířku · vytiskne se i na A4</p>
            </div>
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
