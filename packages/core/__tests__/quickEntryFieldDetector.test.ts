import {
  detectQuickEntryField,
  applyQuickEntryCompletion
} from '../src/domain/quickEntryFieldDetector';

describe('quickEntryFieldDetector', () => {
  describe('detectQuickEntryField', () => {
    test('returns amount field for empty input', () => {
      const state = detectQuickEntryField('');
      expect(state.field).toBe('amount');
      expect(state.query).toBe('');
      expect(state.tokenIndex).toBe(0);
    });

    test('detects double-space separated fields', () => {
      // 1. Amount
      const s1 = detectQuickEntryField('30');
      expect(s1.field).toBe('amount');
      expect(s1.query).toBe('30');

      // 2. Account after double space
      const s2 = detectQuickEntryField('30  ');
      expect(s2.field).toBe('account');
      expect(s2.query).toBe('');

      // 3. Partial account query
      const s3 = detectQuickEntryField('30  HD');
      expect(s3.field).toBe('account');
      expect(s3.query).toBe('HD');

      // 4. Category after second double space
      const s4 = detectQuickEntryField('30  HDFC  ');
      expect(s4.field).toBe('category');
      expect(s4.query).toBe('');

      // 5. Partial category query
      const s5 = detectQuickEntryField('30  HDFC  fo');
      expect(s5.field).toBe('category');
      expect(s5.query).toBe('fo');

      // 6. Note after third double space
      const s6 = detectQuickEntryField('30  HDFC  food  ');
      expect(s6.field).toBe('note');
    });

    test('detects comma separated fields', () => {
      const s1 = detectQuickEntryField('30, ');
      expect(s1.field).toBe('account');
      expect(s1.query).toBe('');
      expect(s1.delimiter).toBe(',');

      const s2 = detectQuickEntryField('30, HD');
      expect(s2.field).toBe('account');
      expect(s2.query).toBe('HD');

      const s3 = detectQuickEntryField('30, HDFC, ');
      expect(s3.field).toBe('category');
      expect(s3.query).toBe('');

      const s4 = detectQuickEntryField('30, HDFC, fo');
      expect(s4.field).toBe('category');
      expect(s4.query).toBe('fo');

      const s5 = detectQuickEntryField('30, HDFC, food, ');
      expect(s5.field).toBe('note');
    });

    test('detects single space separated fields', () => {
      const s1 = detectQuickEntryField('30 ');
      expect(s1.field).toBe('account');
      expect(s1.query).toBe('');

      const s2 = detectQuickEntryField('30 H');
      expect(s2.field).toBe('account');
      expect(s2.query).toBe('H');

      const s3 = detectQuickEntryField('30 HDFC ');
      expect(s3.field).toBe('category');
      expect(s3.query).toBe('');

      const s4 = detectQuickEntryField('30 HDFC f');
      expect(s4.field).toBe('category');
      expect(s4.query).toBe('f');
    });

    test('detects token when cursor is in the middle of input', () => {
      const input = '30  HDFC  food  Lunch note';
      // Cursor inside "HDFC" (index 6)
      const state = detectQuickEntryField(input, 6);
      expect(state.field).toBe('account');
      expect(state.query).toBe('HDFC');
    });
  });

  describe('applyQuickEntryCompletion', () => {
    test('applies completion for double space input and advances cursor', () => {
      const input = '30  HD';
      const state = detectQuickEntryField(input);
      const { newInput, newCursor } = applyQuickEntryCompletion(input, 'HDFC', state);

      expect(newInput).toBe('30  HDFC  ');
      expect(newCursor).toBe(10);

      // Subsequent detection should now be on category
      const nextState = detectQuickEntryField(newInput, newCursor);
      expect(nextState.field).toBe('category');
      expect(nextState.query).toBe('');
    });

    test('applies completion for comma input and advances cursor', () => {
      const input = '30, HD';
      const state = detectQuickEntryField(input);
      const { newInput, newCursor } = applyQuickEntryCompletion(input, 'HDFC', state);

      expect(newInput).toBe('30, HDFC, ');
      expect(newCursor).toBe(10);

      // Subsequent detection should now be on category
      const nextState = detectQuickEntryField(newInput, newCursor);
      expect(nextState.field).toBe('category');
      expect(nextState.query).toBe('');
    });

    test('applies category completion and transitions to note', () => {
      const input = '30  HDFC  fo';
      const state = detectQuickEntryField(input);
      const { newInput } = applyQuickEntryCompletion(input, 'food', state);

      expect(newInput).toBe('30  HDFC  food  ');
      const nextState = detectQuickEntryField(newInput);
      expect(nextState.field).toBe('note');
    });

    test('gracefully skips auto-fill (field: none) when parser does not implement detectField', () => {
      const dummyParser = {
        name: 'custom-dummy',
        canParse: () => true,
        parse: () => undefined,
      };

      const state = detectQuickEntryField('custom entry syntax', 5, [dummyParser]);
      expect(state.field).toBe('none');
      expect(state.query).toBe('');
    });

    test('falls back to default completion formatting when parsers lack applyCompletion', () => {
      const dummyParser = {
        name: 'custom-dummy',
        canParse: () => true,
        parse: () => undefined,
      };

      // Space delimiter fallback
      const stateSpace = {
        field: 'account' as const,
        query: 'HD',
        tokenIndex: 1,
        delimiter: ' ' as const,
        replaceRange: { start: 4, end: 6 },
      };
      const res1 = applyQuickEntryCompletion('30  HD', 'HDFC', stateSpace, [dummyParser]);
      expect(res1.newInput).toBe('30  HDFC  ');

      // Comma delimiter fallback
      const stateComma = {
        field: 'account' as const,
        query: 'HD',
        tokenIndex: 1,
        delimiter: ',' as const,
        replaceRange: { start: 4, end: 6 },
      };
      const res2 = applyQuickEntryCompletion('30, HD', 'HDFC', stateComma, [dummyParser]);
      expect(res2.newInput).toBe('30, HDFC, ');
    });
  });
});
