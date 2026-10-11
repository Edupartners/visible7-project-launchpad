import { useCallback, useEffect, useState } from "react";
import { Bell, Eye, Pin, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/AuthGate";
import {
  AdminAnnouncement,
  AnnouncementKind,
  KIND_LABELS,
  createAnnouncement,
  deleteAnnouncement,
  loadAdminAnnouncements,
  updateAnnouncement,
} from "@/lib/announcements";

const EMPTY = {
  title: "",
  body: "",
  kind: "novinka" as AnnouncementKind,
  link_url: "",
  link_label: "",
  highlight: false,
  ends_on: "",
};

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("cs-CZ") : "");

/** Správa oznámení: napsat, zapnout / vypnout, smazat. */
export function AnnouncementsAdmin({ users }: { users: number }) {
  const { user } = useAuth();
  const [list, setList] = useState<AdminAnnouncement[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(() => {
    loadAdminAnnouncements()
      .then(setList)
      .catch((e) => setMsg(e instanceof Error ? e.message : "Načtení oznámení se nepodařilo."));
  }, []);
  useEffect(load, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.title.trim()) return;
    const url = form.link_url.trim();
    if (url && !/^(https:\/\/|\/)/.test(url)) {
      setMsg("Odkaz musí začínat https:// nebo / (stránka v aplikaci).");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await createAnnouncement(
        {
          title: form.title.trim(),
          body: form.body.trim(),
          kind: form.kind,
          link_url: url || null,
          link_label: url ? form.link_label.trim() || null : null,
          highlight: form.highlight,
          starts_at: new Date().toISOString(),
          ends_at: form.ends_on ? new Date(`${form.ends_on}T23:59:59`).toISOString() : null,
        },
        user.id,
      );
      setForm(EMPTY);
      setMsg("Oznámení je venku.");
      load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Uložení se nepodařilo.");
    } finally {
      setBusy(false);
    }
  };

  const patch = async (id: string, p: Partial<AdminAnnouncement>) => {
    setList((l) => l.map((a) => (a.id === id ? { ...a, ...p } : a)));
    try {
      await updateAnnouncement(id, p);
    } finally {
      load();
    }
  };

  const remove = async (a: AdminAnnouncement) => {
    if (!window.confirm(`Smazat oznámení „${a.title}“?`)) return;
    await deleteAnnouncement(a.id);
    load();
  };

  return (
    <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <Bell className="h-5 w-5" /> Oznámení pro uživatele
      </h2>
      <p className="text-sm text-muted-foreground">
        Zprávy se ukážou ve zvonečku. Připnuté navíc nahoře na nástěnce, dokud je uživatel nezavře. Vypnuté nebo prošlé
        zmizí všem.
      </p>

      <form onSubmit={submit} className="mt-4 grid gap-3 rounded-2xl bg-muted/50 p-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm sm:col-span-2">
          <span className="font-semibold">Nadpis</span>
          <Input
            value={form.title}
            maxLength={120}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Např. 4. 12. se můžeme potkat v Praze"
            required
          />
        </label>
        <label className="space-y-1 text-sm sm:col-span-2">
          <span className="font-semibold">Text</span>
          <Textarea
            value={form.body}
            maxLength={1000}
            rows={3}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="Kde, kdy, co je nového…"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold">Druh</span>
          <select
            value={form.kind}
            onChange={(e) => setForm({ ...form, kind: e.target.value as AnnouncementKind })}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {(Object.keys(KIND_LABELS) as AnnouncementKind[]).map((k) => (
              <option key={k} value={k}>
                {KIND_LABELS[k]}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold">Zobrazovat do (nepovinné)</span>
          <Input type="date" value={form.ends_on} onChange={(e) => setForm({ ...form, ends_on: e.target.value })} />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold">Odkaz (nepovinný)</span>
          <Input
            value={form.link_url}
            onChange={(e) => setForm({ ...form, link_url: e.target.value })}
            placeholder="https://… nebo /cenik"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold">Text odkazu</span>
          <Input
            value={form.link_label}
            maxLength={40}
            onChange={(e) => setForm({ ...form, link_label: e.target.value })}
            placeholder="Přihlásit se na setkání"
          />
        </label>
        <label className="flex items-center gap-3 text-sm sm:col-span-2">
          <Switch checked={form.highlight} onCheckedChange={(v) => setForm({ ...form, highlight: v })} />
          <span>
            <span className="font-semibold">Připnout na nástěnku</span>
            <span className="block text-xs text-muted-foreground">
              Pro důležité věci – každý ho uvidí, dokud nezavře.
            </span>
          </span>
        </label>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <Button type="submit" className="rounded-[10px]" disabled={busy || !form.title.trim()}>
            Zveřejnit oznámení
          </Button>
          {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
        </div>
      </form>

      {list.length > 0 && (
        <ul className="mt-4 divide-y divide-border">
          {list.map((a) => (
            <li key={a.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                  <span>{KIND_LABELS[a.kind]}</span>
                  <span>od {fmt(a.starts_at)}</span>
                  {a.ends_at && <span>do {fmt(a.ends_at)}</span>}
                  <span
                    className={`rounded-full px-2 py-0.5 font-semibold ${a.live ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}`}
                  >
                    {a.live ? "Zobrazuje se" : a.active ? "Prošlé" : "Vypnuto"}
                  </span>
                </p>
                <p className="truncate font-semibold">{a.title}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="h-3.5 w-3.5" /> Přečetlo {a.reads} z {users}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm" title="Připnout na nástěnku">
                  <Pin className="h-4 w-4 text-muted-foreground" />
                  <Switch
                    checked={a.highlight}
                    onCheckedChange={(v) => patch(a.id, { highlight: v })}
                    aria-label={`Připnout ${a.title}`}
                  />
                </label>
                <label className="flex items-center gap-2 text-sm">
                  Zapnuto
                  <Switch
                    checked={a.active}
                    onCheckedChange={(v) => patch(a.id, { active: v })}
                    aria-label={`Zapnout ${a.title}`}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => remove(a)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Smazat ${a.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
