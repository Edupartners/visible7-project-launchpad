import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Check, Clock, Gauge, Loader2, Scissors, TrendingUp, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProject } from "@/contexts/ProjectContext";
import { useSupabaseProgress } from "@/hooks/useSupabaseProgress";
import { AdvisorsInline } from "@/components/AdvisorsInline";
import { BlockList } from "@/components/BlockList";
import { PhaseCelebration } from "@/components/PhaseCelebration";
import { loadProjectKeys } from "@/lib/projectData";
import { BusinessCaseData } from "@/lib/businessCase";
import { stepId, type BuildBlock } from "@/lib/buildPlans";
import { CHANNELS, ChannelProgress, evaluateTest } from "@/lib/marketingPlans";
import {
  EMPLOYER_LEVY,
  EMPTY_GROWTH,
  GROWTH_BLOCKS,
  GrowthState,
  HireType,
  LEAN_COSTS,
  REQUIRED_GROWTH,
  baseFrom,
  cashTrap,
  hireCalc,
  levers,
} from "@/lib/growthPlan";

const czk = (v: number | null) => (v === null ? "—" : `${Math.round(v).toLocaleString("cs-CZ")} Kč`);
const n1 = (v: number) => (Math.round(v * 10) / 10).toLocaleString("cs-CZ");

const NumField = ({
  id,
  label,
  value,
  onChange,
  suffix,
  hint,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  hint?: string;
}) => (
  <div>
    <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
      {label}
    </label>
    <div className="relative">
      <Input
        id={id}
        inputMode="decimal"
        value={Number.isFinite(value) && value !== 0 ? String(value) : ""}
        placeholder="0"
        onChange={(e) => onChange(Number(e.target.value.replace(/\s/g, "").replace(",", ".")) || 0)}
        className={suffix ? "pr-14" : ""}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {suffix}
        </span>
      )}
    </div>
    {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
  </div>
);

const Section = ({
  id,
  icon: Icon,
  title,
  lead,
  children,
}: {
  id: string;
  icon: typeof TrendingUp;
  title: string;
  lead: string;
  children: React.ReactNode;
}) => (
  <section aria-labelledby={id} className="rounded-3xl border border-border bg-card p-6 sm:p-8">
    <h2 id={id} className="flex items-center gap-2 text-2xl font-bold">
      <Icon className="h-6 w-6 text-primary" /> {title}
    </h2>
    <p className="mt-1 max-w-3xl text-muted-foreground">{lead}</p>
    <div className="mt-6">{children}</div>
  </section>
);

