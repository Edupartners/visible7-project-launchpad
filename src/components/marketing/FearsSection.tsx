import { CalendarDays } from "lucide-react";
import { FEARS } from "@/lib/fears";
import { FREE_CONSULT_URL } from "@/lib/shop";
import { track } from "@/lib/track";

/** Sekce „Bojíte se, že…?“: pět obav, odpovědi a hovor s Michalem. */
export const FearsSection = ({ from, compact = false }: { from: string; compact?: boolean }) => (
  <section
    id="obavy"
    className={`mx-auto max-w-6xl scroll-mt-20 px-4 sm:px-8 lg:px-12 ${compact ? "py-12" : "py-20 md:py-24"}`}
  >
    <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Bojíte se, že…?</h2>
    <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
      Tyhle obavy má skoro každý, kdo začíná podnikat. Tady je, co s nimi uděláme.
    </p>
    <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {FEARS.map(({ icon: Icon, fear, answer }) => (
        <li key={fear} className="flex flex-col rounded-2xl border border-border bg-card p-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-leaf-50 text-leaf-700">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <h3 className="mt-4 text-xl font-bold leading-snug">„{fear}“</h3>
          <p className="mt-2 text-muted-foreground">{answer}</p>
        </li>
      ))}
      <li className="flex flex-col justify-center rounded-2xl border-[3px] border-signal bg-leaf-50 p-6">
        <h3 className="text-xl font-bold leading-snug">Pořád váháte?</h3>
        <p className="mt-2 text-muted-foreground">
          Za 20 minut zdarma probereme váš nápad a řekneme si upřímně, jestli a jak do toho jít.
        </p>
        <a
          href={FREE_CONSULT_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("free_consult_click", { from: `${from}_obavy` })}
          className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 font-bold text-white hover:bg-primary/90"
        >
          <CalendarDays className="h-5 w-5" aria-hidden="true" /> Probrat s Michalem
        </a>
      </li>
    </ul>
  </section>
);
