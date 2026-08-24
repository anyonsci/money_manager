import {
  ALLOWED_CATEGORIES,
  CATEGORY_COLORS,
  isAllowedCategory,
  getCanonicalCategory,
} from '../src/constants/categories';

describe('Core Constants - Categories', () => {
  describe('ALLOWED_CATEGORIES', () => {
    it('contains all canonical categories', () => {
      expect(ALLOWED_CATEGORIES).toContain('food');
      expect(ALLOWED_CATEGORIES).toContain('travel');
      expect(ALLOWED_CATEGORIES).toContain('entertainment');
      expect(ALLOWED_CATEGORIES).toContain('need');
      expect(ALLOWED_CATEGORIES).toContain('material');
      expect(ALLOWED_CATEGORIES).toContain('medical');
      expect(ALLOWED_CATEGORIES).toContain('wellness');
      expect(ALLOWED_CATEGORIES).toContain('trip');
      expect(ALLOWED_CATEGORIES).toContain('maintenance');
      expect(ALLOWED_CATEGORIES).toContain('rent');
      expect(ALLOWED_CATEGORIES).toContain('recurring');
      expect(ALLOWED_CATEGORIES).toContain('salary');
      expect(ALLOWED_CATEGORIES).toContain('investment');
      expect(ALLOWED_CATEGORIES).toContain('others');
    });

    it('has 14 allowed categories', () => {
      expect(ALLOWED_CATEGORIES.length).toBe(14);
    });
  });

  describe('CATEGORY_COLORS', () => {
    it('defines colors for all allowed categories', () => {
      ALLOWED_CATEGORIES.forEach((cat) => {
        const color = CATEGORY_COLORS[cat];
        expect(color).toBeDefined();
        expect(color.bg).toMatch(/^bg-/);
        expect(color.text).toMatch(/^text-/);
        expect(color.border).toMatch(/^border-/);
      });
    });
  });

  describe('isAllowedCategory', () => {
    it('returns true for exact lowercase matches', () => {
      expect(isAllowedCategory('food')).toBe(true);
      expect(isAllowedCategory('salary')).toBe(true);
    });

    it('returns true for case-insensitive matches', () => {
      expect(isAllowedCategory('FOOD')).toBe(true);
      expect(isAllowedCategory('Travel')).toBe(true);
      expect(isAllowedCategory('EnTeRtAiNmEnT')).toBe(true);
    });

    it('returns true with surrounding whitespace', () => {
      expect(isAllowedCategory('  food  ')).toBe(true);
      expect(isAllowedCategory('\tmedical\n')).toBe(true);
    });

    it('returns false for invalid category strings', () => {
      expect(isAllowedCategory('crypto')).toBe(false);
      expect(isAllowedCategory('unknown')).toBe(false);
      expect(isAllowedCategory('')).toBe(false);
    });
  });

  describe('getCanonicalCategory', () => {
    it('returns canonical casing for allowed categories', () => {
      expect(getCanonicalCategory('FOOD')).toBe('food');
      expect(getCanonicalCategory('Travel')).toBe('travel');
      expect(getCanonicalCategory('  medical  ')).toBe('medical');
    });

    it('returns original input if category is not in allowed list', () => {
      expect(getCanonicalCategory('CustomCategory')).toBe('CustomCategory');
      expect(getCanonicalCategory('unknown')).toBe('unknown');
    });
  });
});
