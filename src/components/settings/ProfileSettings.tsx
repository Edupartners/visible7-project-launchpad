import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/AuthGate";
import { supabase } from "@/integrations/visible7/client";
import { useToast } from "@/hooks/use-toast";
import { ConsentKind, ConsentState, loadConsents, recordConsents } from "@/lib/consents";
import { OPERATOR } from "@/lib/legal";

interface ProfileMeta {
  first_name?: string;
  last_name?: string;
  phone?: string;
  company?: string;
  ico?: string;
}

const Field = ({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) => (
  <div>
    <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
      {label}
    </label>
    <Input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
    />
  </div>
);

/** Úprava profilu: jméno, telefon, firma a IČO (ukládá se k účtu). */
export const ProfileForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const meta = (user?.user_metadata ?? {}) as ProfileMeta;
  const [form, setForm] = useState<Required<ProfileMeta>>({
    first_name: meta.first_name ?? "",
    last_name: meta.last_name ?? "",
    phone: meta.phone ?? "",
    company: meta.company ?? "",
    ico: meta.ico ?? "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k: keyof ProfileMeta) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.ico && !/^\d{8}$/.test(form.ico.replace(/\s/g, ""))) {
      toast({ title: "IČO má 8 číslic", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim(),
        company: form.company.trim(),
        ico: form.ico.replace(/\s/g, ""),
      },
    });
    setSaving(false);
    toast(
      error
        ? { title: "Profil se nepodařilo uložit", description: error.message, variant: "destructive" }
        : { title: "Profil uložen" },
    );
  };

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="p-first"
          label="Jméno"
          value={form.first_name}
          onChange={set("first_name")}
          autoComplete="given-name"
        />
        <Field
          id="p-last"
          label="Příjmení"
          value={form.last_name}
          onChange={set("last_name")}
          autoComplete="family-name"
        />
        <Field
          id="p-phone"
          label="Telefon"
          type="tel"
          value={form.phone}
          onChange={set("phone")}
          placeholder="+420 777 123 456"
          autoComplete="tel"
        />
        <div>
          <p className="mb-1.5 text-sm font-semibold">E-mail</p>
          <p className="flex h-11 items-center text-sm text-muted-foreground">{user?.email}</p>
        </div>
        <Field
          id="p-company"
          label="Firma (nepovinné)"
          value={form.company}
          onChange={set("company")}
          autoComplete="organization"
        />
        <Field id="p-ico" label="IČO (nepovinné)" value={form.ico} onChange={set("ico")} placeholder="12345678" />
      </div>
      <Button type="submit" className="rounded-[10px]" disabled={saving}>
        {saving ? "Ukládám…" : "Uložit profil"}
      </Button>
    </form>
  );
};

const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("cs-CZ") : "");

/** Přehled souhlasů a možnost změnit dobrovolné (klub, novinky). */
export const ConsentSettings = () => {
  const { toast } = useToast();
  const [consents, setConsents] = useState<Partial<Record<ConsentKind, ConsentState>>>({});
  const [busy, setBusy] = useState<ConsentKind | null>(null);

  const reload = () => loadConsents().then(setConsents);
  useEffect(() => {
    reload();
  }, []);

  const toggle = async (kind: "klub" | "marketing", granted: boolean) => {
    setBusy(kind);
    const ok = await recordConsents({ [kind]: granted });
    setBusy(null);
    if (!ok) {
      toast({ title: "Změnu se nepodařilo uložit", variant: "destructive" });
      return;
    }
    await reload();
    toast({
      title:
        kind === "klub"
          ? granted
            ? "Jste členem Klubu VISIBLE7"
            : "Členství v klubu jsme ukončili"
          : granted
            ? "Novinky vám budeme posílat"
            : "Souhlas s novinkami jsme odvolali",
    });
  };

  const row = (kind: "klub" | "marketing", title: string, desc: string) => {
    const on = !!consents[kind]?.granted;
    return (
      <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-sm text-muted-foreground">
            {desc}
            {consents[kind] && ` Stav od ${fmt(consents[kind]?.created_at)}.`}
          </p>
        </div>
        <Button
          variant={on ? "outline" : "default"}
          className="shrink-0 rounded-[10px]"
          disabled={busy === kind}
          onClick={() => toggle(kind, !on)}
        >
          {kind === "klub" ? (on ? "Ukončit členství" : "Stát se členem") : on ? "Odvolat souhlas" : "Odebírat novinky"}
        </Button>
      </div>
    );
  };

  return (
    <div>
      <div className="divide-y divide-border">
        {row(
          "klub",
          "Klub VISIBLE7",
          "Bezplatné členství pro rozvoj digitálního a AI podnikání: akce, novinky a zvýhodněné nabídky.",
        )}
        {row("marketing", "Novinky e-mailem", "Novinky a nabídky Edu partners s.r.o.")}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        {consents.podminky?.granted
          ? `Podmínky užívání a zásady zpracování osobních údajů jste potvrdili ${fmt(consents.podminky.created_at)}. `
          : ""}
        <Link to="/podminky" className="font-semibold text-primary hover:underline">
          Podmínky užívání
        </Link>
        {" · "}
        <Link to="/ochrana-osobnich-udaju" className="font-semibold text-primary hover:underline">
          Ochrana osobních údajů
        </Link>
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Chcete vidět, opravit nebo smazat své údaje, nebo zrušit účet?{" "}
        <a
          className="font-semibold text-primary hover:underline"
          href={`mailto:${OPERATOR.email}?subject=${encodeURIComponent("VISIBLE7 – žádost k osobním údajům / zrušení účtu")}`}
        >
          Napište nám
        </a>
        .
      </p>
    </div>
  );
};
