import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Bell, Briefcase, Landmark, Star } from "lucide-react";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { OFFICE_GOV, OFFICE_TOOLS, type OfficeGroup } from "@/lib/office";
import { MyDeadlines } from "@/components/deadlines/MyDeadlines";
import { track } from "@/lib/track";

const Group = ({ g, tools }: { g: OfficeGroup; tools?: boolean }) => (
  <div className="rounded-3xl border border-border bg-card p-6">
    <div className="flex items-center gap-3">
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white ${
          tools ? "bg-leaf-500" : "bg-primary"
        }`}
      >
        <g.icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h3 className="text-lg font-bold leading-tight">{g.title}</h3>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{g.when}</p>
      </div>
    </div>
    <ul className="mt-5 space-y-1">
      {g.links.map((l) => (
        <li key={l.url}>
          <a
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("office_link_click", { name: l.name, group: g.id })}
            className="group flex gap-3 rounded-2xl p-3 transition-colors hover:bg-muted/60"
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                tools
                  ? l.pick
                    ? "bg-leaf-100 text-leaf-700"
                    : "bg-muted text-muted-foreground"
                  : "bg-primary/10 text-primary"
              } transition-colors group-hover:bg-leaf-500 group-hover:text-white`}
            >
              <l.icon className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <span className="flex-1">
              <span className="flex flex-wrap items-center gap-2 font-semibold text-foreground">
                {l.name}
                {tools && l.pick && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-leaf-100 px-2 py-0.5 text-[11px] font-semibold text-leaf-700">
                    <Star className="h-3 w-3" aria-hidden="true" /> Doporučujeme
                  </span>
                )}
              </span>
              <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">{l.text}</span>
            </span>
            <ArrowUpRight
              className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
            <span className="sr-only">(otevře se v novém okně)</span>
          </a>
        </li>
      ))}
    </ul>
  </div>
);

/** Digitální kancelář: úřady online a doporučené nástroje na jednom místě. */
const OfficePage = () => {
  const navigate = useNavigate();
  const start = () => {
    track("feature_cta_click", { page: "digitalni-kancelar" });
    navigate("/home?novy");
  };

  useEffect(() => {
    document.title = "Digitální kancelář podnikatele: úřady a nástroje online | VISIBLE7 MICEK";
    const meta = document.querySelector('meta[name="description"]');
    const prev = meta?.getAttribute("content") ?? null;
    meta?.setAttribute(
      "content",
      "Ohlášení živnosti, datová schránka, daňové přiznání, ČSSZ a zdravotní pojišťovna online. K tomu ověřené nástroje na fakturaci, platby, prodej a e-maily. Vše na jednom místě.",
    );
    window.scrollTo(0, 0);
    return () => {
      if (meta && prev !== null) meta.setAttribute("content", prev);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader onStart={start} />
      <main>
        <section className="px-4 pb-14 pt-14 sm:px-8 md:pb-20 md:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-leaf-700">
              <Briefcase className="h-4 w-4" aria-hidden="true" /> Digitální kancelář
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-5xl lg:text-[3.25rem]">
              Všechno, co podnikatel řeší,{" "}
              <span className="text-leaf-500 underline decoration-leaf-200 decoration-[0.12em] underline-offset-[0.14em]">
                na jednom místě
              </span>
              .
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-muted-foreground">
              Úřady online, od živnosti po daňové přiznání, a nástroje, se kterými rozjedete fakturaci, platby a prodej.
              Bez hledání, kde co je.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm font-semibold">
              <a href="#terminy" className="rounded-full border border-border px-4 py-2 hover:border-leaf-500">
                Moje termíny
              </a>
              <a href="#urady" className="rounded-full border border-border px-4 py-2 hover:border-leaf-500">
                Úřady online
              </a>
              <a href="#nastroje" className="rounded-full border border-border px-4 py-2 hover:border-leaf-500">
                Nástroje
              </a>
            </div>
          </div>
        </section>

        <section id="terminy" className="scroll-mt-20 px-4 pb-16 sm:px-8 md:pb-24">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center justify-center gap-3">
              <Bell className="h-7 w-7 text-leaf-700" aria-hidden="true" />
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Moje termíny</h2>
            </div>
            <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted-foreground">
              Daně, pojištění a DPH podle toho, jak podnikáte. Týden předem vám pošleme e-mail s odkazem na správný
              portál.
            </p>
            <div className="mt-10">
              <MyDeadlines onStart={start} />
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Termíny jsou orientační připomínka podle daňového kalendáře, ne daňové poradenství. U nejasností se
              poraďte se svou účetní.
            </p>
          </div>
        </section>

        <section id="urady" className="scroll-mt-20 bg-muted/40 px-4 py-16 sm:px-8 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center justify-center gap-3">
              <Landmark className="h-7 w-7 text-leaf-700" aria-hidden="true" />
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Úřady online</h2>
            </div>
            <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted-foreground">
              Oficiální státní portály. Většinu z nich otevřete přes bankovní identitu nebo datovou schránku.
            </p>
            <div className="mt-12 grid gap-4 md:grid-cols-2">
              {OFFICE_GOV.map((g) => (
                <Group key={g.id} g={g} />
              ))}
            </div>
          </div>
        </section>

        <section id="nastroje" className="scroll-mt-20 px-4 py-16 sm:px-8 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center justify-center gap-3">
              <Briefcase className="h-7 w-7 text-leaf-700" aria-hidden="true" />
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Doporučené nástroje</h2>
            </div>
            <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted-foreground">
              Nástroje, které doporučujeme začínajícím podnikatelům. U většiny oblastí máte i alternativu, vyberte si
              podle sebe.
            </p>
            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {OFFICE_TOOLS.map((g) => (
                <Group key={g.id} g={g} tools />
              ))}
            </div>
            <div className="mt-8 rounded-3xl border border-border bg-card p-6 text-sm leading-relaxed text-muted-foreground">
              <p>
                <strong className="text-foreground">Bankovní účet pro podnikání</strong> si vyberte podle poplatků za
                vedení a příchozí platby. Oddělený účet od osobních peněz usnadní účetnictví i daňové přiznání.
              </p>
              <p className="mt-3">
                Odkazy na nástroje nejsou provizní a za doporučení nic nedostáváme. Ceny neuvádíme, protože se mění.
                Aktuální najdete na webu každého nástroje.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-muted/40 px-4 py-16 sm:px-8 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Víte, co založit. A víte, proč?</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Nástroje jsou jen polovina. Ve VISIBLE7 nejdřív otestujete nápad a spočítáte čísla, takže zakládáte jen
              to, co váš projekt opravdu potřebuje. V bráně 6 vás provedeme i ohlášením živnosti.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={start}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-leaf-500 px-7 text-base font-semibold text-white transition-colors hover:bg-leaf-600"
              >
                Otestovat nápad zdarma <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </button>
              <Link
                to="/zacit-podnikat"
                className="inline-flex h-14 items-center justify-center rounded-full border-2 border-leaf-500 px-7 text-base font-semibold text-leaf-700 hover:bg-leaf-50"
              >
                Jak začít podnikat
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer variant="full" />
    </div>
  );
};

export default OfficePage;
