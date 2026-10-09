/**
 * Export byznys case (fáze 3) do Excelu s živými vzorci.
 * Uživatel v listu „Předpoklady“ změní číslo a přepočítá se celý plán i souhrn – stejně jako v aplikaci.
 * Soubor .xlsx jde otevřít i v Google Sheets (Soubor → Importovat) nebo v Numbers.
 */
import type { WorkBook, WorkSheet, CellObject } from "xlsx";
import {
  BusinessCaseData,
  GROUP_COPY,
  HORIZON,
  Metrics,
  RevenueGroup,
  SCENARIOS,
  ScenarioId,
} from "@/lib/businessCase";

const KC = '#,##0 "Kč"';
const PCT = "0.0%";
const NUM = "#,##0";
const NUM1 = "#,##0.0";

type Cell = string | number | { f: string; z?: string } | { v: number; z: string } | null;

const toCell = (c: Cell): CellObject | undefined => {
  if (c === null || c === undefined) return undefined;
  if (typeof c === "number") return { t: "n", v: c };
  if (typeof c === "string") return { t: "s", v: c };
  if ("f" in c) return { t: "n", f: c.f, z: c.z } as CellObject;
  return { t: "n", v: c.v, z: c.z };
};

const colName = (i: number) => String.fromCharCode(65 + i);

function sheet(rows: Cell[][], widths: number[]): WorkSheet {
  const ws: WorkSheet = {};
  let maxC = 0;
  rows.forEach((row, r) =>
    row.forEach((c, ci) => {
      const cell = toCell(c);
      if (cell) ws[`${colName(ci)}${r + 1}`] = cell;
      maxC = Math.max(maxC, ci);
    }),
  );
  ws["!ref"] = `A1:${colName(maxC)}${rows.length}`;
  ws["!cols"] = widths.map((wch) => ({ wch }));
  return ws;
}

export interface ExcelInput {
  projectName: string;
  typeName?: string;
  group: RevenueGroup;
  data: BusinessCaseData;
  /** Výsledky z aplikace pro porovnání scénářů */
  results: Record<ScenarioId, { metrics: Metrics }>;
}

const KIND_LABEL = { jednorazove: "jednorázově", mesicni: "měsíčně", marketing: "marketing měsíčně" } as const;

