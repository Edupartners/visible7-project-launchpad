import { useCallback, useEffect, useState } from "react";
import { GraduationCap, Loader2, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LecturerChip } from "@/components/LecturerChip";
import {
  StudySession,
  addStudent,
  loadStudents,
  loadStudySessions,
  removeStudent,
  updateStudySession,
} from "@/lib/studySchedule";

// Datum a čas vždy v pražském čase, ať je to kdekoli.
const pragueParts = (iso: string | null) => {
  if (!iso) return { date: "", time: "17:00" };
  const f = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Prague",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
  const [date, time] = f.split(" ");
  return { date, time };
};
// Z pražského data a času udělá ISO (zjistí posun pro daný den: zimní/letní čas).
const fromPrague = (date: string, time: string) => {
  if (!date) return null;
  const guess = new Date(`${date}T${time}:00Z`);
  const { date: d2, time: t2 } = pragueParts(guess.toISOString());
  const shown = new Date(`${d2}T${t2}:00Z`).getTime();
  return new Date(guess.getTime() - (shown - guess.getTime())).toISOString();
};

type Row = StudySession & { date: string; time: string; dirty?: boolean };

/** Správa studia: rozvrh povinných setkání a seznam studentů. */
export function StudyAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [students, setStudents] = useState<{ user_id: string; email: string; added_at: string }[]>([]);
  const [email, setEmail] = useState("");
  const [meetAll, setMeetAll] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    loadStudySessions().then((list) => setRows(list.map((s) => ({ ...s, ...pragueParts(s.starts_at) }))));
    loadStudents().then(setStudents);
  }, []);
  useEffect(load, [load]);

  const edit = (id: string, patch: Partial<Row>) =>
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch, dirty: true } : x)));

  const saveAll = async () => {
    const dirty = rows.filter((r) => r.dirty);
    for (const r of dirty) {
      const [h, m] = r.time.split(":").map(Number);
      if (r.date && r.place === "Online" && (h * 60 + m < 17 * 60 || h * 60 + m + r.duration_min > 20 * 60)) {
        setMsg(`${r.code}: online setkání musí být mezi 17:00 a 20:00.`);
        return;
      }
      for (const u of [r.meet_url, r.recording_url]) {
        if (u && !u.startsWith("https://")) {
          setMsg(`${r.code}: odkazy musí začínat https://`);
          return;
        }
      }
    }
    setBusy(true);
    setMsg(null);
    for (const r of dirty) {
      const err = await updateStudySession(r.id, {
        starts_at: fromPrague(r.date, r.time),
        topic: r.topic.trim(),
        lecturer: r.lecturer?.trim() || null,
        meet_url: r.meet_url?.trim() || null,
        recording_url: r.recording_url?.trim() || null,
        note: r.note?.trim() || null,
      });
      if (err) {
        setBusy(false);
        setMsg(`${r.code}: ${err}`);
        return;
      }
    }
    setBusy(false);
    setMsg(dirty.length ? `Uloženo ${dirty.length} setkání.` : "Nic se nezměnilo.");
    load();
  };

  const setMeetForAll = () => {
    const u = meetAll.trim();
    if (!u.startsWith("https://")) return setMsg("Odkaz musí začínat https://");
    setRows((r) => r.map((x) => (x.place === "Online" ? { ...x, meet_url: u, dirty: true } : x)));
    setMsg("Odkaz je doplněný ke všem online setkáním. Nezapomeňte uložit.");
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    const err = await addStudent(email);
    setMsg(err ?? `${email.trim()} je přidaný do studia.`);
    if (!err) setEmail("");
    loadStudents().then(setStudents);
  };

  const dirtyCount = rows.filter((r) => r.dirty).length;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <GraduationCap className="h-5 w-5" /> Rozvrh povinných setkání
        </h2>
        <p className="text-sm text-muted-foreground">
          Studenti vidí rozvrh na stránce Studium. Odkaz na připojení se jim ukáže 30 minut před začátkem. Po setkání
          vložte odkaz na záznam. Online setkání se drží v čase 17:00–20:00. Nepovinná úterní setkání upravíte v Obsah ›
          Živé semináře.
        </p>

        <div className="mt-4 flex flex-wrap items-end gap-2 rounded-2xl bg-muted/50 p-3">
          <label className="min-w-[260px] flex-1 space-y-1 text-sm">
            <span className="font-semibold">Jeden odkaz na Meet pro všechna online setkání</span>
            <Input
              value={meetAll}
              onChange={(e) => setMeetAll(e.target.value)}
              placeholder="https://meet.google.com/…"
            />
          </label>
          <Button type="button" variant="outline" onClick={setMeetForAll}>
            Doplnit ke všem
          </Button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-2">Č.</th>
                <th className="p-2">Datum</th>
                <th className="p-2">Začátek</th>
                <th className="p-2">Téma</th>
                <th className="p-2">Lektor</th>
                <th className="p-2">Odkaz na Meet</th>
                <th className="p-2">Záznam</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={`border-t border-border align-top ${r.dirty ? "bg-amber-50" : ""}`}>
                  <td className="p-2 font-bold">{r.code}</td>
                  <td className="p-2">
                    <Input
                      type="date"
                      value={r.date}
                      onChange={(e) => edit(r.id, { date: e.target.value })}
                      className="w-36"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="time"
                      value={r.time}
                      onChange={(e) => edit(r.id, { time: e.target.value })}
                      className="w-24"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      value={r.topic}
                      onChange={(e) => edit(r.id, { topic: e.target.value })}
                      className="min-w-[220px]"
                    />
                  </td>
                  <td className="p-2">
                    <div className="space-y-1">
                      <Input
                        value={r.lecturer ?? ""}
                        onChange={(e) => edit(r.id, { lecturer: e.target.value })}
                        placeholder="Doplnit"
                        className="w-44"
                      />
                      {r.lecturer && <LecturerChip name={r.lecturer} size="sm" />}
                    </div>
                  </td>
                  <td className="p-2">
                    <Input
                      value={r.meet_url ?? ""}
                      onChange={(e) => edit(r.id, { meet_url: e.target.value })}
                      placeholder="https://…"
                      className="w-44"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      value={r.recording_url ?? ""}
                      onChange={(e) => edit(r.id, { recording_url: e.target.value })}
                      placeholder="https://…"
                      className="w-44"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={saveAll} disabled={busy || dirtyCount === 0}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Uložit změny{dirtyCount ? ` (${dirtyCount})` : ""}
          </Button>
          {msg && <p className="text-sm">{msg}</p>}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Users className="h-5 w-5" /> Studenti semestru ({students.length})
        </h2>
        <p className="text-sm text-muted-foreground">
          Jen studenti vidí stránku Studium a odkazy na povinná setkání. Člověk musí mít účet na visible7.io. Při
          přidání dostane i členství VISIBLE7 na rok.
        </p>
        <form onSubmit={add} className="mt-4 flex flex-wrap gap-2">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e-mail studenta"
            className="min-w-[240px] flex-1"
            aria-label="E-mail studenta"
          />
          <Button type="submit">Přidat studenta</Button>
        </form>
        <ul className="mt-4 divide-y divide-border">
          {students.map((s) => (
            <li key={s.user_id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span>
                {s.email}{" "}
                <span className="text-muted-foreground">· od {new Date(s.added_at).toLocaleDateString("cs-CZ")}</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  if (!window.confirm(`Odebrat ${s.email} ze studia?`)) return;
                  const err = await removeStudent(s.user_id);
                  setMsg(err ?? "Student je odebraný.");
                  loadStudents().then(setStudents);
                }}
              >
                <Trash2 className="mr-1 h-4 w-4" /> Odebrat
              </Button>
            </li>
          ))}
          {students.length === 0 && <li className="py-2 text-sm text-muted-foreground">Zatím žádní studenti.</li>}
        </ul>
      </section>
    </div>
  );
}
