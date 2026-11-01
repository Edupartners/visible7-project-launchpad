import { CalendarDays, Phone } from "lucide-react";
import { ADVISORS } from "@/lib/advisors";
import { FREE_CONSULT_URL } from "@/lib/shop";
import { track } from "@/lib/track";

const michal = ADVISORS.find((a) => a.name.includes("Míček"));
const open = (from: string) => track("free_consult_click", { from });

/**
 * Osobní pozvánka na 20min úvodní hovor s Michalem (Google kalendář). Cíl: osobní vazba s novými uživateli.
 * Velká karta po výsledku rentgenu, malá položka trvale v bočním menu.
 */
export const MichalCallCard = ({ from, title }: { from: string; title?: string }) => (
  <section className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:p-7">
    {michal?.photo && (
      <img
        src={michal.photo}
        alt="Michal Míček"
        loading="lazy"
        className="h-20 w-20 shrink-0 rounded-full bg-muted object-cover object-top ring-4 ring-signal/40"
      />
    )}
    <div className="flex-1">
      <p className="text-sm font-semibold text-leaf-700">20 minut zdarma, online, bez závazku</p>
      <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
        {title ?? "Probereme váš nápad spolu, osobně"}
      </h2>
      <p className="mt-1 text-muted-foreground">
        Podívám se na váš výsledek, řeknu vám, co ověřit jako první, a kudy dál. Michal Míček, autor metodiky VISIBLE7.
      </p>
    </div>
    <a
      href={FREE_CONSULT_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => open(from)}
      className="v7-trap-btn inline-flex h-12 shrink-0 items-center justify-center gap-2 pl-6 pr-11 font-bold text-signal-foreground"
    >
      <CalendarDays className="h-5 w-5" aria-hidden="true" /> Vybrat termín hovoru
    </a>
  </section>
);

export const MichalCallSidebar = () => (
  <a
    href={FREE_CONSULT_URL}
    target="_blank"
    rel="noopener noreferrer"
    onClick={() => open("sidebar")}
    className="mb-1.5 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-muted"
  >
    {michal?.photo ? (
      <img src={michal.photo} alt="" className="h-7 w-7 shrink-0 rounded-full object-cover object-top" />
    ) : (
      <Phone className="h-4 w-4" />
    )}
    <span className="leading-tight">
      <span className="block font-semibold">Zavolejte Michalovi</span>
      <span className="block text-xs text-muted-foreground">úvodní hovor 20 min zdarma</span>
    </span>
  </a>
);

export const MichalCallIcon = () => (
  <a
    href={FREE_CONSULT_URL}
    target="_blank"
    rel="noopener noreferrer"
    onClick={() => open("sidebar_collapsed")}
    title="Zavolejte Michalovi – 20 min zdarma"
    aria-label="Zavolejte Michalovi – 20 minut zdarma"
    className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted"
  >
    {michal?.photo ? (
      <img src={michal.photo} alt="" className="h-7 w-7 rounded-full object-cover object-top" />
    ) : (
      <Phone className="h-[18px] w-[18px]" />
    )}
  </a>
);
