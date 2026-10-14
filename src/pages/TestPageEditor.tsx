import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Check,
  ChevronDown,
  Copy,
  Download,
  ExternalLink,
  EyeOff,
  FlaskConical,
  ImagePlus,
  Loader2,
  Monitor,
  Palette,
  PenLine,
  Plus,
  RefreshCw,
  Rocket,
  Smartphone,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { SidebarLayout } from "@/components/layout/AppSidebar";
import { TestPageView } from "@/components/testpage/TestPageView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/AuthGate";
import { useProject } from "@/contexts/ProjectContext";
import { useToast } from "@/hooks/use-toast";
import { celebrate } from "@/lib/celebrate";
import { track } from "@/lib/track";
import {
  ACCENTS,
  BLOCK_LABELS,
  BlockId,
  Lead,
  PageContent,
  PagePatch,
  SOURCES,
  SOURCE_LABELS,
  StatRow,
  TEMPLATES,
  TestPage,
  createPage,
  deleteLead,
  evaluate,
  generateCopy,
  leadsCsv,
  loadLeads,
  loadMyPage,
  loadStats,
  pageUrl,
  savePage,
  uploadImage,
  validSlug,
} from "@/lib/testPage";

type Tab = "obsah" | "vzhled" | "zverejneni" | "vysledky";

