import { SingleSpaceQuickEntryParser } from '../src/domain/singleSpaceQuickEntryParser';

describe('SingleSpaceQuickEntryParser', () => {
  const parser = new SingleSpaceQuickEntryParser();

  describe('canParse', () => {
    it('returns true when input contains only single spaces and no comma', () => {
      expect(parser.canParse('30 HDFC food')).toBe(true);
      expect(parser.canParse('30 diners cc food Lunch')).toBe(true);
    });

    it('returns false when input contains comma or double space', () => {
      expect(parser.canParse('30, HDFC, food')).toBe(false);
      expect(parser.canParse('30  HDFC  food')).toBe(false);
    });
  });

  describe('parse', () => {
    it('parses valid single-space entry with exact category', () => {
      const parsed = parser.parse('30 HDFC food Lunch');
      expect(parsed).toEqual({
        amount: '30',
        account: 'HDFC',
        category: 'food',
        noteParts: ['Lunch'],
        noteDelimiter: ' ',
      });
    });

    it('parses valid single-space entry with category prefix and 2-word account', () => {
      const parsed = parser.parse('45 Diners Club trav Flight booking');
      expect(parsed).toEqual({
        amount: '45',
        account: 'Diners Club',
        category: 'trav',
        noteParts: ['Flight', 'booking'],
        noteDelimiter: ' ',
      });
    });

    it('returns undefined for invalid single-space entry', () => {
      expect(parser.parse('notanumber HDFC food')).toBeUndefined();
      expect(parser.parse('30 HDFC unknowncategory')).toBeUndefined();
    });
  });

  describe('parsePartial', () => {
    it('parses partial single-space tokens', () => {
      const partial1 = parser.parsePartial('30 HDFC');
      expect(partial1?.amount).toBe('30');
      expect(partial1?.account).toBe('HDFC');
      expect(partial1?.category).toBeUndefined();

      const partial2 = parser.parsePartial('30 Checking food.lunch Today meal');
      expect(partial2).toEqual({
        amount: '30',
        account: 'Checking',
        category: 'food',
        subCategory: 'lunch',
        noteParts: ['Today', 'meal'],
        noteDelimiter: ' ',
      });

      const partial3 = parser.parsePartial('30 Diners Club trav Flight');
      expect(partial3?.account).toBe('Diners Club');
      expect(partial3?.category).toBe('trav');
    });

    it('returns undefined for empty input', () => {
      expect(parser.parsePartial('')).toBeUndefined();
      expect(parser.parsePartial('   ')).toBeUndefined();
    });
  });

  describe('detectField', () => {
    it('detects active field by cursor position in single-space input', () => {
      const input = '30 HDFC food dinner';
      // At amount
      const f1 = parser.detectField(input, 2);
      expect(f1?.field).toBe('amount');
      expect(f1?.query).toBe('30');

      // At account
      const f2 = parser.detectField(input, 5);
      expect(f2?.field).toBe('account');
      expect(f2?.query).toBe('HDFC');

      // At category
      const f3 = parser.detectField(input, 10);
      expect(f3?.field).toBe('category');
      expect(f3?.query).toBe('food');

      // Trailing space after account -> category
      const f4 = parser.detectField('30 HDFC ', 8);
      expect(f4?.field).toBe('category');
      expect(f4?.query).toBe('');
    });
  });

  describe('applyCompletion', () => {
    it('replaces active token and formats spacing', () => {
      const input = '30 HD';
      const state = parser.detectField(input, 5)!;
      const res = parser.applyCompletion(input, 'HDFC', state);

      expect(res).toBeDefined();
      expect(res?.newInput).toBe('30  HDFC  ');
    });
  });
});
