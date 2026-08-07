export const ALLOWED_CATEGORIES = [
  "need",
  "food",
  "travel",
  "entertainment",
  "recurring",
  "material",
  "medical",
  "wellness",
  "trip",
  "maintenance",
  "rent",
  "investment",
  "others"
] as const;

export type AllowedCategory = typeof ALLOWED_CATEGORIES[number];

/**
 * Checks if a given category string matches an allowed category (case-insensitive).
 */
export const isAllowedCategory = (category: string): boolean => {
  if (!category || !category.trim()) return false;
  return ALLOWED_CATEGORIES.some(
    (c) => c.toLowerCase() === category.trim().toLowerCase()
  );
};

/**
 * Returns canonical case version of an allowed category.
 */
export const getCanonicalCategory = (category: string): string => {
  const match = ALLOWED_CATEGORIES.find(
    (c) => c.toLowerCase() === category.trim().toLowerCase()
  );
  return match || category.trim();
};
