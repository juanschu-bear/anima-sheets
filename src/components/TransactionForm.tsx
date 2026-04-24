import { useState, useCallback } from 'react';
import type { Transaction } from '../types';
import { Category } from '../types';
import { CFO_CATEGORIES, getCategoryType, formatCurrency, CATEGORY_COLORS } from '../lib/categories';

interface TransactionFormProps {
  onSubmit: (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => void;
  onCancel: () => void;
  editTransaction?: Transaction | null;
}

function getToday(): string {
  return new Date().toISOString().split('T')[0] ?? '';
}

export default function TransactionForm({ onSubmit, onCancel, editTransaction }: TransactionFormProps) {
  const [date, setDate] = useState<string>(editTransaction?.date ?? getToday());
  const [category, setCategory] = useState<Category>(editTransaction?.category ?? Category.OtherExpense);
  const [amount, setAmount] = useState<string>(editTransaction ? Math.abs(editTransaction.amount).toString() : '');
  const [description, setDescription] = useState<string>(editTransaction?.description ?? '');
  const [receiptUrl, setReceiptUrl] = useState<string>(editTransaction?.receipt_url ?? '');

  const isEdit = !!editTransaction;

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const amountValue = parseFloat(amount) || 0;
    const isIncome = getCategoryType(category) === 'income';
    onSubmit({
      date: date,
      category: category,
      amount: isIncome ? amountValue : -amountValue,
      description: description.trim(),
      receipt_url: receiptUrl.trim() || null,
    });
  }, [date, category, amount, description, receiptUrl, onSubmit]);

  const formattedAmount = parseFloat(amount) || 0;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{isEdit ? 'Edit Transaction' : 'New Transaction'}</h2>
          <button onClick={onCancel} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-400" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-400">
                {CFO_CATEGORIES.map(cat => <option key={cat.key} value={cat.key}>{cat.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Amount ({getCategoryType(category) === 'income' ? '+' : '-'})</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required min="0" step="0.01" placeholder="0.00" className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-8 pr-3 text-sm text-gray-900 font-mono focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-400" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter transaction description..." className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:ring-blue-400" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Receipt URL (optional)</label>
            <input type="url" value={receiptUrl} onChange={(e) => setReceiptUrl(e.target.value)} placeholder="https://example.com/receipt.pdf" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:ring-blue-400" />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onCancel} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">{isEdit ? 'Update Transaction' : 'Add Transaction'}</button>
          </div>
        </form>
      </div>
      {formattedAmount > 0 && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">PREVIEW</p>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">{date}</span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[category] ?? '#6b7280' }} />
              <span className="text-sm text-gray-700 dark:text-gray-300">{CFO_CATEGORIES.find(c => c.key === category)?.label}</span>
            </span>
          </div>
          <p className={`mt-2 text-2xl font-bold ${getCategoryType(category) === 'income' ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(formattedAmount)}</p>
          {description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
        </div>
      )}
    </div>
  );
}
