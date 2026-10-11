import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Gift, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSupabaseProgress } from "@/hooks/useSupabaseProgress";
import { useAccess } from "@/lib/access";
import { QUIZ_KEY, QuizData, QuizStage } from "@/lib/quiz";

/** Text odměny podle stavu přístupu: 7 dní zdarma jen když ještě nebyly využity a platby jsou zapnuté. */
const useRewardText = () => {
  const access = useAccess();
  return access.paywall && !access.trialUsed && !access.paid
    ? "odznak a 7 dní plného přístupu zdarma"
    : "odznak a osobní tipy";
};

/** Bonus pod výsledkem rentgenu. */
export const QuizBonusCard = () => {
  const navigate = useNavigate();
  const [quiz, , { loading }] = useSupabaseProgress<QuizData | null>(QUIZ_KEY, null);
  const reward = useRewardText();
  if (loading || quiz?.attempts?.length) return null;
  return (
    <section className="flex flex-col gap-5 rounded-3xl border-2 border-dashed border-orange-300 bg-card p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
          <Gift className="h-6 w-6" />
        </span>
        <div>
          <p className="text-sm font-semibold text-orange-700">Bonus</p>
          <h2 className="text-xl font-bold">Zjistěte, jaký jste typ podnikatele</h2>
          <p className="mt-1 text-muted-foreground">3 minuty, 16 klepnutí. Odměna: {reward}.</p>
        </div>
      </div>
      <Button onClick={() => navigate("/kviz")} className="h-12 shrink-0 rounded-[10px] px-6 text-base font-semibold">
        Spustit kvíz <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </section>
  );
};

const SEEN_KEY = "v7_quiz_card_seen";
const DISMISS_KEY = "v7_quiz_card_dismissed";

/** Malá karta na přehledu projektu – zobrazí se nejvýš dvakrát a jde zavřít. */
export const QuizDashboardCard = () => {
  const navigate = useNavigate();
  const [quiz, , { loading }] = useSupabaseProgress<QuizData | null>(QUIZ_KEY, null);
  const reward = useRewardText();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (loading || quiz?.attempts?.length) return;
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
      const seen = Number(localStorage.getItem(SEEN_KEY) ?? 0);
      if (seen >= 2) return;
      localStorage.setItem(SEEN_KEY, String(seen + 1));
    } catch {
      /* bez localStorage kartu prostě ukážeme */
    }
    setVisible(true);
  }, [loading, quiz]);

  if (!visible) return null;
  return (
    <section className="relative flex items-center gap-4 rounded-2xl border border-border bg-card p-5 pr-12">
      <Sparkles className="h-6 w-6 shrink-0 text-orange-500" />
      <div className="min-w-0 flex-1">
        <p className="font-bold">Jaký jste typ podnikatele?</p>
        <p className="text-sm text-muted-foreground">Kvíz na 3 minuty. Odměna: {reward}.</p>
      </div>
      <Button size="sm" variant="outline" className="shrink-0 rounded-[10px]" onClick={() => navigate("/kviz")}>
        Spustit
      </Button>
      <button
        type="button"
        aria-label="Zavřít"
        onClick={() => {
          try {
            localStorage.setItem(DISMISS_KEY, "1");
          } catch {
            /* nic */
          }
          setVisible(false);
        }}
        className="absolute right-3 top-3 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </section>
  );
};

/** Opakované měření po bráně 3 a 7 (pro výzkum) – nabídka v oslavě dokončené brány. */
export const QuizRepeatLink = ({ gate }: { gate: number }) => {
  const navigate = useNavigate();
  const [quiz] = useSupabaseProgress<QuizData | null>(QUIZ_KEY, null);
  const stage: QuizStage | null = gate === 3 ? "brana3" : gate === 7 ? "brana7" : null;
  const attempts = quiz?.attempts ?? [];
  if (!stage || !attempts.some((a) => a.stage === "start") || attempts.some((a) => a.stage === stage)) return null;
  return (
    <Button variant="ghost" className="h-12 rounded-[10px]" onClick={() => navigate(`/kviz?etapa=${stage}`)}>
      <Sparkles className="mr-2 h-4 w-4 text-orange-500" /> Jak se změnil váš podnikatelský profil? (2 min)
    </Button>
  );
};
