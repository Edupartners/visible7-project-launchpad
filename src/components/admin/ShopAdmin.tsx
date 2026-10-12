import { useEffect, useState } from "react";
import { Copy, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/visible7/client";
import { ShopSettings, kc, loadShop, monthsLabel, saveShop } from "@/lib/shop";

interface Purchase {
  id: number;
  email: string;
  total: number | null;
  days: number;
  applied_at: string | null;
  created_at: string;
}

const fmt = (iso: string) => new Date(iso).toLocaleString("cs-CZ", { dateStyle: "short", timeStyle: "short" });

/** Platby přes SimpleShop: cena, odkaz na objednávku, webhook a přehled nákupů. */
export function ShopAdmin() {
  const [shop, setShop] = useState<ShopSettings | null>(null);
  const [webhook, setWebhook] = useState<string>("");
  const [showHook, setShowHook] = useState(false);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadShop().then(setShop);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    db.rpc("admin_shop_webhook_url").then(({ data }: { data: string | null }) => setWebhook(data ?? ""));
    db.from("shop_purchases")
      .select("id, email, total, days, applied_at, created_at")
      .order("created_at", { ascending: false })
      .limit(30)
      .then(({ data }: { data: Purchase[] | null }) => setPurchases(data ?? []));
  }, []);

  if (!shop) return null;

  const set = (k: keyof ShopSettings, v: string) =>
    setShop({ ...shop, [k]: ["price", "months", "days"].includes(k) ? Number(v) || 0 : v });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = shop.checkout_url.trim();
    if (url && !/^https:\/\//.test(url)) {
      setMsg("Odkaz na objednávku musí začínat https://");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await saveShop({ ...shop, checkout_url: url, product_id: shop.product_id?.trim() || undefined });
      setMsg("Uloženo. Ceník se změní během pár minut.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Uložení se nepodařilo.");
    } finally {
      setBusy(false);
    }
  };

  const copyHook = async () => {
    try {
      await navigator.clipboard.writeText(webhook);
      setMsg("Adresa webhooku zkopírována. Vložte ji do produktu v SimpleShopu.");
    } catch {
      setShowHook(true);
    }
  };

  return (
    <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <CreditCard className="h-5 w-5" /> Platby (SimpleShop)
      </h2>
      <p className="text-sm text-muted-foreground">
        Po zaplacení zavolá SimpleShop aplikaci a kupující dostane členství automaticky. Pokud ještě nemá účet, členství
        se mu zapne při registraci se stejným e-mailem.
      </p>

      <form onSubmit={save} className="mt-4 grid gap-3 rounded-2xl bg-muted/50 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-1 text-sm">
          <span className="font-semibold">Cena s DPH (Kč)</span>
          <Input type="number" min={0} value={shop.price} onChange={(e) => set("price", e.target.value)} />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold">Délka (měsíců, na ceníku)</span>
          <Input type="number" min={1} value={shop.months} onChange={(e) => set("months", e.target.value)} />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold">Přístup po zaplacení (dní)</span>
          <Input type="number" min={1} value={shop.days} onChange={(e) => set("days", e.target.value)} />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold">ID produktu (nepovinné)</span>
          <Input
            value={shop.product_id ?? ""}
            onChange={(e) => set("product_id", e.target.value)}
            placeholder="jen tento produkt dá členství"
          />
        </label>
        <label className="space-y-1 text-sm sm:col-span-2 lg:col-span-4">
          <span className="font-semibold">Odkaz na objednávkový formulář SimpleShopu</span>
          <Input
            value={shop.checkout_url}
            onChange={(e) => set("checkout_url", e.target.value)}
            placeholder="https://form.simpleshop.cz/…"
          />
        </label>
        <label className="space-y-1 text-sm sm:col-span-2 lg:col-span-4">
          <span className="font-semibold">Věta o hodnotě na ceníku</span>
          <Input value={shop.anchor} onChange={(e) => set("anchor", e.target.value)} maxLength={160} />
        </label>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-4">
          <Button type="submit" className="rounded-[10px]" disabled={busy}>
            Uložit
          </Button>
          <span className="text-sm text-muted-foreground">
            Na ceníku: {kc(shop.price)} na {monthsLabel(shop.months)}
          </span>
        </div>
      </form>

      <div className="mt-4 rounded-2xl border border-border p-4">
        <p className="text-sm font-semibold">Adresa pro SimpleShop</p>
        <p className="text-sm text-muted-foreground">
          V SimpleShopu otevřete produkt → záložka Ostatní → pole „Webhook po uhrazení“ a vložte tuto adresu. Obsahuje
          tajný klíč – nikam jinam ji neposílejte.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="rounded-[10px]" onClick={copyHook} disabled={!webhook}>
            <Copy className="mr-2 h-4 w-4" /> Zkopírovat adresu webhooku
          </Button>
          <Button type="button" variant="ghost" className="rounded-[10px]" onClick={() => setShowHook((v) => !v)}>
            {showHook ? "Skrýt" : "Zobrazit"}
          </Button>
        </div>
        {showHook && <p className="mt-2 break-all rounded-lg bg-muted p-2 font-mono text-xs">{webhook}</p>}
      </div>

      {msg && (
        <p role="status" className="mt-3 text-sm text-muted-foreground">
          {msg}
        </p>
      )}

      <h3 className="mt-5 text-sm font-semibold">Poslední nákupy</h3>
      {purchases.length === 0 ? (
        <p className="mt-1 text-sm text-muted-foreground">Zatím žádné.</p>
      ) : (
        <ul className="mt-2 divide-y divide-border text-sm">
          {purchases.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <span className="min-w-0 break-all">
                {p.email} <span className="text-muted-foreground">· {fmt(p.created_at)}</span>
              </span>
              <span className="flex items-center gap-2">
                {p.total != null && <span className="tabular-nums">{kc(p.total)}</span>}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    p.applied_at ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {p.applied_at ? `Připsáno (${p.days} dní)` : "Čeká na registraci"}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
