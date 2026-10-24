import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { kc, useFounderOffer, useShop } from "@/lib/shop";
import { track } from "@/lib/track";

/**
 * Kalkulačka úspory na úvodní stránce: kolik člověk ušetří, když web, marketing a plán zvládne sám.
 * Ceny jsou orientační z praxe (Michal, 10/2026); kurz s lektorem 49 000 Kč je cena Edu Partners.
 */
const WEB = 25_000;
const CARE_MONTHLY = 1_000;
const WEBINARS = 6; // živé webináře v rámci členství
const WEBINAR_PRICE = 1_500;
const PLAN_HOURS = 56; // byznys plán, Lean Canvas a ideace: z měsíců (~80 h) na 3 dny (~24 h)
const ADVISOR_HOURS = 5; // hledání a ověřování poradce

export const SavingsCalculator = ({ onStart }: { onStart: () => void }) => {
  const shop = useShop();
  const offer = useFounderOffer();
  const [rate, setRate] = useState(400);
  const [off, setOff] = useState<Record<string, boolean>>({});

  const items = [
    { id: "web", title: "Web nebo e-shop na zakázku", how: "Postavíš si ho sám podle videí", value: WEB },
    { id: "care", title: "Správa webu", how: `${kc(CARE_MONTHLY)} měsíčně × 12 měsíců`, value: CARE_MONTHLY * 12 },
    {
      id: "webinar",
      title: "Živé webináře s praktiky",
      how: `${WEBINARS} webinářů po ${kc(WEBINAR_PRICE)}`,
      value: WEBINARS * WEBINAR_PRICE,
    },
    {
      id: "plan",
      title: "Byznys plán, Lean Canvas a ideace",
      how: `Z měsíců na 3 dny díky AI: asi ${PLAN_HOURS} hodin tvojí práce`,
      value: PLAN_HOURS * rate,
    },
    {
      id: "adv",
      title: "Kontakt na poradce z praxe",
      how: `Nemusíš hledat ani ověřovat: asi ${ADVISOR_HOURS} hodin`,
      value: ADVISOR_HOURS * rate,
    },
  ];
  const total = items.filter((i) => !off[i.id]).reduce((s, i) => s + i.value, 0);
  const times = shop.price > 0 ? Math.floor(total / shop.price) : 0;
  const founder = offer && offer.left > 0;

  return (
    <section id="kalkulacka" className="scroll-mt-20 border-y border-border bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-8 lg:px-12">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700">Kalkulačka úspory</p>
        <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight sm:text-[2rem]">
          Kolik ušetříš, když to zvládneš sám?
        </h2>
        <p className="mt-2 text-muted-foreground">Odškrtněte, co byste jinak platili, a nastavte cenu své hodiny.</p>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-10">
          {/* Co ušetříš */}
          <div className="rounded-2xl border border-border bg-card">
            <ul className="divide-y divide-border">
              {items.map((it) => (
                <li key={it.id}>
                  <label className="flex cursor-pointer items-center gap-3 px-3.5 py-3.5 hover:bg-muted/40 sm:gap-3.5 sm:px-5 sm:py-4">
                    <input
                      type="checkbox"
                      checked={!off[it.id]}
                      onChange={() => setOff((o) => ({ ...o, [it.id]: !o[it.id] }))}
                      className="h-5 w-5 shrink-0 accent-orange-500"
                    />
                    <span className={`min-w-0 flex-1 ${off[it.id] ? "opacity-45" : ""}`}>
                      <span className="block font-semibold leading-snug">{it.title}</span>
                      <span className="block text-sm leading-snug text-muted-foreground">{it.how}</span>
                    </span>
                    <span
                      className={`shrink-0 whitespace-nowrap text-base font-bold tabular-nums sm:text-lg ${
                        off[it.id] ? "text-muted-foreground line-through" : ""
                      }`}
                    >
                      {kc(it.value)}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <label className="block border-t border-border px-3.5 py-4 text-sm font-semibold sm:px-5">
              <span className="flex items-baseline justify-between gap-3">
                <span>Kolik stojí hodina tvojí práce?</span>
                <b className="whitespace-nowrap text-base text-orange-600">{kc(rate)}</b>
              </span>
              <input
                type="range"
                min={150}
                max={2000}
                step={50}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="mt-2 block h-6 w-full accent-orange-500"
                aria-label="Cena tvojí hodiny"
              />
            </label>
          </div>

          {/* Výsledek */}
          <div className="rounded-2xl bg-primary p-5 text-white shadow-[0_30px_60px_-30px_hsl(216_62%_24%/0.6)] sm:p-8 lg:sticky lg:top-24">
            <p className="text-sm font-semibold text-white/70">Ušetříte přibližně</p>
            <p
              className="mt-1 whitespace-nowrap text-[2.75rem] font-extrabold leading-tight tracking-tight text-orange-400 tabular-nums min-[400px]:text-5xl sm:text-6xl"
              aria-live="polite"
            >
              {kc(total)}
            </p>
            {times >= 2 && (
              <p className="mt-3 text-lg font-semibold">
                To je <span className="text-orange-300">{times}× víc</span>, než stojí VISIBLE7.
              </p>
            )}
            <div className="mt-5 rounded-xl bg-white/[0.07] px-4 py-3 text-sm">
              <p>
                Členství VISIBLE7: <b>{kc(shop.price)}</b>
                {founder && <span className="text-white/70"> (pak {kc(offer.next_price)})</span>}
              </p>
              {founder && (
                <p className="mt-1 font-semibold text-orange-300">
                  Startovací cena pro prvních {offer.seats} + 20 min konzultace zdarma
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                track("calculator_cta", { total, rate });
                onStart();
              }}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3.5 text-[15px] font-semibold text-white hover:bg-orange-600"
            >
              Začít plán zdarma <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Pro srovnání: <b className="text-foreground">kurz Specialista internetového obchodu s lektorem</b> stojí v Edu
          Partners <b className="text-foreground">49&nbsp;000&nbsp;Kč</b>. VISIBLE7 tě provede stejnou cestou.
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Orientační odhad podle cen z praxe. Skutečná úspora závisí na tvém projektu. Další konzultace se seniorními
          poradci nejsou součástí členství, platí se zvlášť.
        </p>
      </div>
    </section>
  );
};
