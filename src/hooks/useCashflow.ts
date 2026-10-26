import { useEffect, useMemo, useState } from "react";
import { useProject } from "@/contexts/ProjectContext";
import { loadProjectKeys } from "@/lib/projectData";
import { type BusinessCaseData, groupOf, simulate } from "@/lib/businessCase";
import { type Deadline, loadDeadlines, loadProfile, profileTags } from "@/lib/deadlines";
import {
  cashAlert,
  compare,
  demoActual,
  demoPlan,
  estimateOutflows,
  forecast13,
  lastMonths,
  planFromCase,
} from "@/lib/cashflow";

/**
 * Data pro Můj podnik a Cash flow. Dokud není napojení přes Sokordia Tech (funkce bank-sync),
 * je skutečnost ukázková; plán se bere z byznys casu aktuálního projektu, když existuje.
 */
export function useCashflowDemo() {
  const { currentProject } = useProject();
  const [caseData, setCaseData] = useState<BusinessCaseData | null>(null);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const [raw, profile, list] = await Promise.all([
        currentProject?.id ? loadProjectKeys(currentProject.id, ["business_case"]) : Promise.resolve({}),
        loadProfile(),
        loadDeadlines(100),
      ]);
      if (!active) return;
      const bc = (raw as Record<string, unknown>).business_case as BusinessCaseData | undefined;
      setCaseData(bc?.revenue && Array.isArray(bc.costs) ? bc : null);
      // Bez vyplněného profilu ukážeme termíny OSVČ s DPH, aby byl vidět princip.
      const tags = profile && profile.form !== "nezacal" ? profileTags(profile) : ["osvc_bezny", "dph"];
      setDeadlines(list.filter((d) => d.verified && d.audience.some((a) => tags.includes(a))));
      setLoaded(true);
    })();
    return () => {
      active = false;
    };
  }, [currentProject?.id]);

  return useMemo(() => {
    const months = lastMonths(12);
    const rows = caseData ? simulate(groupOf(currentProject?.business_type), caseData, 1) : null;
    const fromCase = !!rows && rows.some((r) => r.revenue > 0);
    const plan = fromCase && rows ? planFromCase(rows, months) : demoPlan(months);
    const actual = demoActual(plan);
    const cmp = compare(plan, actual);
    const outflows = estimateOutflows(deadlines, actual);
    const weeks = forecast13(actual, outflows);
    const alert = cashAlert(weeks, actual);
    const sum = (f: (r: (typeof cmp)[number]) => number) => cmp.reduce((s, r) => s + f(r), 0);
    const last3 = actual.slice(-3);
    const categories = Object.entries(
      last3.reduce<Record<string, number>>((acc, m) => {
        for (const [k, v] of Object.entries(m.by_category)) if (v < 0) acc[k] = (acc[k] ?? 0) + Math.abs(v) / 3;
        return acc;
      }, {}),
    ).sort((a, b) => b[1] - a[1]);
    return {
      loaded,
      fromCase,
      cmp,
      outflows,
      weeks,
      alert,
      balance: actual.at(-1)?.balance_end ?? 0,
      planShare: sum((r) => r.planIncome) ? (sum((r) => r.actualIncome) / sum((r) => r.planIncome)) * 100 : 0,
      avgProfit: last3.reduce((s, m) => s + m.income - m.expense, 0) / Math.max(1, last3.length),
      low: weeks.reduce((a, b) => (b.balance < a.balance ? b : a), weeks[0]),
      categories,
    };
  }, [caseData, deadlines, currentProject?.business_type, loaded]);
}
