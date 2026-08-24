import { TransactionFormValues } from '../types/index';
import { ALLOWED_CATEGORIES, isAllowedCategory, getCanonicalCategory } from '../constants/categories';
import { formatInputDate } from '../formatters/index';

export interface ParsedQuickEntryResult {
  valid: boolean;
  values?: TransactionFormValues;
  error?: string;
}

export const parseCsvTransaction = (input: string, defaultDate?: string): ParsedQuickEntryResult => {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      valid: false,
      error: 'Enter entry as: amount  account  category [. subcategory]  [note] (or with commas)'
    };
  }

  const parts = trimmed
    .split(/,|\s{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length < 3) {
    return {
      valid: false,
      error: 'Requires at least 3 parts (separated by commas or 2+ spaces): amount, account, category'
    };
  }

  const rawAmountStr = parts[0];
  const rawAccount = parts[1];
  const rawCategoryPart = parts[2];
  const note = parts.slice(3).join(', ').trim();

  const isPositive = rawAmountStr.startsWith('+');
  const isExplicitNegative = rawAmountStr.startsWith('-');
  const cleanAmountStr = rawAmountStr.replace(/^[+-]/, '').trim();
  const numAmount = parseFloat(cleanAmountStr);

  if (isNaN(numAmount) || numAmount <= 0) {
    return {
      valid: false,
      error: `Invalid amount "${rawAmountStr}". Must be a number greater than 0.`
    };
  }

  if (!rawAccount) {
    return { valid: false, error: 'Account cannot be empty.' };
  }

  if (!rawCategoryPart) {
    return { valid: false, error: 'Category cannot be empty.' };
  }

  let category = rawCategoryPart;
  let subCategory = '';
  if (rawCategoryPart.includes('.')) {
    const dotIndex = rawCategoryPart.indexOf('.');
    category = rawCategoryPart.substring(0, dotIndex).trim();
    subCategory = rawCategoryPart.substring(dotIndex + 1).trim();
  }

  if (!category) {
    return { valid: false, error: 'Category name cannot be empty.' };
  }

  if (!isAllowedCategory(category)) {
    return {
      valid: false,
      error: `Category "${category}" is invalid. Allowed categories: ${ALLOWED_CATEGORIES.join(', ')}`
    };
  }

  category = getCanonicalCategory(category);

  let type: 'expense' | 'income' = 'expense';
  const catLower = category.toLowerCase();
  if (isPositive || ['salary', 'income', 'freelance', 'deposit', 'paycheck'].includes(catLower)) {
    type = 'income';
  } else if (isExplicitNegative) {
    type = 'expense';
  }

  const date = defaultDate || formatInputDate();

  return {
    valid: true,
    values: {
      amount: String(numAmount),
      account: rawAccount,
      category,
      subCategory,
      note,
      type,
      date
    }
  };
};
