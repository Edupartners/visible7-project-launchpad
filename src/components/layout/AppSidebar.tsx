import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Award,
  Briefcase,
  Crown,
  PanelLeftClose,
  PanelLeftOpen,
  Lock,
  Megaphone,
  Calculator,
  LayoutDashboard,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  FlaskConical,
  Gift,
  FolderOpen,
  Globe,
  Globe2,
  Map,
  LogOut,
  Plus,
  Presentation,
  Settings,
  ShieldCheck,
  Store,
  Users,
  X,
} from "lucide-react";
import { useIsAdmin } from "@/lib/admin";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SidebarMembership } from "@/components/access/MembershipCta";
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

const CESTA_KEY = "v7_sidebar_cesta";
const readCesta = () => {
  try {
    return localStorage.getItem(CESTA_KEY) === "1";
  } catch {
    return false;
  }
};
const BUSINESS_PATHS = ["/muj-podnik", "/cash-flow", "/financni-report"];
const TOOLS: [string, string, typeof Award][] = [
  ["Finanční plán", "/strategy", Calculator],
  ["Mapa cesty A → D", "/mapa-cesty", Map],
  ["Rentgen trhu", "/rentgen-trhu", Globe2],
  ["Marketingové kanály", "/benchmarking-phase", Megaphone],
  ["Pitch pro investory", "/investor-pitch", Presentation],
  ["Pracovní listy", "/listy", FileText],
  ["Web projektu (test zájmu)", "/testovaci-stranka", FlaskConical],
  ["Digitální kancelář", "/digitalni-kancelar", Briefcase],
];

const mainCls = (active: boolean) =>
  `flex h-11 w-full items-center gap-2.5 rounded-xl px-3 text-left text-[15px] ${
    active
      ? "bg-leaf-50 font-bold text-foreground shadow-[inset_3px_0_0_hsl(var(--primary))]"
      : "font-semibold text-foreground/85 hover:bg-muted"
  }`;

/**
 * Obsah postranního panelu: přepínač projektu nahoře, pár hlavních položek bez rolování, účet dole.
 * Nástroje a semináře jsou na počítači v horní liště, v bočním menu jen na mobilu.
 */
