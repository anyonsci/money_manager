export type TransactionType = 'expense' | 'income';

export interface UserProfile {
  id?: string;
  email: string;
  name?: string;
  avatar?: string;
  picture?: string;
  googleId?: string;
  exp?: number;
}

export interface TransactionFormValues {
  amount: string;
  account: string;
  category: string;
  subCategory: string;
  note: string;
  type: TransactionType;
  date: string;
}

export interface UnifiedTransaction {
  id: string;
  transactionDate?: string; // ISO date or YYYY-MM-DD
  timestamp?: string;
  amount: number;
  account: string;
  category: string;
  subCategory?: string;
  note?: string;
  type: TransactionType;
  status?: 'POSTED' | 'DRAFT' | 'VOID';
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  raw?: unknown;
}

export type Transaction = UnifiedTransaction;

export interface PaginationMeta {
  page: number;
  limit: number;
  total?: number;
  totalRows?: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: PaginationMeta;
  error?: string | {
    code: string;
    message?: string;
  };
}

export interface TransactionFilter {
  startDate?: string;
  endDate?: string;
  search?: string;
  category?: string;
  type?: TransactionType;
  status?: 'POSTED' | 'DRAFT' | 'VOID';
}

export interface AnalyticsSummaryData {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  categoryBreakdown?: Record<string, number>;
}
