import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, Copy, Download, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthGate";
import { useProject } from "@/contexts/ProjectContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/visible7/client";
import { AI_LIMITS, callAi, loadAiUsage } from "@/lib/ai";
import { loadProjectKeys } from "@/lib/projectData";

/** Texty pitche (z AI, uživatel je může upravit přímo na stránce). */
export interface PitchTexts {
  oneLiner: string;
  problem: string;
  solution: string;
  customer: string;
  difference: string;
  businessModel: string;
  goToMarket: string;
  ask: string;
  risk: string;
  milestones: string[];
  elevatorPitch: string;
  audience: Audience;
}

type Audience = "investor" | "banka" | "partner";

const AUDIENCE_LABEL: Record<Audience, { tab: string; sheet: string }> = {
  investor: { tab: "Investor", sheet: "pro investora" },
  banka: { tab: "Banka", sheet: "pro banku" },
  partner: { tab: "Partner", sheet: "pro partnera" },
};

interface Numbers {
  obrat_24m?: number;
  zisk_24m?: number;
  potrebny_kapital?: number;
  bod_zvratu_mesic?: number | null;
  navratnost_mesic?: number | null;
  hruba_marze_pct?: number;
}

interface Basics {
  name?: string;
  slogan?: string;
  lowCostName?: string;
  premiumName?: string;
}

const STORE_KEY = "pitch_onepager";
const czk = (v?: number) => (v === undefined || v === null ? "—" : `${Math.round(v).toLocaleString("cs-CZ")} Kč`);
const month = (v?: number | null) =>
  v === null || v === undefined ? "mimo 24 měs." : v === 0 ? "hned" : `${v}. měsíc`;

/** Text, který jde na stránce rovnou přepsat (obsah drží prohlížeč, React ho jen nastaví). */
const Editable = ({
  value,
  onChange,
  className = "",
  as: Tag = "p",
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  as?: "p" | "span";
}) => {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (ref.current && ref.current.textContent !== value) ref.current.textContent = value;
  }, [value]);
  return (
    <Tag
      ref={ref as React.Ref<HTMLParagraphElement & HTMLSpanElement>}
      contentEditable
      suppressContentEditableWarning
      spellCheck
      onBlur={(e) => {
        const v = (e.currentTarget.textContent ?? "").trim();
        if (v !== value) onChange(v);
      }}
      className={`rounded-sm outline-none transition-colors hover:bg-amber-50 focus:bg-amber-50 print:hover:bg-transparent ${className}`}
    />
  );
};

const Block = ({ title, children, accent = false }: { title: string; children: React.ReactNode; accent?: boolean }) => (
  <section className={accent ? "rounded-md bg-[#fff4e8] p-[3mm] ring-1 ring-[#e9a46a]" : ""}>
    <h3
      className={`mb-[1mm] text-[7.5pt] font-bold uppercase tracking-[0.12em] ${accent ? "text-[#a8541d]" : "text-[#1f3a5f]"}`}
    >
      {title}
    </h3>
    <div className="text-[8.8pt] leading-[1.36] text-slate-800">{children}</div>
  </section>
);

