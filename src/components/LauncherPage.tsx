import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, Lock, Users, Timer } from "lucide-react";
import { validateBetaCode } from "@/lib/promoCodes";
import { useToast } from "@/hooks/use-toast";

interface LauncherPageProps {
  onAccessGranted: () => void;
}

export const LauncherPage = ({ onAccessGranted }: LauncherPageProps) => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simple rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (validateBetaCode(code)) {
      localStorage.setItem('betaAccessGranted', 'true');
      localStorage.setItem('betaAccessCode', code);
      localStorage.setItem('betaAccessTimestamp', new Date().toISOString());
      
      toast({
        title: "Přístup povolen!",
        description: "Vítejte v beta verzi VISIBLE7",
      });
      
      onAccessGranted();
    } else {
      toast({
        title: "Neplatný kód",
        description: "Zadaný přístupový kód není platný. Zkuste to prosím znovu.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const isAdminCode = code.toLowerCase() === "admin2024";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Brand */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <Rocket className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            VISIBLE7
          </h1>
          <p className="text-muted-foreground text-lg">
            Revoluce v business plánování
          </p>
        </div>

        {/* Coming Soon Card */}
        <Card className="border-2 border-primary/20">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <Badge variant="secondary" className="gap-1">
                <Timer className="h-3 w-3" />
                Beta Testing
              </Badge>
            </div>
            <CardTitle className="text-2xl">Už brzy spouštíme!</CardTitle>
            <CardDescription className="text-base">
              Připravujeme pro vás něco úžasného. Zadejte přístupový kód pro beta testování.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="access-code" className="text-sm font-medium">
                  Přístupový kód
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="access-code"
                    type="text"
                    placeholder="Zadejte váš kód..."
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={!code || isLoading}
              >
                {isLoading ? "Ověřuji..." : "Získat přístup"}
              </Button>
            </form>

            {isAdminCode && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  Admin panel bude dostupný po přihlášení
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features Preview */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Co vás čeká?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>📋 Interaktivní business plán krok za krokem</li>
              <li>🎯 AI-powered doporučení a analýzy</li>
              <li>📊 Automatické generování prezentací</li>
              <li>💡 Přístup k expertním zdrojům</li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Potřebujete přístupový kód?</p>
          <p>Kontaktujte nás pro beta testování.</p>
        </div>
      </div>
    </div>
  );
};