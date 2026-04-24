import { useState, useEffect, useCallback } from 'react';
import type { Transaction } from './types';
import { fetchTransactions, createTransaction, updateTransaction, deleteTransaction } from './lib/supabase';
import SpreadsheetView from './components/SpreadsheetView';
import TransactionForm from './components/TransactionForm';
import ImportView from './components/ImportView';
import Dashboard from './pages/Dashboard';

type ViewType = 'dashboard' | 'spreadsheet' | 'import' | 'form';

const USER_ID = 'demo-user';

function App() {
  const [view, setView] = useState<ViewType>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    const data = await fetchTransactions(USER_ID);
    setTransactions(data);
  };

  const handleCellChange = useCallback(async (id: string, field: string, value: unknown) => {
    const result = await updateTransaction(id, { [field]: value });
    if (result) {
      setTransactions(prev =>
        prev.map(t => (t.id === id ? result as Transaction : t)),
      );
    }
  }, []);

  const handleAddRow = () => {
    setEditingTransaction(null);
    setView('form');
  };

  const handleEditRow = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setView('form');
  };

  const handleFormSubmit = async (data: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
    if (editingTransaction) {
      const result = await updateTransaction(editingTransaction.id, data);
      if (result) {
        setTransactions(prev =>
          prev.map(t => (t.id === editingTransaction.id ? result as Transaction : t)),
        );
      }
    } else {
      const result = await createTransaction(USER_ID, data);
      if (result) {
        setTransactions(prev => [result as Transaction, ...prev]);
      }
    }
    setView('spreadsheet');
  };

  const handleDeleteRow = async (id: string) => {
    const deleted = await deleteTransaction(id);
    if (deleted) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <header className="border-b border-gray-200 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <span className="text-sm font-bold text-white">A</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 dark:text-white">Anima Sheets</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">CFO System</p>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            <NavButton
              active={view === 'dashboard'}
              onClick={() => setView('dashboard')}
              icon={
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              }
              label="Dashboard"
            />
            <NavButton
              active={view === 'spreadsheet'}
              onClick={() => setView('spreadsheet')}
              icon={
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              }
              label="Spreadsheet"
            />
            <NavButton
              active={view === 'import'}
              onClick={() => setView('import')}
              icon={
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              }
              label="Import"
            />
          </nav>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4">
        <div className="mx-auto max-w-7xl">
          {view === 'dashboard' && (
            <Dashboard
              transactions={transactions}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
            />
          )}

          {view === 'spreadsheet' && (
            <SpreadsheetView
              transactions={transactions}
              onCellChange={handleCellChange}
              onAddRow={handleAddRow}
              onDeleteRow={handleDeleteRow}
              onEditRow={handleEditRow}
            />
          )}

          {view === 'form' && (
            <TransactionForm
              editTransaction={editingTransaction}
              onSubmit={handleFormSubmit}
              onCancel={() => setView('spreadsheet')}
            />
          )}

          {view === 'import' && (
            <ImportView
              userId={USER_ID}
              onImportComplete={async () => {
                await loadTransactions();
                setView('spreadsheet');
              }}
              onBack={() => setView('spreadsheet')}
            />
          )}
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white px-4 py-1.5 dark:border-gray-700 dark:bg-gray-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-xs text-gray-400 dark:text-gray-500">
          <span>Anima Sheets — CFO Financial Management</span>
          <span>{transactions.length} transactions loaded</span>
        </div>
      </footer>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export default App;
export { type ViewType };
