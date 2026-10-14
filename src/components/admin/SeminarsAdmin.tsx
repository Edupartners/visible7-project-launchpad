import { useCallback, useEffect, useState } from "react";
import { Pencil, Presentation, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { GATE_NAMES } from "@/lib/certificates";
import {
  AdminSeminar,
  SeminarAccess,
  SeminarInput,
  createSeminar,
  deleteSeminar,
  formatWhen,
  loadAdminSeminars,
  updateSeminar,
} from "@/lib/seminars";

interface Form {
  title: string;
  description: string;
  gate: string;
  date: string;
  time: string;
  duration_min: string;
  place: string;
  access: SeminarAccess;
  join_url: string;
  recording_url: string;
  published: boolean;
}

const EMPTY: Form = {
  title: "",
  description: "",
  gate: "",
  date: "",
  time: "18:00",
  duration_min: "90",
  place: "Online",
  access: "clenove",
  join_url: "",
  recording_url: "",
  published: true,
};

const pad = (n: number) => String(n).padStart(2, "0");
const toForm = (s: AdminSeminar): Form => {
  const d = s.starts_at ? new Date(s.starts_at) : null;
  return {
    title: s.title,
    description: s.description,
    gate: s.gate ? String(s.gate) : "",
    date: d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : "",
    time: d ? `${pad(d.getHours())}:${pad(d.getMinutes())}` : "18:00",
    duration_min: String(s.duration_min),
    place: s.place,
    access: s.access,
    join_url: s.join_url ?? "",
    recording_url: s.recording_url ?? "",
    published: s.published,
  };
};

const toInput = (f: Form): SeminarInput => ({
  title: f.title.trim(),
  description: f.description.trim(),
  gate: f.gate ? Number(f.gate) : null,
  starts_at: f.date ? new Date(`${f.date}T${f.time || "18:00"}`).toISOString() : null,
  duration_min: Math.min(Math.max(Number(f.duration_min) || 90, 15), 480),
  place: f.place.trim() || "Online",
  access: f.access,
  join_url: f.join_url.trim() || null,
  recording_url: f.recording_url.trim() || null,
  published: f.published,
});

/** Správa živých seminářů: témata, termíny, odkazy a záznamy. */
export function SeminarsAdmin() {
  const [list, setList] = useState<AdminSeminar[]>([]);
  const [form, setForm] = useState<Form>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(() => {
    loadAdminSeminars()
      .then(setList)
      .catch((e) => setMsg(e instanceof Error ? e.message : "Načtení seminářů se nepodařilo."));
  }, []);
  useEffect(load, [load]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    for (const u of [form.join_url, form.recording_url]) {
      if (u.trim() && !u.trim().startsWith("https://")) {
        setMsg("Odkazy musí začínat https://");
        return;
      }
    }
    setBusy(true);
    setMsg(null);
    try {
      if (editing) await updateSeminar(editing, toInput(form));
      else await createSeminar(toInput(form));
      setMsg(editing ? "Seminář je upravený." : "Seminář je přidaný.");
      setForm(EMPTY);
      setEditing(null);
      load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Uložení se nepodařilo.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (s: AdminSeminar) => {
    if (!window.confirm(`Smazat seminář „${s.title}“ i s registracemi?`)) return;
    await deleteSeminar(s.id);
    load();
  };

  return (
    <section className="rounded-3xl border border-border bg-card p-5 sm:p-6" id="seminare-admin">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <Presentation className="h-5 w-5" /> Živé semináře
      </h2>
      <p className="text-sm text-muted-foreground">
        Bez data se seminář ukáže jako „Termín brzy vypíšeme“. Odkaz na připojení uvidí jen přihlášení členové (u
        semináře zdarma všichni přihlášení). Po semináři vložte odkaz na záznam.
      </p>

      <form onSubmit={submit} className="mt-4 grid gap-3 rounded-2xl bg-muted/50 p-4 sm:grid-cols-2">
        <p className="text-sm font-bold sm:col-span-2">{editing ? "Upravit seminář" : "Nový seminář"}</p>
        <label className="space-y-1 text-sm sm:col-span-2">
          <span className="font-semibold">Téma</span>
          <Input value={form.title} maxLength={120} onChange={(e) => set("title", e.target.value)} required />
        </label>
        <label className="space-y-1 text-sm sm:col-span-2">
          <span className="font-semibold">Popis</span>
          <Textarea
            value={form.description}
            maxLength={1500}
            rows={3}
            onChange={(e) => set("description", e.target.value)}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold">Datum (nepovinné)</span>
          <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1 text-sm">
            <span className="font-semibold">Čas</span>
            <Input type="time" value={form.time} onChange={(e) => set("time", e.target.value)} />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-semibold">Délka (min)</span>
            <Input
              type="number"
              min={15}
              max={480}
              value={form.duration_min}
              onChange={(e) => set("duration_min", e.target.value)}
            />
          </label>
        </div>
        <label className="space-y-1 text-sm">
          <span className="font-semibold">K bráně</span>
          <select
            value={form.gate}
            onChange={(e) => set("gate", e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Průřezové téma</option>
            {[1, 2, 3, 4, 5, 6, 7].map((g) => (
              <option key={g} value={g}>
                {g}. {GATE_NAMES[g]}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold">Pro koho</span>
          <select
            value={form.access}
            onChange={(e) => set("access", e.target.value as SeminarAccess)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="clenove">Jen pro členy</option>
            <option value="zdarma">Zdarma pro všechny přihlášené</option>
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold">Kde</span>
          <Input value={form.place} maxLength={120} onChange={(e) => set("place", e.target.value)} />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold">Odkaz na připojení</span>
          <Input
            value={form.join_url}
            onChange={(e) => set("join_url", e.target.value)}
            placeholder="https://meet.google.com/…"
          />
        </label>
        <label className="space-y-1 text-sm sm:col-span-2">
          <span className="font-semibold">Odkaz na záznam (po semináři)</span>
          <Input
            value={form.recording_url}
            onChange={(e) => set("recording_url", e.target.value)}
            placeholder="https://youtu.be/… (neveřejné video)"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={form.published} onCheckedChange={(v) => set("published", v)} /> Zveřejněno
        </label>
        <div className="flex flex-wrap justify-end gap-2">
          {editing && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setEditing(null);
                setForm(EMPTY);
              }}
            >
              Zrušit
            </Button>
          )}
          <Button type="submit" disabled={busy}>
            {editing ? "Uložit změny" : "Přidat seminář"}
          </Button>
        </div>
        {msg && (
          <p className="text-sm text-muted-foreground sm:col-span-2" role="status">
            {msg}
          </p>
        )}
      </form>

      <ul className="mt-4 divide-y divide-border">
        {list.map((s) => (
          <li key={s.id} className="flex flex-wrap items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                {s.title}
                {!s.published && <span className="ml-2 text-xs font-normal text-muted-foreground">(skryto)</span>}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatWhen(s.starts_at)} · {s.access === "zdarma" ? "zdarma" : "pro členy"}
                {s.gate ? ` · brána ${s.gate}` : ""}
                {s.join_url ? " · odkaz ✓" : ""}
                {s.recording_url ? " · záznam ✓" : ""}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground" title="Přihlášení">
              <Users className="h-4 w-4" /> {s.registrations}
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Upravit ${s.title}`}
              onClick={() => {
                setEditing(s.id);
                setForm(toForm(s));
                document.getElementById("seminare-admin")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label={`Smazat ${s.title}`} onClick={() => remove(s)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
