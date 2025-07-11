export interface WorkValueData {
  monthlyProfit: number;
  hourlyRate: number;
  idealEmployeeRate: number;
  shouldHire: boolean;
  marketRate: number;
}

export interface GrowthRuleData {
  weeklyGrowthHours: number;
  weeklyOperationalHours: number;
  growthPercentage: number;
  isHealthy: boolean;
  totalWeeklyHours: number;
}

export interface CashflowData {
  monthlyRevenue: number;
  fixedCosts: number;
  variableCosts: number;
  reservePercentage: number;
  recommendedReserve: number;
  netCashflow: number;
  forecastMonths: number;
}

export interface GrowthParametersData {
  stableProfitMonths: number;
  pnoPercentage: number;
  hasKPIs: boolean;
  hasAnalytics: boolean;
  readyForGrowth: boolean;
  readinessScore: number;
}

export interface ReflectionData {
  growthBarriers: string;
  delegationTasks: string;
  weeklyGrowthHours: number;
  supportSystem: string;
  scalingPlan: 'people' | 'systems' | 'combination' | '';
}

export interface ExpansionData {
  workValue: WorkValueData;
  growthRule: GrowthRuleData;
  cashflow: CashflowData;
  growthParameters: GrowthParametersData;
  reflection: ReflectionData;
  aiRecommendations: string[];
  isCompleted: boolean;
}

export const defaultExpansionData: ExpansionData = {
  workValue: {
    monthlyProfit: 0,
    hourlyRate: 0,
    idealEmployeeRate: 0,
    shouldHire: false,
    marketRate: 150,
  },
  growthRule: {
    weeklyGrowthHours: 0,
    weeklyOperationalHours: 0,
    growthPercentage: 0,
    isHealthy: false,
    totalWeeklyHours: 40,
  },
  cashflow: {
    monthlyRevenue: 0,
    fixedCosts: 0,
    variableCosts: 0,
    reservePercentage: 25,
    recommendedReserve: 0,
    netCashflow: 0,
    forecastMonths: 3,
  },
  growthParameters: {
    stableProfitMonths: 0,
    pnoPercentage: 0,
    hasKPIs: false,
    hasAnalytics: false,
    readyForGrowth: false,
    readinessScore: 0,
  },
  reflection: {
    growthBarriers: '',
    delegationTasks: '',
    weeklyGrowthHours: 0,
    supportSystem: '',
    scalingPlan: '',
  },
  aiRecommendations: [],
  isCompleted: false,
};