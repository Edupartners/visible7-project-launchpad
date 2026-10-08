import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartesianGrid, Line, LineChart, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useSupabaseProgress } from "@/hooks/useSupabaseProgress";
import { useProject } from "@/contexts/ProjectContext";
import { loadProjectKeys, loadVisionSummary } from "@/lib/projectData";
import {
  BASE_COSTS,
  BusinessCaseData,
  CostItem,
  CostKind,
  EMPTY_CASE,
  GROUP_COPY,
  Metrics,
  Rating,
  RevenueInputs,
  SCENARIOS,
  ScenarioId,
  computeMetrics,
  costsFromCanvas,
  groupOf,
  newId,
  ratingLabel,
  simulate,
} from "@/lib/businessCase";
import { AI_LIMITS, callAi, loadAiUsage } from "@/lib/ai";
import { supabase } from "@/integrations/visible7/client";
import { businessTypes } from "@/types/implementation";
import { PhaseCelebration } from "@/components/PhaseCelebration";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Loader2, Mail, Plus, RefreshCw, Trash2 } from "lucide-react";

interface BusinessCasePhaseProps {
  onComplete: () => void;
}

export interface CaseComment {
  summary: string;
  sensitivities: string[];
  toVerify: string[];
  nextSteps: string[];
}

const czk = (v: number) => `${Math.round(v).toLocaleString("cs-CZ")} Kč`;
const pct = (v: number | null) => (v === null ? "—" : `${(Math.round(v * 10) / 10).toLocaleString("cs-CZ")} %`);
const monthLabel = (m: number | null) => (m === null ? "přes 2 roky" : m === 0 ? "hned" : `${m}. měsíc`);

const RATING_STYLE: Record<Rating, string> = {
  dobre: "bg-emerald-100 text-emerald-800",
  hranice: "bg-amber-100 text-amber-900",
  spatne: "bg-red-100 text-red-800",
  nelze: "bg-secondary text-muted-foreground",
};

const KIND_COPY: Record<CostKind, { title: string; hint: string; unit: string }> = {
  jednorazove: { title: "Jednorázové náklady před spuštěním", hint: "Web, logo, první zásoba, natočení kurzu…", unit: "Kč celkem" },
  mesicni: { title: "Měsíční provoz", hint: "Hosting, nástroje, účetní, vaše odměna nebo externí pomoc…", unit: "Kč měsíčně" },
  marketing: { title: "Marketing", hint: "Rozpočet na kanály z Lean Canvasu. Z něj se počítá PNO.", unit: "Kč měsíčně" },
};

/** Číselné pole s popiskem; prázdná hodnota = 0. */
const NumField = ({
  label,
  value,
  onChange,
  suffix,
  placeholder,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  placeholder?: string;
  hint?: string;
}) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-semibold">{label}</span>
    <span className="relative block">
      <Input
        type="number"
        inputMode="decimal"
        min={0}
        value={value ? String(value) : ""}
        placeholder={placeholder}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value.replace(",", ".")) || 0))}
        className={suffix ? "pr-16" : ""}
      />
      {suffix && (
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">{suffix}</span>
      )}
    </span>
    {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
  </label>
);

const Stat = ({ label, value, note }: { label: string; value: string; note?: string }) => (
  <div className="rounded-xl bg-secondary/70 p-3 sm:p-4">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="mt-1 whitespace-nowrap text-base font-bold tabular-nums sm:text-xl">{value}</p>
    {note && <p className="mt-0.5 text-xs text-muted-foreground">{note}</p>}
  </div>
);

