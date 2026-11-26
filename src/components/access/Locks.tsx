import { Link, useNavigate } from "react-router-dom";
import { Award, Check, FileSpreadsheet, FileText, Gift, Globe2, Loader2, Lock } from "lucide-react";
import { SidebarLayout } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { GATE_NAMES } from "@/lib/certificates";
import { FREE_GATES, TRIAL_OFFER, useAccess } from "@/lib/access";
import { PromoRedeem } from "./PromoRedeem";
import { useState } from "react";
import { useAuth } from "@/components/AuthGate";
import { useCourseAccess } from "@/lib/courseAccess";
import { courseCheckoutUrl, courseDays, coursePrice, kc, nbsp, useShop } from "@/lib/shop";
import { track } from "@/lib/track";

/** Co nabídnout uživateli bez přístupu: kvíz za 3 dny zdarma (jednou) a ceník. */
const UnlockOptions = ({ trialUsed }: { trialUsed: boolean }) => {
  const navigate = useNavigate();
  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
      {TRIAL_OFFER && !trialUsed && (
        <Button
          onClick={() => navigate("/kviz")}
          className="v7-trap-btn v7-phi-sm h-12 pl-6 pr-12 text-base font-bold text-signal-foreground"
        >
          <Gift className="mr-2 h-5 w-5" /> Jaký jste typ podnikatele? 3 dny zdarma
        </Button>
      )}
      <Link
        to="/cenik"
        className={`inline-flex h-12 items-center justify-center rounded-[10px] px-6 text-base font-semibold ${
          trialUsed || !TRIAL_OFFER
            ? "v7-trap-btn v7-phi-sm pr-9 font-bold text-signal-foreground"
            : "border-2 border-white/40 text-white hover:bg-white/10"
        }`}
      >
        Zobrazit ceník
      </Link>
    </div>
  );
};

/** Odkaz „Mám promo kód“, který rozbalí pole pro zadání kódu. */
const PromoToggle = ({ dark = false, onDone }: { dark?: boolean; onDone: () => void }) => {
  const [open, setOpen] = useState(false);
  return open ? (
    <div className="mt-5">
      <PromoRedeem dark={dark} onDone={onDone} />
    </div>
  ) : (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={`mt-4 text-sm font-semibold underline-offset-4 hover:underline ${dark ? "text-white/80" : "text-primary"}`}
    >
      Mám promo kód
    </button>
  );
};

const Spinner = () => (
  <div className="flex min-h-screen items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
);

/** Obal stránky brány 3–7: bez přístupu ukáže, jak bránu odemknout. Data projektu zůstávají. */
export const GateLock = ({ gate, children }: { gate: number; children: React.ReactNode }) => {
  const access = useAccess();
  if (FREE_GATES.includes(gate)) return <>{children}</>;
  if (access.loading) return <Spinner />;
  if (access.full) return <>{children}</>;
  return (
    <SidebarLayout>
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-8">
        <div className="rounded-3xl bg-primary p-8 text-white sm:p-10">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <Lock className="h-7 w-7 text-orange-300" />
          </span>
          <p className="mt-6 font-semibold text-orange-300">Brána {gate} ze 7</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{GATE_NAMES[gate]} je v plném přístupu</h1>
          <p className="mt-3 text-lg text-white/80">
            Brány, e-learning a AI pomocníka odemkne členství VISIBLE7. Vaše vstupní diagnostika je uložená a čeká na
            vás.
          </p>
          <ul className="mt-6 space-y-2 text-white/90">
            {[
              "Všech 7 bran a e-learning",
              "Byznys case, plán tvorby, marketing, spuštění a růst",
              "4 vybrané živé semináře v ceně",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" strokeWidth={3} /> {t}
              </li>
            ))}
          </ul>
          <UnlockOptions trialUsed={access.trialUsed} />
          <PromoToggle dark onDone={access.refresh} />
        </div>
      </main>
    </SidebarLayout>
  );
};

const PREMIUM_COPY = {
  excel: { icon: FileSpreadsheet, title: "Export do Excelu je v placeném přístupu" },
  pitch: { icon: FileText, title: "Pitch na A4 je v placeném přístupu" },
  certificate: { icon: Award, title: "Osvědčení za brány 3–7 je v placeném přístupu" },
  market: { icon: Globe2, title: "Velikost trhu je v placeném přístupu" },
};

