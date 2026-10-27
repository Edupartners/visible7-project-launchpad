import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  PiggyBank,
  Repeat,
  ThumbsUp,
  Users,
} from "lucide-react";
import { SidebarLayout } from "@/components/layout/AppSidebar";
import { Kpi } from "@/components/business/Kpi";
import { czk, czkShort } from "@/lib/cashflow";
import { DEMO_REPORT as R, type Insight } from "@/lib/financeReport";

const INSIGHT_STYLE: Record<Insight["tone"], { box: string; icon: typeof AlertTriangle }> = {
  pozor: { box: "bg-amber-50 ring-amber-200 text-amber-950", icon: AlertTriangle },
  usetrit: { box: "bg-leaf-50 ring-leaf-200 text-leaf-950", icon: PiggyBank },
  dobre: { box: "bg-card ring-border text-foreground", icon: ThumbsUp },
};

const pct = (now: number, before: number) => (before ? Math.round(((now - before) / before) * 100) : 0);

const Delta = ({ value, goodWhenDown = false }: { value: number; goodWhenDown?: boolean }) => {
  if (!value) return <span className="text-xs font-semibold text-muted-foreground">beze změny</span>;
  const up = value > 0;
  const good = goodWhenDown ? !up : up;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-bold ${good ? "text-leaf-700" : "text-orange-700"}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {up ? "+" : ""}
      {value} %
    </span>
  );
};

