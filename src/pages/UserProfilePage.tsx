import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UnifiedHeader } from "@/components/layout/UnifiedHeader";
import { BackButton } from "@/components/ui/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderOpen, KeyRound, LogOut, User } from "lucide-react";
import { useAuth } from "@/components/AuthGate";
import { useProject } from "@/contexts/ProjectContext";
import { supabase } from "@/integrations/visible7/client";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseProgress } from "@/hooks/useSupabaseProgress";
import { CertificatesPanel } from "@/components/CertificatesPanel";

const PLAN_LABELS: Record<string, string> = {
  free: "Zdarma (fáze 1 a 2)",
  mesic: "Placený přístup – 1 měsíc",
  ctvrtleti: "Placený přístup – 3 měsíce",
  rok: "Placený přístup – 1 rok",
  kod: "Přístup přes kód",
};

interface Access {
  plan: string;
  access_until: string | null;
}

const UserProfilePage = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { projects } = useProject();
  const { toast } = useToast();
  const [access, setAccess] = useState<Access | null>(null);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [completed] = useSupabaseProgress<number[]>("completed_phases", []);

  const meta = (user?.user_metadata ?? {}) as { first_name?: string; last_name?: string };
  const fullName = [meta.first_name, meta.last_name].filter(Boolean).join(" ");

  useEffect(() => {
    supabase
      .from("user_access")
      .select("plan, access_until")
      .maybeSingle()
      .then(({ data }) => setAccess((data as Access | null) ?? null));
  }, []);

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Heslo je příliš krátké", description: "Použijte alespoň 6 znaků.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) {
      toast({ title: "Heslo se nepodařilo změnit", description: error.message, variant: "destructive" });
      return;
    }
    setPassword("");
    toast({ title: "Heslo změněno" });
  };

  const until = access?.access_until ? new Date(access.access_until).toLocaleDateString("cs-CZ") : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <UnifiedHeader />
      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        <BackButton onBack={() => navigate("/home")} />
        <div>
          <h1 className="text-3xl font-bold mb-2">Můj účet</h1>
          <p className="text-muted-foreground">Přihlášení, přístup a projekty</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Účet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {fullName && (
              <p>
                <span className="text-muted-foreground">Jméno: </span>
                {fullName}
              </p>
            )}
            <p>
              <span className="text-muted-foreground">E-mail: </span>
              {user?.email}
            </p>
            <p>
              <span className="text-muted-foreground">Přístup: </span>
              {access ? PLAN_LABELS[access.plan] ?? access.plan : "…"}
              {until && ` (platí do ${until})`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Projekty
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="mb-3 text-muted-foreground">
              Máte {projects.length} {projects.length === 1 ? "projekt" : projects.length < 5 ? "projekty" : "projektů"}. Přepínat a zakládat je můžete na přehledu.
            </p>
            <Button variant="outline" className="rounded-xl" onClick={() => navigate("/home")}>
              Přejít na přehled
            </Button>
          </CardContent>
        </Card>

        <CertificatesPanel completed={completed} />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5" />
              Změna hesla
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={changePassword} className="flex flex-col gap-3 sm:flex-row">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nové heslo (min. 6 znaků)"
                className="h-10 rounded-xl"
              />
              <Button type="submit" className="h-10 rounded-xl" disabled={saving || !password}>
                Změnit heslo
              </Button>
            </form>
          </CardContent>
        </Card>

        <Button
          variant="outline"
          className="rounded-xl text-red-600 hover:text-red-700"
          onClick={async () => {
            await signOut();
            navigate("/home");
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Odhlásit se
        </Button>
      </div>
    </div>
  );
};

export default UserProfilePage;
