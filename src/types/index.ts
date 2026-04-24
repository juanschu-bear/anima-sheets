// CFO Categories enum (16 categories matching Anima Drive)
export enum Category {
  Revenue = 'Revenue',
  CostOfSales = 'Cost of Sales',
  Marketing = 'Marketing',
  Salary = 'Salary',
  OfficeRent = 'Office Rent',
  Utilities = 'Utilities',
  Insurance = 'Insurance',
  Software = 'Software & Subscriptions',
  Travel = 'Travel',
  Equipment = 'Equipment',
  ProfessionalFees = 'Professional Fees',
  Taxes = 'Taxes',
  Depreciation = 'Depreciation',
  Interest = 'Interest',
  OtherIncome = 'Other Income',
  OtherExpense = 'Other Expense',
}

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

export interface Transaction {
  id: string;
  user_id: string;
  category: Category;
  amount: number;
  description: string;
  date: string;
  receipt_url: string | null;
  created_at: string;
}

export interface CategoryInfo {
  key: Category;
  label: string;
  color: string;
  type: 'income' | 'expense';
}

export interface SpreadsheetRow {
  id: string;
  category: Category;
  amount: number;
  description: string;
  date: string;
  receipt_url: string | null;
}

export interface ImportResult {
  transactions: Transaction[];
  errors: string[];
  skipped: number;
}
