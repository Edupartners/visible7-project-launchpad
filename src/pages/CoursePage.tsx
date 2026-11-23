import { Link, Navigate, useParams } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";
import { SidebarLayout } from "@/components/layout/AppSidebar";
import { VideoPlaylist } from "@/components/BlockVideo";
import type { BuildBlock } from "@/lib/buildPlans";
import { useAllBlockVideos } from "@/lib/blockVideos";
import { courseById, courseGate, courseVideos, hoursLabel, lessonsLabel, videoMinutes } from "@/lib/courses";
import { GATE_MAIN } from "@/lib/resume";
import { GATE_NAMES } from "@/lib/certificates";

/** Jeden kurz jako celek: všechny lekce za sebou v jednom přehrávači. */
export default function CoursePage() {
  const { courseId = "" } = useParams();
  const course = courseById(courseId);
  const { videos: all, watched, ready } = useAllBlockVideos();
  if (!course) return <Navigate to="/home" replace />;
  const gate = courseGate(course);
  const videos = courseVideos(course, all);
  const minutes = videos.reduce((s, v) => s + videoMinutes(v), 0);
  const block = { id: `kurz_${course.id}`, title: course.title } as BuildBlock;
  const area = course.keys[0]?.split(":")[0] === "tvorba" ? "tvorba" : "marketing";

  return (
    <SidebarLayout>
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-8">
        {gate && (
          <Link
            to={GATE_MAIN[gate]}
            className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Brána {gate}: {GATE_NAMES[gate]}
          </Link>
        )}
        <header>
          <p className="text-sm font-semibold text-leaf-700">Kurz · {course.lecturer}</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">{course.title}</h1>
          <p className="mt-2 text-muted-foreground">
            {lessonsLabel(videos.length)}
            {minutes > 0 ? ` · ${hoursLabel(minutes)}` : ""}. Lekce jdou za sebou, můžete ale začít kdekoli.
          </p>
        </header>
        {!ready ? (
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        ) : videos.length ? (
          <VideoPlaylist block={block} area={area} videos={videos} watched={watched} />
        ) : (
          <p className="text-muted-foreground">Lekce připravujeme.</p>
        )}
      </main>
    </SidebarLayout>
  );
}