const SidebarBody = ({ onNavigate, onCollapse }: { onNavigate?: () => void; onCollapse?: () => void }) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { projects, currentProject, switchProject, createProject } = useProject();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const email = user?.email ?? "";
  const isAdmin = useIsAdmin();
  const { pathname, hash } = useLocation();
  const access = useAccess();
  const [completedPhases] = useSupabaseProgress<number[]>("completed_phases", []);
  const done = new Set(completedPhases);
  const nextGate = [1, 2, 3, 4, 5, 6, 7].find((n) => !done.has(n));
  const onGate = GATE_ROUTES.some((g) => g.route === pathname);
  const [cestaOpen, setCestaOpen] = useState(readCesta);
  const [toolsOpen, setToolsOpen] = useState(false);
  const showGates = cestaOpen || onGate;
  const toggleCesta = () => {
    const v = !showGates;
    setCestaOpen(v);
    try {
      localStorage.setItem(CESTA_KEY, v ? "1" : "0");
    } catch {
      /* soukromé okno */
    }
  };

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

  const onBusiness = BUSINESS_PATHS.includes(pathname);
  const onCerts = pathname === "/settings" && hash === "#osvedceni";

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between pr-2">
        <button
          type="button"
          onClick={() => go("/home")}
          className="flex min-w-0 items-center gap-2 py-4 pl-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="VISIBLE7 MICEK – přehled"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-foreground text-[13px] font-bold text-white">
            V7
          </span>
          <span className="whitespace-nowrap text-[15px] font-semibold tracking-tight">
            VISIBLE7 <span className="font-normal text-muted-foreground">MICEK®</span>
          </span>
        </button>
        {!onNavigate && onCollapse && (
          <button
            type="button"
            onClick={onCollapse}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Zmenšit menu"
            title="Zmenšit menu"
          >
            <PanelLeftClose className="h-[18px] w-[18px]" />
          </button>
        )}
      </div>

      {/* Přepínač projektu */}
      <div className="px-3 pb-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2.5 text-left hover:border-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-signal text-sm font-extrabold text-signal-foreground">
              {(currentProject?.name ?? "P").charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs text-muted-foreground">Projekt</span>
              <span className="block truncate text-sm font-bold">{currentProject?.name ?? "Vyberte projekt"}</span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-60">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Moje projekty</DropdownMenuLabel>
            {projects.map((p) => (
              <DropdownMenuItem
                key={p.id}
                onSelect={() => {
                  switchProject(p.id);
                  go("/home");
                }}
              >
                <FolderOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="truncate">{p.name}</span>
                {p.id === currentProject?.id && <Check className="ml-auto h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setCreating(true)} className="font-semibold">
              <Plus className="mr-2 h-4 w-4" /> Nový projekt
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {creating && (
          <form onSubmit={submit} className="mt-2 flex items-center gap-1.5">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Název projektu (klidně krycí)"
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
        )}
      </div>

      <nav aria-label="Menu" className="min-h-0 flex-1 overflow-y-auto px-3">
        <ul className="space-y-1">
          <li>
            <button
              type="button"
              onClick={() => go("/home")}
              aria-current={pathname === "/home" ? "page" : undefined}
              className={mainCls(pathname === "/home")}
            >
              <LayoutDashboard className="h-[18px] w-[18px] text-muted-foreground" /> Přehled
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={toggleCesta}
              aria-expanded={showGates}
              className={mainCls(onGate && !showGates)}
            >
              <Map className="h-[18px] w-[18px] text-muted-foreground" />
              <span className="flex-1">Moje cesta</span>
              <span className="text-xs font-semibold text-muted-foreground">{done.size}/7</span>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${showGates ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>
            <span className="flex gap-1 px-3 pb-1 pt-0.5" aria-hidden="true">
              {GATE_ROUTES.map((g, i) => (
                <span
                  key={g.route}
                  className={`h-1.5 flex-1 rounded-full ${
                    done.has(i + 1) ? "bg-leaf-500" : i + 1 === nextGate ? "bg-signal" : "bg-border"
                  }`}
                />
              ))}
            </span>
            {showGates && (
              <ol className="mb-1 ml-3 space-y-0.5 border-l border-border pl-2">
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
                                ? "bg-signal text-signal-foreground ring-1 ring-primary/40"
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
            )}
          </li>
          <li>
            <button
              type="button"
              onClick={() => go("/muj-podnik")}
              aria-current={onBusiness ? "page" : undefined}
              className={mainCls(onBusiness)}
            >
              <Store className="h-[18px] w-[18px] text-muted-foreground" /> Můj podnik
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => go("/poradci")}
              aria-current={pathname === "/poradci" ? "page" : undefined}
              className={mainCls(pathname === "/poradci")}
            >
              <Users className="h-[18px] w-[18px] text-muted-foreground" /> Poradci
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => go("/settings#osvedceni")}
              aria-current={onCerts ? "page" : undefined}
              className={mainCls(onCerts)}
            >
              <Award className="h-[18px] w-[18px] text-muted-foreground" /> Osvědčení
            </button>
          </li>
          {/* Na mobilu není horní menu: semináře a nástroje jsou tady */}
          <li className="lg:hidden">
            <button type="button" onClick={() => go("/seminare")} className={mainCls(pathname === "/seminare")}>
              <Presentation className="h-[18px] w-[18px] text-muted-foreground" /> Živé semináře
            </button>
          </li>
          <li className="lg:hidden">
            <button
              type="button"
              onClick={() => setToolsOpen((v) => !v)}
              aria-expanded={toolsOpen}
              className={mainCls(false)}
            >
              <Calculator className="h-[18px] w-[18px] text-muted-foreground" />
              <span className="flex-1">Nástroje</span>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${toolsOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>
            {toolsOpen && (
              <ul className="mb-1 ml-3 space-y-0.5 border-l border-border pl-2">
                {TOOLS.map(([label, path, Icon]) => (
                  <li key={path}>
                    <button type="button" onClick={() => go(path)} className={itemCls(pathname === path)}>
                      <Icon className="h-4 w-4 text-muted-foreground" /> {label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        </ul>
      </nav>

      {done.size >= 2 && !access.loading && !access.paid && (
        <div className="px-3 pb-2">
          <SidebarMembership onNavigate={onNavigate} />
        </div>
      )}

      {/* Účet dole: jedna rozbalovací položka */}
      <div className="border-t border-border p-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {initials(email || "?")}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{email}</span>
              <span className="block text-xs text-muted-foreground">
                {access.paid
                  ? `Člen${access.until ? ` do ${new Date(access.until).toLocaleDateString("cs-CZ")}` : ""}`
                  : "Účet a nastavení"}
              </span>
            </span>
            <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-60">
            <DropdownMenuItem onSelect={() => go("/settings")}>
              <Settings className="mr-2.5 h-4 w-4 text-muted-foreground" /> Nastavení
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => go(access.paid ? "/settings" : "/clenstvi")}>
              <Crown className="mr-2.5 h-4 w-4 text-muted-foreground" /> Členství
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => go("/bonusy")}>
              <Gift className="mr-2.5 h-4 w-4 text-muted-foreground" /> Bonusy
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => go("/")}>
              <Globe className="mr-2.5 h-4 w-4 text-muted-foreground" /> Úvodní stránka webu
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem onSelect={() => go("/admin")}>
                <ShieldCheck className="mr-2.5 h-4 w-4 text-muted-foreground" /> Administrace
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={async () => {
                await signOut();
                go("/home");
              }}
            >
              <LogOut className="mr-2.5 h-4 w-4 text-muted-foreground" /> Odhlásit se
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

/** Zmenšené menu (jako ve WordPressu): jen ikony, popisky v bublině po najetí. */
const SidebarRail = ({ onExpand }: { onExpand: () => void }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const access = useAccess();
  const [completedPhases] = useSupabaseProgress<number[]>("completed_phases", []);
  const done = new Set(completedPhases);
  const nextGate = [1, 2, 3, 4, 5, 6, 7].find((n) => !done.has(n));
  const icon = (label: string, path: string, Icon: typeof Award) => (
    <button
      key={path}
      type="button"
      onClick={() => navigate(path)}
      title={label}
      aria-label={label}
      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
        pathname === path
          ? "bg-primary/10 text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <Icon className="h-[18px] w-[18px]" />
    </button>
  );
  return (
    <div className="flex h-full flex-col items-center gap-1 py-3">
      <button
        type="button"
        onClick={() => navigate("/home")}
        className="mb-2 flex h-9 w-9 items-center justify-center rounded-[9px] bg-foreground text-[13px] font-bold text-white"
        aria-label="VISIBLE7 MICEK – přehled"
      >
        V7
      </button>
      <div className="flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto">
        {icon("Přehled", "/home", LayoutDashboard)}
        {icon("Můj podnik", "/muj-podnik", Store)}
        <span className="my-1 h-px w-8 bg-border" />
        {GATE_ROUTES.map((g, i) => {
          const n = i + 1;
          const isDone = done.has(n);
          return (
            <button
              key={g.route}
              type="button"
              onClick={() => navigate(g.route)}
              title={`${n} ${g.name}`}
              aria-label={`Brána ${n}: ${g.name}`}
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${pathname === g.route ? "bg-primary/10" : "hover:bg-muted"}`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                  isDone
                    ? "bg-emerald-500 text-white"
                    : n === nextGate
                      ? "bg-signal text-signal-foreground ring-1 ring-primary/40"
                      : "border border-border text-muted-foreground"
                }`}
              >
                {isDone ? <Check className="h-3 w-3" /> : n}
              </span>
            </button>
          );
        })}
        <span className="my-1 h-px w-8 bg-border" />
        {icon("Poradci", "/poradci", Users)}
        {icon("Osvědčení", "/settings#osvedceni", Award)}
      </div>
      <div className="flex flex-col items-center gap-1 border-t border-border pt-2">
        {done.size >= 2 && !access.loading && !access.paid && icon("Získat členství", "/clenstvi", Crown)}
        {icon("Nastavení", "/settings", Settings)}
        <button
          type="button"
          onClick={onExpand}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Rozbalit menu"
          title="Rozbalit menu"
        >
          <PanelLeftOpen className="h-[18px] w-[18px]" />
        </button>
      </div>
    </div>
  );
};

const COLLAPSE_KEY = "v7_menu_collapsed";
const readCollapsed = () => {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === "1";
  } catch {
    return false;
  }
};

/** Rozvržení aplikace: boční menu, které jde zmenšit na ikony; na mobilu horní lišta a menu z boku. */
export const SidebarLayout = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const toggle = (v: boolean) => {
    setCollapsed(v);
    try {
      localStorage.setItem(COLLAPSE_KEY, v ? "1" : "0");
    } catch {
      /* soukromé okno */
    }
  };
  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 border-r border-border bg-muted/40 transition-[width] lg:block ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {collapsed ? <SidebarRail onExpand={() => toggle(false)} /> : <SidebarBody onCollapse={() => toggle(true)} />}
      </aside>
      <div className="min-w-0 flex-1">
        <AppHeader onOpenMobile={() => setOpen(true)} withSidebar />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <SidebarBody onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        {children}
      </div>
    </div>
  );
};
