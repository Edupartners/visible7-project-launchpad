import { useState } from "react";
import { PlayCircle, Video } from "lucide-react";
import type { BuildBlock } from "@/lib/buildPlans";

/** Video k bloku z Vimea; dokud není, zobrazí se zástupná plocha. */
export const BlockVideo = ({ block }: { block: BuildBlock }) => {
  const [play, setPlay] = useState(false);
  if (!block.vimeoId) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(216_62%_22%)] to-[hsl(216_45%_32%)] text-center text-white">
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
      onClick={() => setPlay(true)}
      className="group relative flex aspect-video w-full items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(216_62%_22%)] to-[hsl(28_58%_38%)]"
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
};
