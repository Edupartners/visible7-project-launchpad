import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  X, 
  CreditCard, 
  Check, 
  Star,
  Zap,
  FileText,
  Download,
  Users,
  Clock,
  Shield
} from "lucide-react";

interface PaymentModalProps {
  onClose: () => void;
  onSuccess: () => void;
  completedPhases: number;
  totalPhases: number;
}

export const PaymentModal = ({ onClose, onSuccess, completedPhases, totalPhases }: PaymentModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const progressPercentage = (completedPhases / totalPhases) * 100;
  const daysLeft = 7 - Math.floor(Math.random() * 3); // Simulace časově omezené nabídky

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulace platby (zde by byla integrace se Stripe)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    setShowSuccess(true);
    
    setTimeout(() => {
      onSuccess();
    }, 1500);
  };

  const features = [
    {
      icon: Zap,
      title: "Všech 7 fází metodiky",
      description: "Kompletní průvodce od vize po škálování"
    },
    {
      icon: Star,
      title: "AI analýzy a zpětná vazba",
      description: "Personalizované doporučení pro váš projekt"
    },
    {
      icon: FileText,
      title: "Export do PDF",
      description: "Všechny výsledky a analýzy v přehledném formátu"
    },
    {
      icon: Download,
      title: "WordPress šablony",
      description: "12 typů byznysů + premium šablony"
    },
    {
      icon: Users,
      title: "Přístup ke komunitě",
      description: "Exkluzivní Discord komunita podnikatelů"
    },
    {
      icon: Shield,
      title: "30 dní záruka",
      description: "Vrátíme peníze, pokud nebudete spokojeni"
    }
  ];

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <Card className="card-apple p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 mx-auto mb-4 flex items-center justify-center">
            <Check className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Platba úspěšná!
          </h3>
          <p className="text-muted-foreground mb-4">
            Máte nyní přístup ke všem fázím VISIBLE7
          </p>
          <div className="animate-pulse text-primary text-sm">
            Přesměrováváme vás...
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="card-apple max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Odemkněte VISIBLE7 Pro
            </h2>
            <p className="text-muted-foreground mt-1">
              Získejte přístup ke kompletní metodice
            </p>
          </div>
          <Button onClick={onClose} variant="ghost" size="sm">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 p-6">
          {/* Levá strana - Progress a motivace */}
          <div className="space-y-6">
            {/* Váš pokrok */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Váš pokrok</h3>
              <Card className="card-apple p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground">Dokončeno fází</span>
                  <span className="text-sm font-medium text-primary">
                    {completedPhases}/{totalPhases}
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Zbývá vám ještě {totalPhases - completedPhases} fází k dokončení celé metodiky
                </p>
              </Card>
            </div>

            {/* Časově omezená nabídka */}
            <div>
              <Badge variant="destructive" className="mb-3">
                <Clock className="w-3 h-3 mr-1" />
                Omezená nabídka
              </Badge>
              <Card className="card-apple p-4 border-orange-200 bg-orange-50/50">
                <h4 className="font-medium text-foreground mb-2">
                  ⏰ Zbývá {daysLeft} dní
                </h4>
                <p className="text-sm text-muted-foreground">
                  Speciální cena 990 Kč místo obvyklých 1 490 Kč. 
                  Po uplynutí této doby bude cena navýšena.
                </p>
              </Card>
            </div>

            {/* Co získáte */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Co získáte</h3>
              <div className="space-y-3">
                {features.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground text-sm">
                          {feature.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {feature.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Pravá strana - Cena a platba */}
          <div className="space-y-6">
            {/* Cenová karta */}
            <Card className="card-apple p-6 text-center bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20">
              <div className="mb-4">
                <div className="text-3xl font-bold text-primary">990 Kč</div>
                <div className="text-sm text-muted-foreground line-through">1 490 Kč</div>
                <div className="text-xs text-green-600 font-medium mt-1">
                  Ušetříte 500 Kč
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground mb-6">
                Jednorázová platba • Přístup navždy
              </div>

              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="btn-apple w-full h-12 text-base"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full" />
                    Zpracováváme platbu...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 w-4 h-4" />
                    Odemknout přístup
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground mt-4">
                Bezpečná platba • SSL šifrování • 30 dní záruka vrácení peněz
              </p>
            </Card>

            {/* Testimonial */}
            <Card className="card-apple p-4 bg-muted/20">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-primary">MK</span>
                </div>
                <div>
                  <p className="text-sm text-foreground mb-2">
                    "VISIBLE7 mi pomohla spustit můj online kurz za 6 týdnů. 
                    Struktura je skvělá a AI analýzy opravdu pomáhají."
                  </p>
                  <div className="text-xs text-muted-foreground">
                    — Markéta K., online podnikatelka
                  </div>
                </div>
              </div>
            </Card>

            {/* FAQ */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground text-sm">Často kladené otázky</h4>
              
              <details className="text-sm">
                <summary className="font-medium text-foreground cursor-pointer">
                  Jak dlouho mám přístup?
                </summary>
                <p className="text-muted-foreground mt-1 ml-4">
                  Přístup je trvalý. Jednou zaplatíte a máte přístup navždy.
                </p>
              </details>

              <details className="text-sm">
                <summary className="font-medium text-foreground cursor-pointer">
                  Co když nebudu spokojený?
                </summary>
                <p className="text-muted-foreground mt-1 ml-4">
                  Nabízíme 30 dní záruku vrácení peněz bez udání důvodu.
                </p>
              </details>

              <details className="text-sm">
                <summary className="font-medium text-foreground cursor-pointer">
                  Jsou nějaké skryté poplatky?
                </summary>
                <p className="text-muted-foreground mt-1 ml-4">
                  Ne, 990 Kč je vše co zaplatíte. Žádné měsíční poplatky.
                </p>
              </details>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};