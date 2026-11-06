import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Check, CreditCard } from "lucide-react";
import { EXAM_PRICES, NSK_QUALIFICATION } from "@/lib/qualification";
import { FREE_CONSULT_URL, kc, useShop } from "@/lib/shop";
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
        nebo {kc(offer.price)} najednou
        {offer.early ? `, potom ${kc(STUDY.price)}` : ""}. Vč. DPH, zkoušky a členství.
      </p>
    </div>
  );
};

/** Tlačítka studia: platba najednou, 5 plateb a úvodní hovor s Michalem (vždy). */
export const StudyCtas = ({ from, dark = false }: { from: string; dark?: boolean }) => {
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
      <a
        href={FREE_CONSULT_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("free_consult_click", { from: `${from}_studium` })}
        className={pay.length ? secondary : primary}
      >
        <CalendarDays className="h-5 w-5" aria-hidden="true" /> Probrat studium s Michalem
      </a>
    </div>
  );
};

/** Studium Specialista internetového obchodu: hlavní nabídka s lektory a zkouškou profesní kvalifikace v ceně. */
export const StudySection = () => {
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
            {open ? (
              <>
                <div className="mt-6">
                  <StudyPrice dark />
                </div>
                <div className="mt-6">
                  <StudyCtas from="landing" dark />
                </div>
              </>
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
              Platíte při přihlášce a pak za každý měsíc studia. Za každou bránu VISIBLE7 navíc osvědčení s ověřovacím
              kódem.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
