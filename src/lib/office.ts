/**
 * Digitální kancelář: úřady online a doporučené nástroje pro začínajícího podnikatele.
 * Jen odkazy a krátký popis, žádné ceny (mění se). Odkazy nejsou provizní; kdyby byly, musí to být u nich uvedeno.
 * Banku záměrně nejmenujeme.
 */
export interface OfficeLink {
  name: string;
  url: string;
  text: string;
  /** Doporučený nástroj (zvýrazněný), ostatní jsou alternativy. */
  pick?: boolean;
}

export interface OfficeGroup {
  id: string;
  title: string;
  when: string;
  links: OfficeLink[];
}

/** Úřady a státní portály. */
export const OFFICE_GOV: OfficeGroup[] = [
  {
    id: "zalozeni",
    title: "Založení podnikání",
    when: "Jednou, na začátku",
    links: [
      {
        name: "Ohlášení živnosti online",
        url: "https://www.rzp.cz/registracni-formular/cs/",
        text: "Jednotný registrační formulář: živnost, finanční úřad, sociální i zdravotní pojištění najednou.",
      },
      {
        name: "ARES",
        url: "https://ares.gov.cz/",
        text: "Ověříte své IČO i odběratele nebo dodavatele, než mu pošlete fakturu.",
      },
      {
        name: "BusinessInfo.cz",
        url: "https://www.businessinfo.cz/",
        text: "Státní průvodce podnikáním: návody, formuláře a změny zákonů.",
      },
    ],
  },
  {
    id: "komunikace",
    title: "Komunikace s úřady",
    when: "Průběžně",
    links: [
      {
        name: "Datová schránka",
        url: "https://www.mojedatovaschranka.cz/",
        text: "Úřední pošta a podání elektronicky. Pokud ji nemáte, zřídíte si ji zdarma.",
      },
      {
        name: "Portál občana",
        url: "https://obcan.portal.gov.cz/",
        text: "Jedno přihlášení (třeba bankovní identitou) k většině státních služeb.",
      },
    ],
  },
  {
    id: "dane",
    title: "Daně a pojištění",
    when: "Každý rok a každý měsíc",
    links: [
      {
        name: "Moje daně",
        url: "https://www.mojedane.cz/",
        text: "Daňové přiznání online, předvyplněné formuláře a přehled plateb na finanční úřad.",
      },
      {
        name: "Daňový kalendář",
        url: "https://financnisprava.gov.cz/cs/danovy-kalendar",
        text: "Kdy podat přiznání a kdy zaplatit zálohy. Termíny se každý rok liší.",
      },
      {
        name: "ePortál ČSSZ",
        url: "https://eportal.cssz.cz/",
        text: "Sociální pojištění: přehled o příjmech a výdajích, zálohy a stav plateb.",
      },
      {
        name: "Zdravotní pojišťovna",
        url: "https://www.vzp.cz/",
        text: "Přehled a zálohy na zdravotní pojištění. Odkaz vede na VZP, ostatní pojišťovny mají vlastní portál.",
      },
    ],
  },
  {
    id: "ochrana",
    title: "Ochrana značky",
    when: "Až víte, že projekt funguje",
    links: [
      {
        name: "Úřad průmyslového vlastnictví",
        url: "https://upv.gov.cz/",
        text: "Ochranná známka pro název a logo, rešerše, jestli už ji někdo nemá.",
      },
    ],
  },
];

/** Doporučené nástroje: první je doporučení, další alternativy. */
export const OFFICE_TOOLS: OfficeGroup[] = [
  {
    id: "fakturace",
    title: "Fakturace",
    when: "Od první zakázky",
    links: [
      {
        name: "Fakturoid",
        url: "https://www.fakturoid.cz/",
        text: "Faktury, upomínky a přehled, kdo zaplatil. Podklady pro účetní na jednom místě.",
        pick: true,
      },
      { name: "iDoklad", url: "https://www.idoklad.cz/", text: "Alternativa: fakturace a jednoduchá evidence." },
    ],
  },
  {
    id: "platby",
    title: "Platby online",
    when: "Když prodáváte na webu",
    links: [
      {
        name: "Comgate",
        url: "https://www.comgate.cz/",
        text: "Platební brána: platby kartou, bankovním převodem a další metody na vašem webu.",
        pick: true,
      },
      { name: "GoPay", url: "https://www.gopay.com/cs/", text: "Alternativa: platební brána s podobnými službami." },
    ],
  },
  {
    id: "prodej",
    title: "Prodej",
    when: "Podle typu byznysu",
    links: [
      {
        name: "SimpleShop",
        url: "https://www.simpleshop.cz/",
        text: "Prodej kurzů, členství, konzultací a e-booků. Faktura a přístup se odešlou samy.",
        pick: true,
      },
      {
        name: "Shoptet",
        url: "https://www.shoptet.cz/",
        text: "E-shop s fyzickým zbožím, dopravou a napojením na srovnávače.",
        pick: true,
      },
    ],
  },
  {
    id: "web",
    title: "Web a doména",
    when: "Před spuštěním",
    links: [
      {
        name: "WordPress",
        url: "https://cs.wordpress.org/",
        text: "Web, který si sami upravíte. Pro služby, obsahové weby a blog.",
        pick: true,
      },
      { name: "WEDOS", url: "https://www.wedos.cz/", text: "Česká registrace domén a hosting." },
    ],
  },
  {
    id: "zakaznici",
    title: "Zákazníci a e-maily",
    when: "Od prvního kontaktu",
    links: [
      {
        name: "Brevo",
        url: "https://www.brevo.com/cs/",
        text: "Newslettery, automatické e-maily novým zákazníkům a jednoduchý seznam kontaktů.",
        pick: true,
      },
      { name: "Ecomail", url: "https://www.ecomail.cz/", text: "Alternativa: český e-mailing s podporou v češtině." },
      {
        name: "Reservio",
        url: "https://www.reservio.com/cs/",
        text: "Online rezervace termínů pro služby, s připomínkami zákazníkům.",
      },
    ],
  },
  {
    id: "viditelnost",
    title: "Viditelnost a měření",
    when: "Při spuštění",
    links: [
      {
        name: "Firemní profil na Googlu",
        url: "https://business.google.com/",
        text: "Zdarma. Pro místní firmy často nejrychlejší cesta k novým zákazníkům.",
        pick: true,
      },
      {
        name: "Google Analytics",
        url: "https://analytics.google.com/",
        text: "Odkud lidé na web přicházejí a kolik z nich nakoupí.",
        pick: true,
      },
    ],
  },
];
