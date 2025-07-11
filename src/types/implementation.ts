export interface RoadmapStep {
  id: string;
  task: string;           // Co
  platform: string;       // Kde  
  note?: string;          // Poznámka
  price: number;          // Cena v Kč
  completed: boolean;     // Stav dokončení
}

export interface BusinessType {
  id: string;
  name: string;
  difficulty: 'Nízká' | 'Střední' | 'Vyšší';
  duration: string;
  description: string;
  videoUrl: string;       // YouTube video
  templateUrl: string;    // WordPress šablona
  steps: RoadmapStep[];   // Detailní kroky
}

export const businessTypes: BusinessType[] = [
  {
    id: 'web-prezentacni',
    name: 'Web (prezentační)',
    difficulty: 'Nízká',
    duration: '7 dní',
    description: 'Ideální pro prezentaci firmy a základní informace',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    templateUrl: '#template-web',
    steps: [
      { id: '1', task: 'Zakoupení domény', platform: 'WEDOS.cz', note: 'Doporučujeme .cz nebo .com', price: 299, completed: false },
      { id: '2', task: 'Zakoupení webhostingu', platform: 'WEDOS.cz', note: 'Webhosting Start postačí', price: 990, completed: false },
      { id: '3', task: 'Instalace WordPressu', platform: 'Webhosting panel', note: 'Použijte 1-click instalaci', price: 0, completed: false },
      { id: '4', task: 'Stažení WordPress šablony', platform: 'Náš systém', note: 'Stáhněte si připravenou šablonu', price: 0, completed: false },
      { id: '5', task: 'Nahrání šablony do WP', platform: 'All in One Migration', note: 'Použijte plugin pro import', price: 0, completed: false },
      { id: '6', task: 'Nastavení SSL certifikátu', platform: 'Webhosting panel', note: 'Bezpečnost je důležitá', price: 0, completed: false },
      { id: '7', task: 'Konfigurace základních stránek', platform: 'WordPress admin', note: 'O nás, Kontakt, Služby', price: 0, completed: false },
      { id: '8', task: 'Instalace GDPR pluginu', platform: 'WordPress', note: 'Complianz GDPR plugin', price: 0, completed: false },
      { id: '9', task: 'Nastavení Google Analytics', platform: 'Google Analytics', note: 'Pro sledování návštěvnosti', price: 0, completed: false },
      { id: '10', task: 'SEO optimalizace', platform: 'Yoast SEO plugin', note: 'Základní SEO nastavení', price: 0, completed: false },
      { id: '11', task: 'Testování na mobilních zařízeních', platform: 'Browser DevTools', note: 'Responzivní design je klíčový', price: 0, completed: false },
      { id: '12', task: 'Nastavení zálohování', platform: 'UpdraftPlus', note: 'Automatické zálohy', price: 0, completed: false },
      { id: '13', task: 'Spuštění webu', platform: 'DNS nastavení', note: 'Propojení domény s hostingem', price: 0, completed: false }
    ]
  },
  {
    id: 'blog',
    name: 'Blog',
    difficulty: 'Nízká',
    duration: '10 dní',
    description: 'Sdílení článků a budování SEO',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    templateUrl: '#template-blog',
    steps: [
      { id: '1', task: 'Zakoupení domény', platform: 'WEDOS.cz', note: 'Doporučujeme .cz nebo .com', price: 299, completed: false },
      { id: '2', task: 'Zakoupení webhostingu', platform: 'WEDOS.cz', note: 'Webhosting Start postačí', price: 990, completed: false },
      { id: '3', task: 'Instalace WordPressu', platform: 'Webhosting panel', note: 'Použijte 1-click instalaci', price: 0, completed: false },
      { id: '4', task: 'Stažení blog šablony', platform: 'Náš systém', note: 'Blog optimalizovaná šablona', price: 0, completed: false },
      { id: '5', task: 'Nahrání šablony do WP', platform: 'All in One Migration', note: 'Použijte plugin pro import', price: 0, completed: false },
      { id: '6', task: 'Konfigurace kategorií článků', platform: 'WordPress admin', note: 'Vytvořte logické kategorie', price: 0, completed: false },
      { id: '7', task: 'Nastavení komentářů', platform: 'WordPress nastavení', note: 'Povolte moderované komentáře', price: 0, completed: false },
      { id: '8', task: 'Instalace SEO pluginu', platform: 'WordPress', note: 'Yoast SEO pro lepší ranking', price: 0, completed: false },
      { id: '9', task: 'Nastavení newsletter formuláře', platform: 'Mailchimp/ConvertKit', note: 'Sbírejte emailové kontakty', price: 0, completed: false },
      { id: '10', task: 'Vytvoření prvních 5 článků', platform: 'WordPress editor', note: 'Kvalitní obsah je základ', price: 0, completed: false },
      { id: '11', task: 'Nastavení Google Analytics', platform: 'Google Analytics', note: 'Sledování čtenářů', price: 0, completed: false },
      { id: '12', task: 'Social sharing tlačítka', platform: 'Social Share plugin', note: 'Usnadněte sdílení článků', price: 0, completed: false },
      { id: '13', task: 'RSS feed konfigurace', platform: 'WordPress nastavení', note: 'Pro RSS čtečky', price: 0, completed: false },
      { id: '14', task: 'GDPR compliance', platform: 'Complianz plugin', note: 'Cookies a souhlas', price: 0, completed: false },
      { id: '15', task: 'Spuštění a propagace', platform: 'Sociální sítě', note: 'Sdílejte první články', price: 0, completed: false }
    ]
  },
  {
    id: 'squeeze-page',
    name: 'Squeeze Page',
    difficulty: 'Nízká',
    duration: '7 dní',
    description: 'Sběr kontaktů přes jednoduchou stránku',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    templateUrl: '#template-squeeze',
    steps: [
      { id: '1', task: 'Zakoupení domény', platform: 'WEDOS.cz', note: 'Krátká a zapamatovatelná', price: 299, completed: false },
      { id: '2', task: 'Zakoupení webhostingu', platform: 'WEDOS.cz', note: 'Základní hosting stačí', price: 990, completed: false },
      { id: '3', task: 'Instalace WordPressu', platform: 'Webhosting panel', note: '1-click instalace', price: 0, completed: false },
      { id: '4', task: 'Stažení squeeze page šablony', platform: 'Náš systém', note: 'Optimalizovaná pro konverze', price: 0, completed: false },
      { id: '5', task: 'Import šablony', platform: 'All in One Migration', note: 'Rychlý import celé šablony', price: 0, completed: false },
      { id: '6', task: 'Nastavení email marketing služby', platform: 'Mailchimp', note: 'Pro automatické emaily', price: 0, completed: false },
      { id: '7', task: 'Konfigurace opt-in formuláře', platform: 'Mailchimp for WP', note: 'Propojení s email službou', price: 0, completed: false },
      { id: '8', task: 'Vytvoření lead magnetu', platform: 'Canva/Adobe', note: 'eBook, checklist nebo kurz', price: 0, completed: false },
      { id: '9', task: 'Nastavení thank you page', platform: 'WordPress', note: 'Stránka po registraci', price: 0, completed: false },
      { id: '10', task: 'A/B testování headlines', platform: 'Google Optimize', note: 'Testujte různé nadpisy', price: 0, completed: false },
      { id: '11', task: 'Nastavení Google Analytics', platform: 'Google Analytics', note: 'Sledování konverzí', price: 0, completed: false },
      { id: '12', task: 'GDPR nastavení', platform: 'Complianz plugin', note: 'Souhlas s cookies', price: 0, completed: false },
      { id: '13', task: 'Spuštění kampaně', platform: 'Facebook Ads/Google Ads', note: 'Začněte s malým rozpočtem', price: 1000, completed: false }
    ]
  },
  {
    id: 'web-eshop',
    name: 'Web + E-shop',
    difficulty: 'Střední',
    duration: '10 dní',
    description: 'Kombinace prezentace s prodejní funkcí',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    templateUrl: '#template-web-eshop',
    steps: [
      { id: '1', task: 'Zakoupení domény', platform: 'WEDOS.cz', note: 'Brandová doména', price: 299, completed: false },
      { id: '2', task: 'Zakoupení většího hostingu', platform: 'WEDOS.cz', note: 'Standard hosting pro e-shop', price: 1990, completed: false },
      { id: '3', task: 'Instalace WordPressu + WooCommerce', platform: 'Webhosting panel', note: 'E-commerce řešení', price: 0, completed: false },
      { id: '4', task: 'Import kombinované šablony', platform: 'All in One Migration', note: 'Web + shop v jednom', price: 0, completed: false },
      { id: '5', task: 'Nastavení platební brány', platform: 'GoPay/Stripe', note: 'Kartové platby', price: 0, completed: false },
      { id: '6', task: 'Konfigurace dopravy', platform: 'Zásilkovna/PPL', note: 'Nastavení doručení', price: 0, completed: false },
      { id: '7', task: 'Přidání prvních produktů', platform: 'WooCommerce admin', note: 'Fotky a popisy produktů', price: 0, completed: false },
      { id: '8', task: 'Nastavení daní a fakturace', platform: 'WooCommerce', note: 'DPH a účetnictví', price: 0, completed: false },
      { id: '9', task: 'Konfigurace email notifikací', platform: 'WooCommerce', note: 'Automatické emaily', price: 0, completed: false },
      { id: '10', task: 'SSL certifikát a bezpečnost', platform: 'Webhosting panel', note: 'Zabezpečení plateb', price: 0, completed: false },
      { id: '11', task: 'GDPR a cookies', platform: 'WooCommerce GDPR plugin', note: 'Právní compliance', price: 0, completed: false },
      { id: '12', task: 'SEO optimalizace', platform: 'Yoast SEO', note: 'Optimalizace pro vyhledávače', price: 0, completed: false },
      { id: '13', task: 'Google Analytics a Tag Manager', platform: 'Google', note: 'E-commerce tracking', price: 0, completed: false },
      { id: '14', task: 'Testování nákupního procesu', platform: 'Různé prohlížeče', note: 'Funkčnost na všech zařízeních', price: 0, completed: false },
      { id: '15', task: 'Spuštění a propagace', platform: 'Social media', note: 'Marketing launch', price: 0, completed: false }
    ]
  },
  {
    id: 'dropshipping',
    name: 'Dropshipping',
    difficulty: 'Střední',
    duration: '14 dní',
    description: 'Prodej bez vlastního skladu',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    templateUrl: '#template-dropshipping',
    steps: [
      { id: '1', task: 'Výběr produktové niche', platform: 'Google Trends/AliExpress', note: 'Výzkum trhu a konkurence', price: 0, completed: false },
      { id: '2', task: 'Registrace dodavatele', platform: 'AliExpress/CJ Dropshipping', note: 'Najděte spolehlivé dodavatele', price: 0, completed: false },
      { id: '3', task: 'Zakoupení domény', platform: 'WEDOS.cz', note: 'Brandová doména', price: 299, completed: false },
      { id: '4', task: 'E-commerce hosting', platform: 'WEDOS.cz', note: 'Standard hosting', price: 1990, completed: false },
      { id: '5', task: 'Instalace WooCommerce', platform: 'WordPress', note: 'E-shop platforma', price: 0, completed: false },
      { id: '6', task: 'Import dropshipping šablony', platform: 'All in One Migration', note: 'Optimalizovaná pro dropshipping', price: 0, completed: false },
      { id: '7', task: 'Instalace AliDropship pluginu', platform: 'WordPress', note: 'Automatizace importu produktů', price: 1490, completed: false },
      { id: '8', task: 'Import produktů z AliExpress', platform: 'AliDropship', note: 'Vyberte 20-50 produktů', price: 0, completed: false },
      { id: '9', task: 'Úprava cen a popisů', platform: 'WooCommerce', note: 'Přidejte marži 100-300%', price: 0, completed: false },
      { id: '10', task: 'Nastavení platební brány', platform: 'Stripe/PayPal', note: 'Mezinárodní platby', price: 0, completed: false },
      { id: '11', task: 'Konfigurace dopravy', platform: 'Shipping zones', note: 'Nastavte dopravu podle zemí', price: 0, completed: false },
      { id: '12', task: 'Live chat podpora', platform: 'Tawk.to', note: 'Zákaznický servis', price: 0, completed: false },
      { id: '13', task: 'Nastavení email marketingu', platform: 'Klaviyo', note: 'Automatické email sekvence', price: 0, completed: false },
      { id: '14', task: 'Facebook Pixel instalace', platform: 'Facebook Business', note: 'Pro remarketing kampaně', price: 0, completed: false },
      { id: '15', task: 'Testování objednávkového procesu', platform: 'Různá zařízení', note: 'Kompletní test nákupu', price: 0, completed: false },
      { id: '16', task: 'Spuštění Facebook Ads', platform: 'Facebook Ads Manager', note: 'Začněte s 500 Kč denně', price: 5000, completed: false }
    ]
  },
  {
    id: 'members',
    name: 'Members (placený obsah)',
    difficulty: 'Střední',
    duration: '14 dní',
    description: 'Přístup do uzavřené části webu',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    templateUrl: '#template-members',
    steps: [
      { id: '1', task: 'Zakoupení domény', platform: 'WEDOS.cz', note: 'Brandová doména', price: 299, completed: false },
      { id: '2', task: 'Kvalitní hosting', platform: 'WEDOS.cz', note: 'Standard+ hosting', price: 2990, completed: false },
      { id: '3', task: 'Instalace WordPressu', platform: 'Webhosting panel', note: 'Čistá instalace', price: 0, completed: false },
      { id: '4', task: 'Import membership šablony', platform: 'All in One Migration', note: 'Připravená šablona', price: 0, completed: false },
      { id: '5', task: 'Instalace MemberPress pluginu', platform: 'WordPress', note: 'Premium membership plugin', price: 3790, completed: false },
      { id: '6', task: 'Vytvoření členských úrovní', platform: 'MemberPress', note: 'Basic, Premium, VIP úrovně', price: 0, completed: false },
      { id: '7', task: 'Nastavení platební brány', platform: 'Stripe/PayPal', note: 'Pravidelné platby', price: 0, completed: false },
      { id: '8', task: 'Vytvoření chráněného obsahu', platform: 'WordPress', note: 'Exkluzivní články a videa', price: 0, completed: false },
      { id: '9', task: 'Nastavení email automatizace', platform: 'ConvertKit', note: 'Onboarding sekvence', price: 690, completed: false },
      { id: '10', task: 'Vytvoření uživatelského dashboardu', platform: 'MemberPress', note: 'Přehled pro členy', price: 0, completed: false },
      { id: '11', task: 'Fórum nebo komunita', platform: 'bbPress/Facebook Group', note: 'Prostor pro diskuze', price: 0, completed: false },
      { id: '12', task: 'Mobilní optimalizace', platform: 'Responsive design', note: 'Testování na mobilu', price: 0, completed: false },
      { id: '13', task: 'GDPR compliance', platform: 'GDPR plugins', note: 'Ochrana osobních údajů', price: 0, completed: false },
      { id: '14', task: 'Beta testování s prvními členy', platform: 'Přátelé/rodina', note: 'Získejte feedback', price: 0, completed: false },
      { id: '15', task: 'Launch marketing kampaň', platform: 'Email + Social media', note: 'Oznámení spuštění', price: 0, completed: false }
    ]
  },
  {
    id: 'konverzni-web',
    name: 'Konverzní web',
    difficulty: 'Střední',
    duration: '14 dní',
    description: 'Zaměřený na konverze pomocí jednoduchého funnelu',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    templateUrl: '#template-conversion',
    steps: [
      { id: '1', task: 'Výzkum target audience', platform: 'Google Analytics/Facebook Insights', note: 'Definujte ideálního zákazníka', price: 0, completed: false },
      { id: '2', task: 'Zakoupení domény', platform: 'WEDOS.cz', note: 'Krátká a action-oriented', price: 299, completed: false },
      { id: '3', task: 'Hosting s CDN', platform: 'WEDOS.cz', note: 'Pro rychlé načítání', price: 1990, completed: false },
      { id: '4', task: 'Instalace WordPressu', platform: 'Webhosting panel', note: '1-click instalace', price: 0, completed: false },
      { id: '5', task: 'Import konverzní šablony', platform: 'All in One Migration', note: 'Optimalizovaná pro konverze', price: 0, completed: false },
      { id: '6', task: 'Nastavení heat map tracking', platform: 'Hotjar', note: 'Sledování chování uživatelů', price: 890, completed: false },
      { id: '7', task: 'A/B testing setup', platform: 'Google Optimize', note: 'Testování variant stránek', price: 0, completed: false },
      { id: '8', task: 'Konfigurace CRO pluginů', platform: 'OptinMonster', note: 'Pop-ups a exit-intent', price: 1200, completed: false },
      { id: '9', task: 'Nastavení goal tracking', platform: 'Google Analytics', note: 'Sledování konverzí', price: 0, completed: false },
      { id: '10', task: 'Email marketing integrace', platform: 'Mailchimp', note: 'Automatické sekvence', price: 0, completed: false },
      { id: '11', task: 'Social proof pluginy', platform: 'TrustPulse', note: 'Notifikace o aktivitě', price: 590, completed: false },
      { id: '12', task: 'Rychlostní optimalizace', platform: 'WP Rocket', note: 'Caching a optimalizace', price: 1490, completed: false },
      { id: '13', task: 'Live chat instalace', platform: 'Intercom', note: 'Zákaznická podpora', price: 990, completed: false },
      { id: '14', task: 'Spuštění PPC kampaní', platform: 'Google Ads', note: 'Začněte s 1000 Kč denně', price: 10000, completed: false }
    ]
  },
  {
    id: 'affiliate',
    name: 'Affiliate',
    difficulty: 'Střední',
    duration: '14 dní',
    description: 'Monetizace webu pomocí provizních odkazů',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    templateUrl: '#template-affiliate',
    steps: [
      { id: '1', task: 'Výběr profitable niche', platform: 'AffiliatePrograms.com', note: 'Výzkum provizních programů', price: 0, completed: false },
      { id: '2', task: 'Registrace do affiliate sítí', platform: 'ShareASale/CJ Affiliate', note: 'Přihlášení do programů', price: 0, completed: false },
      { id: '3', task: 'Zakoupení domény', platform: 'WEDOS.cz', note: 'Brandová doména', price: 299, completed: false },
      { id: '4', task: 'Hosting setup', platform: 'WEDOS.cz', note: 'Standard hosting', price: 1990, completed: false },
      { id: '5', task: 'WordPress instalace', platform: 'Webhosting panel', note: 'Čistá instalace', price: 0, completed: false },
      { id: '6', task: 'Import affiliate šablony', platform: 'All in One Migration', note: 'SEO optimalizovaná šablona', price: 0, completed: false },
      { id: '7', task: 'Instalace ThirstyAffiliates', platform: 'WordPress', note: 'Správa affiliate odkazů', price: 1990, completed: false },
      { id: '8', task: 'Content plánování', platform: 'Ahrefs/SEMrush', note: 'Keyword research', price: 2990, completed: false },
      { id: '9', task: 'Vytvoření 20 review článků', platform: 'WordPress editor', note: 'Kvalitní review obsah', price: 0, completed: false },
      { id: '10', task: 'SEO optimalizace', platform: 'Yoast SEO', note: 'On-page SEO', price: 0, completed: false },
      { id: '11', task: 'Email list building', platform: 'ConvertKit', note: 'Lead magnety a opt-ins', price: 690, completed: false },
      { id: '12', task: 'Social media setup', platform: 'Facebook/Instagram', note: 'Propagace obsahu', price: 0, completed: false },
      { id: '13', task: 'Analytics a tracking', platform: 'Google Analytics', note: 'Sledování kliknutí', price: 0, completed: false },
      { id: '14', task: 'Disclosure a legal', platform: 'Právník/šablony', note: 'FTC compliance', price: 2500, completed: false }
    ]
  },
  {
    id: 'eshop',
    name: 'E-shop',
    difficulty: 'Vyšší',
    duration: '21 dní',
    description: 'Kompletní e-commerce řešení',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    templateUrl: '#template-eshop',
    steps: [
      { id: '1', task: 'Výzkum trhu a konkurence', platform: 'Google Trends/SimilarWeb', note: 'Analýza konkurence', price: 0, completed: false },
      { id: '2', task: 'Zakoupení domény', platform: 'WEDOS.cz', note: 'Brandová .com doména', price: 299, completed: false },
      { id: '3', task: 'E-commerce hosting', platform: 'WEDOS.cz', note: 'Premium hosting', price: 3990, completed: false },
      { id: '4', task: 'WordPress + WooCommerce', platform: 'Webhosting panel', note: 'E-shop platforma', price: 0, completed: false },
      { id: '5', task: 'Import e-shop šablony', platform: 'All in One Migration', note: 'Profesionální design', price: 0, completed: false },
      { id: '6', task: 'Platební brány setup', platform: 'GoPay/Stripe/PayPal', note: 'Více platebních metod', price: 0, completed: false },
      { id: '7', task: 'Nastavení dopravy', platform: 'Zásilkovna/PPL/DPD', note: 'Komplexní doručení', price: 0, completed: false },
      { id: '8', task: 'Produktový katalog', platform: 'WooCommerce', note: 'Import 100+ produktů', price: 0, completed: false },
      { id: '9', task: 'Fotografování produktů', platform: 'Fotostudio/vlastní', note: 'Profesionální fotky', price: 15000, completed: false },
      { id: '10', task: 'Inventory management', platform: 'WooCommerce + plugin', note: 'Správa skladových zásob', price: 2990, completed: false },
      { id: '11', task: 'Customer accounts', platform: 'WooCommerce', note: 'Zákaznické účty', price: 0, completed: false },
      { id: '12', task: 'Email automation', platform: 'Klaviyo', note: 'Automatické emaily', price: 1590, completed: false },
      { id: '13', task: 'Reviews systém', platform: 'Yotpo/Judge.me', note: 'Zákaznické recenze', price: 890, completed: false },
      { id: '14', task: 'Live chat podpora', platform: 'Zendesk', note: 'Zákaznický servis', price: 1990, completed: false },
      { id: '15', task: 'SEO optimalizace', platform: 'Yoast WooCommerce SEO', note: 'E-commerce SEO', price: 1990, completed: false },
      { id: '16', task: 'Security & SSL', platform: 'Wordfence', note: 'Zabezpečení plateb', price: 990, completed: false },
      { id: '17', task: 'Analytics setup', platform: 'Google Analytics + GTM', note: 'E-commerce tracking', price: 0, completed: false },
      { id: '18', task: 'Facebook Pixel', platform: 'Facebook Business', note: 'Remarketing setup', price: 0, completed: false },
      { id: '19', task: 'Testing všech funkcí', platform: 'Různé prohlížeče', note: 'Kompletní funkční test', price: 0, completed: false },
      { id: '20', task: 'Launch marketing', platform: 'Google Ads + Facebook', note: 'Spuštění kampaní', price: 20000, completed: false }
    ]
  },
  {
    id: 'lms',
    name: 'LMS',
    difficulty: 'Vyšší',
    duration: '21 dní',
    description: 'Online výuka a kurzy',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    templateUrl: '#template-lms',
    steps: [
      { id: '1', task: 'Plánování kurzů', platform: 'Mind mapping', note: 'Struktura vzdělávacího obsahu', price: 0, completed: false },
      { id: '2', task: 'Zakoupení domény', platform: 'WEDOS.cz', note: 'Edukační doména', price: 299, completed: false },
      { id: '3', task: 'Premium hosting', platform: 'WEDOS.cz', note: 'Pro video obsah', price: 4990, completed: false },
      { id: '4', task: 'WordPress instalace', platform: 'Webhosting panel', note: 'Čistá instalace', price: 0, completed: false },
      { id: '5', task: 'LearnDash plugin', platform: 'WordPress', note: 'LMS platforma', price: 5990, completed: false },
      { id: '6', task: 'Import LMS šablony', platform: 'All in One Migration', note: 'Edukační design', price: 0, completed: false },
      { id: '7', task: 'Video hosting setup', platform: 'Vimeo Pro/Wistia', note: 'Zabezpečené video', price: 3900, completed: false },
      { id: '8', task: 'Kurzová struktura', platform: 'LearnDash', note: 'Lekce, kvízy, certifikáty', price: 0, completed: false },
      { id: '9', task: 'Natáčení videí', platform: 'Studio/domácí', note: '20+ hodin obsahu', price: 25000, completed: false },
      { id: '10', task: 'Video editing', platform: 'Adobe Premiere/DaVinci', note: 'Profesionální střih', price: 15000, completed: false },
      { id: '11', task: 'Platební integrace', platform: 'Stripe/PayPal', note: 'Platby za kurzy', price: 0, completed: false },
      { id: '12', task: 'Student dashboard', platform: 'LearnDash', note: 'Uživatelské rozhraní', price: 0, completed: false },
      { id: '13', task: 'Diskuzní fórum', platform: 'bbPress', note: 'Student komunita', price: 0, completed: false },
      { id: '14', task: 'Email automatizace', platform: 'ConvertKit', note: 'Kurz komunikace', price: 1590, completed: false },
      { id: '15', task: 'Mobilní aplikace', platform: 'LearnDash App', note: 'Mobile learning', price: 2990, completed: false },
      { id: '16', task: 'Certifikáty systém', platform: 'LearnDash', note: 'Automatické certifikáty', price: 0, completed: false },
      { id: '17', task: 'Analytics a reporting', platform: 'LearnDash Reporting', note: 'Pokrok studentů', price: 1990, completed: false },
      { id: '18', task: 'Beta testing', platform: 'Skupina testovačů', note: 'Testování před spuštěním', price: 0, completed: false },
      { id: '19', task: 'Affiliate program', platform: 'AffiliateWP', note: 'Propagace kurzů', price: 3990, completed: false },
      { id: '20', task: 'Launch kampaň', platform: 'Multi-channel marketing', note: 'Uvedení na trh', price: 25000, completed: false }
    ]
  },
  {
    id: 'marketplace',
    name: 'Marketplace',
    difficulty: 'Vyšší',
    duration: '30 dní',
    description: 'Propojení více prodejců',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    templateUrl: '#template-marketplace',
    steps: [
      { id: '1', task: 'Business model definice', platform: 'Canvas/dokumentace', note: 'Provizní model, rules', price: 0, completed: false },
      { id: '2', task: 'Legal framework', platform: 'Právník', note: 'Smlouvy, T&C, GDPR', price: 25000, completed: false },
      { id: '3', task: 'Zakoupení domény', platform: 'WEDOS.cz', note: 'Premium doména', price: 999, completed: false },
      { id: '4', task: 'Enterprise hosting', platform: 'WEDOS.cz', note: 'Vysoký výkon', price: 9990, completed: false },
      { id: '5', task: 'WordPress Multisite', platform: 'WordPress', note: 'Multi-vendor setup', price: 0, completed: false },
      { id: '6', task: 'Dokan Pro plugin', platform: 'WordPress', note: 'Marketplace funkcionalita', price: 11990, completed: false },
      { id: '7', task: 'Import marketplace šablony', platform: 'All in One Migration', note: 'Multi-vendor design', price: 0, completed: false },
      { id: '8', task: 'Vendor registration', platform: 'Dokan', note: 'Registrace prodejců', price: 0, completed: false },
      { id: '9', task: 'Komisní systém', platform: 'Dokan Pro', note: 'Automatické provize', price: 0, completed: false },
      { id: '10', task: 'Platební systém', platform: 'Stripe Connect', note: 'Split payments', price: 0, completed: false },
      { id: '11', task: 'Review a rating systém', platform: 'Custom development', note: 'Hodnocení prodejců', price: 15000, completed: false },
      { id: '12', task: 'Messaging systém', platform: 'Dokan/custom', note: 'Komunikace buyer-seller', price: 8000, completed: false },
      { id: '13', task: 'Dispute resolution', platform: 'Custom system', note: 'Řešení sporů', price: 12000, completed: false },
      { id: '14', task: 'Advanced search', platform: 'ElasticSearch', note: 'Pokročilé vyhledávání', price: 5000, completed: false },
      { id: '15', task: 'Mobile responsivita', platform: 'Custom CSS/JS', note: 'Mobilní optimalizace', price: 8000, completed: false },
      { id: '16', task: 'Admin dashboard', platform: 'Custom development', note: 'Správa marketplace', price: 15000, completed: false },
      { id: '17', task: 'Analytics systém', platform: 'Custom + GA', note: 'Detailní metriky', price: 6000, completed: false },
      { id: '18', task: 'Security measures', platform: 'Security plugins', note: 'Bezpečnost platformy', price: 3000, completed: false },
      { id: '19', task: 'Beta testing', platform: 'Selected vendors', note: 'Testování s prvními prodejci', price: 0, completed: false },
      { id: '20', task: 'Marketing launch', platform: 'Multi-channel', note: 'Získání prvních uživatelů', price: 50000, completed: false }
    ]
  },
  {
    id: 'forum-komunita',
    name: 'Fórum/komunitní platforma',
    difficulty: 'Střední',
    duration: '16 dní',
    description: 'Komunita s diskusemi a interakcí',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    templateUrl: '#template-forum',
    steps: [
      { id: '1', task: 'Komunitní strategie', platform: 'Plánování', note: 'Cílová skupina, pravidla', price: 0, completed: false },
      { id: '2', task: 'Zakoupení domény', platform: 'WEDOS.cz', note: 'Komunitní doména', price: 299, completed: false },
      { id: '3', task: 'Hosting pro komunitu', platform: 'WEDOS.cz', note: 'Standard+ hosting', price: 2990, completed: false },
      { id: '4', task: 'WordPress instalace', platform: 'Webhosting panel', note: 'Základní setup', price: 0, completed: false },
      { id: '5', task: 'bbPress instalace', platform: 'WordPress', note: 'Fórum plugin', price: 0, completed: false },
      { id: '6', task: 'BuddyPress setup', platform: 'WordPress', note: 'Sociální funkce', price: 0, completed: false },
      { id: '7', task: 'Import komunitní šablony', platform: 'All in One Migration', note: 'Community design', price: 0, completed: false },
      { id: '8', task: 'User roles a permissions', platform: 'WordPress', note: 'Moderátoři, členové', price: 0, completed: false },
      { id: '9', task: 'Fórum kategorie', platform: 'bbPress', note: 'Struktura diskuzí', price: 0, completed: false },
      { id: '10', task: 'Moderační nástroje', platform: 'bbPress + plugins', note: 'Spam protection, moderation', price: 590, completed: false },
      { id: '11', task: 'Gamifikace systém', platform: 'myCRED', note: 'Body, odznaky, žebříčky', price: 1990, completed: false },
      { id: '12', task: 'Push notifikace', platform: 'OneSignal', note: 'Upozornění na aktivitu', price: 0, completed: false },
      { id: '13', task: 'Email digest', platform: 'bbPress + Mailchimp', note: 'Weekly/daily summary', price: 0, completed: false },
      { id: '14', task: 'Mobile app', platform: 'AppPresser', note: 'Mobilní aplikace', price: 4990, completed: false },
      { id: '15', task: 'Community guidelines', platform: 'WordPress pages', note: 'Pravidla komunity', price: 0, completed: false },
      { id: '16', task: 'Launch strategie', platform: 'Social media', note: 'První členové a obsah', price: 0, completed: false }
    ]
  }
];