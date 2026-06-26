import React, { useState, useEffect } from "react";
import { useSupabaseProgress } from "@/hooks/useSupabaseProgress";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Lightbulb, Brain, AlertCircle, ThumbsUp, AlertTriangle, Zap, Info, RefreshCw, Eye } from "lucide-react";

interface LeanCanvasData {
  problem: string;
  solution: string;
  uniqueValueProposition: string;
  customerSegments: string;
  existingAlternatives: string;
  channels: string;
  costStructure: string;
  revenueStreams: string;
}

interface IdeationPhaseProps {
  onComplete: () => void;
  onBack: () => void;
}

// Vision Phase data interfaces
interface VisionProjectData {
  name: string;
  slogan: string;
}

interface VisionERRCData {
  eliminate: string[];
  reduce: string[];
  raise: string[];
  create: string[];
}

interface VisionData {
  projectData: VisionProjectData;
  errcData: VisionERRCData;
  visionStatement: string;
}

const leanCanvasFields = [
  {
    key: "problem" as keyof LeanCanvasData,
    title: "Problém",
    placeholder: "Zaneprázdnění lidé nemají čas nakupovat zdravé bio potraviny. Supermarkety nabízejí málo bio produktů s nejistou čerstvostí. Složité hledání kvalitních místních dodavatelů.",
    gridArea: "problem"
  },
  {
    key: "solution" as keyof LeanCanvasData,
    title: "Řešení",
    placeholder: "Mobilní aplikace s katalogem bio potravin od ověřených místních farmářů. Objednávka s doručením do 2 hodin. Garance čerstvosti a kvality. Jednoduché hodnocení dodavatelů.",
    gridArea: "solution"
  },
  {
    key: "uniqueValueProposition" as keyof LeanCanvasData,
    title: "Unikátní řešení nebo výhoda",
    placeholder: "Bio potraviny od místních farmářů doručené do 2 hodin s garancí čerstvosti. Podpora lokálních producentů. Transparentnost původu každého produktu.",
    gridArea: "unique-value-proposition"
  },
  {
    key: "customerSegments" as keyof LeanCanvasData,
    title: "Segment zákazníků",
    placeholder: "Mladí profesionálové 28-42 let v Praze a Brně. Příjem 50K+ měsíčně. Aktivní životní styl, zájem o zdraví a udržitelnost. Ochotni platit více za kvalitu.",
    gridArea: "customer-segments"
  },
  {
    key: "existingAlternatives" as keyof LeanCanvasData,
    title: "Existující alternativy",
    placeholder: "Tesco, Albert bio sekce. Rohlik.cz, Košík.cz s bio produkty. Farmářské trhy o víkendech. Speciální bio obchody v centrech měst.",
    gridArea: "existing-alternatives"
  },
  {
    key: "channels" as keyof LeanCanvasData,
    title: "Marketingové kanály",
    placeholder: "Instagram a TikTok marketing, spolupráce s wellness influencery, Google Ads, mobilní aplikace v App Store/Google Play, doporučení od stávajících zákazníků.",
    gridArea: "channels"
  },
  {
    key: "costStructure" as keyof LeanCanvasData,
    title: "Náklady",
    placeholder: "Vývoj a údržba aplikace (200K/měsíc), platy kurýrů (300K/měsíc), marketing a reklama (150K/měsíc), skladování a logistika (100K/měsíc), provoz a administrativa (80K/měsíc).",
    gridArea: "cost-structure"
  },
  {
    key: "revenueStreams" as keyof LeanCanvasData,
    title: "Předpokládané příjmy",
    placeholder: "Provize z prodeje 15% z každé objednávky, měsíční předplatné Premium za 299 Kč (rychlejší doručení), poplatek za doručení 49 Kč, partnership marketing s farmáři.",
    gridArea: "revenue-streams"
  }
];

interface AIAnalysis {
  isViable: boolean;
  reasoning: string;
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  recommendations: string[];
}

