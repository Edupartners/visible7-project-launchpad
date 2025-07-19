
import { generatePredictiveData } from './predictiveMapping';

interface ExcelData {
  revenueItems: Array<{
    name: string;
    type: string;
    monthlyRevenue: number[];
  }>;
  marketingCosts: {
    socialMedia: number[];
    ppc: number[];
    contentMarketing: number[];
    events: number[];
    partnerships: number[];
    other: number[];
  };
  operationalCosts: number[];
  totalMonthlyRevenue: number[];
  industry: string;
  recommendedPNO: number;
  suggestions: string[];
}

export const generateExcelData = (): ExcelData | null => {
  const predictiveData = generatePredictiveData();
  
  if (!predictiveData) return null;
  
  return {
    revenueItems: predictiveData.revenueItems,
    marketingCosts: predictiveData.marketingCosts,
    operationalCosts: predictiveData.operationalCosts,
    totalMonthlyRevenue: predictiveData.totalMonthlyRevenue,
    industry: predictiveData.industry,
    recommendedPNO: predictiveData.recommendedPNO,
    suggestions: predictiveData.suggestions
  };
};

export const createExcelBlob = (data: ExcelData): Blob => {
  const months = ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 
                  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'];
  
  // Create CSV content that can be opened in Excel
  let csvContent = '';
  
  // Header
  csvContent += 'V7 VISIBLE7 MICEK™ - ROI Business Kalkulátor\n\n';
  csvContent += `Odvětví: ${data.industry}\n`;
  csvContent += `Doporučené PNO: ${data.recommendedPNO.toLocaleString('cs-CZ')} Kč\n\n`;
  
  // Revenue section
  csvContent += 'PŘÍJMY (Kč)\n';
  csvContent += 'Zdroj příjmů,Typ,' + months.join(',') + ',Celkem\n';
  
  data.revenueItems.forEach(item => {
    const total = item.monthlyRevenue.reduce((a, b) => a + b, 0);
    csvContent += `"${item.name}","${item.type}",` + 
                  item.monthlyRevenue.map(val => val.toLocaleString('cs-CZ')).join(',') + 
                  `,${total.toLocaleString('cs-CZ')}\n`;
  });
  
  const totalRevenue = data.totalMonthlyRevenue.reduce((a, b) => a + b, 0);
  csvContent += 'CELKEM PŘÍJMY,,' + 
                data.totalMonthlyRevenue.map(val => val.toLocaleString('cs-CZ')).join(',') + 
                `,${totalRevenue.toLocaleString('cs-CZ')}\n\n`;
  
  // Marketing costs section
  csvContent += 'MARKETINGOVÉ NÁKLADY (Kč)\n';
  csvContent += 'Kanál,' + months.join(',') + ',Celkem\n';
  
  const marketingChannels = [
    { name: 'Social Media', values: data.marketingCosts.socialMedia },
    { name: 'PPC Reklama', values: data.marketingCosts.ppc },
    { name: 'Content Marketing', values: data.marketingCosts.contentMarketing },
    { name: 'Eventy', values: data.marketingCosts.events },
    { name: 'Partnerství', values: data.marketingCosts.partnerships },
    { name: 'Ostatní', values: data.marketingCosts.other }
  ];
  
  let totalMarketingCosts = Array(12).fill(0);
  marketingChannels.forEach(channel => {
    const total = channel.values.reduce((a, b) => a + b, 0);
    csvContent += `"${channel.name}",` + 
                  channel.values.map(val => val.toLocaleString('cs-CZ')).join(',') + 
                  `,${total.toLocaleString('cs-CZ')}\n`;
    
    channel.values.forEach((val, i) => totalMarketingCosts[i] += val);
  });
  
  const totalMarketingYear = totalMarketingCosts.reduce((a, b) => a + b, 0);
  csvContent += 'CELKEM MARKETING,' + 
                totalMarketingCosts.map(val => val.toLocaleString('cs-CZ')).join(',') + 
                `,${totalMarketingYear.toLocaleString('cs-CZ')}\n\n`;
  
  // Operational costs section
  csvContent += 'PROVOZNÍ NÁKLADY (Kč)\n';
  csvContent += 'Měsíc,' + months.join(',') + ',Celkem\n';
  const totalOperational = data.operationalCosts.reduce((a, b) => a + b, 0);
  csvContent += 'Provozní náklady,' + 
                data.operationalCosts.map(val => val.toLocaleString('cs-CZ')).join(',') + 
                `,${totalOperational.toLocaleString('cs-CZ')}\n\n`;
  
  // Summary section
  csvContent += 'SHRNUTÍ\n';
  csvContent += 'Ukazatel,Hodnota\n';
  
  const totalCosts = totalMarketingYear + totalOperational;
  const profit = totalRevenue - totalCosts;
  const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
  const roi = totalCosts > 0 ? (profit / totalCosts) * 100 : 0;
  
  csvContent += `"Celkové příjmy","${totalRevenue.toLocaleString('cs-CZ')} Kč"\n`;
  csvContent += `"Celkové náklady","${totalCosts.toLocaleString('cs-CZ')} Kč"\n`;
  csvContent += `"Zisk","${profit.toLocaleString('cs-CZ')} Kč"\n`;
  csvContent += `"Zisková marže","${profitMargin.toFixed(1)}%"\n`;
  csvContent += `"ROI","${roi.toFixed(1)}%"\n`;
  csvContent += `"Doporučené PNO","${data.recommendedPNO.toLocaleString('cs-CZ')} Kč"\n\n`;
  
  // Suggestions section
  if (data.suggestions.length > 0) {
    csvContent += 'DOPORUČENÍ\n';
    data.suggestions.forEach((suggestion, index) => {
      csvContent += `"${index + 1}. ${suggestion}"\n`;
    });
  }
  
  // Convert to blob with proper encoding for Excel
  const blob = new Blob(['\ufeff' + csvContent], { 
    type: 'text/csv;charset=utf-8;' 
  });
  
  return blob;
};

export const downloadExcelFile = () => {
  const data = generateExcelData();
  
  if (!data) {
    throw new Error('Nejsou k dispozici data pro export. Dokončete nejprve předchozí fáze.');
  }
  
  const blob = createExcelBlob(data);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = `V7_ROI_Kalkulator_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  
  window.URL.revokeObjectURL(url);
};
