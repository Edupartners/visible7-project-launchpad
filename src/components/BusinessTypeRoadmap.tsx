import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { BackButton } from "@/components/ui/back-button";
import { Download, Play, CheckCircle2, ExternalLink, Clock, DollarSign, Lock, Crown, Shield, FileText, Zap, Settings } from "lucide-react";
import { businessTypes, type RoadmapStep } from "@/types/implementation";
import { useSupabaseProgress } from "@/hooks/useSupabaseProgress";
import { TemplatePaymentModal } from "./TemplatePaymentModal";
import { WordPressInstallForm } from "./WordPressInstallForm";

interface BusinessTypeRoadmapProps {
  businessTypeId: string;
  onBack: () => void;
  hasAccess: boolean;
  onPaymentSuccess: () => void;
}

export const BusinessTypeRoadmap = ({ businessTypeId, onBack, hasAccess, onPaymentSuccess }: BusinessTypeRoadmapProps) => {
  const businessType = businessTypes.find(bt => bt.id === businessTypeId);
  const [steps, setSteps] = useSupabaseProgress<RoadmapStep[]>(
    `roadmap-${businessTypeId}`, 
    businessType?.steps || []
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInstallForm, setShowInstallForm] = useState(false);

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
    if (hasAccess) {
      window.open(businessType?.templateUrl || '#', '_blank');
    } else {
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSuccessInternal = () => {
    onPaymentSuccess();
    setShowPaymentModal(false);
    
    // Small delay to ensure state is updated before opening template
    setTimeout(() => {
      window.open(businessType?.templateUrl || '#', '_blank');
    }, 200);
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
              
              {/* Debug badge */}
              <Badge variant="outline" className="text-xs bg-muted">
                Access: {hasAccess.toString()}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Payment Box - Prominently displayed if no access */}
        {!hasAccess && (
          <Card className="card-apple mb-8 border-primary/20 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Crown className="w-8 h-8 text-primary" />
                </div>
                
                <h3 className="text-2xl font-bold mb-3">Odemkněte PLNÝ PŘÍSTUP</h3>
                <div className="text-4xl font-bold text-primary mb-2">999 Kč</div>
                <p className="text-muted-foreground mb-6">Jednorázová platba • Přístup navždy</p>
                
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
                    <FileText className="w-6 h-6 text-primary flex-shrink-0" />
                    <div className="text-left">
                      <div className="font-semibold">WordPress šablona</div>
                      <div className="text-sm text-muted-foreground">Připravená pro {businessType.name}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
                    <Zap className="w-6 h-6 text-primary flex-shrink-0" />
                    <div className="text-left">
                      <div className="font-semibold">Kompletní roadmapa</div>
                      <div className="text-sm text-muted-foreground">Interaktivní kroky</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
                    <Shield className="w-6 h-6 text-primary flex-shrink-0" />
                    <div className="text-left">
                      <div className="font-semibold">Všechny fáze V7</div>
                      <div className="text-sm text-muted-foreground">Kompletní metodika</div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => setShowPaymentModal(true)}
                  className="btn-apple h-14 px-8 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Koupit plný přístup za 999 Kč
                </Button>
                
                <p className="text-xs text-muted-foreground mt-4">
                  Bezpečná platba • 30 dní záruka vrácení peněz • Žádné skryté poplatky
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Box - Show if user has access */}
        {hasAccess && (
          <Card className="card-apple mb-8 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-emerald-800">Přístup aktivován!</h3>
                  <p className="text-emerald-700">Máte plný přístup ke všem šablonám a funkcím VISIBLE7</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                  {hasAccess ? (
                    <Button 
                      onClick={handleTemplateDownload}
                      className="btn-apple flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Stáhnout šablonu zdarma
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleTemplateDownload}
                      className="btn-apple flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Po zakoupení přístupu
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowInstallForm(true)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Automatická instalace
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
            {!hasAccess && (
              <p className="text-sm text-muted-foreground">
                Kroky jsou dostupné po zakoupení plného přístupu
              </p>
            )}
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
                      } ${!hasAccess ? 'opacity-60' : ''}`}
                    >
                      <td className="py-4 px-2">
                        <Checkbox
                          checked={step.completed}
                          onCheckedChange={() => hasAccess && handleStepToggle(step.id)}
                          disabled={!hasAccess}
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
        onSuccess={handlePaymentSuccessInternal}
        templateName={businessType?.name || 'WordPress šablonu'}
      />

      {/* WordPress Install Form */}
      <WordPressInstallForm
        open={showInstallForm}
        onOpenChange={setShowInstallForm}
      />
    </div>
  );
};
