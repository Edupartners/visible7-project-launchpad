import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Download, Loader2, Presentation } from "lucide-react";
import { SidebarLayout } from "@/components/layout/AppSidebar";
import { useAuth } from "@/components/AuthGate";
import { Button } from "@/components/ui/button";
import { useIsAdmin } from "@/lib/admin";
import { useIsStudent } from "@/lib/studySchedule";
import {
  type FpAnswers,
  type FpPart,
  type FpTemplate,
  type Mode,
  buildDocx,
  criterionLabel,
  fileSlug,
  isFilled,
  loadAnswers,
  loadTemplate,
  qid,
  requiredIds,
  saveAnswers,
} from "@/lib/finalProject";
import { cn } from "@/lib/utils";

const MODE_CLS: Record<Mode, string> = {
  P: "bg-primary text-primary-foreground",
  U: "border border-border bg-muted text-foreground",
  PU: "bg-signal/15 text-foreground",
  PR: "bg-signal text-foreground",
};

const SHORT: Record<string, string> = {
  "1": "Koncept",
  "2": "Výzkum",
  "3": "Web a e-shop",
  "4": "Logistika",
  "5": "Legislativa",
  "6": "Pitch",
};

type SaveState = "idle" | "saving" | "saved" | "error";

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

/** Závěrečný projekt a příprava na zkoušku 66-043-N. Odpovědi se ukládají k účtu studenta. */
export default function FinalProjectPage() {
  const { user } = useAuth();
  const isStudent = useIsStudent();
  const isAdmin = useIsAdmin();
  const [tpl, setTpl] = useState<FpTemplate | null | undefined>(undefined);
  const [answers, setAnswers] = useState<FpAnswers>({});
  const [save, setSave] = useState<SaveState>("idle");
  const [dl, setDl] = useState<{ busy: boolean; msg: string; err: boolean }>({ busy: false, msg: "", err: false });
  const pending = useRef<FpAnswers | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const allowed = isStudent || isAdmin;

  useEffect(() => {
    if (!user || !allowed) return;
    let alive = true;
    Promise.all([loadTemplate(), loadAnswers(user.id)]).then(([t, a]) => {
      if (!alive) return;
      const meta = user.user_metadata as { first_name?: string; last_name?: string } | undefined;
      const name = [meta?.first_name, meta?.last_name].filter(Boolean).join(" ");
      setAnswers(a.f_jmeno || !name ? a : { ...a, f_jmeno: name });
      setTpl(t);
    });
    return () => {
      alive = false;
    };
  }, [user, allowed]);

  const flush = useCallback(async () => {
    clearTimeout(timer.current);
    const a = pending.current;
    if (!a || !user) return;
    pending.current = null;
    setSave("saving");
    setSave((await saveAnswers(user.id, a)) ? "saved" : "error");
  }, [user]);

  useEffect(() => {
    const onHide = () => void flush();
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      void flush();
    };
  }, [flush]);

  const update = (id: string, value: string) => {
    setAnswers((prev) => {
      const next = { ...prev, [id]: value };
      pending.current = next;
      return next;
    });
    setSave("saving");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => void flush(), 800);
  };

  const required = useMemo(() => (tpl ? requiredIds(tpl) : []), [tpl]);
  const filled = required.filter((id) => isFilled(answers[id])).length;

  const download = async () => {
    if (!tpl) return;
    if (!(answers.f_jmeno ?? "").trim()) {
      setDl({ busy: false, msg: "Nejdřív vyplňte jméno a příjmení nahoře.", err: true });
      document.getElementById("f_jmeno")?.focus();
      return;
    }
    setDl({ busy: true, msg: "", err: false });
    try {
      await flush();
      const blob = await buildDocx(tpl, answers);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Zaverecny-projekt-${fileSlug(answers.f_jmeno) || "student"}.docx`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setDl({ busy: false, msg: "Dokument je stažený.", err: false });
    } catch {
      setDl({ busy: false, msg: "Dokument se nepodařilo vytvořit. Zkuste to prosím znovu.", err: true });
    }
  };

  return (
    <SidebarLayout>
      <main className="mx-auto max-w-4xl px-4 pt-8 sm:px-8">
        <Link
          to="/moje-studium"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Moje studium
        </Link>
        <header className="mt-4">
          <p className="text-sm font-semibold text-leaf-700">Specialista internetového obchodu · 66-043-N</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">Závěrečný projekt</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Vypracujte vlastní podnikatelský projekt část po části. U každé otázky najdete, co má odpověď obsahovat a
            kterou kompetenci u zkoušky ověřuje. Hotový projekt si stáhnete jako dokument Word a použijete ho u zkoušky.
          </p>
        </header>

        {isStudent === null || isAdmin === null ? null : !allowed ? (
          <section className="mt-8 rounded-3xl border border-border bg-card p-6 sm:p-8">
            <h2 className="text-xl font-bold">Závěrečný projekt je pro studenty kurzu</h2>
            <p className="mt-2 text-muted-foreground">
              Pokud kurz studujete a stránku nevidíte, napište lektorovi, ať vás přidá mezi studenty.
            </p>
          </section>
        ) : tpl === undefined ? (
          <div className="mt-10 flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Načítám zadání…
          </div>
        ) : tpl === null ? (
          <p className="mt-8 text-muted-foreground">Zadání se nepodařilo načíst. Obnovte prosím stránku.</p>
        ) : (
          <>
            <ExamInfo tpl={tpl} />

            <section className="mt-6 rounded-3xl border border-border bg-card p-6 sm:p-8" aria-label="Vy a váš projekt">
              <h2 className="text-xl font-bold">Vy a váš projekt</h2>
              <div className="mt-2 grid gap-x-4 sm:grid-cols-2">
                <Field id="f_jmeno" label="Jméno a příjmení" value={answers.f_jmeno} onChange={update} />
                <Field id="f_datum" label="Datum zkoušky" type="date" value={answers.f_datum} onChange={update} />
                <Field id="f_projekt" label="Název projektu" value={answers.f_projekt} onChange={update} />
                <Field id="f_web" label="Adresa webu (pokud už běží)" value={answers.f_web} onChange={update} />
              </div>
            </section>

            <nav className="mt-6 flex flex-wrap gap-2" aria-label="Části projektu">
              {tpl.parts
                .filter((p) => !p.opt)
                .map((p) => {
                  const ids = p.q.filter((q) => q.hs.length).map((q) => qid(p, q));
                  const n = ids.filter((id) => isFilled(answers[id])).length;
                  const done = ids.length > 0 && n === ids.length;
                  return (
                    <a
                      key={p.k}
                      href={`#cast${p.k}`}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm font-semibold",
                        done
                          ? "border-leaf-700 text-leaf-700"
                          : "border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {p.k}. {SHORT[p.k] ?? p.n.split(" ")[0]} {done ? "✓" : `${n}/${ids.length}`}
                    </a>
                  );
                })}
            </nav>

            {tpl.parts.map((p) =>
              p.opt ? (
                <details
                  key={p.k}
                  className="mt-10 rounded-3xl border border-dashed border-border bg-card px-5 sm:px-6"
                >
                  <summary className="cursor-pointer py-5 text-lg font-bold">{p.n}</summary>
                  <PartBlock part={p} tpl={tpl} answers={answers} onChange={update} />
                  <div className="pb-6" />
                </details>
              ) : (
                <PartBlock key={p.k} part={p} tpl={tpl} answers={answers} onChange={update} />
              ),
            )}
          </>
        )}
        {allowed && tpl && (
          <div className="sticky bottom-0 z-20 -mx-4 mt-10 border-t sm:-mx-8 border-border bg-background/95 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 sm:px-8">
              <div className="min-w-[180px] flex-1">
                <p className="text-sm">
                  <b className="tabular-nums">
                    {filled} z {required.length}
                  </b>{" "}
                  povinných otázek vyplněno
                  <span className="ml-2 text-xs text-muted-foreground">
                    {save === "saving" ? "· ukládám…" : save === "saved" ? "· uloženo" : save === "error" ? "" : ""}
                  </span>
                  {save === "error" && (
                    <span className="ml-2 text-xs text-destructive">
                      · nepodařilo se uložit, zkontrolujte připojení
                    </span>
                  )}
                </p>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-signal transition-[width]"
                    style={{ width: `${required.length ? (filled / required.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <Button onClick={download} disabled={dl.busy} className="w-full sm:w-auto">
                {dl.busy ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                )}
                Stáhnout dokument (Word)
              </Button>
              {dl.msg && (
                <p className={cn("w-full text-sm", dl.err ? "text-destructive" : "text-muted-foreground")}>{dl.msg}</p>
              )}
            </div>
          </div>
        )}
      </main>
    </SidebarLayout>
  );
}

function ExamInfo({ tpl }: { tpl: FpTemplate }) {
  return (
    <section className="mt-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
      <h2 className="text-xl font-bold">Jak zkouška probíhá</h2>
      <p className="mt-2 text-muted-foreground">
        Zkoušku vede autorizovaná osoba podle hodnoticího standardu. Hodnotí se pět kompetencí a v každé musíte splnit
        všechna kritéria. Výsledek je „vyhověl“, nebo „nevyhověl“. Váš projekt je podklad, na kterém budete odpovídat.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-4">
        {[
          ["Příprava 30 minut", "Seznámení s místností a BOZP, pak čas na přípravu."],
          ["Písemná část 60 minut", "Otázky odpovídáte volnou formou: popisy, výpočty, úlohy."],
          ["Praktická a ústní část", "Předvedete projekt, web, kalkulaci a pitch, vyřešíte simulovanou reklamaci."],
          ["Celkem 4 až 6 hodin", "Bez přípravy a přestávek."],
        ].map(([t, d]) => (
          <div key={t} className="border-t-[3px] border-signal pt-2">
            <p className="font-bold">{t}</p>
            <p className="text-sm text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
        {(Object.keys(tpl.modes) as Mode[]).map((m) => (
          <span key={m} className="inline-flex items-center gap-1.5">
            <ModeTag mode={m} label={tpl.modes[m]} />
          </span>
        ))}
      </div>
      <ul className="mt-4 list-disc space-y-1 pl-5 text-sm">
        <li>
          <b>Odpovídejte na svůj projekt.</b> Zkoušející chce slyšet, jak to uděláte vy, ne obecnou poučku.
        </li>
        <li>
          <b>Pište celými větami</b>, jako byste to vysvětlovali kolegovi. Stačí 4 až 8 vět na otázku.
        </li>
        <li>
          <b>Povinné jsou části 1 až 6.</b> Na konci je nepovinný tahák na praktickou a ústní část.
        </li>
        <li>Odpovědi se ukládají k vašemu účtu automaticky. Můžete pokračovat na jiném počítači i v mobilu.</li>
      </ul>
    </section>
  );
}

function ModeTag({ mode, label }: { mode: Mode; label: string }) {
  return (
    <span
      className={cn(
        "whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
        MODE_CLS[mode],
      )}
    >
      {label}
    </span>
  );
}

function Field({
  id,
  label,
  value,
  type = "text",
  onChange,
}: {
  id: string;
  label: string;
  value?: string;
  type?: string;
  onChange: (id: string, v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 mt-4 block text-sm font-semibold">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(id, e.target.value)}
        className={inputCls}
      />
    </div>
  );
}

function PartBlock({
  part,
  tpl,
  answers,
  onChange,
}: {
  part: FpPart;
  tpl: FpTemplate;
  answers: FpAnswers;
  onChange: (id: string, v: string) => void;
}) {
  return (
    <section id={`cast${part.k}`} className={cn("scroll-mt-20", part.opt ? "" : "mt-12")}>
      {!part.opt && (
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-primary text-base font-extrabold text-primary-foreground">
            {part.k}
          </span>
          <div>
            <h2 className="text-2xl font-bold">{part.n}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{part.d}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              <b className="text-foreground">Výstup:</b> {part.out}
            </p>
          </div>
        </div>
      )}
      {part.opt && <p className="text-sm text-muted-foreground">{part.d}</p>}

      {part.k === "6" && (
        <Link
          to="/investor-pitch"
          className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-muted/50 p-4 hover:border-primary"
        >
          <Presentation className="h-5 w-5 flex-none text-primary" aria-hidden="true" />
          <span className="text-sm">
            <b>Pitch pro investory v aplikaci</b> sestaví pitch na A4 z vašich bran 1–3 a finančního plánu. Odpovědi pak
            stačí přenést sem.
          </span>
          <ArrowRight className="ml-auto h-4 w-4 flex-none" aria-hidden="true" />
        </Link>
      )}

      {part.q.map((q) => {
        const id = qid(part, q);
        const done = isFilled(answers[id]);
        return (
          <div
            key={id}
            className={cn("mt-4 rounded-2xl border bg-card p-5", done ? "border-leaf-700" : "border-border")}
          >
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-muted-foreground">
                {part.k}.{q.c}
              </span>
              {q.hs.length ? (
                q.hs.map((k) => {
                  const c = tpl.criteria[k];
                  return c ? (
                    <span key={k} title={c[1]}>
                      <ModeTag mode={c[0]} label={`${criterionLabel(k)} · ${tpl.modes[c[0]]}`} />
                    </span>
                  ) : null;
                })
              ) : (
                <ModeTag mode="U" label="Nepovinné" />
              )}
              {done && (
                <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-leaf-700">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" /> Vyplněno
                </span>
              )}
            </div>
            <label htmlFor={id} className="block text-lg font-bold leading-snug">
              {q.t}
            </label>
            {q.hs.length > 0 && (
              <p className="mt-1 text-sm text-muted-foreground">
                Ověřuje u zkoušky:{" "}
                {q.hs
                  .map((k) => tpl.criteria[k] && `${criterionLabel(k)}) ${tpl.criteria[k][1]}`)
                  .filter(Boolean)
                  .join("; ")}
              </p>
            )}
            {!q.hs.length && !part.opt && (
              <p className="mt-1 text-sm text-muted-foreground">
                Patří ke Canvasu, ale u zkoušky se neověřuje. Vyplňte, pokud chcete mít Canvas kompletní.
              </p>
            )}
            {q.note && (
              <p className="mt-2 rounded-r-lg border-l-[3px] border-signal bg-signal/10 px-3 py-2 text-sm">{q.note}</p>
            )}
            <details className="mt-3 rounded-xl bg-muted/60 px-4">
              <summary className="cursor-pointer py-2.5 text-sm font-semibold text-primary">
                Co má odpověď obsahovat
              </summary>
              <ul className="list-disc space-y-1 pb-3 pl-5 text-sm">
                {q.h.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </details>
            <textarea
              id={id}
              value={answers[id] ?? ""}
              placeholder={q.ph || "Pište o svém projektu…"}
              onChange={(e) => onChange(id, e.target.value)}
              className={cn(inputCls, "mt-3 min-h-[140px] resize-y")}
            />
          </div>
        );
      })}
    </section>
  );
}
