import { useState } from "react";
import { Plus, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TAG_COLORS, TAG_DOT, TagColor, UserTag } from "@/lib/adminExtras";

export function TagChip({ tag, onRemove }: { tag: UserTag; onRemove?: () => void }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${TAG_COLORS[tag.color]}`}
    >
      {tag.name}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="-mr-0.5 rounded-full p-0.5 hover:bg-black/10"
          aria-label={`Odebrat štítek ${tag.name}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

/** Štítky jednoho uživatele: přidat existující, založit nový, odebrat. */
export function UserTagEditor({
  tags,
  selected,
  onToggle,
  onCreate,
}: {
  tags: UserTag[];
  selected: string[];
  onToggle: (tagId: string, on: boolean) => void;
  onCreate: (name: string, color: TagColor) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<TagColor>("blue");
  const [err, setErr] = useState<string | null>(null);
  const available = tags.filter((t) => !selected.includes(t.id));

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setErr(null);
    try {
      await onCreate(name, color);
      setName("");
    } catch (er) {
      setErr(er instanceof Error ? er.message : "Štítek se nepodařilo založit.");
    }
  };

  return (
    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
      <p className="flex items-center gap-1.5 text-sm font-semibold">
        <Tag className="h-4 w-4" /> Štítky
      </p>
      <div className="flex flex-wrap gap-1.5">
        {selected.length === 0 && <span className="text-xs text-muted-foreground">Zatím žádné.</span>}
        {tags
          .filter((t) => selected.includes(t.id))
          .map((t) => (
            <TagChip key={t.id} tag={t} onRemove={() => onToggle(t.id, false)} />
          ))}
      </div>
      {available.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Přidat:</span>
          {available.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onToggle(t.id, true)}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2 py-0.5 text-xs hover:border-primary hover:text-primary"
            >
              <span className={`h-2 w-2 rounded-full ${TAG_DOT[t.color]}`} /> {t.name}
            </button>
          ))}
        </div>
      )}
      <form onSubmit={create} className="flex flex-wrap items-center gap-2">
        <Input
          value={name}
          maxLength={40}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nový štítek, např. VIP"
          className="h-9 w-48"
          aria-label="Název nového štítku"
        />
        <span className="flex gap-1" role="radiogroup" aria-label="Barva štítku">
          {(Object.keys(TAG_DOT) as TagColor[]).map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={color === c}
              aria-label={c}
              onClick={() => setColor(c)}
              className={`h-6 w-6 rounded-full ${TAG_DOT[c]} ${color === c ? "ring-2 ring-foreground ring-offset-2" : ""}`}
            />
          ))}
        </span>
        <Button type="submit" size="sm" variant="outline" className="rounded-[10px]" disabled={!name.trim()}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Založit a přidat
        </Button>
        {err && <span className="text-xs text-destructive">{err}</span>}
      </form>
    </div>
  );
}
