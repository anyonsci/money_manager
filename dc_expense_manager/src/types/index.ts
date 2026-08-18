export type TransactionType = 'expense' | 'income';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  googleId?: string;
}

export interface Workspace {
  id: string;
  name: string;
  type: 'PERSONAL' | 'SHARED';
  defaultCurrency: string;
  role?: 'ADMIN' | 'WRITE' | 'READ';
  createdAt?: string;
}

export interface AccountGroup {
  id: string;
  workspaceId: string;
  name: string;
  accountType: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
}

export interface Account {
  id: string;
  workspaceId: string;
  accountGroupId: string;
  name: string;
  unitSymbol: string;
  currentBalance: string;
}

export interface TransactionLeg {
  id?: string;
  accountId: string;
  accountName?: string;
  amount: string | number;
  unitSymbol: string;
  exchangeRate?: string | number;
  baseAmount?: string | number;
}

export interface DeriveCountTransaction {
  id: string;
  workspaceId: string;
  transactionDate: string;
  postedAt: string;
  description: string;
  tags: string[];
  status: 'POSTED' | 'DRAFT' | 'VOID';
  createdByUserId?: string;
  createdAt: string;
  legs: TransactionLeg[];
}

export interface FormattedTransaction {
  id: string;
  transactionDate: string;
  amount: number;
  account: string;
  category: string;
  subCategory: string;
  note: string;
  type: TransactionType;
  status: 'POSTED' | 'DRAFT' | 'VOID';
  raw: DeriveCountTransaction;
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

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: PaginationMeta;
  error?: {
    code: string;
    message?: string;
  };
}
