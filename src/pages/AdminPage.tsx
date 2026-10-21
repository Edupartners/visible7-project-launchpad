import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Check, ChevronDown, Download, Mail, Phone, RefreshCw, Search, ShieldCheck } from "lucide-react";
import { SidebarLayout } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GATE_NAMES } from "@/lib/certificates";
import { buildType } from "@/lib/buildPlans";
import {
  AdminOverview,
  AdminProject,
  AdminUser,
  EVENT_LABELS,
  EventStats,
  adminStats,
  daysAgo,
  loadAdminOverview,
  QuizStats,
  loadEventStats,
  loadQuizStats,
  researchCsv,
  useIsAdmin,
  usersCsv,
} from "@/lib/admin";
import { BARRIERS, ROUNDS, TYPES } from "@/lib/quiz";
import { AnnouncementsAdmin } from "@/components/announcements/AnnouncementsAdmin";
import { PromoCodesAdmin } from "@/components/admin/PromoCodesAdmin";
import { RemindersAdmin } from "@/components/admin/RemindersAdmin";
import { ShopAdmin } from "@/components/admin/ShopAdmin";
import { SeminarsAdmin } from "@/components/admin/SeminarsAdmin";
import { BlockVideosAdmin } from "@/components/admin/BlockVideosAdmin";
import { WorksheetsAdmin } from "@/components/admin/WorksheetsAdmin";
import { TagChip, UserTagEditor } from "@/components/admin/UserTags";
import { TAG_DOT, TagColor, UserTag, createTag, loadTags, setUserTag } from "@/lib/adminExtras";

type Filter = "vse" | "aktivni" | "platici" | "klub";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "vse", label: "Všichni" },
  { id: "aktivni", label: "Aktivní 7 dní" },
  { id: "platici", label: "Platící" },
  { id: "klub", label: "Klub" },
];

const PLAN: Record<string, string> = {
  free: "Zdarma",
  trial: "Zkušební",
  mesic: "Měsíc",
  ctvrtleti: "Čtvrtletí",
  rok: "Rok",
  kod: "Kód",
  clenstvi: "Členství",
};

const fmtDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", year: "2-digit" }) : "—";

const ago = (iso: string | null | undefined) => {
  const d = daysAgo(iso);
  if (!Number.isFinite(d)) return "nikdy";
  if (d < 1 / 24) return "před chvílí";
  if (d < 1) return `před ${Math.round(d * 24)} h`;
  if (d < 2) return "včera";
  return `před ${Math.round(d)} dny`;
};

const GateDots = ({ p }: { p: AdminProject }) => (
  <span className="inline-flex items-center gap-1" aria-label={`Splněné brány: ${p.gates.join(", ") || "žádná"}`}>
    {[1, 2, 3, 4, 5, 6, 7].map((n) => (
      <span
        key={n}
        title={GATE_NAMES[n]}
        className={`h-2.5 w-2.5 rounded-full ${p.gates.includes(n) ? "bg-emerald-500" : "bg-muted-foreground/20"}`}
      />
    ))}
  </span>
);

