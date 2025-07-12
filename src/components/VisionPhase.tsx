import React, { useState, useEffect } from "react";
import { usePersistedState } from "@/hooks/usePersistedState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { 
  ArrowLeft, 
  ArrowRight, 
  Eye, 
  Lightbulb, 
  FileText, 
  Sparkles,
  Download,
  Play,
  Info,
  Plus,
  Minus,
  TrendingUp,
  Target,
  VideoIcon,
  BookOpen,
  ExternalLink
} from "lucide-react";

interface VisionPhaseProps {
  onComplete: () => void;
  onBack: () => void;
}

interface ProjectData {
  name: string;
  slogan: string;
}

interface ERRCData {
  eliminate: string[];
  reduce: string[];
  raise: string[];
  create: string[];
}

interface ValueCurveAttribute {
  name: string;
  lowCost: number;
  premium: number;
  myProject: number;
  type?: string;
  color?: string;
}

const defaultAttributes: ValueCurveAttribute[] = [
  { name: "Cena", lowCost: 90, premium: 20, myProject: 60 },
  { name: "Kvalita", lowCost: 30, premium: 90, myProject: 75 },
  { name: "Důvěra", lowCost: 20, premium: 80, myProject: 85 },
  { name: "Masovost", lowCost: 90, premium: 30, myProject: 40 },
  { name: "Rychlost", lowCost: 40, premium: 60, myProject: 90 },
  { name: "Přizpůsobení", lowCost: 10, premium: 70, myProject: 95 }
];

const errcTemplate = {
  eliminate: ["Vysoké režijní náklady", "Složité procesy"],
  reduce: ["Čas dodání", "Administrativu"],
  raise: ["Kvalita služeb", "Zákaznický servis", "Personalizace"],
  create: ["Unikátní metodiku", "Komunitní přístup", "AI analýzy"]
};

