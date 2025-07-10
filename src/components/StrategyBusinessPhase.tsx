import React, { useState, useEffect } from "react";
import { usePersistedState } from "@/hooks/usePersistedState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, ReferenceArea } from "recharts";
import { ArrowLeft, Target, TrendingUp, Calculator, Brain, Info, AlertTriangle, CheckCircle, DollarSign, Percent, RefreshCw, Calendar, BarChart3, Rocket, PlayCircle, TrendingDown } from "lucide-react";

interface StartupPlan {
  launchMonth: number; // 0-11 (Jan-Dec)
  preLaunchMonths: number; // How many months before launch to start investing
  monthlyOrders: number[]; // 12 months of absolute order numbers
  selectedScenario: 'slow-start' | 'aggressive' | 'seasonal' | 'custom';
}

interface ROICalculatorData {
  // Marketingové náklady (měsíčně)
  marketingCosts: {
    ppc: number;
    facebookAds: number;
    bannerAds: number;
    influencerMarketing: number;
    emailMarketing: number;
    seoContent: number;
  };
  
  // Provozní náklady (měsíčně)
  operationalCosts: {
    webDevelopment: number;
    hostingSoftware: number;
    workforce: number;
    warehouseLogistics: number;
    fixedMonthlyOperations: number;
    otherCosts: number;
  };
  
  // Výnosy
  revenue: {
    productPrice: number;
    monthlyOrders: number; // This becomes the base for growth scenarios
  };
  
  // Daně a rezervy
  taxes: {
    incomeTaxRate: number; // %
    growthReserveRate: number; // %
  };

  // Sezónní úpravy
  seasonalAdjustments: {
    salesMultipliers: number[]; // 12 měsíců, 0.5-2.0
    selectedProfile: 'standard' | 'ecommerce' | 'b2b' | 'travel' | 'custom';
  };

  // Startup launch plan
  startupPlan: StartupPlan;
}

interface StrategyBusinessPhaseProps {
  onComplete: () => void;
  onBack: () => void;
}

interface LeanCanvasData {
  costStructure: string;
  revenueStreams: string;
}

interface ROIAnalysis {
  roi: number;
  pno: number;
  breakEvenMonth: number;
  isViable: boolean;
  reasoning: string;
  recommendations: string[];
}

const seasonalProfiles = {
  standard: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ecommerce: [0.8, 0.9, 1, 1, 1, 1, 1, 1, 1, 1.1, 1.2, 1.5],
  b2b: [1, 1, 1, 1, 1, 1, 1, 0.6, 1, 1, 1, 0.7],
  travel: [0.8, 0.8, 1, 1.1, 1.2, 1.3, 1.3, 1.3, 1.1, 1, 0.9, 0.8]
};

// Growth scenarios for startup launches
const growthScenarios = {
  'slow-start': [0, 0, 5, 8, 12, 18, 25, 30, 35, 42, 50, 60],
  'aggressive': [0, 0, 10, 25, 45, 70, 100, 130, 160, 200, 250, 300],
  'seasonal': [0, 0, 10, 15, 20, 30, 35, 25, 30, 45, 60, 80]
};

const defaultROIData: ROICalculatorData = {
  marketingCosts: {
    ppc: 8000,
    facebookAds: 5000,
    bannerAds: 2000,
    influencerMarketing: 3000,
    emailMarketing: 1500,
    seoContent: 4000
  },
  operationalCosts: {
    webDevelopment: 15000,
    hostingSoftware: 2000,
    workforce: 25000,
    warehouseLogistics: 8000,
    fixedMonthlyOperations: 5000,
    otherCosts: 3000
  },
  revenue: {
    productPrice: 850,
    monthlyOrders: 45
  },
  taxes: {
    incomeTaxRate: 15,
    growthReserveRate: 10
  },
  seasonalAdjustments: {
    salesMultipliers: [...seasonalProfiles.standard],
    selectedProfile: 'standard'
  },
  startupPlan: {
    launchMonth: 2, // March (0-based)
    preLaunchMonths: 2, // Start investing 2 months before launch
    monthlyOrders: [...growthScenarios['slow-start']],
    selectedScenario: 'slow-start'
  }
};

