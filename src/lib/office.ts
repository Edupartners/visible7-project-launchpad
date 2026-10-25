/**
 * Digitální kancelář: úřady online a doporučené nástroje pro začínajícího podnikatele.
 * Jen odkazy a krátký popis, žádné ceny (mění se). Odkazy nejsou provizní; kdyby byly, musí to být u nich uvedeno.
 * Banku záměrně nejmenujeme.
 */
import {
  BadgeCheck,
  BarChart3,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  CreditCard,
  Eye,
  FileSignature,
  FileText,
  Fingerprint,
  Globe,
  HeartPulse,
  Inbox,
  Landmark,
  LayoutTemplate,
  Mail,
  MapPin,
  MessagesSquare,
  Receipt,
  Rocket,
  SearchCheck,
  Shield,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Store,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface OfficeLink {
  name: string;
  icon: LucideIcon;
  url: string;
  text: string;
  /** Doporučený nástroj (zvýrazněný), ostatní jsou alternativy. */
  pick?: boolean;
}

export interface OfficeGroup {
  id: string;
  icon: LucideIcon;
  title: string;
  when: string;
  links: OfficeLink[];
}

/** Úřady a státní portály. */
export const OFFICE_GOV: OfficeGroup[] = [
  {
    id: "zalozeni",
    icon: Rocket,
    title: "Založení podnikání",
    when: "Jednou, na začátku",
    links: [
      {
        name: "Ohlášení živnosti online",
        icon: FileSignature,
        url: "https://www.rzp.cz/registracni-formular/cs/",
        text: "Jednotný registrační formulář: živnost, finanční úřad, sociální i zdravotní pojištění najednou.",
      },
      {
        name: "ARES",
        icon: SearchCheck,
        url: "https://ares.gov.cz/",
        text: "Ověříte své IČO i odběratele nebo dodavatele, než mu pošlete fakturu.",
      },
      {
        name: "BusinessInfo.cz",
        icon: BookOpen,
        url: "https://www.businessinfo.cz/",
        text: "Státní průvodce podnikáním: návody, formuláře a změny zákonů.",
      },
    ],
  },
  {
    id: "komunikace",
    icon: MessagesSquare,
    title: "Komunikace s úřady",
    when: "Průběžně",
    links: [
      {
        name: "Datová schránka",
        icon: Inbox,
        url: "https://www.mojedatovaschranka.cz/",
        text: "Úřední pošta a podání elektronicky. Pokud ji nemáte, zřídíte si ji zdarma.",
      },
      {
        name: "Portál občana",
        icon: Fingerprint,
        url: "https://obcan.portal.gov.cz/",
        text: "Jedno přihlášení (třeba bankovní identitou) k většině státních služeb.",
      },
    ],
  },
  {
    id: "dane",
    icon: Landmark,
    title: "Daně a pojištění",
    when: "Každý rok a každý měsíc",
    links: [
      {
        name: "Moje daně",
        icon: Receipt,
        url: "https://www.mojedane.cz/",
        text: "Daňové přiznání online, předvyplněné formuláře a přehled plateb na finanční úřad.",
      },
      {
        name: "Daňový kalendář",
        icon: CalendarDays,
        url: "https://financnisprava.gov.cz/cs/danovy-kalendar",
        text: "Kdy podat přiznání a kdy zaplatit zálohy. Termíny se každý rok liší.",
      },
      {
        name: "ePortál ČSSZ",
        icon: ShieldCheck,
        url: "https://eportal.cssz.cz/",
        text: "Sociální pojištění: přehled o příjmech a výdajích, zálohy a stav plateb.",
      },
      {
        name: "Zdravotní pojišťovna",
        icon: HeartPulse,
        url: "https://www.vzp.cz/",
        text: "Přehled a zálohy na zdravotní pojištění. Odkaz vede na VZP, ostatní pojišťovny mají vlastní portál.",
      },
    ],
  },
  {
    id: "ochrana",
    icon: Shield,
    title: "Ochrana značky",
    when: "Až víte, že projekt funguje",
    links: [
      {
        name: "Úřad průmyslového vlastnictví",
        icon: BadgeCheck,
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
    icon: FileText,
    title: "Fakturace",
    when: "Od první zakázky",
    links: [
      {
        name: "Fakturoid",
        icon: FileText,
        url: "https://www.fakturoid.cz/",
        text: "Faktury, upomínky a přehled, kdo zaplatil. Podklady pro účetní na jednom místě.",
        pick: true,
      },
      {
        name: "iDoklad",
        icon: FileText,
        url: "https://www.idoklad.cz/",
        text: "Alternativa: fakturace a jednoduchá evidence.",
      },
    ],
  },
  {
    id: "platby",
    icon: Wallet,
    title: "Platby online",
    when: "Když prodáváte na webu",
    links: [
      {
        name: "Comgate",
        icon: CreditCard,
        url: "https://www.comgate.cz/",
        text: "Platební brána: platby kartou, bankovním převodem a další metody na vašem webu.",
        pick: true,
      },
      {
        name: "GoPay",
        icon: CreditCard,
        url: "https://www.gopay.com/cs/",
        text: "Alternativa: platební brána s podobnými službami.",
      },
    ],
  },
  {
    id: "prodej",
    icon: Store,
    title: "Prodej",
    when: "Podle typu byznysu",
    links: [
      {
        name: "SimpleShop",
        icon: ShoppingBag,
        url: "https://www.simpleshop.cz/",
        text: "Prodej kurzů, členství, konzultací a e-booků. Faktura a přístup se odešlou samy.",
        pick: true,
      },
      {
        name: "Shoptet",
        icon: ShoppingCart,
        url: "https://www.shoptet.cz/",
        text: "E-shop s fyzickým zbožím, dopravou a napojením na srovnávače.",
        pick: true,
      },
    ],
  },
  {
    id: "web",
    icon: Globe,
    title: "Web a doména",
    when: "Před spuštěním",
    links: [
      {
        name: "WordPress",
        icon: LayoutTemplate,
        url: "https://cs.wordpress.org/",
        text: "Web, který si sami upravíte. Pro služby, obsahové weby a blog.",
        pick: true,
      },
      { name: "WEDOS", icon: Globe, url: "https://www.wedos.cz/", text: "Česká registrace domén a hosting." },
    ],
  },
  {
    id: "zakaznici",
    icon: Users,
    title: "Zákazníci a e-maily",
    when: "Od prvního kontaktu",
    links: [
      {
        name: "Brevo",
        icon: Mail,
        url: "https://www.brevo.com/cs/",
        text: "Newslettery, automatické e-maily novým zákazníkům a jednoduchý seznam kontaktů.",
        pick: true,
      },
      {
        name: "Ecomail",
        icon: Mail,
        url: "https://www.ecomail.cz/",
        text: "Alternativa: český e-mailing s podporou v češtině.",
      },
      {
        name: "Reservio",
        icon: CalendarCheck,
        url: "https://www.reservio.com/cs/",
        text: "Online rezervace termínů pro služby, s připomínkami zákazníkům.",
      },
    ],
  },
  {
    id: "viditelnost",
    icon: Eye,
    title: "Viditelnost a měření",
    when: "Při spuštění",
    links: [
      {
        name: "Firemní profil na Googlu",
        icon: MapPin,
        url: "https://business.google.com/",
        text: "Zdarma. Pro místní firmy často nejrychlejší cesta k novým zákazníkům.",
        pick: true,
      },
      {
        name: "Google Analytics",
        icon: BarChart3,
        url: "https://analytics.google.com/",
        text: "Odkud lidé na web přicházejí a kolik z nich nakoupí.",
        pick: true,
      },
    ],
  },
];