export const VisionPhase = ({ onComplete, onBack }: VisionPhaseProps) => {
  // Debug cache busting - Vision v2.1 with color coding
  const VISION_VERSION = "VisionPhase_v2.1_ColorCoding_" + Date.now();
  
  useEffect(() => {
    console.log("🎯 VisionPhase Loading - Version:", VISION_VERSION);
    console.log("🎨 Color coding for ERRC attributes is ACTIVE");
    console.log("📊 Value curve with colored attributes enabled");
  }, []);

  const [showIntro, setShowIntro] = useState(true);
  
  // Form data - persisted in localStorage
  const [projectData, setProjectData] = usePersistedState<ProjectData>("vision_project_data", { name: "", slogan: "" });
  const [errcData, setERRCData] = usePersistedState<ERRCData>("vision_errc_data", {
    eliminate: ["", ""],
    reduce: ["", ""],
    raise: ["", ""],
    create: ["", ""]
  });
  const [valueCurve, setValueCurve] = usePersistedState<ValueCurveAttribute[]>("vision_value_curve", defaultAttributes);
  const [visionStatement, setVisionStatement] = usePersistedState<string>("vision_statement", "");
  
  // AI Analysis - persisted in localStorage
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [analysis, setAnalysis] = usePersistedState<string | null>("vision_analysis", null);
  const [canProceed, setCanProceed] = useState(false);

  const sections = [
    { id: "basic", title: "Základní informace", icon: FileText, completed: () => projectData.name.trim() && projectData.slogan.trim() },
    { id: "errc", title: "ERRC Matice", icon: Target, completed: () => Object.values(errcData).every(arr => arr.some(item => item.trim())) },
    { id: "curve", title: "Hodnotová křivka", icon: TrendingUp, completed: () => true },
    { id: "vision", title: "Vision Statement", icon: Eye, completed: () => visionStatement.trim().length > 0 },
    { id: "analysis", title: "AI Validace", icon: Sparkles, completed: () => analysis !== null }
  ];

  const updateERRCItem = (category: keyof ERRCData, index: number, value: string) => {
    setERRCData(prev => ({
      ...prev,
      [category]: prev[category].map((item, i) => i === index ? value : item)
    }));
  };

  const addERRCItem = (category: keyof ERRCData) => {
    setERRCData(prev => ({
      ...prev,
      [category]: [...prev[category], ""]
    }));
  };

  const removeERRCItem = (category: keyof ERRCData, index: number) => {
    setERRCData(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
  };

  // ERRC to Value Curve conversion
  const generateValueCurveFromERRC = () => {
    console.log("🔄 Generating value curve with ERRC color coding");
    const errcAttributes = [];
    
    // Add attributes from ERRC matrix in order: Eliminate → Reduce → Raise → Create
    errcData.eliminate.filter(item => item.trim()).forEach(item => {
      errcAttributes.push({
        name: item,
        lowCost: 50,
        premium: 50,
        myProject: 50,
        type: 'eliminate',
        color: '#ef4444' // red
      });
    });
    
    errcData.reduce.filter(item => item.trim()).forEach(item => {
      errcAttributes.push({
        name: item,
        lowCost: 50,
        premium: 50,
        myProject: 50,
        type: 'reduce',
        color: '#f97316' // orange
      });
    });
    
    errcData.raise.filter(item => item.trim()).forEach(item => {
      errcAttributes.push({
        name: item,
        lowCost: 50,
        premium: 50,
        myProject: 50,
        type: 'raise',
        color: '#3b82f6' // blue
      });
    });
    
    errcData.create.filter(item => item.trim()).forEach(item => {
      errcAttributes.push({
        name: item,
        lowCost: 50,
        premium: 50,
        myProject: 50,
        type: 'create',
        color: '#10b981' // green
      });
    });
    
    return errcAttributes;
  };

  // Generate ERRC attributes and update value curve
  const generateERRCAttributes = () => {
    console.log("🎯 Manual ERRC attribute generation triggered");
    const errcAttributes = generateValueCurveFromERRC();
    console.log("🔍 Generated ERRC attributes:", errcAttributes);
    
    if (errcAttributes.length > 0) {
      console.log("✅ Updating value curve with ERRC attributes");
      setValueCurve(prev => {
        // Always preserve "Cena" as first attribute
        const cenaAttribute = prev.find(attr => attr.name === "Cena") || {
          name: "Cena",
          lowCost: 90,
          premium: 20,
          myProject: 60
        };
        
        // Preserve existing values for matching ERRC attributes
        const updatedERRCAttributes = errcAttributes.map(newAttr => {
          const existingAttr = prev.find(attr => attr.name === newAttr.name);
          if (existingAttr) {
            return { ...newAttr, lowCost: existingAttr.lowCost, premium: existingAttr.premium, myProject: existingAttr.myProject };
          }
          return newAttr;
        });
        
        // Return array with Cena first, followed by ERRC attributes
        const newValueCurve = [cenaAttribute, ...updatedERRCAttributes];
        console.log("📊 New value curve:", newValueCurve);
        return newValueCurve;
      });
    } else {
      console.log("⚠️ No ERRC attributes generated - ERRC data might be empty");
    }
  };

  // Update value curve when ERRC data changes
  React.useEffect(() => {
    console.log("🔄 ERRC data changed, updating value curve...");
    console.log("📝 Current ERRC data:", errcData);
    generateERRCAttributes();
  }, [errcData]);

  const updateValueCurve = (attributeIndex: number, type: 'lowCost' | 'premium' | 'myProject', value: number) => {
    setValueCurve(prev => prev.map((attr, i) => 
      i === attributeIndex ? { ...attr, [type]: value } : attr
    ));
  };

  const updateAttributeName = (attributeIndex: number, newName: string) => {
    setValueCurve(prev => prev.map((attr, i) => 
      i === attributeIndex ? { ...attr, name: newName } : attr
    ));
  };

  const addCustomAttribute = () => {
    if (valueCurve.length < 10) {
      setValueCurve(prev => [...prev, { 
        name: `Nový atribut ${valueCurve.length + 1}`, 
        lowCost: 50, 
        premium: 50, 
        myProject: 50 
      }]);
    }
  };

  const removeCustomAttribute = (attributeIndex: number) => {
    if (attributeIndex >= 0 && valueCurve.length > 1) {
      setValueCurve(prev => prev.filter((_, i) => i !== attributeIndex));
    }
  };

  const getCompletionProgress = () => {
    const completedCount = sections.filter(section => section.completed()).length;
    return (completedCount / sections.length) * 100;
  };

  const canGenerateAnalysis = () => {
    return sections.slice(0, 4).every(section => section.completed());
  };

  const allDataComplete = () => {
    return sections.every(section => section.completed());
  };

  const generateAnalysis = async () => {
    if (!canGenerateAnalysis()) return;
    
    setIsGeneratingAnalysis(true);
    
    // Simulace AI analýzy (zde by byla integrace s OpenAI)
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const mockAnalysis = `
**Blue Ocean Strategy Analýza - ${projectData.name}**

🎯 **Hodnocení vaší vize:**
${projectData.slogan ? `"${projectData.slogan}" - silný a jasný slogan, který komunikuje hodnotu.` : ""}

📊 **ERRC Matice hodnocení:**
• **Eliminace**: ${errcData.eliminate.filter(Boolean).length}/2 definováno - ${errcData.eliminate.filter(Boolean).length >= 1 ? '✅ Dobře identifikováno' : '⚠️ Potřebuje doplnění'}
• **Redukce**: ${errcData.reduce.filter(Boolean).length}/2 definováno - ${errcData.reduce.filter(Boolean).length >= 1 ? '✅ Jasné úspory' : '⚠️ Potřebuje doplnění'}  
• **Pozvýšení**: ${errcData.raise.filter(Boolean).length}/2 definováno - ${errcData.raise.filter(Boolean).length >= 1 ? '✅ Konkurenční výhoda' : '⚠️ Potřebuje doplnění'}
• **Vytvoření**: ${errcData.create.filter(Boolean).length}/2 definováno - ${errcData.create.filter(Boolean).length >= 1 ? '✅ Inovativní přístup' : '⚠️ Potřebuje doplnění'}

🌊 **Blue Ocean potenciál:**
${getBlueOceanScore()}/10 - ${getBlueOceanScore() >= 7 ? 'Vysoký potenciál pro modré oceán!' : getBlueOceanScore() >= 5 ? 'Střední potenciál, optimalizujte strategii' : 'Nízký potenciál, přepracujte koncept'}

💡 **Doporučení:**
${getRecommendations()}

📈 **Váš Vision Score: ${getVisionScore()}/10**

${getVisionScore() >= 7 ? '🎉 Vaše vize má silný potenciál! Můžete pokračovat k další fázi Ideation.' : '⚠️ Doporučujeme vylepšit vizi před pokračováním do další fáze.'}
    `;
    
    setAnalysis(mockAnalysis.trim());
    setCanProceed(getVisionScore() >= 7);
    setIsGeneratingAnalysis(false);
  };

  const getBlueOceanScore = () => {
    const uniquePositions = valueCurve.filter(attr => 
      Math.abs(attr.myProject - attr.lowCost) > 20 && 
      Math.abs(attr.myProject - attr.premium) > 20
    ).length;
    return Math.round((uniquePositions / valueCurve.length) * 10);
  };

  const getVisionScore = () => {
    let score = 0;
    if (projectData.name.trim()) score += 1;
    if (projectData.slogan.trim()) score += 1;
    if (errcData.eliminate.filter(Boolean).length >= 1) score += 2;
    if (errcData.reduce.filter(Boolean).length >= 1) score += 1;
    if (errcData.raise.filter(Boolean).length >= 1) score += 1;
    if (errcData.create.filter(Boolean).length >= 1) score += 2;
    if (visionStatement.trim().length > 50) score += 2;
    return score;
  };

  const getRecommendations = () => {
    const recommendations = [];
    if (!projectData.name.trim()) recommendations.push("• Definujte jasný název projektu");
    if (!projectData.slogan.trim()) recommendations.push("• Vytvořte výstižný slogan");
    if (errcData.eliminate.filter(Boolean).length === 0) recommendations.push("• Identifikujte co eliminovat z trhu");
    if (errcData.create.filter(Boolean).length === 0) recommendations.push("• Definujte inovativní prvky");
    if (visionStatement.length < 50) recommendations.push("• Rozšiřte vision statement (min. 50 znaků)");
    
    return recommendations.length > 0 ? recommendations.join("\n") : "• Vaše vize je dobře strukturovaná, pokračujte k implementaci";
  };

  const exportToPDF = () => {
    const dataStr = `VISIBLE7 - Vision Phase Results

Projekt: ${projectData.name}
Slogan: ${projectData.slogan}

ERRC Matice:
Eliminovat: ${errcData.eliminate.filter(Boolean).join(', ')}
Redukovat: ${errcData.reduce.filter(Boolean).join(', ')}
Pozvednout: ${errcData.raise.filter(Boolean).join(', ')}
Vytvořit: ${errcData.create.filter(Boolean).join(', ')}

Hodnotová křivka:
${valueCurve.map(attr => 
  `${attr.name}: Low-cost(${attr.lowCost}), Premium(${attr.premium}), Můj projekt(${attr.myProject})`
).join('\n')}

Vision Statement:
${visionStatement}

AI Analýza:
${analysis}`;
    
    const dataBlob = new Blob([dataStr], {type: 'text/plain'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VISIBLE7-Vision-${projectData.name || 'Project'}.txt`;
    link.click();
  };

  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <Card className="card-apple p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary mx-auto mb-6 flex items-center justify-center">
                <Eye className="w-8 h-8" />
              </div>
              
              <h1 className="text-apple-title mb-4">Fáze 1: Vision</h1>
              <h2 className="text-xl text-primary font-medium mb-6">Strategie modrého oceánu</h2>
            </div>

            {/* Video Section */}
            <div className="mb-8">
              <div className="relative bg-muted/50 rounded-xl p-8 mb-6">
                <div className="flex flex-col lg:flex-row items-center gap-6">
                  <div className="w-full lg:w-1/2">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
                      <div className="text-center">
                        <VideoIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">2minutové představení Vision fáze</p>
                        <p className="text-xs text-muted-foreground mt-1">(Video bude přidáno později)</p>
                      </div>
                    </div>
                  </div>
                  <div className="w-full lg:w-1/2 space-y-4 text-left">
                    <h3 className="text-lg font-semibold">Co se v této fázi naučíte?</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-primary rounded-full mr-3 mt-2"></span>
                        Blue Ocean Strategy - jak najít volný prostor na trhu
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-primary rounded-full mr-3 mt-2"></span>
                        ERRC matice - eliminace, redukce, pozvýšení a vytvoření hodnot
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-primary rounded-full mr-3 mt-2"></span>
                        Hodnotová křivka - positioning vůči konkurenci
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-primary rounded-full mr-3 mt-2"></span>
                        AI validace - ověření životaschopnosti vize
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Explanatory Text */}
            <div className="mb-8 text-left">
              <h3 className="text-lg font-semibold mb-4">Proč je Vision fáze klíčová?</h3>
              <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
                <p>
                  <strong className="text-foreground">Blue Ocean Strategy</strong> vám pomůže najít neobsazený prostor na trhu, 
                  kde můžete vytvořit novou poptávku místo konkurování v přeplněném "červeném oceánu". 
                  Tato metodika byla úspěšně použita společnostmi jako Cirque du Soleil, Netflix nebo Southwest Airlines.
                </p>
                
                <p>
                  <strong className="text-foreground">ERRC matice</strong> (Eliminate-Reduce-Raise-Create) je srdcem této strategie. 
                  Pomůže vám identifikovat co odstranit z trhu, co zlevnit, co vylepšit a co úplně nového vytvořit. 
                  Výsledkem je jedinečná hodnotová propozice, která vás odliší od konkurence.
                </p>
                
                <p>
                  <strong className="text-foreground">Hodnotová křivka</strong> graficky zobrazuje, jak se váš projekt liší od 
                  low-cost a premium konkurence napříč klíčovými atributy. Ideální křivka má jiný tvar než konkurence - 
                  to znamená, že nabízíte jinou kombinaci hodnot.
                </p>
                
                <p>
                  <strong className="text-foreground">AI validace</strong> na konci vyhodnotí kvalitu vaší vize a poskytne 
                  konkrétní doporučení pro zlepšení. Teprve s validovanou vizí můžete pokračovat do fáze Ideation.
                </p>
              </div>
            </div>

            {/* Supporting Materials */}
            <div className="mb-8 p-6 bg-muted/30 rounded-xl">
              <div className="flex items-center mb-4">
                <BookOpen className="w-5 h-5 text-primary mr-2" />
                <h3 className="text-lg font-semibold">Podpůrné materiály</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Stáhněte si pracovní šablony a metodické materiály pro lepší přípravu na Vision fázi.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button variant="outline" size="sm" className="justify-start h-auto p-3" disabled>
                  <FileText className="w-4 h-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium text-sm">Blue Ocean Strategy - Přehled</div>
                    <div className="text-xs text-muted-foreground">Základy metodiky a příklady</div>
                  </div>
                </Button>
                
                <Button variant="outline" size="sm" className="justify-start h-auto p-3" disabled>
                  <FileText className="w-4 h-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium text-sm">ERRC Matice - Worksheet</div>
                    <div className="text-xs text-muted-foreground">Prázdná šablona pro offline práci</div>
                  </div>
                </Button>
                
                <Button variant="outline" size="sm" className="justify-start h-auto p-3" disabled>
                  <FileText className="w-4 h-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium text-sm">Hodnotová křivka - Template</div>
                    <div className="text-xs text-muted-foreground">Graf a návod k analýze</div>
                  </div>
                </Button>
                
                <Button variant="outline" size="sm" className="justify-start h-auto p-3" disabled>
                  <FileText className="w-4 h-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium text-sm">Vision Statement - Šablona</div>
                    <div className="text-xs text-muted-foreground">Framework a inspirace</div>
                  </div>
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground mt-3 italic">
                💡 PDF materiály budou přidány později
              </p>
            </div>

            {/* Stats and CTA */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground mb-8">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                  5 kroků
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                  ~25 minut
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                  AI validace
                </div>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={() => setShowIntro(false)}
                  className="btn-apple w-full h-12 text-base"
                >
                  <Play className="mr-2 w-4 h-4" />
                  Začít s Vision
                </Button>
                
                <Button 
                  onClick={onBack}
                  variant="ghost"
                  className="w-full"
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Zpět na dashboard
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const renderBasicInfo = () => (
    <Card className="card-apple p-8 mb-8">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mr-3">
          <FileText className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Základní informace o projektu</h2>
          <p className="text-sm text-muted-foreground">Definujte název a slogan vašeho projektu</p>
        </div>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Pracovní název projektu *
          </label>
          <Input
            value={projectData.name}
            onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="např. BioDoggies"
            className="h-12 rounded-xl"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Slogan *
          </label>
          <Input
            value={projectData.slogan}
            onChange={(e) => setProjectData(prev => ({ ...prev, slogan: e.target.value }))}
            placeholder="např. Zdravé pamlsky pro psy bez chemie"
            className="h-12 rounded-xl"
          />
        </div>
      </div>
    </Card>
  );

  const renderERRCMatrix = () => (
    <Card className="card-apple p-8 mb-8">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mr-3">
          <Target className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold">ERRC Matice</h2>
          <p className="text-sm text-muted-foreground">Definujte čtyři klíčové oblasti vaší strategie</p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Eliminate-Reduce-Raise-Create matice pro Blue Ocean Strategy</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries({
          eliminate: { title: "Odstranit", color: "bg-red-50 border-red-200", desc: "Co odstraníte oproti trhu?" },
          reduce: { title: "Omezit", color: "bg-orange-50 border-orange-200", desc: "Co zlevníte nebo zjednodušíte?" },
          raise: { title: "Pozvednout", color: "bg-blue-50 border-blue-200", desc: "Co nabídnete víc než konkurence?" },
          create: { title: "Vytvořit", color: "bg-green-50 border-green-200", desc: "Co vytvoříte úplně nového?" }
        }).map(([key, config]) => (
          <div key={key} className={`p-4 rounded-xl border ${config.color}`}>
            <h3 className="font-semibold mb-1">{config.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{config.desc}</p>
            
            <div className="space-y-2">
              {errcData[key as keyof ERRCData].map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => updateERRCItem(key as keyof ERRCData, index, e.target.value)}
                    placeholder={`${config.title} ${index + 1}...`}
                    className="h-10 text-sm"
                  />
                  {errcData[key as keyof ERRCData].length > 2 && (
                    <Button
                      onClick={() => removeERRCItem(key as keyof ERRCData, index)}
                      variant="ghost"
                      size="sm"
                      className="px-2"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              {errcData[key as keyof ERRCData].length < 3 && (
                <Button
                  onClick={() => addERRCItem(key as keyof ERRCData)}
                  variant="ghost"
                  size="sm"
                  className="w-full h-8 text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Přidat
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  const renderValueCurve = () => {
    const chartData = valueCurve.map(attr => ({
      name: attr.name,
      "Low-cost": attr.lowCost === 0 ? null : attr.lowCost,
      "Premium": attr.premium === 0 ? null : attr.premium,
      "Můj projekt": attr.myProject === 0 ? null : attr.myProject,
      type: attr.type,
      color: attr.color
    }));

    const CustomXAxisTick = (props: any) => {
      const { x, y, payload } = props;
      const item = chartData.find(d => d.name === payload.value);
      const color = item?.color || '#64748b';
      
      return (
        <g transform={`translate(${x},${y})`}>
          <text 
            x={0} 
            y={0} 
            dy={16} 
            textAnchor="middle" 
            fill={color}
            fontSize="12"
            fontWeight="500"
          >
            {payload.value}
          </text>
          {item?.type && (
            <circle 
              cx={0} 
              cy={-10} 
              r={3} 
              fill={color}
            />
          )}
        </g>
      );
    };

    return (
      <Card className="card-apple p-8 mb-8">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mr-3">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">Hodnotová křivka</h2>
            <p className="text-sm text-muted-foreground">Atributy generované z ERRC matice s barevným kódováním</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={generateERRCAttributes}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              🔄 Regenerovat z ERRC
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center"><div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>Odstranit</div>
                    <div className="flex items-center"><div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>Omezit</div>
                    <div className="flex items-center"><div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>Pozvednout</div>
                    <div className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>Vytvořit</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {valueCurve.length > 0 ? (
          <>
            <div className="mb-8">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={<CustomXAxisTick />}
                    height={60}
                  />
                  <YAxis domain={[0, 100]} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="Low-cost" 
                    stroke="hsl(var(--destructive))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--destructive))" }}
                    connectNulls={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Premium" 
                    stroke="#f97316" 
                    strokeWidth={2}
                    dot={{ fill: "#f97316" }}
                    connectNulls={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Můj projekt" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))" }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid gap-4">
              {valueCurve.map((attr, index) => (
                <div 
                  key={index} 
                  className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center p-4 rounded-lg border-l-4"
                  style={{ 
                    borderLeftColor: attr.color || '#64748b',
                    backgroundColor: attr.color ? `${attr.color}10` : undefined
                  }}
                >
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: attr.color || '#64748b' }}
                      ></div>
                      Atribut
                      {attr.type && (
                        <Badge 
                          variant="outline" 
                          className="ml-2 text-xs px-1 py-0"
                          style={{ 
                            borderColor: attr.color,
                            color: attr.color 
                          }}
                        >
                          {attr.type === 'eliminate' ? 'Odstranit' : 
                           attr.type === 'reduce' ? 'Omezit' :
                           attr.type === 'raise' ? 'Pozvednout' : 'Vytvořit'}
                        </Badge>
                      )}
                    </label>
                    <div className="h-8 px-3 py-2 bg-muted/50 rounded-md text-sm font-medium flex items-center">
                      {attr.name}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Low-cost</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={attr.lowCost}
                      onChange={(e) => updateValueCurve(index, 'lowCost', parseInt(e.target.value) || 0)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Premium</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={attr.premium}
                      onChange={(e) => updateValueCurve(index, 'premium', parseInt(e.target.value) || 0)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Můj projekt</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={attr.myProject}
                      onChange={(e) => updateValueCurve(index, 'myProject', parseInt(e.target.value) || 0)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Info</label>
                    <div className="h-8 flex items-center text-xs text-muted-foreground">
                      Z ERRC matice
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Zatím žádné atributy</h3>
            <p className="text-sm">Vyplňte ERRC matici pro generování hodnotové křivky</p>
          </div>
        )}
      </Card>
    );
  };

  const renderVisionStatement = () => (
    <Card className="card-apple p-8 mb-8">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mr-3">
          <Eye className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Vision Statement</h2>
          <p className="text-sm text-muted-foreground">Shrňte svou vizi do jednoho odstavce (max 500 znaků)</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <Textarea
          value={visionStatement}
          onChange={(e) => setVisionStatement(e.target.value)}
          placeholder="Např. Chci vytvořit e-shop s přírodními produkty pro psy, který kombinuje individuální doporučení s recepty na míru. Naše řešení eliminuje chemické přísady, snižuje náklady díky přímému prodeji a vytváří komunitu pejskařů..."
          className="min-h-32 rounded-xl resize-none"
          maxLength={500}
        />
        <div className="text-right text-sm text-muted-foreground">
          {visionStatement.length}/500 znaků
        </div>
      </div>
    </Card>
  );

  const renderAIAnalysis = () => (
    <Card className="card-apple p-8 mb-8">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mr-3">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold">AI Validace</h2>
          <p className="text-sm text-muted-foreground">Nechte AI vyhodnotit kvalitu vaší vize</p>
        </div>
      </div>

      {isGeneratingAnalysis ? (
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold mb-2">Generuji AI analýzu...</h3>
          <p className="text-muted-foreground">Vyhodnocuji vaši vizi podle Blue Ocean Strategy</p>
        </div>
      ) : analysis ? (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <div className="p-6 bg-muted/30 rounded-xl">
                <h3 className="font-semibold mb-4 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Shrnutí projektu
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="font-medium">Název:</div>
                    <div className="text-muted-foreground">{projectData.name}</div>
                  </div>
                  <div>
                    <div className="font-medium">Slogan:</div>
                    <div className="text-muted-foreground">{projectData.slogan}</div>
                  </div>
                  <div>
                    <div className="font-medium">Vision Score:</div>
                    <div className="text-primary font-semibold">{getVisionScore()}/10</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="p-6 bg-muted/30 rounded-xl">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Analýza
                </h3>
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-line text-sm text-muted-foreground">{analysis}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Button 
            onClick={generateAnalysis} 
            disabled={!canGenerateAnalysis()}
            className="btn-apple"
          >
            <Sparkles className="mr-2 w-4 h-4" />
            Validovat vizi pomocí AI
          </Button>
          {!canGenerateAnalysis() && (
            <p className="text-sm text-muted-foreground mt-2">
              Vyplňte všechny předchozí sekce pro spuštění AI validace
            </p>
          )}
        </div>
      )}
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-4">
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Button onClick={onBack} variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Vision</h1>
                <p className="text-sm text-muted-foreground">Blue Ocean Strategy</p>
              </div>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              {Math.round(getCompletionProgress())}% hotovo
            </Badge>
          </div>
          
          {/* Horizontal Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              {sections.map((section, index) => {
                const Icon = section.icon;
                const isCompleted = section.completed();
                
                return (
                  <div key={section.id} className="flex items-center">
                    <div 
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium ${
                        isCompleted 
                          ? 'bg-green-500 text-white' 
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="ml-2 hidden lg:block">
                      <div className={`text-sm font-medium ${isCompleted ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {section.title}
                      </div>
                    </div>
                    {index < sections.length - 1 && (
                      <div 
                        className={`h-1 w-16 xl:w-24 mx-4 rounded-full ${
                          isCompleted ? 'bg-green-500' : 'bg-muted'
                        }`} 
                      />
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${getCompletionProgress()}%` }}
              />
            </div>
          </div>
        </div>

        {/* All Sections */}
        <div className="space-y-0">
          {renderBasicInfo()}
          {renderERRCMatrix()}
          {renderValueCurve()}
          {renderVisionStatement()}
          {renderAIAnalysis()}
        </div>

        {/* Final Actions */}
        {allDataComplete() && (
          <Card className="card-apple p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-600">Vision fáze dokončena!</h3>
                <p className="text-sm text-muted-foreground">Vaše vize je validována a připravena k implementaci</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={exportToPDF} className="btn-apple-secondary">
                <Download className="mr-2 w-4 h-4" />
                Stáhnout výsledky (PDF)
              </Button>
              
              {canProceed && (
                <Button onClick={onComplete} className="btn-apple">
                  Pokračovat do fáze 2 - Ideation
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};