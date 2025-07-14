import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { marketingChannels, type MarketingChannel, type MarketingStep } from "@/types/marketing";
import { BackButton } from "@/components/ui/back-button";
import { Clock, DollarSign, Target, CheckCircle2 } from "lucide-react";

interface MarketingChannelDetailProps {
  channelId: string;
  onBack: () => void;
}

export function MarketingChannelDetail({ channelId, onBack }: MarketingChannelDetailProps) {
  const channel = marketingChannels.find(c => c.id === channelId);
  const [steps, setSteps] = useState<MarketingStep[]>([]);

  useEffect(() => {
    if (channel) {
      // Load progress from localStorage
      const savedProgress = localStorage.getItem(`marketing-${channelId}`);
      if (savedProgress) {
        const parsedProgress = JSON.parse(savedProgress);
        setSteps(parsedProgress);
      } else {
        setSteps(channel.steps);
      }
    }
  }, [channel, channelId]);

  const handleStepToggle = (stepId: string, completed: boolean) => {
    const updatedSteps = steps.map(step =>
      step.id === stepId ? { ...step, completed } : step
    );
    setSteps(updatedSteps);
    
    // Save to localStorage
    localStorage.setItem(`marketing-${channelId}`, JSON.stringify(updatedSteps));
  };

  if (!channel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Kanál nenalezen</h2>
          <Button onClick={onBack}>Zpět na přehled</Button>
        </div>
      </div>
    );
  }

  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;
  const totalCost = steps.filter(step => step.completed).reduce((sum, step) => sum + step.price, 0);
  const estimatedTotalCost = steps.reduce((sum, step) => sum + step.price, 0);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Nízká': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Střední': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Vyšší': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getAdTypeColor = (adType: string) => {
    return adType === 'Placená reklama' 
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6">
            <BackButton onBack={onBack} />
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">
                {channel.name}
              </h1>
              <p className="text-xl text-muted-foreground mb-4">
                {channel.description}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className={getDifficultyColor(channel.difficulty)}>
                  {channel.difficulty}
                </Badge>
                <Badge className={getAdTypeColor(channel.adType)}>
                  {channel.adType === 'Placená reklama' ? 'Placená' : 'Organická'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8 bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Přehled pokroku
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  {completedSteps}/{totalSteps}
                </div>
                <p className="text-sm text-muted-foreground">Dokončené kroky</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  {Math.round(progressPercentage)}%
                </div>
                <p className="text-sm text-muted-foreground">Pokrok</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  {totalCost.toLocaleString()} Kč
                </div>
                <p className="text-sm text-muted-foreground">Již utraceno</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-muted-foreground mb-1">
                  {estimatedTotalCost.toLocaleString()} Kč
                </div>
                <p className="text-sm text-muted-foreground">Celkové náklady</p>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Celkový pokrok</span>
                <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Steps Checklist */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Roadmapa - {channel.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4 font-semibold text-foreground w-12"></th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Co</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Kde</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Poznámka</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground text-right">Cena</th>
                  </tr>
                </thead>
                <tbody>
                  {steps.map((step, index) => (
                    <tr 
                      key={step.id} 
                      className={`border-b border-border/30 hover:bg-muted/30 transition-colors ${
                        step.completed ? 'opacity-75' : ''
                      }`}
                    >
                      <td className="py-4 px-4">
                        <Checkbox
                          checked={step.completed}
                          onCheckedChange={(checked) => 
                            handleStepToggle(step.id, checked as boolean)
                          }
                          className="w-5 h-5"
                        />
                      </td>
                      <td className={`py-4 px-4 ${step.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        <div className="font-medium">{step.task}</div>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {step.platform}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        {step.note}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className={`font-semibold ${
                          step.price === 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-foreground'
                        }`}>
                          {step.price === 0 ? 'Zdarma' : `${step.price.toLocaleString()} Kč`}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {completedSteps === totalSteps && (
              <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-200">
                      Gratulace! Dokončili jste celou roadmapu
                    </h3>
                    <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                      Nyní můžete začít testovat a optimalizovat tento marketingový kanál.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}