export const formatCurrency = (
  amount: number,
  currency: string = 'INR',
  locale: string = 'en-IN'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency || 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    const symbol = currency === 'USD' ? '$' : currency === 'INR' ? '₹' : '';
    return `${symbol}${amount.toFixed(2)}`;
  }
};

export const formatSignedCurrency = (
  amount: number,
  currency: string = 'INR',
  locale: string = 'en-IN'
): string => {
  const abs = Math.abs(amount);
  const formatted = formatCurrency(abs, currency, locale);
  return amount >= 0 ? `+${formatted}` : `-${formatted}`;
};

export const formatDate = (
  dateString: string | Date,
  options?: Intl.DateTimeFormatOptions,
  locale: string = 'en-US'
): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return String(dateString);
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options
  };

  return new Intl.DateTimeFormat(locale, defaultOptions).format(date);
};

export const formatInputDate = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTransactionTypeLabel = (type: 'expense' | 'income') =>
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
  salary: '💼',
  investment: '📈',
  others: '🏷️'
};

export const getCategoryIcon = (category: string): string => {
  const key = (category || '').toLowerCase().trim();
  return CATEGORY_ICON_MAP[key] || '🏷️';
};
