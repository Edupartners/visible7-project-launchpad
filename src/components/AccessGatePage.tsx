import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, CheckCircle } from "lucide-react";
import { validateBetaCode, validatePromoCode, saveAccessGrant } from "@/lib/promoCodes";

interface AccessGatePageProps {
  onAccessGranted: () => void;
}

export const AccessGatePage = ({ onAccessGranted }: AccessGatePageProps) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Prosím zadejte přístupový kód");
      return;
    }

    setIsLoading(true);
    setError("");

    // Check if code is valid (either beta or promo code)
    const isBetaCode = validateBetaCode(code.trim());
    const isPromoCode = validatePromoCode(code.trim());

    if (isBetaCode || isPromoCode) {
      saveAccessGrant(code.trim());
      onAccessGranted();
    } else {
      setError("Neplatný přístupový kód. Kontaktujte administrátora pro získání přístupu.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Přístup k aplikaci</h1>
          <p className="text-muted-foreground">
            Aplikace je v testovací fázi. Zadejte přístupový kód pro pokračování.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Zadejte přístupový kód</CardTitle>
            <CardDescription>
              Pro přístup k aplikaci potřebujete platný kód
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Zadejte váš kód..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={isLoading}
                  className="text-center tracking-wider"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                    Ověřuji...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Pokračovat
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>Nemáte přístupový kód?</p>
          <p>Kontaktujte nás pro získání přístupu k testovací verzi.</p>
        </div>
      </div>
    </div>
  );
};