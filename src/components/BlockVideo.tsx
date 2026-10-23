import { track } from "@/lib/track";
import { useEffect, useRef, useState } from "react";
import { Check, PlayCircle, Video } from "lucide-react";
import type { BuildBlock } from "@/lib/buildPlans";
import {
  BlockArea,
  BlockVideoRow,
  blockKey,
  setWatched,
  useBlockVideos,
  videosLabel,
  vimeoSrc,
} from "@/lib/blockVideos";

const PLACEHOLDER_BG = "bg-gradient-to-br from-[hsl(163_70%_13%)] to-[hsl(156_45%_24%)]";
const POSTER_BG = "bg-gradient-to-br from-[hsl(163_70%_13%)] to-[hsl(28_58%_38%)]";

/** Video ke kartě z Vimea. Videa vložená v administraci mají přednost (seznam se zhlédnutím). */
export const BlockVideo = ({ block, area }: { block: BuildBlock; area: BlockArea }) => {
  const key = blockKey(area, block.id);
  const { videos, watched } = useBlockVideos(key);
  if (videos.length > 0) return <VideoPlaylist block={block} videos={videos} watched={watched} />;
  return <SingleVideo block={block} />;
};

function PlayerFrame({ video, title, onEnded }: { video: BlockVideoRow; title: string; onEnded: () => void }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const ended = useRef(onEnded);
  ended.current = onEnded;
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== "https://player.vimeo.com" || e.source !== ref.current?.contentWindow) return;
      let d: { event?: string } | null = null;
      try {
        d = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      if (d?.event === "ready")
        ref.current?.contentWindow?.postMessage(
          JSON.stringify({ method: "addEventListener", value: "ended" }),
          "https://player.vimeo.com",
        );
      if (d?.event === "ended") ended.current();
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);
  return (
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
  );
}

function VideoPlaylist({
  block,
  videos,
  watched,
}: {
  block: BuildBlock;
  videos: BlockVideoRow[];
  watched: Set<string>;
}) {
  const firstOpen = videos.find((v) => !watched.has(v.id)) ?? videos[0];
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [play, setPlay] = useState(false);
  const current = videos.find((v) => v.id === currentId) ?? firstOpen;
  const idx = videos.indexOf(current);
  const seen = videos.filter((v) => watched.has(v.id)).length;
  const total = videos.reduce((s, v) => s + (v.minutes ?? 0), 0);

  const start = (v: BlockVideoRow) => {
    track("video_play", { where: "block", block: block.id, video: v.vimeo_id });
    setCurrentId(v.id);
    setPlay(true);
  };

  return (
    <div className="min-w-0 space-y-3">
      {play ? (
        <PlayerFrame video={current} title={current.title} onEnded={() => setWatched(current.id, true)} />
      ) : (
        <button
          type="button"
          onClick={() => start(current)}
          className={`group relative flex aspect-video w-full flex-col items-center justify-center rounded-xl px-6 text-center text-white ${POSTER_BG}`}
          aria-label={`Přehrát video: ${current.title}`}
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-primary shadow-lg transition-transform group-hover:scale-110">
            <PlayCircle className="h-9 w-9" />
          </span>
          <span className="mt-3 line-clamp-2 font-semibold">
            {videos.length > 1 && <span className="text-white/60">{idx + 1}. </span>}
            {current.title}
          </span>
          {current.minutes && (
            <span className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-0.5 text-xs font-semibold">
              {current.minutes} min
            </span>
          )}
        </button>
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
