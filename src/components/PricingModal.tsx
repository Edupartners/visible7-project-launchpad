import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSubscription } from "@/hooks/useSubscription";
import {
  X,
  Check,
  Crown,
  Gift,
  Shield,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PricingModalProps {
  onClose: () => void;
  onSuccess: () => void;
  completedPhases: number;
  totalPhases: number;
}

const features = [
  "Neomezený přístup ke všem 7 fázím VISIBLE7",
  "Jeden aktivní projekt s uloženým postupem (Vize, Ideace, Strategie...)",
  "AI validace a doporučení v každé fázi",
  "Export do PDF a Excel",
];

export const PricingModal = ({ onClose, onSuccess }: PricingModalProps) => {
  const [promoCode, setPromoCode] = useState("");
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { redeemPromoCode } = useSubscription();
  const { toast } = useToast();

  // Skutečné placení (Stripe) doplníme později - zatím jen vizuální stav.
  const handlePayment = () => {
    toast({
      title: "Platby zatím nejsou aktivní",
      description: "Brzy doplníme možnost platby kartou. Pokud máte promo kód od kurzu, použijte ho níže.",
    });
  };

  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    setIsValidatingPromo(true);
    const result = await redeemPromoCode(promoCode.trim());
    setIsValidatingPromo(false);

    if (result.success) {
      toast({ title: "Promo kód uplatněn!", description: result.message });
      setShowSuccess(true);
      setTimeout(() => onSuccess(), 1200);
    } else {
      toast({
        title: "Neplatný promo kód",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <Card className="card-apple p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 mx-auto mb-4 flex items-center justify-center">
            <Check className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Přístup aktivován!</h3>
          <p className="text-muted-foreground mb-4">Můžete pokračovat v práci na svém projektu.</p>
          <div className="animate-pulse text-primary text-sm">Přesměrováváme vás...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="card-apple max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Aktivujte přístup</h2>
            <p className="text-muted-foreground mt-1">Pokračujte ve svém VISIBLE7 projektu</p>
          </div>
          <Button onClick={onClose} variant="ghost" size="sm">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6">
          <Card className="card-apple p-8">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Crown className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div className="mb-2">
                <span className="text-4xl font-bold text-primary">290 Kč</span>
                <span className="text-muted-foreground"> / měsíc</span>
              </div>
              <p className="text-muted-foreground text-sm">Zrušitelné kdykoliv</p>
            </div>

            <div className="space-y-3 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start text-sm">
                  <Check className="w-4 h-4 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <Button onClick={handlePayment} className="w-full h-14 text-lg mb-6">
              <Crown className="mr-3 w-5 h-5" />
              Aktivovat za 290 Kč/měsíc
            </Button>

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
                <span className="text-sm font-medium text-green-800">Jste studentem kurzu?</span>
              </div>
              <form onSubmit={handlePromoSubmit} className="space-y-3">
                <Input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Zadejte promo kód"
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
                      Uplatnit promo kód
                    </>
                  )}
                </Button>
              </form>
            </Card>

            <div className="text-center mt-6">
              <p className="text-xs text-muted-foreground">
                <Shield className="w-3 h-3 inline mr-1" />
                Vaše data jsou bezpečně uložena a vázaná jen na váš účet
              </p>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
};
