import * as XLSX from 'xlsx';
import { generatePredictiveData } from './predictiveMapping';

interface ROICalculatorData {
  marketingCosts: Array<{
    channel: string;
    costs: number[];
  }>;
  operationalCosts: Array<{
    item: string;
    monthlyCost: number;
  }>;
  revenue: {
    productPrice: number;
    ordersPerMonth: number;
  };
  taxes: {
    incomeTaxRate: number;
    socialInsuranceRate: number;
    reserveRate: number;
  };
  seasonalAdjustments: number[];
  startupPlan: {
    launchMonth: number;
    growthScenario: string;
  };
}

const getROIDataFromStorage = (): ROICalculatorData | null => {
  try {
    const stored = localStorage.getItem('roi-calculator-data');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const getDefaultROIData = (): ROICalculatorData => ({
  marketingCosts: [
    { channel: 'Google Ads', costs: Array(12).fill(10000) },
    { channel: 'Facebook Ads', costs: Array(12).fill(8000) },
    { channel: 'SEO', costs: Array(12).fill(5000) },
    { channel: 'Email Marketing', costs: Array(12).fill(2000) },
    { channel: 'Content Marketing', costs: Array(12).fill(3000) }
  ],
  operationalCosts: [
    { item: 'Nájem', monthlyCost: 15000 },
    { item: 'Mzdy', monthlyCost: 80000 },
    { item: 'Pojištění', monthlyCost: 3000 },
    { item: 'Software', monthlyCost: 5000 },
    { item: 'Ostatní', monthlyCost: 7000 }
  ],
  revenue: {
    productPrice: 500,
    ordersPerMonth: 100
  },
  taxes: {
    incomeTaxRate: 19,
    socialInsuranceRate: 13.5,
    reserveRate: 10
  },
  seasonalAdjustments: [0.9, 0.85, 1.0, 1.1, 1.2, 1.3, 1.1, 0.9, 1.0, 1.1, 1.2, 1.4],
  startupPlan: {
    launchMonth: 1,
    growthScenario: 'Moderate'
  }
});

const createInteractiveExcelFile = (data: ROICalculatorData): ArrayBuffer => {
  const workbook = XLSX.utils.book_new();
  
  // Sheet 1: Vstupní data (Inputs)
  const inputData = [
    ['ROI BUSINESS KALKULÁTOR', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['Interaktivní Excel verze', '', '', '', '', '', '', '', '', '', '', '', ''],
    [''],
    ['=== MARKETINGOVÉ NÁKLADY ==='],
    ['Kanál', 'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'],
    ...data.marketingCosts.map(cost => [cost.channel, ...cost.costs]),
    [''],
    ['=== PROVOZNÍ NÁKLADY ==='],
    ['Položka', 'Měsíční náklady (Kč)'],
    ...data.operationalCosts.map(cost => [cost.item, cost.monthlyCost]),
    [''],
    ['=== PŘÍJMY ==='],
    ['Cena produktu (Kč)', data.revenue.productPrice],
    ['Objednávky za měsíc', data.revenue.ordersPerMonth],
    [''],
    ['=== DANĚ A REZERVY ==='],
    ['Daň z příjmu (%)', data.taxes.incomeTaxRate],
    ['Sociální pojištění (%)', data.taxes.socialInsuranceRate],
    ['Rezervy (%)', data.taxes.reserveRate],
    [''],
    ['=== SEZÓNNÍ MULTIPLIKÁTORY ==='],
    ['Měsíc', 'Multiplikátor'],
    ...data.seasonalAdjustments.map((adj, i) => [`${i + 1}. měsíc`, adj]),
    [''],
    ['=== STARTUP PLÁN ==='],
    ['Měsíc spuštění', data.startupPlan.launchMonth],
    ['Růstový scénář', data.startupPlan.growthScenario]
  ];
  
  const inputSheet = XLSX.utils.aoa_to_sheet(inputData);
  XLSX.utils.book_append_sheet(workbook, inputSheet, 'Vstupní data');

  // Sheet 2: Kalkulace (Calculations)
  const calcData = [
    ['=== AUTOMATICKÉ VÝPOČTY ==='],
    [''],
    ['MĚSÍČNÍ ANALÝZA'],
    ['Měsíc', 'Hrubý příjem', 'Marketing náklady', 'Provozní náklady', 'Celkové náklady', 'Hrubý zisk', 'Zisk po daních'],
    ...Array(12).fill(0).map((_, i) => [
      `${i + 1}`,
      { f: `'Vstupní data'!M13*'Vstupní data'!N13*INDEX('Vstupní data'!B22:B33,${i + 1})` },
      { f: `SUM('Vstupní data'!B${6 + i}:M${6 + i})` },
      { f: `SUM('Vstupní data'!B10:B14)` },
      { f: `C${5 + i}+D${5 + i}` },
      { f: `B${5 + i}-E${5 + i}` },
      { f: `F${5 + i}*(1-('Vstupní data'!B17+'Vstupní data'!B18+'Vstupní data'!B19)/100)` }
    ]),
    [''],
    ['ROČNÍ SOUHRNY'],
    ['Celkový roční příjem', { f: 'SUM(B5:B16)' }],
    ['Celkové roční náklady', { f: 'SUM(E5:E16)' }],
    ['Roční zisk před zdaněním', { f: 'SUM(F5:F16)' }],
    ['Roční zisk po zdanění', { f: 'SUM(G5:G16)' }],
    [''],
    ['KPI METRIKY'],
    ['ROI (%)', { f: '(B21/B20)*100' }],
    ['Marže (%)', { f: '(B21/B19)*100' }],
    ['PNO (%)', { f: '(SUM(C5:C16)/B21)*100' }],
    ['Break-even měsíc', { f: 'MATCH(TRUE,F5:F16>0,0)' }]
  ];
  
  const calcSheet = XLSX.utils.aoa_to_sheet(calcData);
  XLSX.utils.book_append_sheet(workbook, calcSheet, 'Kalkulace');

  // Sheet 3: Dashboard (Results)
  const dashboardData = [
    ['ROI BUSINESS KALKULÁTOR - DASHBOARD'],
    [''],
    ['=== KLÍČOVÉ METRIKY ==='],
    ['Metrika', 'Hodnota', 'Status'],
    ['ROI', { f: "Kalkulace!B25&'%'" }, { f: 'IF(Kalkulace!B25>20,"✓ Výborné",IF(Kalkulace!B25>10,"⚠ Dobré","✗ Pozor"))' }],
    ['Marže', { f: "Kalkulace!B26&'%'" }, { f: 'IF(Kalkulace!B26>30,"✓ Výborné",IF(Kalkulace!B26>15,"⚠ Dobré","✗ Pozor"))' }],
    ['PNO', { f: "Kalkulace!B27&'%'" }, { f: 'IF(Kalkulace!B27<50,"✓ Výborné",IF(Kalkulace!B27<80,"⚠ Dobré","✗ Pozor"))' }],
    ['Break-even', { f: "Kalkulace!B28&'. měsíc'" }, { f: 'IF(Kalkulace!B28<=6,"✓ Rychle",IF(Kalkulace!B28<=12,"⚠ Střední","✗ Pomalé"))' }],
    [''],
    ['=== FINANČNÍ PŘEHLED ==='],
    ['Roční příjem', { f: 'Kalkulace!B19' }],
    ['Roční náklady', { f: 'Kalkulace!B20' }],
    ['Roční zisk', { f: 'Kalkulace!B22' }],
    [''],
    ['=== DOPORUČENÍ ==='],
    ['• Sledujte PNO - mělo by být pod 50%'],
    ['• ROI nad 20% je vynikající výsledek'],
    ['• Break-even do 6 měsíců je ideální'],
    ['• Pravidelně optimalizujte marketingové kanály']
  ];
  
  const dashboardSheet = XLSX.utils.aoa_to_sheet(dashboardData);
  XLSX.utils.book_append_sheet(workbook, dashboardSheet, 'Dashboard');

  // Sheet 4: Scénáře (Scenarios)
  const scenariosData = [
    ['SROVNÁNÍ SCÉNÁŘŮ'],
    [''],
    ['Scénář', 'Konzervativní (-20%)', 'Aktuální', 'Optimistický (+30%)'],
    ['Roční příjem', 
      { f: 'Kalkulace!B19*0.8' }, 
      { f: 'Kalkulace!B19' }, 
      { f: 'Kalkulace!B19*1.3' }
    ],
    ['Roční zisk', 
      { f: 'Kalkulace!B22*0.8' }, 
      { f: 'Kalkulace!B22' }, 
      { f: 'Kalkulace!B22*1.3' }
    ],
    ['ROI (%)', 
      { f: 'Kalkulace!B25*0.8' }, 
      { f: 'Kalkulace!B25' }, 
      { f: 'Kalkulace!B25*1.3' }
    ],
    [''],
    ['=== SENSITIVITY ANALÝZA ==='],
    ['Změna ceny produktu o:', '-20%', '-10%', '0%', '+10%', '+20%'],
    ['Dopad na roční zisk:', 
      { f: 'Kalkulace!B22*0.8' },
      { f: 'Kalkulace!B22*0.9' },
      { f: 'Kalkulace!B22' },
      { f: 'Kalkulace!B22*1.1' },
      { f: 'Kalkulace!B22*1.2' }
    ]
  ];
  
  const scenariosSheet = XLSX.utils.aoa_to_sheet(scenariosData);
  XLSX.utils.book_append_sheet(workbook, scenariosSheet, 'Scénáře');

  // Sheet 5: Instrukce
  const instructionsData = [
    ['NÁVOD K POUŽITÍ ROI KALKULÁTORU'],
    [''],
    ['=== JAK POUŽÍVAT ==='],
    ['1. Přejděte na list "Vstupní data"'],
    ['2. Upravte modré buňky podle vašich hodnot'],
    ['3. Výsledky se automaticky přepočítají'],
    ['4. Zkontrolujte "Dashboard" pro přehled'],
    ['5. Porovnejte scénáře na listu "Scénáře"'],
    [''],
    ['=== BAREVNÉ KÓDOVÁNÍ ==='],
    ['🔵 Modré buňky = Editovatelné hodnoty'],
    ['⚪ Bílé buňky = Vypočítané hodnoty'],
    ['🟢 Zelené = Dobré výsledky'],
    ['🟡 Žluté = Pozor, lze zlepšit'],
    ['🔴 Červené = Problém, nutná optimalizace'],
    [''],
    ['=== KLÍČOVÉ METRIKY ==='],
    ['ROI = Return on Investment (návratnost investice)'],
    ['PNO = Poměr nákladů na obrat'],
    ['Marže = Zisková marže v %'],
    ['Break-even = Měsíc dosažení zisku'],
    [''],
    ['=== TIPY PRO OPTIMALIZACI ==='],
    ['• Sledujte nejefektivnější marketingové kanály'],
    ['• Optimalizujte sezónní multiplikátory'],
    ['• Testujte různé cenové strategie'],
    ['• Kontrolujte provozní náklady'],
    [''],
    ['Vytvořeno: ' + new Date().toLocaleDateString('cs-CZ')]
  ];
  
  const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instrukce');

  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
};

const downloadExcelFile = (): void => {
  const roiData = getROIDataFromStorage() || getDefaultROIData();
  
  try {
    const arrayBuffer = createInteractiveExcelFile(roiData);
    const blob = new Blob([arrayBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = `roi-kalkulator-interaktivni-${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Chyba při vytváření Excel souboru:', error);
    throw new Error("Nepodařilo se vytvořit Excel soubor. Zkuste to prosím znovu.");
  }
};

export { downloadExcelFile };