const Stat = ({ label, value, hint }: { label: string; value: number | string; hint?: string }) => (
  <div className="rounded-2xl border border-border bg-card p-4">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="mt-1 text-3xl font-extrabold tracking-tight">{value}</p>
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

const ProjectList = ({ projects }: { projects: AdminProject[] }) =>
  projects.length === 0 ? (
    <p className="text-sm text-muted-foreground">Zatím žádný projekt.</p>
  ) : (
    <ul className="space-y-2">
      {projects.map((p) => (
        <li
          key={p.id}
          className={`flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-border bg-background p-3 text-sm ${
            p.archived_at ? "opacity-50" : ""
          }`}
        >
          <span className="min-w-0 basis-full font-semibold sm:basis-0 sm:flex-1">
            {p.name}
            {p.archived_at && <span className="ml-2 text-xs font-normal">(archivovaný)</span>}
          </span>
          <span className="text-muted-foreground">{buildType(p.business_type)?.name ?? "typ nezvolen"}</span>
          <GateDots p={p} />
          <span className="text-muted-foreground">
            {p.certificates} osvědč. · {p.ai_calls}× AI
          </span>
          <span className="text-muted-foreground">aktivita {ago(p.last_activity)}</span>
        </li>
      ))}
    </ul>
  );

const AdminPage = () => {
  const isAdmin = useIsAdmin();
  const [data, setData] = useState<AdminOverview | null>(null);
  const [events, setEvents] = useState<EventStats | null>(null);
  const [quiz, setQuiz] = useState<QuizStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("vse");
  const [open, setOpen] = useState<string | null>(null);
  const [tags, setTags] = useState<UserTag[]>([]);
  const [tagLinks, setTagLinks] = useState<Record<string, string[]>>({});
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  const reloadTags = useCallback(() => {
    loadTags()
      .then(({ tags, links }) => {
        setTags(tags);
        setTagLinks(links);
      })
      .catch(() => undefined);
  }, []);
  useEffect(() => {
    if (isAdmin) reloadTags();
  }, [isAdmin, reloadTags]);

  const toggleTag = async (userId: string, tagId: string, on: boolean) => {
    setTagLinks((m) => ({
      ...m,
      [userId]: on ? [...(m[userId] ?? []), tagId] : (m[userId] ?? []).filter((t) => t !== tagId),
    }));
    try {
      await setUserTag(userId, tagId, on);
    } catch {
      reloadTags();
    }
  };
  const addNewTag = async (userId: string, name: string, color: TagColor) => {
    const t = await createTag(name, color);
    setTags((l) => [...l, t].sort((a, b) => a.name.localeCompare(b.name, "cs")));
    await toggleTag(userId, t.id, true);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overview, ev, qs] = await Promise.all([
        loadAdminOverview(),
        loadEventStats(30).catch(() => null),
        loadQuizStats().catch(() => null),
      ]);
      setData(overview);
      setEvents(ev);
      setQuiz(qs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Načtení se nepodařilo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const users = useMemo(() => data?.users ?? [], [data]);
  const stats = useMemo(() => adminStats(users), [users]);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (filter === "aktivni" && daysAgo(u.last_sign_in_at) > 7) return false;
      if (filter === "platici" && !u.paid) return false;
      if (filter === "klub" && !u.klub) return false;
      if (tagFilter && !(tagLinks[u.id] ?? []).includes(tagFilter)) return false;
      if (!q) return true;
      return [u.name, u.email, u.phone, ...u.projects.map((p) => p.name)].some((v) => v?.toLowerCase().includes(q));
    });
  }, [users, query, filter, tagFilter, tagLinks]);

  if (isAdmin === false) return <Navigate to="/home" replace />;

  const exportCsv = () => {
    const tagNames = (id: string) =>
      (tagLinks[id] ?? []).map((t) => tags.find((x) => x.id === t)?.name).filter(Boolean) as string[];
    const blob = new Blob([usersCsv(shown, tagNames)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `visible7-uzivatele-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const maxFunnel = Math.max(1, ...stats.funnel.map((f) => f.count));

  return (
    <SidebarLayout>
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link
              to="/home"
              className="mb-2 inline-block text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              ← Zpět do přehledu
            </Link>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-primary">
              <ShieldCheck className="h-4 w-4" /> Jen pro správce
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight">Administrace</h1>
            {data && (
              <p className="text-sm text-muted-foreground">
                Stav k {new Date(data.generated_at).toLocaleString("cs-CZ")}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-[10px]" onClick={load} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Obnovit
            </Button>
            <Button className="rounded-[10px]" onClick={exportCsv} disabled={!shown.length}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>
        </header>

        {error && <p className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">{error}</p>}
        {!data && !error && <p className="text-muted-foreground">Načítám…</p>}

        {data && (
          <>
            <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6" aria-label="Souhrn">
              <Stat label="Registrace" value={stats.users} hint={`+${stats.new7} za 7 dní`} />
              <Stat label="Aktivní 7 dní" value={stats.active7} hint="přihlásili se" />
              <Stat
                label="Platící"
                value={stats.paid}
                hint={`${stats.users ? Math.round((stats.paid / stats.users) * 100) : 0} % registrací`}
              />
              <Stat label="Projekty" value={stats.projects} hint="bez archivovaných" />
              <Stat label="Klub VISIBLE7" value={stats.klub} hint="souhlas" />
              <Stat label="Marketing" value={stats.marketing} hint="souhlas s e-maily" />
            </section>

            <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
              <h2 className="text-lg font-bold">Kam projekty došly</h2>
              <p className="text-sm text-muted-foreground">Počet aktivních projektů, které splnily danou bránu.</p>
              <ol className="mt-4 space-y-2">
                {stats.funnel.map((f) => (
                  <li
                    key={f.gate}
                    className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)_2.5rem] items-center gap-3 text-sm"
                  >
                    <span className="truncate">
                      {f.gate === 0 ? "0 Rentgen nápadu" : `${f.gate} ${GATE_NAMES[f.gate]}`}
                    </span>
                    <span className="h-3 overflow-hidden rounded-full bg-muted">
                      <span
                        className="block h-full rounded-full bg-primary"
                        style={{ width: `${(f.count / maxFunnel) * 100}%` }}
                      />
                    </span>
                    <span className="text-right font-semibold tabular-nums">{f.count}</span>
                  </li>
                ))}
              </ol>
            </section>

            {events && (
              <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
                <h2 className="text-lg font-bold">Co lidé dělají (posledních {events.days} dní)</h2>
                <p className="text-sm text-muted-foreground">Počet událostí a kolik různých uživatelů je udělalo.</p>
                {events.events.length === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">Zatím žádné události.</p>
                ) : (
                  <table className="mt-4 w-full text-sm">
                    <thead className="text-left text-xs text-muted-foreground">
                      <tr>
                        <th className="py-2 font-semibold">Událost</th>
                        <th className="py-2 text-right font-semibold">Počet</th>
                        <th className="py-2 text-right font-semibold">Uživatelů</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.events.map((e) => (
                        <tr key={e.name} className="border-t border-border">
                          <td className="py-2">{EVENT_LABELS[e.name] ?? e.name}</td>
                          <td className="py-2 text-right tabular-nums">{e.count}</td>
                          <td className="py-2 text-right font-semibold tabular-nums">{e.users}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            )}

            <BlockVideosAdmin />

            <WorksheetsAdmin />

            <SeminarsAdmin />

            <AnnouncementsAdmin users={stats.users} />

            <RemindersAdmin />

            {quiz && <AudienceSection quiz={quiz} />}

            <ShopAdmin />

            <PromoCodesAdmin emails={Object.fromEntries(users.map((u) => [u.id, u.email]))} />

            <section className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Hledat jméno, e-mail, telefon nebo projekt"
                    className="pl-9"
                    aria-label="Hledat uživatele"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtr">
                  {FILTERS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFilter(f.id)}
                      aria-pressed={filter === f.id}
                      className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                        filter === f.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground/80 hover:bg-muted/70"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filtr podle štítku">
                  <span className="text-sm text-muted-foreground">Štítek:</span>
                  {tags.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTagFilter(tagFilter === t.id ? null : t.id)}
                      aria-pressed={tagFilter === t.id}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
                        tagFilter === t.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground/80 hover:bg-muted/70"
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${TAG_DOT[t.color]}`} /> {t.name} (
                      {Object.values(tagLinks).filter((l) => l.includes(t.id)).length})
                    </button>
                  ))}
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Zobrazeno {shown.length} z {users.length}
              </p>

              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <table className="w-full text-sm">
                  <thead className="hidden bg-muted/50 text-left text-xs font-semibold text-muted-foreground md:table-header-group">
                    <tr>
                      <th className="p-3">Uživatel</th>
                      <th className="p-3">Registrace</th>
                      <th className="p-3">Naposledy</th>
                      <th className="p-3">Tarif</th>
                      <th className="p-3">Projekty a postup</th>
                      <th className="p-3">Souhlasy</th>
                      <th className="p-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((u: AdminUser) => {
                      const active = u.projects.filter((p) => !p.archived_at);
                      const best = [...active].sort((a, b) => b.gates.length - a.gates.length)[0];
                      const expanded = open === u.id;
                      return (
                        <Fragment key={u.id}>
                          <tr
                            className="cursor-pointer border-t border-border align-top hover:bg-muted/40 max-md:grid max-md:grid-cols-2 max-md:gap-x-3 max-md:gap-y-1 max-md:p-3"
                            onClick={() => setOpen(expanded ? null : u.id)}
                          >
                            <td className="p-3 max-md:col-span-2 max-md:p-0">
                              <p className="font-semibold">
                                {u.name ?? "Bez jména"}
                                {u.is_admin && (
                                  <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                    správce
                                  </span>
                                )}
                              </p>
                              <p className="break-all text-muted-foreground">{u.email}</p>
                              {!u.confirmed && <p className="text-xs text-amber-700">e-mail nepotvrzen</p>}
                              {(tagLinks[u.id] ?? []).length > 0 && (
                                <span className="mt-1 flex flex-wrap gap-1">
                                  {tags
                                    .filter((t) => tagLinks[u.id]?.includes(t.id))
                                    .map((t) => (
                                      <TagChip key={t.id} tag={t} />
                                    ))}
                                </span>
                              )}
                            </td>
                            <td className="p-3 max-md:p-0">
                              <span className="text-xs text-muted-foreground md:hidden">Registrace </span>
                              {fmtDate(u.created_at)}
                            </td>
                            <td className="p-3 max-md:p-0">
                              <span className="text-xs text-muted-foreground md:hidden">Naposledy </span>
                              {ago(u.last_sign_in_at)}
                            </td>
                            <td className="p-3 max-md:p-0">
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                  u.paid ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {PLAN[u.plan] ?? u.plan}
                              </span>
                              {u.access_until && (
                                <span className="block text-xs text-muted-foreground">
                                  do {fmtDate(u.access_until)}
                                </span>
                              )}
                            </td>
                            <td className="p-3 max-md:col-span-2 max-md:p-0">
                              {best ? (
                                <span className="flex flex-wrap items-center gap-2">
                                  <span className="max-w-[14rem] truncate font-medium">{best.name}</span>
                                  <GateDots p={best} />
                                  {active.length > 1 && (
                                    <span className="text-xs text-muted-foreground">+{active.length - 1} další</span>
                                  )}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">bez projektu</span>
                              )}
                            </td>
                            <td className="p-3 max-md:p-0">
                              <span className="flex gap-2 text-xs">
                                <span className={u.klub ? "text-emerald-700" : "text-muted-foreground"}>
                                  {u.klub ? <Check className="inline h-3 w-3" /> : "–"} klub
                                </span>
                                <span className={u.marketing ? "text-emerald-700" : "text-muted-foreground"}>
                                  {u.marketing ? <Check className="inline h-3 w-3" /> : "–"} e-maily
                                </span>
                              </span>
                            </td>
                            <td className="p-3 text-right max-md:hidden">
                              <ChevronDown
                                className={`ml-auto h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
                              />
                            </td>
                          </tr>
                          {expanded && (
                            <tr className="border-t border-border bg-muted/30 max-md:block">
                              <td colSpan={7} className="space-y-3 p-4 max-md:block">
                                <div className="flex flex-wrap gap-4 text-sm">
                                  <a
                                    href={`mailto:${u.email}`}
                                    className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
                                  >
                                    <Mail className="h-4 w-4" /> {u.email}
                                  </a>
                                  {u.phone && (
                                    <a
                                      href={`tel:${u.phone.replace(/\s/g, "")}`}
                                      className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
                                    >
                                      <Phone className="h-4 w-4" /> {u.phone}
                                    </a>
                                  )}
                                  {u.promo_code_used && (
                                    <span className="text-muted-foreground">promo kód: {u.promo_code_used}</span>
                                  )}
                                </div>
                                <UserTagEditor
                                  tags={tags}
                                  selected={tagLinks[u.id] ?? []}
                                  onToggle={(tagId, on) => toggleTag(u.id, tagId, on)}
                                  onCreate={(name, color) => addNewTag(u.id, name, color)}
                                />
                                <ProjectList projects={u.projects} />
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                    {shown.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-muted-foreground">
                          Nikdo neodpovídá filtru.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
            <p className="text-xs text-muted-foreground">
              Přehled ukazuje kontaktní údaje a postup. Obsah projektů (texty, čísla) z ochrany soukromí nezobrazuje.
            </p>
          </>
        )}
      </div>
    </SidebarLayout>
  );
};

export default AdminPage;

const DIMS: { id: string; title: string }[] = [
  { id: "gender", title: "Pohlaví" },
  { id: "age", title: "Věk" },
  { id: "region", title: "Kraj" },
  { id: "education", title: "Vzdělání" },
  { id: "status", title: "Co teď dělají" },
  { id: "type", title: "Typ podnikatele" },
  { id: "barrier", title: "Hlavní brzda" },
];

const optionLabel = (dim: string, value: string) => {
  if (dim === "type") return TYPES[value as keyof typeof TYPES]?.name ?? value;
  if (dim === "barrier") return BARRIERS[value as keyof typeof BARRIERS]?.name ?? value;
  const q = ROUNDS[0].questions.find((x) => x.id === dim);
  return q?.options?.find((o) => o.value === value)?.label ?? value;
};

function AudienceSection({ quiz }: { quiz: QuizStats }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const exportResearch = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const { csv, count } = await researchCsv();
      if (!count) {
        setMsg("Zatím nikdo nedal souhlas s použitím odpovědí pro výzkum.");
        return;
      }
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `visible7-vyzkum-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Export se nepodařil.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Kdo jsou uživatelé</h2>
          <p className="text-sm text-muted-foreground">
            Z kvízu „Jaký jste typ podnikatele“: {quiz.respondents} vyplnilo, {quiz.research_consents} souhlasí s
            výzkumem, {quiz.repeated} zopakovalo po bráně.
          </p>
        </div>
        <Button variant="outline" className="rounded-[10px]" onClick={exportResearch} disabled={busy}>
          <Download className="mr-2 h-4 w-4" /> Export pro výzkum (CSV)
        </Button>
      </div>
      {msg && <p className="mt-3 text-sm text-muted-foreground">{msg}</p>}
      {quiz.respondents === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Kvíz zatím nikdo nevyplnil.</p>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DIMS.map((d) => {
            const vals = quiz.dims[d.id] ?? [];
            const total = vals.reduce((s, v) => s + v.count, 0) || 1;
            return (
              <div key={d.id}>
                <h3 className="text-sm font-semibold">{d.title}</h3>
                <ul className="mt-2 space-y-1.5">
                  {vals.map((v) => (
                    <li
                      key={v.value}
                      className="grid grid-cols-[minmax(0,8rem)_minmax(0,1fr)_4.5rem] items-center gap-2 text-xs"
                    >
                      <span className="truncate">{optionLabel(d.id, v.value)}</span>
                      <span className="h-2 overflow-hidden rounded-full bg-muted">
                        <span
                          className="block h-full rounded-full bg-primary"
                          style={{ width: `${(v.count / total) * 100}%` }}
                        />
                      </span>
                      <span className="whitespace-nowrap text-right tabular-nums">
                        {v.count}{" "}
                        <span className="text-muted-foreground">({Math.round((v.count / total) * 100)} %)</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
      <p className="mt-4 text-xs text-muted-foreground">
        Export obsahuje jen lidi se souhlasem, místo jména pseudonym. Přehled nahoře počítá všechny vyplněné kvízy.
      </p>
    </section>
  );
}