/** Karta místo prémiové funkce (Excel, pitch, osvědčení 3–7). */
export const PremiumLock = ({
  feature,
  compact = false,
}: {
  feature: keyof typeof PREMIUM_COPY;
  compact?: boolean;
}) => {
  const { icon: Icon, title } = PREMIUM_COPY[feature];
  return (
    <div className={`rounded-2xl border border-orange-200 bg-orange-50 ${compact ? "p-4" : "p-6"}`}>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-orange-700">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="flex items-center gap-1.5 font-bold">
            <Lock className="h-4 w-4 text-orange-700" /> {title}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Vaše práce je uložená. Po odemčení si výstup stáhnete hned, nic nemusíte vyplňovat znovu.
          </p>
          <Button asChild size="sm" className="mt-3 rounded-[10px]">
            <Link to="/cenik">Odemknout plný přístup</Link>
          </Button>
          <PromoToggle onDone={() => window.location.reload()} />
        </div>
      </div>
    </div>
  );
};

/** Obal celé stránky s prémiovou funkcí (pitch). */
export const PremiumGate = ({
  feature,
  children,
}: {
  feature: keyof typeof PREMIUM_COPY;
  children: React.ReactNode;
}) => {
  const access = useAccess();
  if (access.loading) return <Spinner />;
  if (access.premium) return <>{children}</>;
  return (
    <SidebarLayout>
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-8">
        <PremiumLock feature={feature} />
      </main>
    </SidebarLayout>
  );
};

/**
 * Obal kurzu, který jde koupit i samostatně: pustí dovnitř s členstvím (nebo zkušebním přístupem)
 * i s koupeným kurzem. Jinak nabídne koupi kurzu a vedle členství.
 */
export const CourseLock = ({
  courseId,
  title,
  children,
}: {
  courseId: string;
  title: string;
  children: React.ReactNode;
}) => {
  const access = useAccess();
  const own = useCourseAccess();
  const shop = useShop();
  const { user } = useAuth();
  if (access.loading || own.loading) return <Spinner />;
  if (access.full || own.courses[courseId]) return <>{children}</>;
  const url = courseCheckoutUrl(shop, courseId);
  return (
    <SidebarLayout>
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-8">
        <div className="rounded-3xl bg-primary p-8 text-white sm:p-10">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <Lock className="h-7 w-7 text-orange-300" />
          </span>
          <p className="mt-6 font-semibold text-orange-300">E-learning s osvědčením</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{title}</h1>
          {url ? (
            <>
              <p className="mt-3 text-lg text-white/80">
                Kurz si můžete koupit samostatně. Přístup máte {Math.round(courseDays(shop) / 30.4)} měsíců a po
                dokončení si vystavíte osvědčení.
              </p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("checkout_click", { source: `kurz:${courseId}`, price: coursePrice(shop) })}
                className="v7-trap-btn v7-phi-sm mt-6 inline-flex h-12 items-center justify-center pl-6 pr-12 text-base font-bold text-signal-foreground"
              >
                Koupit kurz za {nbsp(kc(coursePrice(shop)))}
              </a>
              {user?.email && (
                <p className="mt-3 text-sm text-white/70">
                  Při platbě zadejte e-mail {user.email}, kurz se vám pak odemkne sám. Po zaplacení obnovte stránku.
                </p>
              )}
              <p className="mt-6 border-t border-white/15 pt-5 text-white/80">
                Nebo všechny kurzy, 7 bran a semináře v členství za {nbsp(kc(shop.price))} na rok.
              </p>
              <Link
                to="/cenik"
                className="mt-2 flex w-fit font-semibold text-white underline-offset-4 hover:underline"
              >
                Zobrazit členství
              </Link>
            </>
          ) : (
            <>
              <p className="mt-3 text-lg text-white/80">Kurz je v ceně členství spolu s dalšími kurzy a 7 branami.</p>
              <UnlockOptions trialUsed={access.trialUsed} />
            </>
          )}
          <PromoToggle dark onDone={access.refresh} />
        </div>
      </main>
    </SidebarLayout>
  );
};
