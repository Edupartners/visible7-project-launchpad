import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  FlaskConical,
  Loader2,
  RotateCcw,
  ScanLine,
  Sparkles,
  ThumbsUp,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useProject } from "@/contexts/ProjectContext";
import { useSupabaseProgress } from "@/hooks/useSupabaseProgress";
import { JourneyMap } from "@/components/diagnosis/JourneyMap";
import { BadgeIcon } from "@/components/GrowthBadge";
import { buildType } from "@/lib/buildPlans";
import {
  BUDGETS,
  DIAGNOSIS_KEY,
  Diagnosis,
  DiagnosisAnswers,
  EMPTY_ANSWERS,
  GOALS,
  HOURS,
  SKILLS,
  Verdict,
  applyDiagnosis,
  caseFromDiagnosis,
  journeyMap,
  runDiagnosis,
  targetIncome,
} from "@/lib/diagnosis";

const EXAMPLES = [
  "E-shop s ručně vyráběnou keramikou",
  "Online kurz focení mobilem pro začátečníky",
  "Předplatné zdravého krmiva pro psy",
  "Účetní služby pro živnostníky online",
];

const DEFAULT_NAMES = ["Můj první projekt", "Nový projekt"];
const czk = (v: number) => `${Math.round(v).toLocaleString("cs-CZ")} Kč`;

const VERDICT: Record<Verdict, { label: string; dot: string; pill: string }> = {
  zelena: {
    label: "Zelená: dává smysl začít",
    dot: "bg-emerald-400",
    pill: "bg-emerald-400/15 text-emerald-200 ring-emerald-400/40",
  },
  oranzova: {
    label: "Oranžová: nejdřív ověřit",
    dot: "bg-orange-400",
    pill: "bg-orange-400/15 text-orange-200 ring-orange-400/40",
  },
  cervena: {
    label: "Červená: v této podobě ne",
    dot: "bg-red-400",
    pill: "bg-red-400/15 text-red-200 ring-red-400/40",
  },
};

const STAGES = [
  "Čtu váš nápad…",
  "Hledám nejvhodnější typ byznysu…",
  "Porovnávám s konkurencí…",
  "Počítám čísla na 24 měsíců…",
  "Kreslím mapu cesty…",
];

