import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Crosshair, Flag, Loader2, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useProject } from "@/contexts/ProjectContext";
import { useSupabaseProgress } from "@/hooks/useSupabaseProgress";
import { AdvisorsInline } from "@/components/AdvisorsInline";
import { BlockList } from "@/components/BlockList";
import { PhaseCelebration } from "@/components/PhaseCelebration";
import { loadProjectKeys } from "@/lib/projectData";
import { addCostsToCase } from "@/lib/caseCosts";
import { BusinessCaseData, computeMetrics, groupOf, simulate } from "@/lib/businessCase";
import { stepId, type BuildBlock } from "@/lib/buildPlans";
import { CHANNELS, ChannelProgress } from "@/lib/marketingPlans";
import {
  EMPTY_LAUNCH,
  LAUNCH_BLOCKS,
  LAUNCH_YEAR,
  LaunchState,
  REQUIRED_BLOCKS,
  addMonths,
  milestonesFrom,
} from "@/lib/launchPlan";

const czk = (v: number) => `${Math.round(v).toLocaleString("cs-CZ")} Kč`;
const fmtDate = (d: Date) => d.toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" });

/** Fáze 6: jeden produkt na start, milníky MVP z byznys case a start podnikání v ČR. */
export const LaunchPhase = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentProject } = useProject();
  const [state, setState, { loading }] = useSupabaseProgress<LaunchState>("launch_plan", EMPTY_LAUNCH);
  const [marketing] = useSupabaseProgress<Record<string, ChannelProgress>>("marketing_progress", {});
  const [completed, setCompleted] = useSupabaseProgress<number[]>("completed_phases", []);
  const [bc, setBc] = useState<BusinessCaseData | null>(null);
  const [vision, setVision] = useState<{ offering?: string; customer?: string } | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    if (!currentProject) return;
    let active = true;
    loadProjectKeys(currentProject.id, ["business_case", "vision_project_data"]).then((raw) => {
      if (!active) return;
      setBc((raw.business_case as BusinessCaseData) ?? null);
      setVision((raw.vision_project_data as { offering?: string; customer?: string }) ?? {});
    });
    return () => {
      active = false;
    };
  }, [currentProject]);

  // Předvyplnit produkt a zákazníka z fáze 1 – až po načtení uloženého plánu, ať ho nepřepíšeme.
  useEffect(() => {
    if (loading || !vision) return;
    if ((!state.product && vision.offering) || (!state.customer && vision.customer)) {
      setState((prev) => ({
        ...EMPTY_LAUNCH,
        ...prev,
        product: prev.product || vision.offering || "",
        customer: prev.customer || vision.customer || "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, vision]);

  const loaded = !loading && vision !== null;

  if (!loaded) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const s = { ...EMPTY_LAUNCH, ...state };
  const set = (patch: Partial<LaunchState>) => setState((prev) => ({ ...EMPTY_LAUNCH, ...prev, ...patch }));
  const group = groupOf(currentProject?.business_type);
  const metrics = bc?.revenue?.volume12 ? computeMetrics(group, bc, simulate(group, bc, 1)) : null;
  const milestones = milestonesFrom(currentProject?.business_type, bc);
  const tested = CHANNELS.filter((c) => marketing[c.id]?.test);

  const toggleStep = (b: BuildBlock, i: number) =>
    setState((prev) => {
      const cur = { ...EMPTY_LAUNCH, ...prev };
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
      const cur = { ...EMPTY_LAUNCH, ...prev };
      return {
        ...cur,
        steps: Array.from(new Set([...cur.steps, ...b.steps.map((_, j) => stepId(b.id, j))])),
        blocks: Array.from(new Set([...cur.blocks, b.id])),
      };
    });
  const addCosts = async (b: BuildBlock) => {
    if (!currentProject || !b.costs) return false;
    const res = await addCostsToCase(currentProject.id, b.costs);
    toast(
      !res.ok
        ? { title: "Náklady se nepodařilo převzít", variant: "destructive" }
        : {
            title: res.added ? "Náklady jsou v byznys case" : "Tyto náklady už v byznys case máte",
            description: res.needsAmount ? "U položek bez částky ji doplňte ve fázi 3." : undefined,
          },
    );
    return res.ok;
  };

  const requiredDone = REQUIRED_BLOCKS.every((id) => s.blocks.includes(id));
  const focusDone = s.product.trim().length > 3 && s.customer.trim().length > 3;
  const firstCustomer = !!s.reached.prvni;
  const canFinish = requiredDone && focusDone && firstCustomer;
  const phaseDone = completed.includes(6);
  const missing = [
    !focusDone && "vyplnit jeden produkt a zákazníka",
    !requiredDone && "projít povinné bloky startu podnikání",
    !firstCustomer && "označit milník „První platící zákazník“",
  ].filter(Boolean) as string[];

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-6 sm:px-6">
      {celebrate && (
        <PhaseCelebration
          gate={6}
          title="Jste venku. Máte prvního zákazníka."
          message="Tohle většina lidí nikdy nedokáže. Poslední brána ukáže, jak růst."
          nextLabel="Pokračovat na Růst"
          onNext={() => navigate("/expansion")}
          onHome={() => navigate("/home")}
        />
      )}

      <header>
        <p className="text-sm font-semibold text-primary">Fáze 6 ze 7</p>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Launch: start mikrobyznysu</h1>
        <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
          Žádné miliony na rozjezd. Jeden produkt, jedna úzká skupina zákazníků, jeden kanál – a všechno, co v Česku
          potřebujete vyřídit, abyste mohli legálně prodávat.
        </p>
      </header>

      {/* Jeden produkt */}
      <section aria-labelledby="fokus" className="rounded-3xl bg-primary p-6 text-white sm:p-8">
        <h2 id="fokus" className="flex items-center gap-2 text-2xl font-bold">
          <Crosshair className="h-6 w-6 text-orange-400" /> Jeden produkt na start
        </h2>
        <p className="mt-1 max-w-2xl text-white/75">
          Kdo začíná s deseti produkty pro všechny, neprodá nic. Vyberte jednu službu, jeden produkt – u e-shopu 5–10
          vybraných produktů – a jednu nikovou skupinu zákazníků.
        </p>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="l-product" className="mb-1.5 block text-sm font-semibold">
              Co budete prodávat jako první
            </label>
            <Textarea
              id="l-product"
              defaultValue={s.product}
              onBlur={(e) => e.target.value !== s.product && set({ product: e.target.value })}
              rows={3}
              className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
              placeholder="např. Online kurz Shoptet za víkend"
            />
          </div>
          <div>
            <label htmlFor="l-customer" className="mb-1.5 block text-sm font-semibold">
              Pro koho přesně (vaše nika)
            </label>
            <Textarea
              id="l-customer"
              defaultValue={s.customer}
              onBlur={(e) => e.target.value !== s.customer && set({ customer: e.target.value })}
              rows={3}
              className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
              placeholder="např. řemeslníci z Moravskoslezského kraje, kteří prodávají jen osobně"
            />
          </div>
          <div>
            <label htmlFor="l-channel" className="mb-1.5 block text-sm font-semibold">
              Jeden hlavní kanál
            </label>
            <select
              id="l-channel"
              value={s.channel}
              onChange={(e) => set({ channel: e.target.value })}
              className="h-11 w-full rounded-xl border border-white/20 bg-white/10 px-3 text-white"
            >
              <option value="" className="text-foreground">
                Vyberte kanál
              </option>
              {[...tested, ...CHANNELS.filter((c) => !tested.includes(c))].map((c) => (
                <option key={c.id} value={c.id} className="text-foreground">
                  {c.name}
                  {tested.includes(c) ? " (otestováno ve fázi 5)" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="l-date" className="mb-1.5 block text-sm font-semibold">
              Datum spuštění
            </label>
            <Input
              id="l-date"
              type="date"
              value={s.date}
              onChange={(e) => set({ date: e.target.value })}
              className="border-white/20 bg-white/10 text-white [color-scheme:dark]"
            />
          </div>
        </div>
        {metrics && (
          <p className="mt-6 flex items-start gap-2 rounded-xl bg-white/10 p-4 text-sm">
            <Scale className="mt-0.5 h-4 w-4 shrink-0 text-orange-300" />
            <span>
              Podle byznys case potřebujete na start <strong>{czk(metrics.requiredCapital)}</strong>. Vložte jen tolik,
              o kolik si můžete dovolit přijít – zbytek dofinancujte z prvních prodejů.
            </span>
          </p>
        )}
      </section>

      {/* Milníky */}
      <section aria-labelledby="milniky" className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <h2 id="milniky" className="flex items-center gap-2 text-2xl font-bold">
          <Flag className="h-6 w-6 text-primary" /> Milníky MVP
        </h2>
        <p className="mt-1 text-muted-foreground">
          Spočítané z realistického scénáře vašeho byznys case.{" "}
          {s.date ? "Data se odvíjejí od dne spuštění." : "Zadejte datum spuštění a uvidíte konkrétní data."}
        </p>
        {!metrics && (
          <p className="mt-3 rounded-lg bg-orange-50 p-3 text-sm ring-1 ring-orange-200">
            Vyplňte příjmy ve fázi 3 – pak doplníme MVP, bod zvratu a návratnost.
          </p>
        )}
        <ol className="relative mt-6 space-y-1 border-l-2 border-border pl-6">
          {milestones.map((m) => {
            const reached = s.reached[m.id];
            const date = s.date && m.month !== null ? addMonths(s.date, m.month) : null;
            return (
              <li key={m.id} className="relative pb-4">
                <span
                  className={`absolute -left-[33px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full ${
                    reached ? "bg-emerald-600 text-white" : "border-2 border-border bg-card"
                  }`}
                >
                  {reached && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                </span>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-bold">
                      {m.title}
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        {m.month === null
                          ? "v plánu na 24 měsíců nenastane"
                          : m.month === 0
                            ? "den spuštění"
                            : `${m.month}. měsíc`}
                        {date && ` · ${fmtDate(date)}`}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">{m.detail}</p>
                  </div>
                  <Button
                    variant={reached ? "ghost" : "outline"}
                    size="sm"
                    className="shrink-0 rounded-[10px]"
                    onClick={() => {
                      const next = { ...s.reached };
                      if (reached) delete next[m.id];
                      else next[m.id] = new Date().toISOString().slice(0, 10);
                      set({ reached: next });
                    }}
                  >
                    {reached ? `Splněno ${new Date(reached).toLocaleDateString("cs-CZ")}` : "Označit jako splněné"}
                  </Button>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Start podnikání v ČR */}
      <section aria-labelledby="start-cr" className="space-y-4">
        <div>
          <h2 id="start-cr" className="text-2xl font-bold tracking-tight">
            Start podnikání v Česku
          </h2>
          <p className="mt-1 text-muted-foreground">
            Živnost, úřady, datová schránka, odvody a účetnictví. Ke každému bloku bude instruktážní video.
          </p>
        </div>
        <BlockList
          blocks={LAUNCH_BLOCKS}
          steps={s.steps}
          done={s.blocks}
          onToggleStep={toggleStep}
          onFinish={finishBlock}
          onAddCosts={addCosts}
        />
        <p className="text-xs text-muted-foreground">
          Částky platí pro rok {LAUNCH_YEAR} (zdroj: Průvodce podnikáním, BusinessInfo.cz). Jde o orientační přehled, ne
          o právní ani daňové poradenství – konkrétní situaci si ověřte u úřadu, účetní nebo poradce.
        </p>
      </section>

      <AdvisorsInline phase={6} title="Pomůžou vám se startem" topic="Start podnikání (fáze Launch)" />

      {/* Dokončení */}
      <section className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h2 className="text-xl font-bold">Dokončení fáze</h2>
          <p className="text-muted-foreground">
            {phaseDone
              ? "Fáze Launch je hotová."
              : canFinish
                ? "Všechno je připravené."
                : `Zbývá: ${missing.join(", ")}.`}
          </p>
        </div>
        <Button
          className="shrink-0 rounded-[10px] bg-emerald-600 text-white hover:bg-emerald-700"
          disabled={!canFinish || phaseDone}
          onClick={() => {
            setCompleted((prev) => (prev.includes(6) ? prev : [...prev, 6]));
            setCelebrate(true);
          }}
        >
          Dokončit fázi Launch
        </Button>
      </section>
    </div>
  );
};