export function buildBusinessCaseWorkbook(XLSX: typeof import("xlsx"), input: ExcelInput): WorkBook {
  const { group, data } = input;
  const r = data.revenue;
  const copy = GROUP_COPY[group];
  const factor = SCENARIOS.find((s) => s.id === data.scenario)?.factor ?? 1;
  const P = "'Předpoklady'!";
  const M = "'Po měsících'!";
  const S = "Souhrn!";

  // ---- List Předpoklady ----------------------------------------------------
  const pRows: Cell[][] = [
    [`Byznys case – ${input.projectName}`],
    [
      `Typ byznysu: ${input.typeName ?? copy.title}. Exportováno z aplikace VISIBLE7 MICEK™ ${new Date().toLocaleDateString("cs-CZ")}.`,
    ],
    ["Měňte čísla ve sloupci „Hodnota“ – plán po měsících i souhrn se přepočítají samy."],
    [],
    ["Předpoklad", "Hodnota", "Vysvětlení"],
  ];
  const addr: Record<string, string> = {};
  const input_ = (key: string, label: string, value: number, note: string, z?: string) => {
    pRows.push([label, z ? { v: value, z } : value, note]);
    addr[key] = `${P}$B$${pRows.length}`;
  };

  if (group !== "content") input_("price", copy.price, r.price || 0, "Cena, ze které se počítají tržby.", KC);
  const gm = group === "content" && !r.grossMargin ? 100 : r.grossMargin || 0;
  input_("gm", "Hrubá marže (%)", gm, "Kolik z tržeb zbude po přímých nákladech (zboží, doprava, platební brána).");
  input_("vol", copy.volume, r.volume12 || 0, "Cílový objem ve 12. měsíci. Od spuštění k němu roste pozvolna.", NUM);
  input_("growth", "Růst objemu ve 2. roce (%)", r.growthYear2 || 0, "O kolik objem vzroste do konce 2. roku.");
  if (group === "commerce")
    input_("repeat", "Opakované nákupy (%)", r.repeatRate || 0, "Podíl objednávek od stálých zákazníků.");
  if (group === "subscription")
    input_("churn", "Odchodovost měsíčně (%)", r.churn || 0, "Kolik % předplatitelů každý měsíc odejde.");
  if (group === "leads")
    input_("conv", "Konverze kontaktu na zakázku (%)", r.conversion || 0, "Kolik % poptávek se změní v zakázku.");
  if (group === "content")
    input_("rpm", "Výnos na 1 000 návštěv (Kč)", r.rpm || 0, "Příjem z reklamy a provizí na 1 000 návštěv.", KC);
  if (group === "marketplace") input_("comm", "Provize (%)", r.commission || 0, "Kolik % z prodeje si necháváte.");
  input_("factor", "Násobek scénáře", factor, "1 = realistický plán, 0,6 = opatrný, 1,4 = optimistický.", NUM1);
  input_("target", "Cílový zisk (% z tržeb)", data.targetProfit || 0, "Používá se pro výpočet maximálního PNO.");
  input_("tax", "Daň z příjmu (%)", data.taxRate ?? 0, "Počítá se zvlášť za 1. a 2. rok, jen z kladného zisku.");

  pRows.push([], ["Náklady", "Částka", "Druh (jednorázově / měsíčně / marketing měsíčně)"]);
  const costStart = pRows.length + 1;
  for (const c of data.costs) pRows.push([c.name, { v: c.amount || 0, z: KC }, KIND_LABEL[c.kind]]);
  // Volné řádky pro vlastní doplnění – počítají se do součtů.
  for (let i = 0; i < 10; i++) pRows.push([]);
  const costEnd = pRows.length;
  const range = (col: string) => `${P}$${col}$${costStart}:$${col}$${costEnd}`;
  const sumif = (label: string) => `SUMIF(${range("C")},"${label}",${range("B")})`;
  pRows.push([]);
  pRows.push(["Jednorázové náklady celkem", { f: sumif("jednorázově"), z: KC }]);
  addr.oneOff = `${P}$B$${pRows.length}`;
  pRows.push(["Měsíční provoz celkem", { f: sumif("měsíčně"), z: KC }]);
  addr.fixed = `${P}$B$${pRows.length}`;
  pRows.push(["Marketing měsíčně celkem", { f: sumif("marketing měsíčně"), z: KC }]);
  addr.mkt = `${P}$B$${pRows.length}`;

  // ---- List Po měsících ------------------------------------------------------
  const volLabel = group === "subscription" ? "Aktivní předplatitelé" : group === "content" ? "—" : "Noví zákazníci";
  const mRows: Cell[][] = [
    [
      "Měsíc",
      "Rozjezd",
      "Objem",
      volLabel,
      "Tržby",
      "Hrubý zisk",
      "Provoz",
      "Marketing",
      "Jednorázově",
      "Zisk",
      "Kumulativně",
      "Zisk ≥ 0",
      "Návratnost",
    ],
    [
      0,
      0,
      0,
      0,
      { v: 0, z: KC },
      { v: 0, z: KC },
      { v: 0, z: KC },
      { v: 0, z: KC },
      { f: addr.oneOff, z: KC },
      { f: "-I2", z: KC },
      { f: "J2", z: KC },
      0,
      0,
    ],
  ];
  for (let m = 1; m <= HORIZON; m++) {
    const row = m + 2;
    const prev = row - 1;
    const v = `C${row}`;
    let d: string;
    let e: string;
    switch (group) {
      case "commerce":
        d = `${v}*(1-MIN(${addr.repeat}/100,0.95))`;
        e = `${v}*${addr.price}`;
        break;
      case "subscription":
        d = `D${prev}*(1-MIN(${addr.churn}/100,1))+${v}`;
        e = `D${row}*${addr.price}`;
        break;
      case "leads":
        d = `${v}*${addr.conv}/100`;
        e = `D${row}*${addr.price}`;
        break;
      case "content":
        d = "0";
        e = `${v}/1000*${addr.rpm}`;
        break;
      case "marketplace":
        d = v;
        e = `${v}*${addr.price}*${addr.comm}/100`;
        break;
      default:
        d = v;
        e = `${v}*${addr.price}`;
    }
    mRows.push([
      m,
      { f: `IF(A${row}<=12,(A${row}/12)^1.5,1+${addr.growth}/100*(A${row}-12)/12)`, z: "0.00" },
      { f: `${addr.vol}*${addr.factor}*B${row}`, z: NUM1 },
      { f: d, z: NUM1 },
      { f: e, z: KC },
      { f: `E${row}*${addr.gm}/100`, z: KC },
      { f: addr.fixed, z: KC },
      { f: addr.mkt, z: KC },
      { v: 0, z: KC },
      { f: `F${row}-G${row}-H${row}-I${row}`, z: KC },
      { f: `K${prev}+J${row}`, z: KC },
      { f: `IF(AND(E${row}>0,J${row}>=0),1,0)` },
      { f: `IF(AND(K${row}>=0,A${row}>=${S}$B$14),1,0)` },
    ]);
  }
  const last = HORIZON + 2;
  const col = (c: string, from = 3, to = last) => `${M}$${c}$${from}:$${c}$${to}`;

  // ---- List Souhrn (pevné adresy řádků – odkazuje na ně sloupec M) ----------
  const sRows: Cell[][] = [
    ["Souhrn za 2 roky", "Hodnota"],
    ["Tržby celkem", { f: `SUM(${col("E")})`, z: KC }], // B2
    ["Náklady celkem", { f: `${M}$I$2+SUM(${col("E")})-SUM(${col("F")})+SUM(${col("G")})+SUM(${col("H")})`, z: KC }], // B3
    ["Zisk před zdaněním", { f: "B2-B3", z: KC }], // B4
    [
      "Daň z příjmu",
      { f: `(MAX(0,SUM(${col("J", 2, 14)}))+MAX(0,SUM(${col("J", 15, last)})))*${addr.tax}/100`, z: KC },
    ], // B5
    ["Zisk po zdanění", { f: "B4-B5", z: KC }], // B6
    ["Potřebný kapitál", { f: `-MIN(0,MIN(${col("K", 2)}))`, z: KC }], // B7
    ["Návratnost investice (ROI)", { f: `IF(B7>0,B4/B7,"—")`, z: PCT }], // B8
    ["Bod zvratu (měsíc)", { f: `IFERROR(INDEX(${col("A")},MATCH(1,${col("L")},0)),"nedosaženo")` }], // B9
    [
      "Investice se vrátí (měsíc)",
      { f: `IF(B7=0,IF(B2>0,0,"—"),IFERROR(INDEX(${col("A")},MATCH(1,${col("M")},0)),"nedosaženo"))` },
    ], // B10
    ["Tržby ve 12. měsíci", { f: `${M}$E$14`, z: KC }], // B11
    ["PNO ve 12. měsíci", { f: `IF(${M}$E$14>0,${M}$H$14/${M}$E$14,"—")`, z: PCT }], // B12
    ["Maximální PNO", { f: `IF(${M}$E$14>0,(${addr.gm}-${M}$G$14/${M}$E$14*100-${addr.target})/100,"—")`, z: PCT }], // B13
    ["Měsíc nejnižšího stavu peněz", { f: `INDEX(${col("A", 2)},MATCH(MIN(${col("K", 2)}),${col("K", 2)},0))` }], // B14
    [],
    [
      "Scénáře (spočítáno v aplikaci při exportu)",
      ...SCENARIOS.map((s) => `${s.label} (${s.factor.toLocaleString("cs-CZ")}×)`),
    ],
  ];
  const scen = (label: string, pick: (m: Metrics) => number | null, z: string) =>
    sRows.push([
      label,
      ...SCENARIOS.map((s) => {
        const v = pick(input.results[s.id].metrics);
        return v === null || !Number.isFinite(v) ? "—" : { v, z };
      }),
    ]);
  scen("Tržby za 2 roky", (m) => m.revenueTotal, KC);
  scen("Zisk před zdaněním", (m) => m.profitTotal, KC);
  scen("Zisk po zdanění", (m) => m.profitAfterTax, KC);
  scen("Potřebný kapitál", (m) => m.requiredCapital, KC);
  scen("ROI", (m) => (m.roi === null ? null : m.roi / 100), PCT);
  scen("Bod zvratu (měsíc)", (m) => m.breakEvenMonth, NUM);
  sRows.push(
    [],
    ["Orientační model, nejde o daňové ani investiční poradenství. VISIBLE7 MICEK™ · Edu Partners s.r.o."],
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet(sRows, [42, 20, 20, 20]), "Souhrn");
  XLSX.utils.book_append_sheet(wb, sheet(pRows, [44, 16, 70]), "Předpoklady");
  XLSX.utils.book_append_sheet(wb, sheet(mRows, [8, 9, 10, 18, 14, 14, 12, 12, 13, 14, 14, 9, 11]), "Po měsících");
  return wb;
}

const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "projekt";

export async function downloadBusinessCaseExcel(input: ExcelInput) {
  const XLSX = await import("xlsx");
  const wb = buildBusinessCaseWorkbook(XLSX, input);
  XLSX.writeFile(wb, `byznys-case-${slug(input.projectName)}.xlsx`, { compression: true });
}
