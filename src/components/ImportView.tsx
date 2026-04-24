import { useState, useCallback } from 'react';
import type { Transaction } from '../types';
import { Category } from '../types';
import { importTransactions } from '../lib/supabase';
import { CFO_CATEGORIES } from '../lib/categories';

interface ImportViewProps {
  userId: string;
  onImportComplete: (count: number) => Promise<void>;
  onBack: () => void;
}

type ImportMethod = 'csv' | 'json' | 'url';
const ALL_CATEGORIES = Object.values(Category) as Category[];

function findCategory(catVal: string): Category {
  return (ALL_CATEGORIES.find(c => c.toLowerCase() === catVal.toLowerCase() || CFO_CATEGORIES.find(cat => cat.key === c)?.label.toLowerCase() === catVal.toLowerCase())) ?? Category.OtherExpense;
}

export default function ImportView({ userId, onImportComplete, onBack }: ImportViewProps) {
  const [method, setMethod] = useState<ImportMethod>('csv');
  const [data, setData] = useState('');
  const [importUrl, setImportUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const handleImport = useCallback(async () => {
    setLoading(true);
    setErrors([]);
    setResult(null);
    try {
      let transactions: Omit<Transaction, 'id' | 'user_id' | 'created_at'>[] = [];
      let importErrors: string[] = [];

      if (method === 'csv') {
        const parsed = parseCSV(data);
        transactions = parsed.transactions;
        importErrors = parsed.errors;
      } else if (method === 'json') {
        const parsed = parseJSON(data);
        transactions = parsed.transactions;
        importErrors = parsed.errors;
      } else if (method === 'url') {
        const parsed = await fetchAndParse(importUrl);
        transactions = parsed.transactions;
        importErrors = parsed.errors;
      }

      if (transactions.length === 0) {
        setErrors(['No valid transactions found in the data.']);
        setLoading(false);
        return;
      }

      const importResult = await importTransactions(userId, transactions);
      setResult(importResult);
      if (importResult.success > 0) await onImportComplete(importResult.success);
      setErrors([...importErrors, ...importResult.errors]);
    } catch (err) {
      setErrors([(err as Error).message || 'Import failed']);
    } finally {
      setLoading(false);
    }
  }, [method, data, importUrl, userId, onImportComplete]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const ext = file.name.split('.').pop();
      if (ext === 'json') setMethod('json');
      setData(text);
    };
    reader.readAsText(file);
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Import Transactions</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Import from CSV, JSON, or Anima Drive documents</p>
        </div>
        <button onClick={onBack} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700">← Back</button>
      </div>

      <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        {(['csv', 'json', 'url'] as ImportMethod[]).map(m => (
          <button key={m} onClick={() => setMethod(m)} className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${method === m ? 'bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>
            {m === 'csv' ? '📄 CSV' : m === 'json' ? '{ } JSON' : '🔗 URL'}
          </button>
        ))}
      </div>

      {(method === 'csv' || method === 'json') && (
        <div className="space-y-4">
          <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center dark:border-gray-600">
            <input type="file" accept=".csv,.json" onChange={handleFileUpload} className="hidden" id="file-upload" />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">CSV or JSON file</p>
            </label>
          </div>
          <textarea value={data} onChange={(e) => setData(e.target.value)} placeholder={method === 'csv' ? 'date,category,amount,description\n2024-01-15,Revenue,50000,Product sales' : '[{"date":"2024-01-15","category":"Revenue","amount":50000}]'} rows={10} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-mono text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-400" />
          <button onClick={handleImport} disabled={loading || !data.trim()} className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? <span className="flex items-center justify-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Importing...</span> : 'Import Transactions'}
          </button>
        </div>
      )}

      {method === 'url' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Import from Anima Drive Document URL</p>
            <div className="flex gap-2">
              <input type="url" value={importUrl} onChange={(e) => setImportUrl(e.target.value)} placeholder="https://drive.ani.mk/d/xxx" className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-400" />
              <button onClick={handleImport} disabled={loading || !importUrl.trim()} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">{loading ? '..' : 'Import'}</button>
            </div>
          </div>
          <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
            <p className="text-xs text-blue-700 dark:text-blue-300">💡 Anima Drive documents are automatically parsed for transaction data.</p>
          </div>
        </div>
      )}

      <div className="mt-6 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
        <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Expected Format</h3>
        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Valid categories: {CFO_CATEGORIES.map(c => c.label).join(', ')}</p>
        <pre className="rounded-lg bg-gray-100 p-3 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">{`{
  "date": "YYYY-MM-DD",
  "category": "Category Name",
  "amount": -1234.56,
  "description": "Optional note",
  "receipt_url": "https://..."
}`}</pre>
      </div>

      {errors.length > 0 && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950">
          <h4 className="mb-1 text-sm font-semibold text-red-700 dark:text-red-300">Import Errors</h4>
          <ul className="list-inside list-disc text-xs text-red-600 dark:text-red-400">{errors.map((err, i) => <li key={i}>{err}</li>)}</ul>
        </div>
      )}

      {result && result.success > 0 && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
          <p className="text-sm font-medium text-green-700 dark:text-green-300">✅ Successfully imported {result.success} transaction(s)!</p>
        </div>
      )}
    </div>
  );
}

