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

const CATEGORY_ICON_MAP: Record<string, string> = {
  need: '🛒',
  food: '🍽️',
  travel: '✈️',
  entertainment: '🎬',
  recurring: '🔄',
  material: '📦',
  medical: '🩺',
  wellness: '🧘',
  trip: '🧳',
  maintenance: '🔧',
  rent: '🏠',
  investment: '📈',
  others: '🏷️'
};

export const getCategoryIcon = (category: string): string => {
  const key = (category || '').toLowerCase().trim();
  return CATEGORY_ICON_MAP[key] || '🏷️';
};
