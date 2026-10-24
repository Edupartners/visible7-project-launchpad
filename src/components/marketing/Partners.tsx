import { ArrowUpRight } from "lucide-react";

const PARTNERS = [
  {
    name: "VIVERRA",
    role: "Partner pro umělou inteligenci",
    text: "Česká AI s vlastní logikou výstupů. S VIVERRA rozvíjíme AI pomocníka, který vás provází jednotlivými branami.",
    href: "https://viverra.ai/",
  },
  {
    name: "Goodveri",
    role: "Technologický partner pro napojení banky (PSD2)",
    text: "Open banking pro banky, pojišťovny a poskytovatele úvěrů. Přes Goodveri připravujeme bezpečné napojení vašeho účtu, aby plán stál na skutečných číslech.",
    href: "https://goodveri.com/",
  },
];

/** Partneři VISIBLE7: technologie pro AI a napojení bankovních dat. */
export const Partners = () => (
  <section
    id="partneri"
    aria-labelledby="partneri-nadpis"
    className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14 sm:px-8 lg:px-12"
  >
    <h2 id="partneri-nadpis" className="text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground">
      Partneři
    </h2>
    <ul className="mt-5 grid gap-4 md:grid-cols-2">
      {PARTNERS.map((p) => (
        <li key={p.name}>
          <a
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
          >
            <span className="flex items-start justify-between gap-4">
              <span className="text-2xl font-extrabold tracking-tight text-foreground">{p.name}</span>
              <ArrowUpRight
                className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                aria-hidden="true"
              />
            </span>
            <span className="mt-1 text-sm font-semibold text-leaf-700">{p.role}</span>
            <span className="mt-3 text-muted-foreground">{p.text}</span>
          </a>
        </li>
      ))}
    </ul>
  </section>
);
