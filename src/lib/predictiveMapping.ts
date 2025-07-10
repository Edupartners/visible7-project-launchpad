// Predictive mapping utilities for Strategy & Business phase

export interface VisionProjectData {
  name: string;
  slogan: string;
}

export interface VisionERRCData {
  eliminate: string[];
  reduce: string[];
  raise: string[];
  create: string[];
}

export interface ValueCurveAttribute {
  name: string;
  lowCost: number;
  premium: number;
  myProject: number;
  type?: string;
  color?: string;
}

export interface VisionData {
  project: VisionProjectData;
  errc: VisionERRCData;
  valueCurve: ValueCurveAttribute[];
  visionStatement: string;
}

export interface LeanCanvasData {
  problemStatement?: string;
  solutionDescription?: string;
  keyMetrics?: string;
  uniqueValueProposition?: string;
  unfairAdvantage?: string;
  channels?: string;
  customerSegments?: string;
  costStructure?: string;
  revenueStreams?: string;
}

export interface RevenueItem {
  name: string;
  type: 'commission' | 'subscription' | 'oneTime' | 'freemium' | 'marketplace' | 'licensing';
  monthlyRevenue: number[];
}

export interface MarketingCosts {
  socialMedia: number[];
  ppc: number[];
  contentMarketing: number[];
  events: number[];
  partnerships: number[];
  other: number[];
}

// Load data from previous phases
export const loadVisionPhaseData = (): VisionData | null => {
  try {
    const project = JSON.parse(localStorage.getItem("vision_project_data") || "null");
    const errc = JSON.parse(localStorage.getItem("vision_errc_data") || "null");
    const valueCurve = JSON.parse(localStorage.getItem("vision_value_curve") || "null");
    const visionStatement = JSON.parse(localStorage.getItem("vision_statement") || "null");

    if (!project || !errc || !valueCurve) return null;

    return { project, errc, valueCurve, visionStatement: visionStatement || "" };
  } catch {
    return null;
  }
};

export const loadIdeationPhaseData = (): LeanCanvasData | null => {
  try {
    return JSON.parse(localStorage.getItem("lean_canvas_data") || "null");
  } catch {
    return null;
  }
};

// Industry detection based on project data
export const detectIndustry = (visionData: VisionData, leanCanvasData?: LeanCanvasData | null): string => {
  const text = [
    visionData.project.name,
    visionData.project.slogan,
    visionData.visionStatement,
    ...visionData.errc.create,
    ...visionData.errc.raise,
    leanCanvasData?.solutionDescription || "",
    leanCanvasData?.revenueStreams || ""
  ].join(" ").toLowerCase();

  if (text.includes("software") || text.includes("saas") || text.includes("app") || text.includes("platform") || text.includes("digitální")) {
    return "saas";
  }
  if (text.includes("e-shop") || text.includes("obchod") || text.includes("prodej") || text.includes("marketplace") || text.includes("e-commerce")) {
    return "ecommerce";
  }
  if (text.includes("služba") || text.includes("konsultace") || text.includes("poradenstí") || text.includes("coaching")) {
    return "services";
  }
  if (text.includes("marketplace") || text.includes("platforma") || text.includes("spojuje") || text.includes("propojuje")) {
    return "marketplace";
  }
  
  return "general";
};

