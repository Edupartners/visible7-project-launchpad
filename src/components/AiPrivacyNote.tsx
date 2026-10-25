import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

/**
 * Drobná věta u AI tlačítek: co se odesílá a že se na tom AI neučí.
 * `idea` = varianta u prvního popisu nápadu (rentgen), s tipem nepsat citlivé údaje.
 */
export const AiPrivacyNote = ({ idea, className = "" }: { idea?: boolean; className?: string }) => (
  <p className={`flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground ${className}`}>
    <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
    <span>
      {idea
        ? "Váš nápad vidíte jen vy. Stačí ho popsat obecně, jména a citlivé údaje sem psát nemusíte. AI se na něm neučí."
        : "AI dostane jen údaje z tohoto projektu, bez vašeho jména a e-mailu, a neučí se na nich."}{" "}
      <Link to="/bezpecnost" className="font-semibold underline underline-offset-2 hover:text-foreground">
        Jak chráníme data
      </Link>
    </span>
  </p>
);
