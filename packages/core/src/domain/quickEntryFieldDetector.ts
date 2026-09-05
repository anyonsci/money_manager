export type QuickEntryActiveField = 'amount' | 'account' | 'category' | 'note' | 'none';

export interface QuickEntryFieldState {
  field: QuickEntryActiveField;
  query: string;
  tokenIndex: number;
  replaceRange: {
    start: number;
    end: number;
  };
  delimiter: ',' | '  ' | ' ';
}

/**
 * Detects the active field, current query, and replacement boundaries
 * within a quick entry input string at the specified cursor position.
 */
export const detectQuickEntryField = (
  input: string,
  cursorPosition?: number
): QuickEntryFieldState => {
  const cursor = cursorPosition !== undefined ? cursorPosition : input.length;
  const clampedCursor = Math.max(0, Math.min(input.length, cursor));

  if (!input.trim()) {
    return {
      field: 'amount',
      query: '',
      tokenIndex: 0,
      replaceRange: { start: 0, end: input.length },
      delimiter: '  '
    };
  }

  // 1. Comma-separated input
  if (input.includes(',')) {
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
    // Find non-whitespace bounds within the token
    const leadingSpaces = rawTokenText.match(/^\s*/)?.[0].length || 0;
    const trimmed = rawTokenText.trim();
    const query = trimmed;
    const start = activeTokenStart + leadingSpaces;
    const end = start + trimmed.length;

    let field: QuickEntryActiveField = 'none';
    if (tokenIndex === 0) field = 'amount';
    else if (tokenIndex === 1) field = 'account';
    else if (tokenIndex === 2) field = 'category';
    else field = 'note';

    return {
      field,
      query,
      tokenIndex,
      replaceRange: { start, end },
      delimiter: ','
    };
  }

  // 2. Double-space (or multiple spaces) separated input
  if (/\s{2,}/.test(input)) {
    const doubleSpaceRegex = /\s{2,}/g;
    const matchIndices: number[] = [];
    let m;
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
      // Find where whitespace block ends
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

  // 3. Single-space separated input
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

  // Find start and end of query in input
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
};

/**
 * Replaces the active field query with the selected completion and appends appropriate delimiter.
 */
export const applyQuickEntryCompletion = (
  input: string,
  completion: string,
  state: QuickEntryFieldState
): { newInput: string; newCursor: number } => {
  let before = input.slice(0, state.replaceRange.start);
  const after = input.slice(state.replaceRange.end);

  const trailingSep = state.delimiter === ',' ? ', ' : '  ';

  // Ensure consistent separation before the completion
  if (state.delimiter === ',') {
    if (!before.endsWith(', ') && before.endsWith(',')) {
      before = `${before} `;
    }
  } else {
    // For space delimiters, ensure double-space before the token if preceded by another token
    if (before.length > 0) {
      before = before.replace(/\s*$/, '  ');
    }
  }

  // If the text immediately following already begins with delimiter, don't duplicate
  const cleanAfter = after.replace(/^[,\s]+/, '');
  const replacementWithSep = `${completion}${trailingSep}`;

  const newInput = `${before}${replacementWithSep}${cleanAfter}`;
  const newCursor = `${before}${replacementWithSep}`.length;

  return {
    newInput,
    newCursor
  };
};
