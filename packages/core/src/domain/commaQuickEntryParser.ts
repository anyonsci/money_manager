import type {
  QuickEntryParser,
  QuickEntryParts,
  PartialQuickEntryParts,
  QuickEntryFieldState,
  QuickEntryActiveField,
} from './quickEntryParserTypes';

export class CommaQuickEntryParser implements QuickEntryParser {
  readonly name = 'comma';

  canParse(input: string): boolean {
    return input.includes(',');
  }

  parse(input: string): QuickEntryParts | undefined {
    if (!this.canParse(input)) {
      return undefined;
    }

    const [amount, account, category, ...noteParts] = input.split(',').map(s => s.trim());
    if (amount && account && category) {
      return { amount, account, category, noteParts, noteDelimiter: ', ' };
    }

    return undefined;
  }

  parsePartial(input: string): PartialQuickEntryParts | undefined {
    if (!this.canParse(input)) {
      return undefined;
    }

    const parts = input.split(',').map(s => s.trim());
    const [amount, account, rawCat, ...noteParts] = parts;

    let category = rawCat;
    let subCategory: string | undefined;
    if (category && category.includes('.')) {
      const dot = category.indexOf('.');
      subCategory = category.slice(dot + 1).trim();
      category = category.slice(0, dot).trim();
    }

    return {
      amount: amount || undefined,
      account: account || undefined,
      category: category || undefined,
      subCategory: subCategory || undefined,
      noteParts: noteParts.length > 0 ? noteParts : undefined,
      noteDelimiter: ', '
    };
  }

  detectField(input: string, cursorPosition: number): QuickEntryFieldState | undefined {
    if (!this.canParse(input)) {
      return undefined;
    }

    const clampedCursor = Math.max(0, Math.min(input.length, cursorPosition));
    const rawTokens = input.split(',');
    let currentIdx = 0;
    let tokenIndex = 0;
    let activeTokenStart = 0;
    let activeTokenEnd = input.length;

    for (let i = 0; i < rawTokens.length; i++) {
      const token = rawTokens[i];
      const tokenStart = currentIdx;
      const tokenEnd = tokenStart + token.length;

      if (clampedCursor >= tokenStart && clampedCursor <= tokenEnd + (i < rawTokens.length - 1 ? 1 : 0)) {
        tokenIndex = i;
        activeTokenStart = tokenStart;
        activeTokenEnd = tokenEnd;
        break;
      }
      currentIdx = tokenEnd + 1; // +1 for comma
    }

    const rawTokenText = input.slice(activeTokenStart, activeTokenEnd);
    const leadingSpaces = rawTokenText.match(/^\s*/)?.[0].length || 0;
    const trimmed = rawTokenText.trim();
    const start = activeTokenStart + leadingSpaces;
    const end = start + trimmed.length;

    let field: QuickEntryActiveField = 'none';
    if (tokenIndex === 0) field = 'amount';
    else if (tokenIndex === 1) field = 'account';
    else if (tokenIndex === 2) field = 'category';
    else field = 'note';

    return {
      field,
      query: trimmed,
      tokenIndex,
      replaceRange: { start, end },
      delimiter: ','
    };
  }

  applyCompletion(
    input: string,
    completion: string,
    state: QuickEntryFieldState
  ): { newInput: string; newCursor: number } | undefined {
    if (state.delimiter !== ',') {
      return undefined;
    }

    let before = input.slice(0, state.replaceRange.start);
    const after = input.slice(state.replaceRange.end);

    if (!before.endsWith(', ') && before.endsWith(',')) {
      before = `${before} `;
    }

    const cleanAfter = after.replace(/^[,\s]+/, '');
    const replacementWithSep = `${completion}, `;

    const newInput = `${before}${replacementWithSep}${cleanAfter}`;
    const newCursor = `${before}${replacementWithSep}`.length;

    return { newInput, newCursor };
  }
}
