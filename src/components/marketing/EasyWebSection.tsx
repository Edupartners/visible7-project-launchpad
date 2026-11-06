import { ArrowRight, Bot, KeyRound, Wrench } from "lucide-react";
import { INSTALL_PRICE } from "@/lib/install";
import { kc, useShop } from "@/lib/shop";
import { track } from "@/lib/track";

/** Landing: rychlé spuštění webu a správa přes AI. Odbourává obavu „web si sám neudělám“. */
export const EasyWebSection = ({ onStart }: { onStart: () => void }) => {
  const shop = useShop();
  const price = shop.install_price ?? INSTALL_PRICE;
  const cards = [
    {
      icon: Wrench,
      title: "Nainstalujeme ho za vás",
      text: `Web vám připravíme za ${kc(price)}. Licence Elementor Pro na rok je zdarma. Nebo si ho nainstalujete sami podle videí.`,
    },
    {
      icon: Bot,
      title: "Upravujete ho přes AI",
      text: "Web napojíte na svou AI podle návodu, ukážeme vám to i na webináři. Pak stačí napsat „přidej službu“ nebo „změň barvy na tmavší“. Do administrace sahat nemusíte.",
    },
    {
      icon: KeyRound,
      title: "Web je od začátku váš",
      text: "Běží na vaše jméno a kdykoli ho můžete přestěhovat. Na nikom nejste závislí.",
    },
  ];
  return (
    <section id="web" className="scroll-mt-20 px-3 py-2 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] bg-primary text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-8 md:py-20 lg:px-12">
          <p className="v7-para-sm inline-block bg-signal px-3 py-1 text-sm font-bold text-signal-foreground">
            Snadné pro každého začátečníka
          </p>
          <h2 className="mt-4 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            Web spustíte rychle, i když jste ho nikdy nedělali
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-white/75">
            Technika vás nemusí zdržet. Web vám pomůžeme spustit a pak ho upravujete obyčejnou větou přes AI.
          </p>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {cards.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-2xl bg-white/[0.07] p-6 ring-1 ring-white/15">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-signal text-signal-foreground">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-xl font-bold">{title}</h3>
                <p className="mt-2 text-white/75">{text}</p>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              track("landing_cta", { from: "easy_web" });
              onStart();
            }}
            className="v7-trap-btn mt-10 inline-flex h-14 items-center justify-center gap-2 pl-7 pr-12 text-base font-bold text-signal-foreground"
          >
            Začít zdarma <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
};
