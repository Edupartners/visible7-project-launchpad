import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowRight, Lock } from "lucide-react";
import { verifyAccessPassword } from "@/lib/testMode";
import { useToast } from "@/hooks/use-toast";

interface AccessPasswordGateProps {
  onUnlocked: () => void;
}

/** Jednoduchá vstupní brána pro testovací fázi - jedno společné heslo, bez registrace. */
export const AccessPasswordGate = ({ onUnlocked }: AccessPasswordGateProps) => {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setIsSubmitting(true);
    const result = await verifyAccessPassword(password);
    setIsSubmitting(false);

    if (!result.success) {
      toast({
        title: "Přístup zamítnut",
        description: result.error,
        variant: "destructive",
      });
      return;
    }
    onUnlocked();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-accent/10 to-primary/5">
      <Card className="card-apple w-full max-w-md p-8 animate-fade-in">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <Lock className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Přístupové heslo</h1>
          <p className="text-muted-foreground text-sm">
            Aplikace je v testovací fázi. Zadejte heslo, které jste obdrželi.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Zadejte heslo"
            className="h-12 rounded-xl border-border/50 focus:border-primary"
            autoFocus
            required
          />
          <Button type="submit" className="btn-apple w-full h-12 text-base" disabled={isSubmitting || !password}>
            {isSubmitting ? (
              <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
            ) : (
              <>
                Vstoupit
                <ArrowRight className="ml-2 w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
};
