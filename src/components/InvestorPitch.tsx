import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Bar, BarChart } from "recharts";
import { BackButton } from "@/components/ui/back-button";
import { 
  Download, 
  FileText, 
  TrendingUp, 
  Target, 
  DollarSign, 
  Users, 
  Lightbulb,
  Brain,
  Eye,
  CheckCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  Mail
} from "lucide-react";

interface InvestorPitchProps {
  onBack: () => void;
}

// Data interfaces from all phases
interface VisionPhaseData {
  projectData: {
    name: string;
    slogan: string;
  };
  errcData: {
    eliminate: string[];
    reduce: string[];
    raise: string[];
    create: string[];
  };
  visionStatement: string;
  analysis: string;
}

interface IdeationPhaseData {
  leanCanvasData: {
    problem: string;
    solution: string;
    uniqueValueProposition: string;
    customerSegments: string;
    existingAlternatives: string;
    channels: string;
    costStructure: string;
    revenueStreams: string;
  };
  analysis: {
    isViable: boolean;
    reasoning: string;
    strengths: string[];
    weaknesses: string[];
    risks: string[];
    recommendations: string[];
  };
}

interface StrategyPhaseData {
  roiData: {
    marketingCosts: any;
    operationalCosts: any;
    revenue: {
      productPrice: number;
      monthlyOrders: number;
    };
    taxes: {
      incomeTaxRate: number;
      growthReserveRate: number;
    };
  };
  analysis: {
    roi: number;
    pno: number;
    breakEvenMonth: number;
    isViable: boolean;
    reasoning: string;
    recommendations: string[];
  };
}

interface PitchData {
  vision: VisionPhaseData | null;
  ideation: IdeationPhaseData | null;
  strategy: StrategyPhaseData | null;
}

interface GeneratedPitch {
  executiveSummary: string;
  marketOpportunity: string;
  businessModel: string;
  competitiveAdvantage: string;
  financialProjections: string;
  investmentAsk: string;
  useOfFunds: string;
  risksAndMitigation: string;
}

const loadPhaseData = (): PitchData => {
  const loadFromStorage = (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn(`Failed to load ${key}:`, error);
      return null;
    }
  };

  return {
    vision: {
      projectData: loadFromStorage("vision_project_data") || { name: "", slogan: "" },
      errcData: loadFromStorage("vision_errc_data") || { eliminate: [], reduce: [], raise: [], create: [] },
      visionStatement: loadFromStorage("vision_statement") || "",
      analysis: loadFromStorage("vision_analysis") || ""
    },
    ideation: {
      leanCanvasData: loadFromStorage("ideation_lean_canvas") || {},
      analysis: loadFromStorage("ideation_analysis") || null
    },
    strategy: {
      roiData: loadFromStorage("strategy_roi_data") || {},
      analysis: loadFromStorage("strategy_analysis") || null
    }
  };
};

