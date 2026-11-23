import { Link } from "react-router-dom";
import { Check, Sparkles } from "lucide-react";
import type { BlockVideoRow } from "@/lib/blockVideos";
import { FeaturedCourse, hoursLabel, lessonsLabel, videoMinutes } from "@/lib/courses";

/** Karta kurzu jako v katalogu LMS: obrázek, název, lektor, délka a kolik máte zhlédnuto. */
export const CourseCard = ({
  course,
  videos,
  watched,
  recommended = false,
}: {
  course: FeaturedCourse;
  videos: BlockVideoRow[];
  watched: Set<string>;
  recommended?: boolean;
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
        {seen > 0 && !done && (
          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
            aria-label={`Zhlédnuto ${seen} z ${videos.length}`}
          >
            <div className="h-full bg-leaf-500" style={{ width: `${(seen / videos.length) * 100}%` }} />
          </div>
        )}
      </div>
    </Link>
  );
};
