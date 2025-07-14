import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, Gift, Zap } from "lucide-react";
import { startFreeTrial } from "@/lib/promoCodes";

interface LauncherPageProps {
  onAccessGranted: () => void;
}

export const LauncherPage = ({ onAccessGranted }: LauncherPageProps) => {
  const handleStartTrial = () => {
    startFreeTrial();
    onAccessGranted();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Brand */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <Rocket className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            VISIBLE7
          </h1>
          <p className="text-muted-foreground text-lg">
            Revoluce v business plánování
          </p>
        </div>

        {/* Free Trial Card */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700 hover:bg-green-100">
                <Gift className="h-3 w-3" />
                15 dní zdarma
              </Badge>
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Začněte hned teď!
            </CardTitle>
            <CardDescription className="text-base">
              Vyzkoušejte VISIBLE7 zcela zdarma po dobu 15 dní. Bez závazků, bez kreditní karty.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Zap className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-800">Co získáte zdarma:</h4>
                </div>
              </div>
              <ul className="space-y-1 text-sm text-green-700">
                <li>✓ Přístup ke všem 7 fázím metodiky</li>
                <li>✓ 1 projekt v plné verzi</li>
                <li>✓ AI analýzy a doporučení</li>
                <li>✓ Export do PDF</li>
              </ul>
            </div>
            
            <Button 
              onClick={handleStartTrial}
              className="w-full h-12 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Gift className="mr-2 h-5 w-5" />
              Začít 15denní trial zdarma
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Bez kreditní karty • Zrušte kdykoliv • Okamžitý přístup
            </p>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Co vás čeká?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>📋 Interaktivní business plán krok za krokem</li>
              <li>🎯 AI-powered doporučení a analýzy</li>
              <li>📊 Automatické generování prezentací</li>
              <li>💡 Přístup k expertním zdrojům</li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Máte otázky? Jsme tu pro vás!</p>
          <p>Kontaktujte nás pro více informací.</p>
        </div>
      </div>
    </div>
  );
};