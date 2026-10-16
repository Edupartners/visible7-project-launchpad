import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, LibraryBig, Radio } from "lucide-react";
import { CourseMegaMenu } from "@/components/marketing/CourseMegaMenu";
import { SeminarMegaMenu } from "@/components/marketing/SeminarMegaMenu";
import { track } from "@/lib/track";

const MENU_ID = "kurz-menu";
const SEM_ID = "seminar-menu";
type Menu = "kurzy" | "seminare" | null;

/** Horní lišta veřejných stránek (úvod, ceník) s mega menu „Kurzy a videa“. */
export const PublicHeader = ({ onStart }: { onStart: () => void }) => {
  const [open, setOpen] = useState<Menu>(null);
  const ref = useRef<HTMLElement>(null);
  const { pathname, hash } = useLocation();

  // Zavřít při změně stránky, klávesou Esc a kliknutím mimo lištu.
  useEffect(() => setOpen(null), [pathname, hash]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  const toggle = (m: Exclude<Menu, null>) => {
    if (open !== m) track(m === "kurzy" ? "mega_menu_open" : "seminar_menu_open");
    setOpen((o) => (o === m ? null : m));
  };
  const start = () => {
    setOpen(null);
    onStart();
  };

  return (
    <header ref={ref} className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-8 lg:px-12">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
            V7
          </span>
          <span className="hidden font-bold tracking-tight min-[440px]:inline">
            VISIBLE7 <span className="hidden font-normal text-muted-foreground sm:inline">MICEK®</span>
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-0.5 text-sm font-semibold min-[360px]:gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => toggle("kurzy")}
            aria-expanded={open === "kurzy"}
            aria-controls={MENU_ID}
            aria-label="Kurzy a videa"
            className={`flex items-center gap-1.5 rounded-lg px-1.5 py-2 hover:text-foreground sm:px-3 ${
              open === "kurzy" ? "bg-muted text-foreground" : "text-muted-foreground"
            }`}
          >
            <LibraryBig className="h-5 w-5 md:hidden" aria-hidden="true" />
            <span className="hidden min-[520px]:inline md:hidden">Kurzy</span>
            <span className="hidden md:inline">Kurzy a videa</span>
            <ChevronDown
              className={`hidden h-4 w-4 transition-transform md:block ${open === "kurzy" ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            onClick={() => toggle("seminare")}
            aria-expanded={open === "seminare"}
            aria-controls={SEM_ID}
            aria-label="Živé semináře"
            className={`flex items-center gap-1.5 rounded-lg px-1.5 py-2 hover:text-foreground sm:px-3 ${
              open === "seminare" ? "bg-muted text-foreground" : "text-muted-foreground"
            }`}
          >
            <Radio className="h-5 w-5 lg:hidden" aria-hidden="true" />
            <span className="hidden lg:inline">Živé semináře</span>
            <ChevronDown
              className={`hidden h-4 w-4 transition-transform lg:block ${open === "seminare" ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
          <Link
            to="/cenik"
            className="hidden rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground md:block"
          >
            Ceník
          </Link>
          <Link
            to="/home"
            className="rounded-lg px-1 py-2 text-muted-foreground hover:text-foreground min-[360px]:px-2 sm:px-3"
          >
            Přihlásit
          </Link>
          <button
            type="button"
            onClick={start}
            className="whitespace-nowrap rounded-lg bg-primary px-2.5 py-2 text-white hover:bg-[hsl(var(--primary-hover))] min-[360px]:px-3 sm:px-4"
          >
            Otestovat<span className="hidden lg:inline"> nápad</span>
          </button>
        </nav>
      </div>
      {open === "kurzy" && <CourseMegaMenu id={MENU_ID} onStart={start} />}
      {open === "seminare" && <SeminarMegaMenu id={SEM_ID} onStart={start} />}
    </header>
  );
};
