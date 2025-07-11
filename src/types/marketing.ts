export interface MarketingStep {
  id: string;
  task: string;        // Co
  platform: string;    // Kde  
  note?: string;       // Poznámka
  price: number;       // Cena v Kč
  completed: boolean;  // Stav dokončení
}

export interface MarketingChannel {
  id: string;
  name: string;
  description: string;
  difficulty: 'Nízká' | 'Střední' | 'Vyšší';
  setupTime: string;
  adType: 'Placená reklama' | 'Organická reklama';
  steps: MarketingStep[];
}

export const marketingChannels: MarketingChannel[] = [
  {
    id: 'srovnavace',
    name: 'Srovnávače zboží',
    description: 'Zbozi.cz, Heureka.cz - srovnání cen a recenze produktů',
    difficulty: 'Nízká',
    setupTime: '1-2 dny',
    adType: 'Placená reklama',
    steps: [
      { id: '1', task: 'Registrace na Heureka.cz', platform: 'Heureka.cz', note: 'Základní registrace zdarma', price: 0, completed: false },
      { id: '2', task: 'Nahrání produktového XML feedu', platform: 'Heureka.cz', note: 'Export z e-shopu', price: 0, completed: false },
      { id: '3', task: 'Aktivace Heureka Ověřeno zákazníky', platform: 'Heureka.cz', note: 'Zvýší důvěryhodnost', price: 199, completed: false },
      { id: '4', task: 'Registrace na Zbozi.cz', platform: 'Zbozi.cz', note: 'Seznam.cz srovnávač', price: 0, completed: false },
      { id: '5', task: 'Nahrání produktů na Zbozi.cz', platform: 'Zbozi.cz', note: 'XML feed nebo manuálně', price: 0, completed: false },
      { id: '6', task: 'Nastavení PPC kampaní', platform: 'Heureka.cz + Zbozi.cz', note: 'Platba za klik', price: 1000, completed: false },
      { id: '7', task: 'Optimalizace produktových titulků', platform: 'Admin e-shopu', note: 'Lepší viditelnost', price: 0, completed: false },
      { id: '8', task: 'Monitoring výsledků', platform: 'Analytics', note: 'Sledování konverzí', price: 0, completed: false }
    ]
  },
  {
    id: 'marketplace',
    name: 'Katalogy a marketplace',
    description: 'Favi.cz, Glami, Mall Partner - rozšíření dosahu',
    difficulty: 'Střední',
    setupTime: '3-5 dnů',
    adType: 'Placená reklama',
    steps: [
      { id: '1', task: 'Registrace na Favi.cz', platform: 'Favi.cz', note: 'Český katalog firem', price: 0, completed: false },
      { id: '2', task: 'Vytvoření firemního profilu', platform: 'Favi.cz', note: 'Kompletní informace', price: 0, completed: false },
      { id: '3', task: 'Registrace na Glami', platform: 'Glami.cz', note: 'Fashion marketplace', price: 0, completed: false },
      { id: '4', task: 'Nahrání produktového feedu', platform: 'Glami.cz', note: 'XML format', price: 0, completed: false },
      { id: '5', task: 'Žádost o Mall Partner', platform: 'Mall.cz', note: 'Ověření potřebné', price: 0, completed: false },
      { id: '6', task: 'Integrace s Mall API', platform: 'Mall.cz', note: 'Technická implementace', price: 2000, completed: false },
      { id: '7', task: 'Optimalizace pro každou platformu', platform: 'Všechny', note: 'Různé požadavky', price: 0, completed: false },
      { id: '8', task: 'Nastavení automatické synchronizace', platform: 'E-shop admin', note: 'Aktualizace zásob', price: 500, completed: false }
    ]
  },
  {
    id: 'ppc',
    name: 'PPC kampaně',
    description: 'Google Ads, Seznam.cz - platba za klik',
    difficulty: 'Vyšší',
    setupTime: '1-2 týdny',
    adType: 'Placená reklama',
    steps: [
      { id: '1', task: 'Vytvoření Google Ads účtu', platform: 'Google Ads', note: 'Potřeba platební karty', price: 0, completed: false },
      { id: '2', task: 'Keyword research', platform: 'Google Keyword Planner', note: 'Analýza klíčových slov', price: 0, completed: false },
      { id: '3', task: 'Vytvoření první kampaně', platform: 'Google Ads', note: 'Search kampaň', price: 2000, completed: false },
      { id: '4', task: 'Nastavení konverzního sledování', platform: 'Google Analytics', note: 'Sledování prodejů', price: 0, completed: false },
      { id: '5', task: 'Registrace na Sklik (Seznam)', platform: 'Sklik.cz', note: 'České vyhledávání', price: 0, completed: false },
      { id: '6', task: 'Vytvoření Sklik kampaně', platform: 'Sklik.cz', note: 'Lokální targeting', price: 1000, completed: false },
      { id: '7', task: 'A/B testování reklam', platform: 'Google Ads + Sklik', note: 'Optimalizace CTR', price: 500, completed: false },
      { id: '8', task: 'Měsíční optimalizace', platform: 'Všechny platformy', note: 'Průběžné ladění', price: 0, completed: false }
    ]
  },
  {
    id: 'seo',
    name: 'SEO optimalizace',
    description: 'Dlouhodobá optimalizace pro vyhledávače',
    difficulty: 'Vyšší',
    setupTime: '2-4 týdny',
    adType: 'Organická reklama',
    steps: [
      { id: '1', task: 'SEO audit webu', platform: 'Screaming Frog', note: 'Analýza současného stavu', price: 0, completed: false },
      { id: '2', task: 'Keyword research', platform: 'Ahrefs/SEMrush', note: 'Klíčová slova pro obor', price: 1000, completed: false },
      { id: '3', task: 'Optimalizace meta tagů', platform: 'WordPress admin', note: 'Title, description', price: 0, completed: false },
      { id: '4', task: 'Technické SEO', platform: 'Web vývojář', note: 'Rychlost, struktura', price: 3000, completed: false },
      { id: '5', task: 'Tvorba kvalitního obsahu', platform: 'Blog sekce', note: 'Pravidelné články', price: 2000, completed: false },
      { id: '6', task: 'Link building strategie', platform: 'Externí weby', note: 'Získávání odkazů', price: 1500, completed: false },
      { id: '7', task: 'Local SEO optimalizace', platform: 'Google My Business', note: 'Místní vyhledávání', price: 0, completed: false },
      { id: '8', task: 'Monitoring pozic', platform: 'Google Search Console', note: 'Sledování rankingu', price: 0, completed: false }
    ]
  },
  {
    id: 'social-media',
    name: 'Sociální sítě',
    description: 'Facebook, Instagram - budování komunity',
    difficulty: 'Střední',
    setupTime: '1 týden',
    adType: 'Placená reklama',
    steps: [
      { id: '1', task: 'Vytvoření Facebook stránky', platform: 'Facebook', note: 'Business účet', price: 0, completed: false },
      { id: '2', task: 'Propojení s Instagram', platform: 'Instagram', note: 'Meta Business Suite', price: 0, completed: false },
      { id: '3', task: 'Nastavení Facebook Pixel', platform: 'Facebook', note: 'Sledování konverzí', price: 0, completed: false },
      { id: '4', task: 'Vytvoření content plánu', platform: 'Plánovací nástroj', note: 'Pravidelné příspěvky', price: 0, completed: false },
      { id: '5', task: 'První Facebook kampaň', platform: 'Facebook Ads Manager', note: 'Awareness kampaň', price: 1000, completed: false },
      { id: '6', task: 'Instagram Shopping nastavení', platform: 'Instagram', note: 'Katalog produktů', price: 0, completed: false },
      { id: '7', task: 'Influencer spolupráce', platform: 'Kontaktování influencerů', note: 'Mikro-influenceři', price: 2000, completed: false },
      { id: '8', task: 'Community management', platform: 'Sociální sítě', note: 'Odpovědi na komentáře', price: 0, completed: false }
    ]
  },
  {
    id: 'email-marketing',
    name: 'E-mail marketing',
    description: 'Newsletter, automatizované kampáně',
    difficulty: 'Nízká',
    setupTime: '2-3 dny',
    adType: 'Organická reklama',
    steps: [
      { id: '1', task: 'Výběr e-mail platformy', platform: 'Mailchimp/Ecomail', note: 'Český poskytovatel', price: 500, completed: false },
      { id: '2', task: 'Integrace s e-shopem', platform: 'E-shop admin', note: 'Sběr e-mailů', price: 0, completed: false },
      { id: '3', task: 'Vytvoření úvodní sekvence', platform: 'E-mail platforma', note: 'Welcome série', price: 0, completed: false },
      { id: '4', task: 'Nastavení abandoned cart', platform: 'E-mail platforma', note: 'Opuštěný košík', price: 0, completed: false },
      { id: '5', task: 'Design e-mail šablon', platform: 'E-mail editor', note: 'Brand konzistence', price: 1000, completed: false },
      { id: '6', task: 'Segmentace zákazníků', platform: 'E-mail platforma', note: 'Cílené kampáně', price: 0, completed: false },
      { id: '7', task: 'A/B testování subject lines', platform: 'E-mail platforma', note: 'Optimalizace otevírání', price: 0, completed: false },
      { id: '8', task: 'Měsíční newsletter', platform: 'E-mail platforma', note: 'Pravidelná komunikace', price: 0, completed: false }
    ]
  },
  {
    id: 'sms-marketing',
    name: 'SMS marketing',
    description: 'Rychlé zprávy, upozornění zákazníkům',
    difficulty: 'Nízká',
    setupTime: '1 den',
    adType: 'Placená reklama',
    steps: [
      { id: '1', task: 'Registrace SMS brány', platform: 'SMSManager/Bulkgate', note: 'České SMS služby', price: 0, completed: false },
      { id: '2', task: 'Integrace s e-shopem', platform: 'E-shop admin', note: 'API propojení', price: 500, completed: false },
      { id: '3', task: 'Nastavení automatických SMS', platform: 'SMS platforma', note: 'Potvrzení objednavky', price: 0, completed: false },
      { id: '4', task: 'SMS při expedici', platform: 'SMS platforma', note: 'Sledovací číslo', price: 0, completed: false },
      { id: '5', task: 'Sběr souhlasů GDPR', platform: 'E-shop checkout', note: 'Právní požadavky', price: 0, completed: false },
      { id: '6', task: 'Promocční SMS kampaně', platform: 'SMS platforma', note: 'Akce a slevy', price: 200, completed: false },
      { id: '7', task: 'Segmentace podle nákupů', platform: 'SMS platforma', note: 'Cílené zprávy', price: 0, completed: false },
      { id: '8', task: 'Měření úspěšnosti', platform: 'Analytics', note: 'CTR a konverze', price: 0, completed: false }
    ]
  },
  {
    id: 'pr-influencers',
    name: 'PR & influenceři',
    description: 'Budování důvěry, recenze, spolupráce',
    difficulty: 'Střední',
    setupTime: '1-2 týdny',
    adType: 'Organická reklama',
    steps: [
      { id: '1', task: 'Identifikace klíčových médií', platform: 'Mediální databáze', note: 'Obory časopisy/weby', price: 0, completed: false },
      { id: '2', task: 'Vytvoření tiskové zprávy', platform: 'PR agentura/vlastní', note: 'Novinky o firmě', price: 2000, completed: false },
      { id: '3', task: 'Kontaktování novinářů', platform: 'E-mail/telefon', note: 'Osobní přístup', price: 0, completed: false },
      { id: '4', task: 'Hledání micro-influencerů', platform: 'Instagram/TikTok', note: '1K-100K followerů', price: 0, completed: false },
      { id: '5', task: 'Návrh spolupráce', platform: 'DM/e-mail', note: 'Výměna za produkt', price: 1500, completed: false },
      { id: '6', task: 'Žádost o recenze', platform: 'Specializované weby', note: 'Bloggeři v oboru', price: 0, completed: false },
      { id: '7', task: 'Monitoring zmínek', platform: 'Google Alerts', note: 'Sledování brand', price: 0, completed: false },
      { id: '8', task: 'Budování vztahů', platform: 'Networking akce', note: 'Dlouhodobá strategie', price: 1000, completed: false }
    ]
  },
  {
    id: 'copywriting',
    name: 'Copywriting',
    description: 'Přesvědčivé texty pro web a kampaně',
    difficulty: 'Střední',
    setupTime: '1-2 týdny',
    adType: 'Organická reklama',
    steps: [
      { id: '1', task: 'Analýza cílové skupiny', platform: 'Persona workshop', note: 'Kdo jsou zákazníci', price: 0, completed: false },
      { id: '2', task: 'Audit současných textů', platform: 'Webová stránka', note: 'Co funguje/nefunguje', price: 0, completed: false },
      { id: '3', task: 'Přepsání hlavní stránky', platform: 'WordPress editor', note: 'Zaměření na benefity', price: 3000, completed: false },
      { id: '4', task: 'Optimalizace produktových popisů', platform: 'E-shop admin', note: 'Emočně laděné texty', price: 2000, completed: false },
      { id: '5', task: 'Vytvoření CTA tlačítek', platform: 'Web/e-shop', note: 'Jasné výzvy k akci', price: 500, completed: false },
      { id: '6', task: 'E-mail copywriting', platform: 'E-mail kampaně', note: 'Subject lines + tělo', price: 1500, completed: false },
      { id: '7', task: 'Texty pro reklamy', platform: 'Google/Facebook Ads', note: 'Krátké a výstižné', price: 1000, completed: false },
      { id: '8', task: 'A/B testování textů', platform: 'Všechny kanály', note: 'Optimalizace konverzí', price: 0, completed: false }
    ]
  }
];