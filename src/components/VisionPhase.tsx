import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Circle,
  Lightbulb,
  Minus,
  Package,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wand2,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSupabaseProgress } from "@/hooks/useSupabaseProgress";
import { PhaseCelebration } from "@/components/PhaseCelebration";
import { AdvisorsInline } from "@/components/AdvisorsInline";
import {
  EMPTY_ERRC,
  ErrcItem,
  ErrcMatrix,
  ErrcQuadrant,
  VISION_KEYS,
  VisionBasics,
  errcTexts,
} from "@/lib/projectData";

interface VisionPhaseProps {
  onComplete: () => void;
  onBack: () => void;
}

const QUADRANTS: {
  key: ErrcQuadrant;
  title: string;
  question: string;
  placeholder: string;
  icon: typeof Minus;
  tone: string;
}[] = [
  {
    key: "eliminate",
    title: "Eliminovat",
    question: "Co trh považuje za samozřejmé, ale vy to vůbec nabízet nebudete?",
    placeholder: "např. kamenná pobočka",
    icon: X,
    tone: "text-red-600 bg-red-500/10",
  },
  {
    key: "reduce",
    title: "Snížit",
    question: "Co nabídnete výrazně méně než konkurence?",
    placeholder: "např. délka lekce",
    icon: ArrowDown,
    tone: "text-orange-600 bg-orange-500/10",
  },
  {
    key: "raise",
    title: "Zvýšit",
    question: "Co uděláte výrazně lépe než konkurence?",
    placeholder: "např. praktičnost",
    icon: ArrowUp,
    tone: "text-blue-600 bg-blue-500/10",
  },
  {
    key: "create",
    title: "Vytvořit",
    question: "Co přinesete úplně nového, co na trhu není?",
    placeholder: "např. týdenní plán jídel",
    icon: Plus,
    tone: "text-emerald-600 bg-emerald-500/10",
  },
];

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(Number.isFinite(n) ? n : 0)));
const newId = () => Math.random().toString(36).slice(2, 10);

const defaultsFor = (q: ErrcQuadrant): Omit<ErrcItem, "id" | "text"> => {
  switch (q) {
    case "eliminate":
      return { lowCost: 50, premium: 80, mine: 0 };
    case "reduce":
      return { lowCost: 50, premium: 80, mine: 20 };
    case "raise":
      return { lowCost: 30, premium: 60, mine: 90 };
    case "create":
      return { lowCost: 0, premium: 0, mine: 80 };
  }
};

/** Pole, které je v daném kvadrantu dané metodikou a nedá se měnit. */
const isLocked = (q: ErrcQuadrant, field: "lowCost" | "premium" | "mine") =>
  (q === "eliminate" && field === "mine") || (q === "create" && field !== "mine");

const SectionHeader = ({ icon: Icon, step, title, subtitle }: { icon: typeof Users; step: number; title: string; subtitle: string }) => (
  <div className="mb-5 flex items-start gap-3">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <p className="text-sm font-semibold text-muted-foreground">Krok {step}</p>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  </div>
);

const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-foreground">{label}</label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

const shorten = (s: string, n = 16) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

