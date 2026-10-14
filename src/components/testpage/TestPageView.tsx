import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { BlockId, PublicPage, consentText } from "@/lib/testPage";

interface Theme {
  bg: string;
  alt: string;
  text: string;
  muted: string;
  heroBg: string;
  heroText: string;
  heroMuted: string;
  card: string;
  border: string;
}

const THEMES: Record<PublicPage["template"], Theme> = {
  svetla: {
    bg: "#ffffff",
    alt: "#f8fafc",
    text: "#0f172a",
    muted: "#475569",
    heroBg: "#ffffff",
    heroText: "#0f172a",
    heroMuted: "#475569",
    card: "#ffffff",
    border: "#e2e8f0",
  },
  tmava: {
    bg: "#ffffff",
    alt: "#f1f5f9",
    text: "#0f172a",
    muted: "#475569",
    heroBg: "#0b1220",
    heroText: "#ffffff",
    heroMuted: "rgba(255,255,255,0.75)",
    card: "#ffffff",
    border: "#e2e8f0",
  },
  tepla: {
    bg: "#fbf6ef",
    alt: "#f3e9dc",
    text: "#3b2f2a",
    muted: "#6b5a50",
    heroBg: "#f3e9dc",
    heroText: "#3b2f2a",
    heroMuted: "#6b5a50",
    card: "#fffdf9",
    border: "#e8dccb",
  },
};

export interface TestPageViewProps {
  page: PublicPage;
  /** Náhled v editoru: vynutí rozložení pro mobil a vypne odesílání. */
  mobile?: boolean;
  preview?: boolean;
  onCta?: () => void;
  onSubmit?: (email: string, name: string, consent: string) => Promise<"ok" | "dup">;
  footerExtra?: React.ReactNode;
}

