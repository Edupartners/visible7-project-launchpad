/**
 * Seniorní poradci VISIBLE7 – lektoři Edu Partners s vlastní praxí.
 * Zdroj: https://www.edu-partners.cz/o-nas/ a podklady od Michala Míčka; všichni souhlasí se zveřejněním.
 * Konzultace se zatím objednávají e-mailem přes Edu Partners (rezervace a platba přijdou později).
 */

export interface Advisor {
  id: string;
  name: string;
  /** Krátké zaměření pod jménem */
  focus: string;
  /** S čím umí poradit – jedna až dvě věty */
  bio: string;
  /** Fáze VISIBLE7, ve kterých ho aplikace nabízí */
  phases: number[];
  /** Marketingové kanály z fáze 5 (id z types/marketing.ts) */
  channels: string[];
  /** Fotka (z edu-partners.cz/o-nas); bez ní se zobrazí iniciály */
  photo?: string;
}

const EP = "https://www.edu-partners.cz/wp-content/uploads/";

export const CONSULTATION = {
  price: 1500,
  minutes: 45,
  label: "45 minut, orientačně 1 500 Kč",
  email: "michal.micek@edu-partners.cz",
};

export const ADVISORS: Advisor[] = [
  {
    id: "michal-micek",
    name: "Mgr. Michal Míček, LL.M.",
    photo: `${EP}2026/05/michal-768x775.jpeg`,
    focus: "Strategie, e-commerce a fintech",
    bio: "Autor metodiky VISIBLE7 MICEK™, téměř 20 let v e-commerce a fintechu. Pomůže s modrým oceánem, byznys modelem a růstem.",
    phases: [1, 2, 3, 7],
    channels: [],
  },
  {
    id: "monika-vesela",
    name: "Monika Veselá",
    focus: "Základy podnikání a byznys plán",
    bio: "Bývalá top manažerka, která byla u zakládání Ericssonu. Učí základy podnikání, byznys plán a life hacking.",
    phases: [1, 2, 3],
    channels: [],
  },
  {
    id: "jana-pincova",
    name: "Jana Pincová",
    photo: `${EP}2026/05/jana-pincova-768x776.png`,
    focus: "Účetnictví a finance e-commerce",
    bio: "Účetní s více než 15 lety praxe. Poradí s účetnictvím e-shopu, DPH při prodeji do zahraničí a nastavením financí.",
    phases: [3],
    channels: [],
  },
  {
    id: "michaela-stancova",
    name: "Mgr. et Mgr. Michaela Stančová",
    focus: "Právo online podnikání a ochrana značky",
    bio: "Specialistka na ochranné známky, autorské právo a legislativu online projektů. Pomůže s názvem, značkou a podmínkami.",
    phases: [1, 4],
    channels: [],
  },
  {
    id: "lukas-gvuzd",
    name: "Ing. Lukáš Gvuzď",
    photo: `${EP}2026/05/lukas_gvuzd-768x775.jpeg`,
    focus: "PPC, SEO a webová analytika",
    bio: "Zkušenosti z velkých digitálních agentur a Mall.cz. Poradí s GA4, SEO, PPC a nastavením Shoptetu.",
    phases: [4, 5, 6],
    channels: ["ppc", "seo", "srovnavace"],
  },
  {
    id: "veronika-miklova",
    name: "Ing. Veronika Miklová",
    photo: `${EP}2026/07/Snimek-obrazovky-2026-07-23-v-14.25.13.png`,
    focus: "PPC kampaně",
    bio: "Přes 10 let v PPC a vlastní firma na výkonnostní marketing. Pomůže nastavit a řídit placené kampaně.",
    phases: [5],
    channels: ["ppc", "srovnavace"],
  },
  {
    id: "renata-dimitrov",
    name: "Mgr. Renata Dimitrov",
    photo: `${EP}2026/05/renata_edu_partners-1024x1024.jpeg`,
    focus: "Reklama na Facebooku a Instagramu",
    bio: "Přes 10 let v reklamě na sociálních sítích a stovky spravovaných kampaní.",
    phases: [5],
    channels: ["social-media"],
  },
  {
    id: "andrea-votrubova",
    name: "Mgr. Andrea Votrubová",
    photo: `${EP}2026/05/andrea_votrubova_edu_partners-768x768.jpeg`,
    focus: "Copywriting, SEO a PR",
    bio: "Téměř 20 let v médiích a PR, mimo jiné jako novinářka MF Dnes a iDNES.cz. Naučí psát texty, které prodávají.",
    phases: [5],
    channels: ["copywriting", "pr-influencers", "seo"],
  },
  {
    id: "patrik-zapletal",
    name: "Patrik Zapletal",
    photo: `${EP}2026/05/patrik-zapletal-lektor-ade-affiliate.jpeg`,
    focus: "Affiliate a výkonnostní kampaně",
    bio: "Přes 5 let v online marketingu pro agentury i na volné noze. Pomůže s affiliate programem a výkonnostními kampaněmi.",
    phases: [5],
    channels: ["ppc", "marketplace"],
  },
  {
    id: "hana-antonova",
    name: "Hana Antonová",
    photo: `${EP}2026/05/Hana_profilovka_1k1.jpg`,
    focus: "Bannerová reklama a grafika pro web",
    bio: "Specialistka na online grafickou reklamu: bannery a webová grafika.",
    phases: [5],
    channels: ["ppc", "social-media"],
  },
  {
    id: "terezie-onderkova",
    name: "Terezie Onderková",
    photo: `${EP}2026/05/terezie-e1741954877885-768x592.jpeg`,
    focus: "Grafika a UX e-shopu, e-mail marketing",
    bio: "Grafička se zkušenostmi z UX a online marketingu. Poradí s designem e-shopu, e-mailingem a identitou značky.",
    phases: [4, 5],
    channels: ["email-marketing", "social-media"],
  },
  {
    id: "simona-damkova",
    name: "Simona Damková",
    photo: `${EP}2026/05/simca-damkova-edu-partners-768x760.jpeg`,
    focus: "Grafika, logo a web design",
    bio: "Grafička a ilustrátorka, specialistka na Adobe. Pomůže s logem, webdesignem a tiskovinami.",
    phases: [4],
    channels: [],
  },
  {
    id: "ivan-lidak",
    name: "Ivan Liďák",
    photo: `${EP}2026/05/ivan.png`,
    focus: "WordPress",
    bio: "Dlouholetý správce systémů a lektor WordPressu. Pomůže postavit a spravovat web na WordPressu.",
    phases: [4],
    channels: [],
  },
  {
    id: "honza-novak",
    name: "Bc. Honza Novák",
    photo: `${EP}2026/05/honza.webp`,
    focus: "Data, programování a AI",
    bio: "Webové technologie, Python, databáze a datová analytika. Vysvětlí AI a data srozumitelně.",
    phases: [4, 6],
    channels: [],
  },
  {
    id: "tomas-chara",
    name: "Ing. Tomáš Chára",
    photo: `${EP}2026/08/tomas_chara-768x954.jpeg`,
    focus: "Automatizace s AI",
    bio: "Ve Škoda Auto automatizuje rutinní práci pomocí AI. Ukáže, jak si AI ušetřit čas v podnikání.",
    phases: [7],
    channels: [],
  },
];

