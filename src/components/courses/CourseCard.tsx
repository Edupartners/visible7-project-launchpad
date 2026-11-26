import { Link } from "react-router-dom";
import { Check, Sparkles } from "lucide-react";
import type { BlockVideoRow } from "@/lib/blockVideos";
import { FeaturedCourse, hoursLabel, lessonsLabel, videoMinutes } from "@/lib/courses";

/** Karta kurzu jako v katalogu LMS: obrázek, název, lektor, délka, postup a tlačítko (stejně jako typy byznysu v bráně 4). */
export const CourseCard = ({
  course,
  videos,
  watched,
  recommended = false,
  price,
}: {
  course: FeaturedCourse;
  videos: BlockVideoRow[];
  watched: Set<string>;
  recommended?: boolean;
  /** Cena samostatného kurzu, když ho uživatel nemá v členství (např. „1 490 Kč“). */
  price?: string;
}) => {
  const minutes = videos.reduce((s, v) => s + videoMinutes(v), 0);
  const seen = videos.filter((v) => watched.has(v.id)).length;
  const done = videos.length > 0 && seen === videos.length;
  return (
    <Link
      to={`/kurz/${course.id}`}
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-lg ${
        recommended ? "border-transparent ring-[3px] ring-leaf-500" : "border-border"
      }`}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        <img
          src={course.cover}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {recommended && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-leaf-500 px-2.5 py-1 text-xs font-bold text-white">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Hodí se k vašemu projektu
          </span>
        )}
        {done && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-leaf-700">
            <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" /> Hotovo
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-bold leading-snug">{course.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{course.lecturer}</p>
        <p className="mt-auto pt-3 text-sm text-muted-foreground">
          {lessonsLabel(videos.length)}
          {minutes > 0 ? ` · ${hoursLabel(minutes)}` : ""}
        </p>
        {price && <p className="mt-1 text-sm font-semibold text-leaf-700">Samostatně za {price}</p>}
        {seen > 0 && !done && (
          <div className="mt-3">
            <p className="text-sm font-semibold">Hotovo {Math.round((seen / videos.length) * 100)} %</p>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-leaf-500" style={{ width: `${(seen / videos.length) * 100}%` }} />
            </div>
          </div>
        )}
        <span
          className={`mt-4 inline-flex h-10 items-center justify-center rounded-xl text-sm font-bold transition-colors ${
            recommended || seen > 0
              ? "bg-primary text-white group-hover:bg-primary/90"
              : "border border-border text-foreground group-hover:bg-muted"
          }`}
        >
          {done ? "Pustit znovu" : seen > 0 ? "Pokračovat" : "Otevřít kurz"}
        </span>
      </div>
    </Link>
  );
};
