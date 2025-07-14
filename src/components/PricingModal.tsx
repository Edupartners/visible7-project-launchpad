import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { startFreeTrial } from "@/lib/promoCodes";
import { 
  X, 
  Check, 
  Star,
  Zap,
  FileText,
  Download,
  Users,
  Clock,
  Shield,
  Gift,
  Crown,
  MessageCircle,
  Calendar,
  Video,
  ChevronRight,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { validatePromoCode, savePromoCodeAccess } from "@/lib/promoCodes";
import { useToast } from "@/hooks/use-toast";

interface PricingModalProps {
  onClose: () => void;
  onSuccess: () => void;
  completedPhases: number;
  totalPhases: number;
  preselectedPlan?: string;
}

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  subtitle: string;
  description: string;
  features: string[];
  recommended?: boolean;
  comingSoon?: boolean;
  type: 'one-time' | 'monthly';
}

interface ConsultationOption {
  id: string;
  name: string;
  price: number;
  subtitle: string;
  description: string;
  type: 'consultation';
  features: string[];
}

export const PricingModal = ({ onClose, onSuccess, completedPhases, totalPhases, preselectedPlan }: PricingModalProps) => {
  const [selectedPlan, setSelectedPlan] = useState<string>(preselectedPlan || 'business');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const plans: PricingPlan[] = [
    {
      id: 'starter',
      name: 'STARTER',
      price: 299,
      subtitle: '1 projekt · MVP cena',
      description: 'Testujte svůj nápad',
      type: 'monthly',
      features: [
        '1 projekt současně',
        'Všech 7 fází metodiky VISIBLE7',
        'AI analýzy a doporučení',
        'Lean Canvas + Business Model',
        'ROI kalkulačka',
        'PDF export výsledků',
        '30 dní záruka',
        'Později 499 Kč/měsíc'
      ]
    },
    {
      id: 'business',
      name: 'BUSINESS',
      price: 990,
      subtitle: '5 projektů · Pouze 100 Kč/projekt',
      description: 'Nejpopulárnější volba',
      type: 'monthly',
      recommended: true,
      features: [
        '5 projektů současně',
        'Všech 7 fází metodiky VISIBLE7',
        'Pokročilé AI analýzy',
        '12 typů byznysů + WordPress šablony',
        'Marketing a PPC strategie',
        'MVP a KPI definice',
        'Nástroje pro škálování',
        'Přístup ke komunitě Discord',
        'PDF + Word exporty',
        '30 dní záruka'
      ]
    }
  ];

  // Consultation services removed for MVP simplicity

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  const handleStartTrial = () => {
    startFreeTrial();
    onSuccess();
  };

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

  const toggleCardExpansion = (planId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(planId)) {
      newExpanded.delete(planId);
    } else {
      newExpanded.add(planId);
    }
    setExpandedCards(newExpanded);
  };

  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    setIsValidatingPromo(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const isValid = validatePromoCode(promoCode.trim());

    if (isValid) {
      savePromoCodeAccess(promoCode.trim());
      toast({
        title: "Promokód úspěšně aktivován!",
        description: "Získáváte přístup ke všem fázím zdarma.",
      });
      setShowSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } else {
      toast({
        title: "Neplatný promokód",
        description: "Zkontrolujte prosím správnost zadaného kódu.",
        variant: "destructive",
      });
    }

    setIsValidatingPromo(false);
  };

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
            Máte nyní přístup k VISIBLE7
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
      <Card className="card-apple max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              Vyberte váš plán
            </h2>
            <p className="text-muted-foreground mt-1">
              Začněte svou podnikatelskou cestu s VISIBLE7
            </p>
          </div>
          <Button onClick={onClose} variant="ghost" size="sm">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Trial Banner */}
        <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Gift className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800">Vyzkoušejte zdarma 15 dní!</h3>
                <p className="text-sm text-green-600">Získejte přístup ke všem funkcím bez omezení</p>
              </div>
            </div>
            <Button 
              onClick={handleStartTrial}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Gift className="w-4 h-4 mr-2" />
              Začít trial
            </Button>
          </div>
        </div>

        <div className="p-6">
          {/* MVP Pricing - Simplified */}
          <div className="mb-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-foreground mb-2">Jednoduché ceny pro začátek</h3>
              <p className="text-muted-foreground">Vyberte si podle počtu projektů · Pouze 100 Kč za projekt</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {plans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`card-apple p-6 cursor-pointer transition-all relative ${
                    selectedPlan === plan.id ? 'ring-2 ring-primary border-primary' : ''
                   }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.recommended && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                      <Star className="w-3 h-3 mr-1" />
                      Doporučeno
                    </Badge>
                  )}

                  <div className="text-center mb-6">
                    <h4 className="font-bold text-foreground text-lg">{plan.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{plan.subtitle}</p>
                    
                    <div className="mb-2">
                      <span className="text-3xl font-bold text-primary">{plan.price} Kč</span>
                      <span className="text-sm text-muted-foreground">/měsíc</span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start text-sm">
                        <Check className="w-4 h-4 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    className={`w-full mt-6 ${selectedPlan === plan.id ? 'bg-primary' : ''}`}
                    variant={selectedPlan === plan.id ? 'default' : 'outline'}
                  >
                    {selectedPlan === plan.id ? 'Vybráno' : 'Vybrat plán'}
                  </Button>
                </Card>
              ))}
            </div>
          </div>

          {/* Checkout sekce */}
          {selectedPlanData && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Souhrn objednávky */}
              <Card className="card-apple p-6">
                <h4 className="font-semibold text-foreground mb-4">Souhrn objednávky</h4>
                
                <div className="flex items-center justify-between py-3 border-b border-border/50">
                  <div>
                    <p className="font-medium text-foreground">{selectedPlanData.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedPlanData.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{selectedPlanData.price.toLocaleString()} Kč</p>
                    {selectedPlanData.type === 'monthly' && (
                      <p className="text-xs text-muted-foreground">/měsíc</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {selectedPlanData.features.map((feature, index) => (
                    <div key={index} className="flex items-start text-sm">
                      <Check className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/50">
                  <span className="font-semibold text-foreground">Celkem</span>
                  <span className="text-xl font-bold text-primary">
                    {selectedPlanData.price.toLocaleString()} Kč
                  </span>
                </div>
              </Card>

              {/* Platba */}
              <Card className="card-apple p-6">
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full h-12 text-base mb-6"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full" />
                      Zpracováváme...
                    </>
                  ) : (
                    <>
                      <Crown className="mr-2 w-4 h-4" />
                      {selectedPlanData.type === 'monthly' ? 'Začít předplatné' : 'Odemknout přístup'}
                    </>
                  )}
                </Button>

                {/* Promo kód sekce */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-background px-4 text-muted-foreground">nebo</span>
                  </div>
                </div>

                <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Gift className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Máte promokód?
                    </span>
                  </div>
                  
                  <form onSubmit={handlePromoSubmit} className="space-y-3">
                    <Input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="Zadejte promokód"
                      className="h-10 border-green-300 focus:border-green-500"
                      disabled={isValidatingPromo}
                    />
                    <Button
                      type="submit"
                      disabled={!promoCode.trim() || isValidatingPromo}
                      className="w-full h-10 bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isValidatingPromo ? (
                        <>
                          <div className="animate-spin w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full" />
                          Ověřuji...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 w-4 h-4" />
                          Uplatnit promokód
                        </>
                      )}
                    </Button>
                  </form>
                  
                  <p className="text-xs text-green-700 mt-2">
                    Získejte přístup zdarma s našim promokódem
                  </p>
                </Card>

                <p className="text-xs text-muted-foreground mt-4 text-center">
                  <Shield className="w-3 h-3 inline mr-1" />
                  Bezpečná platba • SSL šifrování • 30 dní záruka
                </p>
              </Card>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};