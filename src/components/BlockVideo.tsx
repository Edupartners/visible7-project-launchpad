import { track } from "@/lib/track";
import { useEffect, useRef, useState } from "react";
import { Check, ListVideo, Play, PlayCircle, SkipForward, Video } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { BuildBlock } from "@/lib/buildPlans";
import {
  BlockArea,
  BlockVideoRow,
  blockKey,
  fmtTime,
  setWatched,
  useAllBlockVideos,
  useBlockVideos,
  videosLabel,
  vimeoSrc,
} from "@/lib/blockVideos";
import { lectureName, videoCover } from "@/lib/videoCovers";
import { useDeepLinkLesson } from "@/lib/deepLink";

const PLACEHOLDER_BG = "bg-gradient-to-br from-[hsl(216_62%_22%)] to-[hsl(216_45%_32%)]";
const POSTER_BG = "bg-gradient-to-br from-[hsl(216_62%_22%)] to-[hsl(28_58%_38%)]";

/** Video ke kartě z Vimea. Videa vložená v administraci mají přednost (seznam se zhlédnutím). */
export const BlockVideo = ({ block, area }: { block: BuildBlock; area: BlockArea }) => {
  const key = blockKey(area, block.id);
  const { videos, watched } = useBlockVideos(key);
  if (videos.length > 0) return <VideoPlaylist block={block} area={area} videos={videos} watched={watched} />;
  return <SingleVideo block={block} />;
};

/** Náhled před spuštěním: fotka karty (když je), přes ni název dílu a tlačítko přehrát. */
function Poster({
  cover,
  title,
  label,
  minutes,
  onPlay,
}: {
  cover: string | null;
  title: string;
  label: string;
  minutes: number | null | undefined;
  onPlay: () => void;
}) {
  const [broken, setBroken] = useState(false);
  const img = cover && !broken ? cover : null;
  return (
    <button
      type="button"
      onClick={onPlay}
      className={`group relative block aspect-video w-full overflow-hidden rounded-xl text-left text-white ${POSTER_BG}`}
      aria-label={`Přehrát video: ${title}`}
    >
      {img && (
        <img
          src={img}
          alt=""
          loading="lazy"
          onError={() => setBroken(true)}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      )}
      <span
        aria-hidden
        className={`absolute inset-0 ${img ? "bg-gradient-to-r from-black/80 via-black/45 to-black/5" : ""}`}
      />
      <span className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-4 sm:gap-4 sm:p-6">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/95 text-primary shadow-lg transition-transform group-hover:scale-110 sm:h-14 sm:w-14">
          <PlayCircle className="h-7 w-7 sm:h-8 sm:w-8" />
        </span>
        <span className="min-w-0 max-w-xl">
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-white/70">{label}</span>
          <span className="mt-0.5 line-clamp-2 block text-lg font-bold leading-snug [text-shadow:0_1px_8px_rgba(0,0,0,.45)] sm:text-2xl">
            {title}
          </span>
        </span>
      </span>
      {minutes ? (
        <span className="absolute right-3 top-3 rounded-md bg-black/60 px-2 py-0.5 text-xs font-semibold">
          {minutes} min
        </span>
      ) : null}
    </button>
  );
}

type VimeoMsg = { event?: string; data?: { seconds?: number } };

/** Posílání příkazů přehrávači Vimea přes postMessage. */
const vimeoSender = (ref: React.RefObject<HTMLIFrameElement>) => (method: string, value?: unknown) =>
  ref.current?.contentWindow?.postMessage(JSON.stringify({ method, value }), "https://player.vimeo.com");

const parseVimeoMsg = (e: MessageEvent, ref: React.RefObject<HTMLIFrameElement>): VimeoMsg | null => {
  if (e.origin !== "https://player.vimeo.com" || e.source !== ref.current?.contentWindow) return null;
  try {
    return typeof e.data === "string" ? JSON.parse(e.data) : e.data;
  } catch {
    return null;
  }
};

