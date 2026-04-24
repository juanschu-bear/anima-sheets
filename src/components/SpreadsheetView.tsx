import { useEffect, useRef, useState } from 'react';
import type { Transaction } from '../types';
import { Category } from '../types';
import { CATEGORY_COLORS } from '../lib/categories';

interface SpreadsheetViewProps {
  transactions: Transaction[];
  onCellChange: (id: string, field: string, value: unknown) => void;
  onAddRow: () => void;
  onDeleteRow: (id: string) => void;
  onEditRow: (transaction: Transaction) => void;
}

export default function SpreadsheetView({ transactions, onCellChange, onAddRow, onDeleteRow }: SpreadsheetViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setLoaded(true); }, []);

  if (!loaded || !containerRef.current) {
    return (
      <div className="flex h-full items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-gray-600 dark:text-gray-400">Loading spreadsheet...</p>
        </div>
      </div>
    );
  }

  const totalIncome = transactions.filter(t => t.amount >= 0).reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const net = totalIncome - totalExpenses;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction Spreadsheet</h2>
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">{transactions.length} rows</span>
        </div>
        <button onClick={onAddRow} className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>Add Row
        </button>
      </div>
      {transactions.length > 0 && (
        <div className="flex items-center gap-6 border-b border-gray-200 bg-gray-50 px-4 py-1.5 text-sm dark:bg-gray-800 dark:border-gray-700">
          <span>Income: <span className="font-semibold text-green-600">{formatCurrency(totalIncome)}</span></span>
          <span>Expenses: <span className="font-semibold text-red-600">{formatCurrency(totalExpenses)}</span></span>
          <span>Net: <span className={`font-semibold ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(net)}</span></span>
        </div>
      )}
      <div ref={containerRef} className="flex-1 overflow-auto">
        <SheetTable transactions={transactions} onCellChange={onCellChange} onDeleteRow={onDeleteRow} />
      </div>
    </div>
  );
}

function SheetTable({ transactions, onCellChange, onDeleteRow }: { transactions: Transaction[]; onCellChange: (id: string, field: string, value: unknown) => void; onDeleteRow: (id: string) => void }) {
  const [editingCell, setEditingCell] = useState<{ rowId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (editingCell && inputRef.current) inputRef.current.focus();
  }, [editingCell]);

  const handleDoubleClick = (rowId: string, field: string, currentValue: unknown) => {
    setEditingCell({ rowId, field });
    setEditValue(String(currentValue ?? ''));
  };

  const handleSave = () => {
    if (editingCell) {
      let value: unknown = editValue;
      if (editingCell.field === 'amount') value = parseFloat(editValue) || 0;
      onCellChange(editingCell.rowId, editingCell.field, value);
    }
    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') { setEditingCell(null); setEditValue(''); }
  };

  const allCategories = Object.values(Category);

  const fmt = (amount: number) => formatCurrency(Math.abs(amount));
  const sign = (amount: number) => amount >= 0 ? '+' : '-';

  const renderCell = (t: Transaction, field: string) => {
    const isEditing = editingCell?.rowId === t.id && editingCell?.field === field;
    const val = t[field as keyof Transaction];

    if (isEditing && field === 'category') {
      return (
        <select ref={selectRef as React.Ref<HTMLSelectElement>} value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={handleSave} onKeyDown={handleKeyDown} className="w-full rounded border border-blue-500 bg-white px-1 py-0.5 text-sm focus:outline-none">
          {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      );
    }

    if (isEditing) {
      const isDateField = field === 'date';
      return (
        <input ref={inputRef} type={isDateField ? 'date' : (field === 'amount' ? 'number' : 'text')} value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={handleSave} onKeyDown={handleKeyDown} className="w-full rounded border border-blue-500 bg-white px-1 py-0.5 text-sm focus:outline-none" />
      );
    }

    if (field === 'amount') {
      const amount = Number(val) || 0;
      return <span className={`block truncate px-1 py-0.5 text-right font-mono text-sm ${amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>{sign(amount)}{fmt(amount)}</span>;
    }

    if (field === 'category') {
      const cat = val as Category;
      return <span className="block truncate px-1 py-0.5 text-sm"><span className="inline-flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] ?? '#6b7280' }} />{cat}</span></span>;
    }

    if (field === 'receipt_url' && val) {
      return <a href={String(val)} target="_blank" rel="noopener noreferrer" className="block truncate px-1 py-0.5 text-sm text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>📎 {String(val).slice(0, 30)}...</a>;
    }

    return <span className="block truncate px-1 py-0.5 text-sm">{String(val)}</span>;
  };

  if (transactions.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <p className="text-lg font-medium text-gray-500 dark:text-gray-400">No transactions yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">Add a row to get started</p>
        </div>
      </div>
    );
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead className="sticky top-0 z-10">
        <tr className="bg-gray-100 dark:bg-gray-800">
          <th className="w-10 border border-gray-300 bg-gray-100 px-2 py-1 text-center text-xs font-semibold text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">#</th>
          <th className="w-32 border border-gray-300 bg-gray-100 px-2 py-1 text-left text-xs font-semibold text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">Date</th>
          <th className="w-40 border border-gray-300 bg-gray-100 px-2 py-1 text-left text-xs font-semibold text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">Category</th>
          <th className="w-32 border border-gray-300 bg-gray-100 px-2 py-1 text-right text-xs font-semibold text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">Amount</th>
          <th className="border border-gray-300 bg-gray-100 px-2 py-1 text-left text-xs font-semibold text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">Description</th>
          <th className="w-40 border border-gray-300 bg-gray-100 px-2 py-1 text-left text-xs font-semibold text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">Receipt</th>
          <th className="w-10 border border-gray-300 bg-gray-100 px-2 py-1 text-center text-xs font-semibold text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400" />
        </tr>
      </thead>
      <tbody>
        {transactions.map((t, i) => (
          <tr key={t.id} className="group border border-gray-200 hover:bg-blue-50 dark:border-gray-700 dark:hover:bg-blue-950">
            <td className="border border-gray-200 bg-gray-50 px-2 py-1 text-center text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-850 dark:text-gray-400">{i + 1}</td>
            <td className="border border-gray-200 px-1 py-0.5 cursor-cell select-none dark:border-gray-700" onDoubleClick={() => handleDoubleClick(t.id, 'date', t.date)}>{renderCell(t, 'date')}</td>
            <td className="border border-gray-200 px-1 py-0.5 cursor-cell select-none dark:border-gray-700" onDoubleClick={() => handleDoubleClick(t.id, 'category', t.category)}>{renderCell(t, 'category')}</td>
            <td className="border border-gray-200 px-1 py-0.5 cursor-cell select-none dark:border-gray-700" onDoubleClick={() => handleDoubleClick(t.id, 'amount', t.amount)}>{renderCell(t, 'amount')}</td>
            <td className="border border-gray-200 px-1 py-0.5 cursor-cell select-none dark:border-gray-700" onDoubleClick={() => handleDoubleClick(t.id, 'description', t.description)}>{renderCell(t, 'description')}</td>
            <td className="border border-gray-200 px-1 py-0.5 cursor-cell select-none dark:border-gray-700" onDoubleClick={() => handleDoubleClick(t.id, 'receipt_url', t.receipt_url)}>{renderCell(t, 'receipt_url')}</td>
            <td className="border border-gray-200 px-1 py-0.5 text-center dark:border-gray-700">
              <button onClick={() => onDeleteRow(t.id)} className="opacity-0 transition-opacity group-hover:opacity-100 text-red-500 hover:text-red-700" title="Delete">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount);
}

export function getCategoryColor(category: Category): string {
  return CATEGORY_COLORS[category] ?? '#6b7280';
}
