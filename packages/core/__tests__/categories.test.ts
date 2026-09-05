import {
  ALLOWED_CATEGORIES,
  CATEGORY_COLORS,
  isAllowedCategory,
  getCanonicalCategory,
  matchCategoriesByPrefix,
  resolveCategory,
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

  describe('matchCategoriesByPrefix', () => {
    it('returns all categories matching prefix', () => {
      expect(matchCategoriesByPrefix('f')).toEqual(['food']);
      expect(matchCategoriesByPrefix('tra')).toEqual(['travel']);
      expect(matchCategoriesByPrefix('tri')).toEqual(['trip']);
      expect(matchCategoriesByPrefix('t')).toEqual(['travel', 'trip']);
      expect(matchCategoriesByPrefix('xyz')).toEqual([]);
    });
  });

  describe('resolveCategory', () => {
    it('resolves exact match', () => {
      const res = resolveCategory('food');
      expect(res.exact).toBe(true);
      expect(res.canonicalCategory).toBe('food');
      expect(res.ambiguous).toBe(false);
    });

    it('resolves unique prefix match', () => {
      const resF = resolveCategory('f');
      expect(resF.canonicalCategory).toBe('food');
      expect(resF.ambiguous).toBe(false);

      const resSal = resolveCategory('sal');
      expect(resSal.canonicalCategory).toBe('salary');
      expect(resSal.ambiguous).toBe(false);

      const resTra = resolveCategory('tra');
      expect(resTra.canonicalCategory).toBe('travel');
      expect(resTra.ambiguous).toBe(false);
    });

    it('flags ambiguous prefix match', () => {
      const resT = resolveCategory('t');
      expect(resT.ambiguous).toBe(true);
      expect(resT.matches).toEqual(['travel', 'trip']);
      expect(resT.canonicalCategory).toBeUndefined();
    });

    it('returns no match for non-existent category', () => {
      const res = resolveCategory('xyz');
      expect(res.exact).toBe(false);
      expect(res.ambiguous).toBe(false);
      expect(res.canonicalCategory).toBeUndefined();
    });
  });
});

