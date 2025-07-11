import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, BarChart3, MapPin, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { businessTypes } from "@/types/implementation";

interface ImplementationPhaseProps {
  onComplete: () => void;
  onBack: () => void;
  onSelectBusinessType: (businessTypeId: string) => void;
}

export const ImplementationPhase = ({ onComplete, onBack, onSelectBusinessType }: ImplementationPhaseProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  const filteredBusinessTypes = businessTypes.filter(type => {
    const matchesSearch = type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         type.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === "all" || type.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Nízká': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'Střední': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'Vyšší': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
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
              <h1 className="text-xl font-semibold text-foreground">Implementation</h1>
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
                <h2 className="text-apple-title">Fáze 4: Implementation</h2>
                <p className="text-apple-subtitle mt-1">
                  Výběr typu byznysu
                </p>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20">
                12 typů online podnikání
              </Badge>
            </div>
            <p className="text-apple-body">
              Vyberte si typ online podnikání, který nejlépe odpovídá vaší vizi a možnostem. 
              Každý typ obsahuje detailní roadmapu s gamifikovanými kroky a připravenou WordPress šablonu.
            </p>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Hledat typ podnikání..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Náročnost" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Vše</SelectItem>
              <SelectItem value="Nízká">Nízká</SelectItem>
              <SelectItem value="Střední">Střední</SelectItem>
              <SelectItem value="Vyšší">Vyšší</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Business Types Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredBusinessTypes.map((businessType) => (
            <Card key={businessType.id} className="card-apple-hover">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg">{businessType.name}</CardTitle>
                  <Badge className={getDifficultyColor(businessType.difficulty)}>
                    {businessType.difficulty}
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  {businessType.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{businessType.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <BarChart3 className="w-4 h-4" />
                      <span>{businessType.steps.length} kroků</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => onSelectBusinessType(businessType.id)}
                  className="w-full btn-apple"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Roadmapa
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBusinessTypes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Nenalezeny žádné typy podnikání odpovídající vašim kritériím.
            </p>
          </div>
        )}

        {/* Complete Phase Button */}
        <div className="mt-8 text-center">
          <Card className="card-apple p-6 bg-gradient-to-r from-emerald-500/5 via-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
            <p className="text-apple-body mb-4">
              Prozkoumali jste typy online podnikání a jste připraveni pokračovat?
            </p>
            <Button 
              onClick={onComplete}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
            >
              Dokončit fázi Implementation
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};