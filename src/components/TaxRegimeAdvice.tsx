import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { BusinessCaseData, MonthRow } from "@/lib/businessCase";

/**
 * Paušální daň pro OSVČ – údaje pro rok 2026.
 * Zdroje: financnisprava.gov.cz, dauc.cz (Platby fyzické osoby v paušálním režimu), skrblik.cz.
 */
export const PAUSAL_2026 = {
  band1Monthly: 9984,
  band2Monthly: 16745,
  band3Monthly: 27139,
  incomeLimit: 2_000_000,
  /** Výdajový paušál, se kterým srovnáváme skutečné náklady (většina živností, včetně e-shopů). */
  flatExpenseShare: 0.6,
  itemName: "Paušální daň – 1. pásmo (daň + pojištění)",
};

export type TaxForm = "osvc" | "pausal" | "sro";

export const TAX_FORMS: { id: TaxForm; label: string; hint: string; rate: number }[] = [
  { id: "osvc", label: "OSVČ – klasický režim", hint: "daň 15 % ze zisku, pojištění jako měsíční náklad", rate: 15 },
  {
    id: "pausal",
    label: "OSVČ – paušální daň",
    hint: "pevná měsíční platba vč. pojištění, bez daňového přiznání",
    rate: 0,
  },
  { id: "sro", label: "s.r.o.", hint: "daň 21 % ze zisku firmy", rate: 21 },
];

type Level = "ok" | "warn" | "stop";

const czk = (v: number) => `${Math.round(v).toLocaleString("cs-CZ")} Kč`;

/** Rozhodovací pomoc: hodí se pro tento projekt paušální daň? */
export const TaxRegimeAdvice = ({ rows, data }: { rows: MonthRow[]; data: BusinessCaseData }) => {
  const year = (from: number, to: number) => rows.filter((r) => r.month >= from && r.month <= to);
  const revenue = (list: MonthRow[]) => list.reduce((s, r) => s + r.revenue, 0);
  const costs = (list: MonthRow[]) =>
    list.reduce((s, r) => s + (r.revenue - r.grossProfit) + r.fixed + r.marketing + r.oneOff, 0);

  const y1 = year(0, 12);
  const y2 = year(13, 24);
  const rev1 = revenue(y1);
  const rev2 = revenue(y2);
  if (rev1 + rev2 <= 0) return null;

  // Paušál nezapočítáváme do nákladů, ať srovnání neovlivní sám sebe.
  const pausalItem = data.costs.find((c) => c.name === PAUSAL_2026.itemName);
  const pausalYear = PAUSAL_2026.band1Monthly * 12;
  const costShare2 = rev2 > 0 ? (costs(y2) - (pausalItem ? pausalItem.amount * 12 : 0)) / rev2 : 0;
  const pausalShare1 = rev1 > 0 ? pausalYear / rev1 : 1;

  const checks: { level: Level; text: string }[] = [];
  const maxRev = Math.max(rev1, rev2);
  checks.push(
    maxRev > PAUSAL_2026.incomeLimit
      ? {
          level: "stop",
          text: `Plánovaný roční obrat ${czk(maxRev)} je nad limitem 2 000 000 Kč. Paušální režim nejde a nad tímto obratem se navíc stáváte plátcem DPH.`,
        }
      : { level: "ok", text: `Roční obrat do ${czk(maxRev)} se vejde pod limit paušálního režimu 2 000 000 Kč.` },
  );
  checks.push(
    pausalShare1 > 0.15
      ? {
          level: "warn",
          text: `Paušál 1. pásma stojí ${czk(pausalYear)} ročně i při nulovém příjmu. To je ${Math.round(
            pausalShare1 * 100,
          )} % vašeho obratu v 1. roce – v rozjezdu bývá klasický režim levnější.`,
        }
      : {
          level: "ok",
          text: `Paušál ${czk(pausalYear)} ročně je jen ${Math.round(pausalShare1 * 100)} % obratu v 1. roce.`,
        },
  );
  checks.push(
    costShare2 > PAUSAL_2026.flatExpenseShare
      ? {
          level: "warn",
          text: `Skutečné náklady jsou ${Math.round(costShare2 * 100)} % obratu. Paušální daň je neodečte – s vysokými náklady se vyplácí klasický režim.`,
        }
      : {
          level: "ok",
          text: `Skutečné náklady jsou ${Math.round(costShare2 * 100)} % obratu, tedy pod 60% výdajovým paušálem.`,
        },
  );

  const verdict = checks.some((c) => c.level === "stop")
    ? { level: "stop" as Level, text: "Paušální daň pro tento plán nepřichází v úvahu." }
    : checks.some((c) => c.level === "warn")
      ? {
          level: "warn" as Level,
          text: "Spíš klasický režim – aspoň v prvním roce. Paušál zvažte, až příjmy porostou.",
        }
      : {
          level: "ok" as Level,
          text: "Paušální daň stojí za zvážení: jednodušší administrativa a předvídatelná platba.",
        };

  const icon = (l: Level) =>
    l === "ok" ? (
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
    ) : l === "warn" ? (
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
    ) : (
      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
    );

  return (
    <div className="rounded-xl border border-border p-4 text-sm sm:p-5">
      <p className="font-semibold">Paušální daň, nebo klasický režim?</p>
      <p
        className={`mt-1 font-semibold ${
          verdict.level === "ok" ? "text-emerald-700" : verdict.level === "warn" ? "text-orange-700" : "text-red-700"
        }`}
      >
        {verdict.text}
      </p>
      <ul className="mt-3 space-y-2">
        {checks.map((c) => (
          <li key={c.text} className="flex items-start gap-2">
            {icon(c.level)}
            <span>{c.text}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-muted-foreground">
        Paušál nejde ani tehdy, když jste plátce DPH, máte příjem ze zaměstnání (kromě DPP/DPČ se srážkovou daní) nebo
        jiné příjmy nad 50 000 Kč ročně. Přicházíte v něm o slevy na dani, například na děti, a začínající OSVČ o nižší
        pojištění v prvních letech. Měsíční platby 2026: {czk(PAUSAL_2026.band1Monthly)} /{" "}
        {czk(PAUSAL_2026.band2Monthly)} / {czk(PAUSAL_2026.band3Monthly)} podle pásma.
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        Orientační pomoc, ne daňové poradenství. Přesný výpočet probere účetní poradkyně ve fázi 3.{" "}
        <a
          className="underline underline-offset-2"
          href="https://financnisprava.gov.cz/cs/dane/dane/dan-z-prijmu/pausalni-dan"
          target="_blank"
          rel="noopener noreferrer"
        >
          Finanční správa: paušální daň
        </a>
      </p>
    </div>
  );
};
