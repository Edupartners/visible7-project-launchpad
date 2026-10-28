import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Clock, Gauge, Sparkles, UserRound } from "lucide-react";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { track } from "@/lib/track";

/** Název klienta na jednom místě – před zveřejněním potřebujeme jeho souhlas (případně anonymizovat). */
const CLIENT = "ORTOCENTRUM";
const CLIENT_DESC = "síť ortopedických ambulancí";

const RESULTS = [
  {
    title: "Převzetí",
    text: "4 weby převzaté od původního dodavatele na vlastní hosting a GitHub s automatickým nasazováním.",
  },
  {
    title: "Redesign",
    text: "3 weby přepracované do jednotného designu podle hlavního webu, s opravenými a sjednocenými údaji.",
  },
  {
    title: "Úklid",
    text: "Pryč přes 6 000 nepoužívaných souborů, fotky menší o 6 MB, výkon hlavního webu 96/100 v Google Lighthouse.",
  },
  {
    title: "AI first",
    text: "Strukturovaná data schema.org, soubor llms.txt a meta popisy, aby web dobře četl Google i AI asistenti.",
  },
  {
    title: "Měření",
    text: "GA4 se souhlasem s cookies a měřením kliknutí na telefon, tedy lidí, kteří se chtěli objednat.",
  },
  { title: "Report", text: "Automatický měsíční PDF report s komentářem jako služba v ceně." },
];

const MINDSET = [
  ["Prodávám hodiny práce", "Prodávám výsledek a klid klienta"],
  ["Píšu kód", "Zadávám, kontroluji a rozhoduji"],
  ["Jednorázová zakázka", "Dlouhodobý vztah a předplatné"],
  ["Čekám na zadání", "Sám navrhuji, co klientovi pomůže"],
];

const ERRC = [
  {
    title: "Eliminovat",
    items: [
      "agenturu, projektové manažery, obchodníky",
      "programátora a grafika jako další lidi",
      "dlouhé schvalovací kolečko a briefy",
      "web „hotovo a konec“ bez další péče",
    ],
  },
  {
    title: "Posílit",
    items: [
      "rychlost změn: z týdnů na hodiny",
      "péči po spuštění, každý měsíc",
      "měřitelný výsledek: kliknutí na telefon",
      "znalost oboru a osobní vztah s klientem",
    ],
  },
  {
    title: "Omezit",
    items: [
      "cenu spuštění na zlomek agenturní ceny",
      "dobu dodání z týdnů na dny",
      "techniku: bez WordPressu a pluginů",
      "počet lidí, se kterými klient jedná, na 1",
    ],
  },
  {
    title: "Vytvořit",
    accent: true,
    items: [
      "měsíční report s komentářem v ceně",
      "viditelnost v ChatGPT a AI asistentech",
      "web jako předplatné, ne jednorázovka",
      "automatizaci přes Claude místo týmu",
    ],
  },
];

const CURVE = [
  ["Cena spuštění", "vysoká", "nízká", "nízká"],
  ["Doba dodání", "týdny", "týdny", "dny"],
  ["Počet lidí v projektu", "3–6", "1", "1 + AI"],
  ["Péče po spuštění", "za příplatek", "obvykle žádná", "v ceně"],
  ["Měsíční výsledky a report", "výjimečně", "ne", "ano"],
  ["Viditelnost v AI asistentech", "zřídka", "ne", "ano"],
  ["Znalost oboru klienta", "obecná", "obecná", "hluboká (úzký segment)"],
];

const PACKAGES = [
  ["Start", "Převzetí webu, oprava údajů, hosting, měření GA4", "5 000 Kč", "490 Kč"],
  ["Standard", "Nový design, SEO a AI viditelnost, měsíční PDF report s doporučením", "15 000 Kč", "990 Kč"],
  ["Síť", "Více webů nebo poboček v jednotném designu, report za celou síť", "25 000 Kč", "1 690 Kč"],
];