/** Fáze 7: připravenost, páky růstu, past růstu, nábor, lean náklady a bloky s videem. */
export const GrowthPhase = () => {
  const navigate = useNavigate();
  const { currentProject } = useProject();
  const [state, setState, { loading }] = useSupabaseProgress<GrowthState>("growth_plan", EMPTY_GROWTH);
  const [marketing] = useSupabaseProgress<Record<string, ChannelProgress>>("marketing_progress", {});
  const [completed, setCompleted] = useSupabaseProgress<number[]>("completed_phases", []);
  const [bc, setBc] = useState<BusinessCaseData | null | undefined>(undefined);
  const [maxPno, setMaxPno] = useState<number | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    if (!currentProject) return;
    let active = true;
    loadProjectKeys(currentProject.id, ["business_case", "business_case_summary"]).then((raw) => {
      if (!active) return;
      setBc((raw.business_case as BusinessCaseData) ?? null);
      const sum = raw.business_case_summary as { scenare?: { realisticky?: { max_pno_pct?: number | null } } };
      setMaxPno(sum?.scenare?.realisticky?.max_pno_pct ?? null);
    });
    return () => {
      active = false;
    };
  }, [currentProject]);

  if (loading || bc === undefined) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const s = { ...EMPTY_GROWTH, ...state };
  const set = (patch: Partial<GrowthState>) => setState((prev) => ({ ...EMPTY_GROWTH, ...prev, ...patch }));
  const base = baseFrom(currentProject?.business_type, bc);
  const ownProfit = s.ownProfit || Math.max(0, Math.round(base?.profit ?? 0));

  // Připravenost na růst
  const price = base?.price ?? 0;
  const tests = CHANNELS.filter((c) => marketing[c.id]?.test).map((c) =>
    evaluateTest(marketing[c.id]!.test!, price, maxPno),
  );
  const scaling = tests.some((t) => t.verdict === "skalovat");
  const measured = CHANNELS.some((c) => marketing[c.id]?.blocks?.includes("mereni"));
  const totalHours = s.growthHours + s.opsHours;
  const growthShare = totalHours > 0 ? (s.growthHours / totalHours) * 100 : 0;
  const readiness = [
    { ok: s.stableMonths >= 3, label: "Aspoň 3 měsíce po sobě v zisku" },
    { ok: scaling, label: "Kanál s verdiktem „Škálovat“ z fáze 5" },
    { ok: measured, label: "Měření konverzí běží" },
    { ok: growthShare >= 30, label: "Aspoň 30 % času věnujete růstu, ne operativě" },
  ];
  const readyScore = readiness.filter((r) => r.ok).length;

  const lever = base ? levers(base) : [];
  const trap = base ? cashTrap(base, s) : null;
  const hire = hireCalc(base, { type: s.hireType, amount: s.hireAmount, hours: s.hireHours, ownProfit });

  const toggleStep = (b: BuildBlock, i: number) =>
    setState((prev) => {
      const cur = { ...EMPTY_GROWTH, ...prev };
      const id = stepId(b.id, i);
      const steps = cur.steps.includes(id) ? cur.steps.filter((x) => x !== id) : [...cur.steps, id];
      const all = b.steps.every((_, j) => steps.includes(stepId(b.id, j)));
      return {
        ...cur,
        steps,
        blocks: all ? Array.from(new Set([...cur.blocks, b.id])) : cur.blocks.filter((x) => x !== b.id),
      };
    });
  const finishBlock = (b: BuildBlock) =>
    setState((prev) => {
      const cur = { ...EMPTY_GROWTH, ...prev };
      return {
        ...cur,
        steps: Array.from(new Set([...cur.steps, ...b.steps.map((_, j) => stepId(b.id, j))])),
        blocks: Array.from(new Set([...cur.blocks, b.id])),
      };
    });

  const blocksDone = REQUIRED_GROWTH.every((id) => s.blocks.includes(id));
  const phaseDone = completed.includes(7);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-6 sm:px-6">
      {celebrate && (
        <PhaseCelebration
          gate={7}
          title="Všech 7 bran je otevřených"
          message="Prošli jste celou metodiku VISIBLE7 MICEK™. Získejte osvědčení VISIBLE7 Gold."
          nextLabel="Získat osvědčení Gold"
          onNext={() => navigate("/settings#osvedceni")}
          onHome={() => navigate("/home")}
        />
      )}

      <header>
        <p className="text-sm font-semibold text-primary">Fáze 7 ze 7</p>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Růst bez pasti</h1>
        <p className="mt-2 max-w-3xl text-lg text-muted-foreground">
          Růst je nejnebezpečnější chvíle podnikání. Víc zakázek znamená víc peněz vázaných v zásobách, reklamě a lidech
          – dřív, než zákazníci zaplatí. Rosťte podle marže a reálných zákazníků, ne podle pocitu.
        </p>
      </header>

      {/* Připravenost */}
      <Section
        id="pripravenost"
        icon={Gauge}
        title={`Připravenost na růst: ${readyScore} ze 4`}
        lead={
          readyScore >= 3
            ? "Základ stojí. Můžete přidávat – postupně a s kontrolou cash flow."
            : "Ještě nerosťte. Nejdřív stabilizujte zisk a ověřte kanál, jinak růst zvětší i problémy."
        }
      >
        <div className="grid gap-6 md:grid-cols-2">
          <ul className="space-y-2">
            {readiness.map((r) => (
              <li key={r.label} className="flex items-start gap-2">
                {r.ok ? (
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" strokeWidth={3} />
                ) : (
                  <X className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                )}
                <span className={r.ok ? "" : "text-muted-foreground"}>{r.label}</span>
              </li>
            ))}
          </ul>
          <div className="grid grid-cols-3 gap-3">
            <NumField
              id="g-stable"
              label="Měsíců v zisku"
              value={s.stableMonths}
              onChange={(v) => set({ stableMonths: v })}
            />
            <NumField
              id="g-growth"
              label="Hodin týdně na růst"
              value={s.growthHours}
              onChange={(v) => set({ growthHours: v })}
            />
            <NumField id="g-ops" label="Hodin na operativu" value={s.opsHours} onChange={(v) => set({ opsHours: v })} />
            {totalHours > 0 && (
              <p className="col-span-3 flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary" /> Na růst jde {Math.round(growthShare)} % času.
                {growthShare < 30 && " Pravidlo VISIBLE7: aspoň 30 %."}
              </p>
            )}
          </div>
        </div>
      </Section>

      {!base && (
        <p className="rounded-2xl bg-orange-50 p-5 ring-1 ring-orange-200">
          Výpočty pák růstu, pasti růstu a náboru berou čísla z byznys case. Vyplňte příjmy ve fázi 3.
        </p>
      )}

      {/* Páky růstu */}
      {base && (
        <Section
          id="paky"
          icon={TrendingUp}
          title="Páky růstu podle vaší marže"
          lead={`Co udělá +10 % s vaším ziskem ve 12. měsíci. Hrubá marže ${n1(base.gm)} %, tržby ${czk(base.revenue)} měsíčně.`}
        >
          <ol className="grid gap-3 md:grid-cols-3">
            {lever.map((l, i) => (
              <li
                key={l.id}
                className={`rounded-2xl p-5 ${i === 0 ? "bg-primary text-white" : "border border-border bg-background"}`}
              >
                <p className={`text-sm font-semibold ${i === 0 ? "text-orange-300" : "text-muted-foreground"}`}>
                  {i === 0 ? "Nejsilnější páka" : `${i + 1}. v pořadí`}
                </p>
                <p className="mt-1 text-lg font-bold">{l.title}</p>
                <p className="mt-2 text-2xl font-extrabold">+{czk(l.gain)}</p>
                <p className={`text-sm ${i === 0 ? "text-white/70" : "text-muted-foreground"}`}>zisku měsíčně</p>
                <p className={`mt-3 text-sm ${i === 0 ? "text-white/80" : "text-muted-foreground"}`}>{l.text}</p>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* Past růstu */}
      {base && trap && (
        <Section
          id="past"
          icon={AlertTriangle}
          title="Past růstu: kolik peněz růst spolkne"
          lead="Víc objednávek = víc zboží a reklamy zaplacené předem. Nový člověk nebo prostory = fixní náklad, i když růst přijde pomaleji."
        >
          <div className="grid gap-4 sm:grid-cols-4">
            <NumField
              id="t-growth"
              label="Plánovaný růst"
              value={s.growthPct}
              onChange={(v) => set({ growthPct: v })}
              suffix="%"
            />
            <NumField
              id="t-days"
              label="Peníze se vrátí za"
              value={s.cashDays}
              onChange={(v) => set({ cashDays: v })}
              suffix="dní"
              hint="Od nákupu zboží nebo reklamy po platbu zákazníka"
            />
            <NumField
              id="t-fixed"
              label="Nové fixní náklady"
              value={s.newFixed}
              onChange={(v) => set({ newFixed: v })}
              suffix="Kč/m"
              hint="Člověk, prostory, nástroje"
            />
            <NumField
              id="t-reserve"
              label="Volné peníze na účtu"
              value={s.reserve}
              onChange={(v) => set({ reserve: v })}
              suffix="Kč"
            />
          </div>
          <div
            className={`mt-6 rounded-2xl p-5 ring-1 ${
              trap.verdict === "ok"
                ? "bg-emerald-50 text-emerald-950 ring-emerald-200"
                : trap.verdict === "pozor"
                  ? "bg-amber-50 text-amber-950 ring-amber-200"
                  : "bg-red-50 text-red-950 ring-red-200"
            }`}
          >
            <p className="text-xl font-extrabold">
              {trap.verdict === "ok"
                ? "Tento růst unesete"
                : trap.verdict === "pozor"
                  ? "Pozor – růst na hraně"
                  : "Past růstu: na tohle nemáte peníze"}
            </p>
            <p className="mt-1">
              Na růst o {Math.round(s.growthPct)} % potřebujete <strong>{czk(trap.needed)}</strong> volných peněz dřív,
              než vám zákazníci zaplatí ({czk(trap.workingCapital)} na zboží a reklamu
              {trap.buffer > 0 ? `, ${czk(trap.buffer)} rezerva na 3 měsíce nových fixních nákladů` : ""}).
            </p>
            <p className="mt-2">
              Když přijde jen 60 % plánovaného růstu, změní se měsíční zisk o{" "}
              <strong>
                {trap.slowMonthly >= 0 ? "+" : ""}
                {czk(trap.slowMonthly)}
              </strong>
              .
              {trap.monthsReserve !== null &&
                (s.reserve > 0
                  ? ` Rezerva vydrží ${n1(trap.monthsReserve)} měsíce.`
                  : " Bez rezervy začnete hned prodělávat.")}
            </p>
          </div>
        </Section>
      )}

      {/* Nábor */}
      <Section
        id="nabor"
        icon={UserPlus}
        title="Kdy si můžete dovolit prvního člověka"
        lead="Pravidlo VISIBLE7: člověk, kterého najmete, smí stát nejvýš čtvrtinu hodnoty vaší hodiny. A práce, kterou dělá, musí vydělat na jeho cenu i s odvody."
      >
        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <label htmlFor="h-type" className="mb-1.5 block text-sm font-semibold">
              Forma spolupráce
            </label>
            <select
              id="h-type"
              value={s.hireType}
              onChange={(e) => set({ hireType: e.target.value as HireType })}
              className="h-11 w-full rounded-xl border border-input bg-background px-3"
            >
              <option value="freelancer">Externista (OSVČ)</option>
              <option value="dpp">Dohoda (DPP/DPČ)</option>
              <option value="zamestnanec">Zaměstnanec</option>
            </select>
          </div>
          <NumField
            id="h-amount"
            label={s.hireType === "zamestnanec" ? "Hrubá mzda" : "Sazba za hodinu"}
            value={s.hireAmount}
            onChange={(v) => set({ hireAmount: v })}
            suffix={s.hireType === "zamestnanec" ? "Kč/m" : "Kč/h"}
          />
          {s.hireType !== "zamestnanec" ? (
            <NumField id="h-hours" label="Hodin měsíčně" value={s.hireHours} onChange={(v) => set({ hireHours: v })} />
          ) : (
            <div className="text-sm">
              <p className="mb-1.5 font-semibold">Odvody zaměstnavatele</p>
              <p className="flex h-11 items-center text-muted-foreground">+{Math.round(EMPLOYER_LEVY * 1000) / 10} %</p>
            </div>
          )}
          <NumField
            id="h-own"
            label="Váš měsíční zisk"
            value={ownProfit}
            onChange={(v) => set({ ownProfit: v })}
            suffix="Kč"
            hint={base ? "Předvyplněno z byznys case (12. měsíc)" : undefined}
          />
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          {[
            ["Náklad na člověka", `${czk(hire.cost)} měsíčně`],
            ["Hodnota vaší hodiny", czk(hire.ownHourly)],
            ["Max. cena hodiny pomocníka", czk(hire.maxRate)],
            [
              "Musí přinést tržby navíc",
              hire.extraRevenue !== null ? `${czk(hire.extraRevenue)} měsíčně` : "doplňte byznys case",
            ],
          ].map(([l, v]) => (
            <div key={l} className="rounded-xl bg-muted/50 p-3">
              <dt className="text-muted-foreground">{l}</dt>
              <dd className="text-lg font-bold">{v}</dd>
            </div>
          ))}
        </dl>
        <ul className="mt-5 space-y-2">
          <li className="flex items-start gap-2">
            {hire.affordable ? (
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" strokeWidth={3} />
            ) : (
              <X className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            )}
            <span>
              {hire.affordable
                ? `Cena hodiny (${czk(hire.rate)}) je pod čtvrtinou hodnoty vaší hodiny.`
                : `Cena hodiny (${czk(hire.rate)}) je nad čtvrtinou hodnoty vaší hodiny (${czk(hire.maxRate)}). Zatím delegujte jen menší úkoly nebo automatizujte.`}
            </span>
          </li>
          {hire.extraUnits !== null && hire.plannedExtraUnits !== null && (
            <li className="flex items-start gap-2">
              {hire.coveredByPlan ? (
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" strokeWidth={3} />
              ) : (
                <X className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              )}
              <span>
                Potřebujete o {n1(hire.extraUnits)} prodejů měsíčně víc. Váš plán na 2. rok počítá s růstem o{" "}
                {n1(hire.plannedExtraUnits)}.{" "}
                {hire.coveredByPlan ? "Plán to pokrývá." : "Plán to nepokrývá – člověk by vás stál víc, než vydělá."}
              </span>
            </li>
          )}
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">
          Pořadí, které se osvědčilo: automatizace a AI → externista na konkrétní úkol → dohoda → částečný úvazek → plný
          úvazek. Odvody zaměstnavatele {Math.round(EMPLOYER_LEVY * 1000) / 10} % platí pro rok 2026; pravidla dohod si
          ověřte u účetní.
        </p>
      </Section>

      {/* Lean náklady */}
      <Section
        id="lean"
        icon={Scissors}
        title="Náklady, které růst nepotřebuje"
        lead="Lean růst: každý nový fixní náklad je závazek na měsíce dopředu. Zaškrtněte, co teď nepotřebujete – a vydržte to."
      >
        <ul className="grid gap-3 md:grid-cols-2">
          {LEAN_COSTS.map((c) => {
            const on = s.avoided.includes(c.id);
            return (
              <li key={c.id}>
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${
                    on ? "border-emerald-300 bg-emerald-50/60" : "border-border hover:bg-muted/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => set({ avoided: on ? s.avoided.filter((x) => x !== c.id) : [...s.avoided, c.id] })}
                    className="mt-0.5 h-5 w-5 shrink-0 accent-emerald-600"
                  />
                  <span>
                    <span className="block font-semibold">{on ? `Teď ne: ${c.label}` : c.label}</span>
                    <span className="text-sm text-muted-foreground">{c.why}</span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* Bloky */}
      <section aria-labelledby="bloky-rust" className="space-y-4">
        <div>
          <h2 id="bloky-rust" className="text-2xl font-bold tracking-tight">
            Jak růst krok za krokem
          </h2>
          <p className="mt-1 text-muted-foreground">Ke každému bloku bude instruktážní video.</p>
        </div>
        <BlockList
          blocks={GROWTH_BLOCKS}
          steps={s.steps}
          done={s.blocks}
          onToggleStep={toggleStep}
          onFinish={finishBlock}
        />
      </section>

      <AdvisorsInline phase={7} title="Poraďte se o růstu" topic="Růst projektu (fáze 7)" />

      <section className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h2 className="text-xl font-bold">Dokončení fáze a osvědčení Gold</h2>
          <p className="text-muted-foreground">
            {phaseDone
              ? "Fáze Růst je hotová. Všech 7 bran je otevřených."
              : blocksDone
                ? "Plán růstu je připravený."
                : "Fázi dokončíte, až projdete povinné bloky „Jak růst krok za krokem“."}
          </p>
        </div>
        <Button
          className="shrink-0 rounded-[10px] bg-emerald-600 text-white hover:bg-emerald-700"
          disabled={!blocksDone || phaseDone}
          onClick={() => {
            setCompleted((prev) => (prev.includes(7) ? prev : [...prev, 7]));
            setCelebrate(true);
          }}
        >
          Dokončit fázi Růst
        </Button>
      </section>
    </div>
  );
};
