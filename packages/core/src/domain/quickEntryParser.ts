import { TransactionFormValues } from '../types/index';
import { ALLOWED_CATEGORIES, resolveCategory } from '../constants/categories';
import { formatInputDate } from '../formatters/index';
import {
  CommaQuickEntryParser,
  DoubleSpaceQuickEntryParser,
  QuickEntryParts,
  QuickEntryParser,
  SingleSpaceQuickEntryParser
} from './quickEntryParsers';

export interface ParsedQuickEntryResult {
  valid: boolean;
  values?: TransactionFormValues;
  error?: string;
}

const quickEntryParsers: QuickEntryParser[] = [
  new CommaQuickEntryParser(),
  new DoubleSpaceQuickEntryParser(),
  new SingleSpaceQuickEntryParser()
];

const buildTransaction = (parts: QuickEntryParts, defaultDate?: string): ParsedQuickEntryResult => {
  const rawAmountStr = parts.amount;
  const rawAccount = parts.account;
  const rawCategoryPart = parts.category;
  const delimiter = parts.noteDelimiter ?? ', ';
  const note = parts.noteParts.join(delimiter).trim();

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

  const resolution = resolveCategory(category);
  if (resolution.ambiguous) {
    return {
      valid: false,
      error: `Category prefix "${category}" matches multiple: ${resolution.matches.join(', ')}. Please type more characters.`
    };
  }

  if (!resolution.canonicalCategory) {
    return {
      valid: false,
      error: `Category "${category}" is invalid. Allowed categories: ${ALLOWED_CATEGORIES.join(', ')}`
    };
  }

  category = resolution.canonicalCategory;

  let type: 'expense' | 'income' = 'expense';
  const catLower = category.toLowerCase();
  if (isPositive || ['salary', 'income', 'freelance', 'deposit', 'paycheck'].includes(catLower)) {
    type = 'income';
  } else if (isExplicitNegative) {
    type = 'expense';
  }

  return {
    valid: true,
    values: {
      amount: String(numAmount),
      account: rawAccount,
      category,
      subCategory,
      note,
      type,
      date: defaultDate || formatInputDate()
    }
  };
};

export const parseCsvTransaction = (input: string, defaultDate?: string): ParsedQuickEntryResult => {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      valid: false,
      error: 'Enter entry as: amount  account  category [. subcategory]  [note] (or with commas)'
    };
  }

  for (const parser of quickEntryParsers) {
    const parts = parser.parse(trimmed);
    if (parts) {
      return buildTransaction(parts, defaultDate);
    }
  }

  return {
    valid: false,
    error: 'Requires at least 3 parts (separated by commas or 2+ spaces): amount, account, category'
  };
};
