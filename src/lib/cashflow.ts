import { type BusinessCaseData, type MonthRow } from "@/lib/businessCase";
import { type Deadline } from "@/lib/deadlines";

/**
 * Cash flow z bankovního účtu (PSD2 přes Sokordia Tech → Finbricks).
 * Do VISIBLE7 jdou jen měsíční souhrny podle kategorií, žádné jednotlivé transakce.
 * Dokud není podepsaná smlouva a nasazená funkce bank-sync, stránka běží na ukázkových datech.
 */

export const CATEGORY_LABEL: Record<string, string> = {
  trzby: "Tržby",
  ostatni_prijmy: "Ostatní příjmy",
  naklady_zbozi: "Zboží a materiál",
  marketing: "Marketing",
  provoz: "Provoz a nástroje",
  mzdy: "Mzdy a spolupracovníci",
  dane_odvody: "Daně a odvody",
  ostatni_vydaje: "Ostatní výdaje",
};

export interface CashMonth {
  month: string; // YYYY-MM-01
  income: number;
  expense: number;
  by_category: Record<string, number>;
  balance_end: number | null;
}

export interface PlanMonth {
  month: string;
  income: number;
  expense: number;
}

export interface CompareRow {
  month: string;
  label: string;
  planIncome: number;
  actualIncome: number;
  planProfit: number;
  actualProfit: number;
}

