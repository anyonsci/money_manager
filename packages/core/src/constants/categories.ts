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
 * Checks if a given category string matches an allowed category (case-insensitive).
 */
export const isAllowedCategory = (category: string): boolean => {
  const normalized = category.trim().toLowerCase();
  return ALLOWED_CATEGORIES.some(cat => cat.toLowerCase() === normalized);
};

/**
 * Returns the canonical casing for an allowed category.
 */
export const getCanonicalCategory = (category: string): string => {
  const normalized = category.trim().toLowerCase();
  const found = ALLOWED_CATEGORIES.find(cat => cat.toLowerCase() === normalized);
  return found || category;
};
