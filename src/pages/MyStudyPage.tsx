import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Check, Clock, GraduationCap, MapPin, PlayCircle, Video } from "lucide-react";
import { SidebarLayout } from "@/components/layout/AppSidebar";
import { LecturerChip } from "@/components/LecturerChip";
import { useIsAdmin } from "@/lib/admin";
import { STUDY } from "@/lib/study";
import { NSK_QUALIFICATION } from "@/lib/qualification";
import { loadSeminars, Seminar } from "@/lib/seminars";
import {
  StudySession,
  canJoin,
  formatSessionDate,
  loadStudySessions,
  nextSession,
  sessionEnd,
  useIsStudent,
} from "@/lib/studySchedule";

const SEMESTER_FROM = new Date("2027-02-01T00:00:00+01:00").getTime();
const SEMESTER_TO = new Date("2027-06-30T23:59:00+02:00").getTime();

/** Studium pro studenty semestru: povinná setkání (čtvrtek), nepovinné semináře (úterý) a zkouška. */
export default function MyStudyPage() {
  const isStudent = useIsStudent();
  const isAdmin = useIsAdmin();
  const [sessions, setSessions] = useState<StudySession[] | null>(null);
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    loadStudySessions().then(setSessions);
    loadSeminars()
      .then((list) =>
        setSeminars(
          list
            .filter((s) => s.starts_at)
            .filter((s) => {
              const t = new Date(s.starts_at as string).getTime();
              return t >= SEMESTER_FROM && t <= SEMESTER_TO;
            })
            .sort((a, b) => new Date(a.starts_at as string).getTime() - new Date(b.starts_at as string).getTime()),
        ),
      )
      .catch(() => setSeminars([]));
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  const allowed = isStudent || isAdmin;
  const next = sessions ? nextSession(sessions, now) : null;
  const done = sessions?.filter((s) => (sessionEnd(s)?.getTime() ?? Infinity) < now).length ?? 0;

  return (
    <SidebarLayout>
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-8">
        <header>
          <p className="text-sm font-semibold text-leaf-700">Semestrální studium · {STUDY.dates}</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">{STUDY.name}</h1>
          <p className="mt-2 text-muted-foreground">
            Povinná setkání ve čtvrtek 17:00–20:00, nepovinné semináře v úterý od 17:00. Vše online, závěrečný den v
            Praze.
          </p>
        </header>

        {isStudent === null && isAdmin === null ? null : !allowed ? (
          <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
            <GraduationCap className="h-8 w-8 text-leaf-600" aria-hidden="true" />
            <h2 className="mt-3 text-xl font-bold">Studium je pro studenty semestru</h2>
            <p className="mt-2 text-muted-foreground">
              Rozvrh, odkazy na setkání a záznamy uvidíte po zápisu do studia. Nepovinné semináře najdete v Seminářích.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/studium"
                className="v7-trap-btn inline-flex h-11 items-center gap-2 pl-5 pr-10 font-bold text-signal-foreground"
              >
                O studiu a přihláška <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/seminare"
                className="inline-flex h-11 items-center rounded-[10px] border border-border px-4 font-semibold"
              >
                Semináře
              </Link>
            </div>
          </section>
        ) : (
          <>
            {isAdmin && !isStudent && (
              <p className="rounded-xl bg-muted px-4 py-2 text-sm">
                Vidíte náhled správce. Studenti vidí stejnou stránku.
              </p>
            )}

            {/* Další setkání */}
            {next && (
              <section className="rounded-3xl bg-primary p-6 text-white sm:p-8" aria-label="Další setkání">
                <p className="text-sm font-semibold text-signal">Další setkání · {next.code} z 20</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">{next.topic}</h2>
                <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-white/80">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4" aria-hidden="true" /> {formatSessionDate(next.starts_at)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" aria-hidden="true" /> {next.place}
                  </span>
                </p>
                <div className="mt-4">
                  <LecturerChip name={next.lecturer} dark size="lg" />
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {canJoin(next, now) ? (
                    <a
                      href={next.meet_url as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="v7-trap-btn inline-flex h-12 items-center gap-2 pl-6 pr-11 font-bold text-signal-foreground"
                    >
                      <Video className="h-5 w-5" aria-hidden="true" /> Připojit se
                    </a>
                  ) : (
                    <p className="text-sm text-white/75">
                      {next.starts_at
                        ? "Tlačítko Připojit se se tady objeví 30 minut před začátkem."
                        : next.note || "Termín upřesníme."}
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* Povinná setkání */}
            <section>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-xl font-bold">Povinná setkání</h2>
                {sessions && (
                  <p className="text-sm text-muted-foreground">
                    Proběhlo {done} z {sessions.length}
                  </p>
                )}
              </div>
              <ol className="mt-4 divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
                {(sessions ?? []).map((s) => {
                  const past = (sessionEnd(s)?.getTime() ?? Infinity) < now;
                  const isNext = next?.id === s.id;
                  return (
                    <li
                      key={s.id}
                      className={`grid gap-3 px-5 py-4 sm:grid-cols-[4.5rem_9.5rem_1fr_13rem] sm:items-center ${
                        isNext ? "bg-leaf-50" : ""
                      } ${past ? "text-muted-foreground" : ""}`}
                    >
                      <span
                        className={`inline-flex h-8 w-12 items-center justify-center rounded-lg text-sm font-extrabold ${
                          past ? "bg-muted" : isNext ? "bg-signal text-signal-foreground" : "bg-leaf-100 text-leaf-800"
                        }`}
                      >
                        {past ? <Check className="h-4 w-4" aria-label="Proběhlo" /> : s.code}
                      </span>
                      <span className="text-sm font-semibold">{formatSessionDate(s.starts_at)}</span>
                      <span className="min-w-0">
                        <span className="block font-semibold text-foreground">{s.topic}</span>
                        <span className="text-xs text-muted-foreground">
                          {s.gate ? `Brána ${s.gate}` : s.place}
                          {s.note ? ` · ${s.note}` : ""}
                        </span>
                        {s.recording_url && (
                          <a
                            href={s.recording_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-leaf-700 hover:underline"
                          >
                            <PlayCircle className="h-4 w-4" aria-hidden="true" /> Záznam
                          </a>
                        )}
                      </span>
                      <LecturerChip name={s.lecturer} size="sm" />
                    </li>
                  );
                })}
                {sessions && sessions.length === 0 && (
                  <li className="px-5 py-6 text-muted-foreground">Rozvrh připravujeme.</li>
                )}
              </ol>
            </section>

            {/* Nepovinné semináře */}
            <section>
              <h2 className="text-xl font-bold">Nepovinné semináře</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                V úterý 17:00–18:30. Máte je v ceně studia, přihlásíte se v Seminářích.
              </p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {seminars.map((s) => (
                  <li key={s.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-leaf-700">
                      <CalendarDays className="h-4 w-4" aria-hidden="true" /> {formatSessionDate(s.starts_at)}
                    </p>
                    <p className="font-bold">{s.title}</p>
                    <LecturerChip name={s.lecturer} size="sm" />
                  </li>
                ))}
              </ul>
              <Link
                to="/seminare"
                className="mt-4 inline-flex items-center gap-1.5 font-semibold text-leaf-700 hover:underline"
              >
                Přihlásit se na semináře <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </section>

            {/* Zkouška */}
            <section className="rounded-3xl border-[3px] border-signal bg-card p-6 sm:p-8">
              <h2 className="text-xl font-bold">Zkouška profesní kvalifikace {NSK_QUALIFICATION.code}</h2>
              <p className="mt-2 text-muted-foreground">
                Závěrečný den v Praze: obhajoba vlastního projektu a zkouška. Když napoprvé neuspějete, opakujete
                zkoušku zdarma, dokud ji nesložíte (do konce roku 2027).
              </p>
              <p className="mt-3 text-sm">
                Připravte se průběžně: ke každé bráně 1–5 jsou v aplikaci kontrolní otázky, které otevřete u osvědčení.
              </p>
              <Link
                to="/settings#osvedceni"
                className="mt-4 inline-flex items-center gap-1.5 font-semibold text-leaf-700 hover:underline"
              >
                Kontrolní otázky a osvědčení <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </section>
          </>
        )}
      </main>
    </SidebarLayout>
  );
}
