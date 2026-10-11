import { Link, useNavigate } from "react-router-dom";
import { Award, Check, FileSpreadsheet, FileText, Gift, Loader2, Lock } from "lucide-react";
import { SidebarLayout } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { GATE_NAMES } from "@/lib/certificates";
import { FREE_GATES, useAccess } from "@/lib/access";

/** Co nabídnout uživateli bez přístupu: kvíz za 7 dní zdarma (jednou) a ceník. */
const UnlockOptions = ({ trialUsed }: { trialUsed: boolean }) => {
  const navigate = useNavigate();
  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
      {!trialUsed && (
        <Button
          onClick={() => navigate("/kviz")}
          className="h-12 rounded-[10px] bg-orange-500 px-6 text-base font-semibold text-white hover:bg-orange-600"
        >
          <Gift className="mr-2 h-5 w-5" /> Kvíz a 7 dní zdarma
        </Button>
      )}
      <Link
        to="/cenik"
        className={`inline-flex h-12 items-center justify-center rounded-[10px] px-6 text-base font-semibold ${
          trialUsed
            ? "bg-orange-500 text-white hover:bg-orange-600"
            : "border-2 border-white/40 text-white hover:bg-white/10"
        }`}
      >
        Zobrazit ceník
      </Link>
    </div>
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
            {access.trialUsed
              ? "Zkušební přístup už jste využili. Vaše data jsou uložená a čekají na vás – stačí odemknout plný přístup."
              : "Brány 1 a 2 jsou zdarma. Další brány odemknete na 7 dní zdarma, když vyplníte krátký kvíz o tom, jaký jste typ podnikatele."}
          </p>
          <ul className="mt-6 space-y-2 text-white/90">
            {[
              "Všechny brány a videonávody",
              "Byznys case, plán tvorby, marketing, spuštění a růst",
              "AI asistent u každé brány",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" strokeWidth={3} /> {t}
              </li>
            ))}
          </ul>
          <UnlockOptions trialUsed={access.trialUsed} />
        </div>
      </main>
    </SidebarLayout>
  );
};

const PREMIUM_COPY = {
  excel: { icon: FileSpreadsheet, title: "Export do Excelu je v placeném přístupu" },
  pitch: { icon: FileText, title: "Pitch na A4 je v placeném přístupu" },
  certificate: { icon: Award, title: "Osvědčení za brány 3–7 je v placeném přístupu" },
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