/** Finanční report za měsíc – co člověk uvidí po napojení účtu. NÁHLED na ukázkových datech. */
const FinanceReportPage = () => {
  const [open, setOpen] = useState<string | null>("marketing");
  useEffect(() => {
    document.title = "Finanční report | VISIBLE7 MICEK";
  }, []);

  const profit = R.income - R.expense;
  const profitPrev = R.incomePrev - R.expensePrev;
  const maxCat = Math.max(...R.categories.map((c) => c.amount));
  const totalCustomers = R.customers.reduce((s, c) => s + c.amount, 0);
  const recurringTotal = R.recurring.reduce((s, r) => s + r.amount, 0);
  const savings = R.insights.reduce((s, i) => s + (i.impact ?? 0), 0);

  return (
    <SidebarLayout>
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-8">
        <header>
          <p className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-amber-800 ring-1 ring-amber-200">
            Ukázka · takhle bude vypadat váš report
          </p>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Finanční report: {R.month}</h1>
          <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
            Všechny platby z podnikatelského účtu, roztříděné a spočítané. Za co utrácíte, odkud jdou peníze a kde se dá
            ušetřit.
          </p>
        </header>

        {/* Verdikt */}
        <section className="rounded-3xl bg-leaf-800 p-6 text-white sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-leaf-300">Měsíc v jedné větě</p>
          <p className="mt-2 text-2xl font-extrabold leading-snug sm:text-3xl">
            Vydělal jste {czk(profit)}, o {Math.abs(pct(profit, profitPrev))} % méně než v srpnu. Tržby rostou, ale
            výdaje rostou rychleji, hlavně marketing.
          </p>
        </section>

        {/* Čísla */}
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi
            label="Příjmy"
            value={`${czkShort(R.income)} Kč`}
            note={`${pct(R.income, R.incomePrev) > 0 ? "+" : ""}${pct(R.income, R.incomePrev)} % proti srpnu`}
          />
          <Kpi
            label="Výdaje"
            value={`${czkShort(R.expense)} Kč`}
            note={`+${pct(R.expense, R.expensePrev)} % proti srpnu`}
          />
          <Kpi
            hero
            label="Zisk"
            value={`${czkShort(profit)} Kč`}
            note={`marže ${Math.round((profit / R.income) * 100)} %`}
          />
          <Kpi label="Ušetříte" value={`${czkShort(savings)} Kč`} note="měsíčně podle doporučení níže" />
        </section>

        {/* Doporučení */}
        <section aria-labelledby="co-ted" className="space-y-3">
          <h2 id="co-ted" className="text-xl font-bold">
            Na co se tento měsíc podívat
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {R.insights.map((i) => {
              const s = INSIGHT_STYLE[i.tone];
              return (
                <article key={i.title} className={`flex gap-3 rounded-2xl p-5 ring-1 ${s.box}`}>
                  <s.icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                  <div>
                    <h3 className="font-bold">{i.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed opacity-90">{i.text}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Kam tečou peníze */}
        <section aria-labelledby="kam" className="rounded-3xl border border-border bg-card p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="kam" className="text-xl font-bold">
              Kam tečou peníze
            </h2>
            <p className="text-sm text-muted-foreground">Výdaje celkem {czk(R.expense)}</p>
          </div>
          <ul className="mt-4 divide-y divide-border/70">
            {R.categories.map((c) => {
              const isOpen = open === c.key;
              const d = pct(c.amount, c.avg3);
              return (
                <li key={c.key}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : c.key)}
                    aria-expanded={isOpen}
                    className="grid w-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 py-3 text-left sm:grid-cols-[13rem_1fr_7rem_6rem_1rem]"
                  >
                    <span className="font-semibold">{c.label}</span>
                    <span className="order-last col-span-2 h-2.5 rounded-full bg-muted sm:order-none sm:col-span-1">
                      <span
                        className={`block h-2.5 rounded-full ${d > 25 ? "bg-orange-500" : "bg-leaf-500"}`}
                        style={{ width: `${(c.amount / maxCat) * 100}%` }}
                      />
                    </span>
                    <span className="text-right font-bold tabular-nums">{czk(c.amount)}</span>
                    <span className="hidden text-right sm:block">
                      <Delta value={d} goodWhenDown />
                    </span>
                    <ChevronDown
                      className={`hidden h-4 w-4 text-muted-foreground transition-transform sm:block ${isOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && (
                    <div className="mb-3 rounded-2xl bg-muted/50 p-4 text-sm">
                      <p className="mb-2 text-xs text-muted-foreground">
                        {Math.round((c.amount / R.expense) * 100)} % všech výdajů · průměr 3 měsíců {czk(c.avg3)}
                      </p>
                      <ul className="space-y-1.5">
                        {c.top.map((t) => (
                          <li key={t.name} className="flex justify-between gap-3">
                            <span>{t.name}</span>
                            <span className="font-semibold tabular-nums">{czk(t.amount)}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 text-xs text-muted-foreground">
                        Je platba ve špatné kategorii? Přeřadíte ji jedním klikem a příště už se zařadí správně.
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          {R.uncategorized > 0 && (
            <p className="mt-3 rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-900 ring-1 ring-amber-200">
              {R.uncategorized} platby se nepodařilo zařadit. Zařaďte je a report bude přesnější.
            </p>
          )}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          {/* Opakované platby */}
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Repeat className="h-5 w-5 text-leaf-700" aria-hidden="true" />
              <h2 className="text-xl font-bold">Pravidelné platby</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {R.recurring.length} plateb každý měsíc, celkem {czk(recurringTotal)}.
            </p>
            <ul className="mt-4 space-y-2">
              {R.recurring.map((r) => (
                <li
                  key={r.name}
                  className={`flex items-start justify-between gap-3 rounded-xl p-3 ${r.note ? "bg-amber-50 ring-1 ring-amber-200" : "bg-muted/40"}`}
                >
                  <span>
                    <span className="block text-sm font-semibold">{r.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {r.category} · od {r.since}
                      {r.note && <span className="font-semibold text-amber-800"> · {r.note}</span>}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block whitespace-nowrap text-sm font-bold tabular-nums">{czk(r.amount)}</span>
                    {r.change ? <Delta value={r.change} goodWhenDown /> : null}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Odkud jdou peníze */}
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-leaf-700" aria-hidden="true" />
              <h2 className="text-xl font-bold">Odkud jdou peníze</h2>
            </div>
            <p className="text-sm text-muted-foreground">Příjmy celkem {czk(R.income)}.</p>
            <ul className="mt-4 space-y-4">
              {R.customers.map((c, i) => {
                const share = Math.round((c.amount / totalCustomers) * 100);
                return (
                  <li key={c.name}>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="font-semibold">{c.name}</span>
                      <span className="tabular-nums">
                        <span className="font-bold">{share} %</span>{" "}
                        <span className="text-muted-foreground">· {czk(c.amount)}</span>
                      </span>
                    </div>
                    <span className="mt-1.5 block h-2.5 rounded-full bg-muted">
                      <span
                        className={`block h-2.5 rounded-full ${i === 0 && share > 35 ? "bg-orange-500" : "bg-leaf-500"}`}
                        style={{ width: `${share}%` }}
                      />
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Oranžová znamená závislost: víc než třetina příjmů od jednoho zákazníka.
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold">Report vám přijde e-mailem</h2>
            <p className="text-sm text-muted-foreground">
              Každý měsíc shrnutí ve třech bodech a hned upozornění, když dochází hotovost.
            </p>
          </div>
          <Link
            to="/cash-flow"
            className="v7-trap-btn inline-flex h-12 shrink-0 items-center justify-center gap-2 pl-6 pr-12 font-bold text-signal-foreground"
          >
            Výhled hotovosti
          </Link>
        </section>

        <p className="text-xs text-muted-foreground">
          Ukázková data. Po napojení účtu přes licencovaného poskytovatele (PSD2) se platby roztřídí automaticky.
          Doporučení jsou orientační, ne finanční ani daňové poradenství.
        </p>
      </main>
    </SidebarLayout>
  );
};

export default FinanceReportPage;
