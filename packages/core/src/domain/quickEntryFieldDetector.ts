import {
  QuickEntryActiveField,
  QuickEntryFieldState,
  QuickEntryParser
} from './quickEntryParserTypes';
import { defaultQuickEntryParsers } from './quickEntryParser';

export type { QuickEntryActiveField, QuickEntryFieldState };

/**
 * Detects the active field, current query, and replacement boundaries
 * within a quick entry input string at the specified cursor position
 * by delegating to registered QuickEntryParsers.
 */
export const detectQuickEntryField = (
  input: string,
  cursorPosition?: number,
  parsers: QuickEntryParser[] = defaultQuickEntryParsers
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

  for (const parser of parsers) {
    if (parser.canParse(input) && parser.detectField) {
      const state = parser.detectField(input, clampedCursor);
      if (state) {
        return state;
      }
    }
  }

  // Fallback: if no parser matched or implemented detectField, auto-fill is skipped
  return {
    field: 'none',
    query: '',
    tokenIndex: 0,
    replaceRange: { start: 0, end: 0 },
    delimiter: ' '
  };
};

/**
 * Replaces the active field query with the selected completion and appends appropriate delimiter
 * by delegating to the appropriate QuickEntryParser.
 */
export const applyQuickEntryCompletion = (
  input: string,
  completion: string,
  state: QuickEntryFieldState,
  parsers: QuickEntryParser[] = defaultQuickEntryParsers
): { newInput: string; newCursor: number } => {
  for (const parser of parsers) {
    if (parser.applyCompletion) {
      const result = parser.applyCompletion(input, completion, state);
      if (result) {
        return result;
      }
    }
  }

  // Default fallback
  let before = input.slice(0, state.replaceRange.start);
  const after = input.slice(state.replaceRange.end);
  const trailingSep = state.delimiter === ',' ? ', ' : '  ';

  if (state.delimiter === ',') {
    if (!before.endsWith(', ') && before.endsWith(',')) {
      before = `${before} `;
    }
  } else if (before.length > 0) {
    before = before.replace(/\s*$/, '  ');
  }

  const cleanAfter = after.replace(/^[,\s]+/, '');
  const replacementWithSep = `${completion}${trailingSep}`;

  return {
    newInput: `${before}${replacementWithSep}${cleanAfter}`,
    newCursor: `${before}${replacementWithSep}`.length
  };
};
