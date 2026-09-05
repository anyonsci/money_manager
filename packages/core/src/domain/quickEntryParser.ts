import { TransactionFormValues } from '../types/index';
import { ALLOWED_CATEGORIES, resolveCategory } from '../constants/categories';
import { formatInputDate } from '../formatters/index';
import type {
  QuickEntryParts,
  PartialQuickEntryParts,
  QuickEntryParser,
} from './quickEntryParserTypes';
import { CommaQuickEntryParser } from './commaQuickEntryParser';
import { DoubleSpaceQuickEntryParser } from './doubleSpaceQuickEntryParser';
import { SingleSpaceQuickEntryParser } from './singleSpaceQuickEntryParser';

export interface ParsedQuickEntryResult {
  valid: boolean;
  values?: TransactionFormValues;
  error?: string;
}

export interface QuickEntryProgressResult {
  valid: boolean;
  stage: 'empty' | 'amount' | 'account' | 'category' | 'note' | 'complete' | 'error';
  values?: TransactionFormValues;
  partial: {
    amount?: string;
    rawAmount?: string;
    account?: string;
    category?: string;
    canonicalCategory?: string;
    subCategory?: string;
    note?: string;
    type?: 'expense' | 'income';
    isValidAmount?: boolean;
  };
  hint?: string;
  error?: string;
}

export const defaultQuickEntryParsers: QuickEntryParser[] = [
  new CommaQuickEntryParser(),
  new DoubleSpaceQuickEntryParser(),
  new SingleSpaceQuickEntryParser()
];

export const quickEntryParsers = defaultQuickEntryParsers;

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
  let subCategory = parts.subCategory || '';
  if (!subCategory && rawCategoryPart.includes('.')) {
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

export const parseCsvTransaction = (
  input: string,
  defaultDate?: string,
  parsers = defaultQuickEntryParsers
): ParsedQuickEntryResult => {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      valid: false,
      error: 'Enter entry as: amount  account  category [. subcategory]  [note] (or with commas)'
    };
  }

  for (const parser of parsers) {
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

export const parseQuickEntry = (
  input: string,
  defaultDate?: string,
  parsers = defaultQuickEntryParsers
): QuickEntryProgressResult => {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      valid: false,
      stage: 'empty',
      partial: {},
      hint: 'Type amount to start (e.g. 30  HDFC  food)'
    };
  }

  // 1. Check for complete, valid parse
  for (const parser of parsers) {
    const fullParts = parser.parse(trimmed);
    if (fullParts) {
      const res = buildTransaction(fullParts, defaultDate);
      if (res.valid && res.values) {
        return {
          valid: true,
          stage: 'complete',
          values: res.values,
          partial: {
            amount: res.values.amount,
            rawAmount: fullParts.amount,
            account: res.values.account,
            category: res.values.category,
            canonicalCategory: res.values.category,
            subCategory: res.values.subCategory,
            note: res.values.note,
            type: res.values.type,
            isValidAmount: true
          },
          hint: 'Ready to save ↵'
        };
      }
      if (res.error) {
        const rawCat = fullParts.category.split('.')[0];
        const resCat = resolveCategory(rawCat);
        if (resCat.ambiguous) {
          return {
            valid: false,
            stage: 'category',
            hint: res.error,
            error: res.error,
            partial: {
              rawAmount: fullParts.amount,
              account: fullParts.account,
              category: fullParts.category,
              type: fullParts.amount.startsWith('+') ? 'income' : 'expense'
            }
          };
        }

        return {
          valid: false,
          stage: 'error',
          error: res.error,
          partial: {
            rawAmount: fullParts.amount,
            account: fullParts.account,
            category: fullParts.category
          }
        };
      }
    }
  }

  // 2. Check for partial parse across parsers
  let partialParts: PartialQuickEntryParts | undefined;
  for (const parser of parsers) {
    if (parser.canParse(trimmed) && parser.parsePartial) {
      partialParts = parser.parsePartial(trimmed);
      if (partialParts) break;
    }
  }

  if (!partialParts) {
    const single = parsers.find(p => p.name === 'single-space');
    partialParts = single?.parsePartial?.(trimmed);
  }

  const rawAmount = partialParts?.amount;
  if (!rawAmount) {
    return {
      valid: false,
      stage: 'empty',
      partial: {},
      hint: 'Type amount to start (e.g. 30  HDFC  food)'
    };
  }

  const isPositive = rawAmount.startsWith('+');
  const isExplicitNegative = rawAmount.startsWith('-');
  const cleanAmount = rawAmount.replace(/^[+-]/, '').trim();
  const numAmount = parseFloat(cleanAmount);
  const isValidAmount = !isNaN(numAmount) && numAmount > 0;

  if (!isValidAmount) {
    return {
      valid: false,
      stage: 'error',
      error: `Invalid amount "${rawAmount}". Must be a number greater than 0.`,
      partial: { rawAmount, isValidAmount: false }
    };
  }

  const amountStr = String(numAmount);
  let type: 'expense' | 'income' = isPositive ? 'income' : 'expense';
  const account = partialParts?.account?.trim();

  if (!account) {
    return {
      valid: false,
      stage: 'amount',
      partial: { amount: amountStr, rawAmount, type, isValidAmount: true },
      hint: 'Select or type Account'
    };
  }

  const rawCategory = partialParts?.category?.trim();
  const subCategory = partialParts?.subCategory?.trim();

  if (!rawCategory) {
    return {
      valid: false,
      stage: 'account',
      partial: { amount: amountStr, rawAmount, account, type, isValidAmount: true },
      hint: 'Select or type Category'
    };
  }

  const resolution = resolveCategory(rawCategory);
  if (resolution.ambiguous) {
    return {
      valid: false,
      stage: 'category',
      partial: {
        amount: amountStr,
        rawAmount,
        account,
        category: rawCategory,
        subCategory,
        type,
        isValidAmount: true
      },
      hint: `Matches multiple: ${resolution.matches.join(', ')}. Type more characters.`
    };
  }

  if (!resolution.canonicalCategory) {
    return {
      valid: false,
      stage: 'error',
      error: `Category "${rawCategory}" is invalid. Allowed categories: ${ALLOWED_CATEGORIES.join(', ')}`,
      partial: {
        amount: amountStr,
        rawAmount,
        account,
        category: rawCategory,
        subCategory,
        type,
        isValidAmount: true
      }
    };
  }

  const canonicalCategory = resolution.canonicalCategory;
  const catLower = canonicalCategory.toLowerCase();
  if (isPositive || ['salary', 'income', 'freelance', 'deposit', 'paycheck'].includes(catLower)) {
    type = 'income';
  } else if (isExplicitNegative) {
    type = 'expense';
  }

  const note = partialParts?.noteParts ? partialParts.noteParts.join(partialParts.noteDelimiter || ' ').trim() : '';
  const values: TransactionFormValues = {
    amount: amountStr,
    account,
    category: canonicalCategory,
    subCategory: subCategory || '',
    note,
    type,
    date: defaultDate || formatInputDate()
  };

  return {
    valid: true,
    stage: 'complete',
    values,
    partial: {
      amount: amountStr,
      rawAmount,
      account,
      category: canonicalCategory,
      canonicalCategory,
      subCategory,
      note,
      type,
      isValidAmount: true
    },
    hint: 'Ready to save ↵'
  };
};

