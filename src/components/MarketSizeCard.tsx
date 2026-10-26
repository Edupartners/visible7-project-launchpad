import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Globe2, Loader2, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AiPrivacyNote } from "@/components/AiPrivacyNote";
import { loadProjectKeys } from "@/lib/projectData";
import { track } from "@/lib/track";
import { supabase } from "@/integrations/visible7/client";
import { useAccess } from "@/lib/access";
import { PremiumLock } from "@/components/access/Locks";
import {
  CONFIDENCE_LABEL,
  MARKET_KEY,
  MARKET_LIMIT,
  type MarketSize,
  REGION_LABEL,
  marketRunsUsed,
  runMarketSize,
  sharePct,
  shortCzk,
  shortCzkText,
} from "@/lib/market";

const LEVELS = [
  { key: "tam", label: "Celý trh", abbr: "TAM", hint: "roční útrata za celou kategorii" },
  { key: "sam", label: "Dostupný trh", abbr: "SAM", hint: "část, kterou obsloužíte svým modelem" },
  { key: "som", label: "Získatelný trh", abbr: "SOM", hint: "realistický podíl za 2–3 roky" },
] as const;

const CONFIDENCE_STYLE: Record<MarketSize["confidence"], string> = {
  nizka: "bg-orange-50 text-orange-800 ring-orange-200",
  stredni: "bg-amber-50 text-amber-800 ring-amber-200",
  vysoka: "bg-leaf-50 text-leaf-700 ring-leaf-200",
};