const RatingPill = ({ rating }: { rating: Rating }) => (
  <span className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${RATING_STYLE[rating]}`}>{ratingLabel[rating]}</span>
);

export const BusinessCasePhase = ({ onComplete }: BusinessCasePhaseProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentProject, setBusinessType } = useProject();
  const projectId = currentProject?.id;
  const [data, setData, { loading }] = useSupabaseProgress<BusinessCaseData>("business_case", EMPTY_CASE);
  const [context, setContext] = useState<{ customer: string; usp: string } | null>(null);
  const [comment, setComment] = useState<CaseComment | null>(null);
  const [commentsUsed, setCommentsUsed] = useState(0);
  const [busy, setBusy] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const group = groupOf(currentProject?.business_type);
  const copy = GROUP_COPY[group];
  const typeName = businessTypes.find((t) => t.id === currentProject?.business_type)?.name;

  // Převzetí řádků z Lean Canvasu (jen poprvé) a shrnutí fáze 1.
  useEffect(() => {
    if (loading || !projectId) return;
    let active = true;
    loadVisionSummary(projectId).then((v) => {
      if (active && v) setContext({ customer: v.basics.customer ?? "", usp: v.usp });
    });
    if (!data.prefilled && data.costs.length === 0) {
      loadProjectKeys(projectId, ["ideation_lean_canvas"]).then((raw) => {
        if (!active) return;
        const fromCanvas = costsFromCanvas(raw["ideation_lean_canvas"] as { costStructure?: string; channels?: string } | null);
        setData((prev) => ({ ...prev, costs: fromCanvas.length ? fromCanvas : BASE_COSTS(), prefilled: true }));
      });
    }
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, projectId]);

  useEffect(() => {
    if (!projectId) return;
    let active = true;
    setComment(null);
    loadAiUsage(projectId, "3").then((u) => {
      if (!active) return;
      setCommentsUsed(u.used.vyhodnoceni);
      setComment(u.latest.vyhodnoceni as unknown as CaseComment | null);
    });
    return () => {
      active = false;
    };
  }, [projectId]);

  const results = useMemo(() => {
    const out = {} as Record<ScenarioId, { metrics: Metrics; rows: ReturnType<typeof simulate> }>;
    for (const s of SCENARIOS) {
      const rows = simulate(group, data, s.factor);
      out[s.id] = { rows, metrics: computeMetrics(group, data, rows) };
    }
    return out;
  }, [group, data]);

  const current = results[data.scenario];
  const m = current.metrics;

  const setRevenue = (patch: Partial<RevenueInputs>) => setData((prev) => ({ ...prev, revenue: { ...prev.revenue, ...patch } }));
  const updateCost = (id: string, patch: Partial<CostItem>) =>
    setData((prev) => ({ ...prev, costs: prev.costs.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  const removeCost = (id: string) => setData((prev) => ({ ...prev, costs: prev.costs.filter((c) => c.id !== id) }));
  const addCost = (kind: CostKind) =>
    setData((prev) => ({ ...prev, costs: [...prev.costs, { id: newId(), name: "", amount: 0, kind }] }));

  const hasRevenue = m.revenue12 > 0;
  const hasCosts = data.costs.some((c) => c.amount > 0);
  const checks = [
    { label: "Typ byznysu zvolený ve fázi 2", ok: !!currentProject?.business_type, required: true },
    { label: "Příjmy vyplněné (cena, objem a marže)", ok: hasRevenue && (data.revenue.grossMargin > 0 || group === "content"), required: true },
    { label: "Alespoň jedna nákladová položka s částkou", ok: hasCosts, required: true },
    { label: "Komentář AI k výsledku (doporučeno)", ok: !!comment, required: false },
  ];
  const canFinish = checks.filter((c) => c.required).every((c) => c.ok);

  const summaryFor = (id: ScenarioId) => {
    const x = results[id].metrics;
    return {
      obrat_24m: Math.round(x.revenueTotal),
      zisk_24m: Math.round(x.profitTotal),
      marze_zisku_pct: x.profitMargin,
      hruba_marze_pct: x.grossMargin,
      potrebny_kapital: Math.round(x.requiredCapital),
      roi_pct: x.roi,
      bod_zvratu_mesic: x.breakEvenMonth,
      navratnost_mesic: x.paybackMonth,
      obrat_12_mesic: Math.round(x.revenue12),
      pno_12_pct: x.pno12,
      max_pno_pct: x.maxPno,
      ltv: x.ltv,
      cac: x.cac,
      ltv_cac: x.ltvCac,
    };
  };

  const buildSummary = () => ({
    typ: currentProject?.business_type,
    cilovy_zisk_pct: data.targetProfit,
    prijmy: data.revenue,
    naklady: data.costs.filter((c) => c.amount > 0).map((c) => ({ polozka: c.name, castka: c.amount, druh: c.kind })),
    scenare: Object.fromEntries(SCENARIOS.map((s) => [s.id, summaryFor(s.id)])),
  });

  // Souhrn spočítaných čísel ukládáme hned (čte ho AI na serveru a navazující fáze).
  const saveSummary = async () => {
    if (!projectId) return;
    await supabase
      .from("project_data")
      .upsert(
        { project_id: projectId, data_key: "business_case_summary", data_value: buildSummary() },
        { onConflict: "project_id,data_key" }
      );
  };

  const runComment = async () => {
    if (!projectId) return;
    setBusy(true);
    await saveSummary();
    const res = await callAi<CaseComment>(projectId, "case_comment");
    setBusy(false);
    if (res.error || !res.output) {
      toast({ title: "AI se nepodařilo použít", description: res.error, variant: "destructive" });
      return;
    }
    setComment(res.output);
    setCommentsUsed((n) => n + 1);
  };

  const finish = () => {
    void saveSummary();
    onComplete();
    setCelebrate(true);
  };

  const lecturerMail = () => {
    const s = summaryFor(data.scenario);
    const body = [
      `Projekt: ${currentProject?.name ?? ""}`,
      `Typ byznysu: ${typeName ?? "—"}`,
      `Obrat za 2 roky: ${czk(s.obrat_24m)}`,
      `Zisk za 2 roky: ${czk(s.zisk_24m)}`,
      `Potřebný kapitál: ${czk(s.potrebny_kapital)}`,
      `Bod zvratu: ${monthLabel(s.bod_zvratu_mesic)}`,
      `PNO ve 12. měsíci: ${pct(s.pno_12_pct)} (max. ${pct(s.max_pno_pct)})`,
      "",
      "Chtěl(a) bych svůj byznys case probrat s lektorem.",
    ].join("\n");
    return `mailto:michal.micek@edu-partners.cz?subject=${encodeURIComponent("VISIBLE7 – konzultace byznys casu")}&body=${encodeURIComponent(body)}`;
  };

  const chartData = current.rows.map((r) => ({ month: r.month, cumulative: Math.round(r.cumulative) }));
  const trough = current.rows.reduce((a, b) => (b.cumulative < a.cumulative ? b : a), current.rows[0]);
  const costsByKind = (kind: CostKind) => data.costs.filter((c) => c.kind === kind);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 pb-12 sm:px-6 lg:px-8">
      {celebrate && (
        <PhaseCelebration
          gate={3}
          title="Byznys case je hotový"
          message="Máte spočítaný obrat, zisk, potřebný kapitál i hranici PNO. Fáze 1–3 tvoří základ podnikatelského záměru."
          nextLabel="Pokračovat na Tvorbu"
          onNext={() => navigate("/implementation")}
          onHome={() => navigate("/home")}
        />
      )}

      {/* Hlavička */}
      <Card className="card-apple p-6">
        <p className="text-sm font-semibold text-primary">Fáze 3 ze 7</p>
        <h2 className="text-2xl font-bold">Byznys case</h2>
        <p className="mt-1 max-w-2xl text-muted-foreground">
          Doplňte čísla a uvidíte, kolik peněz projekt potřebuje, kdy se dostane do zisku a kolik smíte dát do marketingu.
          Položky jsme převzali z Lean Canvasu, částky zadáváte vy.
        </p>
        <dl className="mt-5 grid gap-4 border-t border-border pt-5 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground">Typ byznysu</dt>
            <dd className="font-semibold">
              {typeName ?? (
                <select
                  className="mt-1 h-9 w-full rounded-lg border border-input bg-card px-2"
                  defaultValue=""
                  onChange={(e) => projectId && setBusinessType(projectId, e.target.value)}
                >
                  <option value="" disabled>
                    Zvolte typ…
                  </option>
                  {businessTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Zákazník</dt>
            <dd className="line-clamp-2">{context?.customer || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">USP</dt>
            <dd className="line-clamp-2">{context?.usp || "—"}</dd>
          </div>
        </dl>
      </Card>

      {/* Příjmy */}
      <Card className="card-apple p-6">
        <h3 className="text-lg font-bold">Příjmy</h3>
        <p className="mb-5 text-sm text-muted-foreground">
          Zadejte plán pro 12. měsíc po spuštění. Rozjezd k němu dopočítáme postupně, druhý rok podle zadaného růstu.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          {group === "content" ? (
            <NumField
              label="Výnos na 1 000 návštěv"
              suffix="Kč"
              placeholder="např. 150"
              value={data.revenue.rpm}
              onChange={(v) => setRevenue({ rpm: v })}
              hint="Reklama a provize dohromady. U českých webů obvykle 50–300 Kč."
            />
          ) : (
            <NumField
              label={copy.price}
              suffix="Kč"
              placeholder={copy.priceHint}
              value={data.revenue.price}
              onChange={(v) => setRevenue({ price: v })}
            />
          )}
          <NumField
            label={copy.volume}
            placeholder={copy.volumeHint}
            value={data.revenue.volume12}
            onChange={(v) => setRevenue({ volume12: v })}
          />
          <NumField
            label="Hrubá marže"
            suffix="%"
            placeholder={group === "content" ? "100" : "např. 35"}
            value={data.revenue.grossMargin}
            onChange={(v) => setRevenue({ grossMargin: Math.min(v, 100) })}
            hint={copy.marginHint}
          />
          {group === "commerce" && (
            <NumField
              label="Opakované nákupy"
              suffix="%"
              placeholder="např. 20"
              value={data.revenue.repeatRate}
              onChange={(v) => setRevenue({ repeatRate: Math.min(v, 90) })}
              hint="Kolik objednávek udělají stávající zákazníci."
            />
          )}
          {group === "subscription" && (
            <NumField
              label="Odchodovost měsíčně"
              suffix="%"
              placeholder="např. 5"
              value={data.revenue.churn}
              onChange={(v) => setRevenue({ churn: Math.min(v, 100) })}
              hint="Kolik předplatitelů každý měsíc odejde. U kurzů s jednorázovou platbou dejte 100 %."
            />
          )}
          {group === "leads" && (
            <NumField
              label="Konverze kontaktu na zákazníka"
              suffix="%"
              placeholder="např. 10"
              value={data.revenue.conversion}
              onChange={(v) => setRevenue({ conversion: Math.min(v, 100) })}
            />
          )}
          {group === "marketplace" && (
            <NumField
              label="Provize z prodeje"
              suffix="%"
              placeholder="např. 10"
              value={data.revenue.commission}
              onChange={(v) => setRevenue({ commission: Math.min(v, 100) })}
            />
          )}
          <NumField
            label="Růst ve 2. roce"
            suffix="%"
            value={data.revenue.growthYear2}
            onChange={(v) => setRevenue({ growthYear2: v })}
            hint="O kolik vzroste objem mezi 12. a 24. měsícem."
          />
        </div>
      </Card>

      {/* Náklady */}
      <Card className="card-apple p-6">
        <h3 className="text-lg font-bold">Náklady</h3>
        <p className="mb-2 text-sm text-muted-foreground">
          Náklady na zboží a dopravu už jsou v hrubé marži. Sem patří vše ostatní. Položku bez částky nepočítáme.
        </p>
        {(["jednorazove", "mesicni", "marketing"] as CostKind[]).map((kind) => (
          <div key={kind} className="border-t border-border pt-5 mt-5 first-of-type:mt-3">
            <div className="mb-3">
              <h4 className="font-semibold">{KIND_COPY[kind].title}</h4>
              <p className="text-sm text-muted-foreground">{KIND_COPY[kind].hint}</p>
            </div>
            <ul className="space-y-2">
              {costsByKind(kind).map((c) => (
                <li key={c.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 sm:flex">
                  <Input
                    value={c.name}
                    onChange={(e) => updateCost(c.id, { name: e.target.value })}
                    placeholder="Název položky"
                    className="col-span-3 min-w-0 sm:flex-1"
                    aria-label="Název položky"
                  />
                  <span className="relative min-w-0 sm:w-40 sm:shrink-0">
                    <Input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      value={c.amount ? String(c.amount) : ""}
                      placeholder="0"
                      onChange={(e) => updateCost(c.id, { amount: Math.max(0, Number(e.target.value) || 0) })}
                      className="pr-10 text-right tabular-nums"
                      aria-label={`Částka – ${c.name || "položka"} (${KIND_COPY[kind].unit})`}
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">Kč</span>
                  </span>
                  <select
                    value={c.kind}
                    onChange={(e) => updateCost(c.id, { kind: e.target.value as CostKind })}
                    className="h-11 w-[7.5rem] shrink-0 rounded-xl border border-input bg-card px-2 text-sm sm:w-auto"
                    aria-label="Druh nákladu"
                  >
                    <option value="jednorazove">jednorázově</option>
                    <option value="mesicni">měsíčně</option>
                    <option value="marketing">marketing</option>
                  </select>
                  <Button variant="ghost" size="icon" className="shrink-0" onClick={() => removeCost(c.id)} aria-label="Odebrat položku">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
            <Button variant="ghost" size="sm" className="mt-2 text-primary" onClick={() => addCost(kind)}>
              <Plus className="mr-1 h-4 w-4" /> Přidat položku
            </Button>
          </div>
        ))}
        <div className="mt-5 border-t border-border pt-5 sm:max-w-xs">
          <NumField
            label="Cílový zisk"
            suffix="% obratu"
            value={data.targetProfit}
            onChange={(v) => setData((prev) => ({ ...prev, targetProfit: Math.min(v, 90) }))}
            hint="Kolik z obratu chcete mít jako zisk. Ovlivňuje maximální PNO."
          />
        </div>
      </Card>

      {/* Výsledek */}
      <Card className="card-apple p-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-bold">Výsledek za 2 roky</h3>
            <p className="text-sm text-muted-foreground">Přepněte scénář a uvidíte, co se stane, když prodeje půjdou hůř nebo lépe.</p>
          </div>
          <div role="radiogroup" aria-label="Scénář" className="flex rounded-xl border border-border p-1 sm:inline-flex">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                role="radio"
                aria-checked={data.scenario === s.id}
                onClick={() => setData((prev) => ({ ...prev, scenario: s.id }))}
                className={`flex-1 rounded-lg px-1.5 py-1.5 text-[13px] font-semibold sm:text-sm transition-colors sm:flex-none sm:px-3 ${
                  data.scenario === s.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                title={s.hint}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {!hasRevenue ? (
          <p className="rounded-xl bg-secondary/70 p-4 text-sm text-muted-foreground">
            Výsledek se ukáže, jakmile vyplníte příjmy.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat label="Obrat" value={czk(m.revenueTotal)} />
              <Stat label="Zisk" value={czk(m.profitTotal)} note={`marže zisku ${pct(m.profitMargin)}`} />
              <Stat label="Potřebný kapitál" value={czk(m.requiredCapital)} note="nejhlubší propad peněz" />
              <Stat
                label="ROI"
                value={m.roi === null ? "—" : pct(m.roi)}
                note="zisk za 2 roky ÷ potřebný kapitál"
              />
              <Stat label="Bod zvratu" value={monthLabel(m.breakEvenMonth)} note="první měsíc v zisku" />
              <Stat label="Návratnost" value={monthLabel(m.paybackMonth)} note="vložené peníze zpět" />
              <Stat label="Obrat ve 12. měsíci" value={czk(m.revenue12)} />
              <Stat label="Zisk ve 12. měsíci" value={czk(m.profit12)} />
            </div>

            {/* Graf peněz v projektu */}
            <div className="mt-6">
              <h4 className="font-semibold">Peníze v projektu celkem</h4>
              <p className="text-sm text-muted-foreground">
                Nejnižší bod křivky je kapitál, který musíte mít připravený. Kde křivka protne nulu, máte vložené peníze zpět.
              </p>
              <div className="mt-3 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 16, right: 16, bottom: 4, left: 8 }}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="0" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      ticks={[0, 6, 12, 18, 24]}
                      tickFormatter={(v) => (v === 0 ? "start" : `${v}. m.`)}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={64}
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(v) => `${Math.round(v / 1000).toLocaleString("cs-CZ")} tis.`}
                    />
                    <ReferenceLine y={0} stroke="hsl(var(--foreground))" strokeOpacity={0.4} />
                    <Tooltip
                      formatter={(v: number) => [czk(v), "Peníze celkem"]}
                      labelFormatter={(l: number) => (l === 0 ? "Před spuštěním" : `${l}. měsíc`)}
                      contentStyle={{ borderRadius: 10, border: "1px solid hsl(var(--border))", fontSize: 13 }}
                    />
                    <Line type="monotone" dataKey="cumulative" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
                    {m.requiredCapital > 0 && (
                      <ReferenceDot
                        x={trough.month}
                        y={Math.round(trough.cumulative)}
                        r={5}
                        fill="hsl(var(--gate-copper))"
                        stroke="hsl(var(--card))"
                        strokeWidth={2}
                        label={{ value: `potřebný kapitál ${czk(m.requiredCapital)}`, position: "bottom", fontSize: 12, fill: "hsl(var(--foreground))" }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* PNO */}
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-border p-5">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-semibold">PNO – podíl marketingu na obratu</h4>
                  <RatingPill rating={m.pnoRating} />
                </div>
                <p className="mt-3 text-3xl font-bold tabular-nums">{pct(m.pno12)}</p>
                <p className="text-sm text-muted-foreground">ve 12. měsíci, maximum pro váš projekt je {pct(m.maxPno)}</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Maximum počítáme z vaší marže: hrubá marže {pct(m.grossMargin)} − ostatní náklady v % obratu − cílový zisk{" "}
                  {pct(data.targetProfit)}. Kurz s vysokou marží unese PNO kolem 20 %, prodej elektroniky jen pár procent.
                </p>
              </div>
              <div className="rounded-xl border border-border p-5">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-semibold">Hodnota zákazníka a cena za jeho získání</h4>
                  {m.ltvCac !== null && <RatingPill rating={m.ltvCacRating} />}
                </div>
                <dl className="mt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">LTV (zisk ze zákazníka za celou dobu)</dt>
                    <dd className="font-semibold tabular-nums">{m.ltv === null ? "—" : czk(m.ltv)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Cena za získání zákazníka</dt>
                    <dd className="font-semibold tabular-nums">{m.cac === null ? "—" : czk(m.cac)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Poměr LTV k ceně za získání</dt>
                    <dd className="font-semibold tabular-nums">
                      {m.ltvCac === null ? "—" : `${(Math.round(m.ltvCac * 10) / 10).toLocaleString("cs-CZ")} : 1`}
                    </dd>
                  </div>
                  {m.extras.map((e) => (
                    <div key={e.label} className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">{e.label}</dt>
                      <dd className="font-semibold tabular-nums">{e.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 text-xs text-muted-foreground">Zdravý poměr LTV k ceně za získání je alespoň 3 : 1.</p>
              </div>
            </div>

            {/* Srovnání scénářů */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <caption className="mb-2 text-left font-semibold">Srovnání scénářů</caption>
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="py-2 font-medium"> </th>
                    {SCENARIOS.map((s) => (
                      <th key={s.id} className="py-2 text-right font-medium">
                        {s.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {[
                    ["Zisk za 2 roky", (x: Metrics) => czk(x.profitTotal)],
                    ["Potřebný kapitál", (x: Metrics) => czk(x.requiredCapital)],
                    ["Bod zvratu", (x: Metrics) => monthLabel(x.breakEvenMonth)],
                    ["Návratnost", (x: Metrics) => monthLabel(x.paybackMonth)],
                    ["PNO ve 12. měsíci", (x: Metrics) => pct(x.pno12)],
                  ].map(([label, fn]) => (
                    <tr key={label as string} className="border-b border-border last:border-b-0">
                      <th scope="row" className="py-2 text-left font-normal text-muted-foreground">
                        {label as string}
                      </th>
                      {SCENARIOS.map((s) => (
                        <td key={s.id} className={`py-2 text-right ${s.id === data.scenario ? "font-semibold" : ""}`}>
                          {(fn as (x: Metrics) => string)(results[s.id].metrics)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      {/* Komentář AI */}
      <Card className="card-apple p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-bold">Komentář AI mentora</h3>
            <p className="text-sm text-muted-foreground">
              Projde spočítaná čísla všech tří scénářů a řekne, kde je plán citlivý a co si ověřit. Čísla nevymýšlí.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {hasRevenue && hasCosts
                ? `Zbývá ${Math.max(0, AI_LIMITS.vyhodnoceni - commentsUsed)} z ${AI_LIMITS.vyhodnoceni} komentářů pro tento projekt.`
                : "Nejdřív vyplňte příjmy a alespoň jeden náklad."}
            </p>
          </div>
          <Button
            variant={comment ? "outline" : "default"}
            className="shrink-0 rounded-[10px]"
            onClick={runComment}
            disabled={busy || !hasRevenue || !hasCosts || commentsUsed >= AI_LIMITS.vyhodnoceni}
          >
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : comment ? <RefreshCw className="mr-2 h-4 w-4" /> : null}
            {busy ? "Připravuji komentář…" : comment ? "Okomentovat znovu" : "Okomentovat výsledek"}
          </Button>
        </div>
        {comment && (
          <div className="mt-6 space-y-5">
            <p className="text-base leading-relaxed">{comment.summary}</p>
            {comment.sensitivities?.length > 0 && (
              <div>
                <h4 className="mb-2 font-semibold">Kde je plán citlivý</h4>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {comment.sensitivities.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {comment.toVerify?.length > 0 && (
              <div>
                <h4 className="mb-2 font-semibold">Co si ověřit</h4>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {comment.toVerify.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {comment.nextSteps?.length > 0 && (
              <div>
                <h4 className="mb-2 font-semibold">Co udělat teď</h4>
                <ol className="list-decimal space-y-1 pl-5 text-sm">
                  {comment.nextSteps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
        <div className="mt-6 flex flex-col gap-3 rounded-xl bg-secondary/70 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">
            Chcete čísla projít s člověkem, který sám podniká? Konzultace s lektorem stojí 1 700 Kč za hodinu.
          </p>
          <Button asChild variant="outline" className="shrink-0 rounded-[10px]">
            <a href={lecturerMail()}>
              <Mail className="mr-2 h-4 w-4" />
              Probrat s lektorem
            </a>
          </Button>
        </div>
      </Card>

      {/* Kontrola */}
      <Card className="card-apple p-6">
        <h3 className="mb-3 text-lg font-bold">Kontrola před dokončením</h3>
        <ul className="mb-5 space-y-2 text-sm">
          {checks.map((c) => (
            <li key={c.label} className="flex items-center gap-2">
              {c.ok ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <span className={`h-4 w-4 rounded-full border-2 ${c.required ? "border-amber-400" : "border-border"}`} />
              )}
              <span className={c.ok ? "" : "text-muted-foreground"}>{c.label}</span>
            </li>
          ))}
        </ul>
        <Button className="btn-apple w-full sm:w-auto" disabled={!canFinish} onClick={finish}>
          Dokončit fázi 3
        </Button>
      </Card>
    </div>
  );
};
