
import { UnifiedHeader } from "@/components/layout/UnifiedHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

const SettingsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <UnifiedHeader />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Nastavení</h1>
          <p className="text-muted-foreground">Základní nastavení aplikace</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Nastavení
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Nastavení je dostupné po přihlášení.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