// Analyze revenue streams from Lean Canvas
export const analyzeRevenueStreams = (revenueStreams: string): RevenueItem[] => {
  const text = revenueStreams.toLowerCase();
  const items: RevenueItem[] = [];
  
  // Commission-based revenue
  if (text.includes("provize") || text.includes("commission") || text.includes("poplatek za transakci") || text.includes("%")) {
    items.push({
      name: "Provize z transakcí",
      type: "commission",
      monthlyRevenue: Array(12).fill(15000) // Default commission revenue
    });
  }
  
  // Subscription revenue
  if (text.includes("předplatné") || text.includes("subscription") || text.includes("měsíční") || text.includes("roční")) {
    items.push({
      name: "Měsíční předplatné",
      type: "subscription", 
      monthlyRevenue: Array(12).fill(25000) // Default subscription revenue
    });
  }
  
  // One-time sales
  if (text.includes("prodej") || text.includes("jednorázový") || text.includes("licenč") || text.includes("produkt")) {
    items.push({
      name: "Jednorázový prodej",
      type: "oneTime",
      monthlyRevenue: Array(12).fill(30000) // Default one-time sales
    });
  }
  
  // Freemium model
  if (text.includes("freemium") || text.includes("free") || text.includes("premium") || text.includes("upgrade")) {
    items.push({
      name: "Premium upgrade",
      type: "freemium",
      monthlyRevenue: Array(12).fill(18000) // Default freemium revenue
    });
  }
  
  // Marketplace fees
  if (text.includes("marketplace") || text.includes("platforma") || text.includes("listing") || text.includes("poplatek za")) {
    items.push({
      name: "Poplatky za listing",
      type: "marketplace",
      monthlyRevenue: Array(12).fill(12000) // Default marketplace fees
    });
  }
  
  // Licensing
  if (text.includes("licence") || text.includes("licensing") || text.includes("IP") || text.includes("autorské")) {
    items.push({
      name: "Licenční poplatky",
      type: "licensing",
      monthlyRevenue: Array(12).fill(20000) // Default licensing fees
    });
  }
  
  // If no specific patterns found, add a generic revenue stream
  if (items.length === 0) {
    items.push({
      name: "Hlavní příjmy",
      type: "oneTime",
      monthlyRevenue: Array(12).fill(25000)
    });
  }
  
  return items;
};

// Generate intelligent marketing costs based on industry and business model
export const generateMarketingCosts = (industry: string, revenueItems: RevenueItem[]): MarketingCosts => {
  const baseCosts = {
    saas: {
      socialMedia: 8000,
      ppc: 15000,
      contentMarketing: 12000,
      events: 5000,
      partnerships: 8000,
      other: 3000
    },
    ecommerce: {
      socialMedia: 12000,
      ppc: 20000,
      contentMarketing: 6000,
      events: 3000,
      partnerships: 5000,
      other: 4000
    },
    services: {
      socialMedia: 5000,
      ppc: 8000,
      contentMarketing: 15000,
      events: 10000,
      partnerships: 12000,
      other: 2000
    },
    marketplace: {
      socialMedia: 10000,
      ppc: 18000,
      contentMarketing: 8000,
      events: 7000,
      partnerships: 15000,
      other: 5000
    },
    general: {
      socialMedia: 8000,
      ppc: 12000,
      contentMarketing: 10000,
      events: 6000,
      partnerships: 8000,
      other: 3000
    }
  };

  const costs = baseCosts[industry as keyof typeof baseCosts] || baseCosts.general;
  
  // Apply seasonal multipliers (higher costs in Q4 and Q1)
  const seasonalMultipliers = [1.2, 1.1, 0.9, 0.8, 0.8, 0.9, 0.9, 0.8, 0.9, 1.0, 1.1, 1.3];
  
  return {
    socialMedia: seasonalMultipliers.map(m => Math.round(costs.socialMedia * m)),
    ppc: seasonalMultipliers.map(m => Math.round(costs.ppc * m)),
    contentMarketing: seasonalMultipliers.map(m => Math.round(costs.contentMarketing * m)),
    events: seasonalMultipliers.map(m => Math.round(costs.events * m)),
    partnerships: seasonalMultipliers.map(m => Math.round(costs.partnerships * m)),
    other: seasonalMultipliers.map(m => Math.round(costs.other * m))
  };
};

