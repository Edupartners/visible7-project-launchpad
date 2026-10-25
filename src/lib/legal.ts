/**
 * Právní dokumenty aplikace VISIBLE7 MICEK®.
 * NÁVRH k právní kontrole – verze se mění při každé věcné změně; uživatelé ji pak potvrdí znovu.
 */

export const LEGAL_VERSION = "2026-10-09";

export const OPERATOR = {
  name: "Edu partners s.r.o.",
  address: "Raisova 889/5, Mariánské Hory, 709 00 Ostrava",
  ico: "28660757",
  dic: "CZ28660757",
  register: "zapsaná v obchodním rejstříku vedeném Krajským soudem v Ostravě, oddíl C, vložka 37617",
  email: "michal.micek@edu-partners.cz",
  phone: "+420 606 663 826",
};

export interface LegalSection {
  title: string;
  paragraphs: string[];
}

export interface LegalDoc {
  title: string;
  intro: string;
  sections: LegalSection[];
}

const op = `${OPERATOR.name}, IČO ${OPERATOR.ico}, se sídlem ${OPERATOR.address}, ${OPERATOR.register}`;

export const TERMS: LegalDoc = {
  title: "Podmínky užívání aplikace VISIBLE7 MICEK®",
  intro: `Tyto podmínky upravují používání webové aplikace VISIBLE7 MICEK® (dále „aplikace“), kterou provozuje ${op} (dále „provozovatel“). Registrací a zaškrtnutím souhlasu s podmínkami s nimi uživatel souhlasí.`,
  sections: [
    {
      title: "1. Účet a registrace",
      paragraphs: [
        "Aplikaci může používat osoba starší 18 let nebo podnikatel. Uživatel uvádí pravdivé údaje a chrání své přihlašovací údaje; za činnost pod svým účtem odpovídá.",
        "Jeden uživatel může mít v aplikaci více projektů. Projekty a jejich data patří uživateli.",
      ],
    },
    {
      title: "2. Zakázané projekty a užívání",
      paragraphs: [
        "Aplikace slouží k přípravě a rozvoji legálního podnikání. Uživatel prohlašuje, že žádný jeho projekt v aplikaci není určen k nezákonné činnosti ani k ní nebude sloužit.",
        "Zakázané jsou zejména projekty směřující k podvodům, praní peněz, obcházení daňových povinností, prodeji zakázaného nebo padělaného zboží, porušování práv duševního vlastnictví, provozování hazardních her bez povolení, šíření obsahu ohrožujícího děti a mladistvé, nenávistného obsahu nebo jiného jednání v rozporu s právními předpisy či dobrými mravy.",
        "Uživatel nesmí aplikaci ani její AI funkce zneužívat, obcházet jejich limity, zatěžovat je automatizovanými dotazy ani zasahovat do zabezpečení.",
        "Při porušení tohoto článku může provozovatel projekt nebo účet bez náhrady omezit či zrušit a v odůvodněných případech informovat příslušné orgány.",
      ],
    },
    {
      title: "3. Bezplatná a placená část",
      paragraphs: [
        "Fáze 1 a 2 metodiky jsou dostupné zdarma. Fáze 3 až 7 jsou dostupné po zaplacení časového přístupu: 1 měsíc za 350 Kč, 3 měsíce za 499 Kč, 1 rok za 990 Kč. Ceny jsou konečné, včetně DPH.",
        "Přístup se platí jednorázově a automaticky se neobnovuje. Platby a faktury zajišťuje provozovatel prostřednictvím služby SimpleShop.",
        "Po skončení placeného přístupu zůstávají data projektu uložena; placené fáze jsou do dalšího zaplacení jen pro čtení.",
        "Spotřebitel má u digitálního obsahu právo odstoupit od smlouvy do 14 dnů. Pokud výslovně požádá o zpřístupnění obsahu před uplynutím této lhůty a bere na vědomí, že tím právo na odstoupení ztrácí, právo odstoupit zaniká okamžikem zpřístupnění.",
      ],
    },
    {
      title: "4. AI funkce",
      paragraphs: [
        "Aplikace obsahuje funkce umělé inteligence (návrhy textů, orientační čísla, hodnocení a komentáře). Jejich výstupy jsou pouze doporučení a mohou být nepřesné.",
        "Výstupy AI ani výpočty aplikace nejsou daňovým, právním, účetním ani investičním poradenstvím. Rozhodnutí o podnikání činí uživatel sám a na vlastní odpovědnost.",
        "Počet volání AI je omezen limity uvedenými v aplikaci.",
      ],
    },
    {
      title: "5. Seniorní poradci",
      paragraphs: [
        "Konzultace se seniorními poradci se objednávají a platí zvlášť. Uvedená cena je orientační; konkrétní cena a termín se potvrzují před konzultací.",
        "Poradci poskytují konzultaci podle svých zkušeností. Odpovědnost za rozhodnutí přijatá na jejím základě nese uživatel.",
      ],
    },
    {
      title: "6. Osvědčení",
      paragraphs: [
        "Za dokončení fází může uživatel získat osvědčení s ověřovacím kódem. Na veřejné ověřovací stránce osvědčení je uvedeno jméno držitele, název projektu, druh osvědčení a datum vydání.",
        "Osvědčení získané zneužitím aplikace nebo v rozporu s těmito podmínkami může provozovatel zneplatnit.",
      ],
    },
    {
      title: "7. Klub VISIBLE7",
      paragraphs: [
        "Klub VISIBLE7 je program provozovatele pro podnikatele, kteří rozvíjejí digitální a AI podnikání. Členem se uživatel stane samostatným zaškrtnutím při registraci nebo v nastavení účtu.",
        "Členství je bezplatné. Členové mohou dostávat informace o akcích, novinkách, vzdělávání a zvýhodněných nabídkách provozovatele a jeho partnerů a mohou se účastnit komunitních aktivit.",
        "Členství lze kdykoli ukončit v nastavení účtu. Provozovatel může program klubu měnit nebo ukončit; členy o tom předem informuje.",
      ],
    },
    {
      title: "8. Duševní vlastnictví",
      paragraphs: [
        "Metodika VISIBLE7 MICEK®, aplikace, její obsah, videa a texty jsou chráněny autorským právem a právem k ochranné známce. Uživatel je smí používat jen pro vlastní potřebu v rámci aplikace.",
        "Data a texty, které uživatel do aplikace vloží, zůstávají jeho. Provozovateli uděluje oprávnění je zpracovávat v rozsahu nutném k poskytování aplikace.",
      ],
    },
    {
      title: "9. Odpovědnost",
      paragraphs: [
        "Aplikace pomáhá připravit podnikatelský záměr, nezaručuje však podnikatelský úspěch ani správnost odhadů a výpočtů. Provozovatel neodpovídá za škodu vzniklou rozhodnutími uživatele, s výjimkou případů, kdy odpovědnost nelze vyloučit podle zákona.",
        "Provozovatel usiluje o nepřetržitý provoz, nezaručuje však dostupnost bez výpadků.",
      ],
    },
    {
      title: "10. Ukončení účtu a změny podmínek",
      paragraphs: [
        `Uživatel může účet kdykoli zrušit žádostí na ${OPERATOR.email}. Provozovatel může účet zrušit při porušení těchto podmínek.`,
        "Provozovatel může podmínky měnit. O podstatné změně uživatele informuje v aplikaci a požádá o nový souhlas; pokud uživatel nesouhlasí, může účet zrušit.",
      ],
    },
    {
      title: "11. Závěrečná ustanovení",
      paragraphs: [
        "Tyto podmínky se řídí právem České republiky.",
        "Spotřebitel může spor řešit mimosoudně u České obchodní inspekce (www.coi.cz) nebo prostřednictvím platformy pro řešení sporů online.",
        `Kontakt na provozovatele: ${OPERATOR.email}, ${OPERATOR.phone}.`,
      ],
    },
  ],
};

