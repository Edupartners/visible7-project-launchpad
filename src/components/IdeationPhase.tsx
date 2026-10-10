import { useEffect, useRef, useState } from "react";
import { DiagnosisDraftNote } from "@/components/diagnosis/DiagnosisDraftNote";
import { useNavigate } from "react-router-dom";
import { useSupabaseProgress } from "@/hooks/useSupabaseProgress";
import { useProject } from "@/contexts/ProjectContext";
import { VisionSummary, errcTexts, loadVisionSummary } from "@/lib/projectData";
import { AI_LIMITS, AiUsage, CanvasEvaluation, CanvasSuggestion, callAi, loadAiUsage } from "@/lib/ai";
import { businessTypes } from "@/types/implementation";
import { PhaseCelebration } from "@/components/PhaseCelebration";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Info,
  LayoutGrid,
  Loader2,
  Pencil,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";

interface LeanCanvasData {
  problem: string;
  solution: string;
  uniqueValueProposition: string;
  customerSegments: string;
  existingAlternatives: string;
  channels: string;
  costStructure: string;
  revenueStreams: string;
}

type FieldKey = keyof LeanCanvasData;

interface IdeationPhaseProps {
  onComplete: () => void;
  onBack: () => void;
}

const EMPTY_CANVAS: LeanCanvasData = {
  problem: "",
  solution: "",
  uniqueValueProposition: "",
  customerSegments: "",
  existingAlternatives: "",
  channels: "",
  costStructure: "",
  revenueStreams: "",
};

const FIELDS: { key: FieldKey; title: string; hint: string; area: string }[] = [
  { key: "customerSegments", title: "Segment zákazníků", hint: "Komu konkrétně prodáváte? Kdo bude první zákazník?", area: "customer" },
  { key: "problem", title: "Problém", hint: "Co zákazníka trápí? 1–3 hlavní problémy jeho slovy.", area: "problem" },
  { key: "uniqueValueProposition", title: "Unikátní hodnota (USP)", hint: "Proč koupí právě u vás? Jedna jasná věta.", area: "usp" },
  { key: "solution", title: "Řešení", hint: "Jak problém řešíte – hlavní funkce nebo obsah nabídky.", area: "solution" },
  { key: "existingAlternatives", title: "Existující alternativy", hint: "Jak to zákazník řeší dnes? Levná a prémiová konkurence.", area: "alternatives" },
  { key: "channels", title: "Marketingové kanály", hint: "Kudy se k zákazníkovi dostanete? 3–5 kanálů.", area: "channels" },
  { key: "costStructure", title: "Náklady", hint: "Položky nákladů online projektu – zatím bez částek, spočítáme je ve fázi 3.", area: "costs" },
  { key: "revenueStreams", title: "Příjmy", hint: "Za co vám zákazník zaplatí? Prodej, předplatné, upsell…", area: "revenue" },
];

const RATING_STYLE: Record<string, string> = {
  silné: "bg-emerald-100 text-emerald-800",
  "v pořádku": "bg-sky-100 text-sky-800",
  doplnit: "bg-amber-100 text-amber-800",
};

