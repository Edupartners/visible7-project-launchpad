import { Link } from "react-router-dom";

/** Horní lišta veřejných stránek (úvod, ceník). */
export const PublicHeader = ({ onStart }: { onStart: () => void }) => (
  <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur">
    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-8 lg:px-12">
      <Link to="/" className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
          V7
        </span>
        <span className="hidden font-bold tracking-tight min-[400px]:inline">
          VISIBLE7 <span className="hidden font-normal text-muted-foreground sm:inline">MICEK®</span>
        </span>
      </Link>
      <nav className="flex shrink-0 items-center gap-1 text-sm font-semibold sm:gap-2">
        <Link to="/#jak" className="hidden rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground md:block">
          Jak to funguje
        </Link>
        <Link to="/cenik" className="hidden rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground md:block">
          Ceník
        </Link>
        <Link to="/home" className="rounded-lg px-2 py-2 text-muted-foreground hover:text-foreground sm:px-3">
          Přihlásit
        </Link>
        <button
          type="button"
          onClick={onStart}
          className="whitespace-nowrap rounded-lg bg-primary px-3 py-2 text-white hover:bg-[hsl(var(--primary-hover))] sm:px-4"
        >
          Otestovat nápad
        </button>
      </nav>
    </div>
  </header>
);
