export const ALLOWED_CATEGORIES = [
  "Food",
  "Travel",
  "Entertainment",
  "Need",
  "Material",
  "Medical",
  "Wellness",
  "Trip",
  "Maintenance",
  "Rent",
  "Recurring",
  "Salary",
  "Investment",
  "Others"
] as const;

export type AllowedCategory = typeof ALLOWED_CATEGORIES[number];

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Food: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  Travel: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  Entertainment: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  Need: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  Material: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
  Medical: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  Wellness: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20' },
  Trip: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  Maintenance: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  Rent: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  Recurring: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
  Salary: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
  Investment: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
  Others: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
};

export const isAllowedCategory = (category: string): boolean => {
  if (!category || !category.trim()) return false;
  return ALLOWED_CATEGORIES.some(
    (c) => c.toLowerCase() === category.trim().toLowerCase()
  );
};

export const getCanonicalCategory = (category: string): string => {
  const match = ALLOWED_CATEGORIES.find(
    (c) => c.toLowerCase() === category.trim().toLowerCase()
  );
  return match || category.trim();
};
