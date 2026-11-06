import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Check, CreditCard } from "lucide-react";
import { EXAM_PRICES, NSK_QUALIFICATION } from "@/lib/qualification";
import { FREE_CONSULT_URL, kc, useShop } from "@/lib/shop";
import { STUDY, STUDY_ITEMS, studyOpen } from "@/lib/study";
import { track } from "@/lib/track";

/** Studium Specialista internetového obchodu: hlavní nabídka s lektory a zkouškou profesní kvalifikace v ceně. */
export const StudySection = () => {
  const shop = useShop();
  const open = studyOpen();
  return (
    <section id="studium" className="scroll-mt-20 px-3 py-2 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] bg-leaf-500 text-white">
        <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 py-16 sm:px-8 md:grid-cols-[1.15fr_1fr] md:py-20 lg:px-12">
          <div>
            <p className="v7-para-sm inline-block bg-signal px-3 py-1 text-sm font-bold text-signal-foreground">
              Studium s lektory · {STUDY.period}
            </p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Staňte se specialistou na online podnikání
            </h2>
            <p className="mt-4 text-lg text-white/85">
              Studium <b className="text-white">{STUDY.name}</b> zakončíte zkouškou profesní kvalifikace{" "}
              <a
                href={NSK_QUALIFICATION.url}
                target="_blank"
                rel="noopener noreferrer"
                className="whitespace-nowrap font-semibold text-white underline underline-offset-4 hover:no-underline"
              >
                {NSK_QUALIFICATION.code}
              </a>{" "}
              podle zákona č. 179/2006 Sb. Osvědčení je uznané státem a platí v celé ČR. Edu Partners je autorizovaná
              osoba, zkoušku složíte přímo u nás.
            </p>
            <div className="mt-6 flex flex-wrap items-end gap-x-4 gap-y-1">
              <span className="text-5xl font-extrabold tracking-tight">{kc(STUDY.price)}</span>
              <span className="pb-1.5 text-white/80">
                vč. DPH a zkoušky · celý kurz s lektorem běžně <s>{kc(STUDY.usualPrice)}</s>
              </span>
            </div>
            {open ? (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                {shop.study_checkout_url && (
                  <a
                    href={shop.study_checkout_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track("study_checkout_click", { from: "landing" })}
                    className="v7-trap-btn inline-flex h-14 items-center justify-center gap-2 pl-7 pr-12 text-base font-bold text-signal-foreground"
                  >
                    <CreditCard className="h-5 w-5" aria-hidden="true" /> Zaplatit a začít studovat
                  </a>
                )}
                <a
                  href={FREE_CONSULT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("free_consult_click", { from: "landing_studium" })}
                  className={
                    shop.study_checkout_url
                      ? "inline-flex h-14 items-center justify-center gap-2 rounded-xl border-2 border-white/70 px-6 font-semibold text-white hover:bg-white/10"
                      : "v7-trap-btn inline-flex h-14 items-center justify-center gap-2 pl-7 pr-12 text-base font-bold text-signal-foreground"
                  }
                >
                  <CalendarDays className="h-5 w-5" aria-hidden="true" /> Probrat studium s Michalem (20 min)
                </a>
              </div>
            ) : (
              <p className="mt-6 rounded-xl bg-leaf-700 p-4 font-semibold">Další běh studia připravujeme.</p>
            )}
            <p className="mt-4 text-sm text-white/75">
              Studovat nechcete? Zkoušku můžete složit i samostatně: {kc(EXAM_PRICES.regular)}, pro členy{" "}
              {kc(EXAM_PRICES.member)}.{" "}
              <Link to="/certifikace" className="font-semibold text-white underline underline-offset-4">
                Celý program a osvědčení
              </Link>
            </p>
          </div>
          <div className="rounded-2xl bg-leaf-700 p-6">
            <p className="font-bold">Co ve studiu dostanete</p>
            <ul className="mt-4 space-y-3">
              {STUDY_ITEMS.map((it) => (
                <li key={it} className="flex gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-signal" strokeWidth={3} aria-hidden="true" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 flex items-start gap-2 border-t border-white/15 pt-4 text-sm text-white/80">
              <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              Za každou bránu VISIBLE7 navíc osvědčení s ověřovacím kódem.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
