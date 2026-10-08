import { useEffect, useState } from "react";
import { CertificateIssueDialog } from "@/components/CertificateIssueDialog";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Award, Check } from "lucide-react";

interface PhaseCelebrationProps {
  gate: number;
  title: string;
  message: string;
  nextLabel?: string;
  onNext?: () => void;
  onHome: () => void;
}

/** Oslava po dokončení fáze: konfety a „Brána N otevřena“. */
export const PhaseCelebration = ({ gate, title, message, nextLabel, onNext, onHome }: PhaseCelebrationProps) => {
  const [certOpen, setCertOpen] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const end = Date.now() + 1200;
    const frame = () => {
      confetti({ particleCount: 6, angle: 60, spread: 70, origin: { x: 0, y: 0.7 } });
      confetti({ particleCount: 6, angle: 120, spread: 70, origin: { x: 1, y: 0.7 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
    frame();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <Card className="card-apple w-full max-w-md p-8 text-center animate-fade-in">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white">
          <Check className="h-8 w-8" strokeWidth={3} />
        </div>
        <p className="font-semibold text-emerald-700">Brána {gate} je otevřená</p>
        <h2 className="mt-2 text-2xl font-bold text-foreground">{title}</h2>
        <p className="mt-3 text-muted-foreground">{message}</p>
        <div className="mt-6 flex flex-col gap-2">
          {onNext && nextLabel && (
            <Button className="btn-apple h-12" onClick={onNext}>
              {nextLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" className="h-12 rounded-[10px]" onClick={() => setCertOpen(true)}>
            <Award className="mr-2 h-4 w-4" />
            Získat osvědčení za fázi {gate}
          </Button>
          <Button variant="ghost" className="h-12 rounded-[10px]" onClick={onHome}>
            Zpět na přehled
          </Button>
        </div>
      </Card>
      <CertificateIssueDialog open={certOpen} onOpenChange={setCertOpen} kind="phase" phase={gate} />
    </div>
  );
};
