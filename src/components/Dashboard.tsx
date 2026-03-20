import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PricingModal } from "./PricingModal";
import { UnifiedHeader } from "./layout/UnifiedHeader";
import { usePersistedState } from "@/hooks/usePersistedState";
import { getPromoCodeAccess, enableLauncher, disableLauncher, isLauncherEnabled, clearBetaAccess, getTrialStatus } from "@/lib/promoCodes";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Lock, Play, Target, Lightbulb, TrendingUp, Wrench, BarChart3, Rocket, Layers, FileText, Crown, Gift, RefreshCw, ToggleRight } from "lucide-react";

const phases = [
  {
    id: 1,
    title: "Vision",
    subtitle: "Strategie modrého oceánu",
    description: "Definujte svou vizi pomocí Blue Ocean Strategy a ERRC matice",
    icon: Target,
    estimatedTime: "45 min",
    isFree: true,
    route: "/vision"
  },
  {
    id: 2,
    title: "Ideation",
    subtitle: "Lean Canvas",
    description: "Vytvořte business model s validovanými předpoklady",
    icon: Lightbulb,
    estimatedTime: "30 min",
    isFree: true,
    route: "/ideation"
  },
  {
    id: 3,
    title: "Strategy & Business",
    subtitle: "ROI kalkulačka",
    description: "Propočítejte návratnost investice a finanční plán",
    icon: TrendingUp,
    estimatedTime: "60 min",
    isFree: true,
    route: "/strategy"
  },
  {
    id: 4,
    title: "Implementation",
    subtitle: "Roadmapa podle business typu",
    description: "Prohlédněte si typy podnikání a získejte šablony",
    icon: Wrench,
    estimatedTime: "20 min",
    isFree: true, // Changed to true - browsing is free
    route: "/implementation"
  },
  {
    id: 5,
    title: "Benchmarking & Testing",
    subtitle: "Marketingové kanály",
    description: "Identifikujte nejefektivnější kanály pro váš segment",
    icon: BarChart3,
    estimatedTime: "35 min",
    isFree: true,
    route: "/benchmarking-phase"
  },
  {
    id: 6,
    title: "Launch",
    subtitle: "Go-to-market strategie",
    description: "Připravte si detailní plán uvedení produktu na trh",
    icon: Rocket,
    estimatedTime: "40 min",
    isFree: true,
    route: "/launch"
  },
  {
    id: 7,
    title: "Expansion",
    subtitle: "Škálování a růst",
    description: "Strategie pro rozšiřování a zvyšování tržního podílu",
    icon: Layers,
    estimatedTime: "50 min",
    isFree: true,
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
  const [completedPhases, setCompletedPhases] = usePersistedState<number[]>("completed_phases", []);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [hasAccess, setHasAccess] = usePersistedState<boolean>("hasAccess", false);
  const [showInvestorPitch, setShowInvestorPitch] = useState(false);
  const promoCodeAccess = !!getPromoCodeAccess();
  const trialStatus = getTrialStatus();
  const completedCount = completedPhases.length;
  const progressPercentage = completedCount / phases.length * 100;
  const corePhases = phases.slice(0, 3); // First 3 phases: Vision, Ideation, Strategy
  const coreCompletedCount = completedPhases.filter(id => id <= 3).length;
  const allCoreCompleted = coreCompletedCount === 3;
  
  const handlePhaseClick = (phaseId: number) => {
    console.log("🖱️ Phase click:", { phaseId, hasAccess, promoCodeAccess });
    
    const phase = phases.find(p => p.id === phaseId);
    console.log("📋 Phase details:", { phase: phase?.title, isFree: phase?.isFree });
    
    // Free phases (1-4) - always accessible
    if (phase?.isFree) {
      console.log("✅ Free phase, navigating to:", phase.route);
      navigate(phase.route || '/');
      return;
    }
    
    // Fallback for any non-free phase
    if (phase) {
      const userHasAccess = hasAccess || promoCodeAccess;
      console.log("💰 Paid phase access check:", { 
        userHasAccess, 
        hasAccess, 
        promoCodeAccess,
        targetRoute: userHasAccess ? phase.route : `${phase.route}/preview`
      });
      
      // If user has access, go to full version
      if (userHasAccess) {
        console.log("✅ User has access, navigating to full version:", phase.route);
        navigate(phase.route || '/');
      } else {
        console.log("⚠️ User has no access, navigating to preview:", `${phase.route}/preview`);
        // No access - go to preview
        navigate(`${phase.route}/preview`);
      }
      return;
    }
    
    // Fallback for other phases
    if (hasAccess || promoCodeAccess) {
      console.log("✅ Access granted, navigating to:", phase?.route);
      navigate(phase?.route || '/');
    } else {
      console.log("💳 No access, showing pricing modal");
      setShowPricingModal(true);
    }
  };

  const handlePaymentSuccess = () => {
    console.log("💳 Payment successful, granting access");
    
    // Set access and ensure it's persisted
    setHasAccess(true);
    
    // Force localStorage update to ensure persistence
    localStorage.setItem('hasAccess', 'true');
    
    console.log("✅ Access granted:", { 
      hasAccess: true, 
      localStorage: localStorage.getItem('hasAccess') 
    });
    
    setShowPricingModal(false);
    
    // Small delay to ensure state is properly updated before any potential navigation
    setTimeout(() => {
      console.log("🔄 Payment success completed, state should be updated");
    }, 100);
  };

  const handleInvestorPitchClick = () => {
    navigate('/investor-pitch');
  };

  const handleResetToLauncher = () => {
    console.log("🔄 Resetting to launcher mode");
    clearBetaAccess();
    enableLauncher();
    window.location.reload();
  };

  const handleToggleLauncher = () => {
    const currentState = isLauncherEnabled();
    if (currentState) {
      disableLauncher();
      console.log("❌ Launcher disabled");
    } else {
      enableLauncher();
      console.log("✅ Launcher enabled");
    }
    window.location.reload();
  };

  const canAccessPhase = (phaseId: number) => {
    const phase = phases.find(p => p.id === phaseId);
    if (phase?.isFree) return true;
    if (phase?.previewOnly) return true; // Preview phases are always "accessible" 
    if (hasAccess || promoCodeAccess) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      {/* Unified Header */}
      <UnifiedHeader showTrialInfo={false} />
      
      {/* Admin Controls Bar */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-12">
              <div className="flex items-center space-x-2">
                {promoCodeAccess && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                    <Gift className="w-3 h-3 mr-1" />
                    Promo přístup
                  </Badge>
                )}
                {hasAccess && !promoCodeAccess && !trialStatus.isActive && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    <Crown className="w-3 h-3 mr-1" />
                    Pro přístup
                  </Badge>
                )}
                
                {/* Debug info */}
                <Badge variant="outline" className="text-xs bg-muted">
                  Debug: hasAccess={hasAccess.toString()}, promo={promoCodeAccess.toString()}
                </Badge>
              </div>
              
              {/* Admin Controls */}
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={handleResetToLauncher} 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-foreground"
                  title="Reset do launcher režimu"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={handleToggleLauncher} 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-foreground"
                  title={`${isLauncherEnabled() ? 'Zakázat' : 'Povolit'} launcher`}
                >
                  <ToggleRight className="w-4 h-4" />
                </Button>
              </div>
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
            const isAccessible = canAccessPhase(phase.id);
            const IconComponent = phase.icon;
            
            return (
              <Card 
                key={phase.id} 
                className={`card-apple-hover p-6 transition-all duration-200 ${
                  isCompleted ? 'ring-2 ring-primary/20 bg-primary/5' : ''
                } ${!isAccessible ? 'opacity-60' : 'cursor-pointer'}`} 
                onClick={() => isAccessible ? handlePhaseClick(phase.id) : undefined}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${
                    isCompleted 
                      ? 'bg-primary text-primary-foreground' 
                      : isAccessible 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : !isAccessible ? (
                      <Lock className="w-6 h-6" />
                    ) : (
                      <IconComponent className="w-6 h-6" />
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    {phase.isFree && (
                      <Badge variant="secondary" className="text-xs">
                        ZDARMA
                      </Badge>
                    )}
                    {phase.previewOnly && !hasAccess && !promoCodeAccess && (
                      <Badge variant="outline" className="text-xs">
                        NÁHLED
                      </Badge>
                    )}
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
                    {isAccessible && (
                      <Button size="sm" variant="ghost" className="text-primary hover:text-primary/80">
                        <Play className="w-3 h-3 mr-1" />
                        {phase.previewOnly && !hasAccess && !promoCodeAccess ? 'Náhled' : isCompleted ? 'Znovu' : 'Začít'}
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

        {/* CTA pro odemknutí pokročilých fází */}
        {!hasAccess && !promoCodeAccess && allCoreCompleted && (
          <Card className="card-apple mt-8 p-6 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Odemkněte pokročilé fáze VISIBLE7
              </h3>
              <p className="text-apple-body mb-6">
                Získejte přístup k pokročilým fázím 5-7: Benchmarking, Launch a Expansion s kompletními nástroji a analýzami
              </p>
              <div className="space-y-4">
                <div className="text-3xl font-bold text-primary">990 Kč</div>
                <Button onClick={() => setShowPricingModal(true)} className="btn-apple text-base px-8">
                  Odemknout pokročilé fáze
                </Button>
                <p className="text-xs text-muted-foreground">
                  Jednorázová platba • Přístup navždy • 30 dní záruka vrácení peněz
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