const MONTHS = ["led", "úno", "bře", "dub", "kvě", "čvn", "čvc", "srp", "zář", "říj", "lis", "pro"];
export const monthLabel = (iso: string) => {
  const [y, m] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${String(y).slice(2)}`;
};

const firstOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const isoDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Posledních n kalendářních měsíců (bez aktuálního), od nejstaršího. */
export const lastMonths = (n: number, now = new Date()) => {
  const out: string[] = [];
  const start = firstOfMonth(now);
  for (let i = n; i >= 1; i--) out.push(isoDay(new Date(start.getFullYear(), start.getMonth() - i, 1)));
  return out;
};

/** Plán z byznys casu namapovaný na kalendářní měsíce (1. měsíc provozu = první z `months`). */
export function planFromCase(rows: MonthRow[], months: string[]): PlanMonth[] {
  return months.map((m, i) => {
    const r = rows[i + 1];
    if (!r) return { month: m, income: 0, expense: 0 };
    const expense = r.revenue - r.grossProfit + r.fixed + r.marketing;
    return { month: m, income: Math.round(r.revenue), expense: Math.round(expense) };
  });
}

/** Ukázkový plán, když projekt nemá byznys case. */
export function demoPlan(months: string[]): PlanMonth[] {
  return months.map((m, i) => ({
    month: m,
    income: Math.round(30_000 + i * 6_500),
    expense: Math.round(26_000 + i * 3_200),
  }));
}

/** Ukázková „skutečnost“ kolem plánu – deterministická, aby se při obnovení neměnila. */
export function demoActual(plan: PlanMonth[], startBalance = 60_000): CashMonth[] {
  let seed = 7;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  let balance = startBalance;
  return plan.map((p, i) => {
    // první měsíce pomalejší rozjezd, pak kolem plánu
    const factor = (i < 3 ? 0.7 : 0.85) + rnd() * 0.35;
    const trzby = Math.round(p.income * factor);
    const zbozi = Math.round(trzby * 0.32);
    const marketing = Math.round(p.expense * 0.18 * (0.8 + rnd() * 0.5));
    const provoz = Math.round(p.expense * 0.3);
    const dane = Math.round(trzby * (new Date(p.month).getMonth() % 3 === 0 ? 0.12 : 0.05));
    const expense = zbozi + marketing + provoz + dane;
    balance += trzby - expense;
    return {
      month: p.month,
      income: trzby,
      expense,
      by_category: { trzby, naklady_zbozi: -zbozi, marketing: -marketing, provoz: -provoz, dane_odvody: -dane },
      balance_end: balance,
    };
  });
}

export function compare(plan: PlanMonth[], actual: CashMonth[]): CompareRow[] {
  return plan.map((p) => {
    const a = actual.find((x) => x.month === p.month);
    return {
      month: p.month,
      label: monthLabel(p.month),
      planIncome: p.income,
      actualIncome: a?.income ?? 0,
      planProfit: p.income - p.expense,
      actualProfit: a ? a.income - a.expense : 0,
    };
  });
}

export interface Outflow {
  date: string;
  title: string;
  amount: number;
  /** jak částku odhadujeme – zobrazuje se uživateli */
  basis: string;
}

/**
 * Odhad plateb k termínům z kalendáře. Hrubý odhad z minulých měsíců, ne daňový výpočet.
 *  - DPH: 21/121 z tržeb minus 21/121 z výdajů se zbožím a službami za období (min. 0)
 *  - zálohy na pojištění: průměr kategorie „Daně a odvody“ mimo čtvrtletní špičky
 */
export function estimateOutflows(deadlines: Deadline[], actual: CashMonth[]): Outflow[] {
  const last3 = actual.slice(-3);
  const avg = (f: (m: CashMonth) => number) => (last3.length ? last3.reduce((s, m) => s + f(m), 0) / last3.length : 0);
  const vatBase = avg(
    (m) => m.income - Math.abs(m.by_category.naklady_zbozi ?? 0) - Math.abs(m.by_category.marketing ?? 0) * 0.8,
  );
  const vatMonthly = Math.max(0, (vatBase * 21) / 121);
  const odvody = actual.length ? Math.min(...actual.slice(-6).map((m) => Math.abs(m.by_category.dane_odvody ?? 0))) : 0;
  return deadlines
    .map((d) => {
      const t = d.title.toLowerCase();
      if (t.startsWith("dph")) {
        const quarterly = t.includes("čtvrtletí") || /za \d\. čtvrtletí|q[1-4]/.test(t);
        return {
          date: d.due_date,
          title: d.title,
          amount: Math.round(vatMonthly * (quarterly ? 3 : 1)),
          basis: `odhad z tržeb a nákupů za ${quarterly ? "čtvrtletí" : "měsíc"}`,
        };
      }
      if (t.includes("záloh") && (t.includes("sociální") || t.includes("zdravot") || t.includes("pojišt"))) {
        return { date: d.due_date, title: d.title, amount: Math.round(odvody / 2), basis: "podle minulých měsíců" };
      }
      return null;
    })
    .filter((x): x is Outflow => !!x && x.amount > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export interface WeekPoint {
  week: number;
  date: string;
  label: string;
  balance: number;
}

/**
 * Výhled hotovosti na 13 týdnů: průměrný týdenní výsledek bez daní z posledních 3 měsíců
 * + odhadnuté platby k termínům v daném týdnu.
 */
export function forecast13(actual: CashMonth[], outflows: Outflow[], now = new Date()): WeekPoint[] {
  const last3 = actual.slice(-3);
  const start = actual.at(-1)?.balance_end ?? 0;
  const monthlyNet = last3.length
    ? last3.reduce((s, m) => s + m.income - (m.expense - Math.abs(m.by_category.dane_odvody ?? 0)), 0) / last3.length
    : 0;
  const weekly = monthlyNet / 4.345;
  const points: WeekPoint[] = [];
  let balance = start;
  for (let w = 0; w <= 13; w++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + w * 7);
    if (w > 0) {
      const from = new Date(day.getTime() - 7 * 86_400_000);
      const due = outflows.filter((o) => {
        const d = new Date(o.date);
        return d > from && d <= day;
      });
      balance += weekly - due.reduce((s, o) => s + o.amount, 0);
    }
    points.push({ week: w, date: isoDay(day), label: w === 0 ? "dnes" : `${w}. t`, balance: Math.round(balance) });
  }
  return points;
}

export interface CashAlert {
  level: "ok" | "pozor" | "riziko";
  title: string;
  text: string;
}

/** Upozornění, které by šlo e-mailem (a zobrazí se na stránce). */
export function cashAlert(points: WeekPoint[], actual: CashMonth[]): CashAlert {
  const low = points.reduce((a, b) => (b.balance < a.balance ? b : a), points[0]);
  const avgExpense = actual.slice(-3).reduce((s, m) => s + m.expense, 0) / Math.max(1, actual.slice(-3).length);
  const fmt = (n: number) => `${Math.round(n).toLocaleString("cs-CZ")} Kč`;
  if (low.balance < 0) {
    return {
      level: "riziko",
      title: `Za ${low.week} týdnů vám může dojít hotovost`,
      text: `Nejnižší odhadovaný stav je ${fmt(low.balance)} kolem ${new Date(low.date).toLocaleDateString("cs-CZ")}. Zvažte posunutí výdajů, rychlejší fakturaci nebo rezervu.`,
    };
  }
  if (low.balance < avgExpense) {
    return {
      level: "pozor",
      title: "Rezerva bude menší než měsíční výdaje",
      text: `V ${low.week}. týdnu klesne stav na ${fmt(low.balance)}, průměrné měsíční výdaje jsou ${fmt(avgExpense)}.`,
    };
  }
  return {
    level: "ok",
    title: "Hotovost na příští 3 měsíce vypadá v pořádku",
    text: `Nejnižší odhadovaný stav je ${fmt(low.balance)} (${low.week}. týden).`,
  };
}

export const czkShort = (v: number) => {
  const a = Math.abs(v);
  const sign = v < 0 ? "−" : "";
  if (a >= 1e6) return `${sign}${(Math.round(a / 1e5) / 10).toLocaleString("cs-CZ")} mil.`;
  if (a >= 1e5) return `${sign}${Math.round(a / 1000).toLocaleString("cs-CZ")} tis.`;
  if (a >= 1e4) return `${sign}${(Math.round(a / 100) / 10).toLocaleString("cs-CZ")} tis.`;
  return `${sign}${Math.round(a).toLocaleString("cs-CZ")}`;
};
export const czk = (v: number) => `${v < 0 ? "−" : ""}${Math.round(Math.abs(v)).toLocaleString("cs-CZ")} Kč`;

/** Barvy upozornění podle úrovně. */
export const ALERT_STYLE = {
  riziko: "bg-red-50 text-red-900 ring-red-200",
  pozor: "bg-amber-50 text-amber-900 ring-amber-200",
  ok: "bg-leaf-50 text-leaf-900 ring-leaf-200",
};

export type { BusinessCaseData };