const marketingFields = [
  { key: 'ppc', label: 'PPC (Google Ads)', hint: 'Reklama ve vyhledávači Google, obvyklý rozpočet 5-20k Kč/měsíc' },
  { key: 'facebookAds', label: 'Facebook Ads', hint: 'Sociální média reklama, efektivní pro B2C, 3-15k Kč/měsíc' },
  { key: 'bannerAds', label: 'Bannerová reklama', hint: 'Display reklama na webech, 1-5k Kč/měsíc' },
  { key: 'influencerMarketing', label: 'Influencer marketing', hint: 'Spolupráce s influencery, 2-10k Kč/měsíc podle dosahu' },
  { key: 'emailMarketing', label: 'E-mailing / remarketing', hint: 'Newsletter a remarketing kampaně, 500-3k Kč/měsíc' },
  { key: 'seoContent', label: 'SEO a obsah', hint: 'Optimalizace pro vyhledávače a tvorba obsahu, 3-10k Kč/měsíc' }
];

const operationalFields = [
  { key: 'webDevelopment', label: 'Vývoj webu / aplikace', hint: 'Programování, design, údržba webu, 10-30k Kč/měsíc' },
  { key: 'hostingSoftware', label: 'Hosting / software', hint: 'Webhosting, domény, SaaS nástroje, 500-3k Kč/měsíc' },
  { key: 'workforce', label: 'Pracovní síla / služby', hint: 'Zaměstnanci, freelanceři, agentury, 15-50k Kč/měsíc' },
  { key: 'warehouseLogistics', label: 'Sklad / logistika', hint: 'Skladování, expedice, doprava, 5-20k Kč/měsíc' },
  { key: 'fixedMonthlyOperations', label: 'Fixní měsíční provoz', hint: 'Kancelář, energie, pojištění, 3-10k Kč/měsíc' },
  { key: 'otherCosts', label: 'Ostatní náklady', hint: 'Neočekávané výdaje, rezervy, 2-5k Kč/měsíc' }
];

const monthNames = ['Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čvn', 'Čvc', 'Srp', 'Zář', 'Říj', 'Lis', 'Pro'];

const loadLeanCanvasData = (): LeanCanvasData | null => {
  try {
    const data = localStorage.getItem("ideation_lean_canvas");
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn("Failed to load Lean Canvas data:", error);
    return null;
  }
};

const extractNumbersFromText = (text: string): number[] => {
  const numbers = text.match(/\d+[.,]?\d*/g);
  return numbers ? numbers.map(n => parseInt(n.replace(/[.,]/g, ''), 10)).filter(n => !isNaN(n)) : [];
};

const preFillfromLeanCanvas = (leanCanvas: LeanCanvasData): Partial<ROICalculatorData> => {
  const costNumbers = extractNumbersFromText(leanCanvas.costStructure || "");
  const revenueNumbers = extractNumbersFromText(leanCanvas.revenueStreams || "");
  
  const preFilledData: Partial<ROICalculatorData> = {};
  
  // Pre-fill costs if we have numbers
  if (costNumbers.length >= 3) {
    preFilledData.operationalCosts = {
      webDevelopment: costNumbers[0] || defaultROIData.operationalCosts.webDevelopment,
      workforce: costNumbers[1] || defaultROIData.operationalCosts.workforce,
      hostingSoftware: costNumbers[2] || defaultROIData.operationalCosts.hostingSoftware,
      warehouseLogistics: defaultROIData.operationalCosts.warehouseLogistics,
      fixedMonthlyOperations: defaultROIData.operationalCosts.fixedMonthlyOperations,
      otherCosts: defaultROIData.operationalCosts.otherCosts
    };
  }
  
  // Pre-fill revenue if we have numbers
  if (revenueNumbers.length >= 1) {
    preFilledData.revenue = {
      productPrice: revenueNumbers[0] || defaultROIData.revenue.productPrice,
      monthlyOrders: defaultROIData.revenue.monthlyOrders
    };
  }
  
  return preFilledData;
};

