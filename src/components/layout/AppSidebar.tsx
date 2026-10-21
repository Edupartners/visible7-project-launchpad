import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Award,
  Lock,
  Megaphone,
  Calculator,
  LayoutDashboard,
  Check,
  FileText,
  FlaskConical,
  FolderOpen,
  Globe,
  Globe2,
  Map,
  LogOut,
  Menu,
  Plus,
  Presentation,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { loadSeminars, sortSeminars } from "@/lib/seminars";
import { useIsAdmin } from "@/lib/admin";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { SidebarMembership } from "@/components/access/MembershipCta";
import { NotificationBell } from "@/components/announcements/NotificationBell";
import { useAuth } from "@/components/AuthGate";
import { useProject } from "@/contexts/ProjectContext";
import { AppHeader } from "./AppHeader";
import { useSupabaseProgress } from "@/hooks/useSupabaseProgress";
import { FREE_GATES, useAccess } from "@/lib/access";

const GATE_ROUTES = [
  { name: "Vize", route: "/vision" },
  { name: "Ideace", route: "/ideation" },
  { name: "Strategie a čísla", route: "/strategy" },
  { name: "Implementace", route: "/implementation" },
  { name: "Budování poptávky", route: "/benchmarking-phase" },
  { name: "Launch", route: "/launch" },
  { name: "Expanze", route: "/expansion" },
];

const itemCls = (active: boolean) =>
  `flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm ${
    active ? "bg-primary/10 font-semibold text-foreground" : "text-foreground/80 hover:bg-muted"
  }`;

const initials = (email: string) => email.split("@")[0].slice(0, 2).toUpperCase();

/** Odkaz na živé semináře s datem nejbližšího termínu. */
const SidebarSeminars = ({ onClick }: { onClick: () => void }) => {
  const [next, setNext] = useState<string | null>(null);
  useEffect(() => {
    loadSeminars()
      .then((list) => {
        const s = sortSeminars(list).up.find((x) => x.starts_at);
        if (s?.starts_at)
          setNext(new Date(s.starts_at).toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric" }));
      })
      .catch(() => undefined);
  }, []);
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-1.5 flex w-full items-center gap-2 rounded-lg bg-primary/5 px-2.5 py-2 text-left text-sm font-semibold text-primary hover:bg-primary/10"
    >
      <Presentation className="h-4 w-4" /> Živé semináře
      {next && <span className="ml-auto text-xs font-normal text-muted-foreground">{next}</span>}
    </button>
  );
};

