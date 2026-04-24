import { createClient } from '@supabase/supabase-js';
import type { Transaction } from '../types';
import { Category } from '../types';

const SUPABASE_URL = 'https://wofklmwbokdjoqlstjmy.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function fetchTransactions(userId: string): Promise<Transaction[]> {
  if (!SUPABASE_ANON_KEY) {
    console.warn('Supabase anon key not configured. Using mock data.');
    return getMockTransactions();
  }

  const { data, error } = await supabase
    .from('cfo_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    return getMockTransactions();
  }

  return data || [];
}

export async function createTransaction(
  userId: string,
  transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>,
): Promise<Transaction | null> {
  if (!SUPABASE_ANON_KEY) {
    console.warn('Supabase anon key not configured. Transaction not saved.');
    return null;
  }

  const { data, error } = await supabase
    .from('cfo_transactions')
    .insert([{ user_id: userId, ...transaction }])
    .select()
    .single();

  if (error) {
    console.error('Error creating transaction:', error);
    return null;
  }

  return data;
}

export async function updateTransaction(
  transactionId: string,
  updates: Partial<Transaction>,
): Promise<Transaction | null> {
  if (!SUPABASE_ANON_KEY) {
    console.warn('Supabase anon key not configured. Transaction not updated.');
    return null;
  }

  const { data, error } = await supabase
    .from('cfo_transactions')
    .update(updates)
    .eq('id', transactionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating transaction:', error);
    return null;
  }

  return data;
}

export async function deleteTransaction(transactionId: string): Promise<boolean> {
  if (!SUPABASE_ANON_KEY) {
    console.warn('Supabase anon key not configured. Transaction not deleted.');
    return false;
  }

  const { error } = await supabase
    .from('cfo_transactions')
    .delete()
    .eq('id', transactionId);

  if (error) {
    console.error('Error deleting transaction:', error);
    return false;
  }

  return true;
}

export async function importTransactions(
  userId: string,
  transactions: Omit<Transaction, 'id' | 'user_id' | 'created_at'>[],
): Promise<{ success: number; errors: string[] }> {
  if (!SUPABASE_ANON_KEY) {
    console.warn('Supabase anon key not configured. Transactions not imported.');
    return { success: 0, errors: ['Supabase not configured'] };
  }

  const results = await supabase
    .from('cfo_transactions')
    .insert(transactions.map(t => ({ user_id: userId, ...t }) as Transaction))
    .select();

  if (results.error) {
    console.error('Error importing transactions:', results.error);
    return { success: 0, errors: [results.error.message] };
  }

  return { success: results.data?.length ?? 0, errors: [] };
}

function getMockTransactions(): Transaction[] {
  return [
    { id: '1', user_id: 'demo', category: Category.Revenue, amount: 50000, description: 'Product sales revenue', date: '2024-01-15', receipt_url: null, created_at: '2024-01-15T10:00:00Z' },
    { id: '2', user_id: 'demo', category: Category.CostOfSales, amount: -12000, description: 'Raw materials purchase', date: '2024-01-20', receipt_url: null, created_at: '2024-01-20T10:00:00Z' },
    { id: '3', user_id: 'demo', category: Category.Salary, amount: -8000, description: 'Monthly payroll', date: '2024-02-01', receipt_url: null, created_at: '2024-02-01T10:00:00Z' },
    { id: '4', user_id: 'demo', category: Category.OfficeRent, amount: -3500, description: 'Office rent February', date: '2024-02-01', receipt_url: null, created_at: '2024-02-01T10:00:00Z' },
    { id: '5', user_id: 'demo', category: Category.Marketing, amount: -2000, description: 'Google Ads campaign', date: '2024-02-10', receipt_url: null, created_at: '2024-02-10T10:00:00Z' },
    { id: '6', user_id: 'demo', category: Category.Revenue, amount: 65000, description: 'Service contract revenue', date: '2024-02-15', receipt_url: null, created_at: '2024-02-15T10:00:00Z' },
    { id: '7', user_id: 'demo', category: Category.Software, amount: -500, description: 'Cloud hosting subscription', date: '2024-03-01', receipt_url: null, created_at: '2024-03-01T10:00:00Z' },
    { id: '8', user_id: 'demo', category: Category.Travel, amount: -1800, description: 'Client conference travel', date: '2024-03-10', receipt_url: null, created_at: '2024-03-10T10:00:00Z' },
    { id: '9', user_id: 'demo', category: Category.Revenue, amount: 42000, description: 'Product sales Q1', date: '2024-03-31', receipt_url: null, created_at: '2024-03-31T10:00:00Z' },
    { id: '10', user_id: 'demo', category: Category.Insurance, amount: -1200, description: 'Business insurance premium', date: '2024-04-01', receipt_url: null, created_at: '2024-04-01T10:00:00Z' },
  ];
}
