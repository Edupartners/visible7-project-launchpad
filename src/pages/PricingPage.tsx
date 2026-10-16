import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { FREE_CONSULT_URL, canBuy, kc, monthsLabel, nbsp, perMonth, useShop } from "@/lib/shop";
import { supabase } from "@/integrations/visible7/client";
import { track } from "@/lib/track";
import { CONSULTATION } from "@/lib/advisors";

const INCLUDED: { row: string; free: boolean }[] = [
  { row: "Rentgen nápadu: verdikt AI, čísla a mapa cesty", free: true },
  { row: "Brána 1 Vize (modrý oceán) a brána 2 Ideace (Lean Canvas) s AI", free: true },
  { row: "Osvědčení za brány 1 a 2", free: true },
  { row: "Brána 3 Strategie a čísla: kapitál, bod zvratu, PNO", free: false },
  { row: "Brány 4–7 s videonávody krok za krokem", free: false },
  { row: "Export byznys case do Excelu", free: false },
  { row: "Pitch na jednu A4 pro investora, banku nebo partnera", free: false },
  { row: "Osvědčení za brány 3–7 a záměr", free: false },
];

const MEMBER_ITEMS = [
  "Všech 7 bran a přes 100 videonávodů",
  "Živé online semináře každých 14 dní a jejich záznamy",
  "AI asistent u každé brány",
  "Byznys case, Excel a pitch na A4",
  "Osvědčení za každou bránu",
];

