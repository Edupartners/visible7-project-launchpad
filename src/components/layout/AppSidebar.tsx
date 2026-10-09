import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Award, Check, FolderOpen, LogOut, Menu, Plus, Settings, Users, X } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/AuthGate";
import { useProject } from "@/contexts/ProjectContext";

const initials = (email: string) => email.split("@")[0].slice(0, 2).toUpperCase();

/** Obsah postranního panelu – projekty nahoře, odkazy a účet s ozubeným kolem dole (jako ChatGPT/Claude). */
const SidebarBody = ({ onNavigate }: { onNavigate?: () => void }) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { projects, currentProject, switchProject, createProject } = useProject();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const email = user?.email ?? "";

  const go = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createProject(name);
    setName("");
    setCreating(false);
    go("/home");
  };

  return (
    <div className="flex h-full flex-col">
      <button
        type="button"
        onClick={() => go("/home")}
        className="flex items-center gap-2.5 px-4 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="VISIBLE7 MICEK – přehled"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-foreground text-[13px] font-bold text-white">
          V7
        </span>
        <span className="text-[17px] font-semibold tracking-tight">
          VISIBLE7 <span className="font-normal text-muted-foreground">MICEK™</span>
        </span>
      </button>

      <div className="px-3">
        {creating ? (
          <form onSubmit={submit} className="flex items-center gap-1.5">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Název projektu"
              className="h-10"
              autoFocus
              aria-label="Název nového projektu"
            />
            <button
              type="submit"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"
              aria-label="Založit projekt"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl hover:bg-muted"
              aria-label="Zrušit"
            >
              <X className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="flex w-full items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-semibold hover:border-primary/40"
          >
            <Plus className="h-4 w-4" /> Nový projekt
          </button>
        )}
      </div>

      <p className="px-4 pb-1 pt-5 text-xs font-semibold text-muted-foreground">Projekty</p>
      <nav aria-label="Projekty" className="min-h-0 flex-1 overflow-y-auto px-2">
        <ul className="space-y-0.5">
          {projects.map((p) => {
            const active = p.id === currentProject?.id;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => {
                    switchProject(p.id);
                    go("/home");
                  }}
                  aria-current={active ? "page" : undefined}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm ${
                    active ? "bg-primary/10 font-semibold text-foreground" : "text-foreground/80 hover:bg-muted"
                  }`}
                >
                  <FolderOpen className={`h-4 w-4 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="truncate">{p.name}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <p className="px-2 pb-1 pt-5 text-xs font-semibold text-muted-foreground">Další</p>
        <ul className="space-y-0.5">
          <li>
            <button
              type="button"
              onClick={() => go("/poradci")}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-foreground/80 hover:bg-muted"
            >
              <Users className="h-4 w-4 text-muted-foreground" /> Seniorní poradci
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => go("/settings#osvedceni")}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-foreground/80 hover:bg-muted"
            >
              <Award className="h-4 w-4 text-muted-foreground" /> Moje osvědčení
            </button>
          </li>
        </ul>
      </nav>

      {/* Účet dole – jako v ChatGPT/Claude */}
      <div className="border-t border-border p-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => go("/settings")}
            className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2 py-2 text-left hover:bg-muted"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
              {initials(email || "?")}
            </span>
            <span className="truncate text-sm">{email}</span>
          </button>
          <button
            type="button"
            onClick={() => go("/settings")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Nastavení"
            title="Nastavení"
          >
            <Settings className="h-[18px] w-[18px]" />
          </button>
          <button
            type="button"
            onClick={async () => {
              await signOut();
              go("/home");
            }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Odhlásit se"
            title="Odhlásit se"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
};

/** Rozvržení s postranním panelem: na počítači stále vidět, na mobilu se otevře z horní lišty. */
export const SidebarLayout = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border bg-muted/40 lg:block">
        <SidebarBody />
      </aside>

      {/* Mobilní lišta */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-white/90 px-3 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted"
          aria-label="Otevřít menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-[17px] font-semibold tracking-tight">
          VISIBLE7 <span className="font-normal text-muted-foreground">MICEK™</span>
        </span>
        <button
          type="button"
          onClick={() => navigate("/settings")}
          className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted"
          aria-label="Nastavení"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SidebarBody onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
};
