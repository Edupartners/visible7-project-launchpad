import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Loader2, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GATE_NAMES } from "@/lib/certificates";
import { QUIZ_PASS, QUIZ_SIZE, QuizResult, QuizRun, startQuiz, submitQuiz } from "@/lib/gateQuiz";
import { GATE_MAIN, useResume } from "@/lib/resume";
import { track } from "@/lib/track";

/** Kontrolní otázky k bráně: úvod → 5 otázek → výsledek s vysvětlením. */
export const GateQuiz = ({
  projectId,
  gate,
  onPassed,
  onClose,
}: {
  projectId: string;
  gate: number;
  onPassed: () => void;
  onClose: () => void;
}) => {
  const navigate = useNavigate();
  const { resume } = useResume();
  const [run, setRun] = useState<QuizRun | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const begin = async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    const { run: r, error: e } = await startQuiz(projectId, gate);
    setBusy(false);
    if (e || !r) return setError(e ?? "Test se nepodařilo spustit.");
    setRun(r);
    setAnswers(r.questions.map(() => null));
    track("gate_quiz_start", { gate });
  };

  const submit = async () => {
    if (!run || answers.some((a) => a === null)) return;
    setBusy(true);
    setError(null);
    const { result: r, error: e } = await submitQuiz(run.attempt, answers as number[]);
    setBusy(false);
    if (e || !r) return setError(e ?? "Odpovědi se nepodařilo vyhodnotit.");
    setResult(r);
    track("gate_quiz_result", { gate, score: r.score, passed: r.passed });
    document.getElementById("gate-quiz-top")?.scrollIntoView({ behavior: "smooth" });
  };

  const gateName = `Brána ${gate}: ${GATE_NAMES[gate]}`;

  // Úvod
  if (!run) {
    return (
      <div id="gate-quiz-top">
        <p className="text-sm font-semibold text-leaf-700">Kontrolní otázky · {gateName}</p>
        <h2 className="mt-1 text-xl font-bold tracking-tight">Než vydáme osvědčení, ověřte si, co umíte</h2>
        <ul className="mt-4 space-y-2 text-[15px]">
          <li>
            {QUIZ_SIZE} otázek z praxe, k osvědčení stačí {QUIZ_PASS} správně.
          </li>
          <li>Zabere to asi 3 minuty.</li>
          <li>Když to nevyjde, uvidíte, co si zopakovat, a můžete to zkusit znovu s jinými otázkami.</li>
        </ul>
        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-900">{error}</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={begin}
            disabled={busy}
            className="v7-trap-btn inline-flex h-11 items-center gap-2 pl-5 pr-10 font-bold text-signal-foreground disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Začít otázky
          </button>
          <Button variant="outline" className="h-11 rounded-[10px]" onClick={onClose}>
            Teď ne
          </Button>
        </div>
      </div>
    );
  }

  const answered = answers.filter((a) => a !== null).length;

  return (
    <div id="gate-quiz-top">
      <p className="text-sm font-semibold text-leaf-700">Kontrolní otázky · {gateName}</p>
      {result ? (
        <div
          className={`mt-2 rounded-2xl p-4 ${result.passed ? "border-[3px] border-signal bg-leaf-50" : "border border-amber-300 bg-amber-50"}`}
          role="status"
        >
          <p className="text-lg font-bold">
            {result.passed ? "Splněno" : "Tentokrát to nevyšlo"}: {result.score} z {result.total} správně
          </p>
          <p className="mt-1 text-sm">
            {result.passed
              ? "Výborně. Níže si můžete projít vysvětlení a pak si vyzvednout osvědčení."
              : `K osvědčení je potřeba ${QUIZ_PASS} z ${result.total}. Projděte si vysvětlení a zkuste to znovu s jinými otázkami.`}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {result.passed ? (
              <button
                type="button"
                onClick={onPassed}
                className="v7-trap-btn inline-flex h-11 items-center gap-2 pl-5 pr-10 font-bold text-signal-foreground"
              >
                Pokračovat k osvědčení <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={begin}
                  disabled={busy}
                  className="v7-trap-btn inline-flex h-11 items-center gap-2 pl-5 pr-10 font-bold text-signal-foreground disabled:opacity-60"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" /> Zkusit znovu
                </button>
                <Button
                  variant="outline"
                  className="h-11 rounded-[10px]"
                  onClick={() => {
                    onClose();
                    navigate(resume(GATE_MAIN[gate]));
                  }}
                >
                  Zopakovat si bránu {gate}
                </Button>
              </>
            )}
          </div>
        </div>
      ) : (
        <p className="mt-1 text-sm text-muted-foreground">
          Zodpovězeno {answered} z {run.questions.length}
        </p>
      )}

      <ol className="mt-5 space-y-5">
        {run.questions.map((q, i) => {
          const r = result?.results[i];
          return (
            <li key={q.id} className="rounded-2xl border border-border p-4">
              <fieldset disabled={!!result}>
                <legend className="font-semibold">
                  {i + 1}. {q.question}
                </legend>
                <div className="mt-3 space-y-2">
                  {q.options.map((o, j) => {
                    const chosen = answers[i] === j;
                    const isCorrect = r && r.correct === j;
                    const isWrongChoice = r && chosen && !r.ok;
                    return (
                      <label
                        key={j}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-[15px] ${
                          isCorrect
                            ? "border-leaf-500 bg-leaf-50"
                            : isWrongChoice
                              ? "border-red-300 bg-red-50"
                              : chosen
                                ? "border-primary bg-muted"
                                : "border-border hover:bg-muted/60"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          checked={chosen}
                          onChange={() => setAnswers((a) => a.map((x, k) => (k === i ? j : x)))}
                          className="mt-1 h-4 w-4 shrink-0 accent-[hsl(var(--primary))]"
                        />
                        <span className="flex-1">{o}</span>
                        {isCorrect && <Check className="h-5 w-5 shrink-0 text-leaf-700" aria-label="Správná odpověď" />}
                        {isWrongChoice && <X className="h-5 w-5 shrink-0 text-red-700" aria-label="Vaše odpověď" />}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
              {r?.explanation && (
                <p className={`mt-3 rounded-lg p-3 text-sm ${r.ok ? "bg-leaf-50" : "bg-amber-50 text-amber-950"}`}>
                  {r.explanation}
                  {!r.ok && r.topic && <span className="block pt-1 font-semibold">Zopakujte si: {r.topic}</span>}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-900">{error}</p>}
      {!result && (
        <div className="mt-6">
          <button
            type="button"
            onClick={submit}
            disabled={busy || answered < run.questions.length}
            className="v7-trap-btn inline-flex h-11 items-center gap-2 pl-5 pr-10 font-bold text-signal-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Vyhodnotit odpovědi
          </button>
        </div>
      )}
    </div>
  );
};
