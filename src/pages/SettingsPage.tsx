import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Check, LogOut, Pencil, Trash2, X } from "lucide-react";
import { SidebarLayout } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/components/AuthGate";
import { Project, useProject } from "@/contexts/ProjectContext";
import { supabase } from "@/integrations/visible7/client";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseProgress } from "@/hooks/useSupabaseProgress";
import { CertificatesPanel } from "@/components/CertificatesPanel";
import { ConsentSettings, ProfileForm } from "@/components/settings/ProfileSettings";

const PLAN_LABELS: Record<string, string> = {
  free: "Zdarma (fáze 1 a 2)",
  mesic: "Placený přístup – 1 měsíc",
  ctvrtleti: "Placený přístup – 3 měsíce",
  rok: "Placený přístup – 1 rok",
  kod: "Přístup přes kód",
};

const SECTIONS = [
  { id: "ucet", label: "Profil" },
  { id: "projekty", label: "Projekty" },
  { id: "osvedceni", label: "Osvědčení" },
  { id: "souhlasy", label: "Souhlasy a GDPR" },
  { id: "zabezpeceni", label: "Zabezpečení" },
];

const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
  <section id={id} className="scroll-mt-24 rounded-2xl border border-border bg-card p-6">
    <h2 className="mb-4 text-lg font-bold">{title}</h2>
    {children}
  </section>
);

const ProjectRow = ({ project }: { project: Project }) => {
  const { renameProject, deleteProject, currentProject } = useProject();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(project.name);

  if (editing) {
    return (
      <form
        className="flex items-center gap-2 py-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (name.trim()) await renameProject(project.id, name);
          setEditing(false);
        }}
      >
        <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus aria-label="Nový název projektu" />
        <Button type="submit" size="icon" className="h-11 w-11 shrink-0 rounded-xl" aria-label="Uložit">
          <Check className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-11 w-11 shrink-0 rounded-xl"
          onClick={() => setEditing(false)}
          aria-label="Zrušit"
        >
          <X className="h-4 w-4" />
        </Button>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate font-semibold">{project.name}</p>
        <p className="text-xs text-muted-foreground">
          Založeno {new Date(project.created_at).toLocaleDateString("cs-CZ")}
          {project.id === currentProject?.id ? ", právě otevřený" : ""}
        </p>
      </div>
      <div className="flex shrink-0 gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setName(project.name);
            setEditing(true);
          }}
          aria-label={`Přejmenovat ${project.name}`}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-red-700" aria-label={`Smazat ${project.name}`}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Smazat projekt „{project.name}“?</AlertDialogTitle>
              <AlertDialogDescription>
                Projekt i všechny jeho fáze zmizí z vašeho přehledu a nepůjde ho obnovit. Osvědčení, která jste za něj
                získali, zůstanou platná.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-[10px]">Ponechat</AlertDialogCancel>
              <AlertDialogAction
                className="rounded-[10px] bg-red-700 text-white hover:bg-red-800"
                onClick={async () => {
                  const ok = await deleteProject(project.id);
                  toast(
                    ok
                      ? { title: "Projekt smazán", description: `„${project.name}“ už na přehledu neuvidíte.` }
                      : { title: "Projekt se nepodařilo smazat", variant: "destructive" },
                  );
                }}
              >
                Smazat projekt
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

/** Nastavení (ozubené kolo): účet, projekty, osvědčení, heslo, odhlášení. */
const SettingsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { projects } = useProject();
  const { toast } = useToast();
  const [access, setAccess] = useState<{ plan: string; access_until: string | null } | null>(null);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [completed] = useSupabaseProgress<number[]>("completed_phases", []);

  useEffect(() => {
    supabase
      .from("user_access")
      .select("plan, access_until")
      .maybeSingle()
      .then(({ data }) => setAccess((data as { plan: string; access_until: string | null } | null) ?? null));
  }, []);

  // Odkaz s #kotvou (např. z přehledu na osvědčení) posune stránku na sekci.
  useEffect(() => {
    if (!location.hash) return;
    const t = setTimeout(
      () => document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "smooth" }),
      300,
    );
    return () => clearTimeout(t);
  }, [location.hash]);

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
    <SidebarLayout>
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-8 sm:py-10">
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight">Nastavení</h1>
          <nav aria-label="Sekce nastavení" className="mt-4 flex flex-wrap gap-2">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="rounded-full border border-border px-3 py-1.5 text-sm font-semibold hover:border-primary hover:text-primary"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </header>

        <Section id="ucet" title="Profil">
          <ProfileForm />
          <p className="mt-5 border-t border-border pt-4 text-sm">
            <span className="text-muted-foreground">Přístup: </span>
            <span className="font-semibold">
              {access ? (PLAN_LABELS[access.plan] ?? access.plan) : "…"}
              {until && ` (platí do ${until})`}
            </span>
          </p>
        </Section>

        <Section id="projekty" title={`Projekty (${projects.length})`}>
          <div className="divide-y divide-border">
            {projects.map((p) => (
              <ProjectRow key={p.id} project={p} />
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Nový projekt založíte v levém panelu tlačítkem „Nový projekt“.
          </p>
        </Section>

        <div id="osvedceni" className="scroll-mt-24">
          <CertificatesPanel completed={completed} />
        </div>

        <Section id="souhlasy" title="Souhlasy a ochrana osobních údajů">
          <ConsentSettings />
        </Section>

        <Section id="zabezpeceni" title="Zabezpečení">
          <form onSubmit={changePassword} className="flex flex-col gap-3 sm:flex-row">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nové heslo (min. 6 znaků)"
              aria-label="Nové heslo"
            />
            <Button type="submit" className="h-11 shrink-0 rounded-[10px]" disabled={saving || !password}>
              Změnit heslo
            </Button>
          </form>
        </Section>

        <Button
          variant="outline"
          className="rounded-[10px] text-red-700 hover:text-red-800"
          onClick={async () => {
            await signOut();
            navigate("/home");
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Odhlásit se
        </Button>
      </main>
    </SidebarLayout>
  );
};

export default SettingsPage;
