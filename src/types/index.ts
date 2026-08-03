export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  timestamp: string;
  amount: number;
  account: string;
  category: string;
  subCategory: string;
  note: string;
  type: TransactionType;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalRows: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T[];
  meta?: PaginationMeta;
  error?: string;
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