/** Velikost trhu s AI a vyhledáváním na webu (brána 2). Výsledek bere i pitch. */
export const MarketSizeCard = ({ projectId }: { projectId: string }) => {
  const { toast } = useToast();
  const [market, setMarket] = useState<MarketSize | null>(null);
  const [planYear, setPlanYear] = useState<number | null>(null);
  const [used, setUsed] = useState(0);
  const [region, setRegion] = useState<MarketSize["region"]>("cz");
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const access = useAccess();
  const [isAdmin, setIsAdmin] = useState(false);
  // Jen pro placený přístup (bez ohledu na přepínač paywallu) – výpočet stojí reálné peníze. Správce může testovat.
  const allowed = access.paid || isAdmin;

  useEffect(() => {
    supabase.rpc("is_admin").then(({ data }) => setIsAdmin(data === true));
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([loadProjectKeys(projectId, [MARKET_KEY, "business_case_summary"]), marketRunsUsed(projectId)]).then(
      ([raw, n]) => {
        if (!active) return;
        const m = raw[MARKET_KEY] as MarketSize | undefined;
        if (m?.tam) {
          setMarket(m);
          setRegion(m.region ?? "cz");
        }
        const s = raw.business_case_summary as { scenare?: { realisticky?: { obrat_24m?: number } } } | undefined;
        const obrat = s?.scenare?.realisticky?.obrat_24m;
        setPlanYear(obrat ? obrat / 2 : null);
        setUsed(n);
      },
    );
    return () => {
      active = false;
    };
  }, [projectId]);

  useEffect(() => {
    if (!busy) return;
    setSeconds(0);
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [busy]);

  const left = Math.max(MARKET_LIMIT - used, 0);

  const run = async () => {
    setBusy(true);
    const res = await runMarketSize(projectId, region);
    setBusy(false);
    if (res.error || !res.output) {
      toast({ title: "Velikost trhu se nepodařilo spočítat", description: res.error, variant: "destructive" });
      return;
    }
    setMarket(res.output);
    setUsed((n) => n + 1);
    track("market_size", { region });
    toast({ title: "Velikost trhu je hotová", description: "Čísla se propíšou i do pitche." });
  };

  const planShare = market && planYear ? sharePct(planYear, market.sam.value_czk) : null;
  const ambitious = market && planYear ? planYear > market.som.value_czk : false;

  return (
    <Card className="card-apple p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Globe2 className="h-5 w-5 text-leaf-600" aria-hidden="true" /> Velikost trhu
          </h3>
          <p className="text-sm text-muted-foreground">
            AI dohledá na webu aktuální čísla a spočítá, jak velký je váš trh. Každé číslo má výpočet a zdroj, takže ho
            obhájíte před investorem i bankou.
          </p>
          {allowed && (
            <p className="mt-1 text-xs text-muted-foreground">
              Zbývá {left} z {MARKET_LIMIT} výpočtů pro tento projekt.
            </p>
          )}
        </div>
        {allowed && (
          <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
            <div role="radiogroup" aria-label="Region trhu" className="inline-flex rounded-xl border border-border p-1">
              {(Object.keys(REGION_LABEL) as MarketSize["region"][]).map((r) => (
                <button
                  key={r}
                  role="radio"
                  aria-checked={region === r}
                  onClick={() => setRegion(r)}
                  disabled={busy}
                  className={`rounded-lg px-3 py-1 text-sm font-semibold transition-colors ${
                    region === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {REGION_LABEL[r]}
                </button>
              ))}
            </div>
            <Button
              variant={market ? "outline" : "default"}
              className="rounded-[10px]"
              onClick={run}
              disabled={busy || left === 0}
            >
              {busy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : market ? (
                <RefreshCw className="mr-2 h-4 w-4" />
              ) : (
                <Globe2 className="mr-2 h-4 w-4" />
              )}
              {busy ? "Hledám data…" : market ? "Spočítat znovu" : "Spočítat velikost trhu"}
            </Button>
          </div>
        )}
      </div>
      {allowed ? (
        <AiPrivacyNote className="mt-3" />
      ) : (
        !access.loading && (
          <div className="mt-4">
            <PremiumLock feature="market" compact />
          </div>
        )
      )}

      {busy && (
        <p className="mt-4 rounded-xl bg-leaf-50 p-4 text-sm text-leaf-800 ring-1 ring-leaf-200">
          Prohledávám statistiky, studie a data asociací. Trvá to obvykle 1–2 minuty ({seconds} s). Stránku nechte
          otevřenou.
        </p>
      )}

      {market && !busy && (
        <div className="mt-6 space-y-6">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold">{market.category}</span>
            <span className="text-muted-foreground">· {REGION_LABEL[market.region ?? "cz"]}, ročně</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${CONFIDENCE_STYLE[market.confidence]}`}
              title={market.confidence_why}
            >
              {CONFIDENCE_LABEL[market.confidence]}
            </span>
          </div>

          <ol className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch">
            {LEVELS.map((l, i) => {
              const v = market[l.key];
              const s = shortCzk(v.value_czk);
              const parent = i > 0 ? market[LEVELS[i - 1].key].value_czk : null;
              return [
                i > 0 && (
                  <li
                    key={`${l.key}-arrow`}
                    aria-hidden="true"
                    className="flex items-center justify-center gap-1 text-xs font-semibold text-muted-foreground md:flex-col"
                  >
                    <ArrowRight className="h-4 w-4 rotate-90 md:rotate-0" />
                    {parent ? sharePct(v.value_czk, parent) : null}
                  </li>
                ),
                <li
                  key={l.key}
                  className={`rounded-2xl p-5 ${i === 2 ? "bg-leaf-500 text-white" : "bg-leaf-50 ring-1 ring-leaf-200"}`}
                >
                  <p
                    className={`text-xs font-bold uppercase tracking-[0.12em] ${i === 2 ? "text-white/80" : "text-leaf-700"}`}
                  >
                    {l.abbr} · {l.label}
                  </p>
                  <p className="mt-2 flex items-baseline gap-1.5 tabular-nums">
                    <span className="text-4xl font-extrabold tracking-tight">{s.num}</span>
                    <span className="text-sm font-bold">{s.unit}</span>
                  </p>
                  <p className={`mt-1 text-xs ${i === 2 ? "text-white/80" : "text-muted-foreground"}`}>{l.hint}</p>
                  <p className={`mt-3 text-sm leading-relaxed ${i === 2 ? "text-white/90" : "text-foreground/80"}`}>
                    {v.formula}
                  </p>
                </li>,
              ];
            })}
          </ol>

          {planShare && (
            <p className="rounded-xl bg-secondary/70 p-4 text-sm leading-relaxed">
              Průměrné roční tržby z vašeho byznys casu ({shortCzkText(planYear)}) jsou{" "}
              <strong>{planShare} dostupného trhu</strong>.{" "}
              {ambitious
                ? "To je víc, než AI považuje za realisticky získatelné. Buďte připraveni vysvětlit, čím ten podíl získáte, nebo plán zmírněte."
                : "Plán se vejde do realisticky získatelného podílu, což je pro investora dobrý signál."}
            </p>
          )}

          {market.assumptions.length > 0 && (
            <div>
              <h4 className="mb-2 font-semibold">Předpoklady, které nejsou přímo ze zdroje</h4>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {market.assumptions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h4 className="mb-2 font-semibold">Zdroje</h4>
            {market.sources.length ? (
              <ul className="space-y-2 text-sm">
                {market.sources.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-start gap-1 font-semibold text-primary hover:underline"
                    >
                      {s.title} <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    </a>
                    {s.used_for && <span className="block text-muted-foreground">{s.used_for}</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                AI nenašla ověřitelný zdroj, čísla jsou jen odhad. Před investorem je raději podložte vlastním
                průzkumem.
              </p>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Jde o orientační odhad z veřejných dat, ne o průzkum trhu. Než ho použijete v jednání, otevřete si zdroje a
            čísla zkontrolujte.
          </p>
        </div>
      )}
    </Card>
  );
};
