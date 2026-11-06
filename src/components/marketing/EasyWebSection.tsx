import { ArrowRight, Check, Send, Sparkles } from "lucide-react";
import { INSTALL_PRICE } from "@/lib/install";
import { kc, useShop } from "@/lib/shop";
import { track } from "@/lib/track";

/** Ukázka: úprava webu větou přes AI (ilustrační, ne skutečná data). */
const ChatDemo = () => (
  <figure className="rounded-[1.6rem] border border-border bg-white p-5 shadow-[0_30px_60px_-30px_rgba(16,60,40,0.35)] sm:p-7">
    <p className="flex items-center gap-2 text-sm font-bold">
      <Sparkles className="h-4 w-4 text-leaf-600" aria-hidden="true" /> Úprava webu přes AI
    </p>
    <div className="mt-5 space-y-3 text-[15px]">
      <p className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-white">
        Přidej na web službu Masáž zad, 60 minut za 690 Kč.
      </p>
      <p className="max-w-[85%] rounded-2xl rounded-bl-md bg-muted px-4 py-2.5">
        Hotovo. Služba je v ceníku i v rezervacích. Mám přidat fotku?
      </p>
      <p className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-white">
        Ano. A změň tlačítka na zelenou.
      </p>
    </div>
    <div className="mt-5 rounded-xl border border-leaf-200 bg-leaf-50 p-4">
      <p className="text-xs font-semibold text-leaf-700">Na vašem webu</p>
      <div className="mt-2 flex items-center justify-between gap-3 rounded-lg bg-white px-4 py-3">
        <span>
          <span className="block font-bold">Masáž zad</span>
          <span className="text-sm text-muted-foreground">60 minut · 690 Kč</span>
        </span>
        <span className="rounded-lg bg-leaf-500 px-3 py-1.5 text-sm font-bold text-white">Rezervovat</span>
      </div>
    </div>
    <div className="mt-4 flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm text-muted-foreground">
      Napište, co chcete na webu změnit…
      <Send className="ml-auto h-4 w-4" aria-hidden="true" />
    </div>
    <figcaption className="mt-4 text-center text-xs text-muted-foreground">Ilustrační ukázka</figcaption>
  </figure>
);

/** Landing: rychlé spuštění webu a správa přes AI. Odbourává obavu „web si sám neudělám“. */
export const EasyWebSection = ({ onStart }: { onStart: () => void }) => {
  const shop = useShop();
  const price = shop.install_price ?? INSTALL_PRICE;
  const points = [
    `Web vám nainstalujeme za ${kc(price)}, licence Elementor Pro na rok zdarma. Nebo si ho nainstalujete sami podle videí.`,
    "Napojíte ho na svou AI podle návodu, ukážeme vám to i na webináři.",
    "Web je od začátku váš: běží na vaše jméno a kdykoli ho přestěhujete.",
  ];
  return (
    <section id="web" className="scroll-mt-20 px-3 py-2 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] bg-muted/50">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-8 md:grid-cols-[1.1fr_1fr] md:py-20 lg:px-12">
          <div>
            <p className="v7-para-sm inline-block bg-signal px-3 py-1 text-sm font-bold text-signal-foreground">
              Snadné pro každého začátečníka
            </p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Web spustíte rychle a upravujete ho obyčejnou větou.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Nemusíte umět programovat ani rozumět administraci. Napíšete AI, co chcete změnit, a ona to na webu udělá.
              Vy se věnujete svému byznysu, ne technice.
            </p>
            <ul className="mt-6 space-y-3">
              {points.map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-signal text-signal-foreground">
                    <Check className="h-3 w-3" strokeWidth={3.5} aria-hidden="true" />
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => {
                track("landing_cta", { from: "easy_web" });
                onStart();
              }}
              className="v7-trap-btn v7-phi-lg mt-8 inline-flex h-14 items-center justify-center gap-2 pl-7 pr-12 text-base font-bold text-signal-foreground focus:outline-none focus-visible:ring-4 focus-visible:ring-leaf-300"
            >
              Začít zdarma
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <ChatDemo />
        </div>
      </div>
    </section>
  );
};
