import { Link } from "react-router-dom";
import { ArrowRight, Check, Download } from "lucide-react";
import { WORKSHEET_BENEFITS, worksheetPreview } from "@/lib/worksheets";

const FAN = ["i1-lean-canvas", "v3-errc", "im3-checklist-ai-first-web"];

/** Vějíř tří náhledů listů – vizuální háček pro stažení. */
export const WorksheetFan = ({ className = "" }: { className?: string }) => (
  <div className={`relative mx-auto h-[260px] w-full max-w-[460px] sm:h-[320px] ${className}`} aria-hidden="true">
    {FAN.map((slug, i) => (
      <img
        key={slug}
        src={worksheetPreview({ slug })}
        alt=""
        loading="lazy"
        className="absolute left-1/2 top-1/2 w-[62%] rounded-lg border border-black/5 bg-white shadow-[0_18px_40px_-14px_rgba(15,23,42,0.45)] transition-transform duration-300"
        style={{
          transform: `translate(-50%, -50%) translateX(${(i - 1) * 34}%) rotate(${(i - 1) * 7}deg) translateY(${i === 1 ? -6 : 6}%)`,
          zIndex: i === 1 ? 3 : 1,
        }}
      />
    ))}
    <span className="absolute right-2 top-2 z-10 rotate-6 rounded-full bg-leaf-500 px-3 py-1.5 text-sm font-extrabold text-white shadow-lg sm:right-6">
      ZDARMA
    </span>
  </div>
);

/** Blok na úvodní stránce: pracovní listy ke stažení. */
export const WorksheetsTeaser = () => (
  <section className="px-3 py-2 sm:px-6 lg:px-10">
    <div className="mx-auto grid max-w-[1280px] items-center gap-8 overflow-hidden rounded-[2rem] bg-leaf-50 px-5 py-12 sm:px-10 md:grid-cols-2 md:py-16 lg:px-16">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-leaf-700">Ke stažení zdarma</p>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Pracovní listy, se kterými se nápad mění v plán
        </h2>
        <ul className="mt-5 space-y-2.5">
          {WORKSHEET_BENEFITS.map((b) => (
            <li key={b} className="flex gap-2.5">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-leaf-600" strokeWidth={3} aria-hidden="true" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <Link
          to="/pracovni-listy"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-leaf-500 px-6 py-3.5 text-base font-semibold text-white shadow-[0_10px_24px_-10px_rgba(234,88,12,0.7)] hover:bg-leaf-600"
        >
          <Download className="h-5 w-5" aria-hidden="true" /> Stáhnout listy zdarma
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <Link to="/pracovni-listy" aria-label="Pracovní listy ke stažení" className="group block">
        <WorksheetFan className="group-hover:[&>img]:scale-[1.02]" />
      </Link>
    </div>
  </section>
);
