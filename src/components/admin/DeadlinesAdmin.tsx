import { useCallback, useEffect, useState } from "react";
import { CalendarClock, Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Deadline, adminDeleteDeadline, adminLoadDeadlines, adminSaveDeadline, czDate } from "@/lib/deadlines";

const AUDIENCES: { id: string; label: string }[] = [
  { id: "osvc_bezny", label: "OSVČ běžný" },
  { id: "osvc_pausal", label: "Paušál" },
  { id: "sro", label: "s.r.o." },
  { id: "dph", label: "Plátce DPH" },
];

type Draft = Omit<Deadline, "id"> & { id?: string };
const EMPTY: Draft = {
  title: "",
  detail: "",
  due_date: "",
  audience: [],
  url: "https://www.mojedane.cz/",
  source_url: "https://financnisprava.gov.cz/cs/danovy-kalendar",
  verified: false,
};

/** Termíny podnikatele: e-mail týden předem odchází jen u ověřených. */
export const DeadlinesAdmin = () => {
  const [items, setItems] = useState<Deadline[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [onlyOpen, setOnlyOpen] = useState(true);
  const { toast } = useToast();

  const load = useCallback(() => adminLoadDeadlines().then(setItems), []);
  useEffect(() => {
    load();
  }, [load]);

  const save = async (d: Draft) => {
    if (!d.title.trim() || !d.due_date || !d.audience.length) {
      toast({ title: "Vyplňte název, datum a pro koho termín je", variant: "destructive" });
      return;
    }
    const err = await adminSaveDeadline({ ...d, url: d.url || null, source_url: d.source_url || null });
    if (err) toast({ title: "Nepodařilo se uložit", description: err, variant: "destructive" });
    else {
      setDraft(null);
      load();
    }
  };

  const verify = async (d: Deadline, v: boolean) => {
    setItems((xs) => xs.map((x) => (x.id === d.id ? { ...x, verified: v } : x)));
    const err = await adminSaveDeadline({ id: d.id, verified: v });
    if (err) {
      toast({ title: "Nepodařilo se uložit", description: err, variant: "destructive" });
      load();
    }
  };

  const remove = async (d: Deadline) => {
    if (!window.confirm(`Smazat termín „${d.title}“ (${czDate(d.due_date)})?`)) return;
    const err = await adminDeleteDeadline(d.id);
    if (err) toast({ title: "Nepodařilo se smazat", description: err, variant: "destructive" });
    else load();
  };

  const open = items.filter((d) => !d.verified).length;
  const shown = onlyOpen ? items.filter((d) => !d.verified) : items;

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <CalendarClock className="h-5 w-5" /> Termíny podnikatele
          </h2>
          <p className="text-sm text-muted-foreground">
            E-mail týden předem odchází jen u ověřených termínů. Ke kontrole: {open} z {items.length}.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setOnlyOpen((v) => !v)}>
            {onlyOpen ? "Zobrazit všechny" : "Jen ke kontrole"}
          </Button>
          <Button size="sm" onClick={() => setDraft({ ...EMPTY })}>
            <Plus className="mr-1 h-4 w-4" /> Přidat termín
          </Button>
        </div>
      </div>

      {draft && <DraftForm draft={draft} onChange={setDraft} onSave={save} onCancel={() => setDraft(null)} />}

      <ul className="divide-y divide-border text-sm">
        {shown.map((d) => (
          <li key={d.id} className="flex flex-wrap items-center gap-3 py-2.5">
            <span className="w-24 shrink-0 font-semibold tabular-nums">{czDate(d.due_date)}</span>
            <span className="min-w-0 flex-1">
              {d.title}
              <span className="ml-2 text-xs text-muted-foreground">
                {d.audience.map((a) => AUDIENCES.find((x) => x.id === a)?.label ?? a).join(", ")}
              </span>
            </span>
            <button
              type="button"
              onClick={() => verify(d, !d.verified)}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                d.verified ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}
              aria-pressed={d.verified}
            >
              {d.verified ? <Check className="h-3.5 w-3.5" /> : null}
              {d.verified ? "Ověřeno" : "Ověřit"}
            </button>
            <Button variant="ghost" size="icon" onClick={() => setDraft({ ...d })} aria-label={`Upravit ${d.title}`}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-700"
              onClick={() => remove(d)}
              aria-label={`Smazat ${d.title}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
        {!shown.length && <li className="py-3 text-muted-foreground">Vše je zkontrolované.</li>}
      </ul>
    </section>
  );
};

const DraftForm = ({
  draft,
  onChange,
  onSave,
  onCancel,
}: {
  draft: Draft;
  onChange: (d: Draft) => void;
  onSave: (d: Draft) => void;
  onCancel: () => void;
}) => (
  <div className="space-y-3 rounded-2xl bg-muted/50 p-4">
    <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
      <Input
        value={draft.title}
        onChange={(e) => onChange({ ...draft, title: e.target.value })}
        placeholder="Název, např. Paušální daň: záloha za leden"
        aria-label="Název termínu"
      />
      <Input
        type="date"
        value={draft.due_date}
        onChange={(e) => onChange({ ...draft, due_date: e.target.value })}
        aria-label="Datum"
      />
    </div>
    <Textarea
      value={draft.detail}
      onChange={(e) => onChange({ ...draft, detail: e.target.value })}
      placeholder="Krátké vysvětlení, co se podává nebo platí"
      rows={2}
      aria-label="Popis"
    />
    <div className="grid gap-3 sm:grid-cols-2">
      <Input
        value={draft.url ?? ""}
        onChange={(e) => onChange({ ...draft, url: e.target.value })}
        placeholder="Odkaz na portál"
        aria-label="Odkaz na portál"
      />
      <Input
        value={draft.source_url ?? ""}
        onChange={(e) => onChange({ ...draft, source_url: e.target.value })}
        placeholder="Zdroj termínu"
        aria-label="Zdroj termínu"
      />
    </div>
    <div className="flex flex-wrap items-center gap-4 text-sm">
      <span className="font-semibold">Pro koho:</span>
      {AUDIENCES.map((a) => (
        <label key={a.id} className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={draft.audience.includes(a.id)}
            onChange={(e) =>
              onChange({
                ...draft,
                audience: e.target.checked ? [...draft.audience, a.id] : draft.audience.filter((x) => x !== a.id),
              })
            }
          />
          {a.label}
        </label>
      ))}
      <label className="ml-auto flex items-center gap-1.5 font-semibold">
        <input
          type="checkbox"
          checked={draft.verified}
          onChange={(e) => onChange({ ...draft, verified: e.target.checked })}
        />
        Ověřeno
      </label>
    </div>
    <div className="flex gap-2">
      <Button size="sm" onClick={() => onSave(draft)}>
        Uložit
      </Button>
      <Button size="sm" variant="ghost" onClick={onCancel}>
        <X className="mr-1 h-4 w-4" /> Zrušit
      </Button>
    </div>
  </div>
);
