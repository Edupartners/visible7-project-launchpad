import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BackButton } from "@/components/ui/back-button";
import { CheckCircle, AlertTriangle, TrendingUp, Calculator, DollarSign, Clock, BarChart3, Users, Target, Lightbulb } from "lucide-react";
import { ExpansionData, defaultExpansionData } from "@/types/expansion";
import { usePersistedState } from "@/hooks/usePersistedState";

interface ExpansionPhaseProps {
  onComplete: () => void;
  onBack: () => void;
}

export const ExpansionPhase = ({ onComplete, onBack }: ExpansionPhaseProps) => {
  const [data, setData] = usePersistedState<ExpansionData>("expansion-data", defaultExpansionData);
  const [activeSection, setActiveSection] = useState(0);

  const sections = [
    { id: 0, title: "Hodnota práce", icon: Calculator, description: "Výpočet hodinové mzdy a rozhodování o náboru" },
    { id: 1, title: "Pravidlo 30%", icon: Clock, description: "Rozdělení času mezi růst a operativu" },
    { id: 2, title: "Cashflow", icon: DollarSign, description: "Řízení peněžních toků a rezerv" },
    { id: 3, title: "Parametry růstu", icon: BarChart3, description: "Ověření připravenosti na růst" },
    { id: 4, title: "Sebereflexi", icon: Lightbulb, description: "Plánování dalšího rozvoje" },
  ];

  // Calculations
  useEffect(() => {
    // Work value calculations
    const hourlyRate = data.workValue.monthlyProfit > 0 ? data.workValue.monthlyProfit / 166.67 : 0; // ~2000 hours/year ÷ 12 months
    const idealEmployeeRate = hourlyRate / 4;
    const shouldHire = idealEmployeeRate >= data.workValue.marketRate;

    // Growth rule calculations
    const totalHours = data.growthRule.weeklyGrowthHours + data.growthRule.weeklyOperationalHours;
    const growthPercentage = totalHours > 0 ? (data.growthRule.weeklyGrowthHours / totalHours) * 100 : 0;
    const isHealthy = growthPercentage >= 30;

    // Cashflow calculations
    const netCashflow = data.cashflow.monthlyRevenue - data.cashflow.fixedCosts - data.cashflow.variableCosts;
    const recommendedReserve = (data.cashflow.fixedCosts + data.cashflow.variableCosts) * (data.cashflow.reservePercentage / 100);

    // Growth parameters
    const readinessScore = [
      data.growthParameters.stableProfitMonths >= 3,
      data.growthParameters.pnoPercentage <= 20,
      data.growthParameters.hasKPIs,
      data.growthParameters.hasAnalytics
    ].filter(Boolean).length;
    const readyForGrowth = readinessScore >= 3;

    // AI Recommendations
    const recommendations: string[] = [];
    if (shouldHire) {
      recommendations.push(`Čas na nábor! Můžeš si dovolit zaměstnance za ${Math.round(idealEmployeeRate)} Kč/h.`);
    }
    if (!isHealthy) {
      recommendations.push(`Věnuj více času růstu. Aktuálně máš pouze ${Math.round(growthPercentage)}% času na strategii.`);
    }
    if (netCashflow < recommendedReserve) {
      recommendations.push(`Pozor na cashflow! Doporučená rezerva je ${Math.round(recommendedReserve)} Kč měsíčně.`);
    }
    if (!readyForGrowth) {
      recommendations.push(`Před růstem splň alespoň 3 ze 4 kritérií připravenosti.`);
    }

    setData(prev => {
      const updated = { ...prev };
      updated.workValue = { ...prev.workValue, hourlyRate, idealEmployeeRate, shouldHire };
      updated.growthRule = { ...prev.growthRule, growthPercentage, isHealthy, totalWeeklyHours: totalHours };
      updated.cashflow = { ...prev.cashflow, netCashflow, recommendedReserve };
      updated.growthParameters = { ...prev.growthParameters, readinessScore, readyForGrowth };
      updated.aiRecommendations = recommendations;
      return updated;
    });
  }, [data.workValue.monthlyProfit, data.workValue.marketRate, data.growthRule.weeklyGrowthHours, data.growthRule.weeklyOperationalHours, data.cashflow.monthlyRevenue, data.cashflow.fixedCosts, data.cashflow.variableCosts, data.cashflow.reservePercentage, data.growthParameters.stableProfitMonths, data.growthParameters.pnoPercentage, data.growthParameters.hasKPIs, data.growthParameters.hasAnalytics, setData]);

  const updateData = (section: keyof ExpansionData, field: string, value: any) => {
    setData(prev => {
      const updated = { ...prev };
      const sectionData = prev[section] as any;
      updated[section] = { ...sectionData, [field]: value };
      return updated;
    });
  };

  const renderWorkValueSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Výpočet hodnoty vlastní práce
        </CardTitle>
        <CardDescription>
          Rozhodování o delegování a náboru zaměstnanců
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="monthlyProfit">Měsíční zisk (Kč)</Label>
            <Input
              id="monthlyProfit"
              type="number"
              value={data.workValue.monthlyProfit}
              onChange={(e) => updateData('workValue', 'monthlyProfit', Number(e.target.value))}
              placeholder="150000"
            />
          </div>
          <div>
            <Label htmlFor="marketRate">Tržní mzda zaměstnance (Kč/h)</Label>
            <Input
              id="marketRate"
              type="number"
              value={data.workValue.marketRate}
              onChange={(e) => updateData('workValue', 'marketRate', Number(e.target.value))}
              placeholder="150"
            />
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Výpočet:</h4>
          <div className="space-y-2 text-sm">
            <p>Hodinová mzda: <span className="font-mono">{Math.round(data.workValue.hourlyRate)} Kč/h</span></p>
            <p>Ideální mzda zaměstnance: <span className="font-mono">{Math.round(data.workValue.idealEmployeeRate)} Kč/h</span></p>
          </div>
        </div>

        <Alert className={data.workValue.shouldHire ? "border-green-500" : "border-yellow-500"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {data.workValue.shouldHire 
              ? `✅ Doporučujeme nábor! Můžeš si dovolit zaměstnance za ${Math.round(data.workValue.idealEmployeeRate)} Kč/h.`
              : `⚠️ Zatím není ideální čas na nábor. Zaměř se na zvýšení zisku nebo snížení nákladů.`
            }
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );

  const renderGrowthRuleSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pravidlo 30% energie do růstu
        </CardTitle>
        <CardDescription>
          Optimální rozdělení času mezi růst a operativu
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Hodiny týdně věnované růstu a strategii</Label>
            <div className="mt-2">
              <Slider
                value={[data.growthRule.weeklyGrowthHours]}
                onValueChange={(value) => updateData('growthRule', 'weeklyGrowthHours', value[0])}
                max={40}
                step={1}
                className="mb-2"
              />
              <div className="text-sm text-muted-foreground">{data.growthRule.weeklyGrowthHours} hodin</div>
            </div>
          </div>
          <div>
            <Label>Hodiny týdně věnované operativě</Label>
            <div className="mt-2">
              <Slider
                value={[data.growthRule.weeklyOperationalHours]}
                onValueChange={(value) => updateData('growthRule', 'weeklyOperationalHours', value[0])}
                max={60}
                step={1}
                className="mb-2"
              />
              <div className="text-sm text-muted-foreground">{data.growthRule.weeklyOperationalHours} hodin</div>
            </div>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Analýza poměru:</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Růst</span>
              <span className="font-mono">{Math.round(data.growthRule.growthPercentage)}%</span>
            </div>
            <Progress value={data.growthRule.growthPercentage} className="h-2" />
            <div className="text-sm text-muted-foreground">
              Doporučeno: minimálně 30% pro zdravý růst
            </div>
          </div>
        </div>

        <Alert className={data.growthRule.isHealthy ? "border-green-500" : "border-red-500"}>
          <TrendingUp className="h-4 w-4" />
          <AlertDescription>
            {data.growthRule.isHealthy 
              ? `✅ Skvělé! Věnuješ ${Math.round(data.growthRule.growthPercentage)}% času růstu.`
              : `❌ Riziko stagnace. Zvyš čas věnovaný růstu na alespoň 30%.`
            }
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );

  const renderCashflowSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Cashflow management
        </CardTitle>
        <CardDescription>
          Řízení peněžních toků a plánování rezerv
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="monthlyRevenue">Měsíční tržby (Kč)</Label>
            <Input
              id="monthlyRevenue"
              type="number"
              value={data.cashflow.monthlyRevenue}
              onChange={(e) => updateData('cashflow', 'monthlyRevenue', Number(e.target.value))}
              placeholder="300000"
            />
          </div>
          <div>
            <Label htmlFor="fixedCosts">Fixní náklady (Kč/měsíc)</Label>
            <Input
              id="fixedCosts"
              type="number"
              value={data.cashflow.fixedCosts}
              onChange={(e) => updateData('cashflow', 'fixedCosts', Number(e.target.value))}
              placeholder="50000"
            />
          </div>
          <div>
            <Label htmlFor="variableCosts">Variabilní náklady (Kč/měsíc)</Label>
            <Input
              id="variableCosts"
              type="number"
              value={data.cashflow.variableCosts}
              onChange={(e) => updateData('cashflow', 'variableCosts', Number(e.target.value))}
              placeholder="100000"
            />
          </div>
        </div>

        <div>
          <Label>Rezerva na nečekané výdaje: {data.cashflow.reservePercentage}%</Label>
          <Slider
            value={[data.cashflow.reservePercentage]}
            onValueChange={(value) => updateData('cashflow', 'reservePercentage', value[0])}
            min={10}
            max={50}
            step={5}
            className="mt-2"
          />
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Cashflow analýza:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Čistý cashflow:</span>
              <span className={`font-mono ${data.cashflow.netCashflow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.round(data.cashflow.netCashflow)} Kč
              </span>
            </div>
            <div className="flex justify-between">
              <span>Doporučená rezerva:</span>
              <span className="font-mono">{Math.round(data.cashflow.recommendedReserve)} Kč</span>
            </div>
          </div>
        </div>

        <Alert className="border-yellow-500">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Častá chyba:</strong> Nepřekapitalizuj obaly a zásoby! Nech si hotovost na nákup zboží a marketing.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );

  const renderGrowthParametersSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Parametry připravenosti na růst
        </CardTitle>
        <CardDescription>
          Ověření, zda je tvá firma připravena na škálování
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="stableProfitMonths">Počet měsíců stabilního zisku</Label>
            <Input
              id="stableProfitMonths"
              type="number"
              value={data.growthParameters.stableProfitMonths}
              onChange={(e) => updateData('growthParameters', 'stableProfitMonths', Number(e.target.value))}
              placeholder="3"
            />
          </div>
          <div>
            <Label htmlFor="pnoPercentage">PNO v % (nákladovost)</Label>
            <Input
              id="pnoPercentage"
              type="number"
              value={data.growthParameters.pnoPercentage}
              onChange={(e) => updateData('growthParameters', 'pnoPercentage', Number(e.target.value))}
              placeholder="15"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="hasKPIs">Máš nastavené jasné KPI</Label>
            <Switch
              id="hasKPIs"
              checked={data.growthParameters.hasKPIs}
              onCheckedChange={(checked) => updateData('growthParameters', 'hasKPIs', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="hasAnalytics">Sleduješ data přes analytické nástroje</Label>
            <Switch
              id="hasAnalytics"
              checked={data.growthParameters.hasAnalytics}
              onCheckedChange={(checked) => updateData('growthParameters', 'hasAnalytics', checked)}
            />
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Skóre připravenosti:</h4>
          <div className="flex items-center gap-2 mb-2">
            <Progress value={(data.growthParameters.readinessScore / 4) * 100} className="flex-1" />
            <Badge variant={data.growthParameters.readyForGrowth ? "default" : "secondary"}>
              {data.growthParameters.readinessScore}/4
            </Badge>
          </div>
          <div className="text-sm space-y-1">
            <div className="flex items-center gap-2">
              {data.growthParameters.stableProfitMonths >= 3 ? 
                <CheckCircle className="h-4 w-4 text-green-600" /> : 
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              }
              <span>3+ měsíců stabilního zisku</span>
            </div>
            <div className="flex items-center gap-2">
              {data.growthParameters.pnoPercentage <= 20 ? 
                <CheckCircle className="h-4 w-4 text-green-600" /> : 
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              }
              <span>PNO pod 20%</span>
            </div>
            <div className="flex items-center gap-2">
              {data.growthParameters.hasKPIs ? 
                <CheckCircle className="h-4 w-4 text-green-600" /> : 
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              }
              <span>Nastavené KPI</span>
            </div>
            <div className="flex items-center gap-2">
              {data.growthParameters.hasAnalytics ? 
                <CheckCircle className="h-4 w-4 text-green-600" /> : 
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              }
              <span>Analytické nástroje</span>
            </div>
          </div>
        </div>

        <Alert className={data.growthParameters.readyForGrowth ? "border-green-500" : "border-yellow-500"}>
          <Target className="h-4 w-4" />
          <AlertDescription>
            {data.growthParameters.readyForGrowth 
              ? `✅ Gratulujeme! Jsi připraven na růst se skóre ${data.growthParameters.readinessScore}/4.`
              : `⚠️ Před růstem splň alespoň 3 ze 4 kritérií (aktuálně ${data.growthParameters.readinessScore}/4).`
            }
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );

  const renderReflectionSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Sebereflexi a akční plán
        </CardTitle>
        <CardDescription>
          Plánování dalšího rozvoje a strategického růstu
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="growthBarriers">Co ti nejvíce brání v růstu?</Label>
          <Textarea
            id="growthBarriers"
            value={data.reflection.growthBarriers}
            onChange={(e) => updateData('reflection', 'growthBarriers', e.target.value)}
            placeholder="Nedostatek času na strategii, přetížení operativou..."
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="delegationTasks">Jaké činnosti můžeš delegovat?</Label>
          <Textarea
            id="delegationTasks"
            value={data.reflection.delegationTasks}
            onChange={(e) => updateData('reflection', 'delegationTasks', e.target.value)}
            placeholder="Správa objednávek, zákaznický servis, účetnictví..."
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="supportSystem">Kdo ti pomáhá nebo brání v růstu?</Label>
          <Textarea
            id="supportSystem"
            value={data.reflection.supportSystem}
            onChange={(e) => updateData('reflection', 'supportSystem', e.target.value)}
            placeholder="Dodavatelé, partneři, rodina, konkurence..."
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="scalingPlan">Tvůj plán škálování:</Label>
          <Select value={data.reflection.scalingPlan} onValueChange={(value: any) => updateData('reflection', 'scalingPlan', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Vyber strategii škálování" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="people">Především přes lidi (nábor)</SelectItem>
              <SelectItem value="systems">Především přes systémy (automatizace)</SelectItem>
              <SelectItem value="combination">Kombinace lidí a systémů</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {data.aiRecommendations.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              AI doporučení pro tvůj růst:
            </h4>
            <ul className="space-y-2 text-sm">
              {data.aiRecommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const isCurrentSectionComplete = () => {
    switch (activeSection) {
      case 0: return data.workValue.monthlyProfit > 0;
      case 1: return data.growthRule.weeklyGrowthHours > 0 && data.growthRule.weeklyOperationalHours > 0;
      case 2: return data.cashflow.monthlyRevenue > 0;
      case 3: return data.growthParameters.stableProfitMonths > 0;
      case 4: return data.reflection.growthBarriers.length > 0;
      default: return false;
    }
  };

  const isPhaseComplete = () => {
    return data.workValue.monthlyProfit > 0 &&
           data.growthRule.weeklyGrowthHours > 0 &&
           data.cashflow.monthlyRevenue > 0 &&
           data.growthParameters.stableProfitMonths > 0 &&
           data.reflection.growthBarriers.length > 0;
  };

  const handleComplete = () => {
    setData(prev => ({ ...prev, isCompleted: true }));
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">EXPANSION</h1>
          <p className="text-xl text-gray-600">Fáze 7: Růst a škálování firmy</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {sections.map((section) => (
            <Card 
              key={section.id} 
              className={`cursor-pointer transition-all ${activeSection === section.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <CardContent className="p-4 text-center">
                <section.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold text-sm mb-1">{section.title}</h3>
                <p className="text-xs text-muted-foreground">{section.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-8">
          {activeSection === 0 && renderWorkValueSection()}
          {activeSection === 1 && renderGrowthRuleSection()}
          {activeSection === 2 && renderCashflowSection()}
          {activeSection === 3 && renderGrowthParametersSection()}
          {activeSection === 4 && renderReflectionSection()}
        </div>

        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={onBack}>
            Zpět
          </Button>
          
          <div className="flex gap-4">
            {activeSection > 0 && (
              <Button variant="outline" onClick={() => setActiveSection(activeSection - 1)}>
                Předchozí sekce
              </Button>
            )}
            
            {activeSection < sections.length - 1 ? (
              <Button 
                onClick={() => setActiveSection(activeSection + 1)}
                disabled={!isCurrentSectionComplete()}
              >
                Další sekce
              </Button>
            ) : (
              <Button 
                onClick={handleComplete}
                disabled={!isPhaseComplete()}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                Dokončit EXPANSION
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};