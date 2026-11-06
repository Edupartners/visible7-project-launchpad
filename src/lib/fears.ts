import { Clock, Flag, Gem, PiggyBank, Wallet } from "lucide-react";

/**
 * Nejčastější obavy začínajících podnikatelů a co s nimi VISIBLE7 dělá.
 * Jen pravdivé odpovědi podle toho, co aplikace a studium opravdu umí (žádná vymyšlená čísla).
 */
export const FEARS = [
  {
    icon: Clock,
    fear: "Nebudu na to mít čas.",
    faq: "Co když na podnikání nebudu mít čas?",
    answer:
      "Každý krok má napsané, kolik času zabere. Brána 1 trvá asi hodinu. Stačí jeden večer týdně a začít můžete vedle práce. Studium běží jednou týdně 17:00–20:00.",
  },
  {
    icon: Flag,
    fear: "Nedotáhnu to.",
    faq: "Co když to nedotáhnu?",
    answer:
      "Průvodce vás vede krok po kroku a vždy víte, co je další. Za každou bránu dostanete osvědčení. Ve studiu máte pevné termíny, lektory a závěrečný den, takže to dotáhnete spolu s ostatními.",
  },
  {
    icon: Gem,
    fear: "Nevytvořím dokonalý produkt.",
    faq: "Co když nevytvořím dokonalý produkt?",
    answer:
      "Dokonalý být nemusí. Učíme podnikatelský minimalismus: začít s malou první verzí, ověřit zájem a vylepšovat podle zákazníků. Zájem otestujete dřív, než do produktu vložíte peníze.",
  },
  {
    icon: Wallet,
    fear: "Neuživí mě to.",
    faq: "Co když mě podnikání neuživí?",
    answer:
      "To zjistíte předem, ne až po roce. Byznys case spočítá, kolik potřebujete prodat, aby se to vyplatilo, a opatrný scénář ukáže i horší variantu. Lepší zjistit na papíře, že to nevyjde, než přijít o úspory.",
  },
  {
    icon: PiggyBank,
    fear: "Podnikání je drahé.",
    faq: "Není rozjezd podnikání moc drahý?",
    answer:
      "Online podnikání se dá rozjet s malým rozpočtem. Byznys case ukáže každou položku nákladů a AI vám připomene, na co jste zapomněli. Začátek s VISIBLE7 je zdarma.",
  },
] as const;
