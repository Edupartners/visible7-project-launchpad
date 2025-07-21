import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { BackButton } from "@/components/ui/back-button";
import { Download, Play, CheckCircle2, ExternalLink, Clock, DollarSign, Lock } from "lucide-react";
import { businessTypes, type RoadmapStep } from "@/types/implementation";
import { usePersistedState } from "@/hooks/usePersistedState";
import { TemplatePaymentModal } from "./TemplatePaymentModal";
import { getPromoCodeAccess } from "@/lib/promoCodes";

interface BusinessTypeRoadmapProps {
  businessTypeId: string;
  onBack: () => void;
}

export const BusinessTypeRoadmap = ({ businessTypeId, onBack }: BusinessTypeRoadmapProps) => {
  const businessType = businessTypes.find(bt => bt.id === businessTypeId);
  const [steps, setSteps] = usePersistedState<RoadmapStep[]>(
    `roadmap-${businessTypeId}`, 
    businessType?.steps || []
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [hasTemplateAccess, setHasTemplateAccess] = usePersistedState<boolean>("hasTemplateAccess", false);
  
  // Check for promo access
  const promoCodeAccess = !!getPromoCodeAccess();

  useEffect(() => {
    if (businessType && steps.length === 0) {
      setSteps(businessType.steps);
    }
  }, [businessType, steps.length, setSteps]);

  if (!businessType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Typ podnikání nenalezen</p>
      </div>
    );
  }

  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;
  const totalCost = steps.filter(step => step.completed).reduce((sum, step) => sum + step.price, 0);

  const handleStepToggle = (stepId: string) => {
    setSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === stepId 
          ? { ...step, completed: !step.completed }
          : step
      )
    );
  };

  const handleTemplateDownload = () => {
    if (hasTemplateAccess || promoCodeAccess) {
      // User has access, proceed with download
      window.open(businessType?.templateUrl || '#', '_blank');
    } else {
      // Show payment modal
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSuccess = () => {
    setHasTemplateAccess(true);
    setShowPaymentModal(false);
    // Proceed with download
    window.open(businessType?.templateUrl || '#', '_blank');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Nízká': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'Střední': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'Vyšší': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <BackButton onBack={onBack} />
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">V7</span>
              </div>
              <h1 className="text-xl font-semibold text-foreground">{businessType.name}</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Business Type Header */}
        <div className="mb-8">
          <Card className="card-apple p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-apple-title">{businessType.name}</h2>
                  <Badge className={getDifficultyColor(businessType.difficulty)}>
                    {businessType.difficulty}
                  </Badge>
                </div>
                <p className="text-apple-body mb-4">{businessType.description}</p>
                
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{businessType.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{completedSteps} / {totalSteps} kroků</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>{totalCost.toLocaleString()} Kč</span>
                  </div>
                </div>
              </div>
              
              <div className="lg:w-80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Pokrok</span>
                  <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
              </div>
            </div>
          </Card>
        </div>

        {/* Video and Template Section */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* YouTube Video */}
          <Card className="card-apple">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-red-600" />
                Instruktážní video
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                <iframe
                  src={businessType.videoUrl}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                  title={`${businessType.name} - Instruktážní video`}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Kompletní návod jak vytvořit {businessType.name.toLowerCase()} krok za krokem.
              </p>
            </CardContent>
          </Card>

          {/* Template Download */}
          <Card className="card-apple">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                WordPress šablona
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-6 mb-4">
                <h4 className="font-semibold mb-2">Připravená šablona pro {businessType.name}</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Stáhněte si hotovou WordPress šablonu optimalizovanou pro váš typ podnikání. 
                  Použijte All in One Migration plugin pro rychlý import.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    onClick={handleTemplateDownload}
                    className={`btn-apple flex-1 ${
                      !hasTemplateAccess && !promoCodeAccess ? 'relative' : ''
                    }`}
                  >
                    {!hasTemplateAccess && !promoCodeAccess ? (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Odemknout šablonu
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Stáhnout šablonu
                      </>
                    )}
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Návod na import
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                <strong>Tip:</strong> Šablona obsahuje všechny potřebné pluginy a základní konfiguraci.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Roadmap Checklist */}
        <Card className="card-apple">
          <CardHeader>
            <CardTitle>Roadmapa - Gamifikované kroky</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-2 w-12"></th>
                    <th className="text-left py-3 px-4 font-semibold">Co</th>
                    <th className="text-left py-3 px-4 font-semibold">Kde</th>
                    <th className="text-left py-3 px-4 font-semibold">Poznámka</th>
                    <th className="text-right py-3 px-4 font-semibold">Cena</th>
                  </tr>
                </thead>
                <tbody>
                  {steps.map((step, index) => (
                    <tr 
                      key={step.id} 
                      className={`border-b border-border/30 transition-colors ${
                        step.completed ? 'bg-emerald-500/5' : 'hover:bg-muted/50'
                      }`}
                    >
                      <td className="py-4 px-2">
                        <Checkbox
                          checked={step.completed}
                          onCheckedChange={() => handleStepToggle(step.id)}
                          className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md">
                            {index + 1}
                          </span>
                          <span className={step.completed ? 'line-through text-muted-foreground' : ''}>
                            {step.task}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className="text-xs">
                          {step.platform}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        {step.note}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className={`font-medium ${step.completed ? 'text-emerald-600' : ''}`}>
                          {step.price > 0 ? `${step.price.toLocaleString()} Kč` : 'Zdarma'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Summary */}
            <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h4 className="font-semibold">Souhrn pokroku</h4>
                  <p className="text-sm text-muted-foreground">
                    Dokončeno {completedSteps} z {totalSteps} kroků
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {totalCost.toLocaleString()} Kč
                  </div>
                  <div className="text-sm text-muted-foreground">Celkové náklady</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Template Payment Modal */}
      <TemplatePaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        templateName={businessType?.name || 'WordPress šablonu'}
      />
    </div>
  );
};