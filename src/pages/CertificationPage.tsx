import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Award,
  BadgeCheck,
  Bot,
  Briefcase,
  CalendarDays,
  Check,
  Compass,
  FileText,
  GraduationCap,
  Linkedin,
  MapPin,
  MessagesSquare,
  PlayCircle,
  QrCode,
  Rocket,
  Users,
  Video,
} from "lucide-react";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { StudyCtas, StudyPrice } from "@/components/marketing/StudySection";
import { SPECIALIST_TITLE, certificateSyllabus } from "@/lib/certificates";
import { EXAM_PRICES, NSK_QUALIFICATION } from "@/lib/qualification";
import { hoursFloor10, useLessonStats } from "@/lib/courses";
import { FREE_CONSULT_URL, kc, monthsLabel, useShop } from "@/lib/shop";
import { STUDY, studyOpen } from "@/lib/study";
import { track } from "@/lib/track";
import { ADVISORS } from "@/lib/advisors";
import { FearsSection } from "@/components/marketing/FearsSection";

const POSITIONS = [
  {
    icon: Rocket,
    title: "Podnikatel, OSVČ",
    text: "Rozjedete vlastní online projekt: od nápadu přes čísla k prvním zákazníkům.",
  },
  {
    icon: BadgeCheck,
    title: "Specialista online marketingu",
    text: "PPC, sociální sítě, SEO a měření. Vstupní pozice v agentuře i ve firmě.",
  },
  {
    icon: FileText,
    title: "E-commerce specialista",
    text: "Správa e-shopu, produkty, platby, doprava a obchodní podmínky.",
  },
  {
    icon: Briefcase,
    title: "Projektový manažer nových produktů",
    text: "Znáte celý proces startu byznysu. Uplatníte ho i ve firmě u nového produktu.",
  },
];

const MODULES: { title: string; topics: string[] }[] = [
  {
    title: "Start projektu",
    topics: [
      "Vize a strategie modrého oceánu",
      "Plánování na Canvasu",
      "Vlastnosti startupu a fáze projektu",
      "12+1 typů online byznysu",
      "Marketingové strategie",
      "Metoda VISIBLE7",
    ],
  },
  {
    title: "Ekonomika online projektu",
    topics: ["Kalkulace nákladů, tržeb, zisku a ztráty", "Byznys case a návratnost (ROI)"],
  },
  {
    title: "AI master class",
    topics: ["GPT, Claude, Gemini, Gamma, Google AI Studio", "VibeCoding", "Tvorba agentů a automatizací"],
  },
  {
    title: "Tvorba produktového webu",
    topics: ["Hosting, doména, SSL", "Konverzní web", "Statický web nebo redakční systém"],
  },
  {
    title: "Vlastní e-shop",
    topics: ["Krabicové nebo open-source řešení", "Instalace e-shopového systému", "Šablony a úpravy"],
  },
  { title: "Další online modely", topics: ["Online kurzy", "Squeeze page", "Fóra", "Web a e-shop dohromady"] },
  {
    title: "Online marketing",
    topics: [
      "Srovnávače a katalogy",
      "PPC: Sklik a Google Ads",
      "Reklama v GPT",
      "SEO",
      "Sociální sítě",
      "E-mail a SMS",
      "PR a kreativní obsah",
    ],
  },
  {
    title: "Online analytika",
    topics: ["Google Analytics 4", "Google Tag Manager", "Google Search Console", "Reporty"],
  },
  {
    title: "Legislativa",
    topics: ["Volba formy podnikání", "Povinnosti e-shopu", "Jednání s úřady", "GDPR", "Ochrana značky"],
  },
];

const LECTURERS: [string, string][] = [
  ["Andrea Votrubová", "copywriting, SEO, PR"],
  ["Renata Dimitrov", "placené kampaně na Facebooku a Instagramu"],
  ["Lukáš Gvuzď", "PPC, SEO, Google Analytics 4"],
  ["Veronika Miklová", "nastavení a správa PPC kampaní"],
  ["Patrik Zapletal", "affiliate marketing a kampaně"],
  ["Hana Antonová", "online grafická reklama"],
  ["Honza Novák", "data, programování a AI"],
  ["Tomáš Chára", "AI procesy a automatizace"],
  ["Ivan Liďák", "WordPress a IT podpora"],
];

