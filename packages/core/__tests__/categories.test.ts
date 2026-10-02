import {
  ALLOWED_CATEGORIES,
  CATEGORY_COLORS,
  getCategoryColor,
  isAllowedCategory,
  getCanonicalCategory,
  matchCategoriesByPrefix,
  resolveCategory,
  CATEGORY_HEX_COLORS,
  DEFAULT_CHART_PALETTE,
  getCategoryHexColor,
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

  describe('getCategoryColor', () => {
    it('returns correct color for exact category', () => {
      expect(getCategoryColor('food')).toEqual(CATEGORY_COLORS.food);
      expect(getCategoryColor('salary')).toEqual(CATEGORY_COLORS.salary);
    });

    it('handles uppercase and mixed-case category names', () => {
      expect(getCategoryColor('FOOD')).toEqual(CATEGORY_COLORS.food);
      expect(getCategoryColor('Salary')).toEqual(CATEGORY_COLORS.salary);
      expect(getCategoryColor('  tRaVeL  ')).toEqual(CATEGORY_COLORS.travel);
    });

    it('resolves compound category names by prefix/token', () => {
      expect(getCategoryColor('Food & Dining')).toEqual(CATEGORY_COLORS.food);
      expect(getCategoryColor('Travel / Flight')).toEqual(CATEGORY_COLORS.travel);
    });

    it('falls back to others for unknown or empty category', () => {
      expect(getCategoryColor('unknown_xyz')).toEqual(CATEGORY_COLORS.others);
      expect(getCategoryColor('')).toEqual(CATEGORY_COLORS.others);
    });
  });

  describe('CATEGORY_HEX_COLORS and getCategoryHexColor', () => {
    it('defines hex colors for all canonical categories', () => {
      ALLOWED_CATEGORIES.forEach((cat) => {
        const hex = CATEGORY_HEX_COLORS[cat];
        expect(hex).toBeDefined();
        expect(hex).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });

    it('returns canonical hex color for exact and mixed-case category names', () => {
      expect(getCategoryHexColor('food')).toBe('#f59e0b');
      expect(getCategoryHexColor('FOOD')).toBe('#f59e0b');
      expect(getCategoryHexColor('Travel')).toBe('#3b82f6');
      expect(getCategoryHexColor('  medical  ')).toBe('#f43f5e');
    });

    it('resolves compound category names to hex color', () => {
      expect(getCategoryHexColor('Food & Dining')).toBe('#f59e0b');
      expect(getCategoryHexColor('Travel / Flight')).toBe('#3b82f6');
    });

    it('falls back to indexed palette or others for unknown category', () => {
      expect(getCategoryHexColor('unknown_custom', 0)).toBe(DEFAULT_CHART_PALETTE[0]);
      expect(getCategoryHexColor('unknown_custom', 1)).toBe(DEFAULT_CHART_PALETTE[1]);
      expect(getCategoryHexColor('')).toBe(CATEGORY_HEX_COLORS.others);
    });
  });
});

