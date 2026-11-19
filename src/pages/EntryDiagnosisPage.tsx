import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Compass,
  GraduationCap,
  Loader2,
  PencilLine,
  RotateCcw,
  Store,
} from "lucide-react";
import { SidebarLayout } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSupabaseProgress } from "@/hooks/useSupabaseProgress";
import { useProject } from "@/contexts/ProjectContext";
import { useIsStudent } from "@/lib/studySchedule";
import { celebrate } from "@/lib/celebrate";
import { track } from "@/lib/track";
import {
  DEEP_TOPICS,
  EMPTY_ENTRY,
  ENTRY_KEY,
  EntryAnswers,
  EntryDiagnosis,
  GATE_LABEL,
  HOURS,
  LEVELS,
  MODEL_NAMES,
  SKILL_AREAS,
  SkillLevel,
  WANTS,
  entryResult,
  gateRoute,
} from "@/lib/entryDiagnosis";

const SKILL_CHOICES: { id: SkillLevel; label: string; on: string }[] = [
  { id: "umim", label: "Umím", on: "border-leaf-600 bg-leaf-600 text-white" },
  { id: "trochu", label: "Trochu", on: "border-amber-500 bg-amber-100 text-amber-950" },
  { id: "ne", label: "Ještě ne", on: "border-slate-400 bg-slate-100 text-slate-900" },
];

const STEP_TITLES = ["Co chcete", "Co byste rádi dělali", "Co už umíte", "Kolik máte času"];

const choiceCls = (on: boolean) =>
  `flex w-full flex-col items-start rounded-2xl border-2 p-4 text-left transition-colors sm:p-5 ${
    on ? "border-primary bg-leaf-50" : "border-border bg-card hover:border-primary/50"
  }`;

