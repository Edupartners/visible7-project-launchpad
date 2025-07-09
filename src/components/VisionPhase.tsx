import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  ArrowRight, 
  Eye, 
  Lightbulb, 
  FileText, 
  Sparkles,
  Download,
  Play
} from "lucide-react";

interface VisionPhaseProps {
  onComplete: () => void;
  onBack: () => void;
}

const questions = [
  {
    id: 1,
    title: "Definujte svou vizi",
    subtitle: "Co chcete dosáhnout?",
    question: "Popište svou obchodní vizi v několika větách. Jaký problém řešíte a pro koho?",
    placeholder: "Např. Chci vytvořit online kurz pro začínající podnikatele, kteří potřebují strukturovaný přístup k založení byznysu...",
    type: "textarea"
  },
  {
    id: 2,
    title: "Cílová skupina",
    subtitle: "Pro koho je vaše řešení?",
    question: "Kdo je váš ideální zákazník? Popište ho co nejpodrobněji (věk, zaměstnání, problémy, potřeby).",
    placeholder: "Např. Ženy 25-40 let, pracují v korporátu, chtějí si vybudovat vedlejší příjem, mají omezený čas...",
    type: "textarea"
  },
  {
    id: 3,
    title: "Konkurenční výhoda",
    subtitle: "Čím se lišíte?",
    question: "Co vás odlišuje od konkurence? Jakou jedinečnou hodnotu nabízíte?",
    placeholder: "Např. Kombinuji 10 let zkušeností v korporátu s digitálním marketingem, mám unikátní metodiku...",
    type: "textarea"
  },
  {
    id: 4,
    title: "Očekávané příjmy",
    subtitle: "Jaký je váš cíl?",
    question: "Kolik chcete vydělávat měsíčně za 12 měsíců?",
    placeholder: "50000",
    type: "number",
    suffix: "Kč/měsíc"
  },
  {
    id: 5,
    title: "Časové možnosti",
    subtitle: "Kolik času můžete investovat?",
    question: "Kolik hodin týdně můžete věnovat rozvoji vašeho projektu?",
    placeholder: "10",
    type: "number",
    suffix: "hodin/týden"
  }
];

export const VisionPhase = ({ onComplete, onBack }: VisionPhaseProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(true);

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      generateAnalysis();
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const generateAnalysis = async () => {
    setIsGeneratingAnalysis(true);
    
    // Simulace AI analýzy (zde by byla integrace s OpenAI)
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const mockAnalysis = `
**Analýza vaší obchodní vize:**

🎯 **Silné stránky vašeho konceptu:**
• Jasně definovaná cílová skupina s konkrétními problémy
• Realistické finanční cíle odpovídající vašim časovým možnostem
• Dobře artikulovaná jedinečná hodnota

💡 **Doporučení pro další kroky:**
1. **Validace trhu**: Provedite průzkum mezi 50-100 lidmi z vaší cílové skupiny
2. **MVP definice**: Začněte s jednoduchým řešením, které můžete spustit za 30 dní
3. **Monetizace**: Na základě vašich cílů doporučujeme model předplatného nebo jednorázových produktů

⚠️ **Potenciální rizika:**
• Konkurenční prostředí - důležité je silné odlišení
• Časové nároky - realističtější může být postupný růst

📊 **Váš Vision Score: 8.5/10**

Vaše vize má silný potenciál! Pokračujte k další fázi Ideation, kde vytvoříme detailní Lean Canvas.
    `;
    
    setAnalysis(mockAnalysis.trim());
    setIsGeneratingAnalysis(false);
  };

  const exportToPDF = () => {
    // Simulace exportu do PDF
    const dataStr = `VISIBLE7 - Vision Phase Results\n\n${Object.entries(answers).map(([id, answer]) => {
      const question = questions.find(q => q.id === parseInt(id));
      return `${question?.title}: ${answer}`;
    }).join('\n\n')}\n\nAI Analýza:\n${analysis}`;
    
    const dataBlob = new Blob([dataStr], {type: 'text/plain'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'VISIBLE7-Vision-Phase.txt';
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
              V této fázi definujeme vaši obchodní vizi a najdeme váš jedinečný prostor na trhu. 
              Odpovězte na 5 klíčových otázek a získejte personalizovanou AI analýzu.
            </p>

            <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground mb-8">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                5 otázek
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                ~15 minut
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                AI analýza
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

  if (analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-4">
        <div className="max-w-4xl mx-auto py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-apple-title">Vision - Výsledky</h1>
                <p className="text-apple-subtitle">AI analýza vaší obchodní vize</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <Sparkles className="w-3 h-3 mr-1" />
              Dokončeno
            </Badge>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Vaše odpovědi */}
            <div className="lg:col-span-1">
              <Card className="card-apple p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Vaše odpovědi
                </h3>
                <div className="space-y-4">
                  {questions.map((question) => (
                    <div key={question.id} className="text-sm">
                      <div className="font-medium text-foreground mb-1">{question.title}</div>
                      <div className="text-muted-foreground bg-muted/50 p-2 rounded">
                        {answers[question.id] || 'Neodpovězeno'}
                        {question.suffix && answers[question.id] && ` ${question.suffix}`}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* AI Analýza */}
            <div className="lg:col-span-2">
              <Card className="card-apple p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Analýza
                </h3>
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-line text-apple-body">{analysis}</div>
                </div>
              </Card>
            </div>
          </div>

          {/* Akce */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button onClick={exportToPDF} className="btn-apple-secondary">
              <Download className="mr-2 w-4 h-4" />
              Exportovat do PDF
            </Button>
            
            <Button onClick={onComplete} className="btn-apple flex-1">
              Dokončit fázi Vision
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const currentAnswer = answers[currentQ.id] || '';
  const isAnswered = currentAnswer.trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-4">
      <div className="max-w-2xl mx-auto py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Button onClick={onBack} variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </div>
              <span className="font-medium">Vision</span>
            </div>
            <Badge variant="secondary">
              {currentQuestion + 1} / {questions.length}
            </Badge>
          </div>
          
          <div className="progress-apple">
            <div 
              className="progress-apple-fill"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Otázka */}
        <Card className="card-apple p-8">
          <div className="mb-6">
            <h2 className="text-apple-title mb-2">{currentQ.title}</h2>
            <p className="text-primary font-medium mb-4">{currentQ.subtitle}</p>
            <p className="text-apple-body">{currentQ.question}</p>
          </div>

          <div className="space-y-4">
            {currentQ.type === 'textarea' ? (
              <Textarea
                value={currentAnswer}
                onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                placeholder={currentQ.placeholder}
                className="min-h-32 rounded-xl border-border/50 focus:border-primary resize-none"
              />
            ) : (
              <div className="relative">
                <Input
                  type={currentQ.type}
                  value={currentAnswer}
                  onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                  placeholder={currentQ.placeholder}
                  className="h-12 rounded-xl border-border/50 focus:border-primary pr-20"
                />
                {currentQ.suffix && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                    {currentQ.suffix}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between mt-8">
            <Button 
              onClick={handlePrev}
              variant="ghost"
              disabled={currentQuestion === 0}
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Předchozí
            </Button>

            {isGeneratingAnalysis ? (
              <Button disabled className="btn-apple">
                <Sparkles className="mr-2 w-4 h-4 animate-spin" />
                Generuji analýzu...
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                disabled={!isAnswered}
                className="btn-apple"
              >
                {currentQuestion === questions.length - 1 ? (
                  <>
                    Vygenerovat analýzu
                    <Sparkles className="ml-2 w-4 h-4" />
                  </>
                ) : (
                  <>
                    Další
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};