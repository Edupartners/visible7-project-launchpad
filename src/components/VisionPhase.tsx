
import React, { useState, useEffect } from "react";
import { usePersistedState } from "@/hooks/usePersistedState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { 
  ArrowRight, 
  Eye, 
  Lightbulb, 
  FileText, 
  Sparkles,
  Download,
  Info,
  Plus,
  Minus,
  TrendingUp,
  Target,
  VideoIcon,
  BookOpen,
  ExternalLink,
  RefreshCw
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
  // Debug cache busting - Vision v2.2 with create attributes fix
  const VISION_VERSION = "VisionPhase_v2.2_CreateAttributesFix_" + Date.now();
  
  useEffect(() => {
    console.log("🎯 VisionPhase Loading - Version:", VISION_VERSION);
    console.log("🎨 Create attributes will show only myProject values");
    console.log("📊 Value curve filtered for create attributes");
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

  // Reset all data function
  const resetAllData = () => {
    console.log("🔄 Resetting all Vision phase data");
    setProjectData({ name: "", slogan: "" });
    setERRCData({
      eliminate: ["", ""],
      reduce: ["", ""],
      raise: ["", ""],
      create: ["", ""]
    });
    setValueCurve(defaultAttributes);
    setVisionStatement("");
    setAnalysis(null);
    setCanProceed(false);
  };

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
    console.log("🔄 Generating value curve with ERRC - Create attributes will have lowCost=0, premium=0");
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
        lowCost: 0,  // Always 0 for create attributes
        premium: 0,  // Always 0 for create attributes
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

  // Prepare chart data - filter out create attributes with zero values
  const prepareChartData = () => {
    return valueCurve.map(attr => ({
      name: attr.name,
      lowCost: attr.type === 'create' ? null : attr.lowCost, // Hide create attributes from chart
      premium: attr.type === 'create' ? null : attr.premium, // Hide create attributes from chart
      myProject: attr.myProject,
      type: attr.type
    }));
  };

  // Render Methods
  const renderBasicInfo = () => (
    <Card className="card-apple p-6 mb-6">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-blue-600 flex items-center justify-center mr-3">
          <FileText className="w-4 h-4" />
        </div>
        <h3 className="text-lg font-semibold">Základní informace o projektu</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Název projektu *</label>
          <Input
            value={projectData.name}
            onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Zadejte název vašeho projektu..."
            className="input-apple"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Slogan / tagline</label>
          <Input
            value={projectData.slogan}
            onChange={(e) => setProjectData(prev => ({ ...prev, slogan: e.target.value }))}
            placeholder="Stručně popište hodnotu vašeho produktu..."
            className="input-apple"
          />
        </div>
      </div>
    </Card>
  );

  const renderERRCMatrix = () => (
    <Card className="card-apple p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-600 flex items-center justify-center mr-3">
            <Target className="w-4 h-4" />
          </div>
          <h3 className="text-lg font-semibold">ERRC Matice</h3>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Definujte co eliminovat, redukovat, pozvýšit a vytvořit oproti konkurenci</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Eliminate */}
        <div className="space-y-3">
          <h4 className="font-medium text-red-600 flex items-center">
            <Minus className="w-4 h-4 mr-2" />
            Eliminovat
          </h4>
          {errcData.eliminate.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                value={item}
                onChange={(e) => updateERRCItem('eliminate', index, e.target.value)}
                placeholder="Co odstranit z trhu..."
                className="input-apple flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeERRCItem('eliminate', index)}
                className="text-red-500 hover:text-red-700"
              >
                <Minus className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => addERRCItem('eliminate')}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Přidat
          </Button>
        </div>

        {/* Reduce */}
        <div className="space-y-3">
          <h4 className="font-medium text-orange-600 flex items-center">
            <Minus className="w-4 h-4 mr-2" />
            Redukovat
          </h4>
          {errcData.reduce.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                value={item}
                onChange={(e) => updateERRCItem('reduce', index, e.target.value)}
                placeholder="Co snížit pod standard..."
                className="input-apple flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeERRCItem('reduce', index)}
                className="text-orange-500 hover:text-orange-700"
              >
                <Minus className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => addERRCItem('reduce')}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Přidat
          </Button>
        </div>

        {/* Raise */}
        <div className="space-y-3">
          <h4 className="font-medium text-blue-600 flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Pozvýšit
          </h4>
          {errcData.raise.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                value={item}
                onChange={(e) => updateERRCItem('raise', index, e.target.value)}
                placeholder="Co zlepšit nad standard..."
                className="input-apple flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeERRCItem('raise', index)}
                className="text-blue-500 hover:text-blue-700"
              >
                <Minus className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => addERRCItem('raise')}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Přidat
          </Button>
        </div>

        {/* Create */}
        <div className="space-y-3">
          <h4 className="font-medium text-green-600 flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Vytvořit
          </h4>
          {errcData.create.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                value={item}
                onChange={(e) => updateERRCItem('create', index, e.target.value)}
                placeholder="Co nového přinést..."
                className="input-apple flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeERRCItem('create', index)}
                className="text-green-500 hover:text-green-700"
              >
                <Minus className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => addERRCItem('create')}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Přidat
          </Button>
        </div>
      </div>
    </Card>
  );

  const renderValueCurve = () => (
    <Card className="card-apple p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-600 flex items-center justify-center mr-3">
            <TrendingUp className="w-4 h-4" />
          </div>
          <h3 className="text-lg font-semibold">Hodnotová křivka</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={addCustomAttribute}
          disabled={valueCurve.length >= 10}
        >
          <Plus className="w-4 h-4 mr-2" />
          Přidat atribut
        </Button>
      </div>
      
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={prepareChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis domain={[0, 100]} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="lowCost" 
              stroke="#8884d8" 
              strokeWidth={2} 
              name="Low-cost konkurence"
              connectNulls={false}
            />
            <Line 
              type="monotone" 
              dataKey="premium" 
              stroke="#82ca9d" 
              strokeWidth={2} 
              name="Premium konkurence"
              connectNulls={false}
            />
            <Line 
              type="monotone" 
              dataKey="myProject" 
              stroke="#ff7300" 
              strokeWidth={3} 
              name="Můj projekt"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="space-y-4">
        {valueCurve.map((attribute, index) => (
          <div key={index} className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Input
                  value={attribute.name}
                  onChange={(e) => updateAttributeName(index, e.target.value)}
                  className="font-medium bg-transparent border-none p-0 text-base"
                  style={{ color: attribute.color }}
                />
                {attribute.type === 'create' && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-700 border-green-200">
                          Vytvoření
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">U "Vytvoření" se zobrazuje pouze hodnota vašeho projektu, protože konkurence tyto funkce nemá.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              {index > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCustomAttribute(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Minus className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {/* Low Cost - Hidden for create attributes */}
              {attribute.type !== 'create' && (
                <div>
                  <label className="block text-xs font-medium mb-1">Low-cost</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={attribute.lowCost}
                    onChange={(e) => updateValueCurve(index, 'lowCost', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-xs text-muted-foreground">{attribute.lowCost}</span>
                </div>
              )}
              
              {/* Premium - Hidden for create attributes */}
              {attribute.type !== 'create' && (
                <div>
                  <label className="block text-xs font-medium mb-1">Premium</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={attribute.premium}
                    onChange={(e) => updateValueCurve(index, 'premium', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-xs text-muted-foreground">{attribute.premium}</span>
                </div>
              )}
              
              {/* My Project - Always visible */}
              <div className={attribute.type === 'create' ? 'col-span-3' : ''}>
                <label className="block text-xs font-medium mb-1">
                  Můj projekt
                  {attribute.type === 'create' && (
                    <span className="text-green-600 ml-1">(Unikátní funkce)</span>
                  )}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={attribute.myProject}
                  onChange={(e) => updateValueCurve(index, 'myProject', parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">{attribute.myProject}</span>
              </div>
            </div>
            
            {/* Explanation for create attributes */}
            {attribute.type === 'create' && (
              <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
                💡 Tato funkce neexistuje u konkurence, proto se zobrazuje pouze hodnota vašeho projektu.
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );

  const renderVisionStatement = () => (
    <Card className="card-apple p-6 mb-6">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-600 flex items-center justify-center mr-3">
          <Eye className="w-4 h-4" />
        </div>
        <h3 className="text-lg font-semibold">Vision Statement</h3>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Popište svou vizi (min. 50 znaků) *
        </label>
        <Textarea
          value={visionStatement}
          onChange={(e) => setVisionStatement(e.target.value)}
          placeholder="Naše vize je vytvořit..."
          className="textarea-apple min-h-[120px]"
        />
        <div className="text-xs text-muted-foreground mt-1">
          {visionStatement.length}/50 znaků minimum
        </div>
      </div>
    </Card>
  );

  const renderAIAnalysis = () => (
    <Card className="card-apple p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 text-violet-600 flex items-center justify-center mr-3">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-lg font-semibold">AI Validace</h3>
        </div>
        
        <Button
          onClick={generateAnalysis}
          disabled={!canGenerateAnalysis() || isGeneratingAnalysis}
          className="btn-apple bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
        >
          {isGeneratingAnalysis ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Analyzuji...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Spustit AI analýzu
            </>
          )}
        </Button>
      </div>
      
      {!canGenerateAnalysis() && (
        <div className="text-sm text-muted-foreground mb-4">
          💡 Dokončete všechny předchozí sekce pro spuštění AI analýzy
        </div>
      )}
      
      {analysis && (
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="prose prose-sm max-w-none">
            {analysis.split('\n').map((line, index) => (
              <p key={index} className="mb-2 whitespace-pre-wrap">{line}</p>
            ))}
          </div>
        </div>
      )}
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-primary flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Vision</h1>
              <p className="text-sm text-muted-foreground">Blue Ocean Strategy</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="px-3 py-1 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
              {Math.round(getCompletionProgress())}% hotovo
            </Badge>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Resetovat všechna data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tato akce vymaže všechna vyplněná data ve Vision fázi. Tuto akci nelze vrátit zpět.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Zrušit</AlertDialogCancel>
                  <AlertDialogAction onClick={resetAllData} className="bg-red-600 hover:bg-red-700">
                    Resetovat vše
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
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
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/20 text-emerald-600 flex items-center justify-center mr-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-600">Vision fáze dokončena!</h3>
              <p className="text-sm text-muted-foreground">Vaše vize je validována a připravena k implementaci</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={exportToPDF} className="btn-apple-secondary">
              <Download className="mr-2 w-4 h-4" />
              Stáhnout výsledky (PDF)
            </Button>
            
            {canProceed && (
              <Button onClick={onComplete} className="btn-apple bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                Pokračovat do fáze 2 - Ideation
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
