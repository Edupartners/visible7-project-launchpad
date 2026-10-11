import { useCallback, useEffect, useState } from "react";
import { Copy, Shuffle, Ticket, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/components/AuthGate";
import {
  PromoCode,
  createPromoCode,
  deletePromoCode,
  loadPromoCodes,
  promoLink,
  setPromoActive,
} from "@/lib/adminExtras";
import { generateCode } from "@/lib/promo";

const EMPTY = { code: "", description: "", days: "30", max: "", expires: "" };
const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("cs-CZ") : "");

/** Správa promo kódů: založit, poslat odkaz, vypnout, smazat; kdo kód použil. */
export function PromoCodesAdmin({ emails }: { emails: Record<string, string> }) {
  const { user } = useAuth();
  const [list, setList] = useState<PromoCode[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    loadPromoCodes()
      .then(setList)
      .catch((e) => setMsg(e instanceof Error ? e.message : "Načtení kódů se nepodařilo."));
  }, []);
  useEffect(load, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const code = form.code.trim().toUpperCase();
    if (!/^[A-Z0-9_-]{3,40}$/.test(code)) {
      setMsg("Kód může mít 3–40 znaků: písmena bez diakritiky, číslice, pomlčka.");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await createPromoCode({
        code,
        description: form.description.trim() || null,
        extends_access_days: Math.max(1, Math.min(3650, Number(form.days) || 30)),
        max_uses: form.max ? Math.max(1, Number(form.max)) : null,
        expires_at: form.expires ? new Date(`${form.expires}T23:59:59`).toISOString() : null,
        created_by: user.id,
      });
      setForm(EMPTY);
      setMsg(`Kód ${code} je připravený. Pošlete ho nebo zkopírujte odkaz.`);
      load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Uložení se nepodařilo.");
    } finally {
      setBusy(false);
    }
  };

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setMsg(`${what} zkopírován.`);
    } catch {
      setMsg(text);
    }
  };

  return (
    <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <Ticket className="h-5 w-5" /> Promo kódy
      </h2>
      <p className="text-sm text-muted-foreground">
        Kód dá plný přístup na zvolený počet dní. Uživatel ho zadá v aplikaci (Nastavení nebo u zamčené brány), nebo
        stačí poslat odkaz – kód se uplatní sám po registraci či přihlášení. Každý člověk může kód použít jednou.
      </p>

      <form onSubmit={submit} className="mt-4 grid gap-3 rounded-2xl bg-muted/50 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-1 text-sm sm:col-span-2">
          <span className="font-semibold">Kód</span>
          <span className="flex gap-2">
            <Input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="NAPR-PILOT"
              required
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => setForm({ ...form, code: generateCode() })}
              title="Vygenerovat"
            >
              <Shuffle className="h-4 w-4" />
              <span className="sr-only">Vygenerovat kód</span>
            </Button>
          </span>
        </label>
        <label className="space-y-1 text-sm sm:col-span-2">
          <span className="font-semibold">Poznámka (pro koho)</span>
          <Input
            value={form.description}
            maxLength={120}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Např. účastníci webináře 4. 12."
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold">Přístup na dní</span>
          <Input
            type="number"
            min={1}
            max={3650}
            value={form.days}
            onChange={(e) => setForm({ ...form, days: e.target.value })}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold">Max. použití</span>
          <Input
            type="number"
            min={1}
            value={form.max}
            onChange={(e) => setForm({ ...form, max: e.target.value })}
            placeholder="bez omezení"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold">Platí do</span>
          <Input type="date" value={form.expires} onChange={(e) => setForm({ ...form, expires: e.target.value })} />
        </label>
        <div className="flex items-end">
          <Button type="submit" className="w-full rounded-[10px]" disabled={busy || !form.code.trim()}>
            Vytvořit kód
          </Button>
        </div>
      </form>
      {msg && (
        <p role="status" className="mt-3 break-all text-sm text-muted-foreground">
          {msg}
        </p>
      )}

      {list.length > 0 && (
        <ul className="mt-4 divide-y divide-border">
          {list.map((p) => {
            const expired = !!p.expires_at && new Date(p.expires_at).getTime() < Date.now();
            const full = p.max_uses !== null && p.times_used >= p.max_uses;
            return (
              <li key={p.id} className="flex flex-col gap-3 py-3 lg:flex-row lg:items-center">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-base font-bold">{p.code}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        p.is_active && !expired && !full
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {!p.is_active ? "Vypnuto" : expired ? "Prošlý" : full ? "Vyčerpaný" : "Platí"}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {p.extends_access_days} dní přístupu · použito {p.times_used}
                    {p.max_uses !== null ? ` z ${p.max_uses}` : ""}
                    {p.expires_at && ` · platí do ${fmt(p.expires_at)}`}
                    {p.description && ` · ${p.description}`}
                  </p>
                  {p.redeemed_by.length > 0 && (
                    <p className="mt-1 break-all text-xs text-muted-foreground">
                      Použili: {p.redeemed_by.map((id) => emails[id] ?? "neznámý").join(", ")}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-[10px]"
                    onClick={() => copy(p.code, "Kód")}
                  >
                    <Copy className="mr-1.5 h-3.5 w-3.5" /> Kód
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-[10px]"
                    onClick={() => copy(promoLink(p.code), "Odkaz")}
                  >
                    <Copy className="mr-1.5 h-3.5 w-3.5" /> Odkaz
                  </Button>
                  <label className="ml-2 flex items-center gap-2 text-sm">
                    Zapnuto
                    <Switch
                      checked={p.is_active}
                      onCheckedChange={async (v) => {
                        setList((l) => l.map((x) => (x.id === p.id ? { ...x, is_active: v } : x)));
                        await setPromoActive(p.id, v).catch(() => undefined);
                        load();
                      }}
                      aria-label={`Zapnout kód ${p.code}`}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!window.confirm(`Smazat kód ${p.code}? Kdo ho už použil, přístup si ponechá.`)) return;
                      await deletePromoCode(p.id).catch(() => undefined);
                      load();
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Smazat kód ${p.code}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
