
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, Gift, Zap, Eye, Lightbulb, Target, Hammer, BarChart3, TrendingUp, CheckCircle } from "lucide-react";
import { startFreeTrial } from "@/lib/promoCodes";

interface LauncherPageProps {
  onAccessGranted: () => void;
}

const METHODOLOGY_STEPS = [
  { id: 1, title: "Vize", icon: Eye, description: "Definování vize a cílů" },
  { id: 2, title: "Ideace", icon: Lightbulb, description: "Generování a hodnocení nápadů" },
  { id: 3, title: "Strategie", icon: Target, description: "Vytvoření obchodní strategie" },
  { id: 4, title: "Implementace", icon: Hammer, description: "Realizace a spuštění" },
  { id: 5, title: "Benchmarking", icon: BarChart3, description: "Měření a analýza výkonu" },
  { id: 6, title: "Launch", icon: Rocket, description: "Oficiální uvedení na trh" },
  { id: 7, title: "Expanze", icon: TrendingUp, description: "Růst a škálování" },
];

export const LauncherPage = ({ onAccessGranted }: LauncherPageProps) => {
  const handleSelectPlan = (planType: 'basic' | 'business') => {
    startFreeTrial();
    console.log(`Selected plan: ${planType}`);
    onAccessGranted();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 mb-16">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
              <Rocket className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            VISIBLE7 MICEK
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Revoluce v business plánování - Metodika 7 kroků k úspěšnému online podnikání
          </p>
        </div>

        {/* 7 Steps Methodology */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">7 kroků k úspěšnému podnikání</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {METHODOLOGY_STEPS.map((step, index) => (
              <Card key={step.id} className="relative hover:shadow-lg transition-shadow">
                <CardHeader className="text-center pb-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="outline" className="absolute -top-2 -right-2 w-8 h-8 rounded-full p-0 flex items-center justify-center bg-primary text-primary-foreground">
                    {step.id}
                  </Badge>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground text-center">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Vyberte si svůj plán</h2>
          <p className="text-center text-muted-foreground mb-12">Začněte s 15denním zkušebním obdobím zdarma</p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Basic Plan */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent relative">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700 hover:bg-green-100">
                    <Gift className="h-3 w-3" />
                    15 dní zdarma
                  </Badge>
                </div>
                <CardTitle className="text-2xl">Základní plán</CardTitle>
                <div className="text-3xl font-bold text-primary">299 Kč<span className="text-base font-normal text-muted-foreground">/měsíc</span></div>
                <CardDescription>Ideální pro začátečníky a malé projekty</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Přístup ke všem 7 fázím metodiky</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">1 aktivní projekt</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Základní AI analýzy</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Export do PDF</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => handleSelectPlan('basic')}
                  className="w-full h-12 text-lg"
                >
                  <Gift className="mr-2 h-5 w-5" />
                  Začít základní plán
                </Button>
              </CardContent>
            </Card>

            {/* Business Plan */}
            <Card className="border-2 border-primary bg-gradient-to-br from-primary/10 to-primary/5 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4">
                  Nejoblíbenější
                </Badge>
              </div>
              <CardHeader className="text-center pt-8">
                <div className="flex justify-center mb-2">
                  <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700 hover:bg-green-100">
                    <Gift className="h-3 w-3" />
                    15 dní zdarma
                  </Badge>
                </div>
                <CardTitle className="text-2xl">Business plán</CardTitle>
                <div className="text-3xl font-bold text-primary">990 Kč<span className="text-base font-normal text-muted-foreground">/měsíc</span></div>
                <CardDescription>Pro firmy a pokročilé podnikatele</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Vše ze základního plánu</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Neomezený počet projektů</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Pokročilé AI analýzy a doporučení</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Přístup k expertním zdrojům</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Prioritní podpora</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => handleSelectPlan('business')}
                  className="w-full h-12 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Začít business plán
                </Button>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Bez kreditní karty • Zrušte kdykoliv • Bezpečné platby
          </p>
        </div>

        {/* Contact */}
        <div className="text-center text-sm text-muted-foreground mt-16">
          <p>Máte otázky? Jsme tu pro vás!</p>
          <p>Kontaktujte nás pro více informací.</p>
        </div>
      </div>
    </div>
  );
};