const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
      active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/50"
    }`}
  >
    {children}
  </button>
);

const Question = ({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) => (
  <div>
    <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>
    {hint && <p className="mt-2 text-muted-foreground">{hint}</p>}
    <div className="mt-6">{children}</div>
  </div>
);

/** Výsledek rentgenu: verdikt, čísla, mapa A–D, rizika a další krok. */
export const DiagnosisResult = ({
  diagnosis,
  businessType,
  onRestart,
}: {
  diagnosis: Diagnosis;
  businessType: string | null;
  onRestart: () => void;
}) => {
  const navigate = useNavigate();
  const { ai, answers } = diagnosis;
  const target = targetIncome(answers);
  const map = useMemo(() => journeyMap(ai.businessType, caseFromDiagnosis(ai), target), [ai, target]);
  const v = VERDICT[ai.verdict.color];
  const capital = map.metrics.requiredCapital;
  const overBudget = capital > answers.budget;
  const type = buildType(businessType ?? ai.businessType);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] bg-primary text-white">
        <div className="p-6 sm:p-10">
          <p className="flex items-center gap-2 text-sm font-semibold text-white/70">
            <ScanLine className="h-4 w-4" /> Rentgen nápadu
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{ai.projectName}</h1>
          {ai.slogan && <p className="mt-1 text-lg text-white/80">{ai.slogan}</p>}
          <div className="mt-6 max-w-2xl">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ring-1 ${v.pill}`}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${v.dot}`} /> {v.label}
            </span>
            <p className="mt-3 text-xl font-bold leading-snug">{ai.verdict.headline}</p>
            <p className="mt-2 leading-relaxed text-white/80">{ai.verdict.why}</p>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-px bg-white/10 md:grid-cols-4">
          {[
            ["Typ byznysu", type?.name ?? "Vlastní nápad", type?.platform ?? ""],
            [
              "Potřebný kapitál",
              czk(capital),
              overBudget
                ? `víc než ${czk(answers.budget)}, které chcete riskovat`
                : `vejde se do ${czk(answers.budget)}`,
            ],
            [
              "Bod zvratu",
              map.metrics.breakEvenMonth ? `${map.metrics.breakEvenMonth}. měsíc` : "do 2 let ne",
              "příjmy pokryjí náklady",
            ],
            [
              "Tržby pro bod C",
              map.revenueForTarget ? `${czk(map.revenueForTarget)}/měs.` : "—",
              `aby zbylo ${czk(target)}`,
            ],
          ].map(([label, value, hint]) => (
            <div key={label} className="bg-primary p-5">
              <dt className="text-sm text-white/60">{label}</dt>
              <dd className="mt-1 text-xl font-extrabold">{value}</dd>
              <dd
                className={`text-xs ${label === "Potřebný kapitál" && overBudget ? "text-orange-300" : "text-white/60"}`}
              >
                {hint}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Vaše cesta z bodu A do bodu D</h2>
            <p className="text-muted-foreground">
              Při {answers.hours} hodinách týdně. Rozpětí = realistický a opatrný scénář.
            </p>
          </div>
        </div>
        <div className="mt-8">
          <JourneyMap points={map.points} />
        </div>
        <p className="mt-8 rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
          Odhad z vašich odpovědí a obvyklých čísel v oboru, ne záruka. Se skutečnými čísly v bráně 3 se mapa zpřesní.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <AlertTriangle className="h-5 w-5 text-orange-600" /> 3 největší rizika
          </h2>
          <ol className="mt-4 space-y-4">
            {ai.risks.map((r, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-800">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold">{r.risk}</p>
                  <p className="mt-1 flex gap-1.5 text-sm text-muted-foreground">
                    <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>
                      <span className="font-semibold text-foreground">Ověřte do 14 dnů: </span>
                      {r.test}
                    </span>
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="space-y-6">
          {ai.strengths.length > 0 && (
            <div className="rounded-3xl border border-border bg-card p-6">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <ThumbsUp className="h-5 w-5 text-emerald-600" /> Na čem stavět
              </h2>
              <ul className="mt-3 space-y-2">
                {ai.strengths.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <BadgeIcon level={0} size={48} />
              <div>
                <p className="font-bold">Jste Průzkumník</p>
                <p className="text-sm text-muted-foreground">Za bránu 1 získáte odznak Vizionář a první osvědčení.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col items-start gap-5 rounded-3xl bg-orange-50 p-6 ring-1 ring-orange-200 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="text-sm font-semibold text-orange-700">Teď to uděláme pořádně</p>
          <h2 className="text-2xl font-bold tracking-tight">Brána 1: Modrý oceán</h2>
          <p className="mt-1 max-w-xl text-muted-foreground">
            Brány 1–3 jsou předvyplněné z rentgenu jako návrh. Projdete je, opravíte a doplníte vlastními čísly.
          </p>
        </div>
        <Button
          onClick={() => navigate("/vision")}
          className="h-12 shrink-0 rounded-[10px] bg-orange-500 px-6 text-base font-semibold text-white hover:bg-orange-600"
        >
          Projít bránou 1 <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </section>

      <div className="flex flex-wrap justify-center gap-3 pb-6">
        <Button variant="ghost" onClick={() => navigate("/home")}>
          Na přehled projektu
        </Button>
        <Button variant="ghost" onClick={onRestart}>
          <RotateCcw className="mr-2 h-4 w-4" /> Udělat rentgen znovu
        </Button>
      </div>
    </div>
  );
};

const RentgenPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentProject, renameProject, setBusinessType } = useProject();
  const [saved, , { loading }] = useSupabaseProgress<Diagnosis | null>(DIAGNOSIS_KEY, null);
  const [result, setResult] = useState<Diagnosis | null>(null);
  const [restart, setRestart] = useState(false);
  const [step, setStep] = useState(0);
  const [a, setA] = useState<DiagnosisAnswers>(EMPTY_ANSWERS);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!busy) return;
    setStage(0);
    const t = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 2600);
    return () => clearInterval(t);
  }, [busy]);

  const shown = result ?? (restart ? null : saved);
  const set = <K extends keyof DiagnosisAnswers>(k: K, v: DiagnosisAnswers[K]) => setA((p) => ({ ...p, [k]: v }));
  const canNext = step === 0 ? a.idea.trim().length >= 8 : true;

  const run = async () => {
    if (!currentProject) return;
    setBusy(true);
    setError(null);
    try {
      const ai = await runDiagnosis(currentProject.id, a);
      const d: Diagnosis = { answers: a, ai, createdAt: new Date().toISOString() };
      const prefilled = await applyDiagnosis(currentProject.id, d);
      if (DEFAULT_NAMES.includes(currentProject.name)) await renameProject(currentProject.id, ai.projectName);
      if (!currentProject.business_type) await setBusinessType(currentProject.id, ai.businessType);
      setResult({ ...d, prefilled });
      setRestart(false);
      window.scrollTo({ top: 0 });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Rentgen se nepodařil.");
    } finally {
      setBusy(false);
    }
  };

  const total = 4;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <p className="flex items-center gap-2 font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs text-white">
              V7
            </span>
            Rentgen nápadu
          </p>
          {!shown && !busy && (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Krok {step + 1} ze {total}
            </p>
          )}
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Zavřít"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {!shown && !busy && (
          <div className="h-1 bg-muted">
            <div className="h-full bg-orange-500 transition-all" style={{ width: `${((step + 1) / total) * 100}%` }} />
          </div>
        )}
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        {loading ? (
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
        ) : shown ? (
          <DiagnosisResult
            diagnosis={shown}
            businessType={currentProject?.business_type ?? null}
            onRestart={() => {
              setA(shown.answers);
              setResult(null);
              setRestart(true);
              setStep(0);
            }}
          />
        ) : busy ? (
          <div className="mx-auto flex max-w-xl flex-col items-center rounded-[28px] bg-primary px-6 py-16 text-center text-white">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-orange-500/30" />
              <ScanLine className="relative h-10 w-10 text-orange-300" />
            </div>
            <p className="mt-6 text-xl font-bold" aria-live="polite">
              {STAGES[stage]}
            </p>
            <p className="mt-2 text-white/60">Obvykle do 30 sekund.</p>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl">
            {step === 0 && (
              <Question title="Jaký máte nápad?" hint="Stačí jedna věta. Čím konkrétnější, tím přesnější rentgen.">
                <Textarea
                  value={a.idea}
                  onChange={(e) => set("idea", e.target.value)}
                  placeholder="Např. e-shop s ručně vyráběnou keramikou z Beskyd"
                  className="min-h-[120px] text-lg"
                  maxLength={600}
                  autoFocus
                  aria-label="Váš nápad"
                />
                <p className="mt-4 text-sm font-semibold text-muted-foreground">Nebo zkuste příklad:</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {EXAMPLES.map((ex) => (
                    <Chip key={ex} active={a.idea === ex} onClick={() => set("idea", ex)}>
                      {ex}
                    </Chip>
                  ))}
                </div>
              </Question>
            )}

            {step === 1 && (
              <Question title="Pro koho to je a co mu to vyřeší?" hint="Nevíte přesně? Nechte prázdné, AI navrhne.">
                <label className="block text-sm font-semibold" htmlFor="r-customer">
                  Kdo bude platit
                </label>
                <Input
                  id="r-customer"
                  value={a.customer}
                  onChange={(e) => set("customer", e.target.value)}
                  placeholder="Např. ženy 30–50 let, které zařizují domov"
                  className="mt-1.5 h-12"
                  maxLength={400}
                />
                <label className="mt-5 block text-sm font-semibold" htmlFor="r-problem">
                  Jaký problém mu vyřešíte
                </label>
                <Textarea
                  id="r-problem"
                  value={a.problem}
                  onChange={(e) => set("problem", e.target.value)}
                  placeholder="Např. chtějí originální nádobí, ale v obchodech je všechno stejné"
                  className="mt-1.5 min-h-[96px]"
                  maxLength={400}
                />
              </Question>
            )}

            {step === 2 && (
              <Question title="Jaká je vaše situace?" hint="Podle toho spočítáme, jak rychle se dostanete k cíli.">
                <fieldset>
                  <legend className="text-sm font-semibold">Kolik hodin týdně tomu dáte</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {HOURS.map((h) => (
                      <Chip key={h} active={a.hours === h} onClick={() => set("hours", h)}>
                        {h === 40 ? "40 h (naplno)" : `${h} h`}
                      </Chip>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="mt-6">
                  <legend className="text-sm font-semibold">Kolik peněz můžete riskovat</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {BUDGETS.map((b) => (
                      <Chip key={b} active={a.budget === b} onClick={() => set("budget", b)}>
                        {b === 0 ? "Skoro nic" : b === 250_000 ? "250 000 Kč a víc" : czk(b)}
                      </Chip>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="mt-6">
                  <legend className="text-sm font-semibold">Co je váš cíl</legend>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {GOALS.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => set("goal", g.id)}
                        aria-pressed={a.goal === g.id}
                        className={`rounded-xl border p-4 text-left transition-colors ${
                          a.goal === g.id
                            ? "border-primary bg-primary/5 ring-2 ring-primary"
                            : "border-border bg-card hover:border-primary/50"
                        }`}
                      >
                        <span className="block font-bold">{g.label}</span>
                        <span className="block text-sm text-muted-foreground">{g.text}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>
                <label className="mt-6 block text-sm font-semibold" htmlFor="r-income">
                  Kolik dnes měsíčně čistého vyděláváte{" "}
                  <span className="font-normal text-muted-foreground">(nepovinné)</span>
                </label>
                <div className="mt-1.5 flex max-w-xs items-center gap-2">
                  <Input
                    id="r-income"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={a.income ?? ""}
                    onChange={(e) => set("income", e.target.value === "" ? null : Math.max(0, Number(e.target.value)))}
                    placeholder="35 000"
                    className="h-12"
                  />
                  <span className="text-muted-foreground">Kč</span>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Podle toho spočítáme bod C: kdy vás projekt uživí. Bez údaje počítáme s 35 000 Kč.
                </p>
              </Question>
            )}

            {step === 3 && (
              <Question
                title="Co umíte?"
                hint="Vyberte vše, co platí. Podle toho AI posoudí, kde budete potřebovat pomoc."
              >
                <div className="flex flex-wrap gap-2">
                  {SKILLS.map((s) => {
                    const on = a.skills.includes(s.id);
                    return (
                      <Chip
                        key={s.id}
                        active={on}
                        onClick={() =>
                          set(
                            "skills",
                            s.id === "zadna"
                              ? on
                                ? []
                                : ["zadna"]
                              : on
                                ? a.skills.filter((x) => x !== s.id)
                                : [...a.skills.filter((x) => x !== "zadna"), s.id],
                          )
                        }
                      >
                        {on && <Check className="mr-1 inline h-4 w-4" />}
                        {s.label}
                      </Chip>
                    );
                  })}
                </div>
              </Question>
            )}

            {error && (
              <p className="mt-6 rounded-xl bg-destructive/10 p-4 text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <div className="mt-10 flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                onClick={() => (step === 0 ? navigate("/home") : setStep(step - 1))}
                className="rounded-[10px]"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> {step === 0 ? "Zpět" : "Předchozí"}
              </Button>
              {step < total - 1 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!canNext}
                  className="h-12 rounded-[10px] px-6 text-base font-semibold"
                >
                  Pokračovat <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    if (!currentProject) {
                      toast({ title: "Projekt se ještě načítá", description: "Zkuste to za chvíli." });
                      return;
                    }
                    run();
                  }}
                  className="h-12 rounded-[10px] bg-orange-500 px-6 text-base font-semibold text-white hover:bg-orange-600"
                >
                  <Sparkles className="mr-2 h-5 w-5" /> Udělat rentgen
                </Button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RentgenPage;
