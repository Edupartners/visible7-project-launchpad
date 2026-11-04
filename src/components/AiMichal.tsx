import { ADVISORS } from "@/lib/advisors";

/** Jméno AI asistenta v aplikaci. Vždy s „AI“, aby bylo jasné, že neodpovídá Michal osobně (AI Act, transparentnost). */
export const AI_NAME = "AI Michal";

const photo = ADVISORS.find((a) => a.name.includes("Míček"))?.photo;

/** Malý avatar s fotkou a štítkem AI. */
export const AiMichalAvatar = ({ size = 40 }: { size?: number }) => (
  <span className="relative inline-flex shrink-0" style={{ width: size, height: size }} aria-hidden="true">
    {photo ? (
      <img src={photo} alt="" className="h-full w-full rounded-full bg-muted object-cover object-top" />
    ) : (
      <span className="h-full w-full rounded-full bg-primary" />
    )}
    <span className="absolute -bottom-1 -right-1 rounded-full bg-signal px-1.5 text-[10px] font-extrabold leading-4 text-signal-foreground ring-2 ring-background">
      AI
    </span>
  </span>
);

/** Vysvětlivka pod nadpisem: kdo je AI Michal. */
export const AiMichalNote = () => (
  <p className="text-xs text-muted-foreground">
    AI asistent naučený na metodice Michala Míčka. Odpovídá umělá inteligence, ne Michal osobně.
  </p>
);
