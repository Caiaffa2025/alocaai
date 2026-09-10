import { PaymentTransaction } from '../types';
import { getInitialSampleTransactions } from './initialData';

const STORAGE_KEY = 'alocapag_transactions_v1';

export function loadStoredTransactions(): PaymentTransaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const sample = getInitialSampleTransactions();
      saveStoredTransactions(sample);
      return sample;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading stored transactions:', err);
    return getInitialSampleTransactions();
  }
}

export function saveStoredTransactions(transactions: PaymentTransaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (err) {
    console.error('Error saving stored transactions:', err);
  }
}

export function resetStoredTransactionsToDefault(): PaymentTransaction[] {
  const sample = getInitialSampleTransactions();
  saveStoredTransactions(sample);
  return sample;
}
