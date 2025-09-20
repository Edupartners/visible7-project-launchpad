import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, Eye, Lightbulb, Target, Hammer, BarChart3, TrendingUp, CheckCircle, Users, Lightbulb as BulbIcon, Building } from "lucide-react";

interface LauncherPageProps {
  onAccessGranted: () => void;
}

const METHODOLOGY_STEPS = [{
  id: 1,
  title: "Vize",
  icon: Eye,
  description: "Definování vize a cílů"
}, {
  id: 2,
  title: "Ideace",
  icon: Lightbulb,
  description: "Generování a hodnocení nápadů"
}, {
  id: 3,
  title: "Strategie",
  icon: Target,
  description: "Vytvoření obchodní strategie"
}, {
  id: 4,
  title: "Implementace",
  icon: Hammer,
  description: "Realizace a spuštění"
}, {
  id: 5,
  title: "Benchmarking",
  icon: BarChart3,
  description: "Měření a analýza výkonu"
}, {
  id: 6,
  title: "Launch",
  icon: Rocket,
  description: "Oficiální uvedení na trh"
}, {
  id: 7,
  title: "Expanze",
  icon: TrendingUp,
  description: "Růst a škálování"
}];

export const LauncherPage = ({
  onAccessGranted
}: LauncherPageProps) => {
  const handleStartFree = () => {
    console.log('Redirecting to authentication');
    window.location.href = '/auth';
  };

  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 mb-16">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">V7</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            VISIBLE7 MICEK™
          </h1>
          <p className="max-w-2xl mx-auto text-slate-950 font-medium text-4xl">VYMYSLI - VYTVOŘ - VYDĚLÁVEJ</p>
        </div>

        {/* What is V7 Methodology */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center mb-8">Co je metodika VISIBLE7?</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BulbIcon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Máte nápad?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Nevíte, jak ho přeměnit v úspěšný byznys? Naše metodika vám poskytne jasný postup.</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Začínáte podnikat?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Strukturovaný přístup vám ušetří čas, peníze a pomůže vyhnout se častým chybám.</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Už podnikáte?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Optimalizujte své procesy, najděte nové příležitosti a systematicky růstěte.</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center space-y-4">
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              <strong>VISIBLE7</strong> je ověřená metodika, která vás provede celým procesem od nápadu až po úspěšné podnikání. 
              Každý krok má svůj účel a navazuje na předchozí - nic není náhodné.
            </p>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Tisíce podnikatelů již využilo naši metodiku k vytvoření udržitelného a ziskového byznysu. 
              Nyní je řada na vás.
            </p>
          </div>
        </div>

        {/* 7 Steps Methodology */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">7 kroků k úspěšnému podnikání</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {METHODOLOGY_STEPS.map((step, index) => <Card key={step.id} className="relative hover:shadow-lg transition-shadow">
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
              </Card>)}
          </div>
        </div>

        {/* Value Proposition */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Jak to funguje</h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="text-center border-2 border-green-200 bg-green-50">
              <CardHeader>
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg text-green-800">Fáze 1-3 ZDARMA</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-700">Vize • Ideace • Strategie</p>
                <p className="text-xs text-green-600 mt-2">Kompletní analýza vašeho byznysu bez poplatků</p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Hammer className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg text-blue-800">Fáze 4 - Šablony</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-700">Implementace</p>
                <p className="text-xs text-blue-600 mt-2">Šablony pro 12 různých typů online podnikání za 490 Kč</p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-purple-200 bg-purple-50">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Rocket className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg text-purple-800">Fáze 5-7 Premium</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-purple-700">Benchmarking • Launch • Expanze</p>
                <p className="text-xs text-purple-600 mt-2">Kompletní přístup za 990 Kč</p>
              </CardContent>
            </Card>
          </div>

          {/* Main CTA */}
          <div className="text-center">
            <Button onClick={handleStartFree} className="h-14 px-12 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
              <CheckCircle className="mr-2 h-6 w-6" />
              Začít zdarma
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Žádné poplatky za registraci • Okamžitý přístup • Plaťte jen za to, co potřebujete
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Máte otázky? Jsme tu pro vás!</p>
          <p>Kontaktujte nás pro více informací.</p>
        </div>
      </div>
    </div>;
};
