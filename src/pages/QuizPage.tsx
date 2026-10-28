import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Gift, Loader2, Share2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useProject } from "@/contexts/ProjectContext";
import { useSupabaseProgress } from "@/hooks/useSupabaseProgress";
import { supabase } from "@/integrations/visible7/client";
import { AdvisorAvatar } from "@/components/AdvisorsInline";
import { ADVISORS } from "@/lib/advisors";
import { GATE_NAMES } from "@/lib/certificates";
import { recordConsents } from "@/lib/consents";
import { track } from "@/lib/track";
import {
  Answers,
  BARRIERS,
  QUIZ_KEY,
  QUIZ_VERSION,
  QuizAttempt,
  QuizData,
  QuizStage,
  ROUNDS,
  SCALE_LABELS,
  TYPES,
  provisionalType,
  scoreQuiz,
} from "@/lib/quiz";

const GATE_ROUTES: Record<number, string> = {
  1: "/vision",
  2: "/ideation",
  3: "/strategy",
  4: "/implementation",
  5: "/benchmarking-phase",
  6: "/launch",
  7: "/expansion",
};

type Reward = { status: "started" | "used" | "paid" | "free_mode"; until?: string } | null;

/** Výsledek kvízu: typ podnikatele, past, doporučená brána a poradce, bariéra a odměna. */
const QuizResultView = ({ attempt, reward, onDone }: { attempt: QuizAttempt; reward: Reward; onDone: () => void }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const t = TYPES[attempt.result.type];
  const Icon = t.icon;
  const advisor = ADVISORS.find((a) => a.id === t.advisorId);
  const barrier = BARRIERS[attempt.result.barrier];

  const share = async () => {
    const text = `Jsem ${t.name} – ${t.tagline} Zjisti, jaký typ podnikatele jsi ty: ${window.location.origin}`;
    track("quiz_share", { type: t.id });
    try {
      if (navigator.share) await navigator.share({ text });
      else {
        await navigator.clipboard.writeText(text);
        toast({ title: "Zkopírováno", description: "Text je ve schránce, vložte ho kam chcete." });
      }
    } catch {
      /* uživatel sdílení zavřel */
    }
  };

  return (
    <div className="space-y-6">
      <section className={`overflow-hidden rounded-[28px] bg-gradient-to-br ${t.color} p-8 text-white sm:p-12`}>
        <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 ring-4 ring-white/30">
          <Icon className="h-10 w-10" />
        </span>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.12em] text-white/80">Váš typ podnikatele</p>
        <h1 className="mt-1 text-4xl font-extrabold tracking-tight sm:text-5xl">{t.name}</h1>
        <p className="mt-2 text-xl text-white/90">{t.tagline}</p>
        <p className="mt-6 max-w-xl text-lg font-semibold">„{t.motto}“</p>
        <Button onClick={share} variant="secondary" className="mt-6 rounded-[10px]">
          <Share2 className="mr-2 h-4 w-4" /> Sdílet můj typ
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6">
          <p className="text-sm font-semibold text-emerald-700">Vaše síla</p>
          <p className="mt-2 text-lg font-semibold leading-snug">{t.strength}</p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6">
          <p className="text-sm font-semibold text-orange-700">Na co si dát pozor</p>
          <p className="mt-2 text-lg font-semibold leading-snug">{t.trap}</p>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-xl font-bold">Kde vám VISIBLE7 pomůže nejvíc</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div>
            <p className="font-semibold">
              Brána {t.gate}: {GATE_NAMES[t.gate]}
            </p>
            <p className="mt-1 text-muted-foreground">{t.gateWhy}</p>
            <Button variant="outline" className="mt-3 rounded-[10px]" onClick={() => navigate(GATE_ROUTES[t.gate])}>
              Otevřít bránu {t.gate} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div>
            <p className="font-semibold">Vaše největší brzda: {barrier.name}</p>
            <p className="mt-1 text-muted-foreground">{barrier.tip}</p>
            {advisor && (
              <div className="mt-4 flex items-center gap-3">
                <AdvisorAvatar advisor={advisor} />
                <div>
                  <p className="text-sm text-muted-foreground">Doporučený poradce</p>
                  <p className="font-semibold">{advisor.name}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {reward && (
        <section className="flex items-start gap-4 rounded-3xl bg-orange-50 p-6 ring-1 ring-orange-200 sm:p-8">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white">
            <Gift className="h-6 w-6" />
          </span>
          <div>
            {reward.status === "started" ? (
              <>
                <p className="text-xl font-bold">Odměna: 3 dny plného přístupu</p>
                <p className="mt-1 text-muted-foreground">
                  Všechny brány a videa máte odemčené do{" "}
                  {reward.until ? new Date(reward.until).toLocaleDateString("cs-CZ") : "konce zkušební doby"}.
                </p>
              </>
            ) : reward.status === "paid" || reward.status === "free_mode" ? (
              <>
                <p className="text-xl font-bold">Odznak {t.name} je váš</p>
                <p className="mt-1 text-muted-foreground">
                  {reward.status === "paid"
                    ? "Plný přístup už máte, díky za vyplnění."
                    : "Aplikace je teď v pilotním režimu a všechny brány máte odemčené. Díky, že pomáháte ji vylepšit."}
                </p>
              </>
            ) : (
              <>
                <p className="text-xl font-bold">Díky za vyplnění</p>
                <p className="mt-1 text-muted-foreground">Zkušební přístup jste už jednou využili.</p>
              </>
            )}
          </div>
        </section>
      )}

      <div className="flex justify-center pb-6">
        <Button onClick={onDone} className="h-12 rounded-[10px] px-6 text-base font-semibold">
          Pokračovat na přehled <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

const QuizPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const stage = (["brana3", "brana7"].includes(params.get("etapa") ?? "") ? params.get("etapa") : "start") as QuizStage;
  const { currentProject } = useProject();
  const { toast } = useToast();
  const [saved, , { loading }] = useSupabaseProgress<QuizData | null>(QUIZ_KEY, null);
  const previous = saved?.attempts?.find((a) => a.stage === "start") ?? null;
  const already = saved?.attempts?.find((a) => a.stage === stage) ?? null;

  // Opakované měření přeskočí údaje o vás – převezmou se z prvního vyplnění.
  const rounds = useMemo(() => (stage !== "start" && previous ? ROUNDS.slice(1) : ROUNDS), [stage, previous]);
  const questions = rounds.flatMap((r) => r.questions.map((q) => ({ ...q, round: r })));
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [research, setResearch] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ attempt: QuizAttempt; reward: Reward } | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started && !loading && !already) {
      setStarted(true);
      track("quiz_start", { stage }, currentProject?.id);
    }
  }, [started, loading, already, stage, currentProject?.id]);

  const finished = i >= questions.length;
  const q = questions[Math.min(i, questions.length - 1)];
  const firstOfRound = q && questions.findIndex((x) => x.round.id === q.round.id) === i;
  const guess = provisionalType(answers);
  const showGuess = !finished && q?.round.id === "bariery" && firstOfRound && guess;

  const answer = (value: string | number) => {
    setAnswers((a) => ({ ...a, [q.id]: value }));
    setTimeout(() => setI((n) => n + 1), 180);
  };

  const submit = async () => {
    if (!currentProject) return;
    setBusy(true);
    const all: Answers = stage !== "start" && previous ? { ...pickProfile(previous.answers), ...answers } : answers;
    const attempt: QuizAttempt = {
      stage,
      at: new Date().toISOString(),
      version: QUIZ_VERSION,
      answers: all,
      result: scoreQuiz(all),
    };
    const data: QuizData = { attempts: [...(saved?.attempts ?? []).filter((a) => a.stage !== stage), attempt] };
    const { error } = await supabase
      .from("project_data")
      .upsert(
        { project_id: currentProject.id, data_key: QUIZ_KEY, data_value: data },
        { onConflict: "project_id,data_key" },
      );
    if (error) {
      setBusy(false);
      toast({ title: "Uložení se nepodařilo", description: "Zkuste to prosím znovu.", variant: "destructive" });
      return;
    }
    if (research) await recordConsents({ vyzkum: true });
    track(
      "quiz_done",
      { stage, type: attempt.result.type, barrier: attempt.result.barrier, research },
      currentProject.id,
    );
    let reward: Reward = null;
    if (stage === "start") {
      const { data: r } = await supabase.rpc("start_trial");
      reward = (r as Reward) ?? null;
    }
    setBusy(false);
    setResult({ attempt, reward });
    window.scrollTo({ top: 0 });
  };

  const total = questions.length;
  const shownResult = result ?? (already ? { attempt: already, reward: null } : null);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <p className="flex items-center gap-2 font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs text-white">
              V7
            </span>
            Jaký jste typ podnikatele?
          </p>
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Zavřít"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {!shownResult && (
          <div className="h-1.5 bg-muted">
            <div
              className="h-full bg-orange-500 transition-all duration-300"
              style={{ width: `${(Math.min(i, total) / total) * 100}%` }}
            />
          </div>
        )}
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        {loading ? (
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
        ) : shownResult ? (
          <QuizResultView attempt={shownResult.attempt} reward={shownResult.reward} onDone={() => navigate("/home")} />
        ) : finished ? (
          <div className="mx-auto max-w-xl rounded-[28px] bg-primary p-8 text-center text-white sm:p-10">
            <Sparkles className="mx-auto h-10 w-10 text-orange-300" />
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Hotovo!</h1>
            <p className="mt-2 text-white/80">Váš typ podnikatele je spočítaný.</p>
            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl bg-white/[0.08] p-4 text-left text-sm text-white/85">
              <input
                type="checkbox"
                checked={research}
                onChange={(e) => setResearch(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-orange-500"
              />
              <span>
                Souhlasím, aby moje odpovědi byly v anonymizované podobě použity pro výzkum motivace dospělých ke
                vzdělávání a podnikání (Edu Partners s.r.o.). Dobrovolné – odměnu dostanete i bez souhlasu.
              </span>
            </label>
            <Button
              onClick={submit}
              disabled={busy}
              className="v7-trap-btn mt-6 h-14 w-full text-lg pr-9 font-bold text-signal-foreground"
            >
              {busy ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
              Ukázat můj typ
            </Button>
            <button
              type="button"
              onClick={() => setI(total - 1)}
              className="mt-4 text-sm text-white/60 hover:text-white"
            >
              Zpět k poslední otázce
            </button>
          </div>
        ) : (
          <div className="mx-auto max-w-xl">
            {firstOfRound && (
              <div className="mb-8 rounded-2xl bg-muted/60 p-5">
                <p className="text-sm font-semibold text-orange-700">
                  Kolo {rounds.findIndex((r) => r.id === q.round.id) + 1} ze {rounds.length}
                </p>
                <p className="text-lg font-bold">{q.round.title}</p>
                <p className="text-sm text-muted-foreground">{q.round.intro}</p>
                {showGuess && (
                  <p className="mt-3 flex items-center gap-2 font-semibold text-primary">
                    <Sparkles className="h-4 w-4 text-orange-500" /> Zatím to vypadá na: {TYPES[guess].name}
                  </p>
                )}
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Otázka {i + 1} z {total}
            </p>
            {q.kind === "scale" && (
              <p className="mt-1 text-sm font-semibold text-orange-700">Jak moc to o vás platí?</p>
            )}
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{q.text}</h2>
            {q.kind === "choice" ? (
              <div className={`mt-6 grid gap-2 ${(q.options?.length ?? 0) > 6 ? "grid-cols-2" : "grid-cols-1"}`}>
                {q.options?.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => answer(o.value)}
                    className={`rounded-xl border px-4 py-3 text-left font-semibold transition-colors ${
                      answers[q.id] === o.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card hover:border-primary/60"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-5 gap-2" role="radiogroup" aria-label={q.text}>
                {SCALE_LABELS.map((label, idx) => {
                  const v = idx + 1;
                  const on = answers[q.id] === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => answer(v)}
                      className={`flex flex-col items-center gap-2 rounded-xl border px-1 py-4 text-center transition-colors ${
                        on
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card hover:border-primary/60"
                      }`}
                    >
                      <span className="text-2xl font-extrabold">{v}</span>
                      <span className="text-[11px] font-semibold leading-tight sm:text-xs">{label}</span>
                    </button>
                  );
                })}
              </div>
            )}
            <div className="mt-8 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => (i === 0 ? navigate("/home") : setI(i - 1))}
                className="rounded-[10px]"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> {i === 0 ? "Zpět" : "Předchozí"}
              </Button>
              {answers[q.id] !== undefined && (
                <Button variant="ghost" onClick={() => setI(i + 1)} className="rounded-[10px]">
                  Další <Check className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const pickProfile = (a: Answers): Answers =>
  Object.fromEntries(ROUNDS[0].questions.map((q) => [q.id, a[q.id]]).filter(([, v]) => v !== undefined));

export default QuizPage;
