import { Link } from "react-router-dom";
import { Award, Clock, Loader2, Lock, PlayCircle } from "lucide-react";
import { SidebarLayout } from "@/components/layout/AppSidebar";
import { PromoToggle } from "@/components/access/Locks";
import { useAuth } from "@/components/AuthGate";
import { useAccess } from "@/lib/access";
import { useAllBlockVideos } from "@/lib/blockVideos";
import { useCourseAccess } from "@/lib/courseAccess";
import { type FeaturedCourse, courseVideos, hoursLabel, lessonsLabel, videoMinutes } from "@/lib/courses";
import { courseCheckoutUrl, courseDays, coursePrice, kc, nbsp, useShop } from "@/lib/shop";
import { track } from "@/lib/track";

const fmtMin = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h ${Math.round(m % 60)} min` : `${Math.round(m)} min`);

/**
 * Obal kurzu, který jde koupit i samostatně: pustí dovnitř s členstvím (nebo zkušebním přístupem)
 * i s koupeným kurzem. Jinak ukáže kurz jako v katalogu (obrázek, lektor, osnova) a nabídne koupi.
 */
export function CourseLock({ course, children }: { course: FeaturedCourse; children: React.ReactNode }) {
  const access = useAccess();
  const own = useCourseAccess();
  const shop = useShop();
  const { user } = useAuth();
  const { videos: all, ready } = useAllBlockVideos();

  if (access.loading || own.loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  if (access.full || own.courses[course.id]) return <>{children}</>;

  const url = courseCheckoutUrl(shop, course.id);
  const videos = courseVideos(course, all);
  const minutes = videos.reduce((s, v) => s + videoMinutes(v), 0);
  const months = Math.round(courseDays(shop) / 30.4);

  return (
    <SidebarLayout>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
        <Link to="/kurzy" className="text-sm font-semibold text-muted-foreground hover:text-foreground">
          ← E-learning
        </Link>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start">
          <div>
            <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
              <img src={course.cover} alt="" className="h-full w-full object-cover" />
            </div>
            <p className="mt-5 text-sm font-semibold text-leaf-700">Kurz · {course.lecturer}</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">{course.title}</h1>
            <p className="mt-2 text-muted-foreground">
              {lessonsLabel(videos.length)}
              {minutes > 0 ? ` · ${hoursLabel(minutes)}` : ""}. Po zhlédnutí všech lekcí si vystavíte osvědčení o
              absolvování.
            </p>

            <h2 className="mt-8 text-lg font-bold">Osnova kurzu</h2>
            {!ready ? (
              <Loader2 className="mt-3 h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <ol className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                {videos.map((v, i) => (
                  <li key={v.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                    <span className="w-6 shrink-0 text-right font-semibold text-muted-foreground">{i + 1}</span>
                    <PlayCircle className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="min-w-0 flex-1">{v.title}</span>
                    <span className="shrink-0 text-muted-foreground">
                      {videoMinutes(v) > 0 ? fmtMin(videoMinutes(v)) : ""}
                    </span>
                    <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-label="Zamčeno" />
                  </li>
                ))}
              </ol>
            )}
          </div>

          <aside className="rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-20">
            {url ? (
              <>
                <p className="text-sm font-semibold text-muted-foreground">Tento kurz samostatně</p>
                <p className="mt-1 text-3xl font-extrabold tracking-tight">{nbsp(kc(coursePrice(shop)))}</p>
                <ul className="mt-3 space-y-1.5 text-sm">
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-leaf-700" aria-hidden="true" /> Přístup na {months} měsíců
                  </li>
                  <li className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-leaf-700" aria-hidden="true" /> Osvědčení o absolvování
                  </li>
                </ul>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("checkout_click", { source: `kurz:${course.id}`, price: coursePrice(shop) })}
                  className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-bold text-white hover:bg-primary/90"
                >
                  Koupit kurz
                </a>
                {user?.email && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Při platbě zadejte e-mail {user.email}. Kurz se odemkne sám, pak stačí obnovit stránku.
                  </p>
                )}
                <div className="mt-5 border-t border-border pt-4 text-sm">
                  <p className="text-muted-foreground">
                    Nebo všechny kurzy, 7 bran a semináře v členství za {nbsp(kc(shop.price))} na rok.
                  </p>
                  <Link to="/cenik" className="mt-1 inline-block font-semibold text-leaf-700 hover:underline">
                    Zobrazit členství
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-muted-foreground">V ceně členství</p>
                <p className="mt-1 text-3xl font-extrabold tracking-tight">{nbsp(kc(shop.price))}</p>
                <p className="text-sm text-muted-foreground">na rok, se všemi kurzy a 7 branami</p>
                <Link
                  to="/cenik"
                  className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-bold text-white hover:bg-primary/90"
                >
                  Zobrazit členství
                </Link>
              </>
            )}
            <PromoToggle onDone={access.refresh} />
          </aside>
        </div>
      </main>
    </SidebarLayout>
  );
}
