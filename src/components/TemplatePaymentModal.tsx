import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Download, Crown, X, Zap } from "lucide-react";

interface TemplatePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  templateName: string;
}

export const TemplatePaymentModal = ({ isOpen, onClose, onSuccess, templateName }: TemplatePaymentModalProps) => {
  const [selectedPlan, setSelectedPlan] = useState<'templates' | 'full'>('templates');

  const handlePayment = () => {
    // Simulate payment success
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold">
            Odemkněte {templateName}
          </DialogTitle>
          <DialogDescription className="text-lg">
            Vyberte si plán pro přístup k šablonám a pokročilým funkcím
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 py-6">
          {/* Templates Plan */}
          <Card 
            className={`p-6 cursor-pointer transition-all ${
              selectedPlan === 'templates' ? 'ring-2 ring-primary border-primary' : 'border-border'
            }`}
            onClick={() => setSelectedPlan('templates')}
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-blue-600" />
              </div>
              
              <h3 className="text-xl font-semibold mb-2">ŠABLONY</h3>
              <div className="text-3xl font-bold text-primary mb-1">490 Kč</div>
              <p className="text-sm text-muted-foreground mb-6">Jednorázová platba</p>
              
              <div className="space-y-3 mb-6 text-left">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm">Přístup ke všem šablonám</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm">WordPress šablony</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm">Business roadmapy</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm">Implementační návody</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm">Základní support</span>
                </div>
              </div>

              {selectedPlan === 'templates' && (
                <Badge className="mb-4">Vybrané</Badge>
              )}
            </div>
          </Card>

          {/* Full Access Plan */}
          <Card 
            className={`p-6 cursor-pointer transition-all relative ${
              selectedPlan === 'full' ? 'ring-2 ring-primary border-primary' : 'border-border'
            }`}
            onClick={() => setSelectedPlan('full')}
          >
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">
                <Crown className="w-3 h-3 mr-1" />
                Nejlepší hodnota
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-primary" />
              </div>
              
              <h3 className="text-xl font-semibold mb-2">PLNÝ PŘÍSTUP</h3>
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-lg line-through text-muted-foreground">1480 Kč</span>
                <div className="text-3xl font-bold text-primary">990 Kč</div>
              </div>
              <p className="text-sm text-muted-foreground mb-6">Jednorázová platba</p>
              
              <div className="space-y-3 mb-6 text-left">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm font-medium">Vše z plánu ŠABLONY</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm">Fáze 5-7: Pokročilé nástroje</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm">AI analýzy a doporučení</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm">Export dat</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm">Premium support</span>
                </div>
                <div className="flex items-center">
                  <Zap className="w-4 h-4 text-yellow-500 mr-3 flex-shrink-0" />
                  <span className="text-sm font-medium text-primary">Úspora 490 Kč</span>
                </div>
              </div>

              {selectedPlan === 'full' && (
                <Badge className="mb-4">Vybrané</Badge>
              )}
            </div>
          </Card>
        </div>

        <div className="flex items-center justify-between pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Zrušit
          </Button>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {selectedPlan === 'templates' ? '490' : '990'} Kč
              </div>
              <div className="text-xs text-muted-foreground">
                {selectedPlan === 'full' && 'Úspora 490 Kč'}
              </div>
            </div>
            <Button onClick={handlePayment} className="btn-apple px-8">
              {selectedPlan === 'templates' ? (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Koupit šablony
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4 mr-2" />
                  Koupit plný přístup
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground pt-4">
          Bezpečná platba • 30 dní záruka vrácení peněz • Žádné skryté poplatky
        </div>
      </DialogContent>
    </Dialog>
  );
};