import { ALLOWED_CATEGORIES, resolveCategory } from '../constants/categories';

export interface QuickEntryParts {
  amount: string;
  account: string;
  category: string;
  noteParts: string[];
  noteDelimiter?: string;
}

export interface QuickEntryParser {
  parse(input: string): QuickEntryParts | undefined;
}

export class CommaQuickEntryParser implements QuickEntryParser {
  parse(input: string): QuickEntryParts | undefined {
    if (!input.includes(',')) {
      return undefined;
    }

    const [amount, account, category, ...noteParts] = input.split(',').map(s => s.trim());
    if (amount && account && category) {
      return { amount, account, category, noteParts, noteDelimiter: ', ' };
    }

    return undefined;
  }
}

export class DoubleSpaceQuickEntryParser implements QuickEntryParser {
  parse(input: string): QuickEntryParts | undefined {
    const parts = input.split(/\s{2,}/).map(p => p.trim()).filter(Boolean);
    if (parts.length >= 3) {
      const [amount, account, category, ...noteParts] = parts;
      return { amount, account, category, noteParts, noteDelimiter: ' ' };
    }

    return undefined;
  }
}

export class SingleSpaceQuickEntryParser implements QuickEntryParser {
  parse(input: string): QuickEntryParts | undefined {
    const categoryPattern = ALLOWED_CATEGORIES.join('|');
    const match = input.match(
      new RegExp(`^([+-]?\\S+)\\s+(\\S+(?:\\s\\S+)?)\\s+(${categoryPattern})(?:\\.([^\\s]+))?(?:\\s+(.+))?$`, 'i')
    );

    if (match) {
      const [, amount, account, category, subCategory, note] = match;
      return {
        amount,
        account,
        category: subCategory ? `${category}.${subCategory}` : category,
        noteParts: note ? [note] : [],
        noteDelimiter: ' '
      };
    }

    // Prefix matching fallback for single space delimited entries
    // e.g. "30 HDFC f Lunch" or "30 diners cc f Lunch"
    const tokens = input.trim().split(/\s+/);
    if (tokens.length >= 3) {
      const [amountToken] = tokens;
      const cleanAmount = amountToken.replace(/^[+-]/, '');
      if (!isNaN(parseFloat(cleanAmount)) && parseFloat(cleanAmount) > 0) {
        // Test token index 2 as category prefix (1-word account)
        const catToken2 = tokens[2].split('.')[0];
        const res2 = resolveCategory(catToken2);
        if (res2.canonicalCategory || res2.ambiguous) {
          return {
            amount: amountToken,
            account: tokens[1],
            category: tokens[2],
            noteParts: tokens.slice(3),
            noteDelimiter: ' '
          };
        }

        // Test token index 3 as category prefix (2-word account)
        if (tokens.length >= 4) {
          const catToken3 = tokens[3].split('.')[0];
          const res3 = resolveCategory(catToken3);
          if (res3.canonicalCategory || res3.ambiguous) {
            return {
              amount: amountToken,
              account: `${tokens[1]} ${tokens[2]}`,
              category: tokens[3],
              noteParts: tokens.slice(4),
              noteDelimiter: ' '
            };
          }
        }
      }
    }

    return undefined;
  }
}