const generateAIPitch = async (data: PitchData): Promise<GeneratedPitch> => {
  // Simulate AI processing
  await new Promise(resolve => setTimeout(resolve, 2000));

  const { vision, ideation, strategy } = data;
  const projectName = vision?.projectData?.name || "Váš projekt";
  const slogan = vision?.projectData?.slogan || "";
  
  return {
    executiveSummary: `${projectName} ${slogan ? `- ${slogan}` : ""} představuje inovativní řešení, které kombinuje ${vision?.errcData?.create?.filter(Boolean).join(", ") || "nové technologie"} s jasně definovaným cílovým segmentem. Náš projekt eliminuje tradiční problémy v odvětví a vytváří nové hodnoty pro zákazníky.

Klíčové výhody:
• ${vision?.errcData?.raise?.filter(Boolean).join("\n• ") || "Vylepšené služby"}
• ${vision?.errcData?.create?.filter(Boolean).join("\n• ") || "Inovativní přístup"}

Cílíme na ${ideation?.leanCanvasData?.customerSegments || "definovaný segment zákazníků"} s jasnou hodnotovou propozicí: ${ideation?.leanCanvasData?.uniqueValueProposition || "unikátní řešení"}`,

    marketOpportunity: `${ideation?.leanCanvasData?.problem || "Identifikovaný problém"} 

Aktuální trh: ${ideation?.leanCanvasData?.existingAlternatives || "Existující alternativy"}

Naše příležitost spočívá v tom, že současná řešení ${vision?.errcData?.eliminate?.filter(Boolean).join(", ") || "mají nedostatky"}, zatímco my ${vision?.errcData?.create?.filter(Boolean).join(", ") || "vytváříme nové hodnoty"}.

Velikost trhu a růstový potenciál ukazují na významnou příležitost pro rychlé získání tržního podílu.`,

    businessModel: `Revenue Streams:
${ideation?.leanCanvasData?.revenueStreams || "Hlavní zdroje příjmů"}

Cena produktu: ${strategy?.roiData?.revenue?.productPrice ? `${strategy.roiData.revenue.productPrice.toLocaleString()} Kč` : "TBD"}
Očekávané měsíční objednávky: ${strategy?.roiData?.revenue?.monthlyOrders || "TBD"}

Cost Structure:
${ideation?.leanCanvasData?.costStructure || "Struktura nákladů"}

Distribuce: ${ideation?.leanCanvasData?.channels || "Marketingové kanály"}`,

    competitiveAdvantage: `Naše konkurenční výhoda vychází z Blue Ocean Strategy:

ELIMINACE:
• ${vision?.errcData?.eliminate?.filter(Boolean).join("\n• ") || "Tradičních problémů"}

REDUKCE:
• ${vision?.errcData?.reduce?.filter(Boolean).join("\n• ") || "Nákladů a komplexity"}

POZVÝŠENÍ:
• ${vision?.errcData?.raise?.filter(Boolean).join("\n• ") || "Kvality služeb"}

VYTVOŘENÍ:
• ${vision?.errcData?.create?.filter(Boolean).join("\n• ") || "Nových hodnot"}

Tato strategie nám umožňuje vytvořit "modrý oceán" - volný tržní prostor bez přímé konkurence.`,

    financialProjections: `${strategy?.analysis ? `
ROI: ${strategy.analysis.roi}%
Break-even: ${strategy.analysis.breakEvenMonth}. měsíc
Čistý zisk (roční): ${strategy.analysis.pno ? strategy.analysis.pno.toLocaleString() : "TBD"} Kč

${strategy.analysis.isViable ? "✅ Projekt je finančně životaschopný" : "⚠️ Projekt vyžaduje optimalizaci"}

${strategy.analysis.reasoning}
` : "Finanční projekce budou doplněny na základě ROI kalkulátoru."}`,

    investmentAsk: `Na základě analýzy nákladové struktury a growth plánu požadujeme investici ve výši ${strategy?.roiData ? Math.round((strategy.roiData.revenue.productPrice * strategy.roiData.revenue.monthlyOrders * 6) / 10000) * 10000 : 500000} Kč.

Tato částka pokryje:
• 6-12 měsíců provozu
• Marketing a customer acquisition
• Tým a development
• Working capital

Investoři získají equity stake dle vyjednání a podíl na ROI ${strategy?.analysis?.roi || "TBD"}%.`,

    useOfFunds: `Použití investice:

🎯 Marketing & Sales (40%)
• PPC kampaně a online marketing
• Influencer partnerships
• Content marketing

👥 Tým (30%)
• Klíčoví zaměstnanci
• External specialisté
• Training a development

💻 Technologie (20%)
• Product development
• IT infrastruktura
• Software licences

💰 Working Capital (10%)
• Provozní rezervy
• Unexpected opportunities
• Legal a administrative`,

    risksAndMitigation: `Hlavní rizika a jejich řešení:

${ideation?.analysis?.risks?.map(risk => `⚠️ ${risk}`).join("\n") || ""}

Mitigation strategie:
${ideation?.analysis?.recommendations?.map(rec => `✅ ${rec}`).join("\n") || ""}

${strategy?.analysis?.recommendations?.map(rec => `📈 ${rec}`).join("\n") || ""}

Backup plány jsou připraveny pro všechny kritické oblasti byznysu.`
  };
};

