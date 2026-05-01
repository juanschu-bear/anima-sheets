// Dashboard view, ported to ES modules.
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { t, useLang, setLang, getLang, tRow, localizedMonthLabel } from "./i18n.js";
import {
  MONTHS, CATEGORY_DEFS, CATEGORY_HUE, catColor, catLabel,
  euro, easeOutCubic, LEDGER,
} from "./data.js";
import { useAuth, AuthGate, ProfileMenu } from "./Auth.jsx";
import { Spreadsheet } from "./Spreadsheet.jsx";
import { ImportView } from "./Import.jsx";
import { AskButton, AskModal } from "./Nlq.jsx";
import { useLiveCfoFeed } from "./liveCfo.js";

function useCountUp(target, { duration = 1200, decimals = 0, trigger = 0 } = {}) {
  const [value, setValue] = useState(0);
  const startRef = useRef(null), rafRef = useRef(null), fromRef = useRef(0);
  useEffect(() => {
    fromRef.current = 0; startRef.current = null;
    cancelAnimationFrame(rafRef.current);
    const tick = (ts) => {
      if (startRef.current == null) startRef.current = ts;
      const p = Math.min(1, (ts - startRef.current) / duration);
      const eased = easeOutCubic(p);
      setValue(fromRef.current + (target - fromRef.current) * eased);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, trigger]);
  const f = Math.pow(10, decimals);
  return Math.round(value * f) / f;
}

function AnimatedEuro({ value, decimals = 0, duration = 1100, trigger, className = "" }) {
  const v = useCountUp(value, { duration, decimals, trigger });
  return <span className={`tabular-nums ${className}`} style={{ fontVariantNumeric: "tabular-nums" }}>{euro(v, { decimals })}</span>;
}

function useTheme() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark"); else root.classList.remove("dark");
  }, [dark]);
  return [dark, setDark];
}

export default function App() {
  useLang();
  const [dark, setDark] = useTheme();
  const { user, signIn, signOut, loading } = useAuth();
  const [monthIdx, setMonthIdx] = useState(MONTHS.length - 1);
  const [tab, setTab] = useState("dashboard");
  const [sortKey, setSortKey] = useState("amount");
  const [sortDir, setSortDir] = useState("desc");
  const [activePie, setActivePie] = useState(null);
  const [askOpen, setAskOpen] = useState(false);
  const liveCfo = useLiveCfoFeed();

  useEffect(() => {
    if (!user) return;
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setAskOpen(o => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [user]);

  if (loading) return null;
  if (!user) return <AuthGate onSignIn={signIn} />;

  const month = MONTHS[monthIdx];
  const monthLabel = localizedMonthLabel(month.key);
  const net = month.income - month.expenses;

  const expenseCats = CATEGORY_DEFS
    .filter(c => c.kind === "expense" && c.amount > 0)
    .map(c => ({ ...c, label: catLabel(c.key), color: catColor(c.key) }));

  const totalExpenseCat = expenseCats.reduce((s, c) => s + c.amount, 0);

  const sortedCats = useMemo(() => {
    const arr = [...expenseCats];
    arr.sort((a, b) => {
      if (sortKey === "label") return sortDir === "asc" ? a.label.localeCompare(b.label) : b.label.localeCompare(a.label);
      return sortDir === "asc" ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey];
    });
    return arr;
  }, [sortKey, sortDir, expenseCats.length, getLang()]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir(key === "label" ? "asc" : "desc"); }
  };

  const locale = getLang() === "de" ? "de-DE" : getLang() === "es" ? "es-ES" : "en-GB";
  const nowStr = new Date().toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] transition-colors duration-500 relative overflow-hidden">
      <AmbientGlow />
      <Header tab={tab} setTab={setTab} dark={dark} setDark={setDark} user={user} onSignOut={signOut} />
      <main className="relative max-w-[1400px] mx-auto px-6 md:px-10 pb-24">
        {tab === "dashboard" && (
          <DashboardView
            monthIdx={monthIdx} setMonthIdx={setMonthIdx} month={month} monthLabel={monthLabel}
            headlineIncome={month.income} headlineExpenses={month.expenses} headlineNet={net}
            expenseCats={expenseCats} totalExpenseCat={totalExpenseCat}
            activePie={activePie} setActivePie={setActivePie}
            sortedCats={sortedCats} sortKey={sortKey} sortDir={sortDir} toggleSort={toggleSort}
            user={user}
            liveCfo={liveCfo}
          />
        )}
        {tab === "intelligence" && <ViewShell title="CFO Intelligence" subtitle="Behavior, risk and actionable insights"><CfoIntelligenceView liveCfo={liveCfo} /></ViewShell>}
        {tab === "spreadsheet" && <ViewShell title={t("tab_spreadsheet")} subtitle={t("app_tagline")}><Spreadsheet /></ViewShell>}
        {tab === "import"      && <ViewShell title={t("tab_import")}      subtitle={t("app_tagline")}><ImportView /></ViewShell>}
      </main>
      <Footer stamp={nowStr} />
      <AskButton onClick={() => setAskOpen(true)} />
      {askOpen && <AskModal onClose={() => setAskOpen(false)} />}
    </div>
  );
}

