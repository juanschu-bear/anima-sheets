import { Category } from '../types';

export const CFO_CATEGORIES = [
  { key: Category.Revenue, label: 'Revenue', type: 'income' as const },
  { key: Category.CostOfSales, label: 'Cost of Sales', type: 'expense' as const },
  { key: Category.Marketing, label: 'Marketing', type: 'expense' as const },
  { key: Category.Salary, label: 'Salary & Wages', type: 'expense' as const },
  { key: Category.OfficeRent, label: 'Office Rent', type: 'expense' as const },
  { key: Category.Utilities, label: 'Utilities', type: 'expense' as const },
  { key: Category.Insurance, label: 'Insurance', type: 'expense' as const },
  { key: Category.Software, label: 'Software & Subscriptions', type: 'expense' as const },
  { key: Category.Travel, label: 'Travel', type: 'expense' as const },
  { key: Category.Equipment, label: 'Equipment', type: 'expense' as const },
  { key: Category.ProfessionalFees, label: 'Professional Fees', type: 'expense' as const },
  { key: Category.Taxes, label: 'Taxes', type: 'expense' as const },
  { key: Category.Depreciation, label: 'Depreciation', type: 'expense' as const },
  { key: Category.Interest, label: 'Interest', type: 'expense' as const },
  { key: Category.OtherIncome, label: 'Other Income', type: 'income' as const },
  { key: Category.OtherExpense, label: 'Other Expense', type: 'expense' as const },
] as const;

export const CATEGORY_COLORS: Record<Category, string> = {
  [Category.Revenue]: '#10b981',
  [Category.CostOfSales]: '#f59e0b',
  [Category.Marketing]: '#3b82f6',
  [Category.Salary]: '#ef4444',
  [Category.OfficeRent]: '#8b5cf6',
  [Category.Utilities]: '#06b6d4',
  [Category.Insurance]: '#f97316',
  [Category.Software]: '#6366f1',
  [Category.Travel]: '#ec4899',
  [Category.Equipment]: '#84cc16',
  [Category.ProfessionalFees]: '#14b8a6',
  [Category.Taxes]: '#e11d48',
  [Category.Depreciation]: '#78716c',
  [Category.Interest]: '#0ea5e9',
  [Category.OtherIncome]: '#84cc16',
  [Category.OtherExpense]: '#dc2626',
};

export function getCategoryType(key: Category): 'income' | 'expense' {
  const cat = CFO_CATEGORIES.find(c => c.key === key);
  return cat?.type ?? 'expense';
}

export function isIncome(category: Category): boolean {
  return getCategoryType(category) === 'income';
}

export function isExpense(category: Category): boolean {
  return getCategoryType(category) === 'expense';
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatAmountWithSign(amount: number): string {
  const formatted = formatCurrency(Math.abs(amount));
  return amount >= 0 ? `+${formatted}` : `-${formatted}`;
}
