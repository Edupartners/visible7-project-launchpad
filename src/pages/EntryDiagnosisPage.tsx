import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Compass, GraduationCap, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { SidebarLayout } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSupabaseProgress } from "@/hooks/useSupabaseProgress";
import { useProject } from "@/contexts/ProjectContext";
import { useIsStudent } from "@/lib/studySchedule";
import { celebrate } from "@/lib/celebrate";
import { track } from "@/lib/track";
import { useAccess } from "@/lib/access";
import { canBuy, kc, monthsLabel, useShop } from "@/lib/shop";
import {
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
  TALENT_PAIRS,
  TalentId,
  WANTS,
  entryResult,
  gateRoute,
} from "@/lib/entryDiagnosis";

const SKILL_CHOICES: { id: SkillLevel; label: string; on: string }[] = [
  { id: "umim", label: "Umím", on: "border-leaf-600 bg-leaf-600 text-white" },
  { id: "trochu", label: "Trochu", on: "border-amber-500 bg-amber-100 text-amber-950" },
  { id: "ne", label: "Ještě ne", on: "border-slate-400 bg-slate-100 text-slate-900" },
];

const STEP_TITLES = ["Co byste rádi dělali", "Co vás baví", "Co už umíte", "Kolik máte času", "Vaše cesta"];
const LAST = STEP_TITLES.length - 1;

const choiceCls = (on: boolean) =>
  `flex w-full flex-col items-start rounded-2xl border-2 p-4 text-left transition-colors sm:p-5 ${
    on ? "border-primary bg-leaf-50" : "border-border bg-card hover:border-primary/50"
  }`;

/** Deset rychlých dvojic „co byste dělali raději“. Po výběru se sama posune na další. */
const TalentStep = ({
  choices,
  onPick,
  onDone,
}: {
  choices: Record<number, TalentId>;
  onPick: (i: number, t: TalentId) => void;
  onDone: () => void;
}) => {
  const first = TALENT_PAIRS.findIndex((_, i) => !choices[i]);
  const [i, setI] = useState(first === -1 ? TALENT_PAIRS.length - 1 : first);
  const pair = TALENT_PAIRS[i];
  const pick = (t: TalentId) => {
    onPick(i, t);
    if (i < TALENT_PAIRS.length - 1) setTimeout(() => setI(i + 1), 180);
    else setTimeout(onDone, 250);
  };
  return (
    <div className="mt-8">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Co byste dělali raději?</h1>
      <p className="mt-2 text-muted-foreground">
        Vyberte rychle, co je vám bližší. Teď neřešíme, co umíte, ale co vás baví. Správná odpověď neexistuje.
      </p>
      <p className="mt-6 text-sm font-semibold text-leaf-700" aria-live="polite">
        {i + 1} z {TALENT_PAIRS.length}
      </p>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        {pair.map((o) => {
          const on = choices[i] === o.t;
          return (
            <button
              key={o.t}
              type="button"
              aria-pressed={on}
              onClick={() => pick(o.t)}
              className={`flex min-h-[7rem] items-center justify-center rounded-3xl border-2 p-5 text-center text-lg font-bold transition-colors ${
                on ? "border-primary bg-leaf-50" : "border-border bg-card hover:border-primary/50"
              }`}
            >
              {o.text}
            </button>
          );
        })}
      </div>
      {i > 0 && (
        <button
          type="button"
          onClick={() => setI(i - 1)}
          className="mt-4 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          ‹ Předchozí dvojice
        </button>
      )}
    </div>
  );
};

