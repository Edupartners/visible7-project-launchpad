import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Check, Clapperboard, ExternalLink, GripVertical, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  ALL_BLOCKS,
  AREA_NAMES,
  BlockArea,
  BlockVideoRow,
  addVideos,
  deleteVideo,
  loadAdminVideos,
  parseBulk,
  parseVimeo,
  refreshBlockVideos,
  reorderVideos,
  toMinutes,
  updateVideo,
  videosLabel,
} from "@/lib/blockVideos";

const AREAS = Object.keys(AREA_NAMES) as BlockArea[];
const LAST_KEY = "v7_admin_video_block";

/** Správa videí ke kartám: vložit odkaz z Vimea, seřadit, skrýt, smazat. */
export function BlockVideosAdmin() {
  const [all, setAll] = useState<BlockVideoRow[]>([]);
  const [key, setKey] = useState<string>(() => {
    try {
      return localStorage.getItem(LAST_KEY) || "marketing:seo_zaklad";
    } catch {
      return "marketing:seo_zaklad";
    }
  });
  const [link, setLink] = useState("");
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState("");
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulk, setBulk] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editMin, setEditMin] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);

  const load = useCallback(() => {
    loadAdminVideos()
      .then(setAll)
      .catch(() => setMsg("Videa se nepodařilo načíst."));
  }, []);
  useEffect(load, [load]);

  const choose = (k: string) => {
    setKey(k);
    setEditing(null);
    setMsg(null);
    try {
      localStorage.setItem(LAST_KEY, k);
    } catch {
      /* bez úložiště */
    }
  };

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    all.forEach((v) => m.set(v.block_key, (m.get(v.block_key) ?? 0) + 1));
    return m;
  }, [all]);
  const list = useMemo(
    () => all.filter((v) => v.block_key === key).sort((a, b) => a.position - b.position),
    [all, key],
  );
  const parsed = link.trim() ? parseVimeo(link) : null;
  const bulkParsed = useMemo(() => parseBulk(bulk), [bulk]);
  const nextPos = list.reduce((m, v) => Math.max(m, v.position), 0);

  const after = (text: string) => {
    setMsg(text);
    load();
    refreshBlockVideos();
  };

  const run = async (fn: () => Promise<void>, ok: string) => {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
      after(ok);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Uložení se nepodařilo.");
    } finally {
      setBusy(false);
    }
  };

  const addOne = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsed) return;
    run(async () => {
      await addVideos(
        key,
        [
          {
            title: title.trim() || `Video ${parsed.id}`,
            vimeo_id: parsed.id,
            vimeo_hash: parsed.hash,
            minutes: toMinutes(minutes),
          },
        ],
        nextPos,
      );
      setLink("");
      setTitle("");
      setMinutes("");
    }, "Video je přidané na konec seznamu.");
  };

  const addBulk = () =>
    run(
      async () => {
        await addVideos(key, bulkParsed.ok, nextPos);
        setBulk("");
        setBulkOpen(false);
      },
      `Přidáno: ${videosLabel(bulkParsed.ok.length)}.`,
    );

  const saveOrder = (ids: string[]) => {
    // hned ukázat nové pořadí, pak uložit
    setAll((prev) => prev.map((v) => (ids.includes(v.id) ? { ...v, position: ids.indexOf(v.id) + 1 } : v)));
    run(() => reorderVideos(key, ids), "Pořadí je uložené.");
  };

  const move = (id: string, dir: -1 | 1) => {
    const ids = list.map((v) => v.id);
    const i = ids.indexOf(id);
    const j = i + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    saveOrder(ids);
  };

  const dropOn = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const ids = list.map((v) => v.id).filter((id) => id !== dragId);
    ids.splice(ids.indexOf(targetId), 0, dragId);
    setDragId(null);
    saveOrder(ids);
  };

  const startEdit = (v: BlockVideoRow) => {
    setEditing(v.id);
    setEditTitle(v.title);
    setEditMin(v.minutes ? String(v.minutes) : "");
  };

  const current = ALL_BLOCKS.find((b) => b.key === key);

  return (
    <section className="rounded-3xl border border-border bg-card p-5 sm:p-6" id="videa-admin">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <Clapperboard className="h-5 w-5" /> Videa ke kartám
      </h2>
      <p className="text-sm text-muted-foreground">
        Vyberte kartu, vložte odkaz z Vimea a video se na kartě hned ukáže. Pořadí změníte přetažením nebo šipkami –
        nejdřív základy, pak to, co na nich staví. Ve Vimeu musí mít video povolené vkládání na doméně visible7.io.
      </p>

      <label className="mt-4 block space-y-1 text-sm">
        <span className="font-semibold">Karta</span>
        <select
          value={key}
          onChange={(e) => choose(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          {AREAS.map((a) => (
            <optgroup key={a} label={AREA_NAMES[a]}>
              {ALL_BLOCKS.filter((b) => b.area === a).map((b) => (
                <option key={b.key} value={b.key}>
                  {b.title}
                  {counts.get(b.key) ? ` (${counts.get(b.key)})` : ""}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      <form onSubmit={addOne} className="mt-4 grid gap-3 rounded-2xl bg-muted/50 p-4 sm:grid-cols-[2fr_2fr_90px_auto]">
        <label className="space-y-1 text-sm">
          <span className="font-semibold">Odkaz z Vimea</span>
          <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://vimeo.com/1135476364" />
          {link.trim() && (
            <span className={`block text-xs ${parsed ? "text-muted-foreground" : "text-destructive"}`}>
              {parsed
                ? `Video ${parsed.id}${parsed.hash ? " · neveřejné (s klíčem)" : ""}`
                : "Tohle nevypadá jako odkaz na video z Vimea."}
            </span>
          )}
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold">Název</span>
          <Input
            value={title}
            maxLength={160}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Google Search Console"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold">Délka</span>
          <Input value={minutes} onChange={(e) => setMinutes(e.target.value)} placeholder="6:38" />
        </label>
        <div className="flex items-end">
          <Button type="submit" disabled={!parsed || busy} className="w-full">
            Přidat
          </Button>
        </div>
        <button
          type="button"
          onClick={() => setBulkOpen((o) => !o)}
          className="justify-self-start text-sm font-semibold text-primary underline-offset-4 hover:underline sm:col-span-4"
        >
          {bulkOpen ? "Skrýt hromadné vložení" : "Vložit víc videí najednou (třeba z Excelu)"}
        </button>
        {bulkOpen && (
          <div className="space-y-2 sm:col-span-4">
            <Textarea
              rows={6}
              value={bulk}
              onChange={(e) => setBulk(e.target.value)}
              placeholder={
                "Jeden řádek = jedno video: Název | odkaz | délka\nGoogle Search Console | https://vimeo.com/1135476364 | 1:49\nSEO a titulek | https://vimeo.com/1135476918 | 1:43"
              }
            />
            <p className="text-xs text-muted-foreground">
              Můžete zkopírovat sloupce přímo z Excelu (název, odkaz, délka). Videa se přidají na konec v tomto pořadí.
            </p>
            {bulkParsed.bad.length > 0 && (
              <p className="text-xs text-destructive">
                Bez platného odkazu ({bulkParsed.bad.length}): {bulkParsed.bad.slice(0, 3).join(" · ")}
                {bulkParsed.bad.length > 3 ? " …" : ""}
              </p>
            )}
            <Button type="button" onClick={addBulk} disabled={!bulkParsed.ok.length || busy}>
              Přidat {videosLabel(bulkParsed.ok.length)}
            </Button>
          </div>
        )}
      </form>

      {msg && (
        <p className="mt-3 text-sm font-semibold" role="status">
          {msg}
        </p>
      )}

      <div className="mt-4">
        <p className="text-sm font-bold">
          {current ? `${current.title} · ${AREA_NAMES[current.area]}` : key} – {list.length}{" "}
          {list.length === 1 ? "video" : list.length >= 2 && list.length <= 4 ? "videa" : "videí"}
        </p>
        {list.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Karta zatím nemá žádné video.</p>
        ) : (
          <ol className="mt-2 divide-y divide-border rounded-2xl border border-border">
            {list.map((v, i) => (
              <li
                key={v.id}
                draggable={editing !== v.id}
                onDragStart={() => setDragId(v.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => dropOn(v.id)}
                onDragEnd={() => setDragId(null)}
                className={`flex flex-wrap items-center gap-2 px-3 py-2 text-sm ${dragId === v.id ? "opacity-40" : ""} ${
                  v.published ? "" : "bg-muted/40"
                }`}
              >
                <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground" aria-hidden />
                <span className="w-6 shrink-0 text-right tabular-nums text-muted-foreground">{i + 1}.</span>
                {editing === v.id ? (
                  <>
                    <Input
                      value={editTitle}
                      maxLength={160}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="h-8 min-w-0 flex-1"
                      aria-label="Název videa"
                    />
                    <Input
                      value={editMin}
                      onChange={(e) => setEditMin(e.target.value)}
                      className="h-8 w-20"
                      placeholder="min"
                      aria-label="Délka"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      aria-label="Uložit"
                      onClick={() =>
                        run(async () => {
                          await updateVideo(v.id, { title: editTitle.trim() || v.title, minutes: toMinutes(editMin) });
                          setEditing(null);
                        }, "Uloženo.")
                      }
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      aria-label="Zrušit"
                      onClick={() => setEditing(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span
                      className={`min-w-0 flex-1 truncate ${v.published ? "" : "text-muted-foreground line-through"}`}
                    >
                      {v.title}
                    </span>
                    {v.minutes && (
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{v.minutes} min</span>
                    )}
                    <div className="flex shrink-0 items-center gap-0.5">
                      <a
                        href={`https://vimeo.com/${v.vimeo_id}${v.vimeo_hash ? `/${v.vimeo_hash}` : ""}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                        aria-label={`Otevřít ve Vimeu: ${v.title}`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        aria-label="Výš"
                        disabled={i === 0 || busy}
                        onClick={() => move(v.id, -1)}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        aria-label="Níž"
                        disabled={i === list.length - 1 || busy}
                        onClick={() => move(v.id, 1)}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        aria-label="Upravit"
                        onClick={() => startEdit(v)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Switch
                        checked={v.published}
                        onCheckedChange={(on) =>
                          run(() => updateVideo(v.id, { published: on }), on ? "Video je vidět." : "Video je skryté.")
                        }
                        aria-label={v.published ? "Skrýt video" : "Zobrazit video"}
                        className="mx-1"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive"
                        aria-label="Smazat"
                        onClick={() => {
                          if (window.confirm(`Smazat video „${v.title}“?`))
                            run(() => deleteVideo(v.id), "Video je smazané.");
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
