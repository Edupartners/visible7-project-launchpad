
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Download, Crown, X, Zap, FileText, Users, Shield } from "lucide-react";

interface TemplatePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  templateName: string;
}

export const TemplatePaymentModal = ({ isOpen, onClose, onSuccess, templateName }: TemplatePaymentModalProps) => {
  const handlePayment = () => {
    // Simulate payment success
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 1000);
  };

  const benefits = [
    {
      icon: Download,
      title: "Všechny šablony a roadmapy",
      description: "Přístup ke kompletní knihovně šablon pro všechny typy podnikání"
    },
    {
      icon: Crown,
      title: "Odemknutí všech fází (1-7)",
      description: "Kompletní metodika VISIBLE7 od vize po škálování"
    },
    {
      icon: FileText,
      title: "WordPress šablony",
      description: "Připravené šablony pro rychlé spuštění webu"
    },
    {
      icon: Zap,
      title: "AI analýzy a doporučení",
      description: "Personalizované doporučení pro váš projekt"
    },
    {
      icon: Download,
      title: "Export dat",
      description: "Všechny výsledky a analýzy v přehledném formátu"
    },
    {
      icon: Users,
      title: "Premium support",
      description: "Prioritní podpora a pomoc s implementací"
    },
    {
      icon: Shield,
      title: "30 dní záruka",
      description: "Vrátíme peníze, pokud nebudete spokojeni"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold">
            Odemkněte PLNÝ PŘÍSTUP K VISIBLE7
          </DialogTitle>
          <DialogDescription className="text-lg">
            Získejte přístup ke kompletní metodice a všem šablonám
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* Main offer card */}
          <Card className="p-8 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Crown className="w-10 h-10 text-primary" />
              </div>
              
              <h3 className="text-2xl font-bold mb-3">PLNÝ PŘÍSTUP K VISIBLE7</h3>
              <div className="text-4xl font-bold text-primary mb-2">999 Kč</div>
              <p className="text-muted-foreground mb-6">Jednorázová platba • Přístup navždy</p>
              
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                Kompletní balíček pro úspěšné podnikání
              </div>
            </div>

            {/* Benefits grid */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <div key={index} className="flex items-start gap-3 p-4 bg-background/50 rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground mb-1">
                        {benefit.title}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {benefit.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Highlighted features */}
            <div className="bg-background/80 rounded-lg p-4 mb-6">
              <h4 className="font-semibold mb-3 text-center">🎯 Co konkrétně získáte:</h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-medium text-primary">12+ šablon</div>
                  <div className="text-muted-foreground">Pro různé typy podnikání</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-primary">7 fází metodiky</div>
                  <div className="text-muted-foreground">Od vize po škálování</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-primary">AI nástroje</div>
                  <div className="text-muted-foreground">Analýzy a doporučení</div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <Button 
              onClick={handlePayment}
              className="btn-apple w-full h-14 text-lg font-semibold"
            >
              <Crown className="w-5 h-5 mr-2" />
              Koupit plný přístup za 999 Kč
            </Button>
          </Card>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Zrušit
          </Button>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">999 Kč</div>
            <div className="text-xs text-muted-foreground">Jednorázová platba</div>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground pt-4">
          Bezpečná platba • 30 dní záruka vrácení peněz • Žádné skryté poplatky
        </div>
      </DialogContent>
    </Dialog>
  );
};
