import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, CheckCircle, XCircle, Server, Database, Globe, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WordPressInstallFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface InstallationResult {
  success: boolean;
  message?: string;
  error?: string;
  site_url?: string;
  admin_url?: string;
  admin_username?: string;
  admin_password?: string;
  timestamp?: string;
  output?: string;
}

export const WordPressInstallForm = ({ open, onOpenChange }: WordPressInstallFormProps) => {
  const { toast } = useToast();
  const [isInstalling, setIsInstalling] = useState(false);
  const [result, setResult] = useState<InstallationResult | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsInstalling(true);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    
    const data = {
      target_domain: formData.get('target_domain') as string,
      ftp: {
        server: formData.get('ftp_server') as string,
        username: formData.get('ftp_username') as string,
        password: formData.get('ftp_password') as string,
      },
      database: {
        host: formData.get('db_host') as string,
        name: formData.get('db_name') as string,
        username: formData.get('db_username') as string,
        password: formData.get('db_password') as string,
      },
      wordpress: {
        admin_username: formData.get('admin_username') as string,
        admin_password: formData.get('admin_password') as string,
        admin_email: formData.get('admin_email') as string,
        site_title: formData.get('site_title') as string,
        site_url: formData.get('site_url') as string,
        language: 'cs_CZ',
      },
    };

    try {
      const response = await fetch('https://api.micek.group/api/index.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseText = await response.text();
      let parsedResult: InstallationResult;

      try {
        parsedResult = JSON.parse(responseText);
      } catch (parseError) {
        const jsonMatch = responseText.match(/\{.*\}/s);
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Neplatný formát odpovědi');
        }
      }

      setResult(parsedResult);

      if (parsedResult.success) {
        toast({
          title: "Instalace dokončena!",
          description: "WordPress byl úspěšně nainstalován.",
        });
      } else {
        toast({
          title: "Instalace selhala",
          description: parsedResult.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorResult: InstallationResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Neznámá chyba',
      };
      setResult(errorResult);
      
      toast({
        title: "Chyba spojení",
        description: errorResult.error,
        variant: "destructive",
      });
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Instalace WordPress + Elementor</DialogTitle>
          <DialogDescription>
            Vyplňte údaje pro automatickou instalaci WordPress s Elementor pluginem
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className={`p-6 rounded-lg ${result.success ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
            {result.success ? (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-900">Instalace úspěšná!</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p><strong>URL webu:</strong> <a href={result.site_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{result.site_url}</a></p>
                  <p><strong>Admin panel:</strong> <a href={result.admin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{result.admin_url}</a></p>
                  <p><strong>Uživatelské jméno:</strong> {result.admin_username}</p>
                  <p><strong>Heslo:</strong> {result.admin_password}</p>
                  {result.timestamp && <p className="text-muted-foreground">Dokončeno: {result.timestamp}</p>}
                </div>
                <Button onClick={() => { setResult(null); onOpenChange(false); }} className="mt-4">
                  Zavřít
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <XCircle className="w-6 h-6 text-red-600" />
                  <h3 className="text-lg font-semibold text-red-900">Instalace selhala</h3>
                </div>
                <p className="text-sm text-red-800 mb-4">{result.error}</p>
                <Button onClick={() => setResult(null)} variant="outline">
                  Zkusit znovu
                </Button>
              </>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Target Domain */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Globe className="w-5 h-5" />
                  Cílová doména
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="target_domain">Doména *</Label>
                  <Input
                    id="target_domain"
                    name="target_domain"
                    placeholder="example.com"
                    required
                    disabled={isInstalling}
                  />
                </div>
              </CardContent>
            </Card>

            {/* FTP Credentials */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Server className="w-5 h-5" />
                  FTP přístup
                </CardTitle>
                <CardDescription>Údaje pro nahrání souborů na server</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="ftp_server">FTP Server *</Label>
                  <Input
                    id="ftp_server"
                    name="ftp_server"
                    placeholder="ftp.example.com"
                    required
                    disabled={isInstalling}
                  />
                </div>
                <div>
                  <Label htmlFor="ftp_username">FTP Uživatel *</Label>
                  <Input
                    id="ftp_username"
                    name="ftp_username"
                    required
                    disabled={isInstalling}
                  />
                </div>
                <div>
                  <Label htmlFor="ftp_password">FTP Heslo *</Label>
                  <Input
                    id="ftp_password"
                    name="ftp_password"
                    type="password"
                    required
                    disabled={isInstalling}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Database Credentials */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Database className="w-5 h-5" />
                  Databáze
                </CardTitle>
                <CardDescription>Údaje pro připojení k MySQL databázi</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="db_host">Host databáze *</Label>
                  <Input
                    id="db_host"
                    name="db_host"
                    placeholder="mysql.example.com"
                    required
                    disabled={isInstalling}
                  />
                </div>
                <div>
                  <Label htmlFor="db_name">Název databáze *</Label>
                  <Input
                    id="db_name"
                    name="db_name"
                    required
                    disabled={isInstalling}
                  />
                </div>
                <div>
                  <Label htmlFor="db_username">DB Uživatel *</Label>
                  <Input
                    id="db_username"
                    name="db_username"
                    required
                    disabled={isInstalling}
                  />
                </div>
                <div>
                  <Label htmlFor="db_password">DB Heslo *</Label>
                  <Input
                    id="db_password"
                    name="db_password"
                    type="password"
                    required
                    disabled={isInstalling}
                  />
                </div>
              </CardContent>
            </Card>

            {/* WordPress Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5" />
                  Nastavení WordPress
                </CardTitle>
                <CardDescription>Administrátorský účet a základní nastavení</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="site_title">Název webu *</Label>
                  <Input
                    id="site_title"
                    name="site_title"
                    placeholder="Můj WordPress web"
                    required
                    disabled={isInstalling}
                  />
                </div>
                <div>
                  <Label htmlFor="site_url">URL webu *</Label>
                  <Input
                    id="site_url"
                    name="site_url"
                    type="url"
                    placeholder="https://example.com"
                    required
                    disabled={isInstalling}
                  />
                </div>
                <div>
                  <Label htmlFor="admin_username">Admin uživatel *</Label>
                  <Input
                    id="admin_username"
                    name="admin_username"
                    defaultValue="admin"
                    required
                    disabled={isInstalling}
                  />
                </div>
                <div>
                  <Label htmlFor="admin_password">Admin heslo *</Label>
                  <Input
                    id="admin_password"
                    name="admin_password"
                    type="password"
                    required
                    disabled={isInstalling}
                  />
                </div>
                <div>
                  <Label htmlFor="admin_email">Admin email *</Label>
                  <Input
                    id="admin_email"
                    name="admin_email"
                    type="email"
                    required
                    disabled={isInstalling}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isInstalling}
              >
                Zrušit
              </Button>
              <Button type="submit" disabled={isInstalling}>
                {isInstalling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Instaluji... (2-5 minut)
                  </>
                ) : (
                  '🚀 Spustit instalaci'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