/** Vykreslení testovací stránky (veřejně i v náhledu editoru). */
export function TestPageView({
  page,
  mobile = false,
  preview = false,
  onCta,
  onSubmit,
  footerExtra,
}: TestPageViewProps) {
  const c = page.content;
  const t = THEMES[page.template] ?? THEMES.svetla;
  const acc = page.accent;
  const md = (cls: string) => (mobile ? "" : cls);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [agree, setAgree] = useState(false);
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [err, setErr] = useState("");
  const consent = consentText(page, page.project_name);
  const shown = c.order.filter((b) => !c.off.includes(b) || b === "form");

  const scrollToForm = () => {
    onCta?.();
    document.getElementById(preview ? "tp-form-preview" : "tp-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (preview || !onSubmit) return;
    if (!agree) {
      setErr("Potvrďte prosím souhlas.");
      return;
    }
    setState("busy");
    setErr("");
    try {
      await onSubmit(email.trim(), name.trim(), consent);
      setState("done");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Odeslání se nepodařilo.");
      setState("error");
    }
  };

  const section = (children: React.ReactNode, alt = false, key?: string) => (
    <section key={key} style={{ background: alt ? t.alt : t.bg }} className={`px-5 py-14 ${md("sm:px-8 md:py-20")}`}>
      <div className="mx-auto max-w-4xl">{children}</div>
    </section>
  );
  const h2 = (text: string) => (
    <h2 className={`text-2xl font-extrabold tracking-tight ${md("md:text-3xl")}`} style={{ color: t.text }}>
      {text}
    </h2>
  );

  const blocks: Record<BlockId, (alt: boolean) => React.ReactNode> = {
    hero: () => (
      <header
        key="hero"
        style={{ background: t.heroBg, color: t.heroText }}
        className={`px-5 pb-16 pt-8 ${md("sm:px-8 md:pb-24")}`}
      >
        <div className="mx-auto max-w-5xl">
          {page.logo_url && <img src={page.logo_url} alt="" className="h-10 w-auto max-w-[180px] object-contain" />}
          <div className={`mt-10 grid items-center gap-10 ${page.hero_url ? md("md:grid-cols-[1.1fr_1fr]") : ""}`}>
            <div>
              <h1
                className={`text-[2rem] font-extrabold leading-[1.1] tracking-tight ${md("md:text-5xl")}`}
                style={{ color: t.heroText }}
              >
                {c.hero.title}
              </h1>
              {c.hero.subtitle && (
                <p className={`mt-4 text-lg leading-relaxed ${md("md:text-xl")}`} style={{ color: t.heroMuted }}>
                  {c.hero.subtitle}
                </p>
              )}
              <button
                type="button"
                onClick={scrollToForm}
                className="mt-8 inline-flex h-14 items-center rounded-xl px-7 text-base font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5"
                style={{ background: acc }}
              >
                {c.hero.cta || "Chci vědět jako první"}
              </button>
            </div>
            {page.hero_url && (
              <img src={page.hero_url} alt="" className="aspect-[4/3] w-full rounded-3xl object-cover shadow-xl" />
            )}
          </div>
        </div>
      </header>
    ),
    problem: (alt) =>
      section(
        <>
          {h2(c.problem.title)}
          <ul className={`mt-6 grid gap-3 ${md("md:grid-cols-3")}`}>
            {c.problem.items.filter(Boolean).map((p, i) => (
              <li
                key={i}
                className="rounded-2xl p-5 text-[15px] leading-relaxed"
                style={{ background: t.card, border: `1px solid ${t.border}`, color: t.text }}
              >
                <span
                  className="mb-3 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: acc }}
                  aria-hidden
                >
                  {i + 1}
                </span>
                {p}
              </li>
            ))}
          </ul>
        </>,
        alt,
        "problem",
      ),
    solution: (alt) =>
      section(
        <div className="max-w-3xl">
          {h2(c.solution.title)}
          <p className="mt-4 whitespace-pre-line text-lg leading-relaxed" style={{ color: t.muted }}>
            {c.solution.text}
          </p>
        </div>,
        alt,
        "solution",
      ),
    benefits: (alt) =>
      section(
        <>
          {h2(c.benefits.title)}
          <ul className={`mt-6 grid gap-4 ${md("md:grid-cols-3")}`}>
            {c.benefits.items
              .filter((b) => b.title.trim())
              .map((b, i) => (
                <li key={i} className="rounded-2xl p-5" style={{ background: t.card, border: `1px solid ${t.border}` }}>
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full text-white"
                    style={{ background: acc }}
                  >
                    <Check className="h-5 w-5" strokeWidth={3} />
                  </span>
                  <p className="mt-3 font-bold" style={{ color: t.text }}>
                    {b.title}
                  </p>
                  {b.text && (
                    <p className="mt-1 text-sm leading-relaxed" style={{ color: t.muted }}>
                      {b.text}
                    </p>
                  )}
                </li>
              ))}
          </ul>
        </>,
        alt,
        "benefits",
      ),
    audience: (alt) =>
      section(
        <>
          {h2(c.audience.title)}
          <div className={`mt-6 grid gap-4 ${md("md:grid-cols-2")}`}>
            {(
              [
                ["Je to pro vás, pokud…", c.audience.yes, true],
                ["Není to pro vás, pokud…", c.audience.no, false],
              ] as const
            ).map(([label, items, yes]) =>
              items.filter(Boolean).length ? (
                <div
                  key={label}
                  className="rounded-2xl p-5"
                  style={{ background: t.card, border: `1px solid ${t.border}` }}
                >
                  <p className="font-bold" style={{ color: t.text }}>
                    {label}
                  </p>
                  <ul className="mt-3 space-y-2">
                    {items.filter(Boolean).map((x, i) => (
                      <li key={i} className="flex gap-2 text-[15px]" style={{ color: t.muted }}>
                        {yes ? (
                          <Check className="mt-0.5 h-5 w-5 shrink-0" style={{ color: acc }} />
                        ) : (
                          <X className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                        )}
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null,
            )}
          </div>
        </>,
        alt,
        "audience",
      ),
    price: (alt) =>
      section(
        <div
          className="mx-auto max-w-xl rounded-3xl p-8 text-center"
          style={{ background: t.card, border: `2px solid ${acc}` }}
        >
          <p className="font-semibold" style={{ color: t.muted }}>
            {c.price.title}
          </p>
          {c.price.amount && (
            <p className="mt-2 text-4xl font-extrabold" style={{ color: t.text }}>
              {c.price.amount}
            </p>
          )}
          {c.price.note && (
            <p className="mt-3 text-sm leading-relaxed" style={{ color: t.muted }}>
              {c.price.note}
            </p>
          )}
          <button
            type="button"
            onClick={scrollToForm}
            className="mt-6 inline-flex h-12 items-center rounded-xl px-6 font-bold text-white"
            style={{ background: acc }}
          >
            {c.hero.cta || "Chci vědět jako první"}
          </button>
        </div>,
        alt,
        "price",
      ),
    faq: (alt) =>
      section(
        <>
          {h2(c.faq.title)}
          <dl className="mt-6 space-y-3">
            {c.faq.items
              .filter((f) => f.q.trim())
              .map((f, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-5"
                  style={{ background: t.card, border: `1px solid ${t.border}` }}
                >
                  <dt className="font-bold" style={{ color: t.text }}>
                    {f.q}
                  </dt>
                  <dd className="mt-1 text-[15px] leading-relaxed" style={{ color: t.muted }}>
                    {f.a}
                  </dd>
                </div>
              ))}
          </dl>
        </>,
        alt,
        "faq",
      ),
    form: () => (
      <section
        key="form"
        id={preview ? "tp-form-preview" : "tp-form"}
        className={`px-5 py-16 ${md("sm:px-8 md:py-24")}`}
        style={{ background: page.template === "tmava" ? t.heroBg : t.alt }}
      >
        <div
          className="mx-auto max-w-xl rounded-3xl p-6 shadow-xl sm:p-8"
          style={{ background: page.template === "tmava" ? "#111a2e" : t.card, border: `1px solid ${t.border}` }}
        >
          {state === "done" ? (
            <div className="py-6 text-center">
              <span
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-full text-white"
                style={{ background: acc }}
              >
                <Check className="h-7 w-7" strokeWidth={3} />
              </span>
              <p className="mt-4 text-xl font-bold" style={{ color: page.template === "tmava" ? "#fff" : t.text }}>
                {c.form.success}
              </p>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <h2
                className="text-2xl font-extrabold tracking-tight"
                style={{ color: page.template === "tmava" ? "#fff" : t.text }}
              >
                {c.form.title}
              </h2>
              {c.form.text && (
                <p className="mt-2" style={{ color: page.template === "tmava" ? "rgba(255,255,255,.75)" : t.muted }}>
                  {c.form.text}
                </p>
              )}
              <div className="mt-5 space-y-3">
                {c.form.askName && (
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jméno"
                    autoComplete="given-name"
                    maxLength={120}
                    aria-label="Jméno"
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none focus:border-slate-500"
                  />
                )}
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="váš@email.cz"
                  autoComplete="email"
                  maxLength={160}
                  aria-label="E-mail"
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none focus:border-slate-500"
                />
                <label
                  className="flex items-start gap-2.5 text-xs leading-relaxed"
                  style={{ color: page.template === "tmava" ? "rgba(255,255,255,.7)" : t.muted }}
                >
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ accentColor: acc }}
                  />
                  <span>{consent}</span>
                </label>
                <button
                  type="submit"
                  disabled={state === "busy"}
                  className="flex h-14 w-full items-center justify-center rounded-xl text-base font-bold text-white disabled:opacity-70"
                  style={{ background: acc }}
                >
                  {state === "busy" && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {c.form.button || "Zapsat se"}
                </button>
                {err && (
                  <p role="alert" className="text-sm font-semibold text-red-500">
                    {err}
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </section>
    ),
  };

  let altFlag = false;
  return (
    <div style={{ background: t.bg, color: t.text }} className="min-h-full">
      {shown.map((b) => {
        if (b !== "hero" && b !== "form") altFlag = !altFlag;
        return <div key={b}>{blocks[b](altFlag)}</div>;
      })}
      <footer
        className="px-5 py-8 text-center text-xs leading-relaxed"
        style={{
          background: page.template === "tmava" ? t.heroBg : t.bg,
          color: page.template === "tmava" ? "rgba(255,255,255,.6)" : t.muted,
        }}
      >
        {page.operator_name && (
          <p>
            Provozovatel: {page.operator_name}
            {page.operator_email ? ` · ${page.operator_email}` : ""}
          </p>
        )}
        {footerExtra}
        <p className="mt-1">
          Vytvořeno ve{" "}
          <a href="https://visible7.io" className="underline" target="_blank" rel="noopener noreferrer">
            VISIBLE7
          </a>
        </p>
      </footer>
    </div>
  );
}
