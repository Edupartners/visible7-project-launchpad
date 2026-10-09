/** Ceník VISIBLE7. Ceny jsou konečné, včetně DPH (shodně s podmínkami užívání). */
export interface Plan {
  id: "free" | "mesic" | "ctvrtleti" | "rok";
  name: string;
  price: string;
  note: string;
  perMonth?: string;
  items: string[];
  highlight?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Zdarma",
    price: "0 Kč",
    note: "napořád",
    items: ["Brána 1 Modrý oceán", "Brána 2 Lean Canvas s AI", "Osvědčení za splněné brány", "Bez platební karty"],
  },
  {
    id: "mesic",
    name: "1 měsíc",
    price: "350 Kč",
    note: "jednorázově",
    items: ["Všech 7 bran", "AI byznys case a pitch na A4", "Export do Excelu", "Videa ke všem branám"],
  },
  {
    id: "ctvrtleti",
    name: "3 měsíce",
    price: "499 Kč",
    note: "jednorázově",
    perMonth: "166 Kč měsíčně",
    items: ["Všech 7 bran", "AI byznys case a pitch na A4", "Export do Excelu", "Čas dotáhnout projekt do spuštění"],
    highlight: true,
  },
  {
    id: "rok",
    name: "1 rok",
    price: "990 Kč",
    note: "jednorázově",
    perMonth: "83 Kč měsíčně",
    items: ["Všech 7 bran", "AI byznys case a pitch na A4", "Export do Excelu", "Celý rok na rozjezd i růst"],
  },
];

export const VAT_NOTE = "Všechny ceny jsou konečné, včetně DPH.";