/** Pitch projektu na jednu stranu A4 – texty z AI, čísla přímo z byznys casu. */
const InvestorPitchPage = () => {
  const { user } = useAuth();
  const { currentProject } = useProject();
  const { toast } = useToast();
  const projectId = currentProject?.id;
  const [loaded, setLoaded] = useState(false);
  const [basics, setBasics] = useState<Basics>({});
  const [numbers, setNumbers] = useState<Numbers | null>(null);
  const [pitch, setPitch] = useState<PitchTexts | null>(null);
  const [audience, setAudience] = useState<Audience>("investor");
  const [used, setUsed] = useState(0);
  const [busy, setBusy] = useState(false);
  const [overflow, setOverflow] = useState(false);
  const [copied, setCopied] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const meta = (user?.user_metadata ?? {}) as { first_name?: string; last_name?: string; phone?: string };
  const author = [meta.first_name, meta.last_name].filter(Boolean).join(" ");

  useEffect(() => {
    if (!projectId) return;
    let active = true;
    Promise.all([
      loadProjectKeys(projectId, ["vision_project_data", "business_case_summary", STORE_KEY]),
      loadAiUsage(projectId, "p"),
    ]).then(([raw, usage]) => {
      if (!active) return;
      setBasics((raw.vision_project_data as Basics) ?? {});
      const summary = raw.business_case_summary as { scenare?: { realisticky?: Numbers } } | undefined;
      setNumbers(summary?.scenare?.realisticky ?? null);
      const saved = (raw[STORE_KEY] as PitchTexts | undefined) ?? (usage.latest.navrh as unknown as PitchTexts | null);
      if (saved?.oneLiner) {
        setPitch(saved);
        setAudience(saved.audience ?? "investor");
      }
      setUsed(usage.used.navrh);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [projectId]);

  const save = useCallback(
    async (next: PitchTexts) => {
      setPitch(next);
      if (!projectId) return;
      await supabase
        .from("project_data")
        .upsert(
          { project_id: projectId, data_key: STORE_KEY, data_value: next },
          { onConflict: "project_id,data_key" },
        );
    },
    [projectId],
  );

  const edit = (key: keyof Omit<PitchTexts, "milestones" | "audience">) => (v: string) =>
    pitch && save({ ...pitch, [key]: v });

  // Hlídá, aby se obsah vešel na jednu A4 (po úpravách textu).
  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const check = () => setOverflow(el.scrollHeight > el.clientHeight + 2);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [pitch]);

  const generate = async () => {
    if (!projectId) return;
    setBusy(true);
    const res = await callAi<PitchTexts>(projectId, "pitch", { audience });
    setBusy(false);
    if (res.error || !res.output) {
      toast({ title: "Pitch se nepodařilo vytvořit", description: res.error, variant: "destructive" });
      return;
    }
    setUsed((u) => u + 1);
    await save({ ...res.output, audience });
    toast({ title: "Pitch je hotový", description: "Texty můžete upravit kliknutím přímo na stránce." });
  };

  const left = AI_LIMITS.navrh - used;
  const name = basics.name || currentProject?.name || "Projekt";
  const today = new Date().toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" });

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40 px-4 py-6 print:bg-white print:p-0">
      <style>{"@media print { @page { size: A4 portrait; margin: 0; } }"}</style>

      {/* Ovládání */}
      <div className="mx-auto mb-6 max-w-[210mm] space-y-4 print:hidden">
        <Link
          to="/home"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Zpět na přehled
        </Link>
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h1 className="text-2xl font-extrabold tracking-tight">Pitch projektu na jednu stránku</h1>
          <p className="mt-1 text-muted-foreground">
            AI napíše texty z fází 1–3, čísla bereme přímo z vašeho byznys casu. Text upravíte kliknutím do stránky, pak
            ji stáhnete jako PDF.
          </p>

          {!numbers ? (
            <p className="mt-4 rounded-xl bg-orange-50 p-4 text-sm ring-1 ring-orange-200">
              Nejdřív vyplňte příjmy a náklady ve{" "}
              <Link to="/strategy" className="font-semibold text-primary underline">
                fázi 3 Byznys case
              </Link>
              . Pitch z nich bere čísla.
            </p>
          ) : (
            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 text-sm font-semibold">Pro koho pitch je?</p>
                <div
                  role="radiogroup"
                  aria-label="Příjemce pitche"
                  className="inline-flex rounded-xl border border-border p-1"
                >
                  {(Object.keys(AUDIENCE_LABEL) as Audience[]).map((a) => (
                    <button
                      key={a}
                      role="radio"
                      aria-checked={audience === a}
                      onClick={() => setAudience(a)}
                      className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
                        audience === a
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {AUDIENCE_LABEL[a].tab}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button className="rounded-[10px]" onClick={generate} disabled={busy || left <= 0}>
                  {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  {busy ? "Píšu pitch…" : pitch ? "Napsat znovu s AI" : "Vytvořit pitch s AI"}
                </Button>
                {pitch && (
                  <Button variant="outline" className="rounded-[10px]" onClick={() => window.print()}>
                    <Download className="mr-2 h-4 w-4" /> Stáhnout PDF
                  </Button>
                )}
              </div>
            </div>
          )}
          {numbers && (
            <p className="mt-3 text-xs text-muted-foreground">
              Zbývá {Math.max(left, 0)} z {AI_LIMITS.navrh} vytvoření pitche pro tento projekt.
              {pitch && " Nové vytvoření přepíše vaše úpravy."}
            </p>
          )}
          {overflow && (
            <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800 ring-1 ring-red-200">
              Text je delší, než se vejde na jednu stránku. Zkraťte některý odstavec.
            </p>
          )}
        </div>
      </div>

      {/* List A4 */}
      {pitch && numbers && (
        <div className="mx-auto max-w-full overflow-x-auto print:overflow-visible">
          <div className="pitch-sheet mx-auto flex h-[297mm] w-[210mm] flex-col bg-white font-sans text-slate-900 shadow-xl print:shadow-none">
            <header className="bg-[#1f3a5f] px-[13mm] pb-[5mm] pt-[7.5mm] text-white">
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0">
                  <h2 className="text-[20pt] font-extrabold leading-tight tracking-tight">{name}</h2>
                  {basics.slogan && <p className="mt-[1mm] text-[11pt] text-white/80">{basics.slogan}</p>}
                </div>
                <div className="shrink-0 text-right text-[8pt] leading-snug text-white/75">
                  <p className="font-semibold uppercase tracking-[0.14em] text-[#f3b27a]">
                    Pitch {AUDIENCE_LABEL[pitch.audience ?? audience].sheet}
                  </p>
                  <p>{today}</p>
                </div>
              </div>
              <Editable
                value={pitch.oneLiner}
                onChange={edit("oneLiner")}
                className="mt-[3mm] border-l-[3px] border-[#e9a46a] pl-[3mm] text-[11pt] font-semibold leading-snug text-white hover:bg-white/10 focus:bg-white/10"
              />
            </header>

            <div ref={bodyRef} className="flex flex-1 flex-col gap-[3.6mm] overflow-hidden px-[13mm] py-[5.5mm]">
              <div className="grid grid-cols-2 gap-x-[7mm] gap-y-[3.6mm]">
                <Block title="Problém">
                  <Editable value={pitch.problem} onChange={edit("problem")} />
                </Block>
                <Block title="Řešení">
                  <Editable value={pitch.solution} onChange={edit("solution")} />
                </Block>
                <Block title="Zákazník">
                  <Editable value={pitch.customer} onChange={edit("customer")} />
                </Block>
                <Block title="Čím se lišíme">
                  <Editable value={pitch.difference} onChange={edit("difference")} />
                  {(basics.lowCostName || basics.premiumName) && (
                    <p className="mt-[1.5mm] text-[7.5pt] text-slate-500">
                      Mezi levnou ({basics.lowCostName || "—"}) a prémiovou ({basics.premiumName || "—"}) konkurencí.
                    </p>
                  )}
                </Block>
              </div>

              {/* Čísla z byznys casu */}
              <section className="rounded-md bg-slate-50 px-[4mm] py-[3mm] ring-1 ring-slate-200">
                <h3 className="mb-[2mm] text-[7.5pt] font-bold uppercase tracking-[0.12em] text-[#1f3a5f]">
                  Čísla – realistický plán na 24 měsíců
                </h3>
                <dl className="grid grid-cols-5 gap-[3mm]">
                  {[
                    ["Tržby", czk(numbers.obrat_24m)],
                    ["Zisk před zdaněním", czk(numbers.zisk_24m)],
                    ["Potřebný kapitál", czk(numbers.potrebny_kapital)],
                    ["Bod zvratu", month(numbers.bod_zvratu_mesic)],
                    ["Návratnost investice", month(numbers.navratnost_mesic)],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-[7pt] leading-tight text-slate-500">{label}</dt>
                      <dd className="mt-[0.5mm] text-[11pt] font-bold leading-tight text-[#1f3a5f]">{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <div className="grid grid-cols-2 gap-x-[7mm] gap-y-[3.6mm]">
                <Block title="Jak vyděláváme">
                  <Editable value={pitch.businessModel} onChange={edit("businessModel")} />
                </Block>
                <Block title="Cesta k zákazníkům">
                  <Editable value={pitch.goToMarket} onChange={edit("goToMarket")} />
                </Block>
                <Block title="Milníky na 12 měsíců">
                  <ol className="space-y-[1mm]">
                    {pitch.milestones.map((m, i) => (
                      <li key={i} className="flex gap-[2mm]">
                        <span className="flex h-[4.5mm] w-[4.5mm] shrink-0 items-center justify-center rounded-full bg-[#1f3a5f] text-[7pt] font-bold text-white">
                          {i + 1}
                        </span>
                        <Editable
                          as="span"
                          value={m}
                          onChange={(v) =>
                            save({ ...pitch, milestones: pitch.milestones.map((x, j) => (j === i ? v : x)) })
                          }
                        />
                      </li>
                    ))}
                  </ol>
                </Block>
                <Block title="Hlavní riziko">
                  <Editable value={pitch.risk} onChange={edit("risk")} />
                </Block>
              </div>

              <Block title="Co potřebujeme" accent>
                <Editable value={pitch.ask} onChange={edit("ask")} className="text-[9.5pt] font-semibold" />
              </Block>
            </div>

            <footer className="flex items-end justify-between gap-6 border-t border-slate-200 px-[13mm] pb-[6mm] pt-[3mm] text-[7.5pt] text-slate-500">
              <div>
                {author && <p className="text-[9.5pt] font-semibold text-slate-800">{author}</p>}
                <p>{[user?.email, meta.phone].filter(Boolean).join(" · ")}</p>
              </div>
              <p className="text-right">
                Připraveno metodikou VISIBLE7 MICEK™
                <br />
                Čísla jsou orientační plán, ne záruka výsledku.
              </p>
            </footer>
          </div>
        </div>
      )}

      {/* Elevator pitch – jen v aplikaci */}
      {pitch?.elevatorPitch && (
        <div className="mx-auto mt-6 max-w-[210mm] rounded-2xl border border-border bg-card p-5 sm:p-6 print:hidden">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold">Pitch na 60 sekund</h2>
              <p className="text-sm text-muted-foreground">Mluvená verze pro osobní setkání. Nacvičte si ji nahlas.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 rounded-[10px]"
              onClick={() => {
                navigator.clipboard?.writeText(pitch.elevatorPitch).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                });
              }}
            >
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? "Zkopírováno" : "Kopírovat"}
            </Button>
          </div>
          <Editable value={pitch.elevatorPitch} onChange={edit("elevatorPitch")} className="mt-3 leading-relaxed" />
        </div>
      )}
    </div>
  );
};

export default InvestorPitchPage;
