import { useMemo, type ChangeEvent } from 'react';
import type { Transaction, Category } from '../types';
import { CFO_CATEGORIES, getCategoryType, formatCurrency, CATEGORY_COLORS } from '../lib/categories';

interface DashboardProps {
  transactions: Transaction[];
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

export default function Dashboard({ transactions, selectedMonth, onMonthChange }: DashboardProps) {
  const monthTransactions = useMemo(() => transactions.filter(t => t.date.startsWith(selectedMonth)), [transactions, selectedMonth]);

  const { totalIncome, totalExpenses, netIncome, categoryBreakdown, monthlyData } = useMemo(() => {
    const income = monthTransactions.filter(t => t.amount >= 0);
    const expenses = monthTransactions.filter(t => t.amount < 0);
    const totalIncome = income.reduce((s, t) => s + t.amount, 0);
    const totalExpenses = expenses.reduce((s, t) => s + Math.abs(t.amount), 0);

    const breakdown: Record<string, number> = {};
    monthTransactions.forEach(t => { breakdown[t.category] = (breakdown[t.category] || 0) + Math.abs(t.amount); });

    const categoryBreakdown = Object.entries(breakdown).sort(([, a], [, b]) => b - a).map(([cat, amount]) => ({
      category: cat as Category,
      amount,
      percentage: totalIncome + totalExpenses > 0 ? (amount / (totalIncome + totalExpenses)) * 100 : 0,
    }));

    const months: { month: string; label: string; income: number; expenses: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ms = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const mt = transactions.filter(t => t.date.startsWith(ms));
      const inc = mt.filter(t => t.amount >= 0).reduce((s, t) => s + t.amount, 0);
      const exp = mt.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
      months.push({ month: ms, label: d.toLocaleString('default', { month: 'short' }), income: inc, expenses: exp });
    }

    return { totalIncome, totalExpenses, netIncome: totalIncome - totalExpenses, categoryBreakdown, monthlyData: months };
  }, [monthTransactions, transactions, selectedMonth]);

  const monthLabel = useMemo(() => {
    const parts = selectedMonth.split('-');
    const year = parts[0] ? parseInt(parts[0], 10) : 0;
    const month = parts[1] ? parseInt(parts[1], 10) : 1;
    return new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  }, [selectedMonth]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CFO Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Financial overview and analytics</p>
        </div>
        <input type="month" value={selectedMonth} onChange={(e: ChangeEvent<HTMLInputElement>) => onMonthChange(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-400" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard title="Income" amount={totalIncome} color="green" />
        <SummaryCard title="Expenses" amount={totalExpenses} color="red" />
        <SummaryCard title="Net Income" amount={netIncome} color={netIncome >= 0 ? 'green' : 'red'} highlight />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Last 6 Months</h3>
          <BarChart monthlyData={monthlyData} />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Category Breakdown — {monthLabel}</h3>
          {categoryBreakdown.length === 0 ? (
            <div className="flex h-48 items-center justify-center"><p className="text-sm text-gray-400">No data for this month</p></div>
          ) : (
            <CategoryBreakdown categories={categoryBreakdown} />
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Monthly Summary by Category</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="pb-2 pr-4 text-left font-medium text-gray-500 dark:text-gray-400">Category</th>
                <th className="pb-2 text-right font-medium text-gray-500 dark:text-gray-400">Amount</th>
                <th className="pb-2 w-32 text-right font-medium text-gray-500 dark:text-gray-400">Share</th>
              </tr>
            </thead>
            <tbody>
              {categoryBreakdown.length === 0 ? (
                <tr><td colSpan={3} className="py-6 text-center text-gray-400">No transactions for this month</td></tr>
              ) : (
                categoryBreakdown.map(({ category, amount, percentage }) => (
                  <tr key={category} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[category] ?? '#6b7280' }} />
                        <span className="font-medium text-gray-900 dark:text-white">{CFO_CATEGORIES.find(c => c.key === category)?.label}</span>
                      </div>
                    </td>
                    <td className={`py-2 text-right font-mono ${getCategoryType(category) === 'income' ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(amount)}</td>
                    <td className="py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                          <div className="h-full rounded-full" style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: CATEGORY_COLORS[category] ?? '#6b7280' }} />
                        </div>
                        <span className="w-12 text-right text-gray-500">{percentage.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, amount, color, highlight }: { title: string; amount: number; color: string; highlight?: boolean }) {
  const bg = color === 'green'
    ? highlight ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 dark:from-green-950 dark:to-emerald-950 dark:border-green-800'
      : 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
    : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800';
  const text = color === 'green' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300';

  return (
    <div className={`rounded-xl border p-4 ${bg}`}>
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</span>
      <p className={`mt-1 text-2xl font-bold ${text}`}>{formatCurrency(amount)}</p>
    </div>
  );
}

function BarChart({ monthlyData }: { monthlyData: { month: string; label: string; income: number; expenses: number }[] }) {
  const maxValue = Math.max(...monthlyData.map(m => Math.max(m.income, m.expenses)), 1);

  return (
    <div className="h-48">
      <div className="flex h-full items-end gap-2">
        {monthlyData.map((m) => (
          <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full flex-col-reverse gap-0.5">
              <div className="rounded-t bg-green-400 transition-all dark:bg-green-600" style={{ height: `${(m.income / maxValue) * 100}%`, minHeight: m.income > 0 ? '4px' : '0' }} />
              <div className="rounded-b bg-red-400 transition-all dark:bg-red-600" style={{ height: `${(m.expenses / maxValue) * 100}%`, minHeight: m.expenses > 0 ? '4px' : '0' }} />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">{m.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-center gap-4">
        <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-400" /><span className="text-xs text-gray-500 dark:text-gray-400">Income</span></div>
        <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400" /><span className="text-xs text-gray-500 dark:text-gray-400">Expenses</span></div>
      </div>
    </div>
  );
}

function CategoryBreakdown({ categories }: { categories: { category: Category; amount: number; percentage: number }[] }) {
  return (
    <div className="space-y-2">
      {categories.map(({ category, amount, percentage }) => (
        <div key={category} className="flex items-center gap-3">
          <span className="h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[category] ?? '#6b7280' }} />
          <span className="min-w-0 flex-1 truncate text-sm text-gray-700 dark:text-gray-300">{CFO_CATEGORIES.find(c => c.key === category)?.label}</span>
          <span className="font-mono text-sm text-gray-900 dark:text-white">{formatCurrency(amount)}</span>
          <span className="w-12 text-right text-xs text-gray-500 dark:text-gray-400">{percentage.toFixed(1)}%</span>
          <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
            <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: CATEGORY_COLORS[category] ?? '#6b7280' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
