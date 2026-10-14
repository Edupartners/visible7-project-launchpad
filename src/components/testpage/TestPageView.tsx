import { useEffect, useState } from "react";
import { Check, Copy, Loader2, Minus } from "lucide-react";
import { BlockId, PublicPage, consentText } from "@/lib/testPage";

/**
 * Testovací stránka ve stylu produktových stránek Apple: hodně vzduchu, velká typografie,
 * žádné krabičky navíc. Psychologická linka: zaujmout (úvod a formulář hned nahoře) →
 * fascinovat (problém, řešení, výhody) → získat důvěru (pro koho, kdo za tím stojí, otázky) →
 * prodat (cena a závěrečný formulář).
 */

interface Theme {
  bg: string;
  alt: string;
  text: string;
  muted: string;
  line: string;
  field: string;
  nav: string;
}

const THEMES: Record<PublicPage["template"], Theme> = {
  svetla: {
    bg: "#ffffff",
    alt: "#f5f5f7",
    text: "#1d1d1f",
    muted: "#6e6e73",
    line: "#d2d2d7",
    field: "#ffffff",
    nav: "rgba(255,255,255,0.78)",
  },
  tmava: {
    bg: "#000000",
    alt: "#161617",
    text: "#f5f5f7",
    muted: "#a1a1a6",
    line: "#424245",
    field: "#1d1d1f",
    nav: "rgba(0,0,0,0.72)",
  },
  tepla: {
    bg: "#fbfaf8",
    alt: "#f1ede7",
    text: "#2a2420",
    muted: "#776d64",
    line: "#ddd5ca",
    field: "#ffffff",
    nav: "rgba(251,250,248,0.8)",
  },
};

const FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "Segoe UI", Roboto, "Helvetica Neue", sans-serif';

export interface TestPageViewProps {
  page: PublicPage;
  /** Náhled v editoru: vynutí rozložení pro mobil a vypne odesílání. */
  mobile?: boolean;
  preview?: boolean;
  onCta?: () => void;
  onSubmit?: (email: string, name: string, consent: string) => Promise<"ok" | "dup">;
  footerExtra?: React.ReactNode;
}

