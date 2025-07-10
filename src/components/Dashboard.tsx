import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Eye, Lightbulb, Target, Wrench, TrendingUp, Rocket, Zap, Lock, CheckCircle, Play, User, LogOut, FileText, Crown } from "lucide-react";
import { VisionPhase } from "./VisionPhase";
import { IdeationPhase } from "./IdeationPhase";
import { StrategyBusinessPhase } from "./StrategyBusinessPhase";
import { InvestorPitch } from "./InvestorPitch";
import { PaymentModal } from "./PaymentModal";
const phases = [{
  id: 1,
  title: "Vision",
  subtitle: "Strategie modrého oceánu",
  description: "Objevte svou jedinečnou hodnotu na trhu",
  icon: Eye,
  isFree: true,
  estimatedTime: "15 min"
}, {
  id: 2,
  title: "Ideation",
  subtitle: "Lean Canvas",
  description: "Popište si váš byznys model pro váš projekt",
  icon: Lightbulb,
  isFree: false,
  estimatedTime: "25 min"
}, {
  id: 3,
  title: "Strategy & Business",
  subtitle: "Výpočet ROI",
  description: "Analyzujte návratnost vaší investice",
  icon: Target,
  isFree: false,
  estimatedTime: "20 min"
}, {
  id: 4,
  title: "Implementation",
  subtitle: "Výběr typu byznysu",
  description: "12 typů online byznysů + WordPress šablony",
  icon: Wrench,
  isFree: false,
  estimatedTime: "30 min"
}, {
  id: 5,
  title: "Benchmarking & Testing",
  subtitle: "Marketing a PPC",
  description: "Připravte si marketing a spusťte PPC kampaně",
  icon: TrendingUp,
  isFree: false,
  estimatedTime: "35 min"
}, {
  id: 6,
  title: "Launch",
  subtitle: "MVP a KPI",
  description: "Definujte MVP a ověřte pomocí KPI",
  icon: Rocket,
  isFree: false,
  estimatedTime: "25 min"
}, {
  id: 7,
  title: "Expansion",
  subtitle: "Automatizace růstu",
  description: "Nástroje pro škálování vašeho projektu",
  icon: Zap,
  isFree: false,
  estimatedTime: "40 min"
}];
interface DashboardProps {
  userEmail: string;
  onLogout: () => void;
}
export const Dashboard = ({
  userEmail,
  onLogout
}: DashboardProps) => {
  const [completedPhases, setCompletedPhases] = useState<number[]>([]);
  const [currentPhase, setCurrentPhase] = useState<number | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [showInvestorPitch, setShowInvestorPitch] = useState(false);
  const completedCount = completedPhases.length;
  const progressPercentage = completedCount / phases.length * 100;
  const corePhases = phases.slice(0, 3); // First 3 phases: Vision, Ideation, Strategy
  const coreCompletedCount = completedPhases.filter(id => id <= 3).length;
  const allCoreCompleted = coreCompletedCount === 3;
  const handlePhaseClick = (phaseId: number) => {
    const phase = phases.find(p => p.id === phaseId);
    if (phase?.isFree || hasAccess) {
      setCurrentPhase(phaseId);
    } else {
      setShowPaymentModal(true);
    }
  };
  const handlePhaseComplete = (phaseId: number) => {
    if (!completedPhases.includes(phaseId)) {
      setCompletedPhases([...completedPhases, phaseId]);
    }
    setCurrentPhase(null);
  };
  const handlePaymentSuccess = () => {
    setHasAccess(true);
    setShowPaymentModal(false);
  };
  const canAccessPhase = (phaseId: number) => {
    const phase = phases.find(p => p.id === phaseId);
    if (phase?.isFree) return true;
    if (hasAccess) return true;
    return false;
  };
  if (currentPhase === 1) {
    return <VisionPhase onComplete={() => handlePhaseComplete(1)} onBack={() => setCurrentPhase(null)} />;
  }
  
  if (currentPhase === 2) {
    return <IdeationPhase onComplete={() => handlePhaseComplete(2)} onBack={() => setCurrentPhase(null)} />;
  }
  
  if (currentPhase === 3) {
    return <StrategyBusinessPhase onComplete={() => handlePhaseComplete(3)} onBack={() => setCurrentPhase(null)} />;
  }

  if (showInvestorPitch) {
    return <InvestorPitch onBack={() => setShowInvestorPitch(false)} />;
  }
  return <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">V7</span>
              </div>
              <h1 className="text-xl font-semibold text-foreground">VISIBLE7 MICEK&trade; </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{userEmail}</span>
              </div>
              <Button onClick={onLogout} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Overview */}
        <div className="mb-8">
          <Card className="card-apple p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-apple-title">Váš pokrok</h2>
                <p className="text-apple-subtitle mt-1">
                  Dokončeno {completedCount} z {phases.length} fází
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {Math.round(progressPercentage)}%
                </div>
                <div className="text-sm text-muted-foreground">hotovo</div>
              </div>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </Card>
        </div>

        {/* Fáze */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {phases.map(phase => {
          const isCompleted = completedPhases.includes(phase.id);
          const isAccessible = canAccessPhase(phase.id);
          const IconComponent = phase.icon;
          return <Card key={phase.id} className={`card-apple-hover p-6 cursor-pointer transition-all duration-200 ${isCompleted ? 'ring-2 ring-primary/20 bg-primary/5' : ''} ${!isAccessible ? 'opacity-60' : ''}`} onClick={() => handlePhaseClick(phase.id)}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${isCompleted ? 'bg-primary text-primary-foreground' : isAccessible ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {isCompleted ? <CheckCircle className="w-6 h-6" /> : !isAccessible ? <Lock className="w-6 h-6" /> : <IconComponent className="w-6 h-6" />}
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    {phase.isFree && <Badge variant="secondary" className="text-xs">
                        ZDARMA
                      </Badge>}
                    {isCompleted && <Badge className="bg-primary/10 text-primary border-primary/20">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Hotovo
                      </Badge>}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">{phase.title}</h3>
                  <p className="text-sm font-medium text-primary">{phase.subtitle}</p>
                  <p className="text-apple-body">{phase.description}</p>
                  
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground">
                      ⏱ {phase.estimatedTime}
                    </span>
                    {isAccessible && <Button size="sm" variant="ghost" className="text-primary hover:text-primary/80">
                        <Play className="w-3 h-3 mr-1" />
                        {isCompleted ? 'Znovu' : 'Začít'}
                      </Button>}
                  </div>
                </div>
              </Card>;
        })}
        </div>

        {/* Investor Pitch CTA */}
        {allCoreCompleted && (
          <Card className="card-apple mt-8 p-6 bg-gradient-to-r from-emerald-500/5 via-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl">
                  <FileText className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-xl font-semibold text-foreground">Investor Pitch Deck</h3>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                      <Crown className="w-3 h-3 mr-1" />
                      Připraveno
                    </Badge>
                  </div>
                  <p className="text-apple-body">
                    Všechny 3 fáze dokončeny! Vygenerujte profesionální investor pitch na základě vašich dat.
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setShowInvestorPitch(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
              >
                <FileText className="w-4 h-4 mr-2" />
                Vygenerovat Pitch
              </Button>
            </div>
          </Card>
        )}

        {/* CTA pro odemknutí */}
        {!hasAccess && <Card className="card-apple mt-8 p-6 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Odemkněte celou metodiku VISIBLE7
              </h3>
              <p className="text-apple-body mb-6">
                Získejte přístup ke všem 7 fázím, AI analýzám, exportům a exkluzivním šablonám
              </p>
              <div className="space-y-4">
                <div className="text-3xl font-bold text-primary">990 Kč</div>
                <Button onClick={() => setShowPaymentModal(true)} className="btn-apple text-base px-8">
                  Odemknout přístup
                </Button>
                <p className="text-xs text-muted-foreground">
                  Jednorázová platba • Přístup navždy • 30 dní záruka vrácení peněz
                </p>
              </div>
            </div>
          </Card>}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && <PaymentModal onClose={() => setShowPaymentModal(false)} onSuccess={handlePaymentSuccess} completedPhases={completedCount} totalPhases={phases.length} />}
    </div>;
};