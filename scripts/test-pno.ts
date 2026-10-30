/**
 * Kontrola výpočtu byznys case (brána 3) – marketing jako % z tržeb (PNO).
 * Spuštění: npx tsx scripts/test-pno.ts [cesta-k-ukazce.xlsx]
 *
 * Ukázka e-shop: objednávka 900 Kč, marže 35 %, 150 objednávek ve 12. měsíci, opakované nákupy 20 %,
 * růst 20 %, jednorázově 30 000 Kč, provoz 3 000 Kč/měs., marketing 5 000 Kč/měs., realistický scénář.
 * S marketingPct = 0 musí vyjít stejná čísla jako před zavedením pole.
 */
import { writeFileSync } from "node:fs";
import * as XLSX from "xlsx";
import { BusinessCaseData, SCENARIOS, computeMetrics, simulate } from "../src/lib/businessCase";
import { buildBusinessCaseWorkbook } from "../src/lib/businessCaseExcel";

const base = (marketingPct?: number): BusinessCaseData => ({
  revenue: {
    price: 900,
    grossMargin: 35,
    volume12: 150,
    repeatRate: 20,
    churn: 5,
    conversion: 0,
    rpm: 0,
    commission: 0,
    growthYear2: 20,
    ...(marketingPct === undefined ? {} : { marketingPct }),
  },
  costs: [
    { id: "a", name: "Tvorba e-shopu", amount: 30000, kind: "jednorazove" },
    { id: "b", name: "Provoz", amount: 3000, kind: "mesicni" },
    { id: "c", name: "Reklama", amount: 5000, kind: "marketing" },
  ],
  targetProfit: 10,
  scenario: "realisticky",
  prefilled: true,
});

const run = (data: BusinessCaseData) => {
  const rows = simulate("commerce", data, 1);
  return { rows, m: computeMetrics("commerce", data, rows) };
};

let failed = 0;
const check = (label: string, actual: number | null, expected: number | null) => {
  const ok = actual === expected;
  if (!ok) failed++;
  console.log(`${ok ? "OK  " : "CHYBA"} ${label}: ${actual}${ok ? "" : ` (čekáno ${expected})`}`);
};
const r1 = (v: number | null) => (v === null ? null : Math.round(v * 10) / 10);

// 1) Bez pole marketingPct (starší projekty) i s nulou: beze změny.
for (const [label, data] of [
  ["bez pole", base()],
  ["marketingPct = 0", base(0)],
] as const) {
  console.log(`\n== ${label} ==`);
  const { m } = run(data);
  check("obrat za 2 roky", Math.round(m.revenueTotal), 2512324);
  check("zisk před daní", Math.round(m.profitTotal), 657313);
  check("potřebný kapitál", Math.round(m.requiredCapital), 43742);
  check("bod zvratu (měsíc)", m.breakEvenMonth, 4);
  check("návratnost (měsíc)", m.paybackMonth, 8);
  check("PNO ve 12. měsíci (%)", r1(m.pno12), 3.7);
}

// 2) Marketing 10 % z tržeb.
console.log("\n== marketingPct = 10 ==");
const ten = run(base(10));
const m10 = ten.m;
const row12 = ten.rows[12];
const out = {
  obrat: Math.round(m10.revenueTotal),
  naklady: Math.round(m10.costsTotal),
  zisk: Math.round(m10.profitTotal),
  kapital: Math.round(m10.requiredCapital),
  roi: r1(m10.roi),
  bodZvratu: m10.breakEvenMonth,
  navratnost: m10.paybackMonth,
  trzby12: Math.round(m10.revenue12),
  marketingPevny12: Math.round(row12.marketingFixed),
  marketingVar12: Math.round(row12.marketingVar),
  pno12: r1(m10.pno12),
  maxPno: r1(m10.maxPno),
  hodnoceniPno: m10.pnoRating,
  cac: m10.cac === null ? null : Math.round(m10.cac),
};
console.log(out);
// Kontroly konzistence: variabilní marketing = 10 % tržeb, zisk = obrat − náklady, PNO = (pevný + var.) / tržby.
check("var. marketing 12. měsíc = 10 % tržeb", Math.round(row12.marketingVar), Math.round(row12.revenue * 0.1));
check(
  "zisk = obrat − náklady",
  Math.round(m10.profitTotal),
  Math.round(m10.revenueTotal - m10.costsTotal),
);
check(
  "PNO = (pevný + var.) / tržby",
  r1(m10.pno12),
  r1(((row12.marketingFixed + row12.marketingVar) / row12.revenue) * 100),
);
const m0 = run(base(0)).m;
check(
  "rozdíl zisku = součet var. marketingu",
  Math.round(m0.profitTotal - m10.profitTotal),
  Math.round(ten.rows.reduce((s, x) => s + x.marketingVar, 0)),
);

// 3) Volitelně uloží Excel s marketingPct = 10 pro kontrolu vzorců (přepočet např. v LibreOffice).
const xlsxPath = process.argv[2];
if (xlsxPath) {
  const data = base(10);
  const results = Object.fromEntries(
    SCENARIOS.map((s) => {
      const rows = simulate("commerce", data, s.factor);
      return [s.id, { metrics: computeMetrics("commerce", data, rows) }];
    }),
  ) as Parameters<typeof buildBusinessCaseWorkbook>[1]["results"];
  const wb = buildBusinessCaseWorkbook(XLSX, { projectName: "Ukázka e-shop", group: "commerce", data, results });
  writeFileSync(xlsxPath, XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
  console.log(`\nExcel uložen: ${xlsxPath}`);
}

if (failed) {
  console.error(`\n${failed} kontrol selhalo.`);
  process.exit(1);
}
console.log("\nVšechny kontroly prošly.");
