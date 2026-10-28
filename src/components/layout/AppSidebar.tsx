import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Award,
  Briefcase,
  CalendarClock,
  Crown,
  PanelLeftClose,
  PanelLeftOpen,
  Lock,
  Megaphone,
  Calculator,
  LayoutDashboard,
  Check,
  ChevronRight,
  FileText,
  FlaskConical,
  Gift,
  FolderOpen,
  Globe,
  Globe2,
  Map,
  LogOut,
  Menu,
  Plus,
  Presentation,
  ScanSearch,
  Settings,
  ShieldCheck,
  Store,
  Users,
  Wallet,
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
import { loadProfile } from "@/lib/deadlines";

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

const SECTIONS_KEY = "v7_sidebar_sections";
const SECTION_PATHS: Record<string, string[]> = {
  cesta: GATE_ROUTES.map((g) => g.route),
  podnik: ["/muj-podnik", "/cash-flow", "/financni-report"],
  nastroje: ["/mapa-cesty", "/rentgen-trhu", "/investor-pitch", "/listy", "/testovaci-stranka"],
  pomoc: ["/poradci", "/bonusy", "/settings"],
};
const sectionOf = (path: string) =>
  Object.keys(SECTION_PATHS).find((id) => SECTION_PATHS[id].some((p) => path === p || path.startsWith(`${p}/`)));
const readSections = (): Record<string, boolean> => {
  try {
    const v = JSON.parse(localStorage.getItem(SECTIONS_KEY) ?? "null");
    if (v && typeof v === "object") return v;
  } catch {
    /* ignore */
  }
  return { cesta: true };
};

/** Obsah postranního panelu – projekty nahoře, odkazy a účet s ozubeným kolem dole (jako ChatGPT/Claude). */
const SidebarBody = ({ onNavigate, onCollapse }: { onNavigate?: () => void; onCollapse?: () => void }) => {
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
  // Rozbalovací sekce menu. Stav si pamatujeme; sekce s otevřenou stránkou se rozbalí sama.
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(readSections);
  useEffect(() => {
    const id = sectionOf(pathname);
    if (id) setOpenSections((s) => (s[id] ? s : { ...s, [id]: true }));
  }, [pathname]);
  useEffect(() => {
    try {
      localStorage.setItem(SECTIONS_KEY, JSON.stringify(openSections));
    } catch {
      /* soukromé okno – nevadí */
    }
  }, [openSections]);
  const isOpen = (id: string) => !!openSections[id];
  const SectionHead = ({ id, label, note }: { id: string; label: string; note?: string }) => (
    <button
      type="button"
      onClick={() => setOpenSections((s) => ({ ...s, [id]: !s[id] }))}
      aria-expanded={isOpen(id)}
      className="flex w-full items-center gap-1.5 rounded-md px-2 pb-1 pt-5 text-left text-xs font-semibold text-muted-foreground hover:text-foreground"
    >
      <ChevronRight
        className={`h-3.5 w-3.5 shrink-0 transition-transform ${isOpen(id) ? "rotate-90" : ""}`}
        aria-hidden="true"
      />
      <span className="flex-1">{label}</span>
      {note && !isOpen(id) && <span className="font-normal">{note}</span>}
    </button>
  );

  // Kdo už podniká, má „Můj podnik“ nad branami; ostatní ho mají pod nimi.
  const [businessFirst, setBusinessFirst] = useState(false);
  useEffect(() => {
    let alive = true;
    loadProfile().then((p) => alive && setBusinessFirst(!!p && p.form !== "nezacal"));
    return () => {
      alive = false;
    };
  }, []);

  const businessBlock = (
    <>
      <SectionHead id="podnik" label="Můj podnik" />
      {isOpen("podnik") && (
        <ul className="space-y-0.5">
          {(
            [
              ["Přehled podniku", "/muj-podnik", Store, false],
              ["Cash flow", "/cash-flow", Wallet, true],
              ["Termíny", "/muj-podnik#terminy", CalendarClock, false],
              ["Úřady a nástroje", "/digitalni-kancelar", Briefcase, false],
              ["Rentgen podniku", "/rentgen?rezim=podnik", ScanSearch, false],
            ] as const
          ).map(([label, path, Icon, soon]) => {
            const active = pathname === path.split(/[#?]/)[0] && !path.includes("#");
            return (
              <li key={path}>
                <button
                  type="button"
                  onClick={() => go(path)}
                  aria-current={active ? "page" : undefined}
                  className={itemCls(active)}
                >
                  <Icon className="h-4 w-4 text-muted-foreground" /> {label}
                  {soon && (
                    <span className="ml-auto rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                      brzy
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );

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
        {!onNavigate && (
          <div className="flex items-center">
            {onCollapse && (
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
        )}
      </div>

      <nav aria-label="Menu" className="min-h-0 flex-1 overflow-y-auto px-2 pt-2">
        <p className="px-2 pb-1 pt-1 text-xs font-semibold text-muted-foreground">Projekty</p>
        <div className="px-1 pb-1.5">
          {creating ? (
            <form onSubmit={submit} className="flex items-center gap-1.5">
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

        {businessFirst && businessBlock}

        <SectionHead id="cesta" label="Moje cesta" note={`${done.size} ze 7`} />
        {isOpen("cesta") && (
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

        {!businessFirst && businessBlock}

        <SectionHead id="nastroje" label="Nástroje" />
        {isOpen("nastroje") && (
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
              <button
                type="button"
                onClick={() => go("/rentgen-trhu")}
                className={itemCls(pathname === "/rentgen-trhu")}
              >
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
            <li>
              <button
                type="button"
                onClick={() => go("/digitalni-kancelar")}
                className={itemCls(pathname === "/digitalni-kancelar")}
              >
                <Briefcase className="h-4 w-4 text-muted-foreground" /> Digitální kancelář
              </button>
            </li>
          </ul>
        )}

        <SectionHead id="pomoc" label="Pomoc a výsledky" />
        {isOpen("pomoc") && (
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
                onClick={() => go("/bonusy")}
                aria-current={pathname === "/bonusy" ? "page" : undefined}
                className={itemCls(pathname === "/bonusy")}
              >
                <Gift className="h-4 w-4 text-muted-foreground" /> Bonusy
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
        )}

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
        {done.size >= 2 && <SidebarMembership onNavigate={onNavigate} />}
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
        {icon("Cash flow", "/cash-flow", Wallet)}
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
        {icon("Finanční plán", "/strategy", Calculator)}
        {icon("Mapa cesty A → D", "/mapa-cesty", Map)}
        {icon("Rentgen trhu", "/rentgen-trhu", Globe2)}
        {icon("Marketingové kanály", "/benchmarking-phase", Megaphone)}
        {icon("Pitch pro investory", "/investor-pitch", Presentation)}
        {icon("Pracovní listy", "/listy", FileText)}
        {icon("Web projektu (test zájmu)", "/testovaci-stranka", FlaskConical)}
        {icon("Digitální kancelář", "/digitalni-kancelar", Briefcase)}
        <span className="my-1 h-px w-8 bg-border" />
        {icon("Seniorní poradci", "/poradci", Users)}
        {icon("Živé semináře", "/seminare", Presentation)}
        {icon("Bonusy", "/bonusy", Gift)}
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
