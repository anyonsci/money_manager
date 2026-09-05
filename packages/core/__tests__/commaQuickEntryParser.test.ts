import { CommaQuickEntryParser } from '../src/domain/commaQuickEntryParser';

describe('CommaQuickEntryParser', () => {
  const parser = new CommaQuickEntryParser();

  describe('canParse', () => {
    it('returns true when input contains a comma', () => {
      expect(parser.canParse('30, HDFC, food')).toBe(true);
      expect(parser.canParse('30,')).toBe(true);
    });

    it('returns false when input does not contain a comma', () => {
      expect(parser.canParse('30  HDFC  food')).toBe(false);
      expect(parser.canParse('30 HDFC food')).toBe(false);
    });
  });

  describe('parse', () => {
    it('parses complete comma-delimited input', () => {
      const parsed = parser.parse('30, HDFC, food.groceries, Weekly supermarket');
      expect(parsed).toEqual({
        amount: '30',
        account: 'HDFC',
        category: 'food.groceries',
        noteParts: ['Weekly supermarket'],
        noteDelimiter: ', ',
      });
    });

    it('returns undefined if less than 3 parts or cannot parse', () => {
      expect(parser.parse('30  HDFC  food')).toBeUndefined();
      expect(parser.parse('30, HDFC')).toBeUndefined();
    });
  });

  describe('parsePartial', () => {
    it('parses partial tokens', () => {
      const partial1 = parser.parsePartial('30,');
      expect(partial1?.amount).toBe('30');
      expect(partial1?.account).toBeUndefined();

      const partial2 = parser.parsePartial('30, Checking, food.lunch');
      expect(partial2).toEqual({
        amount: '30',
        account: 'Checking',
        category: 'food',
        subCategory: 'lunch',
        noteParts: undefined,
        noteDelimiter: ', ',
      });
    });

    it('returns undefined when cannot parse', () => {
      expect(parser.parsePartial('30  HDFC')).toBeUndefined();
    });
  });

  describe('detectField', () => {
    it('detects active field by cursor position', () => {
      const input = '30, HDFC, food, dinner';
      // At amount
      const f1 = parser.detectField(input, 2);
      expect(f1?.field).toBe('amount');
      expect(f1?.query).toBe('30');

      // At account
      const f2 = parser.detectField(input, 6);
      expect(f2?.field).toBe('account');
      expect(f2?.query).toBe('HDFC');

      // At category
      const f3 = parser.detectField(input, 12);
      expect(f3?.field).toBe('category');
      expect(f3?.query).toBe('food');

      // At note
      const f4 = parser.detectField(input, 20);
      expect(f4?.field).toBe('note');
    });

    it('returns undefined when cannot parse', () => {
      expect(parser.detectField('30  HDFC', 2)).toBeUndefined();
    });
  });

  describe('applyCompletion', () => {
    it('replaces active token and appends trailing separator', () => {
      const input = '30, HD';
      const state = parser.detectField(input, 6)!;
      const res = parser.applyCompletion(input, 'HDFC', state);

      expect(res).toBeDefined();
      expect(res?.newInput).toBe('30, HDFC, ');
      expect(res?.newCursor).toBe(10);
    });

    it('returns undefined if delimiter does not match', () => {
      const res = parser.applyCompletion('30  HD', 'HDFC', {
        field: 'account',
        query: 'HD',
        tokenIndex: 1,
        replaceRange: { start: 4, end: 6 },
        delimiter: '  ',
      });
      expect(res).toBeUndefined();
    });
  });
});