/** Výsledek: mapa toho, co umíte a co se ke startu doučíte. */
const EntryResult = ({ d, onEdit }: { d: EntryDiagnosis; onEdit: () => void }) => {
  const navigate = useNavigate();
  const isStudent = useIsStudent();
  const r = entryResult(d.answers);
  const toLearn = [...r.some, ...r.learn].sort((x, y) => x.gate - y.gate);
  const [completed] = useSupabaseProgress<number[]>("completed_phases", []);
  const nextGate = [1, 2, 3, 4, 5, 6, 7].find((g) => !completed.includes(g)) ?? null;
  const level = LEVELS.find((l) => l.id === d.answers.level);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-leaf-700">Vaše mapa ke startu</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {r.can.length === 0
            ? "Všechno se dá naučit. Začneme od základu."
            : r.can.length >= r.total - 2
              ? "Ke startu už máte skoro všechno."
              : `Už teď umíte ${r.can.length} z ${r.total} věcí, které ke startu potřebujete.`}
        </h1>
        <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
          {toLearn.length === 0
            ? "Projdete brány, vyplníte je za svůj projekt a můžete spouštět."
            : `Doučit se potřebujete ${toLearn.length === 1 ? "jednu věc" : `${toLearn.length} ${toLearn.length < 5 ? "věci" : "věcí"}`}. Ke každé máte v aplikaci postup a s čímkoli se můžete obrátit na lektora nebo poradce.`}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Check className="h-5 w-5 text-leaf-600" aria-hidden="true" /> Co už umíte
          </h2>
          {r.can.length ? (
            <ul className="mt-3 space-y-2">
              {r.can.map((s) => (
                <li key={s.id} className="flex gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-leaf-600" aria-hidden="true" />
                  {s.label}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Zatím nic z toho. To je úplně normální, většina lidí začíná přesně tady.
            </p>
          )}
        </section>

        <section className="rounded-3xl border-[3px] border-signal bg-card p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Compass className="h-5 w-5 text-primary" aria-hidden="true" /> Co se doučíte
          </h2>
          {toLearn.length ? (
            <ul className="mt-3 space-y-3">
              {toLearn.map((s) => (
                <li key={s.id}>
                  <Link to={gateRoute(s.gate)} className="group block rounded-xl p-2 -m-2 hover:bg-muted">
                    <span className="block text-sm font-semibold">{s.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {d.answers.skills[s.id] === "trochu" ? "Zopakujete si" : "Naučíte se"} v: {GATE_LABEL[s.gate]}
                      <ArrowRight className="ml-1 inline h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Nic zásadního. Můžete jít rovnou na věc.</p>
          )}
        </section>
      </div>

      <section className="rounded-3xl bg-muted/60 p-5 sm:p-6">
        <h2 className="text-lg font-bold">Jak na to</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {r.models.length > 0 && (
            <li>
              <span className="font-semibold">Co se k vám hodí: </span>
              {r.models.map((m) => MODEL_NAMES[m]).join(" nebo ")}. Typ byznysu si definitivně vyberete v bráně 2.
            </li>
          )}
          {d.answers.want === "nevim" && (
            <li>
              <span className="font-semibold">Co dělat: </span>Nevadí, že ještě nevíte. V bráně 1 a 2 to společně
              vyjasníme.
            </li>
          )}
          <li>
            <span className="font-semibold">Úroveň: </span>
            {level?.label}.{" "}
            {d.answers.level === "start"
              ? `Témata do hloubky (${DEEP_TOPICS.slice(0, 3).join(", ")} a další) ke startu nepotřebujete. Najdete je v celém kurzu, až budete chtít.`
              : `Projdete základ a k tomu témata do hloubky (${DEEP_TOPICS.slice(0, 3).join(", ")} a další) jako přípravu na zkoušku.`}
          </li>
          <li>
            <span className="font-semibold">Čas: </span>
            {r.slow
              ? "Při 3 hodinách týdně počítejte spíš s celým semestrem. To je v pořádku, hlavní je pravidelnost."
              : "Při pravidelné práci každý týden zvládnete start během semestru."}
          </li>
          <li>
            <span className="font-semibold">Kdo co dělá: </span>Brány vyplňujete vy, za svůj projekt. AI vám pomůže s
            formulací a lektor s tím, co nepůjde.
          </li>
        </ul>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={() => navigate(nextGate ? gateRoute(nextGate) : "/home")}
          className="v7-trap-btn h-12 pl-6 pr-11 text-base font-bold text-signal-foreground"
        >
          {!nextGate ? "Na přehled" : nextGate === 1 ? "Začít bránou 1" : `Pokračovat bránou ${nextGate}`}{" "}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        {isStudent && (
          <Button variant="outline" className="h-12" onClick={() => navigate("/moje-studium")}>
            <GraduationCap className="mr-2 h-4 w-4" /> Rozvrh studia
          </Button>
        )}
        <Button variant="ghost" className="h-12" onClick={onEdit}>
          <RotateCcw className="mr-2 h-4 w-4" /> Upravit odpovědi
        </Button>
      </div>
    </div>
  );
};

const EntryDiagnosisPage = () => {
  const { currentProject } = useProject();
  const [saved, setSaved, { loading }] = useSupabaseProgress<EntryDiagnosis | null>(ENTRY_KEY, null);
  const [editing, setEditing] = useState(false);
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [a, setA] = useState<EntryAnswers>(EMPTY_ENTRY);

  const set = <K extends keyof EntryAnswers>(k: K, v: EntryAnswers[K]) => setA((p) => ({ ...p, [k]: v }));
  const answered = SKILL_AREAS.filter((s) => a.skills[s.id]).length;
  const canNext =
    step === 1 ? Boolean(a.want) : step === 2 ? answered === SKILL_AREAS.length : step === 3 ? Boolean(a.hours) : true;

  const finish = () => {
    const d: EntryDiagnosis = { answers: { ...a, idea: a.idea.trim() }, createdAt: new Date().toISOString() };
    setSaved(d);
    setEditing(false);
    setStarted(false);
    celebrate("small");
    const r = entryResult(d.answers);
    track("entry_diagnosis_done", { level: a.level, want: a.want, can: r.can.length }, currentProject?.id);
    window.scrollTo({ top: 0 });
  };

  const edit = () => {
    if (saved) setA(saved.answers);
    setStep(0);
    setEditing(true);
    setStarted(true);
    window.scrollTo({ top: 0 });
  };

  return (
    <SidebarLayout>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-8 sm:py-12">
        {loading ? (
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
        ) : saved && !editing ? (
          <EntryResult d={saved} onEdit={edit} />
        ) : !started ? (
          <section className="mx-auto max-w-2xl">
            <p className="text-sm font-semibold text-leaf-700">Vstupní diagnostika · asi 3 minuty</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Co už umíte a co vám chybí ke startu
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Ke spuštění vlastního projektu obvykle stačí méně, než si myslíte. Zjistíme, co už zvládáte a co se
              doučíte. Nic se tu nehodnotí, odpovídejte upřímně.
            </p>
            <div className="mt-6 flex gap-3 rounded-2xl bg-leaf-50 p-4 ring-1 ring-leaf-200">
              <PencilLine className="mt-0.5 h-5 w-5 shrink-0 text-leaf-700" aria-hidden="true" />
              <p className="text-sm">
                <span className="font-semibold">Jak VISIBLE7 funguje: </span>
                svůj projekt vyplňujete vy, krok za krokem. AI za vás nic nevymýšlí, jen vám pomůže s formulací. Díky
                tomu se to opravdu naučíte a projekt bude váš.
              </p>
            </div>
            <Button
              onClick={() => setStarted(true)}
              className="v7-trap-btn mt-8 h-12 pl-6 pr-11 text-base font-bold text-signal-foreground"
            >
              Začít <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="mt-6 text-sm text-muted-foreground">
              <Store className="mr-1 inline h-4 w-4" aria-hidden="true" />
              Už podnikáte?{" "}
              <Link to="/rentgen?rezim=podnik" className="font-semibold text-primary hover:underline">
                Udělejte si rentgen podniku
              </Link>
              .
            </p>
          </section>
        ) : (
          <section className="mx-auto max-w-3xl">
            <ol className="flex gap-2" aria-label="Kroky">
              {STEP_TITLES.map((t, i) => (
                <li key={t} className="flex-1">
                  <span className={`block h-1.5 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
                  <span
                    className={`mt-1 hidden text-xs sm:block ${i === step ? "font-semibold" : "text-muted-foreground"}`}
                  >
                    {t}
                  </span>
                </li>
              ))}
            </ol>

            {step === 0 && (
              <div className="mt-8">
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Co od VISIBLE7 chcete?</h1>
                <div className="mt-5 grid gap-3">
                  {LEVELS.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => set("level", l.id)}
                      className={choiceCls(a.level === l.id)}
                    >
                      <span className="text-lg font-bold">{l.label}</span>
                      <span className="text-muted-foreground">{l.text}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">Úroveň můžete kdykoli změnit.</p>
              </div>
            )}

            {step === 1 && (
              <div className="mt-8">
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Co byste rádi dělali?</h1>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {WANTS.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => set("want", w.id)}
                      className={choiceCls(a.want === w.id)}
                    >
                      <span className="font-bold">{w.label}</span>
                      <span className="text-sm text-muted-foreground">{w.text}</span>
                    </button>
                  ))}
                </div>
                <label className="mt-6 block space-y-2">
                  <span className="font-semibold">Máte už konkrétní nápad? (nepovinné)</span>
                  <Textarea
                    value={a.idea}
                    onChange={(e) => set("idea", e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="Klidně jednou větou. Je to jen pro vás, nikdo to nehodnotí."
                  />
                </label>
              </div>
            )}

            {step === 2 && (
              <div className="mt-8">
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Co z toho už umíte?</h1>
                <p className="mt-2 text-muted-foreground">
                  Tohle je všechno, co ke spuštění potřebujete. Nic víc. ({answered} z {SKILL_AREAS.length})
                </p>
                <ul className="mt-5 divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
                  {SKILL_AREAS.map((s) => (
                    <li
                      key={s.id}
                      className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                    >
                      <span className="font-medium">{s.label}</span>
                      <span className="flex shrink-0 gap-2" role="group" aria-label={s.label}>
                        {SKILL_CHOICES.map((c) => {
                          const on = a.skills[s.id] === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              aria-pressed={on}
                              onClick={() => set("skills", { ...a.skills, [s.id]: c.id })}
                              className={`h-9 rounded-lg border-2 px-3 text-sm font-semibold ${
                                on ? c.on : "border-border bg-background hover:border-primary/50"
                              }`}
                            >
                              {c.label}
                            </button>
                          );
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {step === 3 && (
              <div className="mt-8">
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Kolik času týdně můžete projektu dát?
                </h1>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {HOURS.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => set("hours", h.id)}
                      className={choiceCls(a.hours === h.id)}
                    >
                      <span className="text-lg font-bold">{h.label}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">Stačí i málo, když je to pravidelně.</p>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                onClick={() => (step === 0 ? (editing ? setEditing(false) : setStarted(false)) : setStep(step - 1))}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Zpět
              </Button>
              <Button
                disabled={!canNext}
                onClick={() => (step === 3 ? finish() : (setStep(step + 1), window.scrollTo({ top: 0 })))}
                className="h-12 px-6 text-base font-bold"
              >
                {step === 3 ? "Ukázat mou mapu" : "Další"} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </section>
        )}
      </main>
    </SidebarLayout>
  );
};

export default EntryDiagnosisPage;
