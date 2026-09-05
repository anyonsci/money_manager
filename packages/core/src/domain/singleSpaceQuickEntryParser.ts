import { ALLOWED_CATEGORIES, resolveCategory } from '../constants/categories';
import type {
  QuickEntryParser,
  QuickEntryParts,
  PartialQuickEntryParts,
  QuickEntryFieldState,
  QuickEntryActiveField,
} from './quickEntryParserTypes';

export class SingleSpaceQuickEntryParser implements QuickEntryParser {
  readonly name = 'single-space';

  canParse(input: string): boolean {
    return !input.includes(',') && !/\s{2,}/.test(input);
  }

  parse(input: string): QuickEntryParts | undefined {
    const categoryPattern = ALLOWED_CATEGORIES.join('|');
    const match = input.match(
      new RegExp(`^([+-]?\\S+)\\s+(\\S+(?:\\s\\S+)?)\\s+(${categoryPattern})(?:\\.([^\\s]+))?(?:\\s+(.+))?$`, 'i')
    );

    if (match) {
      const [, amount, account, category, subCategory, note] = match;
      const clean = amount.replace(/^[+-]/, '');
      if (!isNaN(parseFloat(clean)) && parseFloat(clean) > 0) {
        return {
          amount,
          account,
          category: subCategory ? `${category}.${subCategory}` : category,
          noteParts: note ? [note] : [],
          noteDelimiter: ' '
        };
      }
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

  parsePartial(input: string): PartialQuickEntryParts | undefined {
    const trimmed = input.trim();
    if (!trimmed) {
      return undefined;
    }

    const tokens = trimmed.split(/\s+/).filter(Boolean);
    if (tokens.length === 0) {
      return undefined;
    }

    const amount = tokens[0];
    let account: string | undefined;
    let category: string | undefined;
    let subCategory: string | undefined;
    let noteParts: string[] | undefined;

    if (tokens.length >= 2) {
      // Check if token 2 or 3 is a category to determine if account is 1 or 2 words
      let isTwoWordAccount = false;
      if (tokens.length >= 4) {
        const catCandidate = tokens[3].split('.')[0];
        const res3 = resolveCategory(catCandidate);
        if (res3.canonicalCategory || res3.ambiguous) {
          isTwoWordAccount = true;
        }
      }

      if (isTwoWordAccount) {
        account = `${tokens[1]} ${tokens[2]}`;
        category = tokens[3];
        noteParts = tokens.length > 4 ? tokens.slice(4) : undefined;
      } else {
        account = tokens[1];
        if (tokens.length >= 3) {
          category = tokens[2];
          noteParts = tokens.length > 3 ? tokens.slice(3) : undefined;
        }
      }

      if (category && category.includes('.')) {
        const dot = category.indexOf('.');
        subCategory = category.slice(dot + 1).trim();
        category = category.slice(0, dot).trim();
      }
    }

    return {
      amount,
      account,
      category,
      subCategory,
      noteParts,
      noteDelimiter: ' '
    };
  }

  detectField(input: string, cursorPosition: number): QuickEntryFieldState | undefined {
    const clampedCursor = Math.max(0, Math.min(input.length, cursorPosition));
    const textBeforeCursor = input.slice(0, clampedCursor);
    const wordsBefore = textBeforeCursor.trimStart().split(/\s+/).filter(Boolean);
    const trailingSpaceInBefore = /\s$/.test(textBeforeCursor);

    let tokenIndex = 0;
    if (trailingSpaceInBefore) {
      tokenIndex = wordsBefore.length;
    } else {
      tokenIndex = Math.max(0, wordsBefore.length - 1);
    }

    const allWords = input.trimStart().split(/\s+/);
    const query = trailingSpaceInBefore ? '' : (allWords[tokenIndex] || '');

    let start = clampedCursor - query.length;
    let end = clampedCursor;
    if (trailingSpaceInBefore) {
      start = clampedCursor;
      end = clampedCursor;
    }

    let field: QuickEntryActiveField = 'none';
    if (tokenIndex === 0) field = 'amount';
    else if (tokenIndex === 1) field = 'account';
    else if (tokenIndex === 2) field = 'category';
    else field = 'note';

    return {
      field,
      query,
      tokenIndex,
      replaceRange: { start: Math.max(0, start), end: Math.max(0, end) },
      delimiter: ' '
    };
  }

  applyCompletion(
    input: string,
    completion: string,
    state: QuickEntryFieldState
  ): { newInput: string; newCursor: number } | undefined {
    let before = input.slice(0, state.replaceRange.start);
    const after = input.slice(state.replaceRange.end);

    if (before.length > 0) {
      before = before.replace(/\s*$/, '  ');
    }

    const cleanAfter = after.replace(/^[,\s]+/, '');
    const replacementWithSep = `${completion}  `;

    const newInput = `${before}${replacementWithSep}${cleanAfter}`;
    const newCursor = `${before}${replacementWithSep}`.length;

    return { newInput, newCursor };
  }
}
