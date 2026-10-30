import { Award, BadgeCheck, GraduationCap, PlayCircle, Users, UserCheck } from "lucide-react";
import { NSK_QUALIFICATION } from "@/lib/qualification";
import { hoursFloor10, useCourseHours } from "@/lib/courses";

/** Úzký pás důvěry pod hero. Jen doložitelná tvrzení; loga partnerů až se souhlasem dané firmy. */
export const TrustBand = () => {
  const { totalHours } = useCourseHours();
  const items = [
    {
      icon: BadgeCheck,
      strong: "Autorizace MPO",
      rest: `zkouška profesní kvalifikace ${NSK_QUALIFICATION.code.replace(/-/g, "\u2011")}`,
      href: NSK_QUALIFICATION.url,
    },
    { icon: GraduationCap, strong: "Akreditace MŠMT", rest: "rekvalifikační kurzy Edu Partners" },
    { icon: Award, strong: "Od roku 2011", rest: "učíme podnikat (Edu Partners)" },
    { icon: Users, strong: "1 000+ absolventů", rest: "kurzů podnikání" },
    { icon: UserCheck, strong: "16+ poradců", rest: "seniorních, z praxe" },
    { icon: PlayCircle, strong: `Přes ${hoursFloor10(totalHours)} hodin videí`, rest: "od lektorů z praxe" },
  ];
  return (
    <section aria-label="Proč nám věřit" className="border-y border-border bg-background px-4 py-5 sm:px-8">
      <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 xl:grid-cols-6">
        {items.map(({ icon: Icon, strong, rest, href }) => {
          const body = (
            <>
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-leaf-600" aria-hidden="true" />
              <span className="leading-tight">
                <span className="block text-sm font-bold text-primary">{strong}</span>
                <span className="block text-xs text-muted-foreground">{rest}</span>
              </span>
            </>
          );
          return (
            <li key={strong}>
              {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="flex gap-2.5 hover:underline">
                  {body}
                </a>
              ) : (
                <span className="flex gap-2.5">{body}</span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};