function AmbientGlow() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
      <div className="orb orb-a" /><div className="orb orb-b" /><div className="grid-fade" />
    </div>
  );
}

function ViewShell({ title, subtitle, children }) {
  return (
    <div>
      <div className="pt-8 md:pt-10 pb-6 anim-in">
        <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)] mb-2">{subtitle}</div>
        <h1 className="text-3xl md:text-[40px] leading-[1.05] font-semibold tracking-tight">{title}</h1>
      </div>
      {children}
    </div>
  );
}

function DashboardView({ monthIdx, setMonthIdx, month, monthLabel, headlineIncome, headlineExpenses, headlineNet, expenseCats, totalExpenseCat, activePie, setActivePie, sortedCats, sortKey, sortDir, toggleSort, user, liveCfo }) {
  const transactions = LEDGER.slice(0, 5).map(row => ({ date: row.date, desc: tRow(row).desc, amount: row.amount, cat: row.cat }));
  return (
    <>
      <TitleRow monthIdx={monthIdx} setMonthIdx={setMonthIdx} monthLabel={monthLabel} user={user} />
      <LiveCfoPanel liveCfo={liveCfo} />
      <KpiGrid income={headlineIncome} expenses={headlineExpenses} net={headlineNet} trigger={monthIdx} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
        <div className="lg:col-span-2 anim-in" style={{ animationDelay: "120ms" }}>
          <TrendChart months={MONTHS} activeIdx={monthIdx} onSelect={setMonthIdx} trigger={monthIdx} />
        </div>
        <div className="anim-in" style={{ animationDelay: "200ms" }}>
          <CategoryDonut data={expenseCats} total={totalExpenseCat} active={activePie} setActive={setActivePie} trigger={monthIdx} />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mt-5">
        <div className="lg:col-span-3 anim-in" style={{ animationDelay: "280ms" }}>
          <CategoryTable cats={sortedCats} total={totalExpenseCat} sortKey={sortKey} sortDir={sortDir} toggleSort={toggleSort} activeKey={activePie?.key} onHover={(k) => setActivePie(k ? expenseCats.find(c => c.key === k) : null)} />
        </div>
        <div className="lg:col-span-2 anim-in" style={{ animationDelay: "340ms" }}>
          <RecentTransactions txs={transactions} />
        </div>
      </div>
    </>
  );
}

