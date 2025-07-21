
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { startFreeTrial } from "@/lib/promoCodes";
import { 
  X, 
  Check, 
  Star,
  FileText,
  Download,
  Users,
  Shield,
  Gift,
  Crown,
  MessageCircle,
  BarChart3,
  Target,
  TrendingUp,
  Rocket,
  Zap
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

export const PricingModal = ({ onClose, onSuccess, completedPhases, totalPhases }: PricingModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const { toast } = useToast();

  const advancedPhasesFeatures = [
    "Fáze 5: Benchmarking & Testování",
    "9 marketingových kanálů s detailními analýzami", 
    "Srovnávače zboží a marketplace strategie",
    "PPC kampaně a SEO optimalizace",
    "Sociální sítě a influencer marketing",
    "Fáze 6: Launch & Uvedení na trh",
    "Kompletní launch strategie a timing",
    "PR nástroje a media kontakty", 
    "Metriky úspěšnosti a KPI tracking",
    "Fáze 7: Expansion & Škálování",
    "Analýzy růstu a expansion možnosti",
    "Mezinárodní expanze a nové trhy",
    "Investiční příležitosti a funding",
    "Všechny exporty (PDF, Excel, Word)",
    "Přístup navždy bez měsíčních poplatků"
  ];

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
            Máte nyní přístup k pokročilým fázím VISIBLE7
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
            <h2 className="text-2xl font-semibold text-foreground">
              Odemkněte pokročilé fáze
            </h2>
            <p className="text-muted-foreground mt-1">
              Získejte přístup k fázím 5-7 s pokročilými nástroji
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
          {/* Advanced Phases Overview */}
          <div className="mb-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-foreground mb-2">Pokročilé fáze VISIBLE7</h3>
              <p className="text-muted-foreground">Kompletní přístup k fázím 5, 6 a 7 · Jednorázová platba</p>
            </div>

            <Card className="card-apple p-8 max-w-3xl mx-auto relative">
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                <Star className="w-3 h-3 mr-1" />
                Nejpopulárnější
              </Badge>

              <div className="text-center mb-8">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Crown className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="text-2xl font-bold text-foreground">POKROČILÉ FÁZE</h4>
                </div>
                
                <div className="mb-4">
                  <span className="text-4xl font-bold text-primary">990 Kč</span>
                  <div className="text-sm text-muted-foreground mt-1">Jednorázová platba · Přístup navždy</div>
                </div>
                
                <p className="text-muted-foreground">
                  Odemkněte pokročilé nástroje pro marketing, launch a škálování vašeho podnikání
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="p-3 bg-blue-50 rounded-xl w-fit mx-auto mb-3">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <h5 className="font-semibold text-foreground mb-2">Fáze 5: Benchmarking</h5>
                  <p className="text-sm text-muted-foreground">9 marketingových kanálů a konkurenční analýza</p>
                </div>
                <div className="text-center">
                  <div className="p-3 bg-green-50 rounded-xl w-fit mx-auto mb-3">
                    <Rocket className="w-6 h-6 text-green-600" />
                  </div>
                  <h5 className="font-semibold text-foreground mb-2">Fáze 6: Launch</h5>
                  <p className="text-sm text-muted-foreground">Strategie uvedení na trh a PR nástroje</p>
                </div>
                <div className="text-center">
                  <div className="p-3 bg-purple-50 rounded-xl w-fit mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <h5 className="font-semibold text-foreground mb-2">Fáze 7: Expansion</h5>
                  <p className="text-sm text-muted-foreground">Škálování a mezinárodní expanze</p>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {advancedPhasesFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start text-sm">
                    <Check className="w-4 h-4 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full h-14 text-lg mb-6"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin w-5 h-5 mr-3 border-2 border-white/30 border-t-white rounded-full" />
                    Zpracováváme platbu...
                  </>
                ) : (
                  <>
                    <Crown className="mr-3 w-5 h-5" />
                    Odemknout za 990 Kč
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

              <div className="text-center mt-6">
                <p className="text-xs text-muted-foreground">
                  <Shield className="w-3 h-3 inline mr-1" />
                  Bezpečná platba • SSL šifrování • 30 dní záruka vrácení peněz
                </p>
              </div>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
};
