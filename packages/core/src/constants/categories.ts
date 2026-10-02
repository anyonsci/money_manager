export const ALLOWED_CATEGORIES = [
  "food",
  "travel",
  "entertainment",
  "need",
  "material",
  "medical",
  "wellness",
  "trip",
  "maintenance",
  "rent",
  "recurring",
  "salary",
  "investment",
  "others"
] as const;

export type AllowedCategory = typeof ALLOWED_CATEGORIES[number];

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  food: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  travel: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  entertainment: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  need: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  material: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
  medical: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  wellness: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20' },
  trip: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20' },
  maintenance: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  rent: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  recurring: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
  salary: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  investment: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  others: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
};

/**
 * Returns category color token definitions, supporting case-insensitivity,
 * whitespace trimming, and compound category names.
 */
export const getCategoryColor = (
  category?: unknown
): { bg: string; text: string; border: string } => {
  const normalized = String(category ?? '').trim().toLowerCase();
  if (!normalized) return CATEGORY_COLORS.others;

  if (CATEGORY_COLORS[normalized]) {
    return CATEGORY_COLORS[normalized];
  }

  const matched = ALLOWED_CATEGORIES.find(
    (cat) =>
      cat !== 'others' &&
      (normalized.startsWith(cat) || normalized.split(/[\s&/_-]+/).includes(cat))
  );

  return (matched && CATEGORY_COLORS[matched]) || CATEGORY_COLORS.others;
};

export const CATEGORY_HEX_COLORS: Record<string, string> = {
  food: '#f59e0b',          // Amber
  travel: '#3b82f6',        // Blue
  entertainment: '#8b5cf6', // Purple
  need: '#10b981',          // Emerald
  material: '#6366f1',      // Indigo
  medical: '#f43f5e',       // Rose
  wellness: '#14b8a6',      // Teal
  trip: '#0ea5e9',          // Sky
  maintenance: '#f97316',   // Orange
  rent: '#ef4444',          // Red
  recurring: '#a855f7',     // Violet
  salary: '#10b981',        // Emerald
  investment: '#06b6d4',    // Cyan
  others: '#64748b',        // Slate
};

export const DEFAULT_CHART_PALETTE = [
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#10b981', // Emerald
  '#6366f1', // Indigo
  '#f43f5e', // Rose
  '#14b8a6', // Teal
  '#0ea5e9', // Sky
  '#f97316', // Orange
  '#ef4444', // Red
  '#a855f7', // Violet
  '#06b6d4', // Cyan
  '#64748b', // Slate
];

/**
 * Returns category hex color for chart rendering.
 */
export const getCategoryHexColor = (
  category?: unknown,
  fallbackIndex: number = 0
): string => {
  const normalized = String(category ?? '').trim().toLowerCase();
  if (!normalized) return CATEGORY_HEX_COLORS.others;

  if (CATEGORY_HEX_COLORS[normalized]) {
    return CATEGORY_HEX_COLORS[normalized];
  }

  const matched = ALLOWED_CATEGORIES.find(
    (cat) =>
      cat !== 'others' &&
      (normalized.startsWith(cat) || normalized.split(/[\s&/_-]+/).includes(cat))
  );

  if (matched && CATEGORY_HEX_COLORS[matched]) {
    return CATEGORY_HEX_COLORS[matched];
  }

  return (
    DEFAULT_CHART_PALETTE[fallbackIndex % DEFAULT_CHART_PALETTE.length] ||
    CATEGORY_HEX_COLORS.others
  );
};

/**
 * Checks if a given category string matches an allowed category (case-insensitive).
 */
export const isAllowedCategory = (category?: unknown): boolean => {
  const normalized = String(category ?? '').trim().toLowerCase();
  return ALLOWED_CATEGORIES.some(cat => cat.toLowerCase() === normalized);
};

/**
 * Returns the canonical casing for an allowed category.
 */
export const getCanonicalCategory = (category?: unknown): string => {
  const normalized = String(category ?? '').trim().toLowerCase();
  const found = ALLOWED_CATEGORIES.find(cat => cat.toLowerCase() === normalized);
  return found || String(category ?? '');
};

export const ESSENTIAL_CATEGORIES: readonly string[] = [
  'need',
  'rent',
  'medical',
  'maintenance',
  'recurring',
];

export const DISCRETIONARY_CATEGORIES: readonly string[] = [
  'food',
  'entertainment',
  'travel',
  'trip',
  'material',
  'wellness',
  'others',
];

export const isEssentialCategory = (category?: unknown): boolean => {
  const canonical = getCanonicalCategory(category).toLowerCase();
  return ESSENTIAL_CATEGORIES.includes(canonical);
};

export interface CategoryResolution {
  canonicalCategory?: AllowedCategory;
  matches: AllowedCategory[];
  exact: boolean;
  ambiguous: boolean;
}

/**
 * Finds all allowed categories that start with the given prefix (case-insensitive).
 */
export const matchCategoriesByPrefix = (prefix?: unknown): AllowedCategory[] => {
  const normalized = String(prefix ?? '').trim().toLowerCase();
  if (!normalized) return [];
  return ALLOWED_CATEGORIES.filter(cat => cat.toLowerCase().startsWith(normalized));
};

/**
 * Resolves a category string by exact match first, then by unique prefix match.
 */
export const resolveCategory = (categoryInput?: unknown): CategoryResolution => {
  const normalized = String(categoryInput ?? '').trim().toLowerCase();
  if (!normalized) {
    return { matches: [], exact: false, ambiguous: false };
  }

  // 1. Check exact match
  const exactFound = ALLOWED_CATEGORIES.find(cat => cat.toLowerCase() === normalized);
  if (exactFound) {
    return {
      canonicalCategory: exactFound,
      matches: [exactFound],
      exact: true,
      ambiguous: false
    };
  }

  // 2. Prefix match
  const prefixMatches = ALLOWED_CATEGORIES.filter(cat =>
    cat.toLowerCase().startsWith(normalized)
  );

  if (prefixMatches.length === 1) {
    return {
      canonicalCategory: prefixMatches[0],
      matches: prefixMatches,
      exact: false,
      ambiguous: false
    };
  }

  if (prefixMatches.length > 1) {
    return {
      matches: prefixMatches,
      exact: false,
      ambiguous: true
    };
  }

  return {
    matches: [],
    exact: false,
    ambiguous: false
  };
};

