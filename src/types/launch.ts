export interface LaunchKPI {
  target: {
    orders: number;
    avgOrderValue: number;
    visitors: number;
    conversionRate: number;
    cpc: number;
    roas: number;
  };
  actual: {
    orders: number;
    avgOrderValue: number;
    visitors: number;
    conversionRate: number;
    cpc: number;
    roas: number;
  };
}

export interface ProductPerformance {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  conversionRate: number;
}

export interface ChannelPerformance {
  id: string;
  channel: string;
  cost: number;
  revenue: number;
  customers: number;
  cpa: number;
  roi: number;
}

export interface LaunchData {
  kpis: LaunchKPI;
  products: ProductPerformance[];
  channels: ChannelPerformance[];
  paretoAnalysis: {
    topProducts: string[];
    recommendation: string;
  };
}