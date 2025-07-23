
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UnifiedHeader } from "@/components/layout/UnifiedHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { UserSettings, defaultUserSettings } from "@/types/user";
import { Settings, Bell, Palette, Database, Shield, User } from "lucide-react";

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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Nastavení</h1>
          <p className="text-muted-foreground">Přizpůsobte si aplikaci podle svých potřeb</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Obecné
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Upozornění
            </TabsTrigger>
            <TabsTrigger value="display" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Zobrazení
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Data
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Zabezpečení
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Účet
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Obecné nastavení</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="language">Jazyk</Label>
                    <Select
                      value={localSettings.general.language}
                      onValueChange={(value) => updateNestedSetting('general', 'language', value)}
                    >
                      <SelectTrigger className="mt-1">
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
                    <Label htmlFor="timezone">Časové pásmo</Label>
                    <Select
                      value={localSettings.general.timezone}
                      onValueChange={(value) => updateNestedSetting('general', 'timezone', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Europe/Prague">Europe/Prague</SelectItem>
                        <SelectItem value="Europe/Vienna">Europe/Vienna</SelectItem>
                        <SelectItem value="Europe/Berlin">Europe/Berlin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateFormat">Formát data</Label>
                    <Select
                      value={localSettings.general.dateFormat}
                      onValueChange={(value) => updateNestedSetting('general', 'dateFormat', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD.MM.YYYY">DD.MM.YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="currency">Měna</Label>
                    <Select
                      value={localSettings.general.currency}
                      onValueChange={(value) => updateNestedSetting('general', 'currency', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CZK">CZK</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Upozornění</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email upozornění</Label>
                    <p className="text-sm text-muted-foreground">Dostávejte upozornění na email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={localSettings.notifications.email}
                    onCheckedChange={(checked) => updateNestedSetting('notifications', 'email', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications">Push upozornění</Label>
                    <p className="text-sm text-muted-foreground">Dostávejte upozornění v prohlížeči</p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={localSettings.notifications.push}
                    onCheckedChange={(checked) => updateNestedSetting('notifications', 'push', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="marketing-notifications">Marketing</Label>
                    <p className="text-sm text-muted-foreground">Dostávejte marketingové zprávy</p>
                  </div>
                  <Switch
                    id="marketing-notifications"
                    checked={localSettings.notifications.marketing}
                    onCheckedChange={(checked) => updateNestedSetting('notifications', 'marketing', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="update-notifications">Aktualizace</Label>
                    <p className="text-sm text-muted-foreground">Dostávejte informace o aktualizacích</p>
                  </div>
                  <Switch
                    id="update-notifications"
                    checked={localSettings.notifications.updates}
                    onCheckedChange={(checked) => updateNestedSetting('notifications', 'updates', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="display">
            <Card>
              <CardHeader>
                <CardTitle>Zobrazení</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="theme">Téma</Label>
                  <Select
                    value={localSettings.display.theme}
                    onValueChange={(value) => updateNestedSetting('display', 'theme', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Světlé</SelectItem>
                      <SelectItem value="dark">Tmavé</SelectItem>
                      <SelectItem value="system">Systémové</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="density">Hustota rozložení</Label>
                  <Select
                    value={localSettings.display.density}
                    onValueChange={(value) => updateNestedSetting('display', 'density', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Kompaktní</SelectItem>
                      <SelectItem value="comfortable">Pohodlné</SelectItem>
                      <SelectItem value="spacious">Prostorné</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sidebar-collapsed">Sbalený sidebar</Label>
                    <p className="text-sm text-muted-foreground">Automaticky sbalit boční panel</p>
                  </div>
                  <Switch
                    id="sidebar-collapsed"
                    checked={localSettings.display.sidebarCollapsed}
                    onCheckedChange={(checked) => updateNestedSetting('display', 'sidebarCollapsed', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle>Správa dat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-save">Automatické ukládání</Label>
                    <p className="text-sm text-muted-foreground">Automaticky uložit změny</p>
                  </div>
                  <Switch
                    id="auto-save"
                    checked={localSettings.data.autoSave}
                    onCheckedChange={(checked) => updateNestedSetting('data', 'autoSave', checked)}
                  />
                </div>

                <Separator />

                <div>
                  <Label htmlFor="backup-frequency">Frekvence zálohování</Label>
                  <Select
                    value={localSettings.data.backupFrequency}
                    onValueChange={(value) => updateNestedSetting('data', 'backupFrequency', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Denně</SelectItem>
                      <SelectItem value="weekly">Týdně</SelectItem>
                      <SelectItem value="monthly">Měsíčně</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="export-format">Formát exportu</Label>
                  <Select
                    value={localSettings.data.exportFormat}
                    onValueChange={(value) => updateNestedSetting('data', 'exportFormat', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Zabezpečení</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="two-factor">Dvoufázové ověření</Label>
                    <p className="text-sm text-muted-foreground">Zvýšit bezpečnost účtu</p>
                  </div>
                  <Switch
                    id="two-factor"
                    checked={localSettings.security.twoFactorEnabled}
                    onCheckedChange={(checked) => updateNestedSetting('security', 'twoFactorEnabled', checked)}
                  />
                </div>

                <Separator />

                <div>
                  <Label htmlFor="session-timeout">Timeout relace (minuty)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={localSettings.security.sessionTimeout}
                    onChange={(e) => updateNestedSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="login-alerts">Upozornění na přihlášení</Label>
                    <p className="text-sm text-muted-foreground">Dostávejte upozornění při přihlášení</p>
                  </div>
                  <Switch
                    id="login-alerts"
                    checked={localSettings.security.loginAlerts}
                    onCheckedChange={(checked) => updateNestedSetting('security', 'loginAlerts', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Nastavení účtu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="public-profile">Veřejný profil</Label>
                    <p className="text-sm text-muted-foreground">Umožnit ostatním vidět váš profil</p>
                  </div>
                  <Switch
                    id="public-profile"
                    checked={localSettings.account.publicProfile}
                    onCheckedChange={(checked) => updateNestedSetting('account', 'publicProfile', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allow-analytics">Povolit analytiku</Label>
                    <p className="text-sm text-muted-foreground">Pomoci zlepšit aplikaci</p>
                  </div>
                  <Switch
                    id="allow-analytics"
                    checked={localSettings.account.allowAnalytics}
                    onCheckedChange={(checked) => updateNestedSetting('account', 'allowAnalytics', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="newsletter">Newsletter</Label>
                    <p className="text-sm text-muted-foreground">Přihlásit se k odběru newsletteru</p>
                  </div>
                  <Switch
                    id="newsletter"
                    checked={localSettings.account.subscribeNewsletter}
                    onCheckedChange={(checked) => updateNestedSetting('account', 'subscribeNewsletter', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
