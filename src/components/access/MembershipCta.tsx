import { Link, useNavigate } from "react-router-dom";
import { Crown, Gift, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthGate";
import { daysLeft, useAccess } from "@/lib/access";
import { canBuy, kc, monthsLabel, perMonth, useShop } from "@/lib/shop";
import { track } from "@/lib/track";

/** Tlačítko na koupi členství: na stránku /clenstvi s objednávkou, jinak na ceník. */
function BuyButton({ source, className = "", label }: { source: string; className?: string; label?: string }) {
  const shop = useShop();
  const navigate = useNavigate();
  const text = label ?? `Získat členství na ${monthsLabel(shop.months)}`;
  return (
    <Button
      className={`h-11 rounded-[10px] bg-orange-500 px-5 font-semibold text-white hover:bg-orange-600 ${className}`}
      onClick={() => {
        track("checkout_click", { source, price: shop.price });
        navigate(canBuy(shop) ? "/clenstvi" : "/cenik");
      }}
    >
      {text}
    </Button>
  );
}

/**
 * Karta členství na nástěnce – podle stavu uživatele:
 * zdarma (nabídne kvíz a členství), zkušební přístup (kolik zbývá), po zkušebním přístupu, placený (jen stav).
 */
export function MembershipCard({
  placement,
  hasProgress = false,
}: {
  /** top = jen naléhavé stavy (zkušební přístup, po něm); below = nabídka až po prvním kroku */
  placement: "top" | "below";
  hasProgress?: boolean;
}) {
  const access = useAccess();
  const shop = useShop();
  const { user } = useAuth();
  if (access.loading || access.paid) return null;

  const urgent = access.paywall && (access.trial || access.trialUsed);
  if (placement === "top" && !urgent) return null;
  // Nejdřív hodnota, pak cena: nováčkovi nabídneme členství až po Rentgenu nebo první bráně.
  if (placement === "below" && (urgent || !hasProgress)) return null;
  const left = daysLeft(access.until);
  const state = !access.paywall ? "pilot" : access.trial ? "trial" : access.trialUsed ? "after" : "free";

  const title =
    state === "trial"
      ? `Zkušební přístup: ${left === 1 ? "zbývá 1 den" : left && left < 5 ? `zbývají ${left} dny` : `zbývá ${left} dní`}`
      : state === "after"
        ? "Váš projekt je uložený. Pokračujte v něm."
        : state === "pilot"
          ? "Zajistěte si členství VISIBLE7"
          : "Odemkněte celou cestu k vlastnímu podnikání";
  const text =
    state === "trial"
      ? "Máte otevřené všechny brány a videa. Aby vám po skončení nic nezamklo, zajistěte si členství."
      : state === "after"
        ? "Zkušební přístup skončil, vaše data zůstávají. Členstvím odemknete brány 3–7, videa, Excel, pitch a osvědčení."
        : state === "pilot"
          ? "Teď v pilotním provozu máte vše odemčené. Členstvím si zajistíte brány 3–7, videa, Excel, pitch a osvědčení i po jeho skončení."
          : "Brány 3–7, přes 100 videonávodů, byznys case v Excelu, pitch na A4 a osvědčení za každou bránu.";

  return (
    <section
      className="flex flex-col gap-4 rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.06] to-orange-50 p-5 sm:flex-row sm:items-center sm:justify-between"
      aria-label="Členství"
    >
      <div className="flex min-w-0 gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
          {state === "free" ? (
            <Sparkles className="h-5 w-5" />
          ) : state === "trial" ? (
            <Gift className="h-5 w-5" />
          ) : (
            <Lock className="h-5 w-5" />
          )}
        </span>
        <div className="min-w-0">
          <p className="font-bold">{title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{text}</p>
          <p className="mt-1 text-sm">
            <span className="font-semibold">{kc(shop.price)}</span>{" "}
            <span className="text-muted-foreground">
              na {monthsLabel(shop.months)} · vychází na {perMonth(shop)} měsíčně
            </span>
          </p>
          {canBuy(shop) && user?.email && (
            <p className="mt-1 text-xs text-muted-foreground">Při objednávce použijte e-mail {user.email}.</p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:items-end">
        <BuyButton source={`dashboard_${state}`} />
        {state === "free" && (
          <Link to="/kviz" className="text-center text-sm font-semibold text-primary hover:underline">
            Zjistěte, jaký jste typ podnikatele, a získejte 7 dní zdarma
          </Link>
        )}
      </div>
    </section>
  );
}

/** Malé tlačítko v postranním panelu: pro neplatící „Získat členství“, pro členy datum platnosti. */
export function SidebarMembership({ onNavigate }: { onNavigate?: () => void }) {
  const access = useAccess();
  const shop = useShop();
  const navigate = useNavigate();
  if (access.loading) return null;
  if (access.paid)
    return (
      <p className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-muted-foreground">
        <Crown className="h-3.5 w-3.5 text-orange-500" /> Člen
        {access.until ? ` do ${new Date(access.until).toLocaleDateString("cs-CZ")}` : ""}
      </p>
    );
  return (
    <button
      type="button"
      onClick={() => {
        track("checkout_click", { source: "sidebar" });
        navigate(canBuy(shop) ? "/clenstvi" : "/cenik");
        onNavigate?.();
      }}
      className="flex w-full items-center gap-2 rounded-lg bg-orange-50 px-2.5 py-2 text-left text-sm font-semibold text-orange-800 hover:bg-orange-100"
    >
      <Crown className="h-4 w-4" /> Získat členství
      {access.trial && access.until && (
        <span className="ml-auto text-xs font-normal">zbývá {daysLeft(access.until)} d</span>
      )}
    </button>
  );
}

/** Nabídka členství v oslavě po bráně 2 (konec bezplatné části). */
export function CelebrationMembership({ gate }: { gate: number }) {
  const access = useAccess();
  const shop = useShop();
  if (gate !== 2 || access.loading || access.paid) return null;
  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-left">
      <p className="font-semibold">Bezplatnou část máte za sebou. Co dál?</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Další na řadě je byznys case: kolik potřebujete peněz a kdy vás projekt uživí. Členství na{" "}
        {monthsLabel(shop.months)} za {kc(shop.price)} odemkne brány 3–7 i všechna videa.
      </p>
      <BuyButton source="celebration_gate2" className="mt-3 w-full" />
    </div>
  );
}
