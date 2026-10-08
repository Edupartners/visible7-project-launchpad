import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { KeyRound } from "lucide-react";
import { supabase } from "@/integrations/visible7/client";
import { useToast } from "@/hooks/use-toast";

/** Zobrazí se po kliknutí na odkaz „nastavit nové heslo“ z e-mailu. */
export const SetNewPasswordPage = ({ onDone }: { onDone: () => void }) => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Heslo je příliš krátké", description: "Použijte alespoň 6 znaků.", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Hesla se neshodují", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsSubmitting(false);
    if (error) {
      toast({ title: "Heslo se nepodařilo změnit", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Heslo změněno", description: "Nové heslo platí od teď." });
    onDone();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="card-apple w-full max-w-md p-8 animate-fade-in">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <KeyRound className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Nastavte nové heslo</h1>
          <p className="text-muted-foreground text-sm">Zadejte nové heslo ke svému účtu VISIBLE7.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nové heslo (min. 6 znaků)"
            className="h-12 rounded-xl"
            autoFocus
            required
          />
          <Input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Nové heslo znovu"
            className="h-12 rounded-xl"
            required
          />
          <Button type="submit" className="btn-apple w-full h-12 text-base" disabled={isSubmitting}>
            {isSubmitting ? "Ukládám…" : "Uložit nové heslo"}
          </Button>
        </form>
      </Card>
    </div>
  );
};
