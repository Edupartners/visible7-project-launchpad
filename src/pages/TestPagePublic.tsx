import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { TestPageView } from "@/components/testpage/TestPageView";
import { celebrate } from "@/lib/celebrate";
import { PublicPage, hit, loadPublicPage, submitLead } from "@/lib/testPage";

type W = Window & {
  gtag?: (...a: unknown[]) => void;
  fbq?: ((...a: unknown[]) => void) & {
    callMethod?: unknown;
    queue?: unknown[];
    loaded?: boolean;
    version?: string;
    push?: unknown;
  };
  _fbq?: unknown;
};
const w = window as W;

/** Meta Pixel a GA4 vlastníka stránky – až po souhlasu návštěvníka. */
function loadTrackers(p: PublicPage) {
  if (p.ga4_id && w.gtag) {
    w.gtag("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    });
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${p.ga4_id}`;
    document.head.appendChild(s);
    w.gtag("js", new Date());
    w.gtag("config", p.ga4_id);
  }
  if (p.meta_pixel_id && !w.fbq) {
    const fbq = function (...args: unknown[]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const f = fbq as any;
      if (f.callMethod) f.callMethod(...args);
      else f.queue.push(args);
    } as W["fbq"] & { queue: unknown[] };
    fbq!.queue = [];
    fbq!.loaded = true;
    fbq!.version = "2.0";
    fbq!.push = fbq;
    w.fbq = fbq;
    w._fbq = fbq;
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(s);
    w.fbq!("init", p.meta_pixel_id);
    w.fbq!("track", "PageView");
  }
}

const track = (
  consented: boolean,
  ga: string | null,
  pixel: string | null,
  event: "click" | "lead",
  source: string,
) => {
  if (!consented) return;
  if (ga && w.gtag)
    w.gtag("event", event === "lead" ? "generate_lead" : "select_content", { source, content_type: "cta" });
  if (pixel && w.fbq) w.fbq(event === "lead" ? "track" : "trackCustom", event === "lead" ? "Lead" : "CtaClick");
};

const TestPagePublic = () => {
  const { slug = "" } = useParams();
  const [page, setPage] = useState<PublicPage | null | undefined>(undefined);
  const [consent, setConsent] = useState<boolean | null>(null);
  const counted = useRef(false);
  const params = new URLSearchParams(window.location.search);
  const source = params.get("z") || params.get("utm_source") || "primo";
  const consentKey = `tp_consent_${slug}`;

  useEffect(() => {
    loadPublicPage(slug).then(setPage);
  }, [slug]);

  useEffect(() => {
    if (!page) return;
    document.title = page.content.hero.title || page.project_name;
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    document.head.appendChild(robots);
    // Jedna návštěva za relaci.
    const key = `tp_v_${slug}`;
    if (!counted.current) {
      counted.current = true;
      try {
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, "1");
          hit(slug, source).catch(() => undefined);
        }
      } catch {
        hit(slug, source).catch(() => undefined);
      }
    }
    if (page.meta_pixel_id || page.ga4_id) {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem(consentKey);
      } catch {
        /* bez úložiště */
      }
      if (stored === "1") {
        setConsent(true);
        loadTrackers(page);
      } else setConsent(stored === "0" ? false : null);
    } else setConsent(false);
    return () => robots.remove();
  }, [page, slug, source, consentKey]);

  const choose = (yes: boolean) => {
    try {
      localStorage.setItem(consentKey, yes ? "1" : "0");
    } catch {
      /* bez úložiště */
    }
    setConsent(yes);
    if (yes && page) loadTrackers(page);
  };

  if (page === undefined)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  if (page === null)
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        <div>
          <h1 className="text-2xl font-bold">Stránka není dostupná</h1>
          <p className="mt-2 text-slate-500">Možná ji autor zatím nezveřejnil nebo ji vypnul.</p>
        </div>
      </div>
    );

  const trackers = !!(page.meta_pixel_id || page.ga4_id);

  return (
    <>
      <TestPageView
        page={page}
        onCta={() => {
          hit(slug, source, "click").catch(() => undefined);
          track(!!consent, page.ga4_id, page.meta_pixel_id, "click", source);
        }}
        onSubmit={async (email, name, text) => {
          const r = await submitLead(slug, email, name, source, text);
          track(!!consent, page.ga4_id, page.meta_pixel_id, "lead", source);
          celebrate("small");
          return r;
        }}
        footerExtra={
          trackers ? (
            <p className="mt-1">
              <button type="button" className="underline" onClick={() => setConsent(null)}>
                Nastavení cookies
              </button>
            </p>
          ) : null
        }
      />
      {trackers && consent === null && (
        <div role="dialog" aria-label="Cookies" className="fixed inset-x-0 bottom-0 z-50 p-3">
          <div className="mx-auto flex max-w-2xl flex-col gap-3 rounded-2xl bg-white p-4 text-sm text-slate-700 shadow-2xl ring-1 ring-slate-200 sm:flex-row sm:items-center">
            <p className="flex-1">
              Se souhlasem použijeme měřicí a reklamní cookies (
              {[page.ga4_id && "Google Analytics", page.meta_pixel_id && "Meta"].filter(Boolean).join(", ")}), abychom
              věděli, odkud návštěvníci přicházejí.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => choose(false)}
                className="h-10 rounded-lg px-4 font-semibold text-slate-700 ring-1 ring-slate-300"
              >
                Odmítnout
              </button>
              <button
                type="button"
                onClick={() => choose(true)}
                className="h-10 rounded-lg px-4 font-semibold text-white"
                style={{ background: page.accent }}
              >
                Souhlasím
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TestPagePublic;
