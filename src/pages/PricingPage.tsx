import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { PLANS, VAT_NOTE } from "@/lib/pricing";
import { CONSULTATION } from "@/lib/advisors";

const INCLUDED: { row: string; free: boolean }[] = [
  { row: "Brána 1 Modrý oceán a brána 2 Lean Canvas", free: true },
  { row: "AI návrh a hodnocení Lean Canvasu", free: true },
  { row: "Osvědčení za splněné brány", free: true },
  { row: "Brána 3 Byznys case: kapitál, bod zvratu, PNO", free: false },
  { row: "AI odhad čísel a komentář k plánu", free: false },
  { row: "Export byznys case do Excelu", free: false },
  { row: "Pitch na jednu A4 pro investora, banku nebo partnera", free: false },
  { row: "Brány 4–7 s videonávody", free: false },
];

const QA = [
  ["Obnovuje se platba sama?", "Ne. Platíte jednou za zvolené období a pak se rozhodnete, jestli prodloužíte."],
  [
    "Co se stane, když přístup skončí?",
    "Vaše projekty i data zůstanou. Placené brány uvidíte, ale do dalšího zaplacení jen pro čtení.",
  ],
  ["Dostanu doklad?", "Ano. Ke každé platbě dostanete daňový doklad od Edu partners s.r.o."],
  ["Mohu nejdřív vyzkoušet?", "Ano. Brány 1 a 2 jsou zdarma a bez platební karty."],
];

/** Veřejná stránka s ceníkem. */
const PricingPage = () => {
  const navigate = useNavigate();
  const start = () => navigate("/home");
  useEffect(() => {
    document.title = "Ceník | VISIBLE7 MICEK";
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader onStart={start} />
      <main>
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 md:pt-20">
          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            Začněte zdarma. Plaťte, až budete chtít dál.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Jednorázová platba za období, žádné předplatné, které by se samo obnovovalo. {VAT_NOTE}
          </p>

          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((p) => (
              <li
                key={p.id}
                className={`flex flex-col rounded-2xl p-6 ${p.highlight ? "bg-primary text-white" : "border border-border bg-card"}`}
              >
                <div className="flex items-center justify-between">
                  <h2 className={`font-semibold ${p.highlight ? "text-white/80" : "text-muted-foreground"}`}>
                    {p.name}
                  </h2>
                  {p.highlight && (
                    <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold">Doporučujeme</span>
                  )}
                </div>
                <p className="mt-3 text-4xl font-extrabold tracking-tight">{p.price}</p>
                <p className={`text-sm ${p.highlight ? "text-white/60" : "text-muted-foreground"}`}>
                  {p.note}
                  {p.perMonth && `, vychází na ${p.perMonth}`}
                </p>
                <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                  {p.items.map((it) => (
                    <li key={it} className="flex gap-2">
                      <Check
                        className={`mt-0.5 h-4 w-4 shrink-0 ${p.highlight ? "text-[hsl(var(--gate-copper))]" : "text-emerald-600"}`}
                        strokeWidth={3}
                      />
                      {it}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={start}
                  className={`mt-6 h-11 rounded-xl text-sm font-semibold transition-colors ${
                    p.highlight
                      ? "bg-orange-500 text-white hover:bg-orange-600"
                      : "border border-border hover:border-primary hover:text-primary"
                  }`}
                >
                  {p.id === "free" ? "Začít zdarma" : `Vybrat ${p.name}`}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            Placený přístup si aktivujete po registraci v aplikaci. Konzultace se seniorním poradcem se platí zvlášť:{" "}
            {CONSULTATION.minutes} minut, orientačně {CONSULTATION.price.toLocaleString("cs-CZ")} Kč.
          </p>
        </section>

        <section className="px-3 py-2 sm:px-5">
          <div className="mx-auto max-w-[1280px] rounded-[2rem] bg-muted/50 py-16 md:py-20">
            <div className="mx-auto max-w-4xl px-4 sm:px-6">
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
                        Placený
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

        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24">
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
