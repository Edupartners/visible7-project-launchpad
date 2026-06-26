import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PricingModal } from "./PricingModal";
import { UnifiedHeader } from "./layout/UnifiedHeader";
import { useSupabaseProgress } from "@/hooks/useSupabaseProgress";
import { useSubscription } from "@/hooks/useSubscription";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Lock, Play, Target, Lightbulb, TrendingUp, Wrench, BarChart3, Rocket, Layers, FileText, Crown, Gift } from "lucide-react";

const phases = [
  {
    id: 1,
    title: "Vision",
    subtitle: "Strategie modrého oceánu",
    description: "Definujte svou vizi pomocí Blue Ocean Strategy a ERRC matice",
    icon: Target,
    estimatedTime: "45 min",
    route: "/vision"
  },
  {
    id: 2,
    title: "Ideation",
    subtitle: "Lean Canvas",
    description: "Vytvořte business model s validovanými předpoklady",
    icon: Lightbulb,
    estimatedTime: "30 min",
    route: "/ideation"
  },
  {
    id: 3,
    title: "Strategy & Business",
    subtitle: "ROI kalkulačka",
    description: "Propočítejte návratnost investice a finanční plán",
    icon: TrendingUp,
    estimatedTime: "60 min",
    route: "/strategy"
  },
  {
    id: 4,
    title: "Implementation",
    subtitle: "Roadmapa podle business typu",
    description: "Prohlédněte si typy podnikání a získejte šablony",
    icon: Wrench,
    estimatedTime: "20 min",
    route: "/implementation"
  },
  {
    id: 5,
    title: "Benchmarking & Testing",
    subtitle: "Marketingové kanály",
    description: "Identifikujte nejefektivnější kanály pro váš segment",
    icon: BarChart3,
    estimatedTime: "35 min",
    route: "/benchmarking-phase"
  },
  {
    id: 6,
    title: "Launch",
    subtitle: "Go-to-market strategie",
    description: "Připravte si detailní plán uvedení produktu na trh",
    icon: Rocket,
    estimatedTime: "40 min",
    route: "/launch"
  },
  {
    id: 7,
    title: "Expansion",
    subtitle: "Škálování a růst",
    description: "Strategie pro rozšiřování a zvyšování tržního podílu",
    icon: Layers,
    estimatedTime: "50 min",
    route: "/expansion"
  }
];

interface DashboardProps {
  userEmail: string;
  onLogout: () => void;
  isAuthenticated?: boolean;
}

export const Dashboard = ({
  userEmail,
  onLogout,
  isAuthenticated = true
}: DashboardProps) => {
  const navigate = useNavigate();
  // Postup uživatele - jeden projekt, ukládá se v Supabase (cross-device)
  const [completedPhases, setCompletedPhases] = useSupabaseProgress<number[]>("completed_phases", []);
  const [showPricingModal, setShowPricingModal] = useState(false);

  // Přístup (trial / aktivní předplatné 290 Kč/měsíc / promo kód) - server-side, nelze obejít v prohlížeči
  const { hasAccess, status, daysRemaining, loading: subscriptionLoading } = useSubscription();

  const completedCount = completedPhases.length;
  const progressPercentage = completedCount / phases.length * 100;
  const allCoreCompleted = completedPhases.filter(id => id <= 3).length === 3;

  const handlePhaseClick = (phaseId: number) => {
    const phase = phases.find(p => p.id === phaseId);
    if (!phase) return;

    if (hasAccess) {
      navigate(phase.route);
    } else {
      setShowPricingModal(true);
    }
  };

  const handlePaymentSuccess = () => {
    // Skutečné navázání platby (Stripe) doplníme později.
    // Po úspěšné platbě se subscription stav v DB aktualizuje na 'active'
    // a refresh() v useSubscription si stáhne nový stav.
    setShowPricingModal(false);
  };

  const handleInvestorPitchClick = () => {
    navigate('/investor-pitch');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      {/* Unified Header */}
      <UnifiedHeader showTrialInfo={false} />

      {/* Stav přístupu */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-12">
            {!subscriptionLoading && status === 'trial' && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                <Gift className="w-3 h-3 mr-1" />
                Zkušební přístup · zbývá {daysRemaining} {daysRemaining === 1 ? 'den' : 'dní'}
              </Badge>
            )}
            {!subscriptionLoading && status === 'active' && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                <Crown className="w-3 h-3 mr-1" />
                Aktivní přístup
              </Badge>
            )}
            {!subscriptionLoading && status === 'expired' && (
              <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20">
                <Lock className="w-3 h-3 mr-1" />
                Přístup vypršel
              </Badge>
            )}
          </div>
        </div>
      </div>

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
            const IconComponent = phase.icon;
            
            return (
              <Card 
                key={phase.id} 
                className={`card-apple-hover p-6 transition-all duration-200 ${
                  isCompleted ? 'ring-2 ring-primary/20 bg-primary/5' : ''
                } ${!hasAccess ? 'opacity-60' : 'cursor-pointer'}`} 
                onClick={() => handlePhaseClick(phase.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${
                    isCompleted 
                      ? 'bg-primary text-primary-foreground' 
                      : hasAccess 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : !hasAccess ? (
                      <Lock className="w-6 h-6" />
                    ) : (
                      <IconComponent className="w-6 h-6" />
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    {isCompleted && (
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Hotovo
                      </Badge>
                    )}
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
                    {hasAccess && (
                      <Button size="sm" variant="ghost" className="text-primary hover:text-primary/80">
                        <Play className="w-3 h-3 mr-1" />
                        {isCompleted ? 'Znovu' : 'Začít'}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
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
                onClick={handleInvestorPitchClick}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
              >
                <FileText className="w-4 h-4 mr-2" />
                Vygenerovat Pitch
              </Button>
            </div>
          </Card>
        )}

        {/* CTA pro aktivaci přístupu */}
        {!subscriptionLoading && !hasAccess && (
          <Card className="card-apple mt-8 p-6 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Aktivujte přístup k VISIBLE7
              </h3>
              <p className="text-apple-body mb-6">
                Vaše zkušební období vypršelo. Pokračujte v práci na svém projektu s plným přístupem ke všem fázím.
              </p>
              <div className="space-y-4">
                <div className="text-3xl font-bold text-primary">290 Kč<span className="text-base font-normal text-muted-foreground"> / měsíc</span></div>
                <Button onClick={() => setShowPricingModal(true)} className="btn-apple text-base px-8">
                  Aktivovat přístup
                </Button>
                <p className="text-xs text-muted-foreground">
                  Máte promo kód od svého kurzu? Zadejte ho v okně po kliknutí.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Pricing Modal */}
      {showPricingModal && (
        <PricingModal 
          onClose={() => setShowPricingModal(false)} 
          onSuccess={handlePaymentSuccess} 
          completedPhases={completedCount} 
          totalPhases={phases.length} 
        />
      )}
    </div>
  );
};
