
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Lock, Crown, CheckCircle, Search, BarChart3, Target, TrendingUp, Share2, Mail, MessageSquare, Users, PenTool } from "lucide-react";
import { useState } from "react";
import { PricingModal } from "./PricingModal";

interface PhasePreviewProps {
  phaseId: number;
  title: string;
  subtitle: string;
  description: string;
  onBack: () => void;
  features: string[];
  estimatedTime: string;
}

const getChannelPreview = (feature: string) => {
  const channelMap: Record<string, { image: string; icon: any; gradient: string }> = {
    "Srovnávače zboží": {
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80",
      icon: Search,
      gradient: "from-blue-500/20 to-cyan-500/20"
    },
    "Katalogy a marketplace": {
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=400&q=80",
      icon: BarChart3,
      gradient: "from-green-500/20 to-emerald-500/20"
    },
    "PPC kampaně": {
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80",
      icon: Target,
      gradient: "from-red-500/20 to-pink-500/20"
    },
    "SEO optimalizace": {
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=400&q=80",
      icon: TrendingUp,
      gradient: "from-purple-500/20 to-violet-500/20"
    },
    "Sociální sítě": {
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80",
      icon: Share2,
      gradient: "from-orange-500/20 to-yellow-500/20"
    },
    "E-mail marketing": {
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=400&q=80",
      icon: Mail,
      gradient: "from-indigo-500/20 to-blue-500/20"
    },
    "SMS marketing": {
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80",
      icon: MessageSquare,
      gradient: "from-teal-500/20 to-cyan-500/20"
    },
    "PR & influenceři": {
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=400&q=80",
      icon: Users,
      gradient: "from-pink-500/20 to-rose-500/20"
    },
    "Copywriting": {
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80",
      icon: PenTool,
      gradient: "from-slate-500/20 to-gray-500/20"
    }
  };

  return channelMap[feature] || {
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=400&q=80",
    icon: Target,
    gradient: "from-gray-500/20 to-slate-500/20"
  };
};

export const PhasePreview = ({ 
  phaseId, 
  title, 
  subtitle, 
  description, 
  onBack, 
  features, 
  estimatedTime 
}: PhasePreviewProps) => {
  const [showPricingModal, setShowPricingModal] = useState(false);

  const handlePaymentSuccess = () => {
    setShowPricingModal(false);
    // Reload page to refresh access state
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button 
              onClick={onBack}
              variant="ghost" 
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Zpět na dashboard</span>
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">V7</span>
              </div>
              <h1 className="text-xl font-semibold text-foreground">{title} - Náhled</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Phase Header */}
        <div className="mb-8">
          <Card className="card-apple p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-apple-title">Fáze {phaseId}: {title}</h2>
                <p className="text-apple-subtitle mt-1">{subtitle}</p>
              </div>
              <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
                <Lock className="w-3 h-3 mr-1" />
                Náhled
              </Badge>
            </div>
            <p className="text-apple-body mb-4">{description}</p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>⏱ {estimatedTime}</span>
              <span>🚀 Pokročilá fáze</span>
            </div>
          </Card>
        </div>

        {/* Preview Content */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {features.map((feature, index) => {
            const preview = getChannelPreview(feature);
            const IconComponent = preview.icon;
            
            return (
              <Card key={index} className="card-apple relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-background/50 to-muted/30 rounded-lg" />
                <div className="absolute top-4 right-4 z-20">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                </div>
                <CardHeader className="relative z-10">
                  <CardTitle className="text-lg flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-primary opacity-50" />
                    {feature}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Tato funkce je dostupná po odemknutí plné verze
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="relative h-20 rounded border-2 border-dashed border-muted-foreground/30 overflow-hidden">
                    {/* Background Image */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-30 blur-sm"
                      style={{ backgroundImage: `url(${preview.image})` }}
                    />
                    
                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${preview.gradient}`} />
                    
                    {/* Icon and Text */}
                    <div className="relative h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-1">
                          <IconComponent className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">Náhled kanálu</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Phase complete message or locked phases message */}
        <Card className="card-apple p-8 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-2">
              Odemkněte pokročilé fáze
              </h3>
              <p className="text-apple-body mb-6 max-w-2xl mx-auto">
                Získejte přístup k plné verzi fází 5-7 s interaktivními nástroji, 
                podrobnými analýzami a exporty dat. Pokračujte ve svém podnikatelském růstu!
              </p>
              
              <div className="space-y-4">
                <div className="text-3xl font-bold text-primary">990 Kč</div>
                <Button 
                  onClick={() => setShowPricingModal(true)}
                  className="btn-apple text-base px-8"
                  size="lg"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Odemknout pokročilé fáze
                </Button>
                <p className="text-xs text-muted-foreground">
                  Jednorázová platba • Přístup navždy • 30 dní záruka vrácení peněz
                </p>
              </div>

              <div className="mt-8 grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Interaktivní nástroje</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Detailní analýzy</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Exporty dat</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

      {/* Pricing Modal */}
      {showPricingModal && (
        <PricingModal 
          onClose={() => setShowPricingModal(false)} 
          onSuccess={handlePaymentSuccess} 
          completedPhases={4} 
          totalPhases={7} 
        />
      )}
    </div>
  );
};
