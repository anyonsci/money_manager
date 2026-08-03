import { Transaction, TransactionType } from '../types';

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(value);

export const formatSignedCurrency = (value: number) => {
  const abs = Math.abs(value);
  const formatted = formatCurrency(abs);
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
};

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(value));

export const getTransactionTypeLabel = (type: TransactionType) =>
  type === 'income' ? 'Income' : 'Expense';

export const getCategoryIcon = (category: string) => {
  const lower = category.toLowerCase();
  if (lower.includes('food') || lower.includes('grocery')) return '🍽️';
  if (lower.includes('travel') || lower.includes('transport')) return '🚗';
  if (lower.includes('rent') || lower.includes('home')) return '🏠';
  if (lower.includes('health')) return '🩺';
  if (lower.includes('salary') || lower.includes('income')) return '💼';
  return '🧾';
};