const Field = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (
  <label className="block space-y-1 text-sm">
    <span className="font-semibold">{label}</span>
    {children}
    {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
  </label>
);

/** Seznam krátkých textů (body problému, pro koho to je…). */
const StringList = ({
  items,
  onChange,
  max = 5,
  placeholder,
}: {
  items: string[];
  onChange: (v: string[]) => void;
  max?: number;
  placeholder?: string;
}) => (
  <div className="space-y-2">
    {items.map((it, i) => (
      <div key={i} className="flex gap-1.5">
        <Input
          value={it}
          maxLength={200}
          placeholder={placeholder}
          onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
        />
        <button
          type="button"
          onClick={() => onChange(items.filter((_, j) => j !== i))}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
          aria-label="Odebrat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    ))}
    {items.length < max && (
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="flex items-center gap-1 text-sm font-semibold text-primary"
      >
        <Plus className="h-4 w-4" /> Přidat
      </button>
    )}
  </div>
);

const VERDICT = {
  data: {
    label: "Sbíráme data",
    cls: "bg-muted text-foreground",
    text: "Dokud nemáte dost návštěv, výsledek nic neříká.",
  },
  zelena: {
    label: "Zelená: zájem je",
    cls: "bg-emerald-100 text-emerald-900",
    text: "Splnili jste cíl testu. Můžete s klidem stavět v bráně 4.",
  },
  oranzova: {
    label: "Oranžová: zájem je slabší",
    cls: "bg-amber-100 text-amber-900",
    text: "Něco lidi zajímá, ale málo. Zkuste ostřejší nadpis, jinou cenu nebo jiné publikum.",
  },
  cervena: {
    label: "Červená: zájem se nepotvrdil",
    cls: "bg-red-100 text-red-900",
    text: "V téhle podobě nabídka netáhne. Vraťte se k bráně 1: problém, zákazník, odlišení.",
  },
};

const TestPageEditor = () => {
  const { user } = useAuth();
  const { currentProject } = useProject();
  const { toast } = useToast();
  const [page, setPage] = useState<TestPage | null | undefined>(undefined);
  const [tab, setTab] = useState<Tab>("obsah");
  const [mobile, setMobile] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [creating, setCreating] = useState(false);
  const [open, setOpen] = useState<BlockId | null>("hero");
  const [slug, setSlug] = useState("");
  const [stats, setStats] = useState<StatRow[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [ai, setAi] = useState(false);
  const pending = useRef<PagePatch>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!currentProject) return;
    setPage(undefined);
    loadMyPage(currentProject.id).then((p) => {
      setPage(p);
      if (p) setSlug(p.slug);
    });
  }, [currentProject]);

  const refreshResults = useCallback(async () => {
    if (!page) return;
    const [s, l] = await Promise.all([loadStats(page.id), loadLeads(page.id)]);
    setStats(s);
    setLeads(l);
    try {
      const k = `tp_first_lead_${page.id}`;
      if (l.length > 0 && !localStorage.getItem(k)) {
        localStorage.setItem(k, "1");
        celebrate("big");
        toast({ title: "Máte prvního zájemce!", description: "Někdo o vaši nabídku opravdu stojí." });
      }
    } catch {
      /* bez úložiště */
    }
  }, [page, toast]);

  useEffect(() => {
    if (page?.id) refreshResults();
    // jen při načtení stránky
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page?.id]);

  useEffect(() => {
    if (window.location.hash === "#upozorneni") setTab("zverejneni");
  }, []);

  const flush = useCallback(async () => {
    if (!page) return;
    const patch = pending.current;
    pending.current = {};
    if (!Object.keys(patch).length) return;
    setSaving("saving");
    try {
      await savePage(page.id, patch);
      setSaving("saved");
    } catch (e) {
      setSaving("error");
      toast({ title: "Neuloženo", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  }, [page, toast]);

  const update = (patch: PagePatch) => {
    setPage((p) => (p ? { ...p, ...patch } : p));
    pending.current = { ...pending.current, ...patch };
    setSaving("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, 700);
  };
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const setContent = <K extends keyof PageContent>(k: K, v: PageContent[K]) =>
    page && update({ content: { ...page.content, [k]: v } });

  const create = async () => {
    if (!currentProject || !user) return;
    setCreating(true);
    try {
      const p = await createPage(currentProject.id, currentProject.name, user.email ?? "");
      setPage(p);
      setSlug(p.slug);
      celebrate("small");
      track("test_page_created", {}, currentProject.id);
    } catch (e) {
      toast({ title: "Nepodařilo se", description: e instanceof Error ? e.message : "", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const ready = !!page && page.operator_name.trim().length > 1 && /\S+@\S+\.\S+/.test(page.operator_email);

  const publish = async (on: boolean) => {
    if (!page) return;
    if (on && !ready) {
      setTab("zverejneni");
      toast({ title: "Doplňte provozovatele", description: "Jméno a e-mail musí být na stránce kvůli zákonu." });
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    await flush();
    const patch: PagePatch = { status: on ? "published" : "draft" };
    if (on && !page.published_at) patch.published_at = new Date().toISOString();
    try {
      await savePage(page.id, patch);
      setPage({ ...page, ...patch });
      if (on) {
        celebrate("big");
        toast({ title: "Stránka je venku!", description: "Teď na ni přiveďte prvních 100 lidí." });
        track("test_page_published", {}, page.project_id);
      }
    } catch (e) {
      toast({ title: "Nepodařilo se", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Zkopírováno", description: text });
    } catch {
      toast({ title: "Odkaz", description: text });
    }
  };

  const upload = async (kind: "logo" | "hero", file?: File) => {
    if (!file || !page || !user) return;
    try {
      const url = await uploadImage(user.id, page.id, kind, file);
      update(kind === "logo" ? { logo_url: url } : { hero_url: url });
    } catch (e) {
      toast({ title: "Obrázek", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  };

  const suggest = async () => {
    if (!page) return;
    if (!window.confirm("AI přepíše texty stránky podle bran 1–3. Vaše současné texty se nahradí. Pokračovat?")) return;
    setAi(true);
    try {
      const content = await generateCopy(page.project_id, page.content);
      update({ content });
      toast({ title: "Texty jsou připravené", description: "Projděte je a upravte podle sebe." });
    } catch (e) {
      toast({ title: "AI teď nepomohla", description: e instanceof Error ? e.message : "", variant: "destructive" });
    } finally {
      setAi(false);
    }
  };

  const totals = useMemo(
    () =>
      stats.reduce((a, r) => ({ visits: a.visits + r.visits, clicks: a.clicks + r.clicks, leads: a.leads + r.leads }), {
        visits: 0,
        clicks: 0,
        leads: 0,
      }),
    [stats],
  );
  const bySource = useMemo(() => {
    const m: Record<string, { visits: number; clicks: number; leads: number }> = {};
    for (const r of stats) {
      const x = (m[r.source] ??= { visits: 0, clicks: 0, leads: 0 });
      x.visits += r.visits;
      x.clicks += r.clicks;
      x.leads += r.leads;
    }
    return Object.entries(m).sort((a, b) => b[1].visits - a[1].visits);
  }, [stats]);

  if (!currentProject || page === undefined)
    return (
      <SidebarLayout>
        <Loader2 className="mx-auto mt-24 h-8 w-8 animate-spin text-muted-foreground" />
      </SidebarLayout>
    );

  if (page === null)
    return (
      <SidebarLayout>
        <main className="mx-auto max-w-3xl px-4 py-10 sm:px-8">
          <section className="rounded-[28px] bg-primary p-6 text-white sm:p-10">
            <p className="flex items-center gap-2 text-sm font-semibold text-orange-300">
              <FlaskConical className="h-4 w-4" /> Než začnete stavět
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Otestujte zájem jednoduchou stránkou
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-white/80">
              Z toho, co máte v branách 1–3, složíme konverzní stránku. Přivedete na ni 100 lidí ze své cílovky a za pár
              dní víte, jestli o nabídku někdo stojí. Dřív, než do ní dáte měsíce práce.
            </p>
            <ol className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ["1", "Upravte texty", "Předvyplníme je z vašich bran."],
                ["2", "Zveřejněte", "Dostanete odkaz pro reklamu i sdílení."],
                ["3", "Sledujte zájemce", "Návštěvy, zápisy a vyhodnocení."],
              ].map(([n, t, d]) => (
                <li key={n} className="rounded-2xl bg-white/10 p-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 font-bold">
                    {n}
                  </span>
                  <p className="mt-2 font-bold">{t}</p>
                  <p className="text-sm text-white/70">{d}</p>
                </li>
              ))}
            </ol>
            <Button
              onClick={create}
              disabled={creating}
              className="mt-8 h-12 rounded-[10px] bg-orange-500 px-6 text-base font-semibold text-white hover:bg-orange-600"
            >
              {creating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
              Vytvořit testovací stránku
            </Button>
          </section>
        </main>
      </SidebarLayout>
    );

  const c = page.content;
  const ev = evaluate(totals.visits, totals.leads, page.goal_visits, Number(page.goal_rate));
  const url = pageUrl(page.slug);
  const publicView = { ...page, project_name: currentProject.name };

  const move = (b: BlockId, dir: -1 | 1) => {
    const order = [...c.order];
    const i = order.indexOf(b);
    const j = i + dir;
    if (j < 1 || j >= order.length - 1) return; // úvod první, formulář poslední
    [order[i], order[j]] = [order[j], order[i]];
    setContent("order", order);
  };

  const blockFields = (b: BlockId) => {
    switch (b) {
      case "hero":
        return (
          <>
            <Field label="Nadpis" hint="Co člověk získá, jedním řádkem.">
              <Input
                value={c.hero.title}
                maxLength={120}
                onChange={(e) => setContent("hero", { ...c.hero, title: e.target.value })}
              />
            </Field>
            <Field label="Podnadpis">
              <Textarea
                value={c.hero.subtitle}
                maxLength={260}
                rows={3}
                onChange={(e) => setContent("hero", { ...c.hero, subtitle: e.target.value })}
              />
            </Field>
            <Field label="Text tlačítka">
              <Input
                value={c.hero.cta}
                maxLength={40}
                onChange={(e) => setContent("hero", { ...c.hero, cta: e.target.value })}
              />
            </Field>
          </>
        );
      case "problem":
        return (
          <>
            <Field label="Nadpis">
              <Input
                value={c.problem.title}
                maxLength={80}
                onChange={(e) => setContent("problem", { ...c.problem, title: e.target.value })}
              />
            </Field>
            <Field label="Problémy zákazníka">
              <StringList
                items={c.problem.items}
                onChange={(items) => setContent("problem", { ...c.problem, items })}
              />
            </Field>
          </>
        );
      case "solution":
        return (
          <>
            <Field label="Nadpis">
              <Input
                value={c.solution.title}
                maxLength={100}
                onChange={(e) => setContent("solution", { ...c.solution, title: e.target.value })}
              />
            </Field>
            <Field label="Text">
              <Textarea
                value={c.solution.text}
                maxLength={900}
                rows={5}
                onChange={(e) => setContent("solution", { ...c.solution, text: e.target.value })}
              />
            </Field>
          </>
        );
      case "benefits":
        return (
          <>
            <Field label="Nadpis">
              <Input
                value={c.benefits.title}
                maxLength={80}
                onChange={(e) => setContent("benefits", { ...c.benefits, title: e.target.value })}
              />
            </Field>
            {c.benefits.items.map((it, i) => (
              <div key={i} className="space-y-1.5 rounded-xl border border-border p-3">
                <div className="flex gap-1.5">
                  <Input
                    value={it.title}
                    maxLength={80}
                    placeholder={`Výhoda ${i + 1}`}
                    onChange={(e) =>
                      setContent("benefits", {
                        ...c.benefits,
                        items: c.benefits.items.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)),
                      })
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setContent("benefits", { ...c.benefits, items: c.benefits.items.filter((_, j) => j !== i) })
                    }
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                    aria-label="Odebrat výhodu"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <Textarea
                  value={it.text}
                  maxLength={240}
                  rows={2}
                  placeholder="Krátké vysvětlení (nepovinné)"
                  onChange={(e) =>
                    setContent("benefits", {
                      ...c.benefits,
                      items: c.benefits.items.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)),
                    })
                  }
                />
              </div>
            ))}
            {c.benefits.items.length < 6 && (
              <button
                type="button"
                onClick={() =>
                  setContent("benefits", { ...c.benefits, items: [...c.benefits.items, { title: "", text: "" }] })
                }
                className="flex items-center gap-1 text-sm font-semibold text-primary"
              >
                <Plus className="h-4 w-4" /> Přidat výhodu
              </button>
            )}
          </>
        );
      case "audience":
        return (
          <>
            <Field label="Nadpis">
              <Input
                value={c.audience.title}
                maxLength={80}
                onChange={(e) => setContent("audience", { ...c.audience, title: e.target.value })}
              />
            </Field>
            <Field label="Je to pro vás, pokud…">
              <StringList items={c.audience.yes} onChange={(yes) => setContent("audience", { ...c.audience, yes })} />
            </Field>
            <Field label="Není to pro vás, pokud…">
              <StringList items={c.audience.no} onChange={(no) => setContent("audience", { ...c.audience, no })} />
            </Field>
          </>
        );
      case "price":
        return (
          <>
            <Field label="Nadpis">
              <Input
                value={c.price.title}
                maxLength={80}
                onChange={(e) => setContent("price", { ...c.price, title: e.target.value })}
              />
            </Field>
            <Field label="Cena" hint="Např. 1 290 Kč nebo od 490 Kč měsíčně. Z byznys casu jsme ji předvyplnili.">
              <Input
                value={c.price.amount}
                maxLength={40}
                onChange={(e) => setContent("price", { ...c.price, amount: e.target.value })}
              />
            </Field>
            <Field label="Poznámka">
              <Textarea
                value={c.price.note}
                maxLength={240}
                rows={2}
                onChange={(e) => setContent("price", { ...c.price, note: e.target.value })}
              />
            </Field>
          </>
        );
      case "faq":
        return (
          <>
            <Field label="Nadpis">
              <Input
                value={c.faq.title}
                maxLength={80}
                onChange={(e) => setContent("faq", { ...c.faq, title: e.target.value })}
              />
            </Field>
            {c.faq.items.map((it, i) => (
              <div key={i} className="space-y-1.5 rounded-xl border border-border p-3">
                <div className="flex gap-1.5">
                  <Input
                    value={it.q}
                    maxLength={140}
                    placeholder="Otázka"
                    onChange={(e) =>
                      setContent("faq", {
                        ...c.faq,
                        items: c.faq.items.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)),
                      })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setContent("faq", { ...c.faq, items: c.faq.items.filter((_, j) => j !== i) })}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                    aria-label="Odebrat otázku"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <Textarea
                  value={it.a}
                  maxLength={500}
                  rows={2}
                  placeholder="Odpověď"
                  onChange={(e) =>
                    setContent("faq", {
                      ...c.faq,
                      items: c.faq.items.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)),
                    })
                  }
                />
              </div>
            ))}
            {c.faq.items.length < 8 && (
              <button
                type="button"
                onClick={() => setContent("faq", { ...c.faq, items: [...c.faq.items, { q: "", a: "" }] })}
                className="flex items-center gap-1 text-sm font-semibold text-primary"
              >
                <Plus className="h-4 w-4" /> Přidat otázku
              </button>
            )}
          </>
        );
      case "form":
        return (
          <>
            <Field label="Nadpis">
              <Input
                value={c.form.title}
                maxLength={80}
                onChange={(e) => setContent("form", { ...c.form, title: e.target.value })}
              />
            </Field>
            <Field label="Text">
              <Textarea
                value={c.form.text}
                maxLength={240}
                rows={2}
                onChange={(e) => setContent("form", { ...c.form, text: e.target.value })}
              />
            </Field>
            <Field label="Tlačítko">
              <Input
                value={c.form.button}
                maxLength={40}
                onChange={(e) => setContent("form", { ...c.form, button: e.target.value })}
              />
            </Field>
            <Field label="Poděkování po zápisu">
              <Input
                value={c.form.success}
                maxLength={160}
                onChange={(e) => setContent("form", { ...c.form, success: e.target.value })}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={c.form.askName} onCheckedChange={(v) => setContent("form", { ...c.form, askName: v })} />{" "}
              Ptát se i na jméno
            </label>
          </>
        );
    }
  };

  const tabs: { id: Tab; label: string; icon: typeof PenLine }[] = [
    { id: "obsah", label: "Obsah", icon: PenLine },
    { id: "vzhled", label: "Vzhled", icon: Palette },
    { id: "zverejneni", label: "Zveřejnění", icon: Rocket },
    { id: "vysledky", label: `Výsledky${totals.leads ? ` (${totals.leads})` : ""}`, icon: BarChart3 },
  ];

  const editor = (
    <div className="space-y-4">
      {tab === "obsah" && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-orange-50 p-4 ring-1 ring-orange-200">
            <p className="text-sm">Texty jsme předvyplnili z bran 1–3. AI je umí přepsat do prodejnější podoby.</p>
            <Button
              size="sm"
              onClick={suggest}
              disabled={ai}
              className="rounded-[10px] bg-orange-500 text-white hover:bg-orange-600"
            >
              {ai ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1.5 h-4 w-4" />}
              Navrhnout texty s AI
            </Button>
          </div>
          <ul className="space-y-2">
            {c.order.map((b, i) => {
              const off = c.off.includes(b);
              const fixed = b === "hero" || b === "form";
              return (
                <li key={b} className="rounded-2xl border border-border bg-card">
                  <div className="flex items-center gap-1 p-2 pl-3">
                    <button
                      type="button"
                      onClick={() => setOpen(open === b ? null : b)}
                      className={`flex flex-1 items-center gap-2 text-left font-semibold ${off ? "text-muted-foreground line-through" : ""}`}
                      aria-expanded={open === b}
                    >
                      <ChevronDown className={`h-4 w-4 transition-transform ${open === b ? "rotate-180" : ""}`} />
                      {BLOCK_LABELS[b]}
                    </button>
                    {!fixed && (
                      <>
                        <button
                          type="button"
                          onClick={() => move(b, -1)}
                          disabled={i <= 1}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-30"
                          aria-label={`Posunout ${BLOCK_LABELS[b]} nahoru`}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => move(b, 1)}
                          disabled={i >= c.order.length - 2}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-30"
                          aria-label={`Posunout ${BLOCK_LABELS[b]} dolů`}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <Switch
                          checked={!off}
                          onCheckedChange={(v) => setContent("off", v ? c.off.filter((x) => x !== b) : [...c.off, b])}
                          aria-label={`Zobrazit blok ${BLOCK_LABELS[b]}`}
                          className="ml-1"
                        />
                      </>
                    )}
                  </div>
                  {open === b && <div className="space-y-3 border-t border-border p-4">{blockFields(b)}</div>}
                </li>
              );
            })}
          </ul>
        </>
      )}

      {tab === "vzhled" && (
        <>
          <section className="rounded-2xl border border-border bg-card p-4">
            <h3 className="font-bold">Šablona</h3>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => update({ template: t.id })}
                  aria-pressed={page.template === t.id}
                  className={`rounded-xl border p-3 text-left text-sm ${
                    page.template === t.id
                      ? "border-primary ring-2 ring-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span
                    className="mb-2 block h-10 rounded-lg"
                    style={{
                      background: t.id === "tmava" ? "#0b1220" : t.id === "tepla" ? "#f3e9dc" : "#f1f5f9",
                      borderBottom: `6px solid ${page.accent}`,
                    }}
                  />
                  <span className="block font-bold">{t.label}</span>
                  <span className="block text-xs text-muted-foreground">{t.text}</span>
                </button>
              ))}
            </div>
          </section>
          <section className="rounded-2xl border border-border bg-card p-4">
            <h3 className="font-bold">Hlavní barva</h3>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {ACCENTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => update({ accent: a })}
                  aria-label={`Barva ${a}`}
                  aria-pressed={page.accent === a}
                  className={`h-9 w-9 rounded-full ring-offset-2 ${page.accent === a ? "ring-2 ring-foreground" : ""}`}
                  style={{ background: a }}
                />
              ))}
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                vlastní
                <input
                  type="color"
                  value={page.accent}
                  onChange={(e) => update({ accent: e.target.value })}
                  className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent"
                />
              </label>
            </div>
          </section>
          {(["logo", "hero"] as const).map((kind) => {
            const val = kind === "logo" ? page.logo_url : page.hero_url;
            return (
              <section key={kind} className="rounded-2xl border border-border bg-card p-4">
                <h3 className="font-bold">{kind === "logo" ? "Logo" : "Úvodní obrázek"}</h3>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG nebo WebP do 3 MB.{kind === "hero" ? " Ideálně fotka produktu nebo vás při práci." : ""}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  {val && <img src={val} alt="" className="h-14 w-20 rounded-lg object-cover ring-1 ring-border" />}
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-muted">
                    <ImagePlus className="h-4 w-4" /> {val ? "Změnit" : "Nahrát"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={(e) => upload(kind, e.target.files?.[0])}
                    />
                  </label>
                  {val && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => update(kind === "logo" ? { logo_url: null } : { hero_url: null })}
                    >
                      Odebrat
                    </Button>
                  )}
                </div>
              </section>
            );
          })}
        </>
      )}

      {tab === "zverejneni" && (
        <>
          <section className="rounded-2xl border border-border bg-card p-4">
            <h3 className="font-bold">Adresa stránky</h3>
            <div className="mt-2 flex items-center gap-1 text-sm">
              <span className="shrink-0 text-muted-foreground">{window.location.host}/t/</span>
              <Input
                value={slug}
                maxLength={60}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                onBlur={() => {
                  if (slug === page.slug) return;
                  if (!validSlug(slug)) {
                    toast({ title: "Adresa", description: "3–60 znaků: malá písmena, číslice a pomlčky." });
                    setSlug(page.slug);
                    return;
                  }
                  update({ slug });
                }}
                aria-label="Adresa stránky"
              />
            </div>
          </section>
          <section className="rounded-2xl border border-border bg-card p-4">
            <h3 className="font-bold">Provozovatel stránky</h3>
            <p className="text-xs text-muted-foreground">
              Na stránce musí být, kdo sbírá e-maily. Zájemci svěřují e-mail vám, ne VISIBLE7.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Jméno nebo firma">
                <Input
                  value={page.operator_name}
                  maxLength={120}
                  onChange={(e) => update({ operator_name: e.target.value })}
                  placeholder="Jana Nováková"
                />
              </Field>
              <Field label="Kontaktní e-mail">
                <Input
                  type="email"
                  value={page.operator_email}
                  maxLength={160}
                  onChange={(e) => update({ operator_email: e.target.value })}
                />
              </Field>
            </div>
          </section>
          <section className="rounded-2xl border border-border bg-card p-4">
            <h3 className="font-bold">Odkazy pro reklamu a sdílení</h3>
            <p className="text-xs text-muted-foreground">
              Každý zdroj má vlastní odkaz. Ve výsledcích pak uvidíte, odkud zájemci přišli.
            </p>
            <ul className="mt-3 space-y-1.5">
              {SOURCES.map((s) => (
                <li key={s.id} className="flex items-center gap-2 text-sm">
                  <span className="w-32 shrink-0 font-semibold">{s.label}</span>
                  <code className="min-w-0 flex-1 truncate rounded bg-muted px-2 py-1 text-xs">
                    {pageUrl(page.slug, s.id)}
                  </code>
                  <button
                    type="button"
                    onClick={() => copy(pageUrl(page.slug, s.id))}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-muted"
                    aria-label={`Kopírovat odkaz ${s.label}`}
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-2xl border border-border bg-card p-4">
            <h3 className="font-bold">Měření (nepovinné)</h3>
            <p className="text-xs text-muted-foreground">
              Stačí vložit ID, kód doplníme sami. Spustí se jen u návštěvníků, kteří souhlasí s cookies.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Meta Pixel ID" hint="Správce událostí → Zdroje dat → číslo pod názvem pixelu.">
                <Input
                  value={page.meta_pixel_id ?? ""}
                  inputMode="numeric"
                  placeholder="1234567890123456"
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 20);
                    setPage({ ...page, meta_pixel_id: v || null });
                    if (!v || v.length >= 10) update({ meta_pixel_id: v || null });
                  }}
                />
              </Field>
              <Field label="GA4 ID měření" hint="Google Analytics → Správce → Datové proudy → ID měření.">
                <Input
                  value={page.ga4_id ?? ""}
                  placeholder="G-XXXXXXXXXX"
                  onChange={(e) => {
                    const v = e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9-]/g, "")
                      .slice(0, 18);
                    setPage({ ...page, ga4_id: v || null });
                    if (!v || /^G-[A-Z0-9]{4,16}$/.test(v)) update({ ga4_id: v || null });
                  }}
                />
              </Field>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Do GA4 a Mety posíláme zobrazení stránky, klik na tlačítko a zápis zájemce (Lead / generate_lead).
            </p>
          </section>
          <section className="rounded-2xl border border-border bg-card p-4">
            <h3 className="font-bold">Cíl testu</h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Field label="Kolik návštěv">
                <Input
                  type="number"
                  min={10}
                  value={page.goal_visits}
                  onChange={(e) => update({ goal_visits: Math.max(10, Number(e.target.value) || 100) })}
                />
              </Field>
              <Field label="Kolik % se zapíše">
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={page.goal_rate}
                  onChange={(e) => update({ goal_rate: Math.min(100, Math.max(1, Number(e.target.value) || 10)) })}
                />
              </Field>
            </div>
          </section>
          <section id="upozorneni" className="rounded-2xl border border-border bg-card p-4">
            <label className="flex items-center justify-between gap-3">
              <span>
                <span className="block font-bold">Upozornit e-mailem na nového zájemce</span>
                <span className="block text-xs text-muted-foreground">Nejvýš 20 e-mailů denně.</span>
              </span>
              <Switch checked={page.notify_leads} onCheckedChange={(v) => update({ notify_leads: v })} />
            </label>
          </section>
          <details className="rounded-2xl border border-border bg-card p-4">
            <summary className="cursor-pointer font-bold">Jak na první reklamu na Facebooku (10 minut)</summary>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
              <li>
                Ve Správci reklam založte kampaň s cílem „Potenciální zákazníci“ (nebo „Návštěvnost“, pokud nemáte
                pixel).
              </li>
              <li>Rozpočet 200–300 Kč denně na 5–7 dní. Na test to stačí.</li>
              <li>Publikum: lokalita a věk vašeho zákazníka z brány 1, 2–3 zájmy. Nic víc.</li>
              <li>Reklama: fotka z úvodu stránky, text = problém zákazníka + nadpis stránky.</li>
              <li>Jako cíl vložte odkaz „Facebook“ výše. Máte-li pixel, optimalizujte na událost „Lead“.</li>
              <li>Po 100 návštěvách se podívejte do Výsledků. Nefunguje? Změňte nadpis, ne rozpočet.</li>
            </ol>
          </details>
        </>
      )}

      {tab === "vysledky" && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Jak test běží</h3>
            <Button variant="ghost" size="sm" onClick={refreshResults}>
              <RefreshCw className="mr-1.5 h-4 w-4" /> Obnovit
            </Button>
          </div>
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ["Návštěvy", totals.visits],
              ["Kliky na tlačítko", totals.clicks],
              ["Zájemci", totals.leads],
              ["Konverze", `${ev.rate.toLocaleString("cs-CZ", { maximumFractionDigits: 1 })} %`],
            ].map(([l, v]) => (
              <div key={l} className="rounded-2xl border border-border bg-card p-3">
                <dt className="text-xs text-muted-foreground">{l}</dt>
                <dd className="text-2xl font-extrabold">{v}</dd>
              </div>
            ))}
          </dl>
          <div className={`rounded-2xl p-4 ${VERDICT[ev.verdict].cls}`}>
            <p className="font-bold">{VERDICT[ev.verdict].label}</p>
            <p className="text-sm">{VERDICT[ev.verdict].text}</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10">
              <div className="h-full rounded-full bg-current transition-all" style={{ width: `${ev.progress}%` }} />
            </div>
            <p className="mt-1 text-xs">
              {totals.visits} z {page.goal_visits} návštěv · cíl {page.goal_rate} % zápisů
            </p>
          </div>
          {bySource.length > 0 && (
            <section className="rounded-2xl border border-border bg-card p-4">
              <h3 className="font-bold">Podle zdroje</h3>
              <table className="mt-2 w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="py-1 font-semibold">Zdroj</th>
                    <th className="py-1 text-right font-semibold">Návštěvy</th>
                    <th className="py-1 text-right font-semibold">Zájemci</th>
                    <th className="py-1 text-right font-semibold">Konverze</th>
                  </tr>
                </thead>
                <tbody>
                  {bySource.map(([s, v]) => (
                    <tr key={s} className="border-t border-border">
                      <td className="py-1.5">{SOURCE_LABELS[s] ?? s}</td>
                      <td className="py-1.5 text-right">{v.visits}</td>
                      <td className="py-1.5 text-right">{v.leads}</td>
                      <td className="py-1.5 text-right">
                        {v.visits
                          ? `${((v.leads / v.visits) * 100).toLocaleString("cs-CZ", { maximumFractionDigits: 1 })} %`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
          <section className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold">Zájemci ({leads.length})</h3>
              {leads.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(new Blob([leadsCsv(leads)], { type: "text/csv;charset=utf-8" }));
                    a.download = `zajemci-${page.slug}.csv`;
                    a.click();
                    URL.revokeObjectURL(a.href);
                  }}
                >
                  <Download className="mr-1.5 h-4 w-4" /> Stáhnout CSV
                </Button>
              )}
            </div>
            {leads.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                {page.status === "published"
                  ? "Zatím nikdo. Pošlete odkaz do skupin nebo spusťte reklamu."
                  : "Nejdřív stránku zveřejněte."}
              </p>
            ) : (
              <ul className="mt-2 divide-y divide-border text-sm">
                {leads.map((l) => (
                  <li key={l.id} className="flex items-center gap-2 py-2">
                    <span className="min-w-0 flex-1 truncate">
                      <span className="font-semibold">{l.email}</span>
                      {l.name && ` · ${l.name}`}
                    </span>
                    <span className="hidden text-xs text-muted-foreground sm:inline">
                      {SOURCE_LABELS[l.source] ?? l.source}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(l.created_at).toLocaleDateString("cs-CZ")}
                    </span>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!window.confirm(`Smazat ${l.email}?`)) return;
                        await deleteLead(l.id);
                        setLeads((x) => x.filter((y) => y.id !== l.id));
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                      aria-label={`Smazat ${l.email}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );

  const preview = (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-muted-foreground">Náhled</p>
        <div className="flex rounded-lg bg-muted p-0.5" role="radiogroup" aria-label="Velikost náhledu">
          {(
            [
              [false, Monitor, "Počítač"],
              [true, Smartphone, "Mobil"],
            ] as const
          ).map(([m, Icon, l]) => (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={mobile === m}
              onClick={() => setMobile(m)}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold ${mobile === m ? "bg-background shadow-sm" : "text-muted-foreground"}`}
            >
              <Icon className="h-3.5 w-3.5" /> {l}
            </button>
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-border bg-muted/40">
        <div
          className={`mx-auto h-full overflow-y-auto bg-white ${mobile ? "max-w-[390px] border-x border-border" : ""}`}
        >
          <TestPageView page={publicView} preview mobile={mobile} />
        </div>
      </div>
    </div>
  );

  return (
    <SidebarLayout>
      <div className="flex min-h-screen flex-col lg:h-screen">
        <header className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3 sm:gap-3 sm:px-6">
          <div className="min-w-0 basis-full sm:flex-1 sm:basis-0">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <FlaskConical className="h-3.5 w-3.5" /> Testovací stránka · {currentProject.name}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  page.status === "published" ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"
                }`}
              >
                {page.status === "published" ? "Zveřejněno" : "Koncept"}
              </span>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-w-0 items-center gap-1 truncate text-sm font-semibold text-primary hover:underline"
              >
                {url.replace(/^https?:\/\//, "")} <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </a>
              <span className="text-xs text-muted-foreground" aria-live="polite">
                {saving === "saving"
                  ? "Ukládám…"
                  : saving === "saved"
                    ? "Uloženo"
                    : saving === "error"
                      ? "Neuloženo"
                      : ""}
              </span>
            </div>
          </div>
          <Button variant="outline" size="sm" className="rounded-[10px]" onClick={() => copy(url)}>
            <Copy className="mr-1.5 h-4 w-4" /> Kopírovat odkaz
          </Button>
          {page.status === "published" ? (
            <Button variant="ghost" size="sm" className="rounded-[10px]" onClick={() => publish(false)}>
              <EyeOff className="mr-1.5 h-4 w-4" /> Skrýt
            </Button>
          ) : (
            <Button
              size="sm"
              className="rounded-[10px] bg-orange-500 text-white hover:bg-orange-600"
              onClick={() => publish(true)}
            >
              <Rocket className="mr-1.5 h-4 w-4" /> Zveřejnit
            </Button>
          )}
        </header>

        <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(380px,460px)_1fr]">
          <div className="min-h-0 overflow-y-auto border-r border-border p-4 sm:p-5">
            <nav className="mb-4 grid grid-cols-4 gap-1 rounded-xl bg-muted p-1" aria-label="Části editoru">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTab(t.id);
                    if (t.id === "vysledky") refreshResults();
                  }}
                  aria-current={tab === t.id ? "page" : undefined}
                  className={`flex flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[11px] font-semibold sm:flex-row sm:justify-center sm:gap-1.5 sm:text-xs ${
                    tab === t.id ? "bg-background shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  <t.icon className="h-4 w-4" /> {t.label}
                </button>
              ))}
            </nav>
            {editor}
            <Button
              variant="outline"
              className="mt-5 w-full rounded-[10px] lg:hidden"
              onClick={() => setShowPreview(true)}
            >
              <Monitor className="mr-2 h-4 w-4" /> Zobrazit náhled
            </Button>
          </div>
          <div className="hidden min-h-0 p-4 sm:p-5 lg:block">{preview}</div>
        </div>
      </div>

      {showPreview && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-background lg:hidden"
          role="dialog"
          aria-label="Náhled stránky"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <p className="font-semibold">Náhled</p>
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted"
              aria-label="Zavřít náhled"
            >
              <Check className="h-5 w-5" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <TestPageView page={publicView} preview mobile />
          </div>
        </div>
      )}
    </SidebarLayout>
  );
};

export default TestPageEditor;