/** Fotka lektora z karet poradců (podle příjmení). */
const photoOf = (name: string) => {
  const surname = name.split(" ").slice(-1)[0];
  return ADVISORS.find((a) => a.name.includes(surname) && a.photo)?.photo;
};

const TIMELINE = [
  {
    when: "11. 2. 2027",
    title: "Start studia",
    text: "První online setkání. Vyberete si projekt, na kterém budete celé studium pracovat.",
  },
  {
    when: "únor–červen",
    title: `${STUDY.sessions} online setkání s lektory`,
    text: "Jednou týdně 17:00–20:00 online (Google Meet), celkem asi 60 hodin. Mezi setkáními pracujete na svém projektu ve VISIBLE7.",
  },
  {
    when: "průběžně",
    title: "Konzultace vašeho byznysu",
    text: "Lektoři se podívají přímo na váš projekt a poradí, co zlepšit.",
  },
  {
    when: "červen, Praha",
    title: "Závěrečný den",
    text: `Obhajoba projektu a zkouška profesní kvalifikace ${NSK_QUALIFICATION.code}.`,
  },
  {
    when: "do 15. 6. 2027",
    title: "Hotovo",
    text: "Máte vlastní projekt, certifikaci VISIBLE7 a státem uznané osvědčení.",
  },
];