const generateLeanCanvasAnalysis = async (data: LeanCanvasData): Promise<AIAnalysis> => {
  // Simulate AI analysis - in real implementation, this would call an AI service
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const filledFields = Object.values(data).filter(value => value.trim().length > 0).length;
  const isViable = filledFields >= 7; // At least 7 out of 9 fields should be filled
  
  return {
    isViable,
    reasoning: isViable 
      ? "Váš projekt vykazuje solidní základy s dobře definovaným problémem a cílovým segmentem. Business model je logicky strukturovaný."
      : "Projekt potřebuje více rozpracování klíčových elementů. Některé oblasti vyžadují hlubší analýzu před pokračováním.",
    strengths: [
      "Jasně definovaný problém a cílový segment",
      "Konkrétní řešení s měřitelnými výstupy",
      "Realistický pohled na nákladovou strukturu"
    ],
    weaknesses: [
      "Konkurenční výhoda by mohla být více specifická",
      "Kanály distribuce potřebují detailnější rozpracování",
      "Příjmový model by měl obsahovat více variant"
    ],
    risks: [
      "Vysoká závislost na externích dodavatelích",
      "Možné problémy s škálováním",
      "Intenzivní konkurence v segmentu"
    ],
    recommendations: [
      "Proveďte průzkum trhu pro validaci předpokladů",
      "Vytvořte MVP pro testování s reálnými zákazníky",
      "Připravte si backup plán pro klíčové partnery"
    ]
  };
};

// Vision Phase data loading and mapping functions
const loadVisionPhaseData = (): VisionData | null => {
  try {
    const projectData = localStorage.getItem("vision_project_data");
    const errcData = localStorage.getItem("vision_errc_data");
    const visionStatement = localStorage.getItem("vision_statement");
    
    if (projectData && errcData && visionStatement) {
      return {
        projectData: JSON.parse(projectData),
        errcData: JSON.parse(errcData),
        visionStatement: JSON.parse(visionStatement)
      };
    }
  } catch (error) {
    console.warn("Failed to load Vision Phase data:", error);
  }
  return null;
};

const mapVisionToLeanCanvas = (visionData: VisionData): Partial<LeanCanvasData> => {
  const { projectData, errcData, visionStatement } = visionData;
  
  // Helper function to format array items
  const formatArrayItems = (items: string[], prefix: string = "") => {
    return items.filter(item => item.trim()).map(item => `${prefix}${item}`).join(", ");
  };
  
  // Create unique value proposition by combining different sources
  const uniqueValueParts = [
    visionStatement || "",
    projectData.slogan || "",
    formatArrayItems(errcData.raise, "Vylepšujeme: "),
    formatArrayItems(errcData.create, "Vytváříme: ")
  ].filter(part => part.trim());
  
  return {
    solution: formatArrayItems(errcData.create, "Vytváříme: "),
    uniqueValueProposition: uniqueValueParts.join(". "),
    existingAlternatives: formatArrayItems(errcData.eliminate, "Na trhu eliminujeme: "),
    costStructure: formatArrayItems(errcData.reduce, "Redukujeme náklady na: ")
  };
};