export const advisorsForPhase = (phase: number) => ADVISORS.filter((a) => a.phases.includes(phase));
export const advisorsForChannel = (channelId: string) => ADVISORS.filter((a) => a.channels.includes(channelId));

export const initials = (name: string) =>
  name
    .replace(/(Mgr\.|Ing\.|Bc\.|et|LL\.M\.|,)/g, "")
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

/** Odkaz na objednání konzultace e-mailem (do doby, než bude rezervace v aplikaci). */
export function consultationMailto(
  advisor: Advisor | null,
  context: { project?: string; topic?: string; lines?: string[] },
) {
  const body = [
    `Dobrý den,`,
    "",
    `mám zájem o konzultaci (${CONSULTATION.label}) ${advisor ? `s poradcem ${advisor.name}` : "se seniorním poradcem"}.`,
    context.topic ? `Téma: ${context.topic}` : "",
    context.project ? `Projekt ve VISIBLE7: ${context.project}` : "",
    ...(context.lines ?? []),
    "",
    "Děkuji.",
  ]
    .filter((l, i, arr) => l !== "" || arr[i - 1] !== "")
    .join("\n");
  return `mailto:${CONSULTATION.email}?subject=${encodeURIComponent(`VISIBLE7 – zájem o konzultaci${advisor ? `: ${advisor.name}` : ""}`)}&body=${encodeURIComponent(body)}`;
}
