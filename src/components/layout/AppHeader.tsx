import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Award,
  Calculator,
  Check,
  ChevronDown,
  FileText,
  FlaskConical,
  Globe,
  Lock,
  LogOut,
  Map,
  Megaphone,
  Plus,
  Presentation,
  Settings,
  ShieldCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NotificationBell } from "@/components/announcements/NotificationBell";
import { SidebarMembership } from "@/components/access/MembershipCta";
import { useAuth } from "@/components/AuthGate";
import { useProject } from "@/contexts/ProjectContext";
import { useSupabaseProgress } from "@/hooks/useSupabaseProgress";
import { FREE_GATES, useAccess } from "@/lib/access";
import { useIsAdmin } from "@/lib/admin";

export const GATE_ROUTES = [
  { name: "Vize", route: "/vision" },
  { name: "Ideace", route: "/ideation" },
  { name: "Strategie a čísla", route: "/strategy" },
  { name: "Implementace", route: "/implementation" },
  { name: "Budování poptávky", route: "/benchmarking-phase" },
  { name: "Launch", route: "/launch" },
  { name: "Expanze", route: "/expansion" },
];

/** Stav bran aktuálního projektu: hotové, další na řadě, zamčené a připravenost pitche. */
export const useGateStatus = () => {
  const access = useAccess();
  const [completedPhases] = useSupabaseProgress<number[]>("completed_phases", []);
  const done = new Set(completedPhases);
  const nextGate = [1, 2, 3, 4, 5, 6, 7].find((n) => !done.has(n));
  const locked = (n: number) => !done.has(n) && !FREE_GATES.includes(n) && !access.full;
  const pitchReady = [1, 2, 3].every((n) => done.has(n));
  return { done, nextGate, locked, pitchReady };
};

const navCls = (active: boolean) =>
  `relative flex h-16 items-center gap-1 px-3 text-sm font-medium transition-colors ${
    active
      ? "text-foreground after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-orange-500"
      : "text-muted-foreground hover:text-foreground"
  }`;