export const InvestorPitch = ({ onBack }: InvestorPitchProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pitchData, setPitchData] = useState<PitchData | null>(null);
  const [generatedPitch, setGeneratedPitch] = useState<GeneratedPitch | null>(null);
  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    const data = loadPhaseData();
    setPitchData(data);
  }, []);

  const handleGeneratePitch = async () => {
    if (!pitchData) return;
    
    setIsGenerating(true);
    try {
      const pitch = await generateAIPitch(pitchData);
      setGeneratedPitch(pitch);
    } catch (error) {
      console.error("Error generating pitch:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPDF = () => {
    if (!generatedPitch || !pitchData) return;

    const pitchContent = `
INVESTOR PITCH DECK
${pitchData.vision?.projectData?.name || "Váš projekt"}
${pitchData.vision?.projectData?.slogan || ""}

=================================

1. EXECUTIVE SUMMARY
${generatedPitch.executiveSummary}

2. MARKET OPPORTUNITY  
${generatedPitch.marketOpportunity}

3. BUSINESS MODEL
${generatedPitch.businessModel}

4. COMPETITIVE ADVANTAGE
${generatedPitch.competitiveAdvantage}

5. FINANCIAL PROJECTIONS
${generatedPitch.financialProjections}

6. INVESTMENT ASK
${generatedPitch.investmentAsk}

7. USE OF FUNDS
${generatedPitch.useOfFunds}

8. RISKS & MITIGATION
${generatedPitch.risksAndMitigation}

=================================

Vygenerováno pomocí VISIBLE7 Platform
${new Date().toLocaleDateString()}
    `.trim();

    const blob = new Blob([pitchContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `InvestorPitch-${pitchData.vision?.projectData?.name || 'Project'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const sections = [
    { title: "Executive Summary", icon: FileText, content: generatedPitch?.executiveSummary },
    { title: "Market Opportunity", icon: Target, content: generatedPitch?.marketOpportunity },
    { title: "Business Model", icon: TrendingUp, content: generatedPitch?.businessModel },
    { title: "Competitive Advantage", icon: Lightbulb, content: generatedPitch?.competitiveAdvantage },
    { title: "Financial Projections", icon: DollarSign, content: generatedPitch?.financialProjections },
    { title: "Investment Ask", icon: Users, content: generatedPitch?.investmentAsk },
    { title: "Use of Funds", icon: Target, content: generatedPitch?.useOfFunds },
    { title: "Risks & Mitigation", icon: AlertTriangle, content: generatedPitch?.risksAndMitigation }
  ];

  const getDataCompleteness = () => {
    if (!pitchData) return 0;
    
    let score = 0;
    if (pitchData.vision?.projectData?.name) score += 2;
    if (pitchData.vision?.visionStatement) score += 2;
    if (pitchData.vision?.errcData?.create?.some(Boolean)) score += 2;
    if (pitchData.ideation?.leanCanvasData?.problem) score += 2;
    if (pitchData.ideation?.analysis?.isViable) score += 1;
    if (pitchData.strategy?.analysis?.roi) score += 1;
    
    return Math.round((score / 10) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <BackButton onBack={onBack} />
        </div>

        <div className="space-y-6">
          {/* Header */}
          <Card className="card-apple p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Investor Pitch Deck</h1>
                <p className="text-muted-foreground">
                  Automaticky generovaný investor pitch na základě vašich dat ze všech fází
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground mb-1">Kompletnost dat</div>
                <Badge variant={getDataCompleteness() >= 80 ? "default" : "secondary"}>
                  {getDataCompleteness()}%
                </Badge>
              </div>
            </div>
          </Card>

          {/* Data Overview */}
          <Card className="card-apple p-6">
            <h2 className="text-xl font-semibold mb-4">Přehled dat z fází</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center mb-2">
                  <Eye className="w-4 h-4 mr-2 text-primary" />
                  <span className="font-medium">Vision Phase</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div>Projekt: {pitchData?.vision?.projectData?.name || "Nedefinováno"}</div>
                  <div>ERRC: {pitchData?.vision?.errcData ? "✅" : "❌"}</div>
                  <div>Vision: {pitchData?.vision?.visionStatement ? "✅" : "❌"}</div>
                </div>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center mb-2">
                  <Lightbulb className="w-4 h-4 mr-2 text-primary" />
                  <span className="font-medium">Ideation Phase</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div>Lean Canvas: {pitchData?.ideation?.leanCanvasData?.problem ? "✅" : "❌"}</div>
                  <div>AI analýza: {pitchData?.ideation?.analysis ? "✅" : "❌"}</div>
                  <div>Viabilita: {pitchData?.ideation?.analysis?.isViable ? "✅" : "❌"}</div>
                </div>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center mb-2">
                  <TrendingUp className="w-4 h-4 mr-2 text-primary" />
                  <span className="font-medium">Strategy Phase</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div>ROI data: {pitchData?.strategy?.roiData ? "✅" : "❌"}</div>
                  <div>Break-even: {pitchData?.strategy?.analysis?.breakEvenMonth ? `${pitchData.strategy.analysis.breakEvenMonth}M` : "❌"}</div>
                  <div>ROI: {pitchData?.strategy?.analysis?.roi ? `${pitchData.strategy.analysis.roi}%` : "❌"}</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Generation Controls */}
          {!generatedPitch && (
            <Card className="card-apple p-6">
              <div className="text-center space-y-4">
                <Brain className="w-16 h-16 text-primary mx-auto" />
                <h2 className="text-xl font-semibold">Připraveno k generování</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  AI nyní zpracuje všechna vaše data a vytvoří profesionální investor pitch deck. 
                  Proces trvá přibližně 30 sekund.
                </p>
                
                {getDataCompleteness() < 60 && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Pro nejlepší výsledky doporučujeme dokončit alespoň 60% dat ze všech fází. 
                      Aktuální kompletnost: {getDataCompleteness()}%
                    </AlertDescription>
                  </Alert>
                )}
                
                <Button 
                  onClick={handleGeneratePitch}
                  disabled={isGenerating}
                  className="btn-apple px-8 py-3"
                >
                  {isGenerating ? (
                    <>
                      <Brain className="w-4 h-4 mr-2 animate-spin" />
                      Generuji pitch...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Vygenerovat Investor Pitch
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* Generated Pitch */}
          {generatedPitch && (
            <>
              {/* Navigation */}
              <Card className="card-apple p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {sections.map((section, index) => (
                      <Button
                        key={index}
                        variant={currentSection === index ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentSection(index)}
                        className="text-xs"
                      >
                        <section.icon className="w-3 h-3 mr-1" />
                        {section.title}
                      </Button>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleExportPDF} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Current Section Content */}
              <Card className="card-apple p-8">
                <div className="flex items-center mb-6">
                  {React.createElement(sections[currentSection].icon, { 
                    className: "w-6 h-6 mr-3 text-primary" 
                  })}
                  <h2 className="text-2xl font-bold">{sections[currentSection].title}</h2>
                </div>
                
                <div className="prose prose-lg max-w-none">
                  <div className="whitespace-pre-line text-muted-foreground leading-relaxed">
                    {sections[currentSection].content}
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                    disabled={currentSection === 0}
                  >
                    Předchozí
                  </Button>
                  <Button 
                    onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
                    disabled={currentSection === sections.length - 1}
                  >
                    Další
                  </Button>
                </div>
              </Card>

              {/* Summary Card */}
              <Card className="card-apple p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Pitch dokončen!</h3>
                    <p className="text-muted-foreground">
                      Váš investor pitch je připraven k prezentaci nebo odeslání investorům.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <span className="text-sm font-medium text-green-600">Hotovo</span>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};