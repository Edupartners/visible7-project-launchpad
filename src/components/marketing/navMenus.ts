import type { LucideIcon } from "lucide-react";
import {
  Award,
  BarChart3,
  Building2,
  ClipboardList,
  Compass,
  BookOpen,
  FlaskConical,
  GraduationCap,
  HandCoins,
  Landmark,
  Lightbulb,
  Map,
  Megaphone,
  MessagesSquare,
  PlayCircle,
  Radio,
  School,
  Sprout,
  Store,
  Target,
  UserRound,
  Users,
} from "lucide-react";
import { FREE_CONSULT_URL } from "@/lib/shop";

/**
 * Obsah horního menu veřejných stránek. Odkaz je buď cesta v aplikaci (`to`), externí adresa (`href`),
 * nebo `start: true` = stejná akce jako hlavní tlačítko (registrace / test nápadu).
 */
export interface NavLinkItem {
  title: string;
  hint: string;
  icon: LucideIcon;
  to?: string;
  href?: string;
  start?: boolean;
  badge?: string;
}

export interface NavFeature {
  title: string;
  text: string;
  cta: string;
  to?: string;
  href?: string;
  start?: boolean;
  /** "author" = fotka autora metodiky, jinak cesta k obrázku. */
  image?: "author" | string;
}

export interface NavMenu {
  id: string;
  label: string;
  columns: { heading?: string; items: NavLinkItem[]; more?: { label: string; to: string } }[];
  feature: NavFeature;
}

export const NAV_MENUS: NavMenu[] = [
  {
    id: "proc",
    label: "Proč VISIBLE7",
    columns: [
      {
        items: [
          { title: "Čím jsme jiní", hint: "Plán, kurz a poradci v jedné aplikaci", icon: Sprout, to: "/#uvnitr" },
          { title: "Metodika VISIBLE7 MICEK®", hint: "Sedm bran od nápadu po růst", icon: Compass, to: "/#jak" },
          { title: "Poradci z praxe", hint: "Když se zaseknete, zavoláte člověku", icon: UserRound, to: "/#poradci" },
        ],
      },
      {
        items: [
          {
            title: "Proč projekty krachují",
            hint: "Tři důvody a jak jim předejít",
            icon: MessagesSquare,
            to: "/#proc-krachuji",
          },
          {
            title: "Kdo za tím stojí",
            hint: "Edu Partners, učíme podnikat od roku 2011",
            icon: Users,
            to: "/#proc-krachuji",
          },
        ],
      },
    ],
    feature: {
      image: "author",
      title: "1 000+ absolventů kurzů podnikání",
      text: "Metodika vyrostla z kurzů Edu Partners, ne od stolu. Teď ji máte v aplikaci.",
      cta: "Jak to funguje",
      to: "/#uvnitr",
    },
  },
  {
    id: "produkt",
    label: "Produkt",
    columns: [
      {
        heading: "Funkce",
        items: [
          {
            title: "Test nápadu",
            hint: "Za 5 minut zjistíte, jestli o to někdo stojí",
            icon: FlaskConical,
            to: "/test-napadu",
          },
          {
            title: "Podnikatelský plán",
            hint: "Lean Canvas a byznys model s pomocí AI",
            icon: Lightbulb,
            to: "/podnikatelsky-plan",
          },
          {
            title: "Finanční plán a bod zvratu",
            hint: "24 měsíců čísel, kapitál a návratnost",
            icon: BarChart3,
            to: "/financni-plan",
          },
          {
            title: "Marketingové kanály",
            hint: "AI vybere, kterými začít",
            icon: Megaphone,
            to: "/marketingove-kanaly",
          },
          { title: "Mapa cesty", hint: "Kdy vás projekt uživí", icon: Map, to: "/test-napadu" },
        ],
      },
      {
        heading: "Napojení",
        items: [
          {
            title: "Bankovní účet (PSD2)",
            hint: "Predikce z vašich skutečných pohybů",
            icon: Landmark,
            to: "/napojeni-banky",
            badge: "Připravujeme",
          },
        ],
      },
    ],
    feature: {
      image: "/landing/ukazka-byznys-case.webp",
      title: "Prohlédněte si VISIBLE7",
      text: "Finanční plán na 24 měsíců hotový za odpoledne. AI navrhne čísla, vy je jen potvrdíte.",
      cta: "Začít plán zdarma",
      start: true,
    },
  },
  {
    id: "vzdelavani",
    label: "Vzdělávání",
    columns: [
      {
        heading: "Učíte se při práci na svém plánu",
        items: [
          {
            title: "E-learning",
            hint: "100+ videí krok za krokem ke každé fázi",
            icon: PlayCircle,
            to: "/certifikace",
          },
          {
            title: "Pracovní listy",
            hint: "Hotové šablony k vyplnění a tisku",
            icon: ClipboardList,
            to: "/pracovni-listy",
          },
          { title: "Živé semináře", hint: "Každých 14 dní online s lektory", icon: Radio, to: "/clenstvi" },
        ],
      },
      {
        heading: "Výsledek, který se počítá",
        items: [
          { title: "Osvědčení za každou bránu", hint: "S ověřením online podle kódu", icon: Award, to: "/certifikace" },
          {
            title: "Certifikace se zkouškou",
            hint: "Volitelně státem uznaná profesní kvalifikace",
            icon: GraduationCap,
            to: "/certifikace",
          },
        ],
        more: { label: "Celý obsah programu", to: "/certifikace" },
      },
    ],
    feature: {
      title: "Plánovač, kurz a certifikace v jednom",
      text: "Běžný plánovač vám dá šablonu. U nás se k tomu naučíte, jak plán opravdu provést, a doložíte to certifikátem.",
      cta: "Certifikace a zkouška",
      to: "/certifikace",
    },
  },
  {
    id: "reseni",
    label: "Řešení",
    columns: [
      {
        heading: "Pro podnikatele",
        items: [
          { title: "Otestovat nápad", hint: "Než do něj dáte peníze", icon: FlaskConical, to: "/test-napadu" },
          {
            title: "Plán pro banku a investory",
            hint: "Čísla, která banka chce vidět",
            icon: HandCoins,
            to: "/financni-plan",
          },
          { title: "Začít podnikat", hint: "Od živnosti po prvního zákazníka", icon: Target, to: "/zacit-podnikat" },
          { title: "Už podnikám offline", hint: "Kde vám online přinese zákazníky", icon: Store, to: "/uz-podnikam" },
        ],
      },
      {
        heading: "Pro partnery",
        items: [
          {
            title: "Školy a lektoři",
            hint: "VISIBLE7 do výuky podnikání",
            icon: School,
            href: "mailto:michal.micek@edu-partners.cz?subject=VISIBLE7 pro školy",
          },
          {
            title: "Banky a podnikatelské programy",
            hint: "Připravení žadatelé s plánem",
            icon: Building2,
            href: "mailto:michal.micek@edu-partners.cz?subject=VISIBLE7 pro banky a programy",
          },
          {
            title: "Rekvalifikace",
            hint: "Akreditované kurzy Edu Partners",
            icon: BookOpen,
            href: "https://edu-partners.cz",
          },
        ],
      },
    ],
    feature: {
      image: "author",
      title: "Úvodní konzultace zdarma",
      text: "20 minut online s expertem: projdeme váš nápad a doporučíme, kterou cestou jít.",
      cta: "Vybrat termín",
      href: FREE_CONSULT_URL,
    },
  },
];