/** Veřejná stránka studia Specialista internetového obchodu (dříve jen certifikace): vše, co studium obsahuje. */
const CertificationPage = () => {
  const navigate = useNavigate();
  const shop = useShop();
  const { hours, lessons } = useLessonStats();
  const start = () => navigate("/home?novy");
  const syllabus = certificateSyllabus("gold", null);
  const open = studyOpen();
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" }), 50);
    return () => clearTimeout(t);
  }, [hash]);

  /** Co všechno je ve studiu. Ceny „samostatně“ jen tam, kde je opravdu prodáváme zvlášť. */
  const VALUE: { icon: typeof Award; title: string; text: string; alone?: string }[] = [
    {
      icon: Users,
      title: `${STUDY.sessions} online setkání s lektory z praxe`,
      text: "Jednou týdně 17:00–20:00 online, celkem asi 60 hodin. Živě, s možností ptát se. Devět modulů od nápadu po analytiku.",
    },
    {
      icon: GraduationCap,
      title: `Státní zkouška ${NSK_QUALIFICATION.code} v ceně`,
      text: "Osvědčení o profesní kvalifikaci Specialista internetového obchodu, uznané státem a platné v celé ČR.",
      alone: kc(EXAM_PRICES.regular),
    },
    {
      icon: Rocket,
      title: "Vlastní projekt",
      text: "Web nebo e-shop, marketing a čísla. Nestudujete teorii, stavíte svůj byznys a na konci ho obhájíte.",
    },
    {
      icon: MessagesSquare,
      title: "Konzultace vašeho byznysu",
      text: "Lektoři projdou přímo váš projekt. Žádné obecné rady, ale co máte udělat vy.",
    },
    {
      icon: PlayCircle,
      title: "E-learning",
      text: `${lessons.toLocaleString("cs-CZ")} krátkých návodů a přes ${hoursFloor10(hours)} hodin videí. Kdykoli se k nim vrátíte.`,
    },
    {
      icon: Compass,
      title: "Plán 7 bran s průvodcem",
      text: "Metodika VISIBLE7 MICEK® vás vede krok po kroku od nápadu po růst. Vždy víte, co je další krok.",
    },
    {
      icon: Bot,
      title: "AI Michal u každé brány",
      text: "Navrhne canvas, předvyplní čísla a okomentuje váš plán. Když nevíte, co napsat.",
    },
    {
      icon: Video,
      title: "Členství VISIBLE7 v ceně",
      text: "Všech 7 bran, byznys case s exportem do Excelu, pitch na A4 a živé webináře jednou měsíčně.",
      alone: `${kc(shop.price)} / ${monthsLabel(shop.months)}`,
    },
    {
      icon: Award,
      title: "Osvědčení za každou bránu a certifikace",
      text: `Osvědčení s ověřovacím kódem a certifikace ${SPECIALIST_TITLE}. Do životopisu i na LinkedIn.`,
    },
    {
      icon: MapPin,
      title: "Závěrečný den v Praze",
      text: "Osobně: obhajoba projektu před lektory a zkouška profesní kvalifikace.",
    },
  ];

  const consult = (
    <a
      href={FREE_CONSULT_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("free_consult_click", { from: "studium_page_link" })}
      className="font-semibold text-primary underline underline-offset-4 hover:no-underline"
    >
      Probrat studium s Michalem (20 min zdarma)
    </a>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader onStart={start} />
      <main>
        {/* Hero se studiem a cenou */}
        <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-12 sm:px-8 md:pt-16 lg:grid-cols-[1.25fr_1fr] lg:px-12">
          <div>
            <p className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-leaf-200 bg-leaf-50 px-3.5 py-1.5 text-sm font-semibold text-leaf-800">
                <CalendarDays className="h-4 w-4" aria-hidden="true" /> Semestrální studium · {STUDY.dates}
              </span>
              <span className="v7-para-sm bg-signal px-2.5 py-0.5 text-xs font-extrabold text-signal-foreground">
                TOP
              </span>
            </p>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">{STUDY.name}</h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Za čtyři měsíce si s lektory postavíte vlastní online byznys a zakončíte to státní zkouškou profesní
              kvalifikace {NSK_QUALIFICATION.code}. Lektoři, e-learning, plán 7 bran, AI i zkouška v jedné ceně.
            </p>
            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {[
                `${STUDY.sessions} online setkání s lektory`,
                `Státní zkouška ${NSK_QUALIFICATION.code} v ceně`,
                "Vlastní projekt s konzultacemi",
                "E-learning a celé VISIBLE7",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 font-medium">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-signal text-signal-foreground">
                    <Check className="h-3 w-3" strokeWidth={3.5} aria-hidden="true" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted-foreground">
              Studium pořádá Edu Partners s.r.o., vzdělávací společnost s akreditací MŠMT pro rekvalifikace a
              autorizovaná osoba MPO pro zkoušku profesní kvalifikace. Vzděláváme od roku 2011.
            </p>
          </div>
          <div
            id="cena"
            className="h-fit scroll-mt-24 rounded-3xl border-[3px] border-signal bg-white p-6 shadow-[0_12px_40px_-12px_rgba(52,132,90,0.35)] sm:p-8"
          >
            {open ? (
              <>
                <StudyPrice />
                <div className="mt-6">
                  <StudyCtas from="studium_page" />
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  Platíte při přihlášce a pak za každý měsíc studia. Fakturuje Edu Partners s.r.o.
                </p>
              </>
            ) : (
              <p className="rounded-xl bg-muted p-4 font-semibold">Další běh studia připravujeme.</p>
            )}
          </div>
        </section>

        {/* Co všechno dostanete */}
        <section className="px-3 py-2 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1280px] rounded-[2rem] bg-leaf-50 py-16 md:py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-8 lg:px-12">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Co všechno ve studiu dostanete</h2>
              <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
                Všechno, co potřebujete k rozjezdu online podnikání, na jednom místě a za jednu cenu.
              </p>
              <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {VALUE.map(({ icon: Icon, title, text, alone }) => (
                  <li key={title} className="flex flex-col rounded-2xl bg-white p-6 shadow-sm">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-leaf-500 text-white">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-lg font-bold leading-snug">{title}</h3>
                    <p className="mt-2 flex-1 text-muted-foreground">{text}</p>
                    {alone && (
                      <p className="mt-4 border-t border-border pt-3 text-sm">
                        Samostatně <span className="font-bold">{alone}</span> ·{" "}
                        <span className="font-semibold text-leaf-700">ve studiu v ceně</span>
                      </p>
                    )}
                  </li>
                ))}
                <li className="flex flex-col justify-center rounded-2xl border-[3px] border-signal bg-white p-6">
                  <p className="text-sm font-semibold text-leaf-700">Všechno výše</p>
                  <div className="mt-2">
                    <StudyPrice />
                  </div>
                  <a
                    href="#cena"
                    className="mt-4 font-semibold text-primary underline underline-offset-4 hover:no-underline"
                  >
                    Přihlásit se
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Program po modulech */}
        <section id="program" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-20 sm:px-8 lg:px-12">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Program studia: 9 modulů</h2>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            {STUDY.sessions} online setkání, jednou týdně 17:00–20:00 přes Google Meet. Celkem asi 60 hodin s lektory z
            praxe.
          </p>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((m, i) => (
              <li key={m.title} className="rounded-2xl border border-border bg-card p-6">
                <p className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-signal text-sm font-extrabold text-signal-foreground">
                    {i + 1}
                  </span>
                  <span className="text-lg font-bold leading-snug">{m.title}</span>
                </p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {m.topics.map((t) => (
                    <li key={t} className="rounded-full bg-leaf-50 px-2.5 py-1 text-sm text-leaf-800">
                      {t}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>

          <h3 className="mt-14 text-2xl font-extrabold tracking-tight">Lektoři z praxe</h3>
          <div className="mt-4 flex items-center gap-4">
            {photoOf("Michal Míček") && (
              <img
                src={photoOf("Michal Míček")}
                alt="Michal Míček"
                loading="lazy"
                className="h-16 w-16 rounded-full object-cover ring-2 ring-signal"
              />
            )}
            <p className="text-muted-foreground">
              Garantem studia je <span className="font-semibold text-foreground">Michal Míček</span>, zakladatel Edu
              Partners a autor metodiky VISIBLE7 MICEK®.
            </p>
          </div>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {LECTURERS.map(([name, focus]) => {
              const photo = photoOf(name);
              return (
                <li key={name} className="flex items-center gap-4 rounded-2xl border border-border p-4">
                  {photo ? (
                    <img
                      src={photo}
                      alt={name}
                      loading="lazy"
                      className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-signal"
                    />
                  ) : (
                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-white">
                      {name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")}
                    </span>
                  )}
                  <span>
                    <span className="block font-semibold">{name}</span>
                    <span className="block text-sm text-muted-foreground">{focus}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Harmonogram */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-8 lg:px-12">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Jak studium probíhá</h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-5">
            {TIMELINE.map((s, i) => (
              <li
                key={s.title}
                className={`rounded-2xl p-5 ${i === TIMELINE.length - 2 ? "bg-primary text-white" : "border border-border bg-card"}`}
              >
                <p className={`text-sm font-semibold ${i === TIMELINE.length - 2 ? "text-signal" : "text-leaf-700"}`}>
                  {s.when}
                </p>
                <h3 className="mt-2 text-lg font-bold leading-snug">{s.title}</h3>
                <p
                  className={`mt-2 text-sm leading-relaxed ${i === TIMELINE.length - 2 ? "text-white/80" : "text-muted-foreground"}`}
                >
                  {s.text}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Profesní kvalifikace */}
        <section className="px-3 py-2 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] bg-leaf-500 text-white">
            <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-8 lg:px-12 md:grid-cols-[1.3fr_1fr] md:py-20">
              <div>
                <p className="font-semibold text-white/80">Ve studiu v ceně</p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Státem uznaná profesní kvalifikace
                </h2>
                <p className="mt-4 text-lg text-white/85">
                  Studium zakončíte zkouškou profesní kvalifikace <strong>{NSK_QUALIFICATION.name}</strong> podle zákona
                  č. 179/2006 Sb. Zkoušku pořádá Edu Partners jako autorizovaná osoba. Osvědčení o profesní kvalifikaci
                  je uznané státem a platí v celé ČR.
                </p>
                <p className="mt-3 text-sm text-white/75">
                  Bez studia lze zkoušku složit i samostatně: {kc(EXAM_PRICES.regular)}, pro členy VISIBLE7{" "}
                  {kc(EXAM_PRICES.member)}.
                </p>
                <a
                  href={NSK_QUALIFICATION.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-block font-semibold underline underline-offset-4 hover:no-underline"
                >
                  Kvalifikace v Národní soustavě kvalifikací
                </a>
              </div>
              <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/20">
                {[
                  ["Kód kvalifikace", NSK_QUALIFICATION.code],
                  ["Úroveň", `EQF ${NSK_QUALIFICATION.eqf}`],
                  ["Uznává", "Národní soustava kvalifikací"],
                  ["Zkouška", "závěrečný den v Praze"],
                ].map(([l, v]) => (
                  <div key={l} className="bg-leaf-700 p-5">
                    <dt className="text-sm text-white/70">{l}</dt>
                    <dd className="mt-1 text-xl font-bold">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* Co budete umět */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-8 lg:px-12">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Co budete umět</h2>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            Obsah 7 bran VISIBLE7. Brány 1–5 vedou k certifikaci {SPECIALIST_TITLE}, brány 6–7 k VISIBLE7 Gold. Stejný
            obsah uvádí příloha osvědčení.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {syllabus.map((s) => (
              <div key={s.phase} id={`brana-${s.phase}`} className="scroll-mt-24 rounded-2xl border border-border p-6">
                <p className="text-sm font-semibold text-leaf-700">
                  Brána {s.phase}
                  {s.phase > 5 && <span className="ml-2 text-muted-foreground">· pro VISIBLE7 Gold</span>}
                </p>
                <h3 className="mt-1 text-xl font-bold">{s.name}</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {s.topics.map((t) => (
                    <li key={t} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 border-t border-border pt-3 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Výstup:</span> {s.outputs.join(", ")}
                </p>
              </div>
            ))}
            <div className="flex flex-col justify-center rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Na certifikaci</p>
              <p className="mt-2 flex items-center gap-2">
                <QrCode className="h-4 w-4" aria-hidden="true" /> QR kód a ověření pravosti
              </p>
              <p className="mt-2 flex items-center gap-2">
                <FileText className="h-4 w-4" aria-hidden="true" /> Příloha s obsahem programu
              </p>
              <p className="mt-2 flex items-center gap-2">
                <Linkedin className="h-4 w-4" aria-hidden="true" /> Přidání na LinkedIn jedním klikem
              </p>
            </div>
          </div>
        </section>

        {/* Uplatnění */}
        <section className="px-3 py-2 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1280px] rounded-[2rem] bg-muted/50 py-16 md:py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-8 lg:px-12">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Kde se uplatníte</h2>
              <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
                Studium dává pevný základ pro vlastní podnikání i pro vstupní pozice v marketingu a e-commerce.
              </p>
              <ul className="mt-10 grid gap-5 sm:grid-cols-2">
                {POSITIONS.map(({ icon: Icon, title, text }) => (
                  <li key={title} className="flex gap-4 rounded-2xl bg-card p-6">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold">{title}</h3>
                      <p className="mt-1 text-muted-foreground">{text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <FearsSection from="studium_page" compact />

        {/* Závěr */}
        <section className="mx-auto max-w-4xl px-4 py-20 sm:px-8">
          <div className="grid gap-8 rounded-3xl border-[3px] border-signal bg-leaf-50 p-6 sm:p-10 md:grid-cols-[1.2fr_1fr] md:items-center">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">Začněte 11. 2. 2027</h2>
              <p className="mt-3 text-muted-foreground">
                Nejste si jistí, jestli je studium pro vás? Zavolejte Michalovi. Za 20 minut probereme váš nápad a
                řekneme si upřímně, jestli vám studium pomůže.
              </p>
              <p className="mt-4">{consult}</p>
            </div>
            <div className="rounded-2xl bg-white p-6">
              {open ? (
                <>
                  <StudyPrice />
                  <div className="mt-5">
                    <StudyCtas from="studium_page_bottom" />
                  </div>
                </>
              ) : (
                <p className="font-semibold">Další běh studia připravujeme.</p>
              )}
            </div>
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Chcete začít sami a zdarma?{" "}
            <button type="button" onClick={start} className="font-semibold text-primary underline underline-offset-4">
              Otestovat nápad zdarma
            </button>{" "}
            ·{" "}
            <Link to="/cenik" className="font-semibold text-primary underline underline-offset-4">
              Ceník
            </Link>
          </p>
        </section>
      </main>
      <Footer variant="full" />
    </div>
  );
};

export default CertificationPage;
