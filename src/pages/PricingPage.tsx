import { Fragment, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { FREE_CONSULT_URL, canBuy, kc, monthsLabel, nbsp, perMonth, useShop } from "@/lib/shop";
import { supabase } from "@/integrations/visible7/client";
import { track } from "@/lib/track";
import { CONSULTATION } from "@/lib/advisors";
import { SPECIALIST_TITLE } from "@/lib/certificates";

/** Hodnota v buňce: true = ano, false = ne, text = částečně nebo s podmínkou. */
type Cell = boolean | string;
const ROWS = (specialist: string): { group: string; rows: [string, Cell, Cell, string?][] }[] => [
  {
    group: "Test nápadu a podnikatelský plán",
    rows: [
      ["Rentgen nápadu do 5 minut: verdikt, čísla a rizika (i pro ty, kdo už podnikají)", true, true],
      ["Mapa cesty A → D: kdy první zákazníci a kdy vás projekt uživí", true, true],
      ["Brána 1 Vize: strategie modrého oceánu, ERRC matice, hodnotová křivka a USP", true, true],
      ["Brána 2 Ideace: Lean Canvas a výběr z 13 typů online byznysu", true, true],
    ],
  },
  {
    group: "Finanční plán a výpočty",
    rows: [
      ["Brána 3: finanční plán na 24 měsíců, potřebný kapitál, bod zvratu, návratnost", false, true],
      ["Daně podle formy podnikání (OSVČ, paušální daň, s.r.o.)", false, true],
      ["Tři scénáře, maximální PNO a hodnota zákazníka", false, true],
      ["Export finančního plánu do Excelu", false, true],
      ["Velikost trhu s AI: celý, dostupný a získatelný trh se zdroji z webu", false, true],
      ["Pitch na jednu A4 pro investora, banku nebo partnera", false, true],
    ],
  },
  {
    group: "Tvorba projektu (brána 4)",
    rows: [
      [
        "Plán tvorby pro váš typ byznysu: na čem postavit a v jakém pořadí",
        false,
        true,
        "13 typů: prezentační web (WordPress), e-shop (Shoptet), web s e-shopem (WooCommerce), konverzní web, squeeze page, online kurz, placený členský obsah, blog, affiliate web, dropshipping, komunita, marketplace a vlastní aplikace vyvíjená s AI.",
      ],
      [
        "Stavba po blocích, každý s videem, kroky k odškrtnutí a náklady",
        false,
        true,
        "Například doména, hosting a WordPress, šablona a vzhled, texty stránek, prodejní stránka, formulář poptávek, založení Shoptetu, produkty, platby a doprava, dodavatel, opakované platby, členská sekce, platforma a první modul kurzu, stránka pro sběr kontaktů s dárkem, uvítací e-maily, partnerské programy, komunitní platforma, zadání a prototyp aplikace.",
      ],
      [
        "U každého typu právní minimum, měření návštěvnosti a kontrola před spuštěním",
        false,
        true,
        "Identifikace podnikatele, zásady ochrany osobních údajů, cookie lišta, obchodní podmínky a reklamační řád, napojení Google Analytics s měřením objednávek a kontrolní seznam před spuštěním.",
      ],
      ["Náklady z bloků se samy propíšou do finančního plánu", false, true],
      ["Web projektu pro test zájmu, se zápisem zájemců a vyhodnocením", false, true],
    ],
  },
  {
    group: "Marketing (brána 5)",
    rows: [
      [
        "12 marketingových kanálů seřazených podle vašeho typu byznysu a rozpočtu",
        false,
        true,
        "Meta Ads (Facebook a Instagram), Google Ads, Sklik, srovnávače zboží, firemní profil na Googlu, e-mail marketing, ChatGPT Ads, SEO a obsah, LinkedIn, influenceři a PR, marketplace a katalogy, affiliate program, SMS.",
      ],
      [
        "Postup nastavení krok za krokem s testovacím rozpočtem",
        false,
        true,
        "Měření konverzí, texty a obrázky reklam, účet a publikum na Meta, první kampaň, klíčová slova a kampaň ve vyhledávání, Sklik, napojení feedu do srovnávačů, sběr kontaktů a e-mailové automatizace, základ SEO a obsah, LinkedIn profil, spolupráce s influencery, SMS.",
      ],
      ["Benchmark konkurence: kde a čím inzerují vaši konkurenti a co nikdo nenabízí", false, true],
      [
        "Vyhodnocení testu kanálu podle PNO z finančního plánu",
        false,
        true,
        "Po testu aplikace doporučí kanál škálovat, ladit, nebo vypnout.",
      ],
    ],
  },
  {
    group: "Spuštění a růst",
    rows: [
      ["Brána 6 Launch: tahák k ohlášení živnosti, ověření IČO, první ukazatele", false, true],
      ["Brána 7 Expanze: plán růstu, tým a automatizace", false, true],
    ],
  },
  {
    group: "AI asistence",
    rows: [
      ["AI pomocník navrhne obsah, AI mentor zhodnotí výsledek", "brány 1–2", true],
      ["AI návrh čísel, nákladů a textů webu projektu", false, true],
    ],
  },
  {
    group: "Vzdělávání",
    rows: [
      ["Úvodní video ke každé bráně", "brány 1–2", true],
      ["Videonávody krok za krokem (100+ videí)", false, true],
      ["Pracovní listy k vyplnění a tisku", "13 listů", "všechny"],
      ["Živé online semináře každých 14 dní a jejich záznamy", "vybrané", true],
    ],
  },
  {
    group: "Poradci a konzultace",
    rows: [
      ["Úvodní konzultace 20 minut s expertem", true, true],
      ["Konzultace se seniorním poradcem z praxe", "za poplatek", "za poplatek"],
    ],
  },
  {
    group: "Osvědčení a certifikace",
    rows: [
      ["Osvědčení za brány 1 a 2", true, true],
      ["Osvědčení za brány 3–5", false, true],
      [`${specialist}: certifikace po bráně 5`, false, true],
      ["VISIBLE7 Gold za spuštěný projekt", false, true],
      ["Zkouška státem uznané profesní kvalifikace", false, "za poplatek"],
    ],
  },
  {
    group: "Digitální kancelář",
    rows: [
      ["Úřady online a doporučené nástroje na jednom místě", true, true],
      ["Moje termíny: daně a pojištění s připomínkou e-mailem týden předem", true, true],
    ],
  },
];

const CellMark = ({ v }: { v: Cell }) =>
  v === true ? (
    <Check className="mx-auto h-5 w-5 text-emerald-600" strokeWidth={3} aria-label="ano" />
  ) : v === false ? (
    <span className="text-border" aria-label="ne">
      —
    </span>
  ) : (
    <span className="text-xs font-semibold text-muted-foreground">{v}</span>
  );

const MEMBER_ITEMS = [
  "Všech 7 bran a přes 100 videonávodů",
  "Živé online semináře každých 14 dní a jejich záznamy",
  "AI asistent u každé brány",
  "Byznys case, Excel a pitch na A4",
  "Osvědčení za každou bránu",
];

/** Veřejná stránka s ceníkem. Cenu a odkaz na objednávku nastavuje správce (Administrace → Platby). */
const PricingPage = () => {
  const navigate = useNavigate();
  const shop = useShop();
  const [email, setEmail] = useState<string | null>(null);
  const start = () => navigate("/home?novy");
  useEffect(() => {
    document.title = "Ceník | VISIBLE7 MICEK";
    const id = window.location.hash.slice(1);
    if (id) setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 200);
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
  }, []);

  const QA = [
    [
      "Obnovuje se platba sama?",
      `Ne. Zaplatíte jednou na ${monthsLabel(shop.months)} a pak se rozhodnete, jestli prodloužíte.`,
    ],
    [
      "Co se stane, když členství skončí?",
      "Vaše projekty i data zůstanou uložené. Placené brány a výstupy se zamknou do dalšího zaplacení.",
    ],
    ["Dostanu doklad?", "Ano. Ke každé platbě dostanete daňový doklad od Edu Partners s.r.o."],
    [
      "Mohu nejdřív vyzkoušet?",
      "Ano. Rentgen nápadu a brány 1 a 2 jsou zdarma bez platební karty. Když zjistíte, jaký jste typ podnikatele (krátký kvíz), získáte navíc 3 dny plného přístupu zdarma.",
    ],
    [
      "Jak se členství aktivuje?",
      "Automaticky po zaplacení. Při objednávce použijte stejný e-mail, kterým se přihlašujete do aplikace.",
    ],
  ];

  const buy = canBuy(shop);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader onStart={start} />
      <main>
        <section className="mx-auto max-w-5xl px-4 pb-16 pt-14 sm:px-8 lg:px-12 md:pt-20">
          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            Začněte zdarma. Plaťte, až budete chtít dál.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Jedno členství, žádné předplatné, které by se samo obnovovalo. Ceny jsou konečné, včetně DPH.
          </p>

          <div className="mt-12 grid gap-4 md:grid-cols-[1fr_1.3fr]">
            <div className="flex flex-col rounded-2xl border border-border bg-card p-6">
              <h2 className="font-semibold text-muted-foreground">Zdarma</h2>
              <p className="mt-3 text-4xl font-extrabold tracking-tight">0 Kč</p>
              <p className="text-sm text-muted-foreground">bez platební karty</p>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                {[
                  "Rentgen nápadu do 5 minut",
                  "Brána 1 Vize (modrý oceán)",
                  "Brána 2 Ideace (Lean Canvas) s AI",
                  "Zjistěte, jaký jste typ podnikatele, a získejte 3 dny zdarma",
                ].map((it) => (
                  <li key={it} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={3} />
                    {it}
                  </li>
                ))}
                <li className="flex gap-2 rounded-lg bg-leaf-50 px-2 py-1.5 -mx-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-leaf-600" strokeWidth={3} />
                  <span>
                    <b>Úvodní konzultace s expertem, 20 minut zdarma.</b>{" "}
                    <a
                      href={FREE_CONSULT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => track("free_consult_click", { from: "cenik" })}
                      className="font-semibold text-leaf-700 underline underline-offset-2 hover:no-underline"
                    >
                      Vybrat termín
                    </a>
                  </span>
                </li>
              </ul>
              <button
                type="button"
                onClick={start}
                className="mt-6 h-11 rounded-xl border border-border text-sm font-semibold hover:border-primary hover:text-primary"
              >
                Začít zdarma
              </button>
            </div>

            <div className="flex flex-col rounded-2xl bg-primary p-6 text-white">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-white/80">Členství na {monthsLabel(shop.months)}</h2>
                <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold">Celá cesta</span>
              </div>
              <p className="mt-3 text-5xl font-extrabold tracking-tight">{kc(shop.price)}</p>
              <p className="text-sm text-white/70">jednorázově, vychází na {perMonth(shop)} měsíčně</p>
              {shop.anchor && <p className="mt-3 text-sm text-white/80">{nbsp(shop.anchor)}</p>}
              <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                {MEMBER_ITEMS.map((it) => (
                  <li key={it} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-leaf-600" strokeWidth={3} />
                    {it}
                  </li>
                ))}
              </ul>
              {buy ? (
                <Link
                  to="/clenstvi"
                  onClick={() => track("checkout_click", { source: "cenik", price: shop.price })}
                  className="v7-trap-btn mt-6 flex h-12 items-center justify-center text-base font-bold text-signal-foreground"
                >
                  Koupit členství
                </Link>
              ) : (
                <div className="mt-6 rounded-xl bg-white/10 p-3 text-center text-sm">
                  <p className="font-semibold">Prodej členství spouštíme brzy.</p>
                  <p className="mt-0.5 text-white/70">Do té doby máte v pilotním provozu vše odemčené zdarma.</p>
                </div>
              )}
              {buy && (
                <p className="mt-3 text-xs text-white/70">
                  {email
                    ? `Při objednávce použijte e-mail ${email} – členství se vám pak zapne samo.`
                    : "Při objednávce použijte e-mail, kterým se přihlašujete do aplikace – členství se zapne samo."}
                </p>
              )}
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Konzultace se seniorním poradcem se platí zvlášť: {CONSULTATION.minutes} minut, orientačně{" "}
            {CONSULTATION.price.toLocaleString("cs-CZ")} Kč.
          </p>
        </section>

        <section id="funkce" className="scroll-mt-20 px-3 py-2 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1280px] rounded-[2rem] bg-muted/50 py-16 md:py-20">
            <div className="mx-auto max-w-4xl px-4 sm:px-8 lg:px-12">
              <h2 className="text-3xl font-extrabold tracking-tight">Všechno, co VISIBLE7 umí</h2>
              <p className="mt-3 text-lg text-muted-foreground">Kompletní přehled funkcí a co z toho máte zdarma.</p>
              <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card">
                <table className="w-full min-w-[520px] text-left">
                  <thead>
                    <tr className="border-b border-border text-sm">
                      <th scope="col" className="p-4">
                        <span className="sr-only">Funkce</span>
                      </th>
                      <th scope="col" className="w-28 p-4 text-center font-semibold text-muted-foreground">
                        Zdarma
                      </th>
                      <th scope="col" className="w-28 bg-primary p-4 text-center font-bold text-white">
                        Členství
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ROWS(SPECIALIST_TITLE).map(({ group, rows }) => (
                      <Fragment key={group}>
                        <tr className="border-b border-border bg-muted/60">
                          <th scope="colgroup" colSpan={3} className="px-4 py-2.5 text-sm font-bold text-primary">
                            {group}
                          </th>
                        </tr>
                        {rows.map(([row, free, member, detail]) => (
                          <tr key={row} className="border-b border-border last:border-0">
                            <th scope="row" className="p-4 font-medium">
                              {row}
                              {detail && (
                                <span className="mt-1.5 block text-sm font-normal leading-relaxed text-muted-foreground">
                                  {detail}
                                </span>
                              )}
                            </th>
                            <td className="p-4 text-center">
                              <CellMark v={free} />
                            </td>
                            <td className="bg-primary/[0.04] p-4 text-center">
                              <CellMark v={member} />
                            </td>
                          </tr>
                        ))}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-8 lg:px-12 md:py-24">
          <h2 className="text-3xl font-extrabold tracking-tight">Otázky k platbě</h2>
          <div className="mt-8 divide-y divide-border border-y border-border">
            {QA.map(([q, a]) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                  {q}
                  <span className="text-2xl font-normal text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
          <button
            type="button"
            onClick={start}
            className="v7-trap-btn mt-10 inline-flex h-14 items-center gap-2 pl-7 pr-12 font-bold text-signal-foreground"
          >
            Začít zdarma <ArrowRight className="h-5 w-5" />
          </button>
          <p className="mt-4 text-sm text-muted-foreground">
            Podrobnosti najdete v{" "}
            <Link to="/podminky" className="font-semibold text-primary hover:underline">
              podmínkách užívání
            </Link>
            .
          </p>
        </section>
      </main>
      <Footer variant="full" />
    </div>
  );
};

export default PricingPage;