/** Tenký pruh pod hlavičkou na stránkách bran: kde na cestě jsem. */
const GateStrip = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { done, nextGate } = useGateStatus();
  const idx = GATE_ROUTES.findIndex((g) => g.route === pathname);
  if (idx < 0) return null;
  return (
    <div className="border-b border-border bg-muted/40">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 text-sm sm:px-6">
        <span className="font-semibold">
          Brána {idx + 1} ze 7: {GATE_ROUTES[idx].name}
        </span>
        <ol className="ml-auto flex items-center gap-1.5" aria-label="Postup na cestě">
          {GATE_ROUTES.map((g, i) => {
            const n = i + 1;
            return (
              <li key={g.route}>
                <button
                  type="button"
                  onClick={() => navigate(g.route)}
                  title={`${n} ${g.name}`}
                  aria-label={`Brána ${n}: ${g.name}`}
                  className={`block h-2.5 rounded-full transition-all ${i === idx ? "w-6" : "w-2.5"} ${
                    done.has(n) ? "bg-emerald-500" : n === nextGate ? "bg-orange-500" : "bg-border"
                  }`}
                />
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};

/** Horizontální hlavička aplikace (jako Ecomail): projekt vlevo, sekce uprostřed, účet vpravo. */
export const AppHeader = ({ onOpenMobile }: { onOpenMobile: () => void }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const { projects, currentProject, switchProject, createProject } = useProject();
  const isAdmin = useIsAdmin();
  const { done, nextGate, locked, pitchReady } = useGateStatus();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const email = user?.email ?? "";
  const onGate = GATE_ROUTES.some((g) => g.route === pathname);
  const onTool = ["/strategy", "/mapa-cesty", "/investor-pitch", "/listy", "/testovaci-stranka"].includes(pathname);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createProject(name);
    setName("");
    setCreating(false);
    navigate("/home");
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:px-6">
          <button
            type="button"
            onClick={onOpenMobile}
            className="-ml-2 flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted lg:hidden"
            aria-label="Otevřít menu"
          >
            <span className="space-y-1">
              <span className="block h-0.5 w-5 bg-foreground" />
              <span className="block h-0.5 w-5 bg-foreground" />
              <span className="block h-0.5 w-5 bg-foreground" />
            </span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-foreground text-[13px] font-bold text-white"
            aria-label="VISIBLE7 MICEK – přehled"
          >
            V7
          </button>

          {/* Přepínač projektů */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex min-w-0 max-w-[14rem] items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-semibold hover:bg-muted">
              <span className="truncate">{currentProject?.name ?? "Projekt"}</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuItem onSelect={() => setCreating(true)} className="font-semibold">
                <Plus className="mr-2 h-4 w-4" /> Nový projekt
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">Moje projekty</DropdownMenuLabel>
              {projects.map((p) => (
                <DropdownMenuItem
                  key={p.id}
                  onSelect={() => {
                    switchProject(p.id);
                    navigate("/home");
                  }}
                >
                  <span className="truncate">{p.name}</span>
                  {p.id === currentProject?.id && <Check className="ml-auto h-4 w-4 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <span className="mx-2 hidden h-6 w-px bg-border lg:block" aria-hidden="true" />

          <nav aria-label="Hlavní menu" className="hidden items-center lg:flex">
            <button type="button" onClick={() => navigate("/home")} className={navCls(pathname === "/home")}>
              Přehled
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger className={navCls(onGate)}>
                Moje cesta <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                {GATE_ROUTES.map((g, i) => {
                  const n = i + 1;
                  const isDone = done.has(n);
                  return (
                    <DropdownMenuItem key={g.route} onSelect={() => navigate(g.route)}>
                      <span
                        className={`mr-2.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                          isDone
                            ? "bg-emerald-500 text-white"
                            : n === nextGate
                              ? "bg-orange-500 text-white"
                              : "border border-border text-muted-foreground"
                        }`}
                      >
                        {isDone ? <Check className="h-3 w-3" /> : n}
                      </span>
                      <span className={locked(n) ? "text-muted-foreground" : ""}>{g.name}</span>
                      {locked(n) && <Lock className="ml-auto h-3.5 w-3.5 text-muted-foreground" />}
                      {n === nextGate && !locked(n) && (
                        <span className="ml-auto text-xs font-semibold text-orange-600">na řadě</span>
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className={navCls(onTool)}>
                Nástroje <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuItem onSelect={() => navigate("/strategy")}>
                  <Calculator className="mr-2.5 h-4 w-4 text-muted-foreground" /> Finanční plán
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate("/mapa-cesty")} disabled={!pitchReady}>
                  <Map className="mr-2.5 h-4 w-4 text-muted-foreground" /> Mapa cesty A → D
                  {!pitchReady && <Lock className="ml-auto h-3.5 w-3.5" />}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate("/benchmarking-phase")}>
                  <Megaphone className="mr-2.5 h-4 w-4 text-muted-foreground" /> Marketingové kanály
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate("/investor-pitch")} disabled={!pitchReady}>
                  <Presentation className="mr-2.5 h-4 w-4 text-muted-foreground" /> Pitch pro investory
                  {!pitchReady && <Lock className="ml-auto h-3.5 w-3.5" />}
                </DropdownMenuItem>
                {!pitchReady && (
                  <p className="px-2 pb-1 text-xs text-muted-foreground">Mapa a pitch se odemknou po bráně 3.</p>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate("/listy")}>
                  <FileText className="mr-2.5 h-4 w-4 text-muted-foreground" /> Pracovní listy
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate("/testovaci-stranka")}>
                  <FlaskConical className="mr-2.5 h-4 w-4 text-muted-foreground" /> Web projektu (test zájmu)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button type="button" onClick={() => navigate("/poradci")} className={navCls(pathname === "/poradci")}>
              Poradci
            </button>
            <button type="button" onClick={() => navigate("/seminare")} className={navCls(pathname === "/seminare")}>
              Semináře
            </button>
          </nav>

          <div className="ml-auto flex items-center gap-1">
            {done.size >= 2 && (
              <div className="hidden w-44 xl:block">
                <SidebarMembership />
              </div>
            )}
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger
                className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-semibold hover:ring-2 hover:ring-primary/20"
                aria-label="Účet"
              >
                {(email.split("@")[0] || "?").slice(0, 2).toUpperCase()}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
                  {email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate("/settings")}>
                  <Settings className="mr-2.5 h-4 w-4 text-muted-foreground" /> Nastavení
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate("/settings#osvedceni")}>
                  <Award className="mr-2.5 h-4 w-4 text-muted-foreground" /> Moje osvědčení
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate("/")}>
                  <Globe className="mr-2.5 h-4 w-4 text-muted-foreground" /> Úvodní stránka webu
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onSelect={() => navigate("/admin")}>
                    <ShieldCheck className="mr-2.5 h-4 w-4 text-muted-foreground" /> Administrace
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={async () => {
                    await signOut();
                    navigate("/home");
                  }}
                >
                  <LogOut className="mr-2.5 h-4 w-4 text-muted-foreground" /> Odhlásit se
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <GateStrip />

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-w-sm">
          <DialogTitle>Nový projekt</DialogTitle>
          <form onSubmit={submit} className="flex gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Název projektu"
              autoFocus
              aria-label="Název nového projektu"
            />
            <button type="submit" className="rounded-lg bg-primary px-4 text-sm font-semibold text-white">
              Založit
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
