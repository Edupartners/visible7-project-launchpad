import { useMemo, useState } from "react";
import { Check, Copy, ExternalLink, Globe2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSupabaseProgress } from "@/hooks/useSupabaseProgress";
import { useProject } from "@/contexts/ProjectContext";
import type { BusinessCaseData } from "@/lib/businessCase";
import { DIAGNOSIS_KEY, Diagnosis, caseFromDiagnosis } from "@/lib/diagnosis";
import { track } from "@/lib/track";

export const MARKET_KEY = "market_rentgen";

interface MarketRentgenData {
  location: string;
  summary: string;
  savedAt?: string;
}

/** Kolik prodejů měsíčně je potřeba k pokrytí měsíčních nákladů (provoz + marketing). */
export function breakEvenSales(bc: BusinessCaseData): number | null {
  const fixed = bc.costs.filter((c) => c.kind !== "jednorazove").reduce((s, c) => s + (c.amount || 0), 0);
  const perSale = (bc.revenue.price || 0) * ((bc.revenue.grossMargin || 0) / 100);
  if (!fixed || perSale <= 0) return null;
  return Math.ceil(fixed / perSale);
}

export function buildMarketPrompt(p: {
  idea: string;
  customer: string;
  location: string;
  price: number | null;
  sales: number | null;
}) {
  const lines = [
    "Jsi analytik trhu. Pomoz mi ověřit podnikatelský nápad. Používej vyhledávání na internetu a u každého čísla uveď zdroj. Když údaj nenajdeš, napiš odhad a označ ho jako odhad.",
    "",
    `Nápad: ${p.idea || "(doplňte)"}`,
    `Zákazník: ${p.customer || "(doplňte)"}`,
    `Oblast: ${p.location || "(doplňte)"}`,
  ];
  if (p.price) lines.push(`Cena: průměrný nákup ${p.price.toLocaleString("cs-CZ")} Kč`);
  if (p.sales) lines.push(`K bodu zvratu potřebuji: ${p.sales.toLocaleString("cs-CZ")} prodejů měsíčně`);
  lines.push(
    "",
    "Zjisti:",
    "1. Velikost trhu: počet obyvatel a domácností v oblasti a kolik průměrně utratí za tento typ produktu nebo služby (ČSÚ, data obce nebo městské části). Uveď rozpětí.",
    "2. Konkurenci v okolí: 5–10 firem, které nabízejí podobné, a čím se liší.",
    "3. Poptávku: zda a jak lidé něco takového hledají na internetu.",
    "4. Kolik procent trhu musím získat, abych dosáhl bodu zvratu, a zda je to realistické.",
    "5. Tři největší rizika a tři příležitosti.",
    "",
    "Na konci napiš shrnutí přesně v tomto tvaru na jeden řádek:",
    "VELIKOST TRHU: … | KONKURENCE: … | POTŘEBNÝ PODÍL: … % | VERDIKT: reálné / ambiciózní / nereálné",
  );
  return lines.join("\n");
}

/** Rentgen trhu: aplikace připraví prompt z dat projektu, uživatel ho spustí ve svém ChatGPT nebo Claude. */
export const MarketRentgen = () => {
  const { currentProject } = useProject();
  const [diagnosis] = useSupabaseProgress<Diagnosis | null>(DIAGNOSIS_KEY, null);
  const [bc] = useSupabaseProgress<BusinessCaseData | null>("business_case", null);
  const [saved, setSaved] = useSupabaseProgress<MarketRentgenData | null>(MARKET_KEY, null);
  const [location, setLocation] = useState(saved?.location ?? "");
  const [summary, setSummary] = useState(saved?.summary ?? "");
  const [copied, setCopied] = useState(false);

  const facts = useMemo(() => {
    const live = bc?.revenue?.price ? bc : diagnosis ? caseFromDiagnosis(diagnosis.ai) : null;
    return {
      idea: diagnosis?.answers.idea ?? "",
      customer: diagnosis?.answers.customer ?? "",
      price: live?.revenue.price || null,
      sales: live ? breakEvenSales(live) : null,
    };
  }, [diagnosis, bc]);

  const loc = location || saved?.location || "";
  const prompt = buildMarketPrompt({ ...facts, location: loc });
  const ready = loc.trim().length > 1;

  const copy = async () => {
    await navigator.clipboard.writeText(prompt).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    track("market_prompt_copy", {}, currentProject?.id);
  };
  const openIn = (where: "chatgpt" | "claude") => {
    const q = encodeURIComponent(prompt);
    track("market_prompt_open", { where }, currentProject?.id);
    window.open(
      where === "chatgpt" ? `https://chatgpt.com/?q=${q}` : `https://claude.ai/new?q=${q}`,
      "_blank",
      "noopener",
    );
  };

  return (
    <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
      <p className="flex items-center gap-2 text-sm font-semibold text-primary">
        <Globe2 className="h-4 w-4" /> Rentgen trhu · zdarma ve vašem ChatGPT nebo Claude
      </p>
      <h2 className="mt-1 text-2xl font-bold tracking-tight">Jakou má nápad šanci tam, kde chcete prodávat?</h2>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Připravili jsme dotaz pro AI z údajů vašeho projektu. AI dohledá velikost trhu, konkurenci v okolí a spočítá,
        kolik procent trhu potřebujete k bodu zvratu.
      </p>

      <label className="mt-6 block max-w-md text-sm font-semibold" htmlFor="mr-loc">
        Kde chcete prodávat?
      </label>
      <Input
        id="mr-loc"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="např. Praha 4, Ostrava, celá ČR online"
        className="mt-1.5 max-w-md"
      />

      {ready && (
        <>
          <pre className="mt-5 max-h-56 overflow-auto whitespace-pre-wrap rounded-2xl bg-muted/60 p-4 font-sans text-sm leading-relaxed">
            {prompt}
          </pre>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={copy} className="rounded-[10px]">
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? "Zkopírováno" : "Zkopírovat dotaz"}
            </Button>
            <Button variant="outline" onClick={() => openIn("chatgpt")} className="rounded-[10px]">
              Otevřít v ChatGPT <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => openIn("claude")} className="rounded-[10px]">
              Otevřít v Claude <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <label className="mt-8 block text-sm font-semibold" htmlFor="mr-sum">
            Vložte sem shrnutí od AI (poslední řádek odpovědi)
          </label>
          <Textarea
            id="mr-sum"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="VELIKOST TRHU: … | KONKURENCE: … | POTŘEBNÝ PODÍL: … % | VERDIKT: …"
            className="mt-1.5"
            rows={3}
          />
          <Button
            variant="outline"
            className="mt-3 rounded-[10px]"
            disabled={!summary.trim()}
            onClick={() => {
              setSaved({ location: loc, summary: summary.trim(), savedAt: new Date().toISOString() });
              track("market_summary_saved", {}, currentProject?.id);
            }}
          >
            <Save className="mr-2 h-4 w-4" /> Uložit k projektu
          </Button>
          {saved?.summary && (
            <p className="mt-2 text-sm text-emerald-700">Uloženo k projektu. Najdete ho tu i příště.</p>
          )}
        </>
      )}
      <p className="mt-6 text-xs text-muted-foreground">
        Výsledek je orientační odhad AI, ne záruka úspěchu. Ověřte si hlavně čísla, u kterých chybí zdroj.
      </p>
    </section>
  );
};