export const IdeationPhase = ({ onComplete, onBack }: IdeationPhaseProps) => {
  const [showIntro, setShowIntro] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [showVisualization, setShowVisualization] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Pre-fill state
  const [isPreFilled, setIsPreFilled] = useState(false);
  const [preFilledFields, setPreFilledFields] = useState<string[]>([]);
  
  // Persisted data
  const [leanCanvasData, setLeanCanvasData] = useSupabaseProgress<LeanCanvasData>("ideation_lean_canvas", {
    problem: "",
    solution: "",
    uniqueValueProposition: "",
    customerSegments: "",
    existingAlternatives: "",
    channels: "",
    costStructure: "",
    revenueStreams: ""
  });
  
  const [analysis, setAnalysis] = useSupabaseProgress<AIAnalysis | null>("ideation_analysis", null);
  
  // Pre-fill data on component mount
  useEffect(() => {
    const visionData = loadVisionPhaseData();
    if (visionData) {
      const preFilledData = mapVisionToLeanCanvas(visionData);
      const fieldsToUpdate = Object.keys(preFilledData) as (keyof LeanCanvasData)[];
      
      // Only pre-fill if current data is empty
      const hasEmptyFields = fieldsToUpdate.some(field => !leanCanvasData[field]?.trim());
      
      if (hasEmptyFields) {
        setLeanCanvasData(prev => ({
          ...prev,
          ...preFilledData
        }));
        setIsPreFilled(true);
        setPreFilledFields(fieldsToUpdate);
      }
    }
  }, []);
  
  // Reset to empty form
  const resetForm = () => {
    setLeanCanvasData({
      problem: "",
      solution: "",
      uniqueValueProposition: "",
      customerSegments: "",
      existingAlternatives: "",
      channels: "",
      costStructure: "",
      revenueStreams: ""
    });
    setIsPreFilled(false);
    setPreFilledFields([]);
  };
  
  const filledFields = Object.values(leanCanvasData).filter(value => value.trim().length > 0).length;
  const progressPercentage = (filledFields / leanCanvasFields.length) * 100;
  
  const handleFieldChange = (key: keyof LeanCanvasData, value: string) => {
    setLeanCanvasData(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleAnalyze = async () => {
    if (filledFields < 7) {
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const aiAnalysis = await generateLeanCanvasAnalysis(leanCanvasData);
      setAnalysis(aiAnalysis);
      setShowVisualization(true);
    } catch (error) {
      console.error("Error analyzing canvas:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleComplete = () => {
    onComplete();
  };
  
  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
          </div>
          
          <Card className="card-apple p-8">
            <div className="text-center space-y-6">
              <div className="p-4 bg-primary/10 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                <Lightbulb className="w-10 h-10 text-primary" />
              </div>
              
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-foreground">Fáze 2: Ideation</h1>
                <p className="text-xl text-primary font-medium">Lean Canvas</p>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Vytvoříme business model pro váš projekt pomocí Lean Canvas metodiky. 
                  Projdeme 9 klíčových oblastí, které definují úspěšný byznys.
                </p>
              </div>
              
              <div className="bg-accent/10 p-4 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Co vás čeká:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Vyplnění 9 polí Lean Canvas</li>
                  <li>• AI analýza vašeho business modelu</li>
                  <li>• Identifikace silných a slabých stránek</li>
                  <li>• Doporučení pro další kroky</li>
                </ul>
              </div>
              
              <Button 
                onClick={() => setShowIntro(false)}
                className="btn-apple px-8 py-3 text-base"
              >
                Začít s Lean Canvas
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }
  
  if (showVisualization && analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
          </div>
          
          <div className="space-y-6">
            {/* Lean Canvas Visualization */}
            <Card className="card-apple p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">Váš Lean Canvas</h2>
              <div className="lean-canvas-grid" style={{
                // Add explicit debugging styles
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gridTemplateRows: 'repeat(4, auto)',
                gap: '1rem',
                gridTemplateAreas: `
                  "problem problem solution solution customer-segments"
                  "existing-alternatives existing-alternatives unique-value-proposition unique-value-proposition customer-segments"
                  "existing-alternatives existing-alternatives unique-value-proposition unique-value-proposition channels"
                  "cost-structure cost-structure cost-structure revenue-streams revenue-streams"
                `,
                border: '2px solid red' // Debug border
              }}>
                {leanCanvasFields.map((field) => {
                  const className = `lean-canvas-${field.key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
                  console.log(`Field: ${field.key}, Generated class: ${className}, Grid area: ${field.gridArea}`);
                  return (
                    <Card key={field.key} className={`p-4 border-2 border-primary/20 min-h-[120px] ${className}`} 
                          style={{ 
                            gridArea: field.gridArea,
                            border: '1px solid blue' // Debug border
                          }}>
                      <h3 className="font-semibold text-sm mb-2 text-foreground">{field.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {leanCanvasData[field.key] || "Nevyplněno"}
                      </p>
                    </Card>
                  );
                })}
              </div>
            </Card>
            
            {/* AI Analysis */}
            <Card className="card-apple p-6">
              <div className="flex items-center mb-4">
                <Brain className="w-6 h-6 mr-2 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">AI Analýza projektu</h2>
              </div>
              
              <div className="space-y-6">
                {/* Viability */}
                <div className="flex items-start space-x-3">
                  {analysis.isViable ? (
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-orange-500 mt-1" />
                  )}
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      {analysis.isViable ? "✅ Projekt dává smysl" : "⚠️ Projekt vyžaduje úpravy"}
                    </h3>
                    <p className="text-muted-foreground">{analysis.reasoning}</p>
                  </div>
                </div>
                
                {/* Strengths */}
                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center">
                    <ThumbsUp className="w-5 h-5 mr-2 text-green-500" />
                    Silné stránky
                  </h3>
                  <ul className="space-y-1">
                    {analysis.strengths.map((strength, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Weaknesses */}
                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                    Slabé stránky
                  </h3>
                  <ul className="space-y-1">
                    {analysis.weaknesses.map((weakness, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Risks */}
                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                    Hlavní rizika
                  </h3>
                  <ul className="space-y-1">
                    {analysis.risks.map((risk, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {risk}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Recommendations */}
                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-primary" />
                    Doporučení
                  </h3>
                  <ul className="space-y-1">
                    {analysis.recommendations.map((recommendation, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {recommendation}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
            
            {/* Next Steps */}
            {analysis.isViable && (
              <Card className="card-apple p-6 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-semibold text-foreground">
                    ✅ Tvůj projekt vypadá smysluplně
                  </h3>
                  <p className="text-muted-foreground">
                    Chceš nyní spočítat, zda bude ziskový a kdy se ti vrátí investice?
                  </p>
                  <Button 
                    onClick={handleComplete}
                    className="btn-apple px-8 py-3 text-base"
                  >
                    Pokračovat do fáze Business Case → Výpočet profitability a ROI
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
        </div>
        
        {/* Progress */}
        <Card className="card-apple p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Lean Canvas</h2>
              <p className="text-sm text-muted-foreground">
                Vyplněno {filledFields} z {leanCanvasFields.length} polí
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {Math.round(progressPercentage)}%
              </div>
              <div className="text-sm text-muted-foreground">hotovo</div>
            </div>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </Card>
        
        {/* Pre-filled Data Notification */}
        {isPreFilled && (
          <Alert className="mb-6 border-primary/30 bg-primary/5">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  Některá pole byla předvyplněna z Vision fáze ({preFilledFields.length} polí): <Eye className="w-4 h-4 inline ml-1" />
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetForm}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Resetovat
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Form */}
        <div className="space-y-6">
          {leanCanvasFields.map((field, index) => (
            <Card key={field.key} className="card-apple p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground">{field.title}</h3>
              </div>
              
              <div className="space-y-3">
                <div className="bg-accent/10 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Vzorové vyplnění (EcoFood):</p>
                  <p className="text-sm text-foreground italic">{field.placeholder}</p>
                </div>
                
                <Textarea
                  placeholder={`Napište svůj vlastní text pro: ${field.title}`}
                  value={leanCanvasData[field.key]}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>
            </Card>
          ))}
        </div>
        
        {/* Actions */}
        <Card className="card-apple p-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {filledFields < 7 ? 
                  `Vyplňte alespoň 7 polí pro pokračování (${7 - filledFields} zbývá)` :
                  "Všechna klíčová pole jsou vyplněna"
                }
              </p>
            </div>
            <div className="space-x-3">
              <Button 
                onClick={handleAnalyze}
                disabled={filledFields < 7 || isAnalyzing}
                className="btn-apple"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                    Analyzuji...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Vyhodnotit projekt
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
