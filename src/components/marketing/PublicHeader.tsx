import { Link } from "react-router-dom";

/** Horní lišta veřejných stránek (úvod, ceník). */
export const PublicHeader = ({ onStart }: { onStart: () => void }) => (
  <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur">
    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-8 lg:px-12">
      <Link to="/" className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
          V7
        </span>
        <span className="font-bold tracking-tight">
          VISIBLE7 <span className="hidden font-normal text-muted-foreground sm:inline">MICEK™</span>
        </span>
      </Link>
      <nav className="flex items-center gap-1 text-sm font-semibold sm:gap-2">
        <Link to="/#jak" className="hidden rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground md:block">
          Jak to funguje
        </Link>
        <Link to="/cenik" className="hidden rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground md:block">
          Ceník
        </Link>
        <button
          type="button"
          onClick={onStart}
          className="rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground"
        >
          Přihlásit
        </button>
        <button
          type="button"
          onClick={onStart}
          className="whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-white hover:bg-[hsl(var(--primary-hover))]"
        >
          Otestovat nápad
        </button>
      </nav>
    </div>
  </header>
);
