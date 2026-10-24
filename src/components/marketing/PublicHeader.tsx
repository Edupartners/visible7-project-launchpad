import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, ChevronDown, Menu as MenuIcon, X } from "lucide-react";
import { ADVISORS } from "@/lib/advisors";
import { track } from "@/lib/track";
import { NAV_MENUS, type NavFeature, type NavLinkItem, type NavMenu } from "@/components/marketing/navMenus";

const author = ADVISORS.find((a) => a.name.includes("Míček"));

/** Jeden odkaz menu: ikona, název a jednořádkový popis (jako u LivePlanu). */
const MenuItem = ({ item, onStart, onNavigate }: { item: NavLinkItem; onStart: () => void; onNavigate: () => void }) => {
  const Icon = item.icon;
  const body = (
    <>
      <Icon className="mt-0.5 h-6 w-6 shrink-0 text-leaf-600" aria-hidden="true" />
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2 font-bold leading-snug text-foreground group-hover:text-primary">
          {item.title}
          {item.badge && (
            <span className="rounded-full bg-leaf-100 px-2 py-0.5 text-[11px] font-semibold text-leaf-800">
              {item.badge}
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-[15px] leading-snug text-muted-foreground">{item.hint}</span>
      </span>
    </>
  );
  const cls = "group flex w-full gap-3 rounded-xl p-2 text-left transition-colors hover:bg-muted/70";
  if (item.start)
    return (
      <button type="button" onClick={onStart} className={cls}>
        {body}
      </button>
    );
  if (item.href)
    return (
      <a href={item.href} onClick={onNavigate} className={cls} {...(item.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {body}
      </a>
    );
  return (
    <Link to={item.to ?? "/"} onClick={onNavigate} className={cls}>
      {body}
    </Link>
  );
};

const FeatureCard = ({ f, onStart, onNavigate }: { f: NavFeature; onStart: () => void; onNavigate: () => void }) => {
  const img = f.image === "author" ? author?.photo : f.image;
  const cta = (
    <span className="mt-4 inline-flex items-center gap-2 font-bold text-primary group-hover:underline group-hover:underline-offset-4">
      {f.cta} <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </span>
  );
  const inner = (
    <>
      {img && (
        <img
          src={img}
          alt=""
          loading="lazy"
          className={`mb-5 w-full rounded-xl bg-background object-cover ${
            f.image === "author" ? "aspect-[4/3] object-[center_20%]" : "aspect-[16/9] border border-border object-left-top"
          }`}
        />
      )}
      <span className="block text-xl font-extrabold leading-tight tracking-tight text-foreground">{f.title}</span>
      <span className="mt-2 block text-[15px] leading-relaxed text-muted-foreground">{f.text}</span>
      {cta}
    </>
  );
  const cls = "group block h-full rounded-2xl bg-leaf-50/70 p-6 text-left";
  if (f.start)
    return (
      <button type="button" onClick={onStart} className={cls}>
        {inner}
      </button>
    );
  if (f.href)
    return (
      <a href={f.href} target="_blank" rel="noopener noreferrer" onClick={onNavigate} className={cls}>
        {inner}
      </a>
    );
  return (
    <Link to={f.to ?? "/"} onClick={onNavigate} className={cls}>
      {inner}
    </Link>
  );
};

const Columns = ({ menu, onStart, onNavigate }: { menu: NavMenu; onStart: () => void; onNavigate: () => void }) => (
  <>
    {menu.columns.map((col, i) => (
      <div key={col.heading ?? i} className="min-w-0">
        {col.heading && <p className="mb-3 px-2 text-lg font-extrabold tracking-tight">{col.heading}</p>}
        <ul className="space-y-1">
          {col.items.map((item) => (
            <li key={item.title}>
              <MenuItem item={item} onStart={onStart} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
        {col.more && (
          <Link
            to={col.more.to}
            onClick={onNavigate}
            className="mt-3 inline-flex items-center gap-2 px-2 font-bold text-primary underline-offset-4 hover:underline"
          >
            {col.more.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </div>
    ))}
  </>
);

/** Horní lišta veřejných stránek: mega menu po vzoru LivePlanu, na mobilu rozbalovací panel. */
export const PublicHeader = ({ onStart }: { onStart: () => void }) => {
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const { pathname, hash } = useLocation();

  const close = () => {
    setOpen(null);
    setMobile(false);
  };

  // Zavřít při změně stránky, klávesou Esc a kliknutím mimo lištu.
  useEffect(close, [pathname, hash]);
  useEffect(() => {
    if (!open && !mobile) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open, mobile]);

  const toggle = (id: string) => {
    if (open !== id) track("nav_menu_open", { menu: id });
    setOpen((o) => (o === id ? null : id));
  };
  const start = () => {
    close();
    onStart();
  };
  const active = NAV_MENUS.find((m) => m.id === open);

  return (
    <header ref={ref} className="sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-8 lg:px-12">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
            V7
          </span>
          <span className="font-bold tracking-tight">
            VISIBLE7 <span className="hidden font-normal text-muted-foreground sm:inline">MICEK®</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 text-[15px] font-semibold lg:flex" aria-label="Hlavní menu">
          {NAV_MENUS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => toggle(m.id)}
              aria-expanded={open === m.id}
              aria-controls={`menu-${m.id}`}
              className={`flex items-center gap-1 rounded-lg px-3 py-2 transition-colors hover:text-foreground ${
                open === m.id ? "bg-muted text-foreground" : "text-foreground/75"
              }`}
            >
              {m.label}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${open === m.id ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>
          ))}
          <Link to="/cenik" className="rounded-lg px-3 py-2 text-foreground/75 hover:text-foreground">
            Ceník
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-1 text-sm font-semibold sm:gap-2">
          <Link to="/home" className="rounded-lg px-2 py-2 text-primary hover:underline sm:px-3">
            Přihlásit
          </Link>
          <button
            type="button"
            onClick={start}
            className="hidden whitespace-nowrap rounded-full bg-leaf-500 px-5 py-2.5 text-white hover:bg-leaf-600 sm:block"
          >
            Začít zdarma
          </button>
          <button
            type="button"
            onClick={() => setMobile((v) => !v)}
            aria-expanded={mobile}
            aria-controls="menu-mobil"
            aria-label={mobile ? "Zavřít menu" : "Otevřít menu"}
            className="rounded-lg p-2 text-foreground hover:bg-muted lg:hidden"
          >
            {mobile ? <X className="h-6 w-6" aria-hidden="true" /> : <MenuIcon className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Desktop: mega menu */}
      {active && (
        <div
          id={`menu-${active.id}`}
          className="absolute inset-x-0 top-full hidden max-h-[calc(100vh-4rem)] overflow-y-auto px-4 pt-2 lg:block"
        >
          <div className="mx-auto grid max-w-5xl grid-cols-[1fr_1fr_0.95fr] gap-8 rounded-3xl border border-border bg-background p-7 shadow-[0_32px_64px_-24px_rgba(15,23,42,0.28)]">
            <Columns menu={active} onStart={start} onNavigate={close} />
            <FeatureCard f={active.feature} onStart={start} onNavigate={close} />
          </div>
        </div>
      )}

      {/* Mobil a tablet: rozbalovací panel se všemi skupinami */}
      {mobile && (
        <div
          id="menu-mobil"
          className="absolute inset-x-0 top-full max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-border bg-background px-4 pb-8 pt-2 shadow-lg lg:hidden"
        >
          {NAV_MENUS.map((m) => (
            <details key={m.id} className="group border-b border-border py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-lg font-bold">
                {m.label}
                <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <div className="space-y-4 pb-4">
                <Columns menu={m} onStart={start} onNavigate={close} />
              </div>
            </details>
          ))}
          <Link to="/cenik" onClick={close} className="block border-b border-border py-4 text-lg font-bold">
            Ceník
          </Link>
          <button
            type="button"
            onClick={start}
            className="mt-6 w-full rounded-full bg-leaf-500 px-5 py-3.5 font-semibold text-white hover:bg-leaf-600"
          >
            Začít plán zdarma
          </button>
        </div>
      )}
    </header>
  );
};
