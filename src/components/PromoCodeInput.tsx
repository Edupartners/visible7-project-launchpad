import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Check, Gift, AlertCircle } from "lucide-react";
import { validatePromoCode, savePromoCodeAccess } from "@/lib/promoCodes";
import { useToast } from "@/hooks/use-toast";

interface PromoCodeInputProps {
  onSuccess: () => void;
}

export const PromoCodeInput = ({ onSuccess }: PromoCodeInputProps) => {
  const [promoCode, setPromoCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    setIsValidating(true);

    // Simulate validation delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const isValid = validatePromoCode(promoCode.trim());

    if (isValid) {
      savePromoCodeAccess(promoCode.trim());
      toast({
        title: "Promokód úspěšně aktivován!",
        description: "Máte nyní přístup ke všem fázím VISIBLE7 zdarma.",
      });
      onSuccess();
    } else {
      toast({
        title: "Neplatný promokód",
        description: "Zkontrolujte prosím správnost zadaného kódu.",
        variant: "destructive",
      });
    }

    setIsValidating(false);
  };

  return (
    <Card className="card-apple p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Gift className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Máte promokód?</h3>
          <p className="text-sm text-muted-foreground">
            Získejte přístup zdarma po absolvování kurzu
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="Zadejte promokód"
            className="h-10 rounded-lg border-border/50 focus:border-primary"
            disabled={isValidating}
          />
          <Button
            type="submit"
            disabled={!promoCode.trim() || isValidating}
            className="h-10 px-4 bg-primary hover:bg-primary/90"
          >
            {isValidating ? (
              <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
            ) : (
              <Check className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>

      <div className="mt-4 p-3 bg-muted/30 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-xs text-muted-foreground">
            <strong>Jak získat promokód:</strong><br />
            • Absolvujte náš online kurz<br />
            • Zúčastněte se prezenčního workshopu<br />
            • Sledujte naše sociální sítě pro speciální akce
          </div>
        </div>
      </div>
    </Card>
  );
};