const BUILD = [
  [
    "Převzetí a záloha",
    "Domény a hosting na vlastní účet, všechny weby do repozitáře na GitHubu. Claude nastavil automatické nasazení: co se uloží, je za pár minut na webu.",
  ],
  [
    "Audit proti zadání",
    "Claude porovnal seznam změn od klienta s živými weby a označil, co už platí, co si odporuje a co je zastaralé. Rozhodnutí udělal člověk.",
  ],
  [
    "Redesign podle vzoru",
    "Hlavní web posloužil jako šablona. Claude podle něj přestavěl další tři weby se stejným designem a sjednocenými údaji. Náhledy šly klientovi ke schválení.",
  ],
  [
    "Úklid a rychlost",
    "Smazání tisíců nepoužívaných souborů, zmenšení fotek, kontrola, že žádný odkaz nevede do prázdna.",
  ],
  [
    "AI first viditelnost",
    "Titulky a popisy („ortopedie Ostrava“), strukturovaná data schema.org s adresami, hodinami a lékaři, soubor llms.txt pro AI asistenty.",
  ],
  ["Měření", "GA4 s lištou souhlasu s cookies a měření hlavní akce oboru, u ordinace kliknutí na telefon."],
  [
    "Automatický report",
    "Šablona PDF a naplánovaná úloha, která každého 2. v měsíci stáhne data, napíše komentář a připraví e-mail ke schválení.",
  ],
];

const LIGHTHOUSE: [string, string, string, string, string][] = [
  ["Výkon", "95", "66", "96", "90"],
  ["Přístupnost", "71", "—", "95", "95"],
  ["Doporučené postupy", "100", "—", "100", "100"],
  ["SEO", "82", "—", "100", "100"],
];

const TEST = [
  ["Přináší web klientovi poptávky?", "Kliknutí na telefon v GA4 měsíc po měsíci", "Stabilní nebo rostoucí počet"],
  ["Ocení klient měsíční report?", "Odpoví na něj, ptá se, chce změny", "Sám řekne, že by za to platil"],
  ["Zvládnu to v plánovaném čase?", "Čas na kontrolu a odeslání reportu", "Do 60 minut měsíčně"],
];

const RISKS = [
  ["AI udělá chybu v údajích (hodiny, telefony)", "Hlavní web je zdroj pravdy, každý výstup kontroluji na živém webu."],
  ["Trh se rychle zaplní „AI weby“", "Rychle získat reference v úzkém oboru, prodávat výsledky a vztah, ne web."],
  ["Závislost na jednom nástroji", "Weby jsou obyčejné HTML na mém hostingu a GitHubu, přenositelné kamkoliv."],
  ["GDPR a cookies", "Lišta souhlasu na každém webu, zpracovatelská doložka ve smlouvě."],
  ["Čísla v GA4 jsou nižší (odmítnuté cookies)", "Klientovi to vysvětlit, sledovat vývoj, ne absolutní čísla."],
];

const Gate = ({ letter, title, children }: { letter: string; title: string; children: React.ReactNode }) => (
  <section className="border-t border-border px-4 py-14 sm:px-8 md:py-20">
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center gap-4">
        <span className="v7-para flex h-12 w-14 shrink-0 items-center justify-center bg-leaf-800 text-xl font-extrabold text-white">
          {letter}
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
      </div>
      <div className="mt-8 space-y-6 text-lg leading-relaxed text-foreground/85">{children}</div>
    </div>
  </section>
);