function PlayerFrame({
  video,
  title,
  onEnded,
  onNext,
}: {
  video: BlockVideoRow;
  title: string;
  onEnded: () => void;
  /** Další kapitola v kartě (když je) */
  onNext?: () => void;
}) {
  const ref = useRef<HTMLIFrameElement>(null);
  const ended = useRef(onEnded);
  ended.current = onEnded;
  // Kapitola skončila: nabídnout další kapitolu, nebo pokračovat v záznamu bez zastavení.
  const [paused, setPaused] = useState(false);
  const keepGoing = useRef(false);
  useEffect(() => {
    setPaused(false);
    keepGoing.current = false;
    const end = video.end_sec;
    let done = false;
    const send = vimeoSender(ref);
    const finish = () => {
      if (done) return;
      done = true;
      ended.current();
    };
    const onMsg = (e: MessageEvent) => {
      const d = parseVimeoMsg(e, ref);
      if (!d) return;
      if (d.event === "ready") {
        send("addEventListener", "ended");
        if (end) send("addEventListener", "timeupdate");
      }
      if (d.event === "ended") finish();
      if (end && !keepGoing.current && d.event === "timeupdate" && (d.data?.seconds ?? 0) >= end && !done) {
        send("pause");
        finish();
        setPaused(true);
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [video.id, video.end_sec]);
  return (
    <div className="space-y-2">
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
        <iframe
          ref={ref}
          key={video.id}
          src={vimeoSrc(video, true)}
          className="h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title={`Video: ${title}`}
        />
      </div>
      {paused && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-leaf-50 px-3 py-2 text-sm ring-1 ring-leaf-200">
          <span className="mr-auto font-semibold">Kapitola skončila.</span>
          {onNext && (
            <button
              type="button"
              onClick={onNext}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 font-semibold text-primary-foreground"
            >
              Další kapitola <SkipForward className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              keepGoing.current = true;
              setPaused(false);
              vimeoSender(ref)("play");
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 font-semibold"
          >
            Pokračovat v záznamu <Play className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

/** Celý záznam přednášky s rozpisem minut: proklik skočí na čas, video běží dál. */
function LectureDialog({
  video,
  open,
  onOpenChange,
}: {
  video: BlockVideoRow;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { videos } = useAllBlockVideos();
  const ref = useRef<HTMLIFrameElement>(null);
  const [now, setNow] = useState(video.start_sec ?? 0);
  const chapters = Array.from(
    new Map(
      videos
        .filter((v) => v.vimeo_id === video.vimeo_id && v.start_sec != null)
        .sort((a, b) => (a.start_sec ?? 0) - (b.start_sec ?? 0))
        .map((v) => [v.start_sec, v] as const),
    ).values(),
  );
  const name = lectureName(video.vimeo_id);
  useEffect(() => {
    if (!open) return;
    const send = vimeoSender(ref);
    const onMsg = (e: MessageEvent) => {
      const d = parseVimeoMsg(e, ref);
      if (!d) return;
      if (d.event === "ready") send("addEventListener", "timeupdate");
      if (d.event === "timeupdate") setNow(d.data?.seconds ?? 0);
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [open]);
  const activeIdx = chapters.reduce((acc, c, i) => ((c.start_sec ?? 0) <= now + 1 ? i : acc), -1);
  const jump = (sec: number) => {
    const send = vimeoSender(ref);
    send("setCurrentTime", sec);
    send("play");
    setNow(sec);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="pr-8 text-left">
            {name ? `Celý záznam: ${name}` : "Celý záznam přednášky"}
          </DialogTitle>
          <DialogDescription className="text-left">
            Klikněte na kapitolu a záznam skočí na danou minutu. Video běží dál.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
            {open && (
              <iframe
                ref={ref}
                src={vimeoSrc({ ...video, start_sec: video.start_sec }, true)}
                className="h-full w-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title={`Celý záznam: ${name ?? video.title}`}
              />
            )}
          </div>
          <ol className="max-h-[60vh] space-y-0.5 overflow-y-auto lg:max-h-[28rem]" aria-label="Rozpis minut">
            {chapters.map((c, i) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => jump(c.start_sec ?? 0)}
                  aria-current={i === activeIdx ? "true" : undefined}
                  className={`flex w-full gap-3 rounded-lg px-2 py-1.5 text-left text-sm ${
                    i === activeIdx ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  <span className={`w-14 shrink-0 tabular-nums ${i === activeIdx ? "" : "text-muted-foreground"}`}>
                    {fmtTime(c.start_sec ?? 0)}
                  </span>
                  <span className="min-w-0">{c.title}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function VideoPlaylist({
  block,
  area,
  videos,
  watched,
}: {
  block: BuildBlock;
  area: BlockArea;
  videos: BlockVideoRow[];
  watched: Set<string>;
}) {
  const firstOpen = videos.find((v) => !watched.has(v.id)) ?? videos[0];
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [play, setPlay] = useState(false);
  const [lecture, setLecture] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const linked = useDeepLinkLesson(videos.map((v) => v.id));

  // Příchod z hledání: vybrat a spustit konkrétní lekci a posunout se k ní.
  useEffect(() => {
    if (!linked) return;
    setCurrentId(linked);
    setPlay(true);
    const t = setTimeout(() => boxRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
    return () => clearTimeout(t);
  }, [linked]);
  const current = videos.find((v) => v.id === currentId) ?? firstOpen;
  const idx = videos.indexOf(current);
  const seen = videos.filter((v) => watched.has(v.id)).length;
  const total = videos.reduce((s, v) => s + (v.minutes ?? 0), 0);
  const cover = videoCover(blockKey(area, block.id), current.vimeo_id);

  const start = (v: BlockVideoRow) => {
    track("video_play", { where: "block", block: block.id, video: v.vimeo_id });
    setCurrentId(v.id);
    setPlay(true);
  };

  return (
    <div ref={boxRef} className="min-w-0 scroll-mt-24 space-y-3">
      {play ? (
        <PlayerFrame
          video={current}
          title={current.title}
          onEnded={() => setWatched(current.id, true)}
          onNext={idx < videos.length - 1 ? () => start(videos[idx + 1]) : undefined}
        />
      ) : (
        <Poster
          cover={cover}
          title={current.title}
          label={[
            lectureName(current.vimeo_id) && `Přednáška: ${lectureName(current.vimeo_id)}`,
            videos.length > 1 ? `${idx + 1}. díl z ${videos.length}` : block.title,
          ]
            .filter(Boolean)
            .join(" · ")}
          minutes={current.minutes}
          onPlay={() => start(current)}
        />
      )}

      {current.start_sec != null && (
        <>
          <button
            type="button"
            onClick={() => {
              track("lecture_open", { block: block.id, video: current.vimeo_id });
              setPlay(false);
              setLecture(true);
            }}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            <ListVideo className="h-4 w-4" aria-hidden="true" /> Celý záznam přednášky s rozpisem minut
          </button>
          <LectureDialog video={current} open={lecture} onOpenChange={setLecture} />
        </>
      )}

      {videos.length > 1 && (
        <div className="rounded-xl border border-border">
          <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2 text-xs">
            <span className="font-semibold">
              {videosLabel(videos.length)}
              {total > 0 && ` · ${total >= 60 ? `${Math.floor(total / 60)} h ${total % 60} min` : `${total} min`}`}
            </span>
            <span className="tabular-nums text-muted-foreground">
              zhlédnuto {seen}/{videos.length}
            </span>
          </div>
          <div
            className="h-1 bg-primary/10"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={videos.length}
            aria-valuenow={seen}
            aria-label="Zhlédnutá videa"
          >
            <div className="h-full bg-primary transition-all" style={{ width: `${(seen / videos.length) * 100}%` }} />
          </div>
          <ol className="max-h-80 overflow-y-auto py-1">
            {videos.map((v, i) => {
              const isSeen = watched.has(v.id);
              const active = v.id === current.id;
              return (
                <li key={v.id} className={`flex items-center gap-2 px-2 ${active ? "bg-primary/5" : ""}`}>
                  <button
                    type="button"
                    onClick={() => setWatched(v.id, !isSeen)}
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ${
                      isSeen
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground"
                    }`}
                    aria-label={isSeen ? `Zrušit zhlédnuto: ${v.title}` : `Označit jako zhlédnuté: ${v.title}`}
                    aria-pressed={isSeen}
                  >
                    {isSeen ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </button>
                  <button
                    type="button"
                    onClick={() => start(v)}
                    className={`flex min-w-0 flex-1 items-center gap-2 py-2 text-left text-sm ${
                      active ? "font-semibold" : ""
                    } ${isSeen && !active ? "text-muted-foreground" : ""}`}
                  >
                    <span className="min-w-0 flex-1 truncate">{v.title}</span>
                    {v.minutes && (
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{v.minutes} min</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {videos.length === 1 && (
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={watched.has(current.id)}
            onChange={(e) => setWatched(current.id, e.target.checked)}
            className="h-4 w-4 accent-[hsl(var(--primary))]"
          />
          Video jsem zhlédl(a)
        </label>
      )}
    </div>
  );
}

/** Původní jedno video zadané v kódu bloku; dokud není, zobrazí se zástupná plocha. */
function SingleVideo({ block }: { block: BuildBlock }) {
  const [play, setPlay] = useState(false);
  if (!block.vimeoId) {
    return (
      <div
        className={`flex aspect-video w-full flex-col items-center justify-center rounded-xl text-center text-white ${PLACEHOLDER_BG}`}
      >
        <Video className="h-8 w-8 text-white/60" />
        <p className="mt-2 font-semibold">Video k bloku „{block.title}“</p>
        <p className="text-sm text-white/60">připravujeme</p>
      </div>
    );
  }
  const src = `https://player.vimeo.com/video/${block.vimeoId}?dnt=1${block.vimeoHash ? `&h=${block.vimeoHash}` : ""}${play ? "&autoplay=1" : ""}`;
  return play ? (
    <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
      <iframe
        src={src}
        className="h-full w-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title={`Video: ${block.title}`}
      />
    </div>
  ) : (
    <button
      type="button"
      onClick={() => {
        track("video_play", { where: "block", block: block.id });
        setPlay(true);
      }}
      className={`group relative flex aspect-video w-full items-center justify-center rounded-xl ${POSTER_BG}`}
      aria-label={`Přehrát video: ${block.title}`}
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-primary shadow-lg transition-transform group-hover:scale-110">
        <PlayCircle className="h-9 w-9" />
      </span>
      {block.videoMinutes && (
        <span className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">
          {block.videoMinutes} min
        </span>
      )}
    </button>
  );
}