// Převod výstupu fáze 1 (Modrý oceán) do polí Lean Canvasu.
const mapVisionToLeanCanvas = (vision: VisionSummary): Partial<LeanCanvasData> => {
  const { basics, errc, usp } = vision;
  const created = errcTexts(errc, "create");
  const raised = errcTexts(errc, "raise");
  const solution = [
    basics.offering?.trim() ?? "",
    created.length ? `Nově přinášíme: ${created.join(", ")}.` : "",
    raised.length ? `Výrazně lépe: ${raised.join(", ")}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
  const mapped: Partial<LeanCanvasData> = {
    customerSegments: basics.customer?.trim() ?? "",
    problem: basics.problem?.trim() ?? "",
    uniqueValueProposition: usp.trim(),
    solution,
    existingAlternatives: [
      basics.lowCostName?.trim() ? `Levná alternativa: ${basics.lowCostName.trim()}` : "",
      basics.premiumName?.trim() ? `Prémiová alternativa: ${basics.premiumName.trim()}` : "",
    ]
      .filter(Boolean)
      .join(". "),
  };
  return Object.fromEntries(Object.entries(mapped).filter(([, v]) => v)) as Partial<LeanCanvasData>;
};

const typeName = (id: string | null | undefined) => businessTypes.find((t) => t.id === id)?.name ?? null;

export const IdeationPhase = ({ onComplete }: IdeationPhaseProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentProject, setBusinessType } = useProject();
  const [canvas, setCanvas, { loading: canvasLoading }] = useSupabaseProgress<LeanCanvasData>(
    "ideation_lean_canvas",
    EMPTY_CANVAS
  );

  const [preFilled, setPreFilled] = useState<FieldKey[]>([]);
  const [usage, setUsage] = useState<AiUsage | null>(null);
  const [suggestion, setSuggestion] = useState<CanvasSuggestion | null>(null);
  const [evaluation, setEvaluation] = useState<CanvasEvaluation | null>(null);
  const [dismissed, setDismissed] = useState<Set<FieldKey>>(new Set());
  const [busy, setBusy] = useState<"navrh" | "vyhodnoceni" | null>(null);
  const [aiOff, setAiOff] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const fieldRefs = useRef<Partial<Record<FieldKey, HTMLTextAreaElement | null>>>({});
  const evalRef = useRef<HTMLDivElement | null>(null);

  const projectId = currentProject?.id;

  // Předvyplnění z fáze 1 – jen pole, která jsou zatím prázdná.
  useEffect(() => {
    if (canvasLoading || !projectId) return;
    let active = true;
    loadVisionSummary(projectId).then((vision) => {
      if (!active || !vision) return;
      const mapped = mapVisionToLeanCanvas(vision);
      const toFill = (Object.keys(mapped) as FieldKey[]).filter((f) => !canvas[f]?.trim());
      if (toFill.length === 0) return;
      setCanvas((prev) => ({ ...prev, ...Object.fromEntries(toFill.map((f) => [f, mapped[f]])) }));
      setPreFilled(toFill);
    });
    return () => {
      active = false;
    };
    // Spouští se jednou po načtení canvasu daného projektu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasLoading, projectId]);

  // Poslední výstupy AI a spotřebované limity.
  useEffect(() => {
    if (!projectId) return;
    let active = true;
    setSuggestion(null);
    setEvaluation(null);
    setDismissed(new Set());
    loadAiUsage(projectId, "2").then((u) => {
      if (!active) return;
      setUsage(u);
      setSuggestion(u.latest.navrh);
      setEvaluation(u.latest.vyhodnoceni);
    });
    return () => {
      active = false;
    };
  }, [projectId]);

  const filled = FIELDS.filter((f) => canvas[f.key]?.trim()).length;
  const left = (k: "navrh" | "vyhodnoceni") =>
    usage ? Math.max(0, Math.min(AI_LIMITS[k] - usage.used[k], AI_LIMITS.daily - usage.usedDaily)) : AI_LIMITS[k];

  const setField = (key: FieldKey, value: string) => setCanvas((prev) => ({ ...prev, [key]: value }));

  const runAi = async (kind: "navrh" | "vyhodnoceni") => {
    if (!projectId) return;
    setBusy(kind);
    const res = await callAi<CanvasSuggestion | CanvasEvaluation>(
      projectId,
      kind === "navrh" ? "canvas_suggest" : "canvas_evaluate"
    );
    setBusy(null);
    if (res.error || !res.output) {
      if (res.code === "ai_off") setAiOff(true);
      toast({ title: "AI se nepodařilo použít", description: res.error, variant: "destructive" });
      return;
    }
    setUsage((u) =>
      u ? { ...u, used: { ...u.used, [kind]: u.used[kind] + 1 }, usedDaily: u.usedDaily + 1 } : u
    );
    if (kind === "navrh") {
      const s = res.output as CanvasSuggestion;
      setSuggestion(s);
      setDismissed(new Set());
      if (!currentProject?.business_type && s.businessType) await setBusinessType(projectId, s.businessType);
      toast({ title: "Návrh je připravený", description: "U každého pole ho můžete použít nebo upravit." });
    } else {
      setEvaluation(res.output as CanvasEvaluation);
      setTimeout(() => evalRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  };

  const suggestionFor = (key: FieldKey) => {
    const text = suggestion?.fields?.[key]?.trim();
    if (!text || dismissed.has(key) || text === canvas[key]?.trim()) return null;
    return text;
  };

  const dismiss = (key: FieldKey) => setDismissed((prev) => new Set(prev).add(key));

  const applySuggestion = (key: FieldKey, text: string, edit = false) => {
    setField(key, text);
    dismiss(key);
    if (edit) {
      setTimeout(() => {
        const el = fieldRefs.current[key];
        el?.focus();
        el?.setSelectionRange(el.value.length, el.value.length);
      }, 0);
    }
  };

  const fillEmptyFromSuggestion = () => {
    if (!suggestion) return;
    const empty = FIELDS.filter((f) => !canvas[f.key]?.trim() && suggestion.fields?.[f.key]?.trim());
    setCanvas((prev) => ({ ...prev, ...Object.fromEntries(empty.map((f) => [f.key, suggestion.fields[f.key]])) }));
  };

  const pendingSuggestions = FIELDS.filter((f) => suggestionFor(f.key)).length;
  const emptyWithSuggestion = suggestion
    ? FIELDS.filter((f) => !canvas[f.key]?.trim() && suggestion.fields?.[f.key]?.trim()).length
    : 0;

  const checks = [
    { label: "Alespoň 7 z 8 polí vyplněno", ok: filled >= 7, required: true },
    { label: "Zvolený typ byznysu", ok: !!currentProject?.business_type, required: true },
    { label: "Vyhodnocení canvasu (doporučeno)", ok: !!evaluation, required: false },
  ];
  const canFinish = checks.filter((c) => c.required).every((c) => c.ok);

  const finish = () => {
    onComplete();
    setCelebrate(true);
  };

  const aiType = suggestion?.businessType;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 pb-12 sm:px-6 lg:px-8">
      <DiagnosisDraftNote part="canvas" gate={2} />
      {celebrate && (
        <PhaseCelebration
          gate={2}
          title="Lean Canvas je hotový"
          message="Typ byznysu, náklady a příjmy se propíšou do byznys case."
          nextLabel="Pokračovat na Byznys case"
          onNext={() => navigate("/strategy")}
          onHome={() => navigate("/home")}
        />
      )}

      {/* Hlavička */}
      <Card className="card-apple p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">Fáze 2 ze 7</p>
            <h2 className="text-2xl font-bold text-foreground">Lean Canvas</h2>
            <p className="text-sm text-muted-foreground">Celý byznys na jedné stránce – navazuje na váš modrý oceán.</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{filled}/8</p>
            <p className="text-xs text-muted-foreground">polí vyplněno</p>
          </div>
        </div>
        <Progress value={(filled / 8) * 100} className="mt-4 h-2" />
      </Card>

      {preFilled.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl bg-primary/5 p-4 text-sm">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>
            Z fáze 1 (Modrý oceán) jsme předvyplnili {preFilled.length}{" "}
            {preFilled.length === 1 ? "pole" : preFilled.length < 5 ? "pole" : "polí"}. Klidně je upravte.
          </p>
        </div>
      )}

      {/* AI pomocník */}
      <Card className="card-apple p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div>
              <h3 className="text-lg font-semibold">AI pomocník</h3>
              <p className="text-sm text-muted-foreground">
                Na základě modrého oceánu navrhne všechna pole a odhadne typ online byznysu. Návrh nic nepřepíše – u každého
                pole sami rozhodnete.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Zbývá {left("navrh")} z {AI_LIMITS.navrh} návrhů pro tento projekt.
              </p>
            </div>
          </div>
          <Button
            className="btn-apple shrink-0"
            onClick={() => runAi("navrh")}
            disabled={busy !== null || left("navrh") === 0 || aiOff}
          >
            {busy === "navrh" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {busy === "navrh" ? "Připravuji návrh…" : suggestion ? "Navrhnout znovu" : "Navrhnout s AI"}
          </Button>
        </div>

        {aiOff && (
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
            AI zatím není zapnutá. Canvas můžete vyplnit ručně a fázi dokončit i bez ní.
          </p>
        )}

        {suggestion && emptyWithSuggestion > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-secondary p-3 text-sm">
            <span>
              Návrh je připravený u {pendingSuggestions} {pendingSuggestions === 1 ? "pole" : "polí"}.
            </span>
            <Button size="sm" variant="outline" className="rounded-lg" onClick={fillEmptyFromSuggestion}>
              Vyplnit prázdná pole ({emptyWithSuggestion})
            </Button>
          </div>
        )}
      </Card>

      {/* Typ byznysu */}
      <Card className="card-apple p-6">
        <h3 className="text-lg font-semibold">Typ online byznysu</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Podle typu doporučíme ve fázi 4 postup tvorby a ve fázi 3 hlídané ukazatele.
          {aiType && typeName(aiType) && (
            <>
              {" "}
              AI doporučuje: <strong className="text-foreground">{typeName(aiType)}</strong>
              {suggestion?.businessTypeReason ? ` – ${suggestion.businessTypeReason}` : ""}
            </>
          )}
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {businessTypes.map((t) => {
            const selected = currentProject?.business_type === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => projectId && setBusinessType(projectId, t.id)}
                className={`relative rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                  selected
                    ? "border-primary bg-primary/10 font-semibold text-foreground"
                    : "border-border bg-card hover:border-primary/40"
                }`}
                aria-pressed={selected}
              >
                {t.name}
                {aiType === t.id && (
                  <span className="mt-0.5 block text-xs font-normal text-primary">Doporučeno AI</span>
                )}
                {selected && <Check className="absolute right-2 top-2 h-4 w-4 text-primary" />}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Pole canvasu */}
      <div className="space-y-4">
        {FIELDS.map((f, i) => {
          const s = suggestionFor(f.key);
          return (
            <Card key={f.key} className="card-apple p-6">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">
                    <span className="mr-2 text-muted-foreground">{i + 1}.</span>
                    {f.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{f.hint}</p>
                </div>
                {canvas[f.key]?.trim() && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />}
              </div>

              {s && (
                <div className="mb-3 rounded-xl border-l-2 border-primary bg-accent/60 p-4">
                  <p className="mb-1 text-sm font-semibold text-primary">Návrh AI</p>
                  <p className="whitespace-pre-line text-sm text-foreground">{s}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" className="rounded-lg" onClick={() => applySuggestion(f.key, s)}>
                      <Check className="mr-1 h-4 w-4" /> Použít
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-lg" onClick={() => applySuggestion(f.key, s, true)}>
                      <Pencil className="mr-1 h-4 w-4" /> Upravit
                    </Button>
                    <Button size="sm" variant="ghost" className="rounded-lg" onClick={() => dismiss(f.key)}>
                      <X className="mr-1 h-4 w-4" /> Ponechat můj text
                    </Button>
                  </div>
                </div>
              )}

              <Textarea
                ref={(el) => (fieldRefs.current[f.key] = el)}
                value={canvas[f.key]}
                onChange={(e) => setField(f.key, e.target.value)}
                placeholder={`Napište: ${f.title.toLowerCase()}`}
                className="min-h-[110px]"
              />
            </Card>
          );
        })}
      </div>

      {/* Náhled canvasu */}
      <Card className="card-apple p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <LayoutGrid className="h-5 w-5 text-primary" /> Náhled na jedné stránce
          </h3>
          <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setShowGrid((v) => !v)}>
            {showGrid ? "Skrýt" : "Zobrazit"}
          </Button>
        </div>
        {showGrid && (
          <div className="lean-grid mt-4 grid gap-2 text-sm">
            {FIELDS.map((f) => (
              <div key={f.key} className="rounded-xl bg-secondary p-3" style={{ gridArea: f.area }}>
                <p className="mb-1 text-sm font-semibold text-muted-foreground">{f.title}</p>
                <p className="whitespace-pre-line">{canvas[f.key]?.trim() || "—"}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Vyhodnocení */}
      <div ref={evalRef}>
        <Card className="card-apple p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div>
                <h3 className="text-lg font-semibold">Vyhodnocení canvasu</h3>
                <p className="text-sm text-muted-foreground">
                  AI se podívá na canvas jako mentor: co je silné, co doplnit a kde si pole odporují.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {filled < 7
                    ? `Nejdřív vyplňte alespoň 7 polí (zbývá ${7 - filled}).`
                    : `Zbývá ${left("vyhodnoceni")} z ${AI_LIMITS.vyhodnoceni} vyhodnocení pro tento projekt.`}
                </p>
              </div>
            </div>
            <Button
              variant={evaluation ? "outline" : "default"}
              className="shrink-0 rounded-[10px]"
              onClick={() => runAi("vyhodnoceni")}
              disabled={busy !== null || filled < 7 || left("vyhodnoceni") === 0 || aiOff}
            >
              {busy === "vyhodnoceni" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : evaluation ? (
                <RefreshCw className="mr-2 h-4 w-4" />
              ) : (
                <ClipboardCheck className="mr-2 h-4 w-4" />
              )}
              {busy === "vyhodnoceni" ? "Vyhodnocuji…" : evaluation ? "Vyhodnotit znovu" : "Vyhodnotit canvas"}
            </Button>
          </div>

          {evaluation && (
            <div className="mt-6 space-y-5">
              <p className="text-base leading-relaxed">{evaluation.summary}</p>
              <ul className="divide-y divide-border/60 rounded-xl bg-secondary/60">
                {evaluation.criteria?.map((c) => (
                  <li key={c.name} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-start sm:gap-4">
                    <div className="flex shrink-0 items-center gap-2 sm:w-56">
                      <span className="font-medium">{c.name}</span>
                    </div>
                    <span
                      className={`w-fit shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        RATING_STYLE[c.rating] ?? "bg-secondary"
                      }`}
                    >
                      {c.rating}
                    </span>
                    <p className="text-sm text-muted-foreground">{c.comment}</p>
                  </li>
                ))}
              </ul>
              {evaluation.contradictions?.length > 0 && (
                <div>
                  <h4 className="mb-2 flex items-center gap-2 font-semibold">
                    <AlertTriangle className="h-4 w-4 text-amber-500" /> Rozpory k dořešení
                  </h4>
                  <ul className="list-disc space-y-1 pl-5 text-sm">
                    {evaluation.contradictions.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
              {evaluation.nextSteps?.length > 0 && (
                <div>
                  <h4 className="mb-2 font-semibold">Co udělat teď</h4>
                  <ol className="list-decimal space-y-1 pl-5 text-sm">
                    {evaluation.nextSteps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Vyhodnocení je doporučení, ne verdikt. Rozhodnutí je na vás – případně ho proberte s lektorem.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Kontrola a dokončení */}
      <Card className="card-apple p-6">
        <h3 className="mb-3 text-lg font-semibold">Kontrola před dokončením</h3>
        <ul className="mb-5 space-y-2 text-sm">
          {checks.map((c) => (
            <li key={c.label} className="flex items-center gap-2">
              {c.ok ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <span className={`h-4 w-4 rounded-full border-2 ${c.required ? "border-amber-400" : "border-border"}`} />
              )}
              <span className={c.ok ? "" : "text-muted-foreground"}>{c.label}</span>
            </li>
          ))}
        </ul>
        <Button className="btn-apple w-full sm:w-auto" disabled={!canFinish} onClick={finish}>
          Dokončit fázi 2
        </Button>
      </Card>
    </div>
  );
};
