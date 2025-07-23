
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, TrendingUp, Calendar, Target } from 'lucide-react';

interface MotivationalBoxProps {
  userName: string;
  daysUsed: number;
  completedPhases: number;
  totalPhases: number;
}

export const MotivationalBox = ({ 
  userName, 
  daysUsed, 
  completedPhases, 
  totalPhases 
}: MotivationalBoxProps) => {
  const progressPercentage = (completedPhases / totalPhases) * 100;
  
  const motivationalMessages = [
    "Každý den je nová příležitost k růstu!",
    "Vaše vize se pomalu mění v realitu!",
    "Pokrok je pokrok, bez ohledu na tempo!",
    "Úspěch je součtem malých kroků!",
    "Věříte ve své sny a pracujete na nich!"
  ];
  
  const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 border-primary/20 shadow-lg">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Welcome Section */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/20">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary">
                Vítejte zpět, {userName}!
              </h3>
              <p className="text-sm text-muted-foreground">
                {randomMessage}
              </p>
            </div>
          </div>

          {/* Progress Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Pokrok projektu</span>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {completedPhases}/{totalPhases} fází
              </Badge>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-background/50">
              <div className="flex items-center justify-center mb-1">
                <Calendar className="w-4 h-4 text-accent" />
              </div>
              <p className="text-lg font-semibold text-accent">{daysUsed}</p>
              <p className="text-xs text-muted-foreground">dní použití</p>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-background/50">
              <div className="flex items-center justify-center mb-1">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <p className="text-lg font-semibold text-primary">{completedPhases}</p>
              <p className="text-xs text-muted-foreground">dokončeno</p>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-background/50">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-lg font-semibold text-green-600">{Math.round(progressPercentage)}%</p>
              <p className="text-xs text-muted-foreground">pokrok</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
