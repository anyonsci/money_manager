import {
  formatCurrency,
  formatSignedCurrency,
  formatDate,
  formatInputDate,
  getTransactionTypeLabel,
  getCategoryIcon,
} from '../src/formatters/index';

describe('Core Formatters', () => {
  describe('formatCurrency', () => {
    it('formats amount in INR by default', () => {
      const result = formatCurrency(1234.5);
      // Clean non-breaking spaces for testing
      const normalized = result.replace(/\u00a0/g, ' ');
      expect(normalized).toContain('1,234.50');
      expect(normalized).toMatch(/₹|INR/);
    });

    it('formats amount in USD with en-US locale', () => {
      const result = formatCurrency(1234.5, 'USD', 'en-US');
      expect(result).toBe('$1,234.50');
    });

    it('handles negative numbers', () => {
      const result = formatCurrency(-500, 'USD', 'en-US');
      expect(result).toBe('-$500.00');
    });

    it('handles 0 correctly', () => {
      const result = formatCurrency(0, 'USD', 'en-US');
      expect(result).toBe('$0.00');
    });

    it('falls back gracefully on invalid currency/locale error', () => {
      const spy = jest.spyOn(Intl, 'NumberFormat').mockImplementationOnce(() => {
        throw new Error('Invalid format');
      });
      const resUSD = formatCurrency(99.9, 'USD');
      expect(resUSD).toBe('$99.90');

      jest.spyOn(Intl, 'NumberFormat').mockImplementationOnce(() => {
        throw new Error('Invalid format');
      });
      const resINR = formatCurrency(99.9, 'INR');
      expect(resINR).toBe('₹99.90');

      jest.spyOn(Intl, 'NumberFormat').mockImplementationOnce(() => {
        throw new Error('Invalid format');
      });
      const resOther = formatCurrency(99.9, 'EUR');
      expect(resOther).toBe('99.90');

      spy.mockRestore();
    });
  });

  describe('formatSignedCurrency', () => {
    it('adds + sign for positive amount', () => {
      const result = formatSignedCurrency(250, 'USD', 'en-US');
      expect(result).toBe('+$250.00');
    });

    it('adds + sign for 0 amount', () => {
      const result = formatSignedCurrency(0, 'USD', 'en-US');
      expect(result).toBe('+$0.00');
    });

    it('adds - sign for negative amount', () => {
      const result = formatSignedCurrency(-250, 'USD', 'en-US');
      expect(result).toBe('-$250.00');
    });
  });

  describe('formatDate', () => {
    it('formats a valid date string with default options', () => {
      const result = formatDate('2025-01-15T00:00:00Z', undefined, 'en-US');
      expect(result).toContain('2025');
      expect(result).toContain('Jan');
    });

    it('formats a Date object', () => {
      const date = new Date(2025, 0, 15);
      const result = formatDate(date, undefined, 'en-US');
      expect(result).toBe('Jan 15, 2025');
    });

    it('accepts custom DateTimeFormat options', () => {
      const result = formatDate('2025-06-20T10:00:00Z', { month: 'long', year: 'numeric' }, 'en-US');
      expect(result).toContain('June');
      expect(result).toContain('2025');
    });

    it('returns empty string if dateString is falsy', () => {
      expect(formatDate('')).toBe('');
      expect(formatDate(null as unknown as string)).toBe('');
      expect(formatDate(undefined as unknown as string)).toBe('');
    });

    it('returns raw string if date is invalid', () => {
      expect(formatDate('invalid-date-string')).toBe('invalid-date-string');
    });
  });

  describe('formatInputDate', () => {
    it('formats date object to YYYY-MM-DD string', () => {
      const date = new Date(2025, 4, 9); // May 9, 2025
      expect(formatInputDate(date)).toBe('2025-05-09');
    });

    it('pads single-digit month and day with zeros', () => {
      const date = new Date(2025, 0, 5); // Jan 5, 2025
      expect(formatInputDate(date)).toBe('2025-01-05');
    });

    it('uses current date by default', () => {
      const formatted = formatInputDate();
      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('getTransactionTypeLabel', () => {
    it('returns "Income" for income', () => {
      expect(getTransactionTypeLabel('income')).toBe('Income');
    });

    it('returns "Expense" for expense', () => {
      expect(getTransactionTypeLabel('expense')).toBe('Expense');
    });
  });

  describe('getCategoryIcon', () => {
    it('returns matching icon for known categories', () => {
      expect(getCategoryIcon('food')).toBe('🍽️');
      expect(getCategoryIcon('travel')).toBe('✈️');
      expect(getCategoryIcon('entertainment')).toBe('🎬');
      expect(getCategoryIcon('need')).toBe('🛒');
      expect(getCategoryIcon('recurring')).toBe('🔄');
      expect(getCategoryIcon('material')).toBe('📦');
      expect(getCategoryIcon('medical')).toBe('🩺');
      expect(getCategoryIcon('wellness')).toBe('🧘');
      expect(getCategoryIcon('trip')).toBe('🧳');
      expect(getCategoryIcon('maintenance')).toBe('🔧');
      expect(getCategoryIcon('rent')).toBe('🏠');
      expect(getCategoryIcon('salary')).toBe('💼');
      expect(getCategoryIcon('investment')).toBe('📈');
      expect(getCategoryIcon('others')).toBe('🏷️');
    });

    it('is case-insensitive and trims whitespace', () => {
      expect(getCategoryIcon('  FOOD  ')).toBe('🍽️');
      expect(getCategoryIcon('SaLaRy')).toBe('💼');
    });

    it('returns default icon for unknown category or empty input', () => {
      expect(getCategoryIcon('unknown_cat')).toBe('🏷️');
      expect(getCategoryIcon('')).toBe('🏷️');
    });
  });
});
