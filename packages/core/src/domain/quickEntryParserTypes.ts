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

export interface QuickEntryParts {
  amount: string;
  account: string;
  category: string;
  subCategory?: string;
  noteParts: string[];
  noteDelimiter?: string;
}

export interface PartialQuickEntryParts {
  amount?: string;
  account?: string;
  category?: string;
  subCategory?: string;
  noteParts?: string[];
  noteDelimiter?: string;
}

export interface QuickEntryParser {
  readonly name: string;

  /**
   * Checks if this parser can handle the given input syntax.
   */
  canParse(input: string): boolean;

  /**
   * Attempts full parse of entry. Returns undefined if syntax doesn't match or is incomplete.
   */
  parse(input: string): QuickEntryParts | undefined;

  /**
   * Attempts partial parse of whatever tokens have been entered so far.
   */
  parsePartial?(input: string): PartialQuickEntryParts | undefined;

  /**
   * Detects the active field and replacement range at the cursor position.
   * Optional: if omitted, auto-fill/suggestions are simply skipped for this parser.
   */
  detectField?(input: string, cursorPosition: number): QuickEntryFieldState | undefined;

  /**
   * Applies completion (e.g. account or category selection) for this parser's syntax.
   * Optional: if omitted, default completion strategy is used.
   */
  applyCompletion?(
    input: string,
    completion: string,
    state: QuickEntryFieldState
  ): { newInput: string; newCursor: number } | undefined;
}
