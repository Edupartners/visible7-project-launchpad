import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Briefcase,
  CheckCircle2,
  Presentation,
  ScanSearch,
  Wallet,
} from "lucide-react";
import { SidebarLayout } from "@/components/layout/AppSidebar";
import { Kpi } from "@/components/business/Kpi";
import { MyDeadlines } from "@/components/deadlines/MyDeadlines";
import { useCashflowDemo } from "@/hooks/useCashflow";
import { ALERT_STYLE, czk, czkShort } from "@/lib/cashflow";

const TILES = [
  {
    to: "/cash-flow",
    icon: Wallet,
    title: "Cash flow",
    text: "Plán a skutečnost, výhled hotovosti na 13 týdnů a kam jdou peníze.",
    soon: true,
  },
  {
    to: "/digitalni-kancelar",
    icon: Briefcase,
    title: "Úřady a nástroje",
    text: "Datová schránka, daňové přiznání, ČSSZ, pojišťovna a ověřené nástroje na jednom místě.",
  },
  {
    to: "/rentgen?rezim=podnik",
    icon: ScanSearch,
    title: "Rentgen podniku",
    text: "Kde podnik ztrácí peníze a čas a co zlepšit jako první.",
  },
  {
    to: "/investor-pitch",
    icon: Presentation,
    title: "Pitch pro banku nebo investora",
    text: "Jedna strana A4 s velkými čísly z vašeho plánu a velikostí trhu.",
  },
];

/** Můj podnik – přehled pro ty, kdo už podnikají: peníze, termíny a nástroje na jednom místě. */
const MyBusinessPage = () => {
  const data = useCashflowDemo();
  const navigate = useNavigate();
  const { hash } = useLocation();

  useEffect(() => {
    document.title = "Můj podnik | VISIBLE7 MICEK";
  }, []);

  // Odkaz z menu „Termíny“ vede na #terminy.
  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" }), 300);
    return () => clearTimeout(t);
  }, [hash]);

  const next = data.outflows[0];

  return (
    <SidebarLayout>
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-8">
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Můj podnik</h1>
          <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
            Peníze, termíny a úřady na jednom místě. Co potřebuje pozornost, uvidíte hned nahoře.
          </p>
        </header>

        {/* Peníze */}
        <section aria-labelledby="penize" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="penize" className="text-xl font-bold">
              Peníze
            </h2>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-amber-800 ring-1 ring-amber-200">
              Ukázková data · napojení účtu připravujeme
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi hero label="Na účtu teď" value={`${czkShort(data.balance)} Kč`} note="ke konci minulého měsíce" />
            <Kpi label="Měsíční výsledek" value={`${czkShort(data.avgProfit)} Kč`} note="průměr 3 měsíců" />
            <Kpi label="Plnění plánu" value={`${Math.round(data.planShare)} %`} note="tržby proti byznys casu" />
            <Kpi
              label="Nejbližší platba"
              value={next ? `${czkShort(next.amount)} Kč` : "—"}
              note={
                next
                  ? `${new Date(next.date).toLocaleDateString("cs-CZ")} · ${next.title.split(":")[0]}`
                  : "žádná v 13 týdnech"
              }
            />
          </div>
          <Link
            to="/cash-flow"
            className={`group flex items-start gap-4 rounded-2xl p-5 ring-1 transition-shadow hover:shadow-md ${ALERT_STYLE[data.alert.level]}`}
          >
            {data.alert.level === "ok" ? (
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0" aria-hidden="true" />
            ) : (
              <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0" aria-hidden="true" />
            )}
            <span className="flex-1">
              <span className="block font-bold">{data.alert.title}</span>
              <span className="mt-1 block text-sm">
                Nejnižší odhadovaný stav v příštích 13 týdnech: {czk(data.low.balance)}.
              </span>
            </span>
            <span className="hidden shrink-0 items-center gap-1 self-center text-sm font-semibold sm:inline-flex">
              Cash flow <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </section>

        {/* Termíny */}
        <section id="terminy" aria-labelledby="terminy-h" className="scroll-mt-20 space-y-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-leaf-700" aria-hidden="true" />
            <h2 id="terminy-h" className="text-xl font-bold">
              Termíny
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Daně, pojištění a DPH podle toho, jak podnikáte. Týden předem vám pošleme e-mail s odkazem na správný
            portál.
          </p>
          <MyDeadlines onStart={() => navigate("/settings")} />
          <p className="text-xs text-muted-foreground">
            Termíny jsou orientační připomínka podle daňového kalendáře, ne daňové poradenství. U nejasností se poraďte
            se svou účetní.
          </p>
        </section>

        {/* Nástroje podniku */}
        <section aria-labelledby="nastroje-h" className="space-y-3">
          <h2 id="nastroje-h" className="text-xl font-bold">
            Nástroje pro váš podnik
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {TILES.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                className="group flex gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-leaf-400"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-leaf-50 text-leaf-700 transition-colors group-hover:bg-leaf-500 group-hover:text-white">
                  <t.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="flex-1">
                  <span className="flex items-center gap-2 font-bold">
                    {t.title}
                    {t.soon && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                        brzy
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{t.text}</span>
                </span>
                <ArrowUpRight
                  className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </section>
      </main>
    </SidebarLayout>
  );
};

export default MyBusinessPage;
