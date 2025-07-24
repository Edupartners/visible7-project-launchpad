import { useState } from "react";
import { BackButton } from "@/components/ui/back-button";
import { Target, TrendingUp, BarChart3, Plus, Trash2, Download, PlayCircle, PieChart } from "lucide-react";
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, Tooltip, Legend, Pie as RechartsPie } from 'recharts';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { usePersistedState } from "@/hooks/usePersistedState";
import { LaunchData, ProductPerformance, ChannelPerformance } from "@/types/launch";

interface LaunchPhaseProps {
  onBack: () => void;
  onComplete: () => void;
}

export const LaunchPhase = ({ onBack, onComplete }: LaunchPhaseProps) => {
  const { toast } = useToast();
  
  const [launchData, setLaunchData] = usePersistedState<LaunchData>("launchData", {
    kpis: {
      target: { orders: 0, avgOrderValue: 0, visitors: 0, conversionRate: 0, cpc: 0, roas: 0 },
      actual: { orders: 0, avgOrderValue: 0, visitors: 0, conversionRate: 0, cpc: 0, roas: 0 }
    },
    products: [],
    channels: [],
    paretoAnalysis: { topProducts: [], recommendation: "" }
  });

  const [newProduct, setNewProduct] = useState({ 
    name: "", 
    unitsSold: 0, 
    pricePerUnit: 0, 
    directCosts: 0, 
    indirectCosts: 0, 
    conversionRate: 0 
  });
  const [newChannel, setNewChannel] = useState({ channel: "", cost: 0, revenue: 0, customers: 0 });

  const updateKPI = (type: 'target' | 'actual', field: string, value: number) => {
    setLaunchData(prev => ({
      ...prev,
      kpis: {
        ...prev.kpis,
        [type]: {
          ...prev.kpis[type],
          [field]: value
        }
      }
    }));
  };

  const addProduct = () => {
    if (!newProduct.name || newProduct.unitsSold <= 0 || newProduct.pricePerUnit <= 0) return;
    
    const revenue = newProduct.unitsSold * newProduct.pricePerUnit;
    const totalCosts = newProduct.directCosts + newProduct.indirectCosts;
    const profit = revenue - totalCosts;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
    
    const product: ProductPerformance = {
      id: Date.now().toString(),
      ...newProduct,
      revenue,
      profit,
      profitMargin,
      sales: newProduct.unitsSold // Keep for backward compatibility
    };
    
    setLaunchData(prev => ({
      ...prev,
      products: [...prev.products, product]
    }));
    
    setNewProduct({ 
      name: "", 
      unitsSold: 0, 
      pricePerUnit: 0, 
      directCosts: 0, 
      indirectCosts: 0, 
      conversionRate: 0 
    });
    performParetoAnalysis([...launchData.products, product]);
  };

  const removeProduct = (id: string) => {
    const updatedProducts = launchData.products.filter(p => p.id !== id);
    setLaunchData(prev => ({
      ...prev,
      products: updatedProducts
    }));
    performParetoAnalysis(updatedProducts);
  };

  const addChannel = () => {
    if (!newChannel.channel) return;
    
    const channel: ChannelPerformance = {
      id: Date.now().toString(),
      cpa: newChannel.customers > 0 ? newChannel.cost / newChannel.customers : 0,
      roi: newChannel.cost > 0 ? (newChannel.revenue / newChannel.cost) * 100 : 0,
      ...newChannel
    };
    
    setLaunchData(prev => ({
      ...prev,
      channels: [...prev.channels, channel]
    }));
    
    setNewChannel({ channel: "", cost: 0, revenue: 0, customers: 0 });
  };

  const removeChannel = (id: string) => {
    setLaunchData(prev => ({
      ...prev,
      channels: prev.channels.filter(c => c.id !== id)
    }));
  };

  const performParetoAnalysis = (products: ProductPerformance[]) => {
    if (products.length === 0) return;

    const sortedByProfit = products.sort((a, b) => b.profit - a.profit);
    const totalProfit = sortedByProfit.reduce((sum, p) => sum + p.profit, 0);
    
    let cumulativeProfit = 0;
    const topProducts: string[] = [];
    
    for (const product of sortedByProfit) {
      cumulativeProfit += product.profit;
      topProducts.push(product.name);
      
      if (cumulativeProfit >= totalProfit * 0.8) break;
    }
    
    const topProductsPercentage = (topProducts.length / products.length) * 100;
    let recommendation = "";
    
    if (topProductsPercentage <= 30) {
      recommendation = "✅ Vynikající! Jen několik produktů generuje většinu zisku. Zaměřte se na jejich škálování.";
    } else if (topProductsPercentage <= 50) {
      recommendation = "⚠️ Dobrý výsledek podle zisku, ale můžete optimalizovat náklady u méně ziskových produktů.";
    } else {
      recommendation = "🔄 Zisk je příliš rozptýlený. Doporučujeme se zaměřit na nejziskovější produkty a zvýšit marže u ostatních.";
    }
    
    setLaunchData(prev => ({
      ...prev,
      paretoAnalysis: { topProducts, recommendation }
    }));
  };

  const getKPIProgress = (target: number, actual: number) => {
    if (target === 0) return 0;
    return Math.min((actual / target) * 100, 100);
  };

  const getAIRecommendations = () => {
    const recommendations: string[] = [];
    
    // KPI análza
    const { target, actual } = launchData.kpis;
    if (actual.roas < 2) recommendations.push("⚠️ ROAS je nízký (< 2.0). Optimalizujte kampaně nebo zvyšte ceny.");
    if (actual.conversionRate < target.conversionRate * 0.5) recommendations.push("🔄 Konverzní poměr je pod 50% cíle. Testujte landing page.");
    if (actual.cpc > target.cpc * 1.5) recommendations.push("💰 CPC je vysoký. Zkuste jiné klíčová slova nebo cílení.");
    
    // Channel análza
    const topChannel = launchData.channels.sort((a, b) => b.roi - a.roi)[0];
    if (topChannel) recommendations.push(`🚀 Nejlepší kanál: ${topChannel.channel} (ROI: ${topChannel.roi.toFixed(1)}%). Škálujte!`);
    
    if (recommendations.length === 0) {
      recommendations.push("🎉 Výsledky vypadají dobře! Pokračujte v současné strategii.");
    }
    
    return recommendations;
  };

  const exportData = () => {
    const data = JSON.stringify(launchData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'launch-data.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data exportována",
      description: "Soubor s daty byl stažen."
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton onBack={onBack} />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                LAUNCH – Spusť svůj projekt do světa
              </h1>
              <p className="text-muted-foreground mt-2">
                Sleduj KPI, proveď Paretovu analýzu a optimalizuj marketingové kanály podle dat
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportData} className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button onClick={onComplete} className="gap-2">
              Dokončit fázi
              <Target className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="kpis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="kpis" className="gap-2">
              <Target className="w-4 h-4" />
              KPI Tracking
            </TabsTrigger>
            <TabsTrigger value="pareto" className="gap-2">
              <PieChart className="w-4 h-4" />
              Analýza produktů
            </TabsTrigger>
            <TabsTrigger value="channels" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Marketing kanály
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="gap-2">
              <PlayCircle className="w-4 h-4" />
              AI doporučení
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kpis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cílové KPI</CardTitle>
                  <CardDescription>Nastavte své cíle pro první měsíc</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Počet objednávek</Label>
                      <Input 
                        type="number" 
                        value={launchData.kpis.target.orders}
                        onChange={(e) => updateKPI('target', 'orders', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Průměrná cena objednávky (Kč)</Label>
                      <Input 
                        type="number" 
                        value={launchData.kpis.target.avgOrderValue}
                        onChange={(e) => updateKPI('target', 'avgOrderValue', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Počet návštěvníků</Label>
                      <Input 
                        type="number" 
                        value={launchData.kpis.target.visitors}
                        onChange={(e) => updateKPI('target', 'visitors', Number(e.target.value))}
                      />
                    </div>
                     <div>
                       <Label>Konverzní poměr (%) - objednávky/návštěvníci</Label>
                       <Input 
                         type="number" 
                         step="0.01"
                         value={launchData.kpis.target.conversionRate}
                         onChange={(e) => updateKPI('target', 'conversionRate', Number(e.target.value))}
                         placeholder="Např. 2.5 pro 2.5%"
                       />
                     </div>
                    <div>
                      <Label>CPC (Kč)</Label>
                      <Input 
                        type="number" 
                        step="0.1"
                        value={launchData.kpis.target.cpc}
                        onChange={(e) => updateKPI('target', 'cpc', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>ROAS</Label>
                      <Input 
                        type="number" 
                        step="0.1"
                        value={launchData.kpis.target.roas}
                        onChange={(e) => updateKPI('target', 'roas', Number(e.target.value))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skutečné výsledky</CardTitle>
                  <CardDescription>Zadejte reálná čísla z vašich kampaní</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Počet objednávek</Label>
                      <Input 
                        type="number" 
                        value={launchData.kpis.actual.orders}
                        onChange={(e) => updateKPI('actual', 'orders', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Průměrná cena objednávky (Kč)</Label>
                      <Input 
                        type="number" 
                        value={launchData.kpis.actual.avgOrderValue}
                        onChange={(e) => updateKPI('actual', 'avgOrderValue', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Počet návštěvníků</Label>
                      <Input 
                        type="number" 
                        value={launchData.kpis.actual.visitors}
                        onChange={(e) => updateKPI('actual', 'visitors', Number(e.target.value))}
                      />
                    </div>
                     <div>
                       <Label>Konverzní poměr (%) - skutečný</Label>
                       <Input 
                         type="number" 
                         step="0.01"
                         value={launchData.kpis.actual.conversionRate}
                         onChange={(e) => updateKPI('actual', 'conversionRate', Number(e.target.value))}
                         placeholder="Vypočítá se automaticky: objednávky/návštěvníci"
                       />
                     </div>
                    <div>
                      <Label>CPC (Kč)</Label>
                      <Input 
                        type="number" 
                        step="0.1"
                        value={launchData.kpis.actual.cpc}
                        onChange={(e) => updateKPI('actual', 'cpc', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>ROAS</Label>
                      <Input 
                        type="number" 
                        step="0.1"
                        value={launchData.kpis.actual.roas}
                        onChange={(e) => updateKPI('actual', 'roas', Number(e.target.value))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Přehled plnění KPI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { key: 'orders', label: 'Objednávky', unit: '' },
                    { key: 'avgOrderValue', label: 'Průměrná cena', unit: 'Kč' },
                    { key: 'visitors', label: 'Návštěvníci', unit: '' },
                    { key: 'conversionRate', label: 'Konverze', unit: '%' },
                    { key: 'cpc', label: 'CPC', unit: 'Kč' },
                    { key: 'roas', label: 'ROAS', unit: '' }
                  ].map(({ key, label, unit }) => {
                    const target = launchData.kpis.target[key as keyof typeof launchData.kpis.target];
                    const actual = launchData.kpis.actual[key as keyof typeof launchData.kpis.actual];
                    const progress = getKPIProgress(target, actual);
                    
                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{label}</span>
                          <Badge variant={progress >= 100 ? "default" : progress >= 50 ? "secondary" : "destructive"}>
                            {progress.toFixed(0)}%
                          </Badge>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Skutečné: {actual} {unit}</span>
                          <span>Cíl: {target} {unit}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pareto" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Přidat produkt/službu</CardTitle>
                  <CardDescription>Zadejte detailní informace o produktu včetně nákladů</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Název produktu/služby</Label>
                    <Input 
                      value={newProduct.name}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Např. Základní balíček"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Prodeje</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Počet prodaných kusů</Label>
                        <Input 
                          type="number"
                          value={newProduct.unitsSold}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, unitsSold: Number(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <Label>Cena za kus (Kč)</Label>
                        <Input 
                          type="number"
                          value={newProduct.pricePerUnit}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, pricePerUnit: Number(e.target.value) }))}
                        />
                      </div>
                    </div>
                    <div className="p-2 bg-muted rounded text-sm">
                      <strong>Tržby: {(newProduct.unitsSold * newProduct.pricePerUnit).toLocaleString()} Kč</strong>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Náklady</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Přímé náklady (Kč)</Label>
                        <Input 
                          type="number"
                          value={newProduct.directCosts}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, directCosts: Number(e.target.value) }))}
                          placeholder="Materiál, výroba..."
                        />
                      </div>
                      <div>
                        <Label>Nepřímé náklady (Kč)</Label>
                        <Input 
                          type="number"
                          value={newProduct.indirectCosts}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, indirectCosts: Number(e.target.value) }))}
                          placeholder="Marketing, režie..."
                        />
                      </div>
                    </div>
                    <div className="p-2 bg-muted rounded text-sm space-y-1">
                      <div><strong>Celkové náklady: {(newProduct.directCosts + newProduct.indirectCosts).toLocaleString()} Kč</strong></div>
                      <div className="text-primary"><strong>Zisk: {((newProduct.unitsSold * newProduct.pricePerUnit) - (newProduct.directCosts + newProduct.indirectCosts)).toLocaleString()} Kč</strong></div>
                      <div className="text-xs text-muted-foreground">
                        Marže: {newProduct.unitsSold * newProduct.pricePerUnit > 0 ? 
                          (((newProduct.unitsSold * newProduct.pricePerUnit - newProduct.directCosts - newProduct.indirectCosts) / (newProduct.unitsSold * newProduct.pricePerUnit)) * 100).toFixed(1)
                          : 0}%
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Konverzní poměr (%)</Label>
                    <Input 
                      type="number"
                      step="0.1"
                      value={newProduct.conversionRate}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, conversionRate: Number(e.target.value) }))}
                      placeholder="Volitelné"
                    />
                  </div>
                  
                  <Button 
                    onClick={addProduct} 
                    className="w-full gap-2"
                    disabled={!newProduct.name || newProduct.unitsSold <= 0 || newProduct.pricePerUnit <= 0}
                  >
                    <Plus className="w-4 h-4" />
                    Přidat produkt
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Paretova analýza</CardTitle>
                  <CardDescription>Které produkty generují 80% zisku?</CardDescription>
                </CardHeader>
                <CardContent>
                  {launchData.products.length > 0 ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm">{launchData.paretoAnalysis.recommendation}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Top produkty (generující 80% zisku):</h4>
                        <div className="flex flex-wrap gap-2">
                          {launchData.paretoAnalysis.topProducts.map((product, index) => (
                            <Badge key={index} variant="default">
                              {product}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Přidejte produkty pro Paretovu analýzu
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vizualizace výkonu</CardTitle>
                  <CardDescription>Podíl produktů na celkových výsledcích</CardDescription>
                </CardHeader>
                <CardContent>
                  {launchData.products.length > 0 ? (
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-3">Podíl na tržbách</h4>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <RechartsPie
                                data={launchData.products.map(p => ({
                                  name: p.name,
                                  value: p.revenue,
                                  color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`
                                }))}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                dataKey="value"
                                label={(entry) => `${entry.name}: ${((entry.value / launchData.products.reduce((sum, p) => sum + p.revenue, 0)) * 100).toFixed(1)}%`}
                              >
                                {launchData.products.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={`hsl(${(index * 137.5) % 360}, 70%, 50%)`} />
                                ))}
                              </RechartsPie>
                              <Tooltip formatter={(value: number) => [`${value.toLocaleString()} Kč`, 'Tržby']} />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Podíl na zisku</h4>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <RechartsPie
                                data={launchData.products.map(p => ({
                                  name: p.name,
                                  value: p.profit,
                                  color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`
                                }))}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                dataKey="value"
                                label={(entry) => `${entry.name}: ${((entry.value / launchData.products.reduce((sum, p) => sum + p.profit, 0)) * 100).toFixed(1)}%`}
                              >
                                {launchData.products.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={`hsl(${(index * 137.5 + 60) % 360}, 70%, 50%)`} />
                                ))}
                              </RechartsPie>
                              <Tooltip formatter={(value: number) => [`${value.toLocaleString()} Kč`, 'Zisk']} />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Přidejte produkty pro vizualizaci
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Detailní přehled produktů</CardTitle>
                <CardDescription>Kompletní finanční analýza všech produktů</CardDescription>
              </CardHeader>
              <CardContent>
                {launchData.products.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produkt</TableHead>
                          <TableHead>Kusy</TableHead>
                          <TableHead>Cena/kus</TableHead>
                          <TableHead>Tržby</TableHead>
                          <TableHead>Náklady</TableHead>
                          <TableHead>Zisk</TableHead>
                          <TableHead>Marže</TableHead>
                          <TableHead>Konverze</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...launchData.products].sort((a, b) => b.profit - a.profit).map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.unitsSold}</TableCell>
                            <TableCell>{product.pricePerUnit?.toLocaleString() || 0} Kč</TableCell>
                            <TableCell>{product.revenue.toLocaleString()} Kč</TableCell>
                            <TableCell>{((product.directCosts || 0) + (product.indirectCosts || 0)).toLocaleString()} Kč</TableCell>
                            <TableCell className={product.profit > 0 ? "text-green-600" : "text-red-600"}>
                              {product.profit?.toLocaleString() || 0} Kč
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                (product.profitMargin || 0) > 30 ? "default" : 
                                (product.profitMargin || 0) > 15 ? "secondary" : 
                                "destructive"
                              }>
                                {product.profitMargin?.toFixed(1) || 0}%
                              </Badge>
                            </TableCell>
                            <TableCell>{product.conversionRate || 0}%</TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => removeProduct(product.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Zatím nejsou přidány žádné produkty
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="channels" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Přidat marketingový kanál</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Název kanálu</Label>
                    <Input 
                      value={newChannel.channel}
                      onChange={(e) => setNewChannel(prev => ({ ...prev, channel: e.target.value }))}
                      placeholder="Např. Google Ads, Facebook Ads"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Náklady (Kč)</Label>
                      <Input 
                        type="number"
                        value={newChannel.cost}
                        onChange={(e) => setNewChannel(prev => ({ ...prev, cost: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label>Tržby (Kč)</Label>
                      <Input 
                        type="number"
                        value={newChannel.revenue}
                        onChange={(e) => setNewChannel(prev => ({ ...prev, revenue: Number(e.target.value) }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Počet zákazníků</Label>
                    <Input 
                      type="number"
                      value={newChannel.customers}
                      onChange={(e) => setNewChannel(prev => ({ ...prev, customers: Number(e.target.value) }))}
                    />
                  </div>
                  <Button onClick={addChannel} className="w-full gap-2">
                    <Plus className="w-4 h-4" />
                    Přidat kanál
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Nejlepší kanály</CardTitle>
                  <CardDescription>Kanály seřazené podle ROI</CardDescription>
                </CardHeader>
                <CardContent>
                  {launchData.channels.length > 0 ? (
                    <div className="space-y-3">
                      {launchData.channels
                        .sort((a, b) => b.roi - a.roi)
                        .slice(0, 3)
                        .map((channel, index) => (
                          <div key={channel.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant={index === 0 ? "default" : "secondary"}>
                                  #{index + 1}
                                </Badge>
                                <span className="font-medium">{channel.channel}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                CPA: {channel.cpa.toLocaleString()} Kč
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-primary">
                                {channel.roi.toFixed(1)}% ROI
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Přidejte kanály pro analýzu
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Výkonnost marketingových kanálů</CardTitle>
              </CardHeader>
              <CardContent>
                {launchData.channels.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kanál</TableHead>
                        <TableHead>Náklady (Kč)</TableHead>
                        <TableHead>Tržby (Kč)</TableHead>
                        <TableHead>Zákazníci</TableHead>
                        <TableHead>CPA (Kč)</TableHead>
                        <TableHead>ROI (%)</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {launchData.channels.map((channel) => (
                        <TableRow key={channel.id}>
                          <TableCell className="font-medium">{channel.channel}</TableCell>
                          <TableCell>{channel.cost.toLocaleString()} Kč</TableCell>
                          <TableCell>{channel.revenue.toLocaleString()} Kč</TableCell>
                          <TableCell>{channel.customers}</TableCell>
                          <TableCell>{channel.cpa.toLocaleString()} Kč</TableCell>
                          <TableCell>
                            <Badge variant={channel.roi >= 200 ? "default" : channel.roi >= 100 ? "secondary" : "destructive"}>
                              {channel.roi.toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeChannel(channel.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Zatím nejsou přidány žádné kanály
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="w-5 h-5" />
                  AI doporučení a další kroky
                </CardTitle>
                <CardDescription>
                  Automatická analýza vašich dat s konkrétními doporučeními pro optimalizaci
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getAIRecommendations().map((recommendation, index) => (
                    <div key={index} className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                      <p>{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📌 Tipy a varování</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-green-500 font-bold">✅</span>
                    <p>Rozhoduj podle dat, ne pocitů.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-amber-500 font-bold">⏳</span>
                    <p>Nehodnoť reklamu dřív než po 14 dnech běhu.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-red-500 font-bold">🚫</span>
                    <p>Neporovnávej se s konkurencí – sleduj jen vlastní vývoj.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-blue-500 font-bold">♻️</span>
                    <p>Pokud nejsi spokojen/a s výsledky, vrať se do fáze TESTING.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-purple-500 font-bold">🔁</span>
                    <p>Sleduj opakovaně, které kanály konvertují, a ty škáluj.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🧩 Doporučení pro další krok</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p>• Vyber si 1–2 top produkty a vytvoř na ně samostatné kampaně.</p>
                  <p>• Otestuj nový text, banner nebo cílovou skupinu.</p>
                  <p>• Připrav plán pro fázi EXPANSION – růstové aktivity a budování týmu.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="w-5 h-5" />
                  BONUS: Video průvodce
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <PlayCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Jak spustit první kampaň a co sledovat (15 min)
                    </p>
                    <Button variant="outline" className="mt-4">
                      Spustit video
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};