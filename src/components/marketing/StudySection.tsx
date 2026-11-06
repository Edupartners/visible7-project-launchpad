import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Check, CreditCard } from "lucide-react";
import { EXAM_PRICES, NSK_QUALIFICATION } from "@/lib/qualification";
import { FREE_CONSULT_URL, kc, nbsp, useShop } from "@/lib/shop";
import { STUDY, STUDY_ITEMS, seatsLabel, studyOffer, studyOpen } from "@/lib/study";
import { track } from "@/lib/track";

/** Cena studia: najednou, nebo 5 plateb; u zvýhodněné ceny počet zbývajících míst. */
export const StudyPrice = ({ dark = false }: { dark?: boolean }) => {
  const offer = studyOffer(useShop());
  const muted = dark ? "text-white/80" : "text-muted-foreground";
  return (
    <div>
      <p className={`text-sm font-semibold ${dark ? "text-white" : "text-foreground"}`}>
        {offer.early
          ? `Cena pro prvních ${STUDY.earlySeats} přihlášených · zbývá ${seatsLabel(offer.left)}`
          : "Cena vč. DPH, zkoušky a členství"}
      </p>
      <p className="mt-1 flex flex-wrap items-baseline gap-x-3">
        <span className="text-5xl font-extrabold tracking-tight">{kc(offer.monthly)}</span>
        <span className={`whitespace-nowrap ${muted}`}>× {STUDY.payments} plateb</span>
      </p>
      <p className={`mt-1 text-sm ${muted}`}>
        Celkem <b className={dark ? "text-white" : "text-foreground"}>{kc(offer.price)}</b> vč. DPH, zkoušky a členství.
        Můžete zaplatit i najednou. Nic dalšího neplatíte.
      </p>
      {offer.early && (
        <p className={`mt-2 text-xs ${muted}`}>
          Po zaplnění {STUDY.earlySeats} míst bude studium stát {kc(STUDY.price)} (
          {nbsp(`${STUDY.payments} × ${kc(STUDY.price / STUDY.payments)}`)}).
        </p>
      )}
    </div>
  );
};

/** Tlačítka studia: platba najednou, 5 plateb a úvodní hovor s Michalem (vždy). */
export const StudyCtas = ({ from, dark = false, page = false }: { from: string; dark?: boolean; page?: boolean }) => {
  const shop = useShop();
  const pay = [
    { url: shop.study_installments_url, label: `Přihlásit se: ${STUDY.payments} plateb`, kind: "installments" },
    { url: shop.study_checkout_url, label: "Zaplatit najednou", kind: "full" },
  ].filter((p) => p.url);
  const primary = dark
    ? "v7-trap-btn inline-flex h-14 items-center justify-center gap-2 pl-7 pr-12 text-base font-bold text-signal-foreground"
    : "flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-bold text-white hover:bg-primary/90";
  const secondary = dark
    ? "inline-flex h-14 items-center justify-center gap-2 rounded-xl border-2 border-white/70 px-6 font-semibold text-white hover:bg-white/10"
    : "flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-primary px-5 font-semibold text-primary hover:bg-primary/5";
  return (
    <div className={dark ? "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center" : "space-y-2"}>
      {pay.map((p, i) => (
        <a
          key={p.kind}
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("study_checkout_click", { from, kind: p.kind })}
          className={i === 0 ? primary : secondary}
        >
          {i === 0 && <CreditCard className="h-5 w-5" aria-hidden="true" />} {p.label}
        </a>
      ))}
      {page ? (
        <Link
          to="/studium"
          onClick={() => track("study_page_click", { from })}
          className={pay.length ? secondary : primary}
        >
          Zobrazit celé studium <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </Link>
      ) : (
        <a
          href={FREE_CONSULT_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("free_consult_click", { from: `${from}_studium` })}
          className={pay.length ? secondary : primary}
        >
          <CalendarDays className="h-5 w-5" aria-hidden="true" /> Probrat studium s Michalem
        </a>
      )}
    </div>
  );
};

/** Studium Specialista internetového obchodu: hlavní nabídka s lektory a zkouškou profesní kvalifikace v ceně. */
export const StudySection = () => {
  const open = studyOpen();
  return (
    <section id="studium" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-10 sm:px-8 md:pb-12 lg:px-12">
      <div className="grid overflow-hidden rounded-3xl border-[3px] border-signal bg-leaf-50 shadow-[0_12px_40px_-12px_rgba(52,132,90,0.35)] md:grid-cols-[1.4fr_1fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <p className="v7-para-sm inline-block bg-signal px-3 py-1 text-xs font-bold text-signal-foreground">
            Semestrální studium · {STUDY.dates}
          </p>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">{STUDY.name}</h2>
          <p className="mt-2 text-muted-foreground">
            Projdete cestu s lektory a zakončíte ji státní zkouškou profesní kvalifikace{" "}
            <a
              href={NSK_QUALIFICATION.url}
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap font-semibold text-leaf-700 underline underline-offset-4 hover:no-underline"
            >
              {NSK_QUALIFICATION.code}
            </a>
            . Osvědčení platí v celé ČR.
          </p>
          <ul className="mt-5 grid gap-x-6 gap-y-2.5 text-sm sm:grid-cols-2">
            {STUDY_ITEMS.map((it) => (
              <li key={it} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-leaf-600" strokeWidth={3} aria-hidden="true" />
                <span>{it}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs text-muted-foreground">
            Zkouška samostatně {kc(EXAM_PRICES.regular)}, pro členy {kc(EXAM_PRICES.member)}.{" "}
            <a
              href={FREE_CONSULT_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("free_consult_click", { from: "landing_studium_link" })}
              className="font-semibold text-foreground underline underline-offset-4"
            >
              Probrat studium s Michalem (20 min zdarma)
            </a>
          </p>
        </div>
        <div className="flex flex-col justify-center gap-5 border-t border-leaf-200 bg-white p-6 sm:p-8 md:border-l md:border-t-0 lg:p-10">
          {open ? (
            <>
              <StudyPrice />
              <StudyCtas from="landing" page />
              <p className="flex items-start gap-2 text-xs text-muted-foreground">
                <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Platíte při přihlášce a pak za každý měsíc studia.
              </p>
            </>
          ) : (
            <p className="rounded-xl bg-muted p-4 font-semibold">Další běh studia připravujeme.</p>
          )}
        </div>
      </div>
    </section>
  );
};