/** Veřejná stránka s ceníkem. Cenu a odkaz na objednávku nastavuje správce (Administrace → Platby). */
const PricingPage = () => {
  const navigate = useNavigate();
  const shop = useShop();
  const [email, setEmail] = useState<string | null>(null);
  const start = () => navigate("/home?novy");
  useEffect(() => {
    document.title = "Ceník | VISIBLE7 MICEK";
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
  }, []);

  const QA = [
    [
      "Obnovuje se platba sama?",
      `Ne. Zaplatíte jednou na ${monthsLabel(shop.months)} a pak se rozhodnete, jestli prodloužíte.`,
    ],
    [
      "Co se stane, když členství skončí?",
      "Vaše projekty i data zůstanou uložené. Placené brány a výstupy se zamknou do dalšího zaplacení.",
    ],
    ["Dostanu doklad?", "Ano. Ke každé platbě dostanete daňový doklad od Edu Partners s.r.o."],
    [
      "Mohu nejdřív vyzkoušet?",
      "Ano. Rentgen nápadu a brány 1 a 2 jsou zdarma bez platební karty. Když zjistíte, jaký jste typ podnikatele (krátký kvíz), získáte navíc 3 dny plného přístupu zdarma.",
    ],
    [
      "Jak se členství aktivuje?",
      "Automaticky po zaplacení. Při objednávce použijte stejný e-mail, kterým se přihlašujete do aplikace.",
    ],
  ];

  const buy = canBuy(shop);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader onStart={start} />
      <main>
        <section className="mx-auto max-w-5xl px-4 pb-16 pt-14 sm:px-8 lg:px-12 md:pt-20">
          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            Začněte zdarma. Plaťte, až budete chtít dál.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Jedno členství, žádné předplatné, které by se samo obnovovalo. Ceny jsou konečné, včetně DPH.
          </p>

          <div className="mt-12 grid gap-4 md:grid-cols-[1fr_1.3fr]">
            <div className="flex flex-col rounded-2xl border border-border bg-card p-6">
              <h2 className="font-semibold text-muted-foreground">Zdarma</h2>
              <p className="mt-3 text-4xl font-extrabold tracking-tight">0 Kč</p>
              <p className="text-sm text-muted-foreground">bez platební karty</p>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                {[
                  "Rentgen nápadu do 10 minut",
                  "Brána 1 Vize (modrý oceán)",
                  "Brána 2 Ideace (Lean Canvas) s AI",
                  "Zjistěte, jaký jste typ podnikatele, a získejte 3 dny zdarma",
                ].map((it) => (
                  <li key={it} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={3} />
                    {it}
                  </li>
                ))}
                <li className="flex gap-2 rounded-lg bg-orange-50 px-2 py-1.5 -mx-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" strokeWidth={3} />
                  <span>
                    <b>Úvodní konzultace s expertem, 20 minut zdarma.</b>{" "}
                    <a
                      href={FREE_CONSULT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => track("free_consult_click", { from: "cenik" })}
                      className="font-semibold text-orange-700 underline underline-offset-2 hover:no-underline"
                    >
                      Vybrat termín
                    </a>
                  </span>
                </li>
              </ul>
              <button
                type="button"
                onClick={start}
                className="mt-6 h-11 rounded-xl border border-border text-sm font-semibold hover:border-primary hover:text-primary"
              >
                Začít zdarma
              </button>
            </div>

            <div className="flex flex-col rounded-2xl bg-primary p-6 text-white">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-white/80">Členství na {monthsLabel(shop.months)}</h2>
                <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold">Celá cesta</span>
              </div>
              <p className="mt-3 text-5xl font-extrabold tracking-tight">{kc(shop.price)}</p>
              <p className="text-sm text-white/70">jednorázově, vychází na {perMonth(shop)} měsíčně</p>
              {shop.anchor && <p className="mt-3 text-sm text-white/80">{nbsp(shop.anchor)}</p>}
              <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                {MEMBER_ITEMS.map((it) => (
                  <li key={it} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--gate-copper))]" strokeWidth={3} />
                    {it}
                  </li>
                ))}
              </ul>
              {buy ? (
                <Link
                  to="/clenstvi"
                  onClick={() => track("checkout_click", { source: "cenik", price: shop.price })}
                  className="mt-6 flex h-12 items-center justify-center rounded-xl bg-orange-500 text-base font-semibold text-white hover:bg-orange-600"
                >
                  Koupit členství
                </Link>
              ) : (
                <div className="mt-6 rounded-xl bg-white/10 p-3 text-center text-sm">
                  <p className="font-semibold">Prodej členství spouštíme brzy.</p>
                  <p className="mt-0.5 text-white/70">Do té doby máte v pilotním provozu vše odemčené zdarma.</p>
                </div>
              )}
              {buy && (
                <p className="mt-3 text-xs text-white/70">
                  {email
                    ? `Při objednávce použijte e-mail ${email} – členství se vám pak zapne samo.`
                    : "Při objednávce použijte e-mail, kterým se přihlašujete do aplikace – členství se zapne samo."}
                </p>
              )}
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Konzultace se seniorním poradcem se platí zvlášť: {CONSULTATION.minutes} minut, orientačně{" "}
            {CONSULTATION.price.toLocaleString("cs-CZ")} Kč.
          </p>
        </section>

        <section className="px-3 py-2 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1280px] rounded-[2rem] bg-muted/50 py-16 md:py-20">
            <div className="mx-auto max-w-4xl px-4 sm:px-8 lg:px-12">
              <h2 className="text-3xl font-extrabold tracking-tight">Co je zdarma a co v placeném přístupu</h2>
              <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card">
                <table className="w-full min-w-[520px] text-left">
                  <thead>
                    <tr className="border-b border-border text-sm">
                      <th scope="col" className="p-4">
                        <span className="sr-only">Funkce</span>
                      </th>
                      <th scope="col" className="w-28 p-4 text-center font-semibold text-muted-foreground">
                        Zdarma
                      </th>
                      <th scope="col" className="w-28 bg-primary p-4 text-center font-bold text-white">
                        Členství
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {INCLUDED.map(({ row, free }) => (
                      <tr key={row} className="border-b border-border last:border-0">
                        <th scope="row" className="p-4 font-medium">
                          {row}
                        </th>
                        <td className="p-4 text-center">
                          {free ? (
                            <Check className="mx-auto h-5 w-5 text-emerald-600" strokeWidth={3} aria-label="ano" />
                          ) : (
                            <span className="text-border" aria-label="ne">
                              —
                            </span>
                          )}
                        </td>
                        <td className="bg-primary/[0.04] p-4 text-center">
                          <Check className="mx-auto h-5 w-5 text-emerald-600" strokeWidth={3} aria-label="ano" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-8 lg:px-12 md:py-24">
          <h2 className="text-3xl font-extrabold tracking-tight">Otázky k platbě</h2>
          <div className="mt-8 divide-y divide-border border-y border-border">
            {QA.map(([q, a]) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                  {q}
                  <span className="text-2xl font-normal text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
          <button
            type="button"
            onClick={start}
            className="mt-10 inline-flex h-14 items-center gap-2 rounded-xl bg-orange-500 px-7 font-semibold text-white hover:bg-orange-600"
          >
            Začít zdarma <ArrowRight className="h-5 w-5" />
          </button>
          <p className="mt-4 text-sm text-muted-foreground">
            Podrobnosti najdete v{" "}
            <Link to="/podminky" className="font-semibold text-primary hover:underline">
              podmínkách užívání
            </Link>
            .
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PricingPage;