const calculateROIMetrics = (data: ROICalculatorData): ROIAnalysis => {
  const monthlyMarketingCosts = Object.values(data.marketingCosts).reduce((sum, cost) => sum + cost, 0);
  const monthlyOperationalCosts = Object.values(data.operationalCosts).reduce((sum, cost) => sum + cost, 0);
  const totalMonthlyCosts = monthlyMarketingCosts + monthlyOperationalCosts;
  
  // Calculate seasonal adjusted revenue
  const baseMonthlyRevenue = data.revenue.productPrice * data.revenue.monthlyOrders;
  const taxAndReserveRate = (data.taxes.incomeTaxRate + data.taxes.growthReserveRate) / 100;
  
  // Break-even calculation with seasonal adjustments
  let breakEvenMonth = 0;
  let cumulativeProfit = 0;
  for (let month = 1; month <= 24; month++) {
    const seasonalMultiplier = data.seasonalAdjustments.salesMultipliers[(month - 1) % 12];
    const adjustedRevenue = baseMonthlyRevenue * seasonalMultiplier;
    const netMonthlyRevenue = adjustedRevenue * (1 - taxAndReserveRate);
    const monthlyProfit = netMonthlyRevenue - totalMonthlyCosts;
    
    cumulativeProfit += monthlyProfit;
    if (cumulativeProfit > 0 && breakEvenMonth === 0) {
      breakEvenMonth = month;
      break;
    }
  }
  if (breakEvenMonth === 0) breakEvenMonth = 25; // More than 24 months
  
  // Calculate average annual metrics
  const avgSeasonalMultiplier = data.seasonalAdjustments.salesMultipliers.reduce((sum, mult) => sum + mult, 0) / 12;
  const avgMonthlyRevenue = baseMonthlyRevenue * avgSeasonalMultiplier;
  const avgNetMonthlyRevenue = avgMonthlyRevenue * (1 - taxAndReserveRate);
  const avgMonthlyProfit = avgNetMonthlyRevenue - totalMonthlyCosts;
  
  // ROI calculation (annual)
  const annualProfit = avgMonthlyProfit * 12;
  const annualCosts = totalMonthlyCosts * 12;
  const roi = annualCosts > 0 ? (annualProfit / annualCosts) * 100 : 0;
  
  // PNO calculation
  const pno = avgMonthlyRevenue > 0 ? (monthlyMarketingCosts / avgMonthlyRevenue) * 100 : 0;
  
  // Analysis
  const isViable = roi > 20 && pno < 50 && breakEvenMonth <= 12;
  
  let reasoning = "";
  const recommendations: string[] = [];
  
  if (roi < 20) {
    reasoning += "Nízká návratnost investice. ";
    recommendations.push("Zvažte optimalizaci nákladů nebo zvýšení ceny produktu");
  }
  
  if (pno > 50) {
    reasoning += "Vysoké marketingové náklady vůči obratu. ";
    recommendations.push("Optimalizujte marketingové kanály a zaměřte se na nejefektivnější");
  }
  
  if (breakEvenMonth > 12) {
    reasoning += "Dlouhá doba návratnosti. ";
    recommendations.push("Zvažte rychlejší škálování nebo snížení počátečních nákladů");
  }
  
  if (isViable) {
    reasoning = "Projekt vykazuje zdravé finanční ukazatele a má dobré předpoklady pro úspěch.";
    recommendations.push("Projekt je připraven k implementaci");
    recommendations.push("Doporučujeme zahájit MVP verzi a postupně škálovat");
  }
  
  return {
    roi,
    pno,
    breakEvenMonth,
    isViable,
    reasoning,
    recommendations
  };
};

const generateChartData = (data: ROICalculatorData) => {
  const monthlyMarketingCosts = Object.values(data.marketingCosts).reduce((sum, cost) => sum + cost, 0);
  const monthlyOperationalCosts = Object.values(data.operationalCosts).reduce((sum, cost) => sum + cost, 0);
  const totalMonthlyCosts = monthlyMarketingCosts + monthlyOperationalCosts;
  
  const taxAndReserveRate = (data.taxes.incomeTaxRate + data.taxes.growthReserveRate) / 100;
  
  const chartData = [];
  let cumulativeRevenue = 0;
  let cumulativeCosts = 0;
  let cumulativeProfit = 0;
  
  const { launchMonth, preLaunchMonths, monthlyOrders } = data.startupPlan;
  const startMonth = launchMonth - preLaunchMonths;
  
  for (let month = 1; month <= 12; month++) {
    const currentMonthIndex = (startMonth + month - 1 + 12) % 12;
    const monthsSinceStart = month - 1;
    const monthsSinceLaunch = monthsSinceStart - preLaunchMonths;
    
    // Determine if this is pre-launch, launch, or post-launch
    const isPreLaunch = monthsSinceLaunch < 0;
    const isLaunchMonth = monthsSinceLaunch === 0;
    
    // Calculate revenue based on startup plan
    let monthlyRevenue = 0;
    if (!isPreLaunch) {
      const orderIndex = Math.max(0, Math.min(11, monthsSinceLaunch));
      const ordersThisMonth = monthlyOrders[orderIndex] || 0;
      const seasonalMultiplier = data.seasonalAdjustments.salesMultipliers[currentMonthIndex];
      monthlyRevenue = data.revenue.productPrice * ordersThisMonth * seasonalMultiplier;
    }
    
    const netMonthlyRevenue = monthlyRevenue * (1 - taxAndReserveRate);
    
    cumulativeRevenue += netMonthlyRevenue;
    cumulativeCosts += totalMonthlyCosts;
    cumulativeProfit = cumulativeRevenue - cumulativeCosts;
    
    const phaseColor = isPreLaunch ? 'investment' : (isLaunchMonth ? 'launch' : 'growth');
    
    chartData.push({
      month: `M${month}`,
      monthName: monthNames[currentMonthIndex],
      revenue: Math.round(cumulativeRevenue),
      costs: Math.round(cumulativeCosts),
      profit: Math.round(cumulativeProfit),
      phase: phaseColor,
      ordersThisMonth: isPreLaunch ? 0 : monthlyOrders[Math.max(0, Math.min(11, monthsSinceLaunch))] || 0,
      isBreakEven: cumulativeProfit > 0 && (month === 1 || chartData[month - 2]?.profit <= 0),
      isPreLaunch,
      isLaunchMonth
    });
  }
  
  return chartData;
};

