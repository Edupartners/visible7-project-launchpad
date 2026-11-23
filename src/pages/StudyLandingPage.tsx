import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Plus } from "lucide-react";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { ADVISORS } from "@/lib/advisors";
import { lecturerPhoto } from "@/components/LecturerChip";
import { FREE_CONSULT_URL, kc, useShop } from "@/lib/shop";
import { STUDY, STUDY_ITEMS, studyOffer } from "@/lib/study";
import { NSK_QUALIFICATION } from "@/lib/qualification";

/**
 * Návrh nové úvodní stránky postavené kolem studia (náhled na /novy-web).
 * Směr: „školní prospekt“ – zarovnání vlevo, číslované sekce, linky místo karet,
 * skutečné fotky a data, jedna cena. Bez ikon u odstavců a bez vycentrované šablony.
 */

const MONTHS: { month: string; title: string; topics: string[]; lecturers: string[] }[] = [
  {
    month: "Únor",
    title: "Nápad a byznys model",
    topics: ["Vize a modrý oceán", "Lean Canvas a 12+1 typů online byznysu", "Test zájmu o nápad"],
    lecturers: ["Michal Míček", "Andrea Votrubová"],
  },
  {
    month: "Březen",
    title: "Čísla a úřady",
    topics: ["Cena, marže a bod zvratu", "Cash flow a návratnost", "Živnost, DPH a úřady", "Doména a výběr platformy"],
    lecturers: ["Michal Míček", "Jana Pincová", "Ivan Liďák"],
  },
  {
    month: "Duben",
    title: "Web nebo e-shop",
    topics: [
      "Konverzní web",
      "E-shop na WordPressu nebo Shoptetu",
      "Platby, doprava, reklamace",
      "Obchodní podmínky a GDPR",
    ],
    lecturers: ["Michal Míček", "Ivan Liďák"],
  },
  {
    month: "Květen",
    title: "První zákazníci",
    topics: ["Google Analytics 4", "Google Ads a Sklik", "Facebook a Instagram", "SEO a vyhledávání v AI"],
    lecturers: ["Lukáš Gvuzď", "Veronika Miklová", "Renata Dimitrov", "Andrea Votrubová"],
  },
  {
    month: "Červen",
    title: "Obhajoba a zkouška",
    topics: ["Srovnávače, e-mail a affiliate", "Příprava na zkoušku", "Závěrečný den v Praze"],
    lecturers: ["Patrik Zapletal", "Michal Míček"],
  },
];

const TEACHERS = [
  "Michal Míček",
  "Andrea Votrubová",
  "Jana Pincová",
  "Ivan Liďák",
  "Lukáš Gvuzď",
  "Veronika Miklová",
  "Renata Dimitrov",
  "Patrik Zapletal",
]
  .map((n) => {
    const surname = n.split(" ").slice(-1)[0];
    const a = ADVISORS.find((x) => x.name.includes(surname));
    return a ? { short: n, name: a.name, focus: a.focus, photo: a.photo } : null;
  })
  .filter(Boolean) as { short: string; name: string; focus: string; photo?: string }[];

const FAQ: [string, string][] = [
  [
    "Nemám ještě nápad. Můžu začít?",
    "Ano. V prvním měsíci ho společně najdete a ověříte. Vstupní diagnostika vám předem ukáže, na co máte talent a co se ke startu doučíte.",
  ],
  [
    "Kolik času mi to zabere?",
    "Jeden večer týdně, ve čtvrtek 17:00–20:00, a pár hodin na vlastní projekt. Ze setkání je záznam, takže když jednou nemůžete, nic nezmeškáte.",
  ],
  [
    "Musím umět techniku nebo programovat?",
    "Ne. Web nebo e-shop postavíte krok za krokem s lektorem. Stačí běžně ovládat počítač.",
  ],
  [
    "Co když u zkoušky neuspěji?",
    "Opakujete ji zdarma, dokud ji nesložíte (do konce roku 2027). Před zkouškou si navíc v aplikaci vyzkoušíte kontrolní otázky ke každé bráně.",
  ],
  [
    "Co je profesní kvalifikace?",
    `Státem uznané osvědčení podle zákona č. 179/2006 Sb. pro kvalifikaci ${STUDY.name} (${NSK_QUALIFICATION.code}). Platí v celé ČR. Zkoušku pořádá Edu Partners jako autorizovaná osoba.`,
  ],
  [
    "Jak se platí?",
    `Celý semestr předem ${kc(STUDY.upfront)}, nebo průběžně ${STUDY.payments} plateb. Ceny jsou včetně DPH, zkouška i členství VISIBLE7 jsou v ceně.`,
  ],
];

