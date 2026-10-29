import { useCallback, useEffect, useMemo, useState } from "react";
import { type BankConnection, type BankMonth, loadBankData, mergeMonths } from "@/lib/bank";
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
  TRANSFER_CATEGORIES,
} from "@/lib/cashflow";

/**
 * Data pro Můj podnik a Cash flow. Skutečnost je z napojeného účtu (Goodveri, funkce bank-sync),
 * bez něj ukázková; plán se bere z byznys casu aktuálního projektu, když existuje.
 */
export function useCashflowDemo() {
  const { currentProject } = useProject();
  const [caseData, setCaseData] = useState<BusinessCaseData | null>(null);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [bank, setBank] = useState<{ connections: BankConnection[]; months: BankMonth[] }>({
    connections: [],
    months: [],
  });
  const reloadBank = useCallback(async () => setBank(await loadBankData()), []);
  useEffect(() => {
    reloadBank();
  }, [reloadBank]);

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
    const activeIds = new Set(bank.connections.filter((c) => c.status !== "pending").map((c) => c.id));
    const real = bank.months.some((m) => activeIds.has(m.connection_id) && months.includes(m.month));
    const actual = real ? mergeMonths(bank.months, months, activeIds) : demoActual(plan);
    const cmp = compare(plan, actual);
    const outflows = estimateOutflows(deadlines, actual);
    const weeks = forecast13(actual, outflows);
    const alert = cashAlert(weeks, actual);
    const sum = (f: (r: (typeof cmp)[number]) => number) => cmp.reduce((s, r) => s + f(r), 0);
    const last3 = actual.slice(-3);
    const categories = Object.entries(
      last3.reduce<Record<string, number>>((acc, m) => {
        for (const [k, v] of Object.entries(m.by_category))
          if (v < 0 && !TRANSFER_CATEGORIES.includes(k)) acc[k] = (acc[k] ?? 0) + Math.abs(v) / 3;
        return acc;
      }, {}),
    ).sort((a, b) => b[1] - a[1]);
    return {
      loaded,
      real,
      connections: bank.connections,
      bankMonths: bank.months,
      reloadBank,
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
  }, [caseData, deadlines, currentProject?.business_type, loaded, bank, reloadBank]);
}