// Migration function to ensure data compatibility
const migrateROIData = (loadedData: any): ROICalculatorData => {
  // If loaded data is missing new properties, merge with defaults
  if (!loadedData.seasonalAdjustments || !loadedData.startupPlan) {
    return {
      ...defaultROIData,
      ...loadedData,
      seasonalAdjustments: loadedData.seasonalAdjustments || defaultROIData.seasonalAdjustments,
      startupPlan: loadedData.startupPlan || defaultROIData.startupPlan
    };
  }
  return loadedData;
};

export const StrategyBusinessPhase = ({ onComplete, onBack }: StrategyBusinessPhaseProps) => {
  const [showIntro, setShowIntro] = useState(true);
  const [isPreFilled, setIsPreFilled] = useState(false);
  
  // Use custom migration logic
  const [roiData, setRoiData] = usePersistedState<ROICalculatorData>("strategy_roi_data", defaultROIData);
  
  // Apply migration on mount
  useEffect(() => {
    const rawData = localStorage.getItem("strategy_roi_data");
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData);
        const migrated = migrateROIData(parsed);
        setRoiData(migrated);
      } catch (error) {
        console.warn("Failed to migrate ROI data, using defaults:", error);
        setRoiData(defaultROIData);
      }
    }
  }, []);
  
  const analysis = calculateROIMetrics(roiData);
  const chartData = generateChartData(roiData);
  const breakEvenPoint = chartData.find(point => point.isBreakEven);
  
  // Pre-fill from Lean Canvas on mount
  useEffect(() => {
    const leanCanvas = loadLeanCanvasData();
    if (leanCanvas && !isPreFilled) {
      const preFilledData = preFillfromLeanCanvas(leanCanvas);
      if (Object.keys(preFilledData).length > 0) {
        setRoiData(prev => ({
          ...prev,
          ...preFilledData
        }));
        setIsPreFilled(true);
      }
    }
  }, []);
  
  const resetToDefaults = () => {
    setRoiData(defaultROIData);
    setIsPreFilled(false);
  };
  
  const updateMarketingCost = (key: keyof ROICalculatorData['marketingCosts'], value: number) => {
    setRoiData(prev => ({
      ...prev,
      marketingCosts: {
        ...prev.marketingCosts,
        [key]: value
      }
    }));
  };
  
  const updateOperationalCost = (key: keyof ROICalculatorData['operationalCosts'], value: number) => {
    setRoiData(prev => ({
      ...prev,
      operationalCosts: {
        ...prev.operationalCosts,
        [key]: value
      }
    }));
  };
  
  const updateRevenue = (key: keyof ROICalculatorData['revenue'], value: number) => {
    setRoiData(prev => ({
      ...prev,
      revenue: {
        ...prev.revenue,
        [key]: value
      }
    }));
  };
  
  const updateTax = (key: keyof ROICalculatorData['taxes'], value: number) => {
    setRoiData(prev => ({
      ...prev,
      taxes: {
        ...prev.taxes,
        [key]: value
      }
    }));
  };

  const updateStartupPlan = (key: keyof StartupPlan, value: any) => {
    setRoiData(prev => ({
      ...prev,
      startupPlan: {
        ...prev.startupPlan,
        [key]: value
      }
    }));
  };

  const updateGrowthScenario = (scenario: keyof typeof growthScenarios) => {
    setRoiData(prev => ({
      ...prev,
      startupPlan: {
        ...prev.startupPlan,
        selectedScenario: scenario,
        monthlyOrders: [...growthScenarios[scenario]]
      }
    }));
  };

  const updateMonthlyOrder = (monthIndex: number, value: number) => {
    setRoiData(prev => ({
      ...prev,
      startupPlan: {
        ...prev.startupPlan,
        selectedScenario: 'custom',
        monthlyOrders: prev.startupPlan.monthlyOrders.map((orders, index) => 
          index === monthIndex ? value : orders
        )
      }
    }));
  };

  const updateSeasonalProfile = (profile: keyof typeof seasonalProfiles) => {
    setRoiData(prev => ({
      ...prev,
      seasonalAdjustments: {
        ...prev.seasonalAdjustments,
        selectedProfile: profile,
        salesMultipliers: [...seasonalProfiles[profile]]
      }
    }));
  };

  const updateSeasonalMultiplier = (monthIndex: number, value: number) => {
    setRoiData(prev => ({
      ...prev,
      seasonalAdjustments: {
        ...prev.seasonalAdjustments,
        selectedProfile: 'custom',
        salesMultipliers: prev.seasonalAdjustments.salesMultipliers.map((mult, index) => 
          index === monthIndex ? value : mult
        )
      }
    }));
  };
  
  const filledFieldsCount = [
    ...Object.values(roiData.marketingCosts),
    ...Object.values(roiData.operationalCosts),
    ...Object.values(roiData.revenue),
    ...Object.values(roiData.taxes)
  ].filter(value => value > 0).length;
  
  const totalFields = 6 + 6 + 2 + 2; // marketing + operational + revenue + taxes
  const progressPercentage = (filledFieldsCount / totalFields) * 100;
  
  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-4">
        <div className="max-w-4xl mx-auto">
          <Button 
            onClick={onBack}
            variant="ghost" 
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zpět na dashboard
          </Button>
          
          <Card className="card-apple p-8">
            <div className="text-center space-y-6">
              <div className="p-4 bg-primary/10 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                <Target className="w-10 h-10 text-primary" />
              </div>
              
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-foreground">Fáze 3: Strategy & Business</h1>
                <p className="text-xl text-primary font-medium">Výpočet ROI a návratnosti</p>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Analyzujeme finanční stránku vašeho projektu včetně sezónních vlivů. Spočítáme ROI, PNO a break-even point 
                  aby zjistili, jestli se váš projekt ekonomicky vyplatí.
                </p>
              </div>
              
              <div className="bg-accent/10 p-4 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Co vás čeká:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Zadání marketingových a provozních nákladů</li>
                  <li>• Sezónní úpravy prodejů (vánoce, léto, atd.)</li>
                  <li>• Graf s bodem zvratu a vývojem návratnosti</li>
                  <li>• AI doporučení pro optimalizaci</li>
                </ul>
              </div>
              
              {isPreFilled && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Některá pole byla předvyplněna z vašeho Lean Canvas. Můžete je upravit podle potřeby.
                  </AlertDescription>
                </Alert>
              )}
              
              <Button 
                onClick={() => setShowIntro(false)}
                className="btn-apple px-8 py-3 text-base"
              >
                Začít s analýzou ROI
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-4">
      <div className="max-w-7xl mx-auto">
        <Button 
          onClick={onBack}
          variant="ghost" 
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zpět na dashboard
        </Button>
        
        {/* Progress Header */}
        <Card className="card-apple p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">ROI Business Kalkulátor</h1>
              <p className="text-muted-foreground">
                Vyplněno {filledFieldsCount} z {totalFields} polí
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {isPreFilled && (
                <Button onClick={resetToDefaults} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset na výchozí
                </Button>
              )}
            </div>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Input Forms */}
          <div className="space-y-6">
            {/* Marketing Costs */}
            <Card className="card-apple p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                Marketingové náklady (měsíčně)
              </h2>
              <div className="space-y-4">
                {marketingFields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key} className="text-sm font-medium">
                      {field.label}
                    </Label>
                    <div className="relative">
                      <Input
                        id={field.key}
                        type="number"
                        value={roiData.marketingCosts[field.key as keyof typeof roiData.marketingCosts]}
                        onChange={(e) => updateMarketingCost(
                          field.key as keyof ROICalculatorData['marketingCosts'], 
                          parseInt(e.target.value) || 0
                        )}
                        placeholder="0"
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                        Kč
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{field.hint}</p>
                  </div>
                ))}
              </div>
            </Card>
            
            {/* Operational Costs */}
            <Card className="card-apple p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                <Calculator className="w-5 h-5 mr-2 text-primary" />
                Provozní náklady (měsíčně)
              </h2>
              <div className="space-y-4">
                {operationalFields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key} className="text-sm font-medium">
                      {field.label}
                    </Label>
                    <div className="relative">
                      <Input
                        id={field.key}
                        type="number"
                        value={roiData.operationalCosts[field.key as keyof typeof roiData.operationalCosts]}
                        onChange={(e) => updateOperationalCost(
                          field.key as keyof ROICalculatorData['operationalCosts'], 
                          parseInt(e.target.value) || 0
                        )}
                        placeholder="0"
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                        Kč
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{field.hint}</p>
                  </div>
                ))}
              </div>
            </Card>
            
            {/* Revenue & Taxes */}
            <Card className="card-apple p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-primary" />
                Výnosy a daně
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productPrice" className="text-sm font-medium">
                      Cena produktu/služby
                    </Label>
                    <div className="relative">
                      <Input
                        id="productPrice"
                        type="number"
                        value={roiData.revenue.productPrice}
                        onChange={(e) => updateRevenue('productPrice', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                        Kč
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="monthlyOrders" className="text-sm font-medium">
                      Objednávky za měsíc
                    </Label>
                    <Input
                      id="monthlyOrders"
                      type="number"
                      value={roiData.revenue.monthlyOrders}
                      onChange={(e) => updateRevenue('monthlyOrders', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="incomeTaxRate" className="text-sm font-medium">
                      Daň z příjmu
                    </Label>
                    <div className="relative">
                      <Input
                        id="incomeTaxRate"
                        type="number"
                        value={roiData.taxes.incomeTaxRate}
                        onChange={(e) => updateTax('incomeTaxRate', parseInt(e.target.value) || 0)}
                        placeholder="15"
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                        %
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="growthReserveRate" className="text-sm font-medium">
                      Rezerva na růst
                    </Label>
                    <div className="relative">
                      <Input
                        id="growthReserveRate"
                        type="number"
                        value={roiData.taxes.growthReserveRate}
                        onChange={(e) => updateTax('growthReserveRate', parseInt(e.target.value) || 0)}
                        placeholder="10"
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Startup Launch Planning */}
            <Card className="card-apple p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                <Rocket className="w-5 h-5 mr-2 text-primary" />
                Plánování spuštění startupu
              </h2>
              
              <div className="space-y-6">
                {/* Launch settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Měsíc spuštění produktu</Label>
                    <select 
                      className="w-full p-2 border rounded-md bg-background"
                      value={roiData.startupPlan.launchMonth}
                      onChange={(e) => updateStartupPlan('launchMonth', parseInt(e.target.value))}
                    >
                      {monthNames.map((month, index) => (
                        <option key={index} value={index}>{month}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Měsíce před spuštěním (investice)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="6"
                      value={roiData.startupPlan.preLaunchMonths}
                      onChange={(e) => updateStartupPlan('preLaunchMonths', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                {/* Growth scenario buttons */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Scénář růstu objednávek:</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Button
                      variant={roiData.startupPlan.selectedScenario === 'slow-start' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateGrowthScenario('slow-start')}
                      className="flex items-center space-x-2"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>Pozvolný start</span>
                    </Button>
                    <Button
                      variant={roiData.startupPlan.selectedScenario === 'aggressive' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateGrowthScenario('aggressive')}
                      className="flex items-center space-x-2"
                    >
                      <Rocket className="w-4 h-4" />
                      <span>Agresivní růst</span>
                    </Button>
                    <Button
                      variant={roiData.startupPlan.selectedScenario === 'seasonal' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateGrowthScenario('seasonal')}
                      className="flex items-center space-x-2"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Sezónní byznys</span>
                    </Button>
                  </div>
                </div>

                {/* Monthly orders table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Měsíční objednávky po spuštění:</Label>
                    {roiData.startupPlan.selectedScenario === 'custom' && (
                      <Badge variant="secondary">Vlastní scénář</Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3">
                    {roiData.startupPlan.monthlyOrders.map((orders, index) => {
                      const monthsSinceLaunch = index;
                      const isPreLaunch = monthsSinceLaunch < 0;
                      
                      return (
                        <div key={index} className="space-y-2">
                          <Label className="text-xs text-muted-foreground">
                            {monthsSinceLaunch === 0 ? 'Launch' : `M${monthsSinceLaunch + 1}`}
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            value={orders}
                            onChange={(e) => updateMonthlyOrder(index, parseInt(e.target.value) || 0)}
                            className={`text-center ${
                              orders === 0 ? 'bg-muted/50' : 
                              orders > 50 ? 'bg-green-50 border-green-200' : 
                              'bg-blue-50 border-blue-200'
                            }`}
                            disabled={isPreLaunch}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Preview timeline */}
                <div className="bg-accent/10 p-4 rounded-lg">
                  <h4 className="text-sm font-medium mb-3">Předpokládaná timeline:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Investiční fáze: {roiData.startupPlan.preLaunchMonths} měsíců před {monthNames[roiData.startupPlan.launchMonth]}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span>Spuštění: {monthNames[roiData.startupPlan.launchMonth]} s {roiData.startupPlan.monthlyOrders[0]} objednávkami</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Rok po spuštění: {roiData.startupPlan.monthlyOrders[11]} objednávek/měsíc</span>
                    </div>
                  </div>
                </div>

                {/* Scenario descriptions */}
                <div className="bg-accent/10 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    💡 <strong>Pozvolný start:</strong> Konzervativní růst 0→60 objednávek za rok<br/>
                    🚀 <strong>Agresivní:</strong> Rychlý růst 0→300 objednávek (vyžaduje více investic)<br/>
                    📅 <strong>Sezónní:</strong> Růst s ohledem na sezónní výkyvy v odvětví
                  </p>
                </div>
              </div>
            </Card>

            {/* Seasonal Adjustments */}
            <Card className="card-apple p-6">
              <Accordion type="single" collapsible>
                <AccordionItem value="seasonal">
                  <AccordionTrigger className="text-lg font-semibold">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-primary" />
                      Sezónní variace prodejů
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Přednastavené profily:</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={roiData.seasonalAdjustments.selectedProfile === 'standard' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateSeasonalProfile('standard')}
                        >
                          Standardní
                        </Button>
                        <Button
                          variant={roiData.seasonalAdjustments.selectedProfile === 'ecommerce' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateSeasonalProfile('ecommerce')}
                        >
                          E-commerce
                        </Button>
                        <Button
                          variant={roiData.seasonalAdjustments.selectedProfile === 'b2b' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateSeasonalProfile('b2b')}
                        >
                          B2B služby
                        </Button>
                        <Button
                          variant={roiData.seasonalAdjustments.selectedProfile === 'travel' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateSeasonalProfile('travel')}
                        >
                          Cestovní ruch
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Měsíční úpravy (% od základu):</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {monthNames.map((month, index) => (
                          <div key={month} className="space-y-2">
                            <Label className="text-xs text-muted-foreground">{month}</Label>
                            <div className="space-y-1">
                              <Slider
                                value={[roiData.seasonalAdjustments.salesMultipliers[index]]}
                                onValueChange={([value]) => updateSeasonalMultiplier(index, value)}
                                min={0.5}
                                max={2.0}
                                step={0.1}
                                className="w-full"
                              />
                              <div className="text-xs text-center text-muted-foreground">
                                {Math.round(roiData.seasonalAdjustments.salesMultipliers[index] * 100)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-accent/10 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        💡 Tip: E-commerce má obvykle vyšší prodeje v listopadu-prosinci (vánoce), 
                        B2B služby mají nižší prodeje v srpnu a prosinci.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          </div>
          
          {/* Right Column - Results & Analysis */}
          <div className="space-y-6">
            {/* Key Metrics */}
            <Card className="card-apple p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Klíčové ukazatele</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {analysis.roi.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">ROI (roční)</div>
                </div>
                
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {analysis.pno.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">PNO</div>
                </div>
                
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {analysis.breakEvenMonth > 24 ? "25+" : analysis.breakEvenMonth}
                  </div>
                  <div className="text-sm text-muted-foreground">Break-even (měsíc)</div>
                </div>
              </div>
              
              <div className="mt-4 p-3 rounded-lg border">
                <div className="text-sm text-muted-foreground mb-1">Doporučená PNO pro e-shopy</div>
                <div className="flex items-center space-x-2">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: '30%' }}
                    ></div>
                  </div>
                  <span className="text-sm text-muted-foreground">20-30%</span>
                </div>
              </div>
            </Card>
            
            {/* Chart with Break-even */}
            <Card className="card-apple p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                Vývoj návratnosti s bodem zvratu
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="monthName" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    
                    {/* Zero line */}
                    <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" />
                    
                    {/* Break-even line */}
                    {breakEvenPoint && (
                      <ReferenceLine 
                        x={breakEvenPoint.monthName} 
                        stroke="hsl(var(--success))" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        label={{ 
                          value: `Break-even: ${breakEvenPoint.monthName}`, 
                          position: "top",
                          style: { fontSize: '12px', fill: 'hsl(var(--success))' }
                        }}
                      />
                    )}

                    {/* Profit zones */}
                    <ReferenceArea 
                      y1={0} 
                      y2={Math.max(...chartData.map(d => d.profit))} 
                      fill="hsl(var(--success))" 
                      fillOpacity={0.1} 
                    />
                    <ReferenceArea 
                      y1={Math.min(...chartData.map(d => d.profit))} 
                      y2={0} 
                      fill="hsl(var(--destructive))" 
                      fillOpacity={0.1} 
                    />
                    
                    <Tooltip 
                      formatter={(value: number, name: string, props: any) => {
                        const labels = {
                          revenue: 'Příjmy',
                          costs: 'Náklady', 
                          profit: 'Zisk'
                        };
                        const formattedValue = `${value.toLocaleString()} Kč`;
                        
                        if (name === 'profit' && props.payload.isBreakEven) {
                          return [`${formattedValue} (Break-even!)`, labels[name as keyof typeof labels]];
                        }
                        
                        return [formattedValue, labels[name as keyof typeof labels]];
                      }}
                      labelFormatter={(label) => `Měsíc: ${label}`}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend 
                      formatter={(value) => {
                        const labels = {
                          revenue: 'Příjmy',
                          costs: 'Náklady', 
                          profit: 'Zisk'
                        };
                        return labels[value as keyof typeof labels] || value;
                      }}
                    />
                    
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="costs" 
                      stroke="hsl(var(--destructive))" 
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="hsl(var(--success))" 
                      strokeWidth={3}
                      dot={(props) => {
                        if (props.payload?.isBreakEven) {
                          return (
                            <circle
                              cx={props.cx}
                              cy={props.cy}
                              r={6}
                              fill="hsl(var(--success))"
                              stroke="hsl(var(--background))"
                              strokeWidth={2}
                            />
                          );
                        }
                        return null;
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
            
            {/* AI Analysis */}
            <Card className="card-apple p-6">
              <div className="flex items-center mb-4">
                <Brain className="w-6 h-6 mr-2 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">AI Analýza projektu</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  {analysis.isViable ? (
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-orange-500 mt-1 flex-shrink-0" />
                  )}
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      {analysis.isViable ? "✅ Projekt je ekonomicky viabilní" : "⚠️ Projekt potřebuje optimalizaci"}
                    </h3>
                    <p className="text-muted-foreground">{analysis.reasoning}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Doporučení:</h3>
                  <ul className="space-y-1">
                    {analysis.recommendations.map((recommendation, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {recommendation}
                      </li>
                    ))}
                  </ul>
                </div>

                {breakEvenPoint && (
                  <div className="mt-4 p-3 bg-success/10 rounded-lg border border-success/20">
                    <p className="text-sm text-muted-foreground">
                      🎯 <strong>Break-even dosažen v měsíci {breakEvenPoint.monthName}</strong> - 
                      od tohoto okamžiku začne projekt generovat zisk.
                    </p>
                  </div>
                )}
              </div>
            </Card>
            
            {/* Completion */}
            <Card className="card-apple p-6 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Analýza dokončena
                </h3>
                <p className="text-muted-foreground">
                  {analysis.isViable 
                    ? "Projekt má dobré finanční základy včetně sezónních vlivů. Můžete pokračovat k implementaci."
                    : "Projekt vyžaduje optimalizaci před pokračováním. Prostudujte si doporučení výše."
                  }
                </p>
                <Button 
                  onClick={onComplete}
                  className="btn-apple px-8"
                  disabled={progressPercentage < 80}
                >
                  {analysis.isViable ? "Pokračovat na implementaci" : "Dokončit analýzu"}
                </Button>
                {progressPercentage < 80 && (
                  <p className="text-xs text-muted-foreground">
                    Vyplňte alespoň 80% polí pro pokračování
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};