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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, ReferenceArea } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { generatePredictiveData } from "@/lib/predictiveMapping";
import { BackButton } from "@/components/ui/back-button";
import { Target, TrendingUp, Calculator, Brain, Info, AlertTriangle, CheckCircle, DollarSign, Percent, RefreshCw, Calendar, BarChart3, Rocket, PlayCircle, TrendingDown, Wand2 } from "lucide-react";

interface StartupPlan {
  launchMonth: number; // 0-11 (Jan-Dec)
  preLaunchMonths: number; // How many months before launch to start investing
  monthlyOrders: number[]; // 12 months of absolute order numbers
  selectedScenario: 'slow-start' | 'aggressive' | 'seasonal' | 'custom';
}

interface ROICalculatorData {
  // Marketingové náklady (měsíčně - pole 12 hodnot)
  marketingCosts: {
    ppc: number[];
    facebookAds: number[];
    bannerAds: number[];
    influencerMarketing: number[];
    emailMarketing: number[];
    seoContent: number[];
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
  totalRevenue: number;
  totalCosts: number;
  totalProfit: number;
  averageMonthlyProfit: number;
  profitMargin: number;
  isViable: boolean;
  reasoning: string;
  recommendations: string[];
}

// Growth scenarios for startup launches
const growthScenarios = {
  'slow-start': [0, 0, 5, 8, 12, 18, 25, 30, 35, 42, 50, 60],
  'aggressive': [0, 0, 10, 25, 45, 70, 100, 130, 160, 200, 250, 300],
  'seasonal': [0, 0, 10, 15, 20, 30, 35, 25, 30, 45, 60, 80]
};

const defaultROIData: ROICalculatorData = {
  marketingCosts: {
    ppc: Array(12).fill(8000),
    facebookAds: Array(12).fill(5000),
    bannerAds: Array(12).fill(2000),
    influencerMarketing: Array(12).fill(3000),
    emailMarketing: Array(12).fill(1500),
    seoContent: Array(12).fill(4000)
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
  // Defensive programming - ensure data exists
  if (!data?.marketingCosts || !data?.operationalCosts || !data?.revenue || !data?.taxes || !data?.startupPlan) {
    console.warn('calculateROIMetrics: Missing required data properties, using defaults');
    return {
      roi: 0,
      pno: 0,
      breakEvenMonth: 25,
      totalRevenue: 0,
      totalCosts: 0,
      totalProfit: 0,
      averageMonthlyProfit: 0,
      profitMargin: 0,
      isViable: false,
      reasoning: "Chybí základní data pro výpočet",
      recommendations: ["Vyplňte všechna povinná pole"]
    };
  }

  const monthlyMarketingCosts = Object.values(data.marketingCosts).reduce((sum, costArray) => {
    const averageCost = costArray.reduce((a, b) => a + b, 0) / costArray.length;
    return sum + averageCost;
  }, 0);
  const monthlyOperationalCosts = Object.values(data.operationalCosts).reduce((sum, cost) => sum + cost, 0);
  const totalMonthlyCosts = monthlyMarketingCosts + monthlyOperationalCosts;
  
  // Calculate revenue using startup plan data without seasonal adjustments
  const avgOrdersFromStartupPlan = data.startupPlan.monthlyOrders.reduce((sum, orders) => sum + orders, 0) / 12;
  const baseMonthlyRevenue = data.revenue.productPrice * avgOrdersFromStartupPlan;
  const taxAndReserveRate = (data.taxes.incomeTaxRate + data.taxes.growthReserveRate) / 100;
  
  // Break-even calculation without seasonal adjustments
  let breakEvenMonth = 0;
  let cumulativeProfit = 0;
  for (let month = 1; month <= 24; month++) {
    const adjustedRevenue = baseMonthlyRevenue; // No seasonal multiplier
    const netMonthlyRevenue = adjustedRevenue * (1 - taxAndReserveRate);
    const monthlyProfit = netMonthlyRevenue - totalMonthlyCosts;
    
    cumulativeProfit += monthlyProfit;
    if (cumulativeProfit > 0 && breakEvenMonth === 0) {
      breakEvenMonth = month;
      break;
    }
  }
  if (breakEvenMonth === 0) breakEvenMonth = 25; // More than 24 months
  
  // Calculate average annual metrics without seasonal adjustments
  const avgMonthlyRevenue = baseMonthlyRevenue;
  const avgNetMonthlyRevenue = avgMonthlyRevenue * (1 - taxAndReserveRate);
  const avgMonthlyProfit = avgNetMonthlyRevenue - totalMonthlyCosts;
  
  // ROI calculation (annual)
  const annualProfit = avgMonthlyProfit * 12;
  const annualCosts = totalMonthlyCosts * 12;
  const roi = annualCosts > 0 ? (annualProfit / annualCosts) * 100 : 0;
  
  // PNO calculation (marketing costs as % of profit margin)
  const monthlyProfit = avgNetMonthlyRevenue - totalMonthlyCosts;
  const pno = monthlyProfit > 0 ? (monthlyMarketingCosts / monthlyProfit) * 100 : 0;
  
  // Analysis (updated PNO threshold for margin-based calculation)
  const isViable = roi > 20 && pno < 80 && breakEvenMonth <= 12;
  
  let reasoning = "";
  const recommendations: string[] = [];
  
  if (roi < 20) {
    reasoning += "Nízká návratnost investice. ";
    recommendations.push("Zvažte optimalizaci nákladů nebo zvýšení ceny produktu");
  }
  
  if (pno > 80) {
    reasoning += "Vysoké marketingové náklady vůči marži. ";
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
  
  // Calculate absolute values
  const totalRevenue = avgMonthlyRevenue * 12;
  const totalCosts = annualCosts;
  const totalProfit = annualProfit;
  const averageMonthlyProfit = avgMonthlyProfit;
  const profitMargin = avgMonthlyRevenue > 0 ? (avgMonthlyProfit / avgMonthlyRevenue) * 100 : 0;
  
  return {
    roi,
    pno,
    breakEvenMonth,
    totalRevenue,
    totalCosts,
    totalProfit,
    averageMonthlyProfit,
    profitMargin,
    isViable,
    reasoning,
    recommendations
  };
};

const generateChartData = (data: ROICalculatorData, viewMode: 'monthly' | 'cumulative' = 'monthly') => {
  // Defensive programming - ensure data exists
  if (!data?.marketingCosts || !data?.operationalCosts || !data?.taxes || !data?.startupPlan) {
    console.warn('generateChartData: Missing required data properties');
    return [];
  }

  const monthlyOperationalCosts = Object.values(data.operationalCosts).reduce((sum, cost) => sum + cost, 0);
  
  // Function to calculate marketing costs for a specific month
  const getMonthlyMarketingCosts = (monthIndex: number) => {
    return Object.values(data.marketingCosts).reduce((sum, costArray) => {
      return sum + (costArray[monthIndex] || 0);
    }, 0);
  };
  
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
    
    // Calculate revenue based on startup plan without seasonal adjustments
    let monthlyRevenue = 0;
    if (!isPreLaunch) {
      const orderIndex = Math.max(0, Math.min(11, monthsSinceLaunch));
      const ordersThisMonth = monthlyOrders[orderIndex] || 0;
      monthlyRevenue = data.revenue.productPrice * ordersThisMonth; // No seasonal multiplier
    }
    
    const netMonthlyRevenue = monthlyRevenue * (1 - taxAndReserveRate);
    
    // Calculate costs for this specific month
    const monthlyMarketingCosts = getMonthlyMarketingCosts(currentMonthIndex);
    const totalMonthlyCosts = monthlyMarketingCosts + monthlyOperationalCosts;
    
    // Calculate monthly profit/loss
    const monthlyProfit = netMonthlyRevenue - totalMonthlyCosts;
    
    // Update cumulative values
    cumulativeRevenue += netMonthlyRevenue;
    cumulativeCosts += totalMonthlyCosts;
    cumulativeProfit = cumulativeRevenue - cumulativeCosts;
    
    const phaseColor = isPreLaunch ? 'investment' : (isLaunchMonth ? 'launch' : 'growth');
    
    chartData.push({
      month: `M${month}`,
      monthName: monthNames[currentMonthIndex],
      // Show either monthly or cumulative values based on viewMode
      revenue: viewMode === 'monthly' ? Math.round(netMonthlyRevenue) : Math.round(cumulativeRevenue),
      costs: viewMode === 'monthly' ? -Math.round(totalMonthlyCosts) : -Math.round(cumulativeCosts),
      profit: viewMode === 'monthly' ? Math.round(monthlyProfit) : Math.round(cumulativeProfit),
      // Always keep cumulative profit for break-even calculation
      cumulativeProfit: Math.round(cumulativeProfit),
      phase: phaseColor,
      ordersThisMonth: isPreLaunch ? 0 : monthlyOrders[Math.max(0, Math.min(11, monthsSinceLaunch))] || 0,
      isBreakEven: cumulativeProfit > 0 && (month === 1 || chartData[month - 2]?.cumulativeProfit <= 0),
      isPreLaunch,
      isLaunchMonth
    });
  }
  
  return chartData;
};

// Custom hook for migrated persisted state
const useMigratedPersistedState = (key: string, defaultValue: ROICalculatorData) => {
  const [state, setState] = useState<ROICalculatorData>(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        
        // Migration logic for marketing costs (number -> number[])
        const needsMarketingMigration = parsed.marketingCosts && 
          Object.values(parsed.marketingCosts).some((value: any) => typeof value === 'number');
        
        if (needsMarketingMigration) {
          const migratedMarketingCosts: any = {};
          Object.entries(parsed.marketingCosts).forEach(([key, value]: [string, any]) => {
            migratedMarketingCosts[key] = typeof value === 'number' ? Array(12).fill(value) : value;
          });
          parsed.marketingCosts = migratedMarketingCosts;
          console.log('Migrated marketing costs from single values to monthly arrays');
        }
        
        // Migration logic - remove seasonal adjustments if they exist
        if (parsed.seasonalAdjustments) {
          delete parsed.seasonalAdjustments;
          console.log('Removed seasonal adjustments from stored data');
        }
        
        // Migration logic - ensure all required properties exist
        if (!parsed.startupPlan) {
          const migrated = {
            ...defaultValue,
            ...parsed,
            startupPlan: parsed.startupPlan || defaultValue.startupPlan
          };
          console.log('Migrated ROI data with missing properties');
          return migrated;
        }
        return parsed;
      }
      return defaultValue;
    } catch (error) {
      console.warn(`Failed to load ${key} from localStorage:`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`Failed to save ${key} to localStorage:`, error);
    }
  }, [key, state]);

  return [state, setState] as const;
};