export const PRIVACY: LegalDoc = {
  title: "Zásady zpracování osobních údajů",
  intro: `Správcem osobních údajů je ${op} (dále „správce“). Kontakt pro otázky ochrany osobních údajů: ${OPERATOR.email}.`,
  sections: [
    {
      title: "1. Jaké údaje zpracováváme",
      paragraphs: [
        "Identifikační a kontaktní údaje: jméno, příjmení, e-mail, telefon, případně název firmy a IČO.",
        "Údaje o účtu: přihlašovací e-mail, zašifrované heslo, typ a platnost přístupu, záznamy o souhlasech.",
        "Obsah projektů: podnikatelský záměr, texty, čísla a výpočty, které do aplikace vložíte, a výstupy AI.",
        "Platební a fakturační údaje při nákupu přístupu nebo konzultace.",
        "Údaje na osvědčeních: jméno držitele, název projektu a datum vydání.",
        "Technické údaje nutné pro provoz a bezpečnost (např. záznamy o přihlášení).",
      ],
    },
    {
      title: "2. Proč a na jakém základě",
      paragraphs: [
        "Poskytování aplikace, účtu, AI funkcí a osvědčení – plnění smlouvy (čl. 6 odst. 1 písm. b) GDPR).",
        "Vedení účetnictví a daňových dokladů – plnění právní povinnosti (čl. 6 odst. 1 písm. c) GDPR).",
        "Bezpečnost aplikace, prevence zneužití a ochrana práv správce – oprávněný zájem (čl. 6 odst. 1 písm. f) GDPR).",
        "Členství v Klubu VISIBLE7 – plnění podmínek členství, o které jste požádali.",
        "Zasílání novinek a nabídek – váš souhlas (čl. 6 odst. 1 písm. a) GDPR), který můžete kdykoli odvolat v nastavení účtu.",
        "Pracovní listy ke stažení – e-mail, který zadáte, použijeme k zaslání odkazu na listy (vaše žádost, čl. 6 odst. 1 písm. b) GDPR). Tipy a novinky posíláme jen se samostatným souhlasem.",
        "Čekací listina na napojení bankovního účtu – e-mail, který zadáte, použijeme jen k jednomu oznámení, že napojení spouštíme (vaše žádost, čl. 6 odst. 1 písm. b) GDPR).",
      ],
    },
    {
      title: "3. Kdo údaje zpracovává pro nás",
      paragraphs: [
        "Supabase – databáze a přihlášení; data jsou uložena v datovém centru v Irsku (EU).",
        "Cloudflare – provoz webu aplikace.",
        "Anthropic – zpracování textů projektu při použití AI funkcí. Podle smluvních podmínek poskytovatele se data zaslaná přes jeho rozhraní nepoužívají k trénování modelů.",
        "SimpleShop – objednávky, platby a faktury.",
        "Brevo – odesílání e-mailů aplikace (potvrzení registrace, změna hesla, připomínky k projektu).",
        "Google (Google Analytics, Google Tag Manager) – měření návštěvnosti a reklam, jen pokud jste s tím souhlasili v liště cookies.",
        "Seniorní poradci – při objednání konzultace obdrží údaje potřebné k jejímu poskytnutí.",
        "Při předání mimo EU (např. do USA) jsou údaje chráněny standardními smluvními doložkami nebo rozhodnutím Evropské komise o odpovídající ochraně (EU–US Data Privacy Framework).",
      ],
    },
    {
      title: "4. Cookies a měření návštěvnosti",
      paragraphs: [
        "Nezbytné cookies a místní úložiště prohlížeče drží přihlášení, bezpečnost a vaši volbu cookies. Bez nich aplikace nefunguje, souhlas k nim není potřeba.",
        "Analytické cookies (Google Analytics 4) a marketingové cookies (měření reklam přes Google Tag Manager) používáme jen s vaším souhlasem (čl. 6 odst. 1 písm. a) GDPR). Do Google Analytics neposíláme jméno, e-mail ani obsah projektů.",
        "Bez souhlasu nastavujeme Google režim souhlasu (Consent Mode) tak, že se cookies neukládají. Volbu můžete kdykoli změnit odkazem „Nastavení cookies“ v patičce stránky.",
        "Připomínky k rozdělanému projektu nebo konci zkušebního přístupu posíláme e-mailem nejvýš jednou za 3 dny, bez nabídek. Vypnout je lze odkazem v každém e-mailu nebo v nastavení účtu.",
        "Pro zlepšování aplikace evidujeme ve vlastní databázi, které funkce používáte (např. dokončení brány, přehrání videa) – oprávněný zájem (čl. 6 odst. 1 písm. f) GDPR).",
      ],
    },
    {
      title: "5. Výzkum motivace dospělých ke vzdělávání",
      paragraphs: [
        "Pokud v kvízu „Jaký jste typ podnikatele“ zaškrtnete souhlas s výzkumem, použijeme vaše odpovědi a postup v aplikaci pro výzkum motivace dospělých ke vzdělávání (čl. 6 odst. 1 písm. a) GDPR).",
        "Pro výzkum údaje předáváme jen pseudonymizované – bez jména a e-mailu. Výsledky se zveřejňují jen souhrnně.",
        "Souhlas je dobrovolný, na odměnu za kvíz nemá vliv a můžete ho kdykoli odvolat v nastavení účtu nebo e-mailem.",
      ],
    },
    {
      title: "6. Jak dlouho údaje uchováváme",
      paragraphs: [
        "Údaje účtu a projektů po dobu existence účtu. Účet i jednotlivé projekty můžete smazat sami v Nastavení aplikace; data se tím smažou ihned, zálohy databáze se přepíšou do 30 dnů. Doklady o nákupu uchováváme po dobu, kterou ukládá zákon o účetnictví a zákon o DPH.",
        "Daňové doklady 10 let podle zákona o DPH.",
        "Údaje pro ověření vydaných osvědčení po dobu jejich platnosti, aby šly ověřit; osvědčení můžete požádat zneplatnit.",
        "Souhlas s marketingem do jeho odvolání.",
        "E-mail ze stažení pracovních listů bez souhlasu s tipy 12 měsíců, se souhlasem do jeho odvolání.",
        "E-mail z čekací listiny na napojení banky do odeslání oznámení o spuštění, nejdéle 12 měsíců.",
        "Data Google Analytics 14 měsíců; volba cookies v prohlížeči do jejího smazání nebo změny.",
        "Pseudonymizované odpovědi pro výzkum do odvolání souhlasu, nejdéle do ukončení výzkumu.",
      ],
    },
    {
      title: "7. Vaše práva",
      paragraphs: [
        "Máte právo na přístup k údajům, jejich opravu, výmaz, omezení zpracování, přenositelnost a právo vznést námitku proti zpracování na základě oprávněného zájmu.",
        "Souhlas s marketingem a členství v klubu můžete kdykoli odvolat v nastavení účtu, aniž by tím byla dotčena zákonnost předchozího zpracování.",
        `Žádosti posílejte na ${OPERATOR.email}. Máte také právo podat stížnost u Úřadu pro ochranu osobních údajů (www.uoou.gov.cz).`,
      ],
    },
  ],
};
