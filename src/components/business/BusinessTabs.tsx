import { useLocation, useNavigate } from "react-router-dom";

const TABS: [string, string][] = [
  ["Přehled", "/muj-podnik"],
  ["Cash flow", "/cash-flow"],
  ["Termíny", "/muj-podnik#terminy"],
  ["Úřady a nástroje", "/digitalni-kancelar"],
  ["Rentgen podniku", "/rentgen?rezim=podnik"],
];

/** Záložky sekce Můj podnik: vše k podniku na jednom místě místo několika položek v menu. */
export const BusinessTabs = () => {
  const navigate = useNavigate();
  const { pathname, hash } = useLocation();
  const isActive = (to: string) => {
    const [path, h] = to.split(/[#?]/);
    if (path !== pathname) return false;
    if (to.includes("#")) return hash === `#${h}`;
    return path !== "/muj-podnik" || hash !== "#terminy";
  };
  return (
    <nav aria-label="Můj podnik" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {TABS.map(([label, to]) => {
        const active = isActive(to);
        return (
          <button
            key={to}
            type="button"
            onClick={() => {
              navigate(to);
              const id = to.split("#")[1];
              if (id) setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 60);
            }}
            aria-current={active ? "page" : undefined}
            className={`h-10 shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors ${
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-white text-foreground hover:border-primary/40"
            }`}
          >
            {label}
          </button>
        );
      })}
    </nav>
  );
};
