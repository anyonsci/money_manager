import type {
  QuickEntryParser,
  QuickEntryParts,
  PartialQuickEntryParts,
  QuickEntryFieldState,
  QuickEntryActiveField,
} from './quickEntryParserTypes';

export class DoubleSpaceQuickEntryParser implements QuickEntryParser {
  readonly name = 'double-space';

  canParse(input: string): boolean {
    return /\s{2,}/.test(input);
  }

  parse(input: string): QuickEntryParts | undefined {
    if (!this.canParse(input)) {
      return undefined;
    }

    const parts = input.split(/\s{2,}/).map(p => p.trim()).filter(Boolean);
    if (parts.length >= 3) {
      const [amount, account, category, ...noteParts] = parts;
      return { amount, account, category, noteParts, noteDelimiter: ' ' };
    }

    return undefined;
  }

  parsePartial(input: string): PartialQuickEntryParts | undefined {
    if (!this.canParse(input)) {
      return undefined;
    }

    const parts = input.split(/\s{2,}/).map(p => p.trim());
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
      noteParts: noteParts.length > 0 ? noteParts.filter(Boolean) : undefined,
      noteDelimiter: ' '
    };
  }

  detectField(input: string, cursorPosition: number): QuickEntryFieldState | undefined {
    if (!this.canParse(input)) {
      return undefined;
    }

    const clampedCursor = Math.max(0, Math.min(input.length, cursorPosition));
    const doubleSpaceRegex = /\s{2,}/g;
    const matchIndices: number[] = [];
    let m: RegExpExecArray | null;
    while ((m = doubleSpaceRegex.exec(input)) !== null) {
      matchIndices.push(m.index);
    }

    const segments: Array<{ start: number; end: number; text: string }> = [];
    let lastEnd = 0;
    for (const matchIdx of matchIndices) {
      segments.push({
        start: lastEnd,
        end: matchIdx,
        text: input.slice(lastEnd, matchIdx)
      });
      const wsMatch = input.slice(matchIdx).match(/^\s{2,}/);
      const wsLen = wsMatch ? wsMatch[0].length : 2;
      lastEnd = matchIdx + wsLen;
    }
    segments.push({
      start: lastEnd,
      end: input.length,
      text: input.slice(lastEnd)
    });

    let tokenIndex = segments.length - 1;
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      if (clampedCursor <= seg.end || i === segments.length - 1) {
        tokenIndex = i;
        break;
      }
    }

    const activeSeg = segments[tokenIndex];
    const leadingSpaces = activeSeg.text.match(/^\s*/)?.[0].length || 0;
    const trimmed = activeSeg.text.trim();
    const start = activeSeg.start + leadingSpaces;
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
      delimiter: '  '
    };
  }

  applyCompletion(
    input: string,
    completion: string,
    state: QuickEntryFieldState
  ): { newInput: string; newCursor: number } | undefined {
    if (state.delimiter !== '  ') {
      return undefined;
    }

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