/** Obsah postranního panelu – projekty nahoře, odkazy a účet s ozubeným kolem dole (jako ChatGPT/Claude). */
const SidebarBody = ({ onNavigate }: { onNavigate?: () => void }) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { projects, currentProject, switchProject, createProject } = useProject();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const email = user?.email ?? "";
  const isAdmin = useIsAdmin();
  const { pathname } = useLocation();
  const access = useAccess();
  const [completedPhases] = useSupabaseProgress<number[]>("completed_phases", []);
  const done = new Set(completedPhases);
  const nextGate = [1, 2, 3, 4, 5, 6, 7].find((n) => !done.has(n));
  const pitchReady = [1, 2, 3].every((n) => done.has(n));

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
      <div className="flex items-center justify-between pr-3">
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
            VISIBLE7 <span className="font-normal text-muted-foreground">MICEK®</span>
          </span>
        </button>
        {!onNavigate && <NotificationBell />}
      </div>

      <nav aria-label="Menu" className="min-h-0 flex-1 overflow-y-auto px-2 pt-2">
        <p className="px-2 pb-1 pt-1 text-xs font-semibold text-muted-foreground">Projekty</p>
        <div className="px-1 pb-1.5">
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

        <div className="pt-4" />
        <ul className="space-y-0.5">
          <li>
            <button
              type="button"
              onClick={() => go("/home")}
              aria-current={pathname === "/home" ? "page" : undefined}
              className={itemCls(pathname === "/home")}
            >
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" /> Přehled
            </button>
          </li>
        </ul>

        <p className="px-2 pb-1 pt-5 text-xs font-semibold text-muted-foreground">Moje cesta</p>
        <ol className="space-y-0.5">
          {GATE_ROUTES.map((g, i) => {
            const n = i + 1;
            const isDone = done.has(n);
            const locked = !isDone && !FREE_GATES.includes(n) && !access.full;
            const isNext = !isDone && n === nextGate;
            const active = pathname === g.route;
            return (
              <li key={g.route}>
                <button
                  type="button"
                  onClick={() => go(g.route)}
                  aria-current={active ? "page" : undefined}
                  className={itemCls(active)}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                      isDone
                        ? "bg-emerald-500 text-white"
                        : isNext
                          ? "bg-orange-500 text-white"
                          : "border border-border text-muted-foreground"
                    }`}
                  >
                    {isDone ? <Check className="h-3 w-3" /> : n}
                  </span>
                  <span className={`truncate ${locked ? "text-muted-foreground" : ""}`}>{g.name}</span>
                  {locked && <Lock className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                </button>
              </li>
            );
          })}
        </ol>

        <p className="px-2 pb-1 pt-5 text-xs font-semibold text-muted-foreground">Nástroje</p>
        <ul className="space-y-0.5">
          <li>
            <button
              type="button"
              onClick={() => go("/strategy")}
              aria-current={pathname === "/strategy" ? "page" : undefined}
              className={itemCls(pathname === "/strategy")}
            >
              <Calculator className="h-4 w-4 text-muted-foreground" /> Finanční plán
            </button>
          </li>
          <li>
            <button type="button" onClick={() => go("/mapa-cesty")} className={itemCls(pathname === "/mapa-cesty")}>
              <Map className="h-4 w-4 text-muted-foreground" /> Mapa cesty A → D
            </button>
          </li>
          <li>
            <button type="button" onClick={() => go("/rentgen-trhu")} className={itemCls(pathname === "/rentgen-trhu")}>
              <Globe2 className="h-4 w-4 text-muted-foreground" /> Rentgen trhu
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => go("/benchmarking-phase")}
              aria-current={pathname === "/benchmarking-phase" ? "page" : undefined}
              className={itemCls(pathname === "/benchmarking-phase")}
            >
              <Megaphone className="h-4 w-4 text-muted-foreground" /> Marketingové kanály
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => go("/investor-pitch")}
              aria-current={pathname === "/investor-pitch" ? "page" : undefined}
              className={itemCls(pathname === "/investor-pitch")}
              title={pitchReady ? undefined : "Dostupné po dokončení bran 1–3"}
            >
              <Presentation className="h-4 w-4 text-muted-foreground" />
              <span className={pitchReady ? "" : "text-muted-foreground"}>Pitch pro investory</span>
              {!pitchReady && <Lock className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => go("/listy")}
              aria-current={pathname === "/listy" ? "page" : undefined}
              className={itemCls(pathname === "/listy")}
            >
              <FileText className="h-4 w-4 text-muted-foreground" /> Pracovní listy
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => go("/testovaci-stranka")}
              aria-current={pathname === "/testovaci-stranka" ? "page" : undefined}
              className={itemCls(pathname === "/testovaci-stranka")}
            >
              <FlaskConical className="h-4 w-4 text-muted-foreground" /> Web projektu (test zájmu)
            </button>
          </li>
        </ul>

        <p className="px-2 pb-1 pt-5 text-xs font-semibold text-muted-foreground">Pomoc a výsledky</p>
        <ul className="space-y-0.5">
          <li>
            <button
              type="button"
              onClick={() => go("/poradci")}
              aria-current={pathname === "/poradci" ? "page" : undefined}
              className={itemCls(pathname === "/poradci")}
            >
              <Users className="h-4 w-4 text-muted-foreground" /> Seniorní poradci
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => go("/settings#osvedceni")}
              aria-current={pathname === "/settings#osvedceni" ? "page" : undefined}
              className={itemCls(pathname === "/settings#osvedceni")}
            >
              <Award className="h-4 w-4 text-muted-foreground" /> Moje osvědčení
            </button>
          </li>
        </ul>

        <ul className="mt-3 space-y-0.5 border-t border-border pt-3">
          <li>
            <button
              type="button"
              onClick={() => go("/")}
              aria-current={pathname === "/" ? "page" : undefined}
              className={itemCls(pathname === "/")}
            >
              <Globe className="h-4 w-4 text-muted-foreground" /> Úvodní stránka webu
            </button>
          </li>
          {isAdmin && (
            <li>
              <button
                type="button"
                onClick={() => go("/admin")}
                aria-current={pathname === "/admin" ? "page" : undefined}
                className={itemCls(pathname === "/admin")}
              >
                <ShieldCheck className="h-4 w-4 text-muted-foreground" /> Administrace
              </button>
            </li>
          )}
        </ul>
      </nav>

      <div className="px-3 pb-2">
        <SidebarSeminars onClick={() => go("/seminare")} />
        <SidebarMembership onNavigate={onNavigate} />
      </div>

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

/** Rozvržení aplikace: horizontální hlavička (jako Ecomail), na mobilu menu z boku. */
export const SidebarLayout = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <AppHeader onOpenMobile={() => setOpen(true)} />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SidebarBody onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="min-w-0">{children}</div>
    </div>
  );
};
