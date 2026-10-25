import { useCallback, useEffect, useState } from "react";
import { Bell, Loader2, Settings2 } from "lucide-react";
import { supabase } from "@/integrations/visible7/client";
import { BusinessProfile, Deadline, loadDeadlines, loadDone, loadProfile, profileTags, setDone } from "@/lib/deadlines";
import { track } from "@/lib/track";
import { BusinessProfileForm } from "./BusinessProfileForm";
import { DeadlineList } from "./DeadlineList";

/**
 * „Moje termíny“ v Digitální kanceláři.
 * Nepřihlášený: ukázka nejbližších termínů a výzva k registraci. Přihlášený: profil a jeho termíny s odškrtnutím.
 * Uživatelům ukazujeme jen termíny, které správce ověřil.
 */
export const MyDeadlines = ({ onStart }: { onStart: () => void }) => {
  const [state, setState] = useState<"loading" | "guest" | "user">("loading");
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [items, setItems] = useState<Deadline[]>([]);
  const [done, setDoneSet] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState(false);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const all = (await loadDeadlines(120)).filter((d) => d.verified);
    if (!data.session) {
      setItems(all.slice(0, 5));
      setState("guest");
      return;
    }
    const [p, d] = await Promise.all([loadProfile(), loadDone()]);
    setProfile(p);
    setDoneSet(d);
    const tags = p ? profileTags(p) : [];
    setItems(all.filter((x) => x.audience.some((a) => tags.includes(a))));
    setEditing(!p);
    setState("user");
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggle = async (id: string, v: boolean) => {
    setDoneSet((s) => {
      const n = new Set(s);
      if (v) n.add(id);
      else n.delete(id);
      return n;
    });
    if (!(await setDone(id, v))) refresh();
    else if (v) track("deadline_done", {});
  };

  if (state === "loading") return <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />;

  if (state === "guest")
    return (
      <div className="space-y-6">
        {items.length > 0 && <DeadlineList items={items} showAudience />}
        <div className="flex flex-col items-start gap-4 rounded-3xl bg-primary p-6 text-white sm:flex-row sm:items-center sm:p-8">
          <Bell className="h-8 w-8 shrink-0 text-leaf-300" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-lg font-bold">Připomeneme vám je týden předem. Zdarma.</p>
            <p className="mt-1 text-white/80">
              Zaregistrujte se, vyberte, jak podnikáte, a pošleme vám jen termíny, které se vás týkají.
            </p>
          </div>
          <button
            type="button"
            onClick={onStart}
            className="inline-flex h-12 shrink-0 items-center rounded-full bg-white px-6 font-semibold text-primary hover:bg-white/90"
          >
            Zapnout připomínky
          </button>
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      {editing ? (
        <div className="rounded-3xl border border-border bg-card p-6">
          <p className="mb-4 text-lg font-bold">Nastavte si, jak podnikáte</p>
          <BusinessProfileForm
            onSaved={() => {
              refresh();
            }}
          />
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {profile?.deadline_reminders
              ? "Připomínky e-mailem máte zapnuté, přijdou týden předem."
              : "Připomínky e-mailem máte vypnuté."}
          </p>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <Settings2 className="h-4 w-4" aria-hidden="true" /> Upravit profil
          </button>
        </div>
      )}
      {!editing &&
        (items.length ? (
          <DeadlineList items={items} done={done} onToggle={toggle} />
        ) : (
          <p className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">
            {profile?.form === "nezacal"
              ? "Až začnete podnikat, změňte profil a ukážeme vám vaše termíny."
              : "V nejbližších 4 měsících pro vás nemáme ověřený termín. Nové termíny průběžně doplňujeme."}
          </p>
        ))}
    </div>
  );
};
