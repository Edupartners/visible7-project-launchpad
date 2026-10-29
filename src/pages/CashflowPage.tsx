import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, ArrowRight, Banknote, CheckCircle2, Landmark, Lock, Mail, ShieldCheck } from "lucide-react";
import { SidebarLayout } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { track } from "@/lib/track";
import { ALERT_STYLE, CATEGORY_LABEL, czk, czkShort } from "@/lib/cashflow";
import { useCashflowDemo } from "@/hooks/useCashflow";
import { Kpi } from "@/components/business/Kpi";
import { BankConnectPanel } from "@/components/business/BankConnectPanel";
import { useIsAdmin } from "@/lib/admin";

/**
 * Cash flow: plán vs. skutečnost a výhled hotovosti z napojeného účtu.
 * Skutečná data z účtu přes Goodveri Finspector (funkce bank-sync), jinak ukázková.
 * Pilot: připojit účet může zatím jen správce (panel BankConnectPanel).
 */
const CashflowPage = () => {
  const { toast } = useToast();
  const data = useCashflowDemo();
  const isAdmin = useIsAdmin();

  useEffect(() => {
    document.title = "Cash flow | VISIBLE7 MICEK";
  }, []);

  const pilot = () => {
    track("cashflow_pilot_interest", {});
    toast({
      title: "Děkujeme, máme vás",
      description: "Napojení účtu spouštíme jako pilot pro omezený počet podnikatelů. Ozveme se e-mailem.",
    });
  };

  return (
    <SidebarLayout>
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-8">
        <header>
          {data.real ? (
            <p className="inline-flex items-center gap-2 rounded-full bg-leaf-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-leaf-800 ring-1 ring-leaf-200">
              Data z vašeho účtu
            </p>
          ) : (
            <p className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-amber-800 ring-1 ring-amber-200">
              Ukázková data · připravujeme
            </p>
          )}
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Cash flow: plán a skutečnost</h1>
          <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
            Po napojení podnikatelského účtu porovnáme váš byznys case se skutečnými příjmy a výdaji a upozorníme vás
            dřív, než dojde hotovost.
            {data.real
              ? data.fromCase
                ? " Plán je z vašeho byznys casu, skutečnost z napojeného účtu."
                : " Skutečnost je z napojeného účtu, plán je zatím ukázkový. Po vyplnění byznys casu se propíše sám."
              : data.fromCase
                ? " Plán níže je z vašeho byznys casu, skutečnost je zatím ukázková."
                : " Plán i skutečnost jsou zatím ukázkové. Po vyplnění byznys casu se plán propíše sám."}
          </p>
        </header>

        {isAdmin && (
          <BankConnectPanel connections={data.connections} months={data.bankMonths} onChange={data.reloadBank} />
        )}

        {/* Velká čísla */}
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi hero label="Na účtu teď" value={`${czkShort(data.balance)} Kč`} note="stav ke konci minulého měsíce" />
          <Kpi
            label="Plnění plánu tržeb"
            value={`${Math.round(data.planShare)} %`}
            note="posledních 12 měsíců proti byznys casu"
          />
          <Kpi label="Měsíční výsledek" value={`${czkShort(data.avgProfit)} Kč`} note="průměr posledních 3 měsíců" />
          <Kpi
            label="Nejnižší stav"
            value={`${czkShort(data.low.balance)} Kč`}
            note={data.low.week ? `za ${data.low.week} týdnů, odhad` : "právě teď"}
          />
        </section>

        {/* Upozornění */}
        <section className={`flex gap-4 rounded-2xl p-5 ring-1 ${ALERT_STYLE[data.alert.level]}`}>
          {data.alert.level === "ok" ? (
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0" aria-hidden="true" />
          ) : (
            <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0" aria-hidden="true" />
          )}
          <div>
            <p className="font-bold">{data.alert.title}</p>
            <p className="mt-1 text-sm leading-relaxed">{data.alert.text}</p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs opacity-80">
              <Mail className="h-3.5 w-3.5" aria-hidden="true" /> Stejné upozornění vám po napojení přijde e-mailem.
            </p>
          </div>
        </section>

        {/* Plán vs skutečnost */}
        <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-xl font-bold">Tržby: plán a skutečnost</h2>
          <p className="text-sm text-muted-foreground">
            Sloupce jsou skutečné tržby z účtu, čára je plán z byznys casu.
          </p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.cmp} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={czkShort} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={56} />
                <Tooltip formatter={(v: number) => czk(v)} />
                <Bar dataKey="actualIncome" name="Skutečnost" fill="#34845A" radius={[6, 6, 0, 0]} />
                <Line
                  dataKey="planIncome"
                  name="Plán"
                  stroke="#1B4D33"
                  strokeWidth={2.5}
                  strokeDasharray="6 4"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm tabular-nums">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-[0.08em] text-muted-foreground">
                  <th className="py-2 font-semibold">Měsíc</th>
                  <th className="py-2 text-right font-semibold">Tržby plán</th>
                  <th className="py-2 text-right font-semibold">Tržby skutečnost</th>
                  <th className="py-2 text-right font-semibold">Výsledek plán</th>
                  <th className="py-2 text-right font-semibold">Výsledek skutečnost</th>
                </tr>
              </thead>
              <tbody>
                {data.cmp.slice(-6).map((r) => (
                  <tr key={r.month} className="border-b border-border/60">
                    <td className="py-2 font-medium">{r.label}</td>
                    <td className="py-2 text-right text-muted-foreground">{czk(r.planIncome)}</td>
                    <td
                      className={`py-2 text-right font-semibold ${r.actualIncome < r.planIncome ? "text-orange-700" : "text-leaf-700"}`}
                    >
                      {czk(r.actualIncome)}
                    </td>
                    <td className="py-2 text-right text-muted-foreground">{czk(r.planProfit)}</td>
                    <td
                      className={`py-2 text-right font-semibold ${r.actualProfit < 0 ? "text-red-700" : "text-foreground"}`}
                    >
                      {czk(r.actualProfit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Výhled 13 týdnů */}
        <section className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
            <h2 className="text-xl font-bold">Výhled hotovosti na 13 týdnů</h2>
            <p className="text-sm text-muted-foreground">
              Z průměru posledních 3 měsíců a odhadnutých plateb k termínům.
            </p>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.weeks} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cfFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34845A" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#34845A" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis
                    tickFormatter={czkShort}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={56}
                  />
                  <Tooltip formatter={(v: number) => czk(v)} labelFormatter={(l) => `Týden: ${l}`} />
                  <ReferenceLine y={0} stroke="#b91c1c" strokeDasharray="4 4" />
                  <Area dataKey="balance" name="Stav účtu" stroke="#1B4D33" strokeWidth={2.5} fill="url(#cfFill)" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
            <h2 className="text-xl font-bold">Platby k termínům</h2>
            <p className="text-sm text-muted-foreground">Hrubý odhad z vašich čísel, ne daňový výpočet.</p>
            {data.outflows.length ? (
              <ul className="mt-4 space-y-3">
                {data.outflows.map((o) => (
                  <li key={o.date + o.title} className="rounded-2xl bg-muted/50 p-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-semibold">{new Date(o.date).toLocaleDateString("cs-CZ")}</span>
                      <span className="text-lg font-extrabold tabular-nums">{czk(o.amount)}</span>
                    </div>
                    <p className="text-sm">{o.title}</p>
                    <p className="text-xs text-muted-foreground">{o.basis}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                V příštích 13 týdnech pro vás nemáme ověřený termín s platbou.
              </p>
            )}
            <Link
              to="/digitalni-kancelar#terminy"
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Všechny termíny <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* Kam jdou peníze */}
        <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-xl font-bold">Kam jdou peníze</h2>
          <p className="text-sm text-muted-foreground">Průměrné měsíční výdaje za poslední 3 měsíce podle kategorií.</p>
          <ul className="mt-4 space-y-3">
            {data.categories.map(([k, v]) => {
              const max = data.categories[0]?.[1] || 1;
              return (
                <li
                  key={k}
                  className="grid grid-cols-[9rem_1fr_auto] items-center gap-3 text-sm sm:grid-cols-[12rem_1fr_auto]"
                >
                  <span className="font-medium">{CATEGORY_LABEL[k] ?? k}</span>
                  <span className="h-3 rounded-full bg-muted">
                    <span className="block h-3 rounded-full bg-leaf-500" style={{ width: `${(v / max) * 100}%` }} />
                  </span>
                  <span className="w-24 text-right font-semibold tabular-nums">{czk(v)}</span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Napojení a ochrana dat */}
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-leaf-800 p-6 text-white">
            <Landmark className="h-7 w-7 text-leaf-300" aria-hidden="true" />
            <h2 className="mt-3 text-xl font-bold">Napojte svůj podnikatelský účet</h2>
            <p className="mt-2 text-white/80">
              Napojení spouštíme jako pilot pro omezený počet podnikatelů. Přihlásíte se přímo u své banky, my vaše
              přihlašovací údaje nikdy neuvidíme.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button className="rounded-full bg-white text-leaf-900 hover:bg-white/90" onClick={pilot}>
                <Banknote className="mr-2 h-4 w-4" /> Chci do pilotu
              </Button>
              <Button
                variant="ghost"
                className="rounded-full text-white/80 hover:bg-white/10 hover:text-white"
                disabled
              >
                <Lock className="mr-2 h-4 w-4" /> Připojit účet (brzy)
              </Button>
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6">
            <ShieldCheck className="h-7 w-7 text-leaf-600" aria-hidden="true" />
            <h2 className="mt-3 text-xl font-bold">Co uvidíme a co ne</h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
              <li>
                <strong className="text-foreground">Jen čtení.</strong> Z účtu nejde nic zaplatit ani převést.
              </li>
              <li>
                <strong className="text-foreground">Jen měsíční souhrny</strong> podle kategorií. Jednotlivé platby ani
                jména protistran neukládáme.
              </li>
              <li>
                <strong className="text-foreground">Napojení přes licencovaného poskytovatele</strong> podle evropské
                směrnice PSD2. Souhlas dáváte své bance a kdykoli ho odvoláte.
              </li>
              <li>
                <strong className="text-foreground">Odpojení nebo smazání účtu</strong> smaže i všechna bankovní data.
              </li>
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Výhled a odhady plateb jsou orientační, ne daňové ani finanční poradenství.
            </p>
          </div>
        </section>
      </main>
    </SidebarLayout>
  );
};

export default CashflowPage;
