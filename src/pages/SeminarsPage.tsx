import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarPlus, Check, Clock, Crown, Loader2, MapPin, PlayCircle, Radio, Video } from "lucide-react";
import { SidebarLayout } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthGate";
import { useToast } from "@/hooks/use-toast";
import { useAccess } from "@/lib/access";
import { celebrate } from "@/lib/celebrate";
import { GATE_NAMES } from "@/lib/certificates";
import { track } from "@/lib/track";
import {
  Seminar,
  formatWhen,
  isLiveNow,
  loadMyRegistrations,
  loadSeminars,
  register,
  seminarLinks,
  sortSeminars,
  unregister,
} from "@/lib/seminars";

type Links = { join_url: string | null; recording_url: string | null };

/** Soubor .ics, aby si seminář šlo uložit do kalendáře. */
function downloadIcs(s: Seminar) {
  if (!s.starts_at) return;
  const start = new Date(s.starts_at);
  const end = new Date(start.getTime() + s.duration_min * 60_000);
  const f = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  const esc = (t: string) => t.replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VISIBLE7//Seminare//CS",
    "BEGIN:VEVENT",
    `UID:${s.id}@visible7.io`,
    `DTSTAMP:${f(new Date())}`,
    `DTSTART:${f(start)}`,
    `DTEND:${f(end)}`,
    `SUMMARY:${esc(`VISIBLE7: ${s.title}`)}`,
    `DESCRIPTION:${esc(`${s.description}\n\nOdkaz na připojení najdete na https://visible7.io/seminare`)}`,
    `LOCATION:${esc(s.place)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  a.download = "visible7-seminar.ics";
  a.click();
  URL.revokeObjectURL(a.href);
}

const Badge = ({ s }: { s: Seminar }) =>
  s.access === "zdarma" ? (
    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">Zdarma</span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800">
      <Crown className="h-3 w-3" /> Pro členy
    </span>
  );

const SeminarsPage = () => {
  const { user } = useAuth();
  const access = useAccess();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [list, setList] = useState<Seminar[] | null>(null);
  const [mine, setMine] = useState<Set<string>>(new Set());
  const [links, setLinks] = useState<Record<string, Links>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const member = access.premium;

  const load = useCallback(async () => {
    if (!user) return;
    const [all, regs] = await Promise.all([loadSeminars().catch(() => []), loadMyRegistrations(user.id)]);
    setList(all);
    setMine(regs);
  }, [user]);
  useEffect(() => {
    load();
  }, [load]);

  // Odkazy jen tam, kde na ně má uživatel nárok.
  useEffect(() => {
    if (!list || access.loading) return;
    const want = list.filter((s) => member || (s.access === "zdarma" && mine.has(s.id)));
    Promise.all(want.map(async (s) => [s.id, await seminarLinks(s.id)] as const)).then((rows) =>
      setLinks(Object.fromEntries(rows.filter(([, l]) => l).map(([id, l]) => [id, l as Links]))),
    );
  }, [list, mine, member, access.loading]);

  const toggle = async (s: Seminar) => {
    if (!user) return;
    setBusy(s.id);
    try {
      if (mine.has(s.id)) {
        await unregister(s.id, user.id);
        setMine((m) => new Set([...m].filter((x) => x !== s.id)));
      } else {
        await register(s.id, user.id);
        setMine((m) => new Set(m).add(s.id));
        celebrate("small");
        track("seminar_register", { seminar: s.title });
        toast({
          title: "Jste přihlášeni",
          description: s.starts_at ? "Uložte si termín do kalendáře." : "Termín vám dáme vědět.",
        });
      }
    } catch {
      toast({ title: "Nepodařilo se", description: "Zkuste to prosím znovu.", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const { up, past } = sortSeminars(list ?? []);
  const next = up.find((s) => s.starts_at);

  const card = (s: Seminar, highlight = false) => {
    const registered = mine.has(s.id);
    const l = links[s.id];
    const live = isLiveNow(s);
    const locked = s.access === "clenove" && !member;
    return (
      <li
        key={s.id}
        className={`flex flex-col rounded-3xl p-6 ${
          highlight ? "bg-primary text-white sm:p-8" : "border border-border bg-card"
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          {highlight && <span className="text-sm font-semibold text-orange-300">Nejbližší seminář</span>}
          <Badge s={s} />
          {s.gate && (
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                highlight ? "bg-white/10 text-white/80" : "bg-muted text-muted-foreground"
              }`}
            >
              Brána {s.gate}: {GATE_NAMES[s.gate]}
            </span>
          )}
          {live && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
              <Radio className="h-3 w-3" /> Právě běží
            </span>
          )}
        </div>
        <h2 className={`mt-3 font-extrabold tracking-tight ${highlight ? "text-3xl" : "text-xl"}`}>{s.title}</h2>
        <p
          className={`mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm ${highlight ? "text-white/80" : "text-muted-foreground"}`}
        >
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> {formatWhen(s.starts_at)}
            {s.starts_at && ` · ${s.duration_min} min`}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" /> {s.place}
          </span>
        </p>
        {s.description && (
          <p className={`mt-3 leading-relaxed ${highlight ? "text-white/90" : "text-sm"}`}>{s.description}</p>
        )}
        <div className="flex-1" />
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {locked ? (
            <Button onClick={() => navigate("/clenstvi")} className="v7-trap-btn pr-9 font-bold text-signal-foreground">
              <Crown className="mr-2 h-4 w-4" /> Získat členství
            </Button>
          ) : (
            <Button
              onClick={() => toggle(s)}
              disabled={busy === s.id}
              variant={registered ? "outline" : "default"}
              className={`rounded-[10px] font-semibold ${
                registered
                  ? highlight
                    ? "border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                    : ""
                  : "v7-trap-btn pr-9 font-bold text-signal-foreground"
              }`}
            >
              {busy === s.id ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : registered ? (
                <Check className="mr-2 h-4 w-4" />
              ) : null}
              {registered ? "Přihlášeno" : "Přihlásit se"}
            </Button>
          )}
          {registered && l?.join_url && (
            <Button asChild className="rounded-[10px] bg-emerald-600 font-semibold text-white hover:bg-emerald-700">
              <a href={l.join_url} target="_blank" rel="noopener noreferrer">
                <Video className="mr-2 h-4 w-4" /> Připojit se
              </a>
            </Button>
          )}
          {registered && s.starts_at && (
            <Button
              variant="ghost"
              onClick={() => downloadIcs(s)}
              className={`rounded-[10px] ${highlight ? "text-white hover:bg-white/10 hover:text-white" : ""}`}
            >
              <CalendarPlus className="mr-2 h-4 w-4" /> Do kalendáře
            </Button>
          )}
        </div>
        {registered && !l?.join_url && !locked && s.starts_at && (
          <p className={`mt-2 text-xs ${highlight ? "text-white/60" : "text-muted-foreground"}`}>
            Odkaz na připojení se tu objeví před začátkem.
          </p>
        )}
      </li>
    );
  };

  return (
    <SidebarLayout>
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-8 sm:py-10">
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Živé semináře</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Jednou měsíčně 90 minut online: výklad, práce na projektech účastníků a vaše otázky. Záznamy najdete tady.
          </p>
        </header>

        {list === null ? (
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
        ) : (
          <>
            {next && <ul>{card(next, true)}</ul>}

            <section>
              <h2 className="text-xl font-bold">{next ? "Další semináře" : "Připravujeme"}</h2>
              {up.filter((s) => s !== next).length === 0 ? (
                <p className="mt-2 text-muted-foreground">Další termíny brzy vypíšeme.</p>
              ) : (
                <ul className="mt-4 grid gap-4 md:grid-cols-2">{up.filter((s) => s !== next).map((s) => card(s))}</ul>
              )}
            </section>

            {past.length > 0 && (
              <section>
                <h2 className="text-xl font-bold">Záznamy</h2>
                <ul className="mt-4 divide-y divide-border rounded-3xl border border-border bg-card">
                  {past.map((s) => {
                    const rec = links[s.id]?.recording_url;
                    return (
                      <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-6">
                        <div>
                          <p className="font-semibold">{s.title}</p>
                          <p className="text-sm text-muted-foreground">{formatWhen(s.starts_at)}</p>
                        </div>
                        {rec ? (
                          <Button asChild variant="outline" className="rounded-[10px]">
                            <a href={rec} target="_blank" rel="noopener noreferrer">
                              <PlayCircle className="mr-2 h-4 w-4" /> Pustit záznam
                            </a>
                          </Button>
                        ) : s.access === "clenove" && !member ? (
                          <Button variant="ghost" className="rounded-[10px]" onClick={() => navigate("/clenstvi")}>
                            <Crown className="mr-2 h-4 w-4 text-orange-500" /> Záznam pro členy
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground">Záznam připravujeme</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </SidebarLayout>
  );
};

export default SeminarsPage;