export const StrategyBusinessPhase = ({ onComplete, onBack }: StrategyBusinessPhaseProps) => {
  const [showIntro, setShowIntro] = useState(true);
  const [isPreFilled, setIsPreFilled] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  const [chartViewMode, setChartViewMode] = useState<'monthly' | 'cumulative'>('monthly');
  const [roiData, setRoiData] = useMigratedPersistedState("strategy_roi_data", defaultROIData);
  const [predictiveData, setPredictiveData] = useState<any>(null);
  const [hasAppliedPredictions, setHasAppliedPredictions] = useState(false);
  
  const analysis = calculateROIMetrics(roiData);
  const chartData = generateChartData(roiData, chartViewMode);
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
  
  const updateMarketingCost = (key: keyof ROICalculatorData['marketingCosts'], monthIndex: number, value: number) => {
    setRoiData(prev => ({
      ...prev,
      marketingCosts: {
        ...prev.marketingCosts,
        [key]: prev.marketingCosts[key].map((cost, index) => 
          index === monthIndex ? value : cost
        )
      }
    }));
  };

  const setAllMonthsMarketingCost = (key: keyof ROICalculatorData['marketingCosts'], value: number) => {
    setRoiData(prev => ({
      ...prev,
      marketingCosts: {
        ...prev.marketingCosts,
        [key]: Array(12).fill(value)
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
    if (key === 'monthlyOrders') return; // Ignore monthlyOrders, use startupPlan data instead
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

  // Apply predictive data to form
  const applyPredictiveData = () => {
    if (predictiveData) {
      // Convert predictive revenue items to ROI data format
      const totalMonthlyRevenue = predictiveData.totalMonthlyRevenue.reduce((a: number, b: number) => a + b, 0) / 12;
      const averagePrice = totalMonthlyRevenue / Math.max(1, roiData.revenue.monthlyOrders || 45);
      
      // Convert marketing costs to ROI data format  
      const convertedMarketingCosts = {
        ppc: predictiveData.marketingCosts.ppc || Array(12).fill(8000),
        facebookAds: predictiveData.marketingCosts.socialMedia || Array(12).fill(5000),
        bannerAds: Array(12).fill(2000),
        influencerMarketing: Array(12).fill(3000),
        emailMarketing: Array(12).fill(1500),
        seoContent: predictiveData.marketingCosts.contentMarketing || Array(12).fill(4000)
      };

      setRoiData(prev => ({
        ...prev,
        revenue: {
          ...prev.revenue,
          productPrice: Math.round(averagePrice)
        },
        marketingCosts: convertedMarketingCosts,
        operationalCosts: {
          ...prev.operationalCosts,
          workforce: Math.round(predictiveData.operationalCosts[0] * 0.6),
          webDevelopment: Math.round(predictiveData.operationalCosts[0] * 0.3),
          warehouseLogistics: Math.round(predictiveData.operationalCosts[0] * 0.1)
        }
      }));

      setHasAppliedPredictions(true);
      setShowPredictions(false);
    }
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
  
  const filledFieldsCount = [
    ...Object.values(roiData.marketingCosts).map(arr => arr.reduce((a, b) => a + b, 0)),
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
          <div className="mb-6">
            <BackButton onBack={onBack} />
          </div>
          
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
              
              {/* Predictive AI Section */}
              {showPredictions && predictiveData && (
                <div className="p-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-primary/20 text-left">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <Brain className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2 flex items-center">
                        AI Inteligentní předvyplnění
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {Math.round(predictiveData.confidence * 100)}% přesnost
                        </Badge>
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Na základě vaší Vision a Ideation fáze jsme připravili inteligentní návrh finančního plánu 
                        pro {predictiveData.industry === 'saas' ? 'SaaS business' : 
                             predictiveData.industry === 'ecommerce' ? 'e-commerce' :
                             predictiveData.industry === 'services' ? 'služby' :
                             predictiveData.industry === 'marketplace' ? 'marketplace' : 'váš business'}.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-sm">
                        <div className="bg-background/60 rounded-lg p-3">
                          <div className="font-medium">Roční příjmy</div>
                          <div className="text-lg font-bold text-primary">
                            {predictiveData.totalYearlyRevenue.toLocaleString()} Kč
                          </div>
                        </div>
                        <div className="bg-background/60 rounded-lg p-3">
                          <div className="font-medium">Doporučený PNO</div>
                          <div className="text-lg font-bold text-green-600">
                            {predictiveData.recommendedPNO.toLocaleString()} Kč
                          </div>
                        </div>
                        <div className="bg-background/60 rounded-lg p-3">
                          <div className="font-medium">Typ businessu</div>
                          <div className="text-lg font-bold text-blue-600 capitalize">
                            {predictiveData.industry}
                          </div>
                        </div>
                      </div>

                      {predictiveData.suggestions && predictiveData.suggestions.length > 0 && (
                        <div className="mb-4">
                          <div className="font-medium mb-2 text-sm">💡 AI doporučení:</div>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {predictiveData.suggestions.slice(0, 2).map((suggestion: string, i: number) => (
                              <li key={i} className="flex items-start">
                                <span className="w-1 h-1 bg-primary rounded-full mr-2 mt-2"></span>
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="flex gap-3">
                        <Button onClick={applyPredictiveData} size="sm" className="flex items-center">
                          <Wand2 className="w-4 h-4 mr-2" />
                          Použít AI návrh
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setShowPredictions(false)}>
                          Vyplnit ručně
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isPreFilled && !hasAppliedPredictions && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Některá pole byla předvyplněna z vašeho Lean Canvas. Můžete je upravit podle potřeby.
                  </AlertDescription>
                </Alert>
              )}

              {hasAppliedPredictions && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Data byla úspěšně předvyplněna AI analýzou. Můžete je dále upravovat podle potřeby.
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
        <div className="mb-6">
          <BackButton onBack={onBack} />
        </div>
        
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
              
              <div className="space-y-6">
                {marketingFields.map((field) => (
                  <div key={field.key} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">{field.label}</Label>
                        <p className="text-xs text-muted-foreground">{field.hint}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          placeholder="Konstantní hodnota"
                          className="w-32"
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            if (value > 0) {
                              setAllMonthsMarketingCost(field.key as keyof ROICalculatorData['marketingCosts'], value);
                            }
                          }}
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setAllMonthsMarketingCost(field.key as keyof ROICalculatorData['marketingCosts'], 0)}
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2">
                      {roiData.marketingCosts[field.key as keyof typeof roiData.marketingCosts].map((cost, monthIndex) => (
                        <div key={monthIndex} className="space-y-1">
                          <Label className="text-xs text-muted-foreground text-center block">
                            {monthNames[monthIndex]}
                          </Label>
                          <Input
                            type="number"
                            value={cost}
                            onChange={(e) => updateMarketingCost(
                              field.key as keyof ROICalculatorData['marketingCosts'],
                              monthIndex,
                              parseInt(e.target.value) || 0
                            )}
                            className="text-center text-sm"
                            min="0"
                          />
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-xs text-muted-foreground text-center">
                      Celkem za rok: {roiData.marketingCosts[field.key as keyof typeof roiData.marketingCosts].reduce((sum, cost) => sum + cost, 0).toLocaleString()} Kč
                    </div>
                  </div>
                ))}
                
                <div className="bg-accent/10 p-4 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">💡 Rychlé akce:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        marketingFields.forEach(field => {
                          const constantValue = roiData.marketingCosts[field.key as keyof typeof roiData.marketingCosts][0];
                          setAllMonthsMarketingCost(field.key as keyof ROICalculatorData['marketingCosts'], constantValue);
                        });
                      }}
                    >
                      Konstantní hodnoty
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        marketingFields.forEach(field => {
                          const baseValue = roiData.marketingCosts[field.key as keyof typeof roiData.marketingCosts][0];
                          const newValues = Array.from({length: 12}, (_, i) => Math.round(baseValue * (1 + i * 0.1)));
                          setRoiData(prev => ({
                            ...prev,
                            marketingCosts: {
                              ...prev.marketingCosts,
                              [field.key]: newValues
                            }
                          }));
                        });
                      }}
                    >
                      Postupný nárůst
                    </Button>
                  </div>
                </div>
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

            {/* Revenue & Taxes */}
            <Card className="card-apple p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-primary" />
                Výnosy a daně
              </h2>
              <div className="space-y-4">
                {/* Startup plan summary */}
                <div className="bg-accent/10 p-4 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Založeno na plánu spuštění:</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>• Průměrně {Math.round(roiData.startupPlan.monthlyOrders.reduce((sum, orders) => sum + orders, 0) / 12)} objednávek/měsíc</div>
                    <div>• Spuštění v {monthNames[roiData.startupPlan.launchMonth]}</div>
                    <div>• Růst z {roiData.startupPlan.monthlyOrders[0]} na {roiData.startupPlan.monthlyOrders[11]} objednávek za rok</div>
                  </div>
                </div>

                <div className="space-y-4">
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
                    <p className="text-xs text-muted-foreground">
                      Počet objednávek se automaticky bere z plánu spuštění výše
                    </p>
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
          </div>
          
          {/* Right Column - Results & Analysis */}
          <div className="space-y-6">
            {/* Key Metrics */}
            <Card className="card-apple p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Klíčové ukazatele</h2>
              
              {/* Relativní ukazatele */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Relativní ukazatele</h3>
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
              </div>
              
              {/* Absolutní částky */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Absolutní částky (12 měsíců)</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-500/5 rounded-lg border border-green-500/20">
                    <div className="text-2xl font-bold text-green-600">
                      {(analysis.totalProfit / 1000).toFixed(0)}k Kč
                    </div>
                    <div className="text-sm text-muted-foreground">Celkový zisk</div>
                  </div>
                  
                  <div className="text-center p-4 bg-red-500/5 rounded-lg border border-red-500/20">
                    <div className="text-2xl font-bold text-red-600">
                      {(analysis.totalCosts / 1000).toFixed(0)}k Kč
                    </div>
                    <div className="text-sm text-muted-foreground">Celkové náklady</div>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
                    <div className="text-2xl font-bold text-blue-600">
                      {(analysis.totalRevenue / 1000).toFixed(0)}k Kč
                    </div>
                    <div className="text-sm text-muted-foreground">Celkový obrat</div>
                  </div>
                </div>
              </div>
              
              {/* Dodatečné metriky */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-accent/10 rounded-lg">
                  <div className="text-lg font-semibold text-foreground">
                    {(analysis.averageMonthlyProfit / 1000).toFixed(1)}k Kč
                  </div>
                  <div className="text-xs text-muted-foreground">Průměrný měsíční zisk</div>
                </div>
                
                <div className="text-center p-3 bg-accent/10 rounded-lg">
                  <div className="text-lg font-semibold text-foreground">
                    {analysis.profitMargin.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Marže</div>
                </div>
              </div>
              
              <div className="mt-4 p-3 rounded-lg border">
                <div className="text-sm text-muted-foreground mb-1">Doporučená PNO (marketing vs. marže)</div>
                <div className="flex items-center space-x-2">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: '60%' }}
                    ></div>
                  </div>
                  <span className="text-sm text-muted-foreground">40-60%</span>
                </div>
              </div>
            </Card>
            
            {/* Chart with Break-even */}
            <Card className="card-apple p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                  {chartViewMode === 'monthly' ? 'Měsíční cash flow' : 'Kumulativní vývoj návratnosti'}
                </h2>
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-muted-foreground">Zobrazení:</label>
                  <select 
                    value={chartViewMode} 
                    onChange={(e) => setChartViewMode(e.target.value as 'monthly' | 'cumulative')}
                    className="px-3 py-1 bg-background border border-border rounded-md text-sm"
                  >
                    <option value="monthly">Měsíčně</option>
                    <option value="cumulative">Kumulativně</option>
                  </select>
                </div>
              </div>
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
                    
                    {/* Break-even line - only show for cumulative view */}
                    {breakEvenPoint && chartViewMode === 'cumulative' && (
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

                    {/* Profit zones - only show for cumulative view */}
                    {chartViewMode === 'cumulative' && (
                      <>
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
                      </>
                    )}
                    
                    <Tooltip 
                      formatter={(value: number, name: string, props: any) => {
                        const labels = {
                          revenue: chartViewMode === 'monthly' ? 'Měsíční příjmy' : 'Kumulativní příjmy',
                          costs: chartViewMode === 'monthly' ? 'Měsíční náklady' : 'Kumulativní náklady', 
                          profit: chartViewMode === 'monthly' ? 'Měsíční zisk' : 'Kumulativní zisk'
                        };
                        const formattedValue = `${value.toLocaleString()} Kč`;
                        
                        if (name === 'profit' && props.payload.isBreakEven && chartViewMode === 'cumulative') {
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
                          revenue: chartViewMode === 'monthly' ? 'Měsíční příjmy' : 'Kumulativní příjmy',
                          costs: chartViewMode === 'monthly' ? 'Měsíční náklady' : 'Kumulativní náklady', 
                          profit: chartViewMode === 'monthly' ? 'Měsíční zisk' : 'Kumulativní zisk'
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