const Table = ({
  head,
  rows,
  highlightLast = false,
}: {
  head: string[];
  rows: string[][];
  highlightLast?: boolean;
}) => (
  <div className="overflow-x-auto rounded-2xl border border-border">
    <table className="w-full min-w-[520px] text-left text-base">
      <thead className="bg-muted/60 text-sm">
        <tr>
          {head.map((h, i) => (
            <th
              key={h}
              className={`px-4 py-3 font-bold ${highlightLast && i === head.length - 1 ? "bg-leaf-100 text-leaf-900" : ""}`}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r[0]} className="border-t border-border">
            {r.map((c, i) => (
              <td
                key={i}
                className={`px-4 py-3 align-top ${i === 0 ? "font-semibold" : "text-foreground/80"} ${
                  highlightLast && i === r.length - 1 ? "bg-leaf-50 font-semibold text-leaf-900" : ""
                }`}
              >
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/** Případová studie: Webový specialista s AI – reálný projekt provedený celou metodikou VISIBLE7 MICEK®. */
const CaseStudyWebSpecialistPage = () => {
  const navigate = useNavigate();
  const start = () => {
    track("feature_cta_click", { page: "case-study-webovy-specialista" });
    navigate("/home?novy");
  };

  useEffect(() => {
    document.title = "Případová studie: Webový specialista s AI | VISIBLE7 MICEK";
    const meta = document.querySelector('meta[name="description"]');
    const prev = meta?.getAttribute("content") ?? null;
    meta?.setAttribute(
      "content",
      "Jeden člověk s Claude postaví, spustí a udržuje weby malé firmy včetně měsíčního reportingu. Reálný projekt provedený metodikou VISIBLE7 MICEK® od Vize po Expanzi.",
    );
    window.scrollTo(0, 0);
    return () => {
      if (meta && prev !== null) meta.setAttribute("content", prev);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader onStart={start} />
      <main>
        {/* Úvod */}
        <section className="px-4 pb-14 pt-14 sm:px-8 md:pb-20 md:pt-20">
          <div className="mx-auto max-w-4xl">
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-leaf-700">Případová studie · AI first</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-5xl lg:text-[3.5rem]">
              Webový specialista s AI: <span className="text-leaf-500">4 weby za jeden den</span>, bez agentury a bez
              týmu.
            </h1>
            <p className="mt-6 max-w-3xl text-xl leading-relaxed text-muted-foreground">
              Jeden člověk s odbornou znalostí a s Claude dnes postaví, spustí a udržuje weby malé firmy včetně
              měsíčního reportingu. Ukazujeme to na reálném projektu a provádíme jím celou cestou VISIBLE7 MICEK®, od
              Vize po Expanzi.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold">
              <span className="inline-flex items-center gap-2">
                <UserRound className="h-4 w-4 text-leaf-600" /> Klient: {CLIENT}, {CLIENT_DESC}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4 text-leaf-600" /> Vše za jeden den, 28. 10. 2026
              </span>
              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-leaf-600" /> Postaveno AI first, s Claude
              </span>
            </div>
          </div>
        </section>

        {/* Velká čísla */}
        <section className="px-4 sm:px-8">
          <dl className="mx-auto grid max-w-5xl gap-px overflow-hidden rounded-3xl bg-border sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["4", "weby převzaté a nasazené", true],
              ["66 → 90", "výkon na mobilu (Lighthouse)", false],
              ["82 → 100", "SEO skóre hlavního webu", false],
              ["6 000+", "zbytečných souborů pryč", false],
            ].map(([num, label, hero]) => (
              <div key={String(label)} className={`p-6 ${hero ? "bg-leaf-800 text-white" : "bg-card"}`}>
                <dt className={`text-sm ${hero ? "text-white/75" : "text-muted-foreground"}`}>{label}</dt>
                <dd className="mt-2 whitespace-nowrap text-4xl font-extrabold tabular-nums tracking-tight">{num}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Výsledek dne */}
        <section className="px-4 py-14 sm:px-8 md:py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Co vzniklo za jeden den</h2>
            <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
              Všechno jsme zvládli udělat za jeden den společně: člověk zadával a rozhodoval, Claude dělal řemeslo.
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {RESULTS.map((r) => (
                <li key={r.title} className="rounded-2xl border border-border bg-card p-5">
                  <p className="flex items-center gap-2 font-bold">
                    <Check className="h-5 w-5 text-leaf-600" strokeWidth={3} /> {r.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
                </li>
              ))}
            </ul>
            <p className="mt-8 rounded-2xl bg-leaf-50 p-5 text-base leading-relaxed ring-1 ring-leaf-200">
              <strong>Pro koho je:</strong> pro každého, kdo zvažuje vlastní živnost v digitálu. Rekvalifikanti,
              marketéři, absolventi, podnikatelé, kteří chtějí přidat službu. Programovat neumět nemusí, musí rozumět
              tomu, co klient potřebuje, a umět výstup AI zkontrolovat.
            </p>
          </div>
        </section>

        {/* Mindset */}
        <Gate letter="M" title="Mindset: nejsem kodér, jsem průvodce klienta">
          <p>Základ celé služby je změna role. AI udělá řemeslo, člověk nese úsudek a odpovědnost.</p>
          <Table head={["Dřív (kodér, agentura)", "Teď (webový specialista s AI)"]} rows={MINDSET} highlightLast />
          <p>Na projektu se ukázalo, kde je lidský úsudek nenahraditelný:</p>
          <ul className="space-y-3">
            {[
              "Klient poslal seznam změn a část z nich už neplatila. Jedno upozornění mělo termín, který dávno uplynul. Zveřejnit ho by pacienty mátlo.",
              "Ordinační hodiny se na dvou webech lišily (do 14:00 vs. do 15:00). Rozhodlo pravidlo „hlavní web je zdroj pravdy“ a otázka na klienta.",
              "AI navrhla smazat i soubor, na který odkazoval jiný web. Kontrola to zachytila.",
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-leaf-500" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <p className="rounded-2xl bg-leaf-800 p-5 font-semibold text-white">
            Pravidlo pro tuto živnost: za každé slovo a číslo na webu klienta ručím já, ne AI. Proto ke každému výstupu
            patří kontrola.
          </p>
        </Gate>

        <Gate letter="V" title="Vize: živnost „web + výsledky v ceně“">
          <p>
            Do 12 měsíců mít 15–20 malých firem, kterým se starám o web a každý měsíc jim posílám report, co web
            přinesl. Jako jeden člověk, s Claude jako celým týmem.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              [
                "Komu pomáhám",
                "Lékařům, ordinacím, řemeslníkům, službám a malým firmám v regionu. Mají web, ale nikdo se o něj nestará.",
              ],
              [
                "Jaký problém řeším",
                "Zastaralé informace, pomalý web, nulová viditelnost v Googlu i v AI, žádná čísla.",
              ],
              ["Proč já", "Znám klienta a jeho obor, rozumím digitálu a s AI dodám za dny to, co agentura za týdny."],
              ["Jak poznám úspěch", "Klient každý měsíc vidí, kolik lidí mu z webu zavolalo, a platí předplatné."],
            ].map(([t, d]) => (
              <li key={t} className="rounded-2xl border border-border bg-card p-5 text-base">
                <p className="font-bold">{t}</p>
                <p className="mt-1 text-muted-foreground">{d}</p>
              </li>
            ))}
          </ul>
        </Gate>

        <Gate letter="I" title="Ideace: strategie modrého oceánu">
          <p>
            Nesoutěžit s agenturami ani s levnými freelancery v jejich hře. Pomocí ERRC mřížky odstranit agenturu a tým
            a vytvořit novou hodnotu, kterou dává AI: péči a výsledky v ceně.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {ERRC.map((q) => (
              <div
                key={q.title}
                className={`rounded-2xl p-5 text-base ${q.accent ? "bg-leaf-800 text-white" : "border border-border bg-card"}`}
              >
                <p className={`font-extrabold ${q.accent ? "text-leaf-300" : ""}`}>
                  {q.title}
                  {q.accent && <span className="ml-2 text-sm font-semibold text-white/70">přidaná hodnota AI</span>}
                </p>
                <ul className={`mt-2 space-y-1 ${q.accent ? "text-white/90" : "text-muted-foreground"}`}>
                  {q.items.map((i) => (
                    <li key={i}>– {i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <h3 className="pt-4 text-xl font-bold">Křivka hodnoty: kde je nový prostor</h3>
          <Table
            head={["Faktor", "Agentura", "Levný freelancer", "Webový specialista s AI"]}
            rows={CURVE}
            highlightLast
          />
        </Gate>

        <Gate letter="S" title="Strategie: segment, nabídka, cena">
          <p>
            <strong>Segment:</strong> firmy s 1–20 lidmi, pro které je web hlavní zdroj poptávek po telefonu. Ordinace,
            řemesla, služby, malé provozovny. Mají peníze na předplatné, ale ne na agenturu.
          </p>
          <Table head={["Balíček", "Co obsahuje", "Jednorázově", "Měsíčně"]} rows={PACKAGES} />
          <p className="text-sm text-muted-foreground">Ceny jsou návrh k ověření na prvních klientech.</p>
          <h3 className="pt-2 text-xl font-bold">Ekonomika jednoho klienta (Standard)</h3>
          <ul className="space-y-2">
            {[
              "Práce na spuštění: 1 den. Čtyři weby na tomto projektu zabraly jeden den.",
              "Měsíční práce: kontrola a odeslání reportu, drobné úpravy, zhruba 30–60 minut.",
              "Náklady: hosting a domény desítky až stovky Kč měsíčně na klienta, předplatné AI se rozpočítá mezi všechny klienty.",
              "Při 15 klientech ve Standardu: 15 × 990 Kč = 14 850 Kč měsíčně opakovaného příjmu za zhruba 10–15 hodin práce, plus čas na obchod a podporu a jednorázové zakázky.",
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <Check className="mt-1.5 h-4 w-4 shrink-0 text-leaf-600" strokeWidth={3} />
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <p className="rounded-2xl bg-leaf-50 p-5 font-semibold ring-1 ring-leaf-200">
            Klíčové rozhodnutí: prodávám předplatné, ne web. Web je vstupenka, hodnota je v tom, že se o něj někdo stará
            a každý měsíc ukáže výsledek.
          </p>
        </Gate>

        <Gate letter="B" title="Build: služba postavená s Claude">
          <p>Celá technická část běží přes Claude. Člověk zadává, kontroluje a rozhoduje. Takto proběhl projekt:</p>
          <ol className="space-y-4">
            {BUILD.map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-leaf-100 font-extrabold text-leaf-800">
                  {i + 1}
                </span>
                <span>
                  <strong>{t}.</strong> {d}
                </span>
              </li>
            ))}
          </ol>
          <p>
            <strong>Co člověk potřebuje umět:</strong> rozumět klientovi a jeho oboru, umět zadat úkol, zkontrolovat
            výsledek na živém webu a vysvětlit klientovi čísla. Programovat nemusí.
          </p>
          <h3 className="flex items-center gap-2 pt-2 text-xl font-bold">
            <Gauge className="h-5 w-5 text-leaf-600" /> Výsledek v číslech: Google Lighthouse, hlavní web
          </h3>
          <Table
            head={["Ukazatel", "Ráno, počítač", "Ráno, mobil", "Večer, počítač", "Večer, mobil"]}
            rows={LIGHTHOUSE}
          />
          <p className="text-base text-muted-foreground">
            Měřeno 28. 10. 2026. Ráno se mobil změřil jen pro výkon. Největší skok na mobilu (z 66 na 90) přinesla
            jediná změna: styly připravené předem místo skládání v telefonu.
          </p>
        </Gate>

        <Gate letter="T" title="Test: první klient jako ostrý pokus">
          <p>
            Projekt je první klient a zároveň test celého modelu. Test běží 3 měsíce (listopad 2026 – leden 2027) a
            odpovídá na tři otázky:
          </p>
          <Table head={["Otázka", "Jak to změřím", "Úspěch"]} rows={TEST} />
          <p>
            <strong>Pravidlo testu:</strong> první 2–3 reporty projde člověk ručně, než odejdou klientovi. Automatické
            odeslání se zapne, až výstup AI spolehlivě sedí. Po každém měsíci si zapíšu, co klient ocenil, na co se ptal
            a co v reportu chybělo. Z toho vznikne verze 2 služby.
          </p>
        </Gate>

        <Gate letter="L" title="Launch: od první reference k dalším klientům">
          <p>Spuštění stojí na jedné silné referenci s čísly, ne na reklamě.</p>
          <ol className="space-y-3">
            {[
              ["Reference", "Po prvním plném reportu případová studie s čísly před a po a se souhlasem klienta."],
              [
                "Doporučení",
                "Spokojený klient zná další lékaře a podnikatele ve svém oboru. Lékaři doporučují lékařům.",
              ],
              ["LinkedIn", "Příběh „za den 4 weby, AI first a automatický reporting“, s ukázkou reportu."],
              [
                "Bezplatný audit",
                "Krátká kontrola webu (rychlost, zastaralé údaje, viditelnost v AI). Claude ho připraví za minuty a je to přirozený vstup do rozhovoru.",
              ],
              ["Úzký obor", "Začít jedním segmentem (zdravotnictví v regionu), mít v něm 3–5 referencí, pak rozšířit."],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-leaf-100 font-extrabold text-leaf-800">
                  {i + 1}
                </span>
                <span>
                  <strong>{t}.</strong> {d}
                </span>
              </li>
            ))}
          </ol>
          <p className="font-semibold">První cíl spuštění: 5 platících klientů do 6 měsíců.</p>
        </Gate>

        <Gate letter="E" title="Expanze: opakovaný příjem a růst">
          <p>
            Měsíční report je motor celé živnosti. Udržuje vztah s klientem, ukazuje hodnotu a každý měsíc otevírá další
            zakázku. Když report ukáže, že velký zdroj návštěv jsou Mapy Google, doporučení „upravit profil na Mapách“
            je rovnou další placená služba.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5 text-base">
              <p className="font-bold">Navazující služby</p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>– správa profilu na Google Mapách a sběr recenzí</li>
                <li>– nové podstránky a kampaně</li>
                <li>– školení klienta, jak web upravovat a číst report</li>
                <li>– napojení objednávek nebo rezervací</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 text-base">
              <p className="font-bold">Škálování bez zaměstnanců</p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>– jedna šablona reportu pro všechny klienty</li>
                <li>– jeden postup převzetí a redesignu, opakovaný pro každého</li>
                <li>– při 20+ klientech reporty z cloudu, ne z vlastního počítače</li>
              </ul>
            </div>
          </div>
        </Gate>

        {/* Rizika */}
        <section className="border-t border-border bg-muted/40 px-4 py-14 sm:px-8 md:py-20">
          <div className="mx-auto max-w-4xl space-y-6">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Rizika a co AI nenahradí</h2>
            <Table head={["Riziko", "Jak ho řeším"]} rows={RISKS} />
            <p className="text-lg">
              <strong>Co AI nenahradí:</strong> důvěru klienta, znalost jeho oboru, rozhodnutí, co je na webu pravda, a
              rozhovor nad čísly.
            </p>
          </div>
        </section>

        {/* Závěr + CTA */}
        <section className="px-4 py-16 sm:px-8 md:py-24">
          <div className="mx-auto max-w-4xl rounded-3xl bg-leaf-800 p-8 text-white sm:p-12">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Projděte stejnou cestu se svým nápadem
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-white/80">
              Webový specialista s AI je modrý oceán pro malé firmy. Jeden člověk nabízí výsledek, který dřív stál
              agenturu a tým, za cenu předplatného. Ve VISIBLE7 projdete stejných sedm bran se svým vlastním nápadem.
            </p>
            <button
              type="button"
              onClick={start}
              className="v7-trap-btn mt-8 inline-flex h-14 items-center gap-2 pl-7 pr-12 text-base font-bold text-signal-foreground"
            >
              Začít plán zdarma <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </section>
      </main>
      <Footer variant="full" />
    </div>
  );
};

export default CaseStudyWebSpecialistPage;