export const PAGE_FONT = FONT;

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
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [err, setErr] = useState("");
  const [errAt, setErrAt] = useState<string | undefined>();
  const [copied, setCopied] = useState(false);
  const [shown, setShown] = useState(preview);
  const consent = consentText(page, page.project_name);
  const blocks = c.order.filter((b) => !c.off.includes(b) || b === "form" || b === "hero");
  const formId = preview ? "tp-form-preview" : "tp-form";

  // Jediný pohyb na stránce: jemný nástup úvodu.
  useEffect(() => {
    if (preview) return;
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, [preview]);

  const goForm = () => {
    onCta?.();
    document.getElementById(formId)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const submit = async (e: React.FormEvent, at?: string) => {
    e.preventDefault();
    setErrAt(at);
    if (preview || !onSubmit) return;
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErr("Zadejte prosím e-mail.");
      return;
    }
    if (!agree) {
      setErr("Potvrďte prosím souhlas pod formulářem.");
      return;
    }
    setState("busy");
    setErr("");
    try {
      await onSubmit(email.trim(), name.trim(), consent);
      setState("done");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Odeslání se nepodařilo. Zkuste to znovu.");
      setState("idle");
    }
  };

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/t/${page.slug}` : "";
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: c.hero.title, url: shareUrl });
      else {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
      }
    } catch {
      /* zrušeno */
    }
  };

  const pill = "inline-flex items-center justify-center rounded-full font-semibold transition-opacity hover:opacity-90";
  const h2 = `font-bold tracking-[-0.025em] leading-[1.08] ${mobile ? "text-[32px]" : "text-[32px] md:text-[48px]"}`;
  const lead = `leading-relaxed ${mobile ? "text-[17px]" : "text-[17px] md:text-[21px]"}`;
  const wrap = (cls = "") => `mx-auto px-6 ${cls}`;
  const sectionPad = mobile ? "py-20" : "py-20 md:py-32";

  /** Formulář: v úvodu kompaktní, na konci stejný. Stav je společný. */
  const form = (id?: string) =>
    state === "done" ? (
      <div id={id} className="mx-auto max-w-md text-center">
        <span
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full text-white"
          style={{ background: acc }}
        >
          <Check className="h-7 w-7" strokeWidth={2.5} />
        </span>
        <p className="mt-5 text-[21px] font-semibold" style={{ color: t.text }}>
          {c.form.success}
        </p>
        <p className="mt-2 text-[15px]" style={{ color: t.muted }}>
          Znáte někoho, komu by to pomohlo? Pošlete mu odkaz.
        </p>
        <button
          type="button"
          onClick={share}
          className={`${pill} mt-5 h-11 gap-2 px-5 text-[15px]`}
          style={{ color: acc, boxShadow: `inset 0 0 0 1.5px ${acc}` }}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Odkaz zkopírován" : "Sdílet odkaz"}
        </button>
      </div>
    ) : (
      <form id={id} onSubmit={(e) => submit(e, id)} noValidate className="mx-auto w-full max-w-[460px]">
        {c.form.askName && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Křestní jméno"
            autoComplete="given-name"
            maxLength={120}
            aria-label="Křestní jméno"
            className="mb-2.5 h-[52px] w-full rounded-full px-6 text-[17px] outline-none focus-visible:ring-2"
            style={{ background: t.field, color: t.text, boxShadow: `inset 0 0 0 1px ${t.line}` }}
          />
        )}
        <div className={`flex gap-2.5 ${mobile ? "flex-col" : "flex-col sm:flex-row"}`}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="váš e-mail"
            autoComplete="email"
            inputMode="email"
            maxLength={160}
            aria-label="E-mail"
            className={`h-[52px] min-w-0 rounded-full px-6 text-[17px] outline-none focus-visible:ring-2 ${mobile ? "w-full" : "w-full sm:w-auto sm:flex-1"}`}
            style={{ background: t.field, color: t.text, boxShadow: `inset 0 0 0 1px ${t.line}` }}
          />
          <button
            type="submit"
            disabled={state === "busy"}
            className={`${pill} h-[52px] shrink-0 px-7 text-[17px] text-white disabled:opacity-60`}
            style={{ background: acc }}
          >
            {state === "busy" && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {c.form.button || "Zapsat se"}
          </button>
        </div>
        <label
          className="mt-4 flex cursor-pointer items-start gap-2.5 text-left text-[12px] leading-relaxed"
          style={{ color: t.muted }}
        >
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-[3px] h-4 w-4 shrink-0"
            style={{ accentColor: acc }}
          />
          <span>{consent}</span>
        </label>
        {err && errAt === id && (
          <p role="alert" className="mt-3 text-[14px] font-semibold" style={{ color: "#e30000" }}>
            {err}
          </p>
        )}
      </form>
    );

  const render: Record<BlockId, () => React.ReactNode> = {
    // ZAUJMOUT: výsledek, který chce, a formulář hned na očích.
    hero: () => (
      <header style={{ background: t.bg }}>
        <div
          className={`${wrap("max-w-[880px] text-center")} ${mobile ? "pb-16 pt-16" : "pb-16 pt-16 md:pb-24 md:pt-28"} transition-all duration-700 ease-out motion-reduce:transition-none`}
          style={{ opacity: shown ? 1 : 0, transform: shown ? "none" : "translateY(12px)" }}
        >
          <h1
            className={`font-bold leading-[1.04] tracking-[-0.035em] ${mobile ? "text-[40px]" : "text-[40px] md:text-[72px]"}`}
            style={{ color: t.text }}
          >
            {c.hero.title}
          </h1>
          {c.hero.subtitle && (
            <p className={`mx-auto mt-6 max-w-[640px] ${lead}`} style={{ color: t.muted }}>
              {c.hero.subtitle}
            </p>
          )}
          <div className="mt-10">{form(formId === "tp-form" ? "tp-form-top" : undefined)}</div>
        </div>
        {page.hero_url && (
          <div className={wrap(`max-w-[1120px] ${mobile ? "pb-16" : "pb-16 md:pb-28"}`)}>
            <img
              src={page.hero_url}
              alt=""
              className={`w-full rounded-[28px] object-cover ${mobile ? "aspect-[4/3]" : "aspect-[4/3] md:aspect-[16/8]"}`}
            />
          </div>
        )}
      </header>
    ),
    // FASCINOVAT: zrcadlo jeho problému…
    problem: () => (
      <section style={{ background: t.alt }} className={sectionPad}>
        <div className={wrap("max-w-[820px]")}>
          <p className="text-[17px] font-semibold md:text-[21px]" style={{ color: acc }}>
            {c.problem.title}
          </p>
          <ul className="mt-8 space-y-6 md:space-y-8">
            {c.problem.items.filter(Boolean).map((p, i) => (
              <li
                key={i}
                className={`font-semibold leading-[1.15] tracking-[-0.02em] ${mobile ? "text-[26px]" : "text-[26px] md:text-[40px]"}`}
                style={{ color: t.text }}
              >
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>
    ),
    // …a nečekané řešení
    solution: () => (
      <section style={{ background: t.bg }} className={sectionPad}>
        <div className={wrap("max-w-[820px] text-center")}>
          <h2 className={h2} style={{ color: t.text }}>
            {c.solution.title}
          </h2>
          <p className={`mx-auto mt-6 max-w-[680px] whitespace-pre-line ${lead}`} style={{ color: t.muted }}>
            {c.solution.text}
          </p>
        </div>
      </section>
    ),
    benefits: () => {
      const items = c.benefits.items.filter((b) => b.title.trim());
      return (
        <section style={{ background: t.bg }} className={`${mobile ? "pb-20" : "pb-20 md:pb-32"}`}>
          <div className={wrap("max-w-[1080px]")}>
            {c.benefits.title && (
              <h2 className={`${h2} text-center`} style={{ color: t.text }}>
                {c.benefits.title}
              </h2>
            )}
            <ul
              className={`mx-auto mt-14 grid gap-x-10 gap-y-12 ${
                mobile
                  ? ""
                  : items.length === 2
                    ? "max-w-[760px] md:grid-cols-2"
                    : items.length === 1
                      ? "max-w-[420px]"
                      : "md:grid-cols-3"
              }`}
            >
              {items.map((b, i) => (
                <li key={i} className={mobile ? "" : "md:text-left"}>
                  <span className="block h-[3px] w-8 rounded-full" style={{ background: acc }} />
                  <p
                    className="mt-5 text-[21px] font-semibold leading-snug tracking-[-0.01em]"
                    style={{ color: t.text }}
                  >
                    {b.title}
                  </p>
                  {b.text && (
                    <p className="mt-2 text-[17px] leading-relaxed" style={{ color: t.muted }}>
                      {b.text}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      );
    },
    // ZÍSKAT DŮVĚRU
    audience: () => (
      <section style={{ background: t.alt }} className={sectionPad}>
        <div className={wrap("max-w-[880px]")}>
          <h2 className={`${h2} text-center`} style={{ color: t.text }}>
            {c.audience.title}
          </h2>
          <div className={`mt-14 grid gap-12 ${md("md:grid-cols-2")}`}>
            {(
              [
                ["Je to pro vás, pokud", c.audience.yes, true],
                ["Není to pro vás, pokud", c.audience.no, false],
              ] as const
            ).map(([label, items, yes]) =>
              items.filter(Boolean).length ? (
                <div key={label}>
                  <p className="text-[17px] font-semibold" style={{ color: t.muted }}>
                    {label}
                  </p>
                  <ul className="mt-5 space-y-4">
                    {items.filter(Boolean).map((x, i) => (
                      <li key={i} className="flex gap-3 text-[19px] leading-snug" style={{ color: t.text }}>
                        {yes ? (
                          <Check className="mt-1 h-5 w-5 shrink-0" style={{ color: acc }} strokeWidth={2.5} />
                        ) : (
                          <Minus className="mt-1 h-5 w-5 shrink-0" style={{ color: t.muted }} strokeWidth={2.5} />
                        )}
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null,
            )}
          </div>
        </div>
      </section>
    ),
    about: () =>
      c.about.text.trim() ? (
        <section style={{ background: t.bg }} className={sectionPad}>
          <div className={wrap("max-w-[720px] text-center")}>
            {c.about.photo && (
              <img src={c.about.photo} alt={c.about.name} className="mx-auto h-24 w-24 rounded-full object-cover" />
            )}
            <p className="mt-6 text-[17px] font-semibold" style={{ color: t.muted }}>
              {c.about.title}
            </p>
            <p
              className={`mt-4 font-medium leading-[1.4] tracking-[-0.01em] ${mobile ? "text-[21px]" : "text-[21px] md:text-[28px]"}`}
              style={{ color: t.text }}
            >
              {c.about.text}
            </p>
            {c.about.name && (
              <p className="mt-6 text-[17px] font-semibold" style={{ color: t.text }}>
                {c.about.name}
              </p>
            )}
          </div>
        </section>
      ) : null,
    // PRODAT
    price: () => (
      <section style={{ background: t.alt }} className={sectionPad}>
        <div className={wrap("max-w-[720px] text-center")}>
          <p className="text-[17px] font-semibold md:text-[21px]" style={{ color: t.muted }}>
            {c.price.title}
          </p>
          {c.price.amount && (
            <p
              className={`mt-3 font-bold tracking-[-0.035em] ${mobile ? "text-[56px]" : "text-[56px] md:text-[80px]"}`}
              style={{ color: t.text }}
            >
              {c.price.amount}
            </p>
          )}
          {c.price.note && (
            <p className={`mx-auto mt-4 max-w-[520px] ${lead}`} style={{ color: t.muted }}>
              {c.price.note}
            </p>
          )}
          <button
            type="button"
            onClick={goForm}
            className={`${pill} mt-9 h-[52px] px-8 text-[17px] text-white`}
            style={{ background: acc }}
          >
            {c.hero.cta || "Chci vědět jako první"}
          </button>
        </div>
      </section>
    ),
    faq: () => (
      <section style={{ background: t.bg }} className={sectionPad}>
        <div className={wrap("max-w-[820px]")}>
          <h2 className={h2} style={{ color: t.text }}>
            {c.faq.title}
          </h2>
          <dl className="mt-10">
            {c.faq.items
              .filter((f) => f.q.trim())
              .map((f, i) => (
                <div key={i} className="py-6" style={{ borderTop: `1px solid ${t.line}` }}>
                  <dt className="text-[19px] font-semibold md:text-[21px]" style={{ color: t.text }}>
                    {f.q}
                  </dt>
                  <dd className="mt-2 text-[17px] leading-relaxed" style={{ color: t.muted }}>
                    {f.a}
                  </dd>
                </div>
              ))}
          </dl>
        </div>
      </section>
    ),
    form: () => (
      <section style={{ background: t.alt }} className={sectionPad}>
        <div className={wrap("max-w-[720px] text-center")}>
          <h2 className={h2} style={{ color: t.text }}>
            {c.form.title}
          </h2>
          {c.form.text && (
            <p className={`mx-auto mt-5 max-w-[560px] ${lead}`} style={{ color: t.muted }}>
              {c.form.text}
            </p>
          )}
          <div className="mt-10">{form(formId)}</div>
        </div>
      </section>
    ),
  };

  return (
    <div style={{ background: t.bg, color: t.text, fontFamily: FONT }} className="min-h-full antialiased">
      <nav
        className={`${preview ? "" : "sticky top-0"} z-40 backdrop-blur-xl backdrop-saturate-150`}
        style={{ background: t.nav, borderBottom: `1px solid ${t.line}55` }}
      >
        <div className={wrap("flex h-[52px] max-w-[1080px] items-center justify-between")}>
          {page.logo_url ? (
            <img src={page.logo_url} alt={page.project_name} className="h-7 w-auto max-w-[140px] object-contain" />
          ) : (
            <span className="truncate text-[15px] font-semibold" style={{ color: t.text }}>
              {page.project_name}
            </span>
          )}
          <button
            type="button"
            onClick={goForm}
            className={`${pill} h-8 shrink-0 px-4 text-[13px] text-white`}
            style={{ background: acc }}
          >
            {c.hero.cta || "Chci vědět jako první"}
          </button>
        </div>
      </nav>
      {blocks.map((b) => (
        <div key={b}>{render[b]()}</div>
      ))}
      <footer
        className="px-6 py-10 text-center text-[12px] leading-relaxed"
        style={{ background: t.bg, color: t.muted }}
      >
        {page.operator_name && (
          <p>
            Provozovatel: {page.operator_name}
            {page.operator_email ? `, ${page.operator_email}` : ""}
          </p>
        )}
        {footerExtra}
        <p className="mt-1">
          Vytvořeno ve{" "}
          <a
            href="https://visible7.io"
            className="underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            VISIBLE7
          </a>
        </p>
      </footer>
    </div>
  );
}
