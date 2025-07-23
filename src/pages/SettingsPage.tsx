
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UnifiedHeader } from "@/components/layout/UnifiedHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { UserSettings, defaultUserSettings } from "@/types/user";
import { Shield, Palette, Mail } from "lucide-react";

const SettingsPage = () => {
  const { userSettings, updateSettings } = useAuth();
  const { toast } = useToast();
  const [localSettings, setLocalSettings] = useState<UserSettings>(userSettings);

  const handleSave = () => {
    updateSettings(localSettings);
    toast({
      title: "Nastavení uloženo",
      description: "Vaše změny byly úspěšně uloženy.",
    });
  };

  const handleReset = () => {
    setLocalSettings(defaultUserSettings);
    updateSettings(defaultUserSettings);
    toast({
      title: "Nastavení resetováno",
      description: "Všechna nastavení byla vrácena na výchozí hodnoty.",
    });
  };

  const updateNestedSetting = (section: keyof UserSettings, key: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <UnifiedHeader />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Nastavení</h1>
          <p className="text-muted-foreground">Základní nastavení a souhlas se zpracováním údajů</p>
        </div>

        <div className="space-y-6">
          {/* Privacy & Consent Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Soukromí a souhlas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Zpracování osobních údajů</h4>
                  <p className="text-sm text-muted-foreground">
                    Souhlas se zpracováním osobních údajů podle GDPR
                  </p>
                </div>
                <Switch
                  checked={localSettings.privacy.dataProcessingConsent}
                  onCheckedChange={(checked) => updateNestedSetting('privacy', 'dataProcessingConsent', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Marketing</h4>
                  <p className="text-sm text-muted-foreground">
                    Souhlas s marketingovými sděleními a nabídkami
                  </p>
                </div>
                <Switch
                  checked={localSettings.privacy.marketingConsent}
                  onCheckedChange={(checked) => updateNestedSetting('privacy', 'marketingConsent', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Analytika</h4>
                  <p className="text-sm text-muted-foreground">
                    Pomoci zlepšit aplikaci anonymní analýzou používání
                  </p>
                </div>
                <Switch
                  checked={localSettings.privacy.analyticsConsent}
                  onCheckedChange={(checked) => updateNestedSetting('privacy', 'analyticsConsent', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Basic Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Základní nastavení
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Jazyk</h4>
                  <Select
                    value={localSettings.basic.language}
                    onValueChange={(value) => updateNestedSetting('basic', 'language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cs">Čeština</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="sk">Slovenčina</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Téma</h4>
                  <Select
                    value={localSettings.basic.theme}
                    onValueChange={(value) => updateNestedSetting('basic', 'theme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Světlé</SelectItem>
                      <SelectItem value="dark">Tmavé</SelectItem>
                      <SelectItem value="system">Systémové</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Communication Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Komunikace
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email upozornění</h4>
                  <p className="text-sm text-muted-foreground">
                    Dostávejte důležitá upozornění na email
                  </p>
                </div>
                <Switch
                  checked={localSettings.communication.emailNotifications}
                  onCheckedChange={(checked) => updateNestedSetting('communication', 'emailNotifications', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Newsletter</h4>
                  <p className="text-sm text-muted-foreground">
                    Přihlásit se k odběru newsletteru s novinkami
                  </p>
                </div>
                <Switch
                  checked={localSettings.communication.newsletter}
                  onCheckedChange={(checked) => updateNestedSetting('communication', 'newsletter', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={handleReset}>
            Resetovat vše
          </Button>
          <Button onClick={handleSave}>
            Uložit změny
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
