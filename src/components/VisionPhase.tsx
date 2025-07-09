import { useState } from "react";
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
  Target
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
  const [currentStep, setCurrentStep] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  
  // Form data
  const [projectData, setProjectData] = useState<ProjectData>({ name: "", slogan: "" });
  const [errcData, setERRCData] = useState<ERRCData>({
    eliminate: ["", ""],
    reduce: ["", ""],
    raise: ["", ""],
    create: ["", ""]
  });
  const [valueCurve, setValueCurve] = useState<ValueCurveAttribute[]>(defaultAttributes);
  const [visionStatement, setVisionStatement] = useState("");
  
  // AI Analysis
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [canProceed, setCanProceed] = useState(false);

  const steps = [
    { id: 0, title: "Základní informace", icon: FileText },
    { id: 1, title: "ERRC Matice", icon: Target },
    { id: 2, title: "Hodnotová křivka", icon: TrendingUp },
    { id: 3, title: "Vision Statement", icon: Eye },
    { id: 4, title: "AI Validace", icon: Sparkles }
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

  const updateValueCurve = (attributeIndex: number, type: 'lowCost' | 'premium' | 'myProject', value: number) => {
    setValueCurve(prev => prev.map((attr, i) => 
      i === attributeIndex ? { ...attr, [type]: value } : attr
    ));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 3) {
      generateAnalysis();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canContinue = () => {
    switch (currentStep) {
      case 0: return projectData.name.trim() && projectData.slogan.trim();
      case 1: return Object.values(errcData).every(arr => arr.some(item => item.trim()));
      case 2: return true; // Value curve always has default values
      case 3: return visionStatement.trim().length > 0;
      default: return false;
    }
  };

  const generateAnalysis = async () => {
    setIsGeneratingAnalysis(true);
    setCurrentStep(4);
    
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
        <div className="max-w-2xl w-full">
          <Card className="card-apple p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary mx-auto mb-6 flex items-center justify-center">
              <Eye className="w-8 h-8" />
            </div>
            
            <h1 className="text-apple-title mb-4">Fáze 1: Vision</h1>
            <h2 className="text-xl text-primary font-medium mb-4">Strategie modrého oceánu</h2>
            
            <p className="text-apple-body mb-6 max-w-lg mx-auto">
              Definujte svůj projekt pomocí ERRC matice, hodnotové křivky a AI validace. 
              Najděte svůj jedinečný prostor na trhu podle Blue Ocean Strategy.
            </p>

            <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground mb-8">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                4 kroky
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                ~20 minut
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
          </Card>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderBasicInfo();
      case 1:
        return renderERRCMatrix();
      case 2:
        return renderValueCurve();
      case 3:
        return renderVisionStatement();
      case 4:
        return renderAIAnalysis();
      default:
        return null;
    }
  };

  const renderBasicInfo = () => (
    <Card className="card-apple p-8">
      <h2 className="text-apple-title mb-2">Základní informace o projektu</h2>
      <p className="text-apple-body mb-8">Definujte název a slogan vašeho projektu</p>
      
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
    <Card className="card-apple p-8">
      <div className="flex items-center mb-4">
        <h2 className="text-apple-title mr-2">ERRC Matice</h2>
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
      <p className="text-apple-body mb-8">Definujte čtyři klíčové oblasti vaší strategie</p>
      
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
      "Low-cost": attr.lowCost,
      "Premium": attr.premium,
      "Můj projekt": attr.myProject
    }));

    return (
      <Card className="card-apple p-8">
        <div className="flex items-center mb-4">
          <h2 className="text-apple-title mr-2">Hodnotová křivka</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Srovnání vašeho projektu s konkurencí podle klíčových atributů</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-apple-body mb-8">Nastavte hodnoty pro každý atribut (0-100)</p>
        
        <div className="mb-8">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="Low-cost" 
                stroke="hsl(var(--destructive))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--destructive))" }}
              />
              <Line 
                type="monotone" 
                dataKey="Premium" 
                stroke="hsl(var(--warning))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--warning))" }}
              />
              <Line 
                type="monotone" 
                dataKey="Můj projekt" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid gap-4">
          {valueCurve.map((attr, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-4 bg-muted/30 rounded-lg">
              <div className="font-medium">{attr.name}</div>
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
            </div>
          ))}
        </div>
      </Card>
    );
  };

  const renderVisionStatement = () => (
    <Card className="card-apple p-8">
      <h2 className="text-apple-title mb-2">Vision Statement</h2>
      <p className="text-apple-body mb-8">Shrňte svou vizi do jednoho odstavce (max 500 znaků)</p>
      
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
    <div className="space-y-6">
      {isGeneratingAnalysis ? (
        <Card className="card-apple p-8 text-center">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
          <h2 className="text-apple-title mb-2">Generuji AI analýzu...</h2>
          <p className="text-apple-body">Vyhodnocuji vaši vizi podle Blue Ocean Strategy</p>
        </Card>
      ) : analysis ? (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <Card className="card-apple p-6">
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
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="card-apple p-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Analýza
                </h3>
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-line text-apple-body">{analysis}</div>
                </div>
              </Card>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={exportToPDF} className="btn-apple-secondary">
              <Download className="mr-2 w-4 h-4" />
              Exportovat do PDF
            </Button>
            
            {canProceed ? (
              <Button onClick={onComplete} className="btn-apple flex-1">
                Pokračovat do fáze 2 - Ideation
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            ) : (
              <Button 
                onClick={() => setCurrentStep(0)} 
                variant="outline" 
                className="flex-1"
              >
                Vylepšit vizi
                <ArrowLeft className="ml-2 w-4 h-4" />
              </Button>
            )}
          </div>
        </>
      ) : null}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header & Progress */}
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
                <h1 className="text-apple-title">Vision</h1>
                <p className="text-apple-subtitle">Blue Ocean Strategy</p>
              </div>
            </div>
            <Badge variant="secondary">
              {currentStep + 1} / {steps.length}
            </Badge>
          </div>
          
          {/* Step indicators */}
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div 
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : isCompleted 
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {index < steps.length - 1 && (
                    <div 
                      className={`h-0.5 w-16 mx-2 ${
                        isCompleted ? 'bg-green-500' : 'bg-muted'
                      }`} 
                    />
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="progress-apple">
            <div 
              className="progress-apple-fill"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        {currentStep < 4 && (
          <div className="flex justify-between">
            <Button 
              onClick={handlePrev}
              variant="ghost"
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Předchozí
            </Button>

            {currentStep === 3 ? (
              <Button 
                onClick={handleNext}
                disabled={!canContinue() || isGeneratingAnalysis}
                className="btn-apple"
              >
                {isGeneratingAnalysis ? (
                  <>
                    <Sparkles className="mr-2 w-4 h-4 animate-spin" />
                    Validuji vizi...
                  </>
                ) : (
                  <>
                    Validovat AI
                    <Sparkles className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                disabled={!canContinue()}
                className="btn-apple"
              >
                Další krok
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};