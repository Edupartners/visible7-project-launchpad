
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { marketingChannels, type MarketingChannel } from "@/types/marketing";
import { TrendingUp, Target, Clock, DollarSign, BarChart3, Search, Share2, Mail, MessageSquare } from "lucide-react";

interface BenchmarkingTestingPhaseProps {
  onChannelSelect: (channelId: string) => void;
}

const getChannelIcon = (channelId: string) => {
  const icons = {
    'srovnavace': Search,
    'marketplace': BarChart3,
    'ppc': Target,
    'seo': TrendingUp,
    'social-media': Share2,
    'email-marketing': Mail,
    'sms-marketing': MessageSquare,
    'pr-influencers': Share2,
    'copywriting': Target
  };
  return icons[channelId as keyof typeof icons] || Target;
};

export function BenchmarkingTestingPhase({ onChannelSelect }: BenchmarkingTestingPhaseProps) {
  const [selectedAdType, setSelectedAdType] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedTime, setSelectedTime] = useState<string>("all");

  const filteredChannels = marketingChannels.filter((channel) => {
    const adTypeMatch = selectedAdType === "all" || 
      (selectedAdType === "placena" && channel.adType === "Placená reklama") ||
      (selectedAdType === "organicka" && channel.adType === "Organická reklama");
    
    const difficultyMatch = selectedDifficulty === "all" || channel.difficulty === selectedDifficulty;
    
    const timeMatch = selectedTime === "all" || 
      (selectedTime === "rychla" && (channel.setupTime.includes("den") || channel.setupTime.includes("1 týden"))) ||
      (selectedTime === "stredni" && channel.setupTime.includes("týdn")) ||
      (selectedTime === "dlouha" && channel.setupTime.includes("2-4"));

    return adTypeMatch && difficultyMatch && timeMatch;
  });

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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Benchmarking & Testing
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Vyberte marketingové kanály pro testování a optimalizaci vašeho podnikání. 
            Každý kanál obsahuje detailní roadmapu s konkrétními kroky.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4 justify-center">
          <Select value={selectedAdType} onValueChange={setSelectedAdType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Typ reklamy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Všechny typy</SelectItem>
              <SelectItem value="placena">Placená</SelectItem>
              <SelectItem value="organicka">Organická</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Náročnost" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Všechny náročnosti</SelectItem>
              <SelectItem value="Nízká">Nízká</SelectItem>
              <SelectItem value="Střední">Střední</SelectItem>
              <SelectItem value="Vyšší">Vyšší</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedTime} onValueChange={setSelectedTime}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Doba nastavení" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Všechny doby</SelectItem>
              <SelectItem value="rychla">Rychlá (1-7 dnů)</SelectItem>
              <SelectItem value="stredni">Střední (1-2 týdny)</SelectItem>
              <SelectItem value="dlouha">Dlouhá (2+ týdny)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Marketing Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChannels.map((channel) => {
            const IconComponent = getChannelIcon(channel.id);
            const totalSteps = channel.steps.length;
            const estimatedCost = channel.steps.reduce((sum, step) => sum + step.price, 0);

            return (
              <Card 
                key={channel.id} 
                className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30 bg-card/80 backdrop-blur-sm"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={getDifficultyColor(channel.difficulty)}>
                        {channel.difficulty}
                      </Badge>
                      <Badge className={getAdTypeColor(channel.adType)}>
                        {channel.adType === 'Placená reklama' ? 'Placená' : 'Organická'}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {channel.name}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {channel.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Nastavení: {channel.setupTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Target className="w-4 h-4" />
                      <span>{totalSteps} kroků</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="w-4 h-4" />
                      <span>~{estimatedCost.toLocaleString()} Kč</span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => onChannelSelect(channel.id)}
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                    variant="outline"
                  >
                    Zobrazit roadmapu
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredChannels.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Žádné kanály neodpovídají vybraným filtrům.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
