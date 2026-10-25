import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { BusinessProfile, DEFAULT_PROFILE, FORM_OPTIONS, loadProfile, saveProfile } from "@/lib/deadlines";
import { track } from "@/lib/track";

/** Profil podnikatele: forma podnikání, DPH a zapnutí připomínek termínů. */
export const BusinessProfileForm = ({ onSaved }: { onSaved?: (p: BusinessProfile) => void }) => {
  const [p, setP] = useState<BusinessProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProfile().then((r) => {
      if (r) setP(r);
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    const ok = await saveProfile(p);
    setSaving(false);
    toast(
      ok
        ? { title: "Uloženo", description: "Termíny se upraví podle vašeho profilu." }
        : { title: "Nepodařilo se uložit", variant: "destructive" },
    );
    if (ok) {
      track("business_profile_saved", { form: p.form, dph: p.dph, reminders: p.deadline_reminders });
      onSaved?.(p);
    }
  };

  if (loading) return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;

  return (
    <div className="space-y-5 text-sm">
      <fieldset>
        <legend className="mb-2 font-semibold">Jak podnikáte?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {FORM_OPTIONS.map((o) => (
            <label
              key={o.id}
              className={`flex cursor-pointer gap-3 rounded-2xl border p-3 transition-colors ${
                p.form === o.id ? "border-leaf-500 bg-leaf-50" : "border-border hover:border-leaf-300"
              }`}
            >
              <input
                type="radio"
                name="business-form"
                className="mt-1 accent-[#34845A]"
                checked={p.form === o.id}
                onChange={() => setP({ ...p, form: o.id })}
              />
              <span>
                <span className="block font-semibold">{o.label}</span>
                <span className="text-muted-foreground">{o.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {p.form !== "nezacal" && (
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[#34845A]"
            checked={p.dph}
            onChange={(e) => setP({ ...p, dph: e.target.checked })}
          />
          <span>Jsem plátce DPH (měsíční přiznání)</span>
        </label>
      )}

      <div className="flex items-start justify-between gap-4 rounded-2xl bg-muted/50 p-4">
        <div>
          <p className="font-semibold">Připomínat termíny e-mailem</p>
          <p className="text-muted-foreground">Týden předem, zdarma. Kdykoli vypnete tady nebo odkazem v e-mailu.</p>
        </div>
        <Switch
          checked={p.deadline_reminders}
          onCheckedChange={(v) => setP({ ...p, deadline_reminders: v })}
          aria-label="Připomínat termíny e-mailem"
        />
      </div>

      <Button onClick={save} disabled={saving} className="rounded-[10px]">
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Uložit profil
      </Button>
    </div>
  );
};