function parseCSV(text: string): { transactions: Omit<Transaction, 'id' | 'user_id' | 'created_at'>[]; errors: string[] } {
  const trimmed = text.trim();
  if (!trimmed) return { transactions: [], errors: ['Empty input'] };

  const lines = trimmed.split('\n');
  if (lines.length < 2) return { transactions: [], errors: ['CSV must have a header row and at least one data row'] };

  const header: string[] = lines[0]!.split(',').map(h => h.trim().toLowerCase());
  const dateIdx = header.findIndex(h => h.includes('date'));
  const catIdx = header.findIndex(h => h.includes('category'));
  const amtIdx = header.findIndex(h => h.includes('amount'));
  const descIdx = header.findIndex(h => h.includes('description') || h.includes('desc'));

  if (dateIdx === -1 || catIdx === -1 || amtIdx === -1) {
    return { transactions: [], errors: ['CSV must have columns: date, category, amount (and optionally description)'] };
  }

  const transactions: Omit<Transaction, 'id' | 'user_id' | 'created_at'>[] = [];
  const csvErrors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const cols: string[] = line.split(',').map(c => c.trim());
    const maxIdx = Math.max(dateIdx, catIdx, amtIdx);
    if (cols.length <= maxIdx) continue;

    const dateVal: string = cols[dateIdx] ?? '';
    const catVal: string = cols[catIdx] ?? '';
    const amtVal: string = cols[amtIdx] ?? '';
    const descVal: string = descIdx !== -1 ? (cols[descIdx] ?? '') : '';

    if (!dateVal || !catVal || !amtVal) {
      csvErrors.push(`Row ${i + 1}: Missing required fields`);
      continue;
    }

    transactions.push({
      date: dateVal,
      category: findCategory(catVal),
      amount: parseFloat(amtVal) || 0,
      description: descVal,
      receipt_url: null,
    });
  }

  return { transactions, errors: csvErrors };
}

function parseJSON(text: string): { transactions: Omit<Transaction, 'id' | 'user_id' | 'created_at'>[]; errors: string[] } {
  const jsonErrors: string[] = [];
  try {
    const parsed = JSON.parse(text);
    const arr = Array.isArray(parsed) ? parsed : [parsed];
    const transactions: Omit<Transaction, 'id' | 'user_id' | 'created_at'>[] = [];

    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];
      if (!item.date || !item.category || item.amount === undefined) {
        jsonErrors.push(`Item ${i + 1}: Missing required fields`);
        continue;
      }
      const category = findCategory(String(item.category));
      transactions.push({
        date: String(item.date),
        category,
        amount: Number(item.amount) || 0,
        description: String(item.description ?? ''),
        receipt_url: item.receipt_url ? String(item.receipt_url) : null,
      });
    }
    return { transactions, errors: jsonErrors };
  } catch (err) {
    return { transactions: [], errors: [`Invalid JSON: ${(err as Error).message}`] };
  }
}

async function fetchAndParse(url: string): Promise<{ transactions: Omit<Transaction, 'id' | 'user_id' | 'created_at'>[]; errors: string[] }> {
  try {
    const response = await fetch(url);
    const text = await response.text();
    if (url.endsWith('.csv')) return parseCSV(text);
    return parseJSON(text);
  } catch (err) {
    return { transactions: [], errors: [`Failed to fetch URL: ${(err as Error).message}`] };
  }
}