const SectionHead = ({ n, title, text }: { n: string; title: string; text?: string }) => (
  <div className="grid gap-3 border-t border-foreground/15 pt-6 md:grid-cols-[10rem_1fr]">
    <p className="font-mono text-sm text-muted-foreground">{n}</p>
    <div>
      <h2 className="max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
      {text && <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{text}</p>}
    </div>
  </div>
);

const Avatar = ({ name, size = "h-9 w-9" }: { name: string; size?: string }) => {
  const photo = lecturerPhoto(name);
  return photo ? (
    <img
      src={photo}
      alt={name}
      title={name}
      loading="lazy"
      className={`${size} rounded-full object-cover ring-2 ring-background`}
    />
  ) : null;
};

export default function StudyLandingPage() {
  const navigate = useNavigate();
  const shop = useShop();
  const offer = studyOffer(shop);
  const michal = ADVISORS.find((a) => a.name.includes("Míček"));
  const start = () => navigate("/home?novy");

  return (
    <div className="min-h-screen bg-[#f7f6f1] text-foreground">
      <PublicHeader onStart={start} />

      <main>
        {/* Úvod: vlevo text, vpravo skutečná fotka */}
        <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-14 pt-10 sm:px-8 md:grid-cols-[1.15fr_0.85fr] md:items-end md:gap-14 md:pt-16">
          <div>
            <p className="text-sm font-semibold text-leaf-700">Semestrální studium · {STUDY.dates} · online a Praha</p>
            <h1 className="mt-5 text-[2.6rem] font-extrabold leading-[1.04] tracking-[-0.035em] sm:text-6xl lg:text-[4.5rem]">
              Naučte se online byznys na vlastním projektu.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed sm:text-xl">
              <span className="font-bold">
                Získejte státem uznanou kvalifikaci{" "}
                <span className="box-decoration-clone bg-[linear-gradient(transparent_58%,hsl(var(--signal))_58%,hsl(var(--signal))_92%,transparent_92%)]">
                  Specialista internetového obchodu.
                </span>
              </span>{" "}
              <span className="text-muted-foreground">
                Vy máte sílu budovat. My máme systém: {STUDY.sessions} setkání se seniorními poradci, e-learning,
                vlastní projekt, osvědčení.
              </span>
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
              <button
                type="button"
                onClick={start}
                className="v7-trap-btn v7-phi-lg inline-flex h-14 items-center gap-2 pl-7 pr-12 text-base font-bold text-signal-foreground"
              >
                Zjistěte, co už umíte <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </button>
              <a href="#semestr" className="font-semibold underline decoration-2 underline-offset-[6px]">
                Jak studium probíhá
              </a>
            </div>
          </div>
          <figure>
            {michal?.photo && (
              <img
                src={michal.photo}
                alt="Michal Míček, autor metodiky VISIBLE7 MICEK® a zakladatel Edu Partners"
                className="aspect-[4/5] w-full object-cover grayscale-[15%]"
              />
            )}
            <figcaption className="mt-3 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Michal Míček</span>, autor metodiky VISIBLE7 MICEK®.
              Zakladatel Edu Partners, učí podnikat od roku 2011.
            </figcaption>
          </figure>
        </section>

        {/* Fakta jako tabulka, bez ikon */}
        <section className="mx-auto max-w-6xl px-4 sm:px-8">
          <dl className="grid grid-cols-2 border-y border-foreground/15 md:grid-cols-4">
            {[
              ["2011", "od tohoto roku učí Edu Partners podnikat"],
              ["1 000+", "absolventů kurzů podnikání"],
              [String(STUDY.sessions), "setkání se seniorními poradci"],
              [NSK_QUALIFICATION.code, "státem uznaná profesní kvalifikace"],
            ].map(([v, l], i) => (
              <div
                key={v}
                className={`px-1 py-6 sm:px-5 ${i % 2 ? "border-l border-foreground/15" : ""} ${i === 2 ? "md:border-l" : ""} ${i >= 2 ? "border-t border-foreground/15 md:border-t-0" : ""}`}
              >
                <dt className="text-3xl font-extrabold tracking-tight sm:text-4xl">{v}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{l}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* 01 Semestr */}
        <section id="semestr" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-20 sm:px-8">
          <SectionHead
            n="01 / Semestr"
            title="Pět měsíců, jeden večer týdně."
            text="Každý čtvrtek 17:00–20:00 online. Co probereme, hned uděláte na svém projektu. V červnu ho obhájíte a složíte zkoušku."
          />
          <ol className="mt-10 grid gap-px bg-foreground/15 md:grid-cols-5">
            {MONTHS.map((m, i) => (
              <li key={m.month} className="flex flex-col bg-[#f7f6f1] py-5 md:px-5 md:first:pl-0">
                <p className="text-sm font-semibold text-leaf-700">
                  {String(i + 1).padStart(2, "0")} · {m.month}
                </p>
                <h3 className="mt-1 text-xl font-bold">{m.title}</h3>
                <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  {m.topics.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <div className="mt-4 flex -space-x-2 pt-1 md:mt-auto">
                  {m.lecturers.map((l) => (
                    <Avatar key={l} name={l} />
                  ))}
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-5 text-sm text-muted-foreground">
            Navíc nepovinné úterní semináře 17:00–18:30.{" "}
            <Link to="/studium" className="font-semibold text-foreground underline underline-offset-4">
              Celý rozvrh
            </Link>
          </p>
        </section>

        {/* 02 Lektoři */}
        <section className="mx-auto max-w-6xl px-4 pt-24 sm:px-8">
          <SectionHead
            n="02 / Lektoři"
            title="Učí vás lidé, kteří se tím živí."
            text="Žádní teoretici. Každý učí to, co sám dělá pro klienty nebo pro vlastní firmu."
          />
          <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-4">
            {TEACHERS.map((t) => (
              <li key={t.short}>
                {t.photo ? (
                  <img src={t.photo} alt={t.name} loading="lazy" className="aspect-square w-full object-cover" />
                ) : (
                  <div className="aspect-square w-full bg-muted" />
                )}
                <p className="mt-3 font-bold leading-tight">{t.short}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{t.focus}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* 03 Co si odnesete */}
        <section className="mx-auto max-w-6xl px-4 pt-24 sm:px-8">
          <SectionHead n="03 / Výsledek" title="Co si v červnu odnesete." />
          <ol className="mt-8 divide-y divide-foreground/15 border-b border-foreground/15">
            {[
              [
                "Vlastní spuštěný projekt",
                "Web nebo e-shop, spočítaná čísla a první marketing. Ne cvičení do šuplíku.",
              ],
              [
                `Osvědčení ${STUDY.name}`,
                `Profesní kvalifikace ${NSK_QUALIFICATION.code} podle zákona č. 179/2006 Sb., platí v celé ČR.`,
              ],
              ["Aplikaci VISIBLE7", "Návody, e-learning a šablony ke každému kroku. Zůstanou vám i po studiu."],
            ].map(([t, d], i) => (
              <li key={t} className="grid gap-2 py-6 md:grid-cols-[10rem_1fr_1.2fr] md:items-baseline">
                <span className="font-mono text-sm text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-2xl font-bold tracking-tight">{t}</span>
                <span className="text-muted-foreground">{d}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* 04 Cena: jedna nabídka */}
        <section className="mx-auto max-w-6xl px-4 pt-24 sm:px-8">
          <SectionHead n="04 / Cena" title="Jedna cena, všechno v ní." />
          <div className="mt-10 grid gap-10 bg-primary p-6 text-white sm:p-10 md:grid-cols-[1fr_1fr]">
            <div>
              <p className="text-sm font-semibold text-signal">
                {offer.early
                  ? `Prvních ${STUDY.earlySeats} přihlášených · zbývá ${offer.left}`
                  : "Semestr únor–červen 2027"}
              </p>
              <p className="mt-3 text-6xl font-extrabold tracking-tight">
                {kc(offer.monthly)}
                <span className="ml-2 text-xl font-semibold text-white/70">× {STUDY.payments}</span>
              </p>
              <p className="mt-3 text-white/80">
                Nebo celý semestr předem {kc(STUDY.upfront)}. Včetně DPH, zkoušky a členství VISIBLE7.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Link
                  to="/studium"
                  className="v7-trap-btn v7-phi-lg inline-flex h-14 items-center gap-2 pl-7 pr-12 text-base font-bold text-signal-foreground"
                >
                  Přihláška ke studiu <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Link>
                <a
                  href={FREE_CONSULT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline decoration-signal decoration-2 underline-offset-[6px]"
                >
                  Probrat s Michalem (20 min zdarma)
                </a>
              </div>
            </div>
            <ul className="space-y-3 border-t border-white/20 pt-6 md:border-l md:border-t-0 md:pl-10 md:pt-0">
              {STUDY_ITEMS.map((it) => (
                <li key={it} className="text-white/90">
                  {it}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 05 Otázky */}
        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-8">
          <SectionHead n="05 / Otázky" title="Na co se lidé ptají nejčastěji." />
          <div className="mt-8 md:ml-[10.75rem]">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group border-b border-foreground/15 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                  {q}
                  <Plus className="h-5 w-5 shrink-0 transition-transform group-open:rotate-45" aria-hidden="true" />
                </summary>
                <p className="mt-3 max-w-2xl text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <Footer variant="full" />
    </div>
  );
}
