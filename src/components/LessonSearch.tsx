import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, PlayCircle, Search } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useProject } from "@/contexts/ProjectContext";
import { useAllBlockVideos } from "@/lib/blockVideos";
import { buildDocs, loadTranscripts, searchLessons, type TranscriptIndex } from "@/lib/lessonSearch";
import { track } from "@/lib/track";

const EXAMPLES = ["jak nahodit GA4", "konverze přes Tag Manager", "první kampaň na Facebooku", "doprava v Shoptetu", "SEO pro AI"];

const minutesLabel = (m: number | null) => (m ? `${m} min` : "");

/** Tlačítko v hlavičce + okno hledání v lekcích (otevře i Ctrl/⌘ + K). */
export const LessonSearch = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-11 items-center gap-2.5 rounded-xl border-2 border-signal bg-signal/10 px-2.5 text-[15px] font-semibold text-foreground shadow-[0_0_0_4px_hsl(var(--signal)/0.18)] transition-colors hover:bg-signal/30 sm:w-72 sm:px-4 xl:w-96"
        aria-label="Najít návod v lekcích"
      >
        <Search className="h-5 w-5 shrink-0 text-signal-foreground" strokeWidth={2.5} />
        <span className="hidden sm:inline">Najít návod…</span>
        <kbd className="ml-auto hidden rounded border border-signal bg-white px-1.5 text-[10px] font-semibold sm:inline">
          Ctrl K
        </kbd>
      </button>
      {open && <SearchDialog onClose={() => setOpen(false)} />}
    </>
  );
};

function SearchDialog({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { currentProject } = useProject();
  const { videos, watched, ready } = useAllBlockVideos();
  const [q, setQ] = useState("");
  const [transcripts, setTranscripts] = useState<TranscriptIndex | null>(null);

  useEffect(() => {
    loadTranscripts().then(setTranscripts);
  }, []);

  const docs = useMemo(
    () => buildDocs(videos, transcripts, currentProject?.business_type),
    [videos, transcripts, currentProject?.business_type],
  );
  const hits = useMemo(() => searchLessons(docs, q), [docs, q]);

  useEffect(() => {
    if (q.trim().length < 3) return;
    const t = setTimeout(() => track("lesson_search", { q: q.trim().slice(0, 80), results: hits.length }), 1200);
    return () => clearTimeout(t);
  }, [q, hits.length]);

  const go = (href: string, title: string) => {
    track("lesson_search_open", { q: q.trim().slice(0, 80), lesson: title.slice(0, 80) });
    onClose();
    navigate(href);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="top-[12%] max-w-2xl translate-y-0 gap-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">Najít návod v lekcích</DialogTitle>
        <Command shouldFilter={false} className="[&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-14 [&_[cmdk-input]]:text-base">
          <CommandInput
            value={q}
            onValueChange={setQ}
            placeholder="Co potřebujete vyřešit? Např. jak nahodit GA4"
            autoFocus
          />
          <CommandList className="max-h-[60vh]">
            {q.trim() === "" ? (
              <div className="space-y-3 p-4">
                <p className="text-sm text-muted-foreground">
                  Hledáte v {docs.length || "stovkách"} krátkých lekcích. Napište vlastními slovy, co řešíte, a otevřete
                  přímo tu kapitolu, kterou potřebujete.
                </p>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLES.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setQ(e)}
                      className="v7-para-sm bg-muted px-3 py-1 text-sm hover:bg-signal hover:text-signal-foreground"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <CommandEmpty>
                  {ready ? "Na tohle zatím lekci nemáme. Zkuste jiné slovo, nebo se zeptejte poradce." : "Načítám lekce…"}
                </CommandEmpty>
                {hits.length > 0 && (
                  <CommandGroup heading={`Lekce (${hits.length}${hits.length === 30 ? "+" : ""})`}>
                    {hits.map((h) => {
                      const seen = watched.has(h.video.id);
                      return (
                        <CommandItem
                          key={h.video.id}
                          value={h.video.id}
                          onSelect={() => go(h.href, h.video.title)}
                          className="items-start gap-3 py-3"
                        >
                          {seen ? (
                            <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                          ) : (
                            <PlayCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="block font-semibold leading-snug">{h.video.title}</span>
                            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                              {[h.place, h.cardTitle, h.lecture].filter(Boolean).join(" · ")}
                            </span>
                          </span>
                          <span className="shrink-0 pt-0.5 text-xs tabular-nums text-muted-foreground">
                            {minutesLabel(h.video.minutes)}
                          </span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