/** Výsledek: talent jako hlavní zpráva, pak co umíte a co se doučíte (seskupeno po branách). */
const EntryResult = ({ d, onEdit, onTalent }: { d: EntryDiagnosis; onEdit: () => void; onTalent: () => void }) => {
  const navigate = useNavigate();
  const isStudent = useIsStudent();
  const r = entryResult(d.answers);
  const toLearn = [...r.some, ...r.learn];
  const byGate = [1, 2, 3, 4, 5]
    .map((g) => ({ gate: g, items: toLearn.filter((s) => s.gate === g) }))
    .filter((g) => g.items.length);
  const [completed] = useSupabaseProgress<number[]>("completed_phases", []);
  const nextGate = [1, 2, 3, 4, 5, 6, 7].find((g) => !completed.includes(g)) ?? null;
  const access = useAccess();
  const shop = useShop();
  const locked = !access.loading && !access.full;
  const level = LEVELS.find((l) => l.id === d.answers.level);
  const t = r.talent;
  const count = (n: number) => (n === 1 ? "1 věc" : `${n} ${n < 5 ? "věci" : "věcí"}`);

  return (
    <div className="space-y-6">
      <p className="text-sm font-semibold text-leaf-700">Vaše mapa ke startu</p>

      {t ? (
        <section aria-labelledby="talent" className="rounded-3xl bg-primary p-6 text-white sm:p-8">
          <p className="flex items-center gap-2 text-sm font-semibold text-signal">
            <Sparkles className="h-4 w-4" aria-hidden="true" /> Na co máte talent
          </p>
          <h1 id="talent" className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t.balanced ? "Všestranný typ" : t.top.name}
            {t.second && <span className="text-white/70"> a {t.second.name.toLowerCase()}</span>}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-white/85">
            {t.balanced
              ? "Baví vás od všeho trochu. U startu je to výhoda: zvládnete tvořit, mluvit s lidmi, počítat i dotahovat věci. Začněte tím, co vás láká nejvíc."
              : t.top.text}
          </p>
          {!t.balanced && (
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-white/60">Co vám půjde samo</p>
                <ul className="mt-2 space-y-1.5">
                  {[...t.top.easy, ...(t.second?.easy.slice(0, 1) ?? [])].map((e) => (
                    <li key={e.label} className="flex items-start gap-2">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-signal" aria-hidden="true" />
                      <span>
                        {e.label} <span className="text-sm text-white/60">· brána {e.gate}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              {t.weakest && (
                <div>
                  <p className="text-sm font-semibold text-white/60">Na co si dát pozor</p>
                  <p className="mt-2 text-white/85">{t.weakest.help}</p>
                </div>
              )}
            </div>
          )}
          <p className="mt-6 text-xs text-white/50">
            Vychází z vašich voleb ve dvojicích. Není to psychologický test, jen vodítko, kde začít s chutí.
          </p>
        </section>
      ) : (
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Tohle zvládnete.</h1>
          <button
            type="button"
            onClick={onTalent}
            className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-left text-sm font-semibold text-white hover:bg-primary/90"
          >
            <Sparkles className="h-4 w-4 shrink-0 text-signal" aria-hidden="true" />
            Nově: zjistěte, na co máte talent (10 rychlých dvojic)
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </button>
        </div>
      )}

      <section aria-labelledby="start">
        <h2 id="start" className="text-xl font-bold sm:text-2xl">
          {toLearn.length === 0
            ? "Ke startu máte všechno. Můžete jít rovnou na věc."
            : r.can.length === 0
              ? `Ke startu se doučíte ${count(toLearn.length)}. Dá se to naučit a obvykle je toho míň, než si myslíte.`
              : `Ke startu už umíte ${r.can.length} z ${r.total}. Doučíte se ${count(toLearn.length)}.`}
        </h2>
        <div className={`mt-4 grid gap-4 ${byGate.length ? "md:grid-cols-[2fr_3fr]" : ""}`}>
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
            <h3 className="flex items-center gap-2 font-bold">
              <Check className="h-5 w-5 text-leaf-600" aria-hidden="true" /> Co už umíte
            </h3>
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
          </div>

          {byGate.length > 0 && (
            <div className="rounded-3xl border-[3px] border-signal bg-card p-5 sm:p-6">
              <h3 className="flex items-center gap-2 font-bold">
                <Compass className="h-5 w-5 text-primary" aria-hidden="true" /> Co se doučíte, brána po bráně
              </h3>
              <ol className="mt-3 space-y-4">
                {byGate.map((g) => (
                  <li key={g.gate}>
                    <Link
                      to={gateRoute(g.gate)}
                      className="inline-flex items-center gap-1 text-sm font-bold text-leaf-700 hover:underline"
                    >
                      {GATE_LABEL[g.gate]} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                    <ul className="mt-1.5 space-y-1.5">
                      {g.items.map((s) => (
                        <li key={s.id} className="text-sm">
                          {s.label}
                          {r.easySkills.has(s.id) ? (
                            <span className="ml-2 whitespace-nowrap rounded-full bg-signal/40 px-2 py-0.5 text-xs font-semibold">
                              s vaším talentem rychle
                            </span>
                          ) : d.answers.skills[s.id] === "trochu" ? (
                            <span className="ml-2 whitespace-nowrap text-xs text-muted-foreground">jen zopakovat</span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl bg-muted/60 p-5 sm:p-6">
        <ul className="space-y-2 text-sm">
          {r.models.length === 0 && d.answers.want === "nevim" && (
            <li>
              <span className="font-semibold">Co dělat: </span>Nevadí, že ještě nevíte. Typ podnikání vyberete v bráně 2
              podle toho, co vás láká nejvíc.
            </li>
          )}
          {r.models.length > 0 && (
            <li>
              <span className="font-semibold">
                {d.answers.want === "nevim" ? "Podle talentu se hodí: " : "Hodí se: "}
              </span>
              {r.models.map((m) => MODEL_NAMES[m]).join(" nebo ")}. Definitivně si vyberete v bráně 2.
            </li>
          )}
          <li>
            <span className="font-semibold">Cesta: </span>
            {level?.label}.{" "}
            {d.answers.level === "start"
              ? "Jen základ ke startu, témata do hloubky si přidáte, až budete chtít."
              : "Základ a k tomu témata do hloubky jako příprava na zkoušku."}
          </li>
          <li>
            <span className="font-semibold">Čas: </span>
            {r.slow
              ? "Při 3 hodinách týdně počítejte spíš s celým semestrem. Hlavní je pravidelnost."
              : "Při pravidelné práci zvládnete start během semestru."}
          </li>
          <li>
            <span className="font-semibold">Kdo co dělá: </span>Brány vyplňujete vy. AI pomůže s formulací, lektor s
            tím, co nepůjde.
          </li>
        </ul>
      </section>

      {locked && (
        <section className="rounded-3xl border-[3px] border-signal bg-card p-5 sm:p-6">
          <h2 className="text-lg font-bold">Další krok: členství VISIBLE7</h2>
          <p className="mt-1 text-muted-foreground">
            Všech 7 bran, e-learning a 4 vybrané semináře na {monthsLabel(shop.months)} za {kc(shop.price)}. Vaše
            diagnostika zůstává uložená a brány na ni navážou.
          </p>
        </section>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={() =>
            locked
              ? navigate(canBuy(shop) ? "/clenstvi" : "/cenik")
              : navigate(nextGate ? gateRoute(nextGate) : "/home")
          }
          className="v7-trap-btn h-12 pl-6 pr-11 text-base font-bold text-signal-foreground"
        >
          {locked
            ? "Získat členství"
            : !nextGate
              ? "Na přehled"
              : nextGate === 1
                ? "Začít bránou 1"
                : `Pokračovat bránou ${nextGate}`}{" "}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        {isStudent && (
          <Button variant="outline" className="h-12" onClick={() => navigate("/moje-studium")}>
            <GraduationCap className="mr-2 h-4 w-4" /> Rozvrh studia
          </Button>
        )}
        <Button variant="ghost" className="h-12" onClick={() => onEdit()}>
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
  const talentDone = Object.keys(a.talent ?? {}).length === TALENT_PAIRS.length;
  const canNext =
    step === 0
      ? Boolean(a.want)
      : step === 1
        ? talentDone
        : step === 2
          ? answered === SKILL_AREAS.length
          : step === 3
            ? Boolean(a.hours)
            : true;

  const finish = () => {
    const d: EntryDiagnosis = { answers: { ...a, idea: a.idea.trim() }, createdAt: new Date().toISOString() };
    setSaved(d);
    setEditing(false);
    setStarted(false);
    celebrate("small");
    const r = entryResult(d.answers);
    track(
      "entry_diagnosis_done",
      { level: a.level, want: a.want, can: r.can.length, talent: r.talent?.top.id ?? null },
      currentProject?.id,
    );
    window.scrollTo({ top: 0 });
  };

  const edit = (at = 0) => {
    if (saved) setA(saved.answers);
    setStep(at);
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
          <EntryResult d={saved} onEdit={edit} onTalent={() => edit(1)} />
        ) : !started ? (
          <section className="mx-auto max-w-2xl">
            <p className="text-sm font-semibold text-leaf-700">Vstupní diagnostika · asi 4 minuty</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Co už umíte a co vám chybí ke startu
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Ke spuštění vlastního projektu obvykle stačí méně, než si myslíte. Zjistíme spolu, na co máte talent a co
              vám ke startu opravdu chybí.
            </p>
            <p className="mt-3 text-lg text-muted-foreground">
              Pak si vyberete cestu rychlého startu, nebo cestu kompletního studia e-commerce.
            </p>
            <Button
              onClick={() => setStarted(true)}
              className="v7-trap-btn mt-8 h-12 pl-6 pr-11 text-base font-bold text-signal-foreground"
            >
              Začít <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
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

            {step === 4 && (
              <div className="mt-8">
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Kterou cestu si vyberete?</h1>
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
                <p className="mt-3 text-sm text-muted-foreground">Cestu můžete kdykoli změnit.</p>
              </div>
            )}

            {step === 0 && (
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

            {step === 1 && (
              <TalentStep
                choices={a.talent ?? {}}
                onPick={(i, t) => set("talent", { ...(a.talent ?? {}), [i]: t })}
                onDone={() => (setStep(2), window.scrollTo({ top: 0 }))}
              />
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
                onClick={() => (step === LAST ? finish() : (setStep(step + 1), window.scrollTo({ top: 0 })))}
                className="h-12 px-6 text-base font-bold"
              >
                {step === LAST ? "Ukázat mou mapu" : "Další"} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </section>
        )}
      </main>
    </SidebarLayout>
  );
};

export default EntryDiagnosisPage;