function LiveCfoPanel({ liveCfo }) {
  if (!liveCfo?.enabled) {
    return null;
  }
  const recent = (liveCfo.rows || []).slice(-6).reverse();
  return (
    <Card title="Live CFO Feed" subtitle="WhatsAnima -> Anima Drive -> Anima Sheets sync">
      {liveCfo.loading ? (
        <div className="text-sm text-[var(--muted)]">Loading latest transactions from CFO sheet...</div>
      ) : liveCfo.error ? (
        <div className="text-sm text-[var(--neg)]">Live feed unavailable: {liveCfo.error}</div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xl border border-[var(--line)] bg-[var(--surface2)] p-3">
              <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">Synced Receipts</div>
              <div className="mt-1 text-xl font-semibold tabular-nums">{liveCfo.summary.totalRows}</div>
            </div>
            <div className="rounded-xl border border-[var(--line)] bg-[var(--surface2)] p-3">
              <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">Spend 30d</div>
              <div className="mt-1 text-xl font-semibold tabular-nums">{euro(liveCfo.summary.totalSpend30d || 0, { decimals: 2 })}</div>
            </div>
            <div className="rounded-xl border border-[var(--line)] bg-[var(--surface2)] p-3">
              <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">Top Category</div>
              <div className="mt-1 text-base font-semibold truncate">{liveCfo.summary.topCategories?.[0]?.label || "n/a"}</div>
            </div>
          </div>
          <ul className="divide-y divide-[var(--line)]">
            {recent.length === 0 ? (
              <li className="py-2 text-sm text-[var(--muted)]">No live rows yet.</li>
            ) : (
              recent.map((row, idx) => (
                <li key={`${row.transactionDate || "d"}-${row.merchant || "m"}-${idx}`} className="py-2 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{row.merchant || "Unknown merchant"}</div>
                    <div className="text-xs text-[var(--muted)] truncate">
                      {(row.transactionDate || "Unknown date")} · {(row.category || "other").replace(/_/g, " ")}
                    </div>
                  </div>
                  <div className="text-sm font-semibold tabular-nums">{euro(Number(row.totalAmount || 0), { decimals: 2 })}</div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </Card>
  );
}

function Header({ tab, setTab, dark, setDark, user, onSignOut }) {
  const tabs = [
    { key: "dashboard",   label: t("tab_dashboard") },
    { key: "intelligence", label: "CFO Intelligence" },
    { key: "spreadsheet", label: t("tab_spreadsheet") },
    { key: "import",      label: t("tab_import") },
  ];
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--bg)]/70 border-b border-[var(--line)]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Mark />
          <div className="flex items-baseline gap-2 min-w-0">
            <span className="font-semibold tracking-tight text-[15px]">Anima Sheets</span>
            <span className="text-[var(--muted)] text-[13px] hidden sm:inline">, {t("app_tagline")}</span>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-full border border-[var(--line)] bg-[var(--surface)]">
          {tabs.map(tb => (
            <button key={tb.key} onClick={() => setTab(tb.key)} className={`relative px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors ${tab === tb.key ? "text-[var(--bg)]" : "text-[var(--muted)] hover:text-[var(--fg)]"}`}>
              {tab === tb.key && <span className="absolute inset-0 rounded-full bg-[var(--fg)] transition-all" />}
              <span className="relative">{tb.label}</span>
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LangSwitcher />
          <ThemeToggle dark={dark} setDark={setDark} />
          {user && <ProfileMenu user={user} onSignOut={onSignOut} />}
        </div>
      </div>
    </header>
  );
}

function CfoIntelligenceView({ liveCfo }) {
  const rows = liveCfo?.rows || [];
  const spend30 = Number(liveCfo?.summary?.totalSpend30d || 0);
  const intensity = spend30 > 8000 ? "High" : spend30 > 3000 ? "Medium" : "Low";
  const top = liveCfo?.summary?.topCategories?.[0];
  const recent = rows.slice(-10).reverse();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <Card title="Financial Behavior" subtitle="Live-derived profile">
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between"><span className="text-[var(--muted)]">Spend intensity</span><span className="font-semibold">{intensity}</span></div>
          <div className="flex items-center justify-between"><span className="text-[var(--muted)]">30d spend</span><span className="font-semibold tabular-nums">{euro(spend30, { decimals: 2 })}</span></div>
          <div className="flex items-center justify-between"><span className="text-[var(--muted)]">Top category</span><span className="font-semibold">{top?.label || "n/a"}</span></div>
        </div>
      </Card>
      <Card title="Signals" subtitle="Auto-detected from recent receipts">
        <ul className="space-y-2 text-sm">
          <li className="rounded-lg border border-[var(--line)] p-2">Dependency risk: {top && top.amount > spend30 * 0.55 ? "Elevated" : "Normal"}</li>
          <li className="rounded-lg border border-[var(--line)] p-2">Data quality: {rows.some((r) => !r.merchant || !r.transactionDate) ? "Needs cleanup" : "Healthy"}</li>
          <li className="rounded-lg border border-[var(--line)] p-2">Flow continuity: {rows.length >= 5 ? "Consistent" : "Insufficient history"}</li>
        </ul>
      </Card>
      <Card title="Recommendations" subtitle="Next best CFO actions">
        <ol className="space-y-2 text-sm list-decimal pl-4">
          <li>Review receipts missing clear merchant/date and correct metadata.</li>
          <li>Set spend cap alerts for top category if concentration stays above 55%.</li>
          <li>Keep captioning strategic receipts so Jordan can respond contextually.</li>
        </ol>
      </Card>
      <div className="lg:col-span-3">
        <Card title="Recent CFO Events" subtitle="Last 10 synchronized transactions">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] text-[var(--muted)]">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Merchant</th>
                  <th className="text-left py-2">Category</th>
                  <th className="text-right py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r, idx) => (
                  <tr key={`${r.transactionDate || "d"}-${idx}`} className="border-b border-[var(--line)]/50">
                    <td className="py-2">{r.transactionDate || "-"}</td>
                    <td className="py-2">{r.merchant || "-"}</td>
                    <td className="py-2">{(r.category || "other").replace(/_/g, " ")}</td>
                    <td className="py-2 text-right tabular-nums">{euro(Number(r.totalAmount || 0), { decimals: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function LangSwitcher() {
  const current = useLang();
  const [open, setOpen] = useState(false);
  const LABELS = { en: "EN", de: "DE", es: "ES" };
  const NAMES = { en: "English", de: "Deutsch", es: "Español" };
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="h-9 px-3 inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-[12px] font-semibold tracking-wider transition-colors">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" strokeLinecap="round" />
        </svg>
        {LABELS[current]}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-40 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] shadow-2xl p-1 z-40 anim-in-fast">
            {Object.entries(NAMES).map(([code, name]) => (
              <button key={code} onClick={() => { setLang(code); setOpen(false); }} className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[12.5px] transition-colors ${current === code ? "bg-[var(--surface2)] font-semibold" : "hover:bg-[var(--surface2)]"}`}>
                <span>{name}</span>
                <span className="text-[10px] text-[var(--muted)] tabular-nums">{LABELS[code]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Mark() {
  return (
    <div className="h-8 w-8 rounded-lg bg-[var(--fg)] text-[var(--bg)] grid place-items-center relative overflow-hidden mark-pulse">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
        <path d="M5 19 L12 5 L19 19" /><path d="M8 14 H16" />
      </svg>
    </div>
  );
}

function ThemeToggle({ dark, setDark }) {
  return (
    <button onClick={() => setDark(!dark)} className="h-9 w-9 grid place-items-center rounded-full border border-[var(--line)] hover:bg-[var(--surface)] transition-colors" aria-label="Toggle theme">
      {dark ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round"/></svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
      )}
    </button>
  );
}

function TitleRow({ monthIdx, setMonthIdx, monthLabel, user }) {
  const hour = new Date().getHours();
  const gKey = hour < 12 ? "greet_morning_x" : hour < 18 ? "greet_afternoon_x" : "greet_evening_x";
  const firstName = user ? String(user.name).split(/\s+/)[0] : "";
  return (
    <div className="pt-8 md:pt-10 pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-5 anim-in">
      <div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)] mb-2">{t("overview")}</div>
        <h1 className="text-3xl md:text-[40px] leading-[1.05] font-semibold tracking-tight">{user ? t(gKey, { name: firstName }) : t("greet_morning")}</h1>
        <p className="text-[var(--muted)] mt-2 text-[15px] max-w-xl">{t("dash_sub", { m: monthLabel })}</p>
      </div>
      <div className="flex items-center gap-3">
        <MonthSelector monthIdx={monthIdx} setMonthIdx={setMonthIdx} />
        <QuickActions />
      </div>
    </div>
  );
}

function MonthSelector({ monthIdx, setMonthIdx }) {
  const canPrev = monthIdx > 0, canNext = monthIdx < MONTHS.length - 1;
  return (
    <div className="flex items-center gap-1 p-1 rounded-full border border-[var(--line)] bg-[var(--surface)]">
      <button disabled={!canPrev} onClick={() => canPrev && setMonthIdx(monthIdx - 1)} className="h-8 w-8 grid place-items-center rounded-full hover:bg-[var(--surface2)] disabled:opacity-30 disabled:pointer-events-none transition-colors" aria-label={t("prev_month")}>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M15 6l-6 6 6 6"/></svg>
      </button>
      <div className="px-3 text-[13px] font-medium tabular-nums min-w-[96px] text-center">{localizedMonthLabel(MONTHS[monthIdx].key)}</div>
      <button disabled={!canNext} onClick={() => canNext && setMonthIdx(monthIdx + 1)} className="h-8 w-8 grid place-items-center rounded-full hover:bg-[var(--surface2)] disabled:opacity-30 disabled:pointer-events-none transition-colors" aria-label={t("next_month")}>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 6l6 6-6 6"/></svg>
      </button>
    </div>
  );
}

function QuickActions() {
  return (
    <div className="flex items-center gap-2">
      <button className="inline-flex items-center gap-2 px-3.5 h-10 rounded-full border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-[13px] font-medium transition-colors">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 3v18M3 12h18"/></svg>
        {t("new_tx")}
      </button>
      <button className="inline-flex items-center gap-2 px-3.5 h-10 rounded-full bg-[var(--fg)] text-[var(--bg)] hover:opacity-90 text-[13px] font-medium transition-opacity">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 3v12M6 9l6 6 6-6M4 21h16"/></svg>
        {t("import_btn")}
      </button>
    </div>
  );
}

function KpiGrid({ income, expenses, net, trigger }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <KpiCard label={t("kpi_income")}   value={income}   trigger={trigger} accent="pos" delta="+4.6%" sub={t("kpi_vs_prev")} spark={MONTHS.map(m => m.income)} delay={0} />
      <KpiCard label={t("kpi_expenses")} value={expenses} trigger={trigger} accent="neg" delta="+6.7%" sub={t("kpi_vs_prev")} spark={MONTHS.map(m => m.expenses)} delay={80} />
      <KpiCard label={t("kpi_net")}      value={net}      trigger={trigger} accent="net" delta={net >= 0 ? t("kpi_profit") : t("kpi_loss")} sub={t("kpi_margin", { p: Math.round((net / income) * 100) })} spark={MONTHS.map(m => m.income - m.expenses)} highlight delay={160} />
    </div>
  );
}

function KpiCard({ label, value, trigger, accent, delta, sub, spark, highlight, delay = 0 }) {
  const accentColor = { pos: "var(--pos)", neg: "var(--neg)", net: "var(--net)" }[accent];
  return (
    <div className={`relative rounded-2xl p-5 md:p-6 border transition-all duration-300 overflow-hidden anim-in kpi-card ${highlight ? "bg-[var(--fg)] text-[var(--bg)] border-transparent" : "bg-[var(--surface)] border-[var(--line)] hover:border-[var(--line-strong)]"}`} style={{ animationDelay: `${delay}ms` }}>
      {!highlight && <div className="absolute top-0 left-0 h-[3px] w-12 rounded-br-full" style={{ background: accentColor }} />}
      {highlight && <div className="absolute inset-0 pointer-events-none kpi-shimmer" />}
      <div className="flex items-center justify-between relative">
        <span className={`text-[11px] uppercase tracking-[0.18em] ${highlight ? "text-[var(--bg)]/60" : "text-[var(--muted)]"}`}>{label}</span>
        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium tabular-nums ${highlight ? "bg-[var(--bg)]/10 text-[var(--bg)]" : accent === "neg" ? "bg-[color-mix(in_oklch,var(--neg),transparent_85%)] text-[var(--neg)]" : "bg-[color-mix(in_oklch,var(--pos),transparent_85%)] text-[var(--pos)]"}`}>{delta}</span>
      </div>
      <div className="mt-5 flex items-end justify-between gap-4 relative">
        <div>
          <div className="font-semibold tracking-tight leading-none" style={{ fontSize: "clamp(28px, 3.2vw, 40px)", fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>
            <AnimatedEuro value={value} trigger={trigger} />
          </div>
          <div className={`mt-2 text-[12px] ${highlight ? "text-[var(--bg)]/60" : "text-[var(--muted)]"}`}>{sub}</div>
        </div>
        <Sparkline values={spark} color={highlight ? "currentColor" : accentColor} trigger={trigger} />
      </div>
    </div>
  );
}

function Sparkline({ values, color }) {
  const w = 92, h = 34, pad = 2;
  const min = Math.min(...values), max = Math.max(...values), span = max - min || 1;
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / span) * (h - pad * 2);
    return [x, y];
  });
  const d = pts.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");
  const last = pts[pts.length - 1];
  const [len, setLen] = useState(0);
  const pathRef = useRef(null);
  useEffect(() => { if (pathRef.current) setLen(pathRef.current.getTotalLength()); }, [d]);
  return (
    <svg width={w} height={h} className="flex-shrink-0">
      <path ref={pathRef} d={d} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
        style={{ strokeDasharray: len, strokeDashoffset: len, animation: len ? `spark-draw 1200ms ease-out forwards` : undefined }} />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={color}>
        <animate attributeName="r" values="2.5;4.5;2.5" dur="2.4s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function TrendChart({ months, activeIdx, onSelect, trigger }) {
  const data = months.map((m, i) => ({ name: localizedMonthLabel(m.key).split(" ")[0], income: m.income, expenses: m.expenses, idx: i }));
  return (
    <Card title={t("chart_income_vs")} subtitle={t("chart_last_6")}>
      <div className="flex items-center gap-4 text-[12px] text-[var(--muted)] mb-3">
        <LegendDot color="var(--pos)" label={t("kpi_income")} />
        <LegendDot color="var(--neg)" label={t("kpi_expenses")} />
      </div>
      <div style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart key={trigger} data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }} barCategoryGap={18}
            onClick={(e) => { if (e && typeof e.activeTooltipIndex === "number") onSelect(e.activeTooltipIndex); }}>
            <CartesianGrid strokeDasharray="2 4" stroke="var(--line)" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} tickFormatter={(v) => `\u20AC${(v / 1000).toFixed(0)}k`} width={46} />
            <Tooltip cursor={{ fill: "var(--surface2)", opacity: 0.5 }} content={<ChartTooltip />} />
            <Bar dataKey="income" name={t("kpi_income")} radius={[4, 4, 0, 0]} animationDuration={900} animationEasing="ease-out">
              {data.map((d, i) => <Cell key={i} fill={i === activeIdx ? "var(--pos)" : "color-mix(in oklch, var(--pos), transparent 55%)"} style={{ cursor: "pointer", transition: "fill 250ms" }} />)}
            </Bar>
            <Bar dataKey="expenses" name={t("kpi_expenses")} radius={[4, 4, 0, 0]} animationDuration={900} animationBegin={120} animationEasing="ease-out">
              {data.map((d, i) => <Cell key={i} fill={i === activeIdx ? "var(--neg)" : "color-mix(in oklch, var(--neg), transparent 55%)"} style={{ cursor: "pointer", transition: "fill 250ms" }} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] px-3 py-2.5 shadow-xl">
      <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-1.5">{label} 2026</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-6 text-[12px]">
          <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: p.color }} /><span className="text-[var(--muted)]">{p.name}</span></div>
          <span className="tabular-nums font-medium">{euro(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function LegendDot({ color, label }) {
  return <div className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: color }} /><span>{label}</span></div>;
}

function CategoryDonut({ data, total, active, setActive, trigger }) {
  const focused = active || data[0];
  const focusedPct = (focused.amount / total) * 100;
  return (
    <Card title={t("cats_title")} subtitle={t("cats_donut_sub")}>
      <div className="relative flex items-center justify-center" style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie key={trigger} data={data} dataKey="amount" nameKey="label" innerRadius={72} outerRadius={104} paddingAngle={2} stroke="var(--bg)" strokeWidth={2} animationDuration={900} animationEasing="ease-out"
              onMouseEnter={(_, idx) => setActive(data[idx])} onMouseLeave={() => setActive(null)}>
              {data.map((d) => <Cell key={d.key} fill={d.color} style={{ cursor: "pointer", filter: active && active.key !== d.key ? "opacity(0.4)" : "none", transition: "filter 250ms" }} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div className="text-center">
            <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">{focused.label}</div>
            <div className="mt-1.5 font-semibold tracking-tight" style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 22 }}>{euro(focused.amount)}</div>
            <div className="text-[11px] text-[var(--muted)] mt-0.5 tabular-nums">{focusedPct.toFixed(1)}%, {t("cats_of_total", { t: euro(total) })}</div>
          </div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-[var(--line)] grid grid-cols-3 gap-2">
        {data.slice(0, 3).map(d => (
          <div key={d.key} onMouseEnter={() => setActive(d)} onMouseLeave={() => setActive(null)} className="flex items-center gap-2 min-w-0 cursor-default">
            <span className="h-2.5 w-2.5 rounded-sm flex-shrink-0" style={{ background: d.color }} />
            <div className="min-w-0">
              <div className="text-[11px] text-[var(--muted)] truncate">{d.label}</div>
              <div className="text-[12px] font-medium tabular-nums">{euro(d.amount)}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function CategoryTable({ cats, total, sortKey, sortDir, toggleSort, activeKey, onHover }) {
  const max = Math.max(...cats.map(c => c.amount), 1);
  const Th = ({ k, children, align = "left" }) => (
    <th onClick={() => toggleSort(k)} className={`cursor-pointer select-none text-[11px] uppercase tracking-[0.14em] text-[var(--muted)] font-medium py-2.5 px-3 hover:text-[var(--fg)] transition-colors ${align === "right" ? "text-right" : "text-left"}`}>
      <span className="inline-flex items-center gap-1">{children}{sortKey === k && <span className="text-[9px]">{sortDir === "asc" ? "\u25B2" : "\u25BC"}</span>}</span>
    </th>
  );
  return (
    <Card title={t("cats_title")} subtitle={t("tbl_active_sort", { n: cats.length })} noPad>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--line)]">
              <Th k="label">{t("tbl_category")}</Th>
              <Th k="amount" align="right">{t("tbl_amount")}</Th>
              <th className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)] font-medium py-2.5 px-3 text-left w-[40%]">{t("tbl_share")}</th>
              <th className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)] font-medium py-2.5 px-3 text-right w-20">%</th>
            </tr>
          </thead>
          <tbody>
            {cats.map((c, i) => {
              const pct = (c.amount / total) * 100, barW = (c.amount / max) * 100;
              const isActive = activeKey === c.key;
              return (
                <tr key={c.key} onMouseEnter={() => onHover(c.key)} onMouseLeave={() => onHover(null)}
                  className={`border-b border-[var(--line)] last:border-b-0 transition-colors ${isActive ? "bg-[var(--surface2)]" : "hover:bg-[var(--surface2)]/60"}`}
                  style={{ animation: `row-in 450ms ${i * 40}ms backwards ease-out` }}>
                  <td className="py-3 px-3">
                    <div className="inline-flex items-center gap-2.5">
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: c.color }} />
                      <span className="text-[12px] font-medium px-2 py-0.5 rounded-full" style={{ background: `color-mix(in oklch, ${c.color}, transparent 82%)`, color: c.color }}>{c.label}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums text-[13px] font-medium" style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>{euro(c.amount)}</td>
                  <td className="py-3 px-3">
                    <div className="h-1.5 rounded-full bg-[var(--surface2)] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${barW}%`, background: c.color, animation: `bar-grow 900ms ${i * 50}ms ease-out backwards` }} />
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right text-[12px] text-[var(--muted)] tabular-nums">{pct.toFixed(1)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function RecentTransactions({ txs }) {
  const locale = getLang() === "de" ? "de-DE" : getLang() === "es" ? "es-ES" : "en-GB";
  return (
    <Card title={t("recent_title")} subtitle={t("recent_sub")} action={t("see_all")}>
      <ul className="divide-y divide-[var(--line)] -mx-1">
        {txs.map((tx, i) => {
          const pos = tx.amount > 0;
          const hue = pos ? 145 : (CATEGORY_HUE[tx.cat] ?? 10);
          const color = `oklch(0.72 0.14 ${hue})`;
          return (
            <li key={i} className="flex items-center gap-3 py-3 px-1 hover:bg-[var(--surface2)]/60 -mx-1 rounded-lg transition-colors" style={{ animation: `row-in 500ms ${i * 55}ms backwards ease-out` }}>
              <div className="h-9 w-9 rounded-lg flex-shrink-0 grid place-items-center" style={{ background: `color-mix(in oklch, ${color}, transparent 85%)`, color }}>
                {pos ? (
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 17 17 7M9 7h8v8"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 7 7 17M15 17H7V9"/></svg>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium truncate">{tx.desc}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-[var(--muted)] tabular-nums">{new Date(tx.date).toLocaleDateString(locale, { day: "2-digit", month: "short" })}</span>
                  <span className="text-[11px] text-[var(--muted)]">{"\u00B7"}</span>
                  <span className="text-[10.5px] font-medium px-1.5 py-0.5 rounded" style={{ background: `color-mix(in oklch, ${color}, transparent 85%)`, color }}>{catLabel(tx.cat)}</span>
                </div>
              </div>
              <div className="text-[14px] font-semibold tabular-nums flex-shrink-0" style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", color: pos ? "var(--pos)" : "var(--fg)" }}>
                {pos ? "+" : ""}{euro(tx.amount, { decimals: 2 })}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function Card({ title, subtitle, action, children, noPad }) {
  return (
    <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line-strong)] transition-colors card-lift">
      <header className={`flex items-center justify-between gap-3 px-5 pt-5 ${noPad ? "pb-4" : "pb-3"}`}>
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
          {subtitle && <p className="text-[11.5px] text-[var(--muted)] mt-0.5">{subtitle}</p>}
        </div>
        {action && (
          <button className="text-[12px] text-[var(--muted)] hover:text-[var(--fg)] transition-colors inline-flex items-center gap-1">{action}
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 6l6 6-6 6"/></svg>
          </button>
        )}
      </header>
      <div className={noPad ? "" : "px-5 pb-5"}>{children}</div>
    </section>
  );
}

function Footer({ stamp }) {
  return (
    <footer className="border-t border-[var(--line)] mt-8 relative">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-[12px] text-[var(--muted)]">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--pos)] relative">
            <span className="absolute inset-0 rounded-full bg-[var(--pos)] animate-ping opacity-60" />
          </span>
          <span>{t("footer_text")}</span>
        </div>
        <div className="tabular-nums">{t("last_sync", { t: stamp })}</div>
      </div>
    </footer>
  );
}
