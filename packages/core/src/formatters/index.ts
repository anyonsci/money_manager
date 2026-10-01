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

const SHORT_MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

export const formatTransactionDateParts = (
  dateString?: string | Date
): { dayMonth: string; year: string } => {
  if (!dateString) return { dayMonth: '--', year: '----' };

  if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString.trim())) {
    const [y, m, d] = dateString.trim().split('-');
    const mIndex = parseInt(m, 10) - 1;
    const monthName = SHORT_MONTH_NAMES[mIndex] || m;
    const day = String(parseInt(d, 10)).padStart(2, '0');
    return {
      dayMonth: `${day} ${monthName}`,
      year: y,
    };
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    const s = String(dateString);
    return { dayMonth: s.slice(0, 6) || s, year: '' };
  }

  const day = String(date.getDate()).padStart(2, '0');
  const monthName = SHORT_MONTH_NAMES[date.getMonth()] || '---';
  const year = String(date.getFullYear());

  return {
    dayMonth: `${day} ${monthName}`,
    year,
  };
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

export const getCategoryIcon = (category?: unknown): string => {
  const normalized = String(category ?? '').trim().toLowerCase();
  if (!normalized) return '🏷️';

  if (CATEGORY_ICON_MAP[normalized]) {
    return CATEGORY_ICON_MAP[normalized];
  }

  const matched = Object.keys(CATEGORY_ICON_MAP).find(
    (cat) =>
      cat !== 'others' &&
      (normalized.startsWith(cat) || normalized.split(/[\s&/_-]+/).includes(cat))
  );

  return (matched && CATEGORY_ICON_MAP[matched]) || '🏷️';
};
