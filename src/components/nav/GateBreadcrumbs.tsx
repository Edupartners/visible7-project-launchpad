import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GATE_NAMES } from "@/lib/certificates";
import { GATE_MAIN, gateOfPath } from "@/lib/resume";
import { buildType } from "@/lib/buildPlans";
import { channelById } from "@/lib/marketingPlans";
import { useProject } from "@/contexts/ProjectContext";

/** Drobečková navigace na stránkách bran: Moje cesta › Brána N › detail. Na mobilu jen „‹ Brána N“. */
export const GateBreadcrumbs = () => {
  const { pathname } = useLocation();
  const { currentProject } = useProject();
  const gate = gateOfPath(pathname);
  if (!gate) return null;
  const main = GATE_MAIN[gate];
  const onMain = pathname === main;

  let detail: { label: string; note?: string } | null = null;
  const typeId = pathname.match(/^\/business-type\/([^/]+)/)?.[1];
  const channelId = pathname.match(/^\/marketing-channel\/([^/]+)/)?.[1];
  if (typeId) {
    const t = buildType(typeId);
    const mine = currentProject?.business_type;
    detail = {
      label: t?.name ?? "Model",
      note: mine ? (mine === typeId ? "váš model" : "jiný model") : undefined,
    };
  } else if (channelId) {
    detail = { label: channelById(channelId)?.name ?? "Kanál" };
  }

  const gateLabel = `Brána ${gate}: ${GATE_NAMES[gate]}`;
  return (
    <nav aria-label="Kde jste" className="text-sm">
      {/* Mobil: jen krok zpět */}
      <Link
        to={onMain ? "/home" : main}
        className="inline-flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground sm:hidden"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" /> {onMain ? "Moje cesta" : `Brána ${gate}`}
      </Link>
      <ol className="hidden flex-wrap items-center gap-1.5 text-muted-foreground sm:flex">
        <li>
          <Link to="/home" className="font-semibold hover:text-foreground hover:underline">
            Moje cesta
          </Link>
        </li>
        <li aria-hidden="true">
          <ChevronRight className="h-4 w-4" />
        </li>
        <li>
          {onMain ? (
            <span aria-current="page" className="font-semibold text-foreground">
              {gateLabel}
            </span>
          ) : (
            <Link to={main} className="font-semibold hover:text-foreground hover:underline">
              {gateLabel}
            </Link>
          )}
        </li>
        {detail && (
          <>
            <li aria-hidden="true">
              <ChevronRight className="h-4 w-4" />
            </li>
            <li aria-current="page" className="font-semibold text-foreground">
              {detail.label}
              {detail.note && (
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-xs font-bold ${
                    detail.note === "váš model" ? "bg-leaf-50 text-leaf-800" : "bg-amber-100 text-amber-900"
                  }`}
                >
                  {detail.note}
                </span>
              )}
            </li>
          </>
        )}
      </ol>
    </nav>
  );
};