// Generate operational costs based on industry
export const generateOperationalCosts = (industry: string): number[] => {
  const baseCosts = {
    saas: 35000,      // Higher development costs, lower logistics
    ecommerce: 45000, // Logistics, inventory management  
    services: 25000,  // Mainly personnel costs
    marketplace: 40000, // Trust & safety, payment processing
    general: 30000
  };
  
  const monthlyCost = baseCosts[industry as keyof typeof baseCosts] || baseCosts.general;
  
  // Slight seasonal variation for operational costs
  const seasonalMultipliers = [1.05, 1.0, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 1.0, 1.0, 1.05, 1.1];
  
  return seasonalMultipliers.map(m => Math.round(monthlyCost * m));
};

// Calculate recommended PNO based on industry
export const calculateRecommendedPNO = (industry: string, totalRevenue: number): number => {
  const profitMargins = {
    saas: 0.25,       // 25% profit margin typical for SaaS
    ecommerce: 0.15,  // 15% for e-commerce
    services: 0.35,   // 35% for service businesses
    marketplace: 0.30, // 30% for marketplace platforms  
    general: 0.20     // 20% general
  };
  
  const margin = profitMargins[industry as keyof typeof profitMargins] || profitMargins.general;
  return Math.round(totalRevenue * margin);
};

// Main prediction function
export const generatePredictiveData = () => {
  const visionData = loadVisionPhaseData();
  const leanCanvasData = loadIdeationPhaseData();
  
  if (!visionData) return null;
  
  const industry = detectIndustry(visionData, leanCanvasData);
  
  // Analyze revenue streams from Lean Canvas or create defaults
  const revenueItems = leanCanvasData?.revenueStreams 
    ? analyzeRevenueStreams(leanCanvasData.revenueStreams)
    : [{
        name: "Hlavní příjmy",
        type: "oneTime" as const,
        monthlyRevenue: Array(12).fill(25000)
      }];
  
  const marketingCosts = generateMarketingCosts(industry, revenueItems);
  const operationalCosts = generateOperationalCosts(industry);
  
  // Calculate totals
  const totalMonthlyRevenue = revenueItems.reduce((acc, item) => 
    acc.map((val, i) => val + item.monthlyRevenue[i]), 
    Array(12).fill(0)
  );
  
  const totalYearlyRevenue = totalMonthlyRevenue.reduce((a, b) => a + b, 0);
  const recommendedPNO = calculateRecommendedPNO(industry, totalYearlyRevenue);
  
  return {
    industry,
    revenueItems,
    marketingCosts,
    operationalCosts,
    totalMonthlyRevenue,
    totalYearlyRevenue,
    recommendedPNO,
    confidence: 0.8, // 80% confidence in predictions
    suggestions: generateSuggestions(industry, visionData, leanCanvasData)
  };
};

// Generate helpful suggestions based on analysis
const generateSuggestions = (industry: string, visionData: VisionData, leanCanvasData: LeanCanvasData | null): string[] => {
  const suggestions = [];
  
  // Industry-specific suggestions
  switch (industry) {
    case "saas":
      suggestions.push("Pro SaaS model doporučujeme investovat více do content marketingu a partnerství");
      suggestions.push("Zvažte freemium model pro rychlejší acquisition zákazníků");
      break;
    case "ecommerce":
      suggestions.push("E-commerce vyžaduje vyšší investice do PPC a social media reklamy");
      suggestions.push("Nezapomeňte na náklady na logistiku a skladování");
      break;
    case "services":
      suggestions.push("Služby profitují z eventů a osobního networkingu");
      suggestions.push("Content marketing a referrals jsou klíčové pro růst");
      break;
    case "marketplace":
      suggestions.push("Marketplace modely potřebují vyšší investice do trust & safety");
      suggestions.push("Partnerství jsou kritická pro získání critical mass");
      break;
  }
  
  // Add ERRC-based suggestions
  if (visionData.errc.create.length > 0) {
    suggestions.push(`Vaše inovace (${visionData.errc.create.join(", ")}) může odůvodnit premium pricing`);
  }
  
  if (leanCanvasData?.uniqueValueProposition) {
    suggestions.push("Silná UVP umožňuje snížit marketing náklady díky word-of-mouth");
  }
  
  return suggestions;
};