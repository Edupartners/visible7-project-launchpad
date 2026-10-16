import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { kc, seatsLabel, useFounderOffer, useShop } from "@/lib/shop";
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
    { id: "web", title: "Web nebo e-shop na zakázku", how: "Postavíte si ho sami podle videí", value: WEB },
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
      how: `Z měsíců na 3 dny díky AI: asi ${PLAN_HOURS} hodin vaší práce`,
      value: PLAN_HOURS * rate,
    },
    {
      id: "adv",
      title: "Kontakt na poradce z praxe",
      how: `Nemusíte hledat ani ověřovat: asi ${ADVISOR_HOURS} hodin`,
      value: ADVISOR_HOURS * rate,
    },
  ];
  const total = items.filter((i) => !off[i.id]).reduce((s, i) => s + i.value, 0);
  const times = shop.price > 0 ? Math.floor(total / shop.price) : 0;
  const founder = offer && offer.left > 0;

  return (
    <section id="kalkulacka" className="scroll-mt-20 border-y border-border bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8 lg:px-12">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700">Kalkulačka úspory</p>
            <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight sm:text-[1.75rem]">
              Kolik ušetříte, když to zvládnete sami?
            </h2>
          </div>
          <div className="flex w-full flex-wrap gap-x-7 gap-y-4 sm:w-auto">
            <label className="min-w-[240px] flex-1 text-sm font-semibold sm:min-w-[290px]">
              Vaše hodina: <b className="text-orange-700">{kc(rate)}</b>
              <input
                type="range"
                min={150}
                max={2000}
                step={50}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="mt-1.5 block h-6 w-full accent-orange-500"
              />
            </label>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
          {items.map((it) => (
            <label
              key={it.id}
              className={`flex cursor-pointer flex-col gap-1.5 rounded-xl border bg-card px-3.5 py-3 ${
                off[it.id] ? "border-border opacity-60" : "border-border"
              }`}
            >
              <span className="flex items-start gap-2 text-sm font-bold leading-snug">
                <input
                  type="checkbox"
                  checked={!off[it.id]}
                  onChange={() => setOff((o) => ({ ...o, [it.id]: !o[it.id] }))}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[hsl(var(--primary))]"
                />
                {it.title}
              </span>
              <span className="text-xs leading-snug text-muted-foreground">{it.how}</span>
              <span className="mt-auto text-[15px] font-bold">{kc(it.value)}</span>
            </label>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-2xl bg-orange-100 px-5 py-4">
          <p className="text-lg" aria-live="polite">
            Ušetříte přibližně <b className="text-2xl">{kc(total)}</b>
            {times >= 2 && (
              <>
                {" "}
                · <span className="font-bold text-orange-800">{times}× víc, než stojí VISIBLE7</span>
              </>
            )}
          </p>
          <button
            type="button"
            onClick={() => {
              track("calculator_cta", { total, rate });
              onStart();
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-[15px] font-semibold text-white hover:bg-[hsl(var(--primary-hover))]"
          >
            Otestovat nápad zdarma <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Pro srovnání: <b className="text-foreground">kurz Specialista internetového obchodu s lektorem</b> stojí v Edu
          Partners <b className="text-foreground">49&nbsp;000&nbsp;Kč</b>. VISIBLE7 vás provede stejnou cestou za{" "}
          <b className="text-foreground">{kc(shop.price)}</b>
          {founder && (
            <>
              {" "}
              <span className="ml-1 inline-block rounded-lg bg-primary px-2.5 py-0.5 align-middle text-xs font-bold leading-snug text-white">
                Startovací cena pro prvních {offer.seats} + 20 min konzultace zdarma · zbývá {seatsLabel(offer.left)}
              </span>{" "}
              <span>(pak {kc(offer.next_price)})</span>
            </>
          )}
          .
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Orientační odhad podle cen z praxe. Skutečná úspora závisí na vašem projektu. Další konzultace se seniorními
          poradci nejsou součástí členství, platí se zvlášť.
        </p>
      </div>
    </section>
  );
};
