import { useCallback, useEffect, useState } from "react";
import { Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/visible7/client";
import { INSTALL_STATUS, InstallRequest, InstallStatus } from "@/lib/install";

const fmt = (iso: string) => new Date(iso).toLocaleString("cs-CZ", { dateStyle: "short", timeStyle: "short" });

/** Žádosti o instalaci webu s podporou (brána 4): kontakt, doména, stav a adresa hotového webu. */
export function InstallRequestsAdmin() {
  const [list, setList] = useState<InstallRequest[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [edit, setEdit] = useState<Record<string, { status: InstallStatus; site_url: string }>>({});

  const load = useCallback(() => {
    supabase
      .from("install_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setMsg("Načtení žádostí se nepodařilo. Je v databázi tabulka install_requests?");
          return;
        }
        setList((data ?? []) as InstallRequest[]);
      });
  }, []);
  useEffect(load, [load]);

  const save = async (r: InstallRequest) => {
    const e = edit[r.id];
    if (!e) return;
    const url = e.site_url.trim();
    if (url && !/^https?:\/\//.test(url)) {
      setMsg("Adresa webu musí začínat https://");
      return;
    }
    const { error } = await supabase
      .from("install_requests")
      .update({ status: e.status, site_url: url || null, updated_at: new Date().toISOString() })
      .eq("id", r.id);
    setMsg(error ? "Uložení se nepodařilo." : "Uloženo. Uživatel stav uvidí v bráně 4.");
    if (!error) load();
  };

  const open = list.filter((r) => r.status !== "hotovo" && r.status !== "zruseno").length;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Wrench className="h-5 w-5" aria-hidden="true" /> Instalace s podporou
        </h2>
        <p className="text-sm text-muted-foreground">
          Žádosti z brány 4. Otevřených: {open}. Až web nainstalujete, pošlete přístup odkazem na nastavení hesla,
          vyplňte adresu webu a dejte stav Hotovo.
        </p>
      </div>
      {msg && <p className="rounded-lg bg-muted p-3 text-sm">{msg}</p>}
      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground">Zatím žádné žádosti.</p>
      ) : (
        <ul className="space-y-3">
          {list.map((r) => {
            const e = edit[r.id] ?? { status: r.status, site_url: r.site_url ?? "" };
            const change = (patch: Partial<typeof e>) => setEdit((p) => ({ ...p, [r.id]: { ...e, ...patch } }));
            return (
              <li key={r.id} className="rounded-xl border border-border p-4 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-bold">
                    {r.name} · <a href={`mailto:${r.email}`}>{r.email}</a>
                    {r.phone ? ` · ${r.phone}` : ""}
                  </p>
                  <span className="text-xs text-muted-foreground">{fmt(r.created_at)}</span>
                </div>
                <dl className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2">
                  <div>
                    <dt className="inline text-muted-foreground">Hosting: </dt>
                    <dd className="inline">
                      {r.hosting === "mam" ? "má hosting a doménu" : "nemá, potřebuje poradit"}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline text-muted-foreground">Doména: </dt>
                    <dd className="inline">{r.domain || "neuvedeno"}</dd>
                  </div>
                  <div>
                    <dt className="inline text-muted-foreground">Typ: </dt>
                    <dd className="inline">{r.web_type || "neuvedeno"}</dd>
                  </div>
                  <div>
                    <dt className="inline text-muted-foreground">Fakturace: </dt>
                    <dd className="inline whitespace-pre-line">{r.billing || "neuvedeno"}</dd>
                  </div>
                  {r.note && (
                    <div className="sm:col-span-2">
                      <dt className="inline text-muted-foreground">Poznámka: </dt>
                      <dd className="inline whitespace-pre-line">{r.note}</dd>
                    </div>
                  )}
                </dl>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <select
                    value={e.status}
                    onChange={(ev) => change({ status: ev.target.value as InstallStatus })}
                    className="h-10 rounded-md border border-input bg-background px-3"
                    aria-label="Stav"
                  >
                    {(Object.keys(INSTALL_STATUS) as InstallStatus[]).map((s) => (
                      <option key={s} value={s}>
                        {INSTALL_STATUS[s]}
                      </option>
                    ))}
                  </select>
                  <Input
                    value={e.site_url}
                    onChange={(ev) => change({ site_url: ev.target.value })}
                    placeholder="https://adresa-hotoveho-webu.cz"
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={() => save(r)} disabled={!edit[r.id]}>
                    Uložit
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