export const VisionPhase = ({ onComplete }: VisionPhaseProps) => {
  const navigate = useNavigate();
  const [basics, setBasics] = useSupabaseProgress<VisionBasics>(VISION_KEYS.basics, {
    name: "",
    slogan: "",
    customer: "",
    problem: "",
    offering: "",
  });
  const [errc, setErrc, { loading: errcLoading }] = useSupabaseProgress<ErrcMatrix>(VISION_KEYS.errc, EMPTY_ERRC);
  const [legacyErrc, , { loading: legacyLoading }] = useSupabaseProgress<Record<ErrcQuadrant, string[]> | null>(
    "vision_errc_data",
    null
  );
  const [usp, setUsp] = useSupabaseProgress<string>(VISION_KEYS.usp, "");
  const [celebrate, setCelebrate] = useState(false);
  const migrated = useRef(false);

  // Převzetí položek ze starší verze matice (jen texty, hodnoty výchozí).
  useEffect(() => {
    if (migrated.current || errcLoading || legacyLoading) return;
    migrated.current = true;
    if (!legacyErrc) return;
    const empty = QUADRANTS.every((q) => (errc[q.key] ?? []).length === 0);
    if (!empty) return;
    const converted = Object.fromEntries(
      QUADRANTS.map((q) => [
        q.key,
        (legacyErrc[q.key] ?? [])
          .filter((t) => typeof t === "string" && t.trim())
          .map((t) => ({ id: newId(), text: t.trim(), ...defaultsFor(q.key) })),
      ])
    ) as ErrcMatrix;
    if (QUADRANTS.some((q) => converted[q.key].length > 0)) setErrc(converted);
  }, [errcLoading, legacyLoading, legacyErrc, errc, setErrc]);

  const setBasic = (field: keyof VisionBasics, value: string) => setBasics((prev) => ({ ...prev, [field]: value }));

  const addItem = (q: ErrcQuadrant) =>
    setErrc((prev) => ({ ...prev, [q]: [...(prev[q] ?? []), { id: newId(), text: "", ...defaultsFor(q) }] }));

  const updateItem = (q: ErrcQuadrant, id: string, patch: Partial<ErrcItem>) =>
    setErrc((prev) => ({ ...prev, [q]: (prev[q] ?? []).map((i) => (i.id === id ? { ...i, ...patch } : i)) }));

  const removeItem = (q: ErrcQuadrant, id: string) =>
    setErrc((prev) => ({ ...prev, [q]: (prev[q] ?? []).filter((i) => i.id !== id) }));

  const curve = useMemo(
    () =>
      QUADRANTS.flatMap((q) =>
        (errc[q.key] ?? [])
          .filter((i) => i.text.trim())
          .map((i) => ({
            name: shorten(i.text.trim()),
            full: `${q.title}: ${i.text.trim()}`,
            "Low-cost konkurence": q.key === "create" ? 0 : i.lowCost,
            "Prémiová konkurence": q.key === "create" ? 0 : i.premium,
            "Můj projekt": q.key === "eliminate" ? 0 : i.mine,
          }))
      ),
    [errc]
  );

  const suggestUsp = () => {
    const created = errcTexts(errc, "create");
    const raised = errcTexts(errc, "raise");
    const parts = [
      basics.customer?.trim() ? `Pro ${basics.customer.trim()}` : "",
      basics.offering?.trim() ? `nabízíme ${basics.offering.trim()}` : "",
    ].filter(Boolean);
    const diff = [...created, ...raised].slice(0, 3);
    const draft = `${parts.join(", ")}${parts.length ? "." : ""}${diff.length ? ` Na rozdíl od konkurence: ${diff.join(", ")}.` : ""}`;
    setUsp(draft.trim());
  };

  const checks = useMemo(() => {
    const named = curve.length;
    const diffFrom = (key: "Low-cost konkurence" | "Prémiová konkurence") =>
      curve.filter((c) => Math.abs(c["Můj projekt"] - c[key]) >= 20).length;
    return [
      {
        label: "Víte, komu prodáváte a jaký má problém",
        ok: (basics.customer ?? "").trim().length >= 10 && (basics.problem ?? "").trim().length >= 10,
        required: true,
      },
      {
        label: "Víte, s kým se srovnáváte (levná i prémiová konkurence)",
        ok: (basics.lowCostName ?? "").trim().length > 1 && (basics.premiumName ?? "").trim().length > 1,
        required: true,
      },
      {
        label: "Víte, co prodáváte, a projekt má název",
        ok: (basics.offering ?? "").trim().length >= 5 && basics.name.trim().length > 0,
        required: true,
      },
      { label: "Něco přinášíte úplně nového (Vytvořit)", ok: errcTexts(errc, "create").length > 0, required: true },
      {
        label: "Něco vynecháváte nebo snižujete – bez toho modrý oceán nevznikne",
        ok: errcTexts(errc, "eliminate").length + errcTexts(errc, "reduce").length > 0,
        required: false,
      },
      {
        label: "Vaše křivka se liší od low-cost i prémiové konkurence (aspoň ve 2 bodech o 20+)",
        ok: named > 0 && diffFrom("Low-cost konkurence") >= 2 && diffFrom("Prémiová konkurence") >= 2,
        required: false,
      },
      { label: "Máte napsané USP", ok: usp.trim().length >= 20, required: true },
    ];
  }, [basics, errc, usp, curve]);

  const done = checks.filter((c) => c.ok).length;
  const canFinish = checks.filter((c) => c.required).every((c) => c.ok);

  const finish = () => {
    onComplete();
    setCelebrate(true);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 pb-12 sm:px-6 lg:px-8">
      {celebrate && (
        <PhaseCelebration
          gate={1}
          title="Modrý oceán je hotový"
          message="Váš zákazník, ERRC matice a USP se propíšou do Lean Canvasu."
          nextLabel="Pokračovat na Lean Canvas"
          onNext={() => navigate("/ideation")}
          onHome={() => navigate("/home")}
        />
      )}

      <Card className="card-apple p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">Fáze 1 ze 7</p>
            <h2 className="text-2xl font-bold text-foreground">Modrý oceán</h2>
            <p className="text-sm text-muted-foreground">Najděte místo na trhu mezi levnou a prémiovou konkurencí.</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">
              {done}/{checks.length}
            </p>
            <p className="text-xs text-muted-foreground">splněno</p>
          </div>
        </div>
      </Card>

      {/* Úvod: modrý oceán = přidaná hodnota, USP */}
      <Card className="card-apple p-6">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
            <Lightbulb className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold">Modrý oceán = víc hodnoty, ne nižší cena</h3>
        </div>
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            Modrý oceán není o tom být levnější. Je o tom <strong className="text-foreground">přidat zákazníkovi tolik
            hodnoty</strong>, že vás přestane srovnávat s konkurencí. Kdo soutěží cenou, prohrává s tím, kdo je ochotný
            prodělávat víc.
          </p>

          <div>
            <p className="mb-2 font-medium text-foreground">Kde hodnota vzniká (rovnice hodnoty podle Alexe Hormoziho)</p>
            <div className="rounded-xl border border-border/60 p-4">
              <div className="flex flex-col items-center gap-1 text-center text-foreground">
                <span className="font-semibold">Vysněný výsledek × Jistota, že ho dosáhnu</span>
                <span className="h-px w-full max-w-sm bg-foreground/40" />
                <span className="font-semibold">Čas do výsledku × Úsilí a oběti</span>
              </div>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                <li><strong className="text-foreground">↑ Výsledek:</strong> co přesně zákazník získá, ne co dostane do ruky.</li>
                <li><strong className="text-foreground">↑ Jistota:</strong> proč tomu má věřit – postup, záruka, důkazy.</li>
                <li><strong className="text-foreground">↓ Čas:</strong> jak rychle uvidí první výsledek.</li>
                <li><strong className="text-foreground">↓ Úsilí:</strong> co za něj uděláte vy, aby nemusel on.</li>
              </ul>
            </div>
            <p className="mt-2">
              V ERRC matici to funguje stejně: <strong className="text-foreground">Eliminovat a Snížit</strong> ubírá
              zákazníkovi čas, úsilí a zbytečné náklady, <strong className="text-foreground">Zvýšit a Vytvořit</strong>{" "}
              přidává výsledek a jistotu.
            </p>
          </div>

          <p>
            <strong className="text-foreground">USP</strong> je pak jedna věta, ze které je jasné, jakou hodnotu zákazník
            dostane: jaký výsledek, jak rychle, s jakou námahou a proč to vyjde. Ne seznam vlastností.
          </p>

          <div className="rounded-xl bg-muted/60 p-4">
            <p className="mb-1 font-medium text-foreground">Příklad: online kurz vaření pro pracující rodiče</p>
            <p>
              Výsledek: domácí večeře pro celou rodinu každý den. Jistota: hotový týdenní plán a nákupní seznam. Čas: 30
              minut. Úsilí: nic nevymýšlí. Kurz proto vynechá exotické suroviny a dlouhé lekce a přidá plán jídel.
            </p>
            <p className="mt-2 italic text-foreground">
              „Večeře pro celou rodinu za 30 minut – bez vymýšlení, s plánem a nákupním seznamem na celý týden.“
            </p>
          </div>
        </div>
      </Card>

      {/* Krok 1: Komu */}
      <Card className="card-apple p-6">
        <SectionHeader icon={Users} step={1} title="Komu" subtitle="Nejdřív zákazník, teprve potom produkt." />
        <div className="space-y-4">
          <Field label="Kdo je váš zákazník?" hint="Co nejkonkrétněji: kdo to je, v jaké je situaci.">
            <Textarea
              value={basics.customer ?? ""}
              onChange={(e) => setBasic("customer", e.target.value)}
              placeholder="např. pracující rodiče s malými dětmi, kteří chtějí vařit doma"
              className="min-h-[80px] rounded-xl"
            />
          </Field>
          <Field label="Jaký problém řeší?" hint="Co ho dnes trápí nebo co mu chybí.">
            <Textarea
              value={basics.problem ?? ""}
              onChange={(e) => setBasic("problem", e.target.value)}
              placeholder="např. nemají čas vymýšlet jídla a nakupovat, končí u polotovarů"
              className="min-h-[80px] rounded-xl"
            />
          </Field>
        </div>
      </Card>

      {/* Krok 2: Co prodávám */}
      <Card className="card-apple p-6">
        <SectionHeader icon={Package} step={2} title="Co prodávám" subtitle="Produkt nebo služba, název a slogan." />
        <div className="space-y-4">
          <Field label="Co prodáváte?" hint="Jednou dvěma větami. Počítáme s online podnikáním.">
            <Textarea
              value={basics.offering ?? ""}
              onChange={(e) => setBasic("offering", e.target.value)}
              placeholder="např. online kurz vaření s týdenními plány jídel"
              className="min-h-[70px] rounded-xl"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Název projektu">
              <Input
                value={basics.name}
                onChange={(e) => setBasic("name", e.target.value)}
                placeholder="Zadejte název vašeho projektu..."
                className="h-11 rounded-xl"
              />
            </Field>
            <Field label="Slogan" hint="Klidně později, až budete mít USP.">
              <Input
                value={basics.slogan}
                onChange={(e) => setBasic("slogan", e.target.value)}
                placeholder="např. Večeře za 30 minut"
                className="h-11 rounded-xl"
              />
            </Field>
          </div>
        </div>
      </Card>

      {/* Krok 3: ERRC */}
      <Card className="card-apple p-6">
        <SectionHeader
          icon={Target}
          step={3}
          title="ERRC matice"
          subtitle="Srovnáte se se dvěma konkrétními konkurenty a najdete místo, kde budete jiní než oba."
        />

        <div className="mb-5 rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground">
          <p className="mb-2 font-medium text-foreground">Jak matici vyplnit</p>
          <ol className="list-decimal space-y-1.5 pl-5">
            <li>
              <strong className="text-foreground">Pojmenujte dva konkurenty.</strong> Levnou konkurenci – nejlevnější
              způsob, jak zákazník svůj problém vyřeší dnes (často i zdarma). A prémiovou konkurenci – nejdražší a
              nejkvalitnější řešení na trhu. Mezi nimi hledáte své místo.
            </li>
            <li>
              <strong className="text-foreground">Napište, co zákazníci na trhu řeší.</strong> Cenu, kvalitu, rychlost,
              osobní přístup… Každou věc dejte do kvadrantu podle toho, co s ní uděláte vy: vynecháte, snížíte, zvýšíte,
              nebo ji přinesete nově.
            </li>
            <li>
              <strong className="text-foreground">Ohodnoťte ji třemi čísly 0–100</strong>: kolik jí nabízí levná
              konkurence, kolik prémiová a kolik vy. 0 = vůbec, 100 = maximum.
            </li>
          </ol>
          <p className="mt-3">
            Příklad: položka „osobní konzultace“ – levná konkurence (YouTube) 0, prémiová (kurz se šéfkuchařem) 90, vy
            60. Výsledná křivka ukáže, jestli jste jen levnější kopie prémiového řešení, nebo opravdu něco jiného.
          </p>
        </div>

        <div className="mb-5 grid gap-4 sm:grid-cols-2">
          <Field label="Levná konkurence" hint="Kdo nebo co je nejlevnější alternativa?">
            <Input
              value={basics.lowCostName ?? ""}
              onChange={(e) => setBasic("lowCostName", e.target.value)}
              placeholder="např. recepty zdarma na YouTube"
              className="h-11 rounded-xl"
            />
          </Field>
          <Field label="Prémiová konkurence" hint="Kdo nebo co je nejdražší a nejkvalitnější řešení?">
            <Input
              value={basics.premiumName ?? ""}
              onChange={(e) => setBasic("premiumName", e.target.value)}
              placeholder="např. kurz se šéfkuchařem"
              className="h-11 rounded-xl"
            />
          </Field>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {QUADRANTS.map((q) => {
            const Icon = q.icon;
            const items = errc[q.key] ?? [];
            return (
              <div key={q.key} className="rounded-2xl border border-border/60 p-4">
                <div className="mb-1 flex items-center gap-2">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${q.tone}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <h4 className="font-semibold">{q.title}</h4>
                </div>
                <p className="mb-3 text-xs text-muted-foreground">{q.question}</p>

                {items.length > 0 && (
                  <div className="mb-1 grid grid-cols-[1fr_repeat(3,3.25rem)_1.75rem] gap-1.5 text-[11px] text-muted-foreground">
                    <span />
                    <span className="text-center" title={`Levná konkurence${basics.lowCostName ? `: ${basics.lowCostName}` : ""}`}>Levná</span>
                    <span className="text-center" title={`Prémiová konkurence${basics.premiumName ? `: ${basics.premiumName}` : ""}`}>Prém.</span>
                    <span className="text-center font-medium text-primary" title="Váš projekt">Já</span>
                    <span />
                  </div>
                )}

                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="grid grid-cols-[1fr_repeat(3,3.25rem)_1.75rem] items-center gap-1.5">
                      <Input
                        value={item.text}
                        onChange={(e) => updateItem(q.key, item.id, { text: e.target.value })}
                        placeholder={q.placeholder}
                        className="h-9 rounded-lg text-sm"
                        aria-label={`${q.title}: položka`}
                      />
                      {(["lowCost", "premium", "mine"] as const).map((field) => {
                        const locked = isLocked(q.key, field);
                        const value = locked ? 0 : item[field];
                        return (
                          <Input
                            key={field}
                            type="number"
                            inputMode="numeric"
                            min={0}
                            max={100}
                            value={value}
                            disabled={locked}
                            title={locked ? "Dáno metodikou" : undefined}
                            onChange={(e) => updateItem(q.key, item.id, { [field]: clamp(Number(e.target.value)) })}
                            className={`h-9 rounded-lg px-1 text-center text-sm ${field === "mine" ? "border-primary/40 font-semibold" : ""}`}
                            aria-label={`${item.text || q.title}: ${field === "lowCost" ? "levná konkurence" : field === "premium" ? "prémiová konkurence" : "můj projekt"}`}
                          />
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => removeItem(q.key, item.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label="Odebrat položku"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <Button variant="ghost" size="sm" className="mt-2 w-full rounded-lg" onClick={() => addItem(q.key)}>
                  <Plus className="mr-1 h-4 w-4" />
                  Přidat
                </Button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Krok 4: Hodnotová křivka */}
      <Card className="card-apple p-6">
        <SectionHeader
          icon={TrendingUp}
          step={4}
          title="Hodnotová křivka"
          subtitle="Kreslí se sama z matice. Modrý oceán je tam, kde vaše čára vede jinudy než obě konkurence."
        />
        {curve.length === 0 ? (
          <p className="rounded-xl bg-muted/60 p-6 text-center text-sm text-muted-foreground">
            Jakmile v matici pojmenujete první položky, objeví se tu křivka.
          </p>
        ) : (
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={curve} margin={{ top: 10, right: 24, left: -16, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  interval={0}
                  padding={{ left: 30, right: 30 }}
                  angle={-30}
                  textAnchor="end"
                  height={70}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip labelFormatter={(_, p) => (p?.[0]?.payload as { full?: string })?.full ?? ""} />
                <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: 13 }} />
                <Line type="linear" dataKey="Low-cost konkurence" name={basics.lowCostName?.trim() ? `Levná: ${shorten(basics.lowCostName.trim(), 28)}` : "Levná konkurence"} stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3 }} />
                <Line type="linear" dataKey="Prémiová konkurence" name={basics.premiumName?.trim() ? `Prémiová: ${shorten(basics.premiumName.trim(), 28)}` : "Prémiová konkurence"} stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="linear" dataKey="Můj projekt" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Krok 5: USP */}
      <Card className="card-apple p-6">
        <SectionHeader
          icon={Sparkles}
          step={5}
          title="Moje USP"
          subtitle="Jedna věta: komu, jaký výsledek, jak rychle, s jakou námahou a proč to vyjde. Vycházejte z položek Vytvořit a Zvýšit."
        />
        <Textarea
          value={usp}
          onChange={(e) => setUsp(e.target.value)}
          placeholder="např. Večeře pro celou rodinu za 30 minut – s plánem na celý týden."
          className="min-h-[90px] rounded-xl"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button variant="outline" className="rounded-xl" onClick={suggestUsp}>
            <Wand2 className="mr-2 h-4 w-4" />
            Sestavit koncept z mých odpovědí
          </Button>
          <p className="text-xs text-muted-foreground">Koncept je jen výchozí bod – přepište ho vlastními slovy.</p>
        </div>
      </Card>

      <AdvisorsInline phase={1} title="Probrat modrý oceán s poradcem" topic="Fáze 1 – Modrý oceán" />

      {/* Kontrola a dokončení */}
      <Card className="card-apple p-6">
        <h3 className="mb-1 text-lg font-semibold">Kontrola</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Povinné body odemknou další bránu. Doporučené body hlídají, aby šlo opravdu o modrý oceán. Vyhodnocení pomocí AI
          přibude v další verzi.
        </p>
        <ul className="space-y-2">
          {checks.map((c) => (
            <li key={c.label} className="flex items-start gap-2 text-sm">
              {c.ok ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              ) : c.required ? (
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              )}
              <span className={c.ok ? "text-foreground" : "text-muted-foreground"}>
                {c.label}
                {!c.required && !c.ok && <span className="ml-1 text-xs text-amber-600">(doporučeno)</span>}
              </span>
            </li>
          ))}
        </ul>
        <Button className="btn-apple mt-6 h-12 w-full" disabled={!canFinish} onClick={finish}>
          {canFinish ? "Dokončit fázi a otevřít bránu 2" : "Doplňte povinné body"}
        </Button>
      </Card>
    </div>
  );
};
