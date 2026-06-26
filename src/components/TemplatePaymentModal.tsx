
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Crown, X, Zap, FileText, Shield, Check, Gift } from "lucide-react";
import { useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";

interface TemplatePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  templateName: string;
}

const benefits = [
  { icon: Zap, title: "Všech 7 fází metodiky", description: "Od vize po škálování" },
  { icon: FileText, title: "Všechny šablony a roadmapy", description: "Kompletní knihovna pro všechny typy podnikání" },
  { icon: Crown, title: "AI analýzy a doporučení", description: "Personalizovaná zpětná vazba v každé fázi" },
];

export const TemplatePaymentModal = ({ isOpen, onClose, onSuccess }: TemplatePaymentModalProps) => {
  const [promoCode, setPromoCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const { redeemPromoCode } = useSubscription();
  const { toast } = useToast();

  const handlePayment = () => {
    toast({
      title: "Platby zatím nejsou aktivní",
      description: "Brzy doplníme možnost platby kartou. Pokud máte promo kód od kurzu, použijte ho níže.",
    });
  };

  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    setIsValidating(true);
    const result = await redeemPromoCode(promoCode.trim());
    setIsValidating(false);

    if (result.success) {
      toast({ title: "Promo kód uplatněn!", description: result.message });
      onSuccess();
      onClose();
    } else {
      toast({ title: "Neplatný promo kód", description: result.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold">Aktivujte přístup k VISIBLE7</DialogTitle>
          <DialogDescription>Pokračujte ve svém projektu s plným přístupem</DialogDescription>
        </DialogHeader>

        <Card className="p-8 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-primary" />
            </div>
            <div className="text-4xl font-bold text-primary mb-1">290 Kč<span className="text-base font-normal text-muted-foreground"> / měsíc</span></div>
            <p className="text-muted-foreground text-sm">Zrušitelné kdykoliv</p>
          </div>

          <div className="space-y-3 mb-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground text-sm">{benefit.title}</div>
                    <div className="text-xs text-muted-foreground">{benefit.description}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <Button onClick={handlePayment} className="btn-apple w-full h-12 mb-6">
            <Crown className="w-4 h-4 mr-2" />
            Aktivovat za 290 Kč/měsíc
          </Button>

          <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <Gift className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Jste studentem kurzu?</span>
            </div>
            <form onSubmit={handlePromoSubmit} className="space-y-3">
              <Input
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Zadejte promo kód"
                className="h-10 border-green-300 focus:border-green-500"
                disabled={isValidating}
              />
              <Button type="submit" disabled={!promoCode.trim() || isValidating} className="w-full h-10 bg-green-600 hover:bg-green-700 text-white">
                {isValidating ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  <><Check className="mr-2 w-4 h-4" />Uplatnit promo kód</>
                )}
              </Button>
            </form>
          </Card>
        </Card>

        <div className="flex items-center justify-between pt-4">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Zrušit
          </Button>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Bezpečné a vázané jen na váš účet
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
