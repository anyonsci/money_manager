import {
  UnifiedTransaction,
  TransactionFormValues,
  TransactionFilter,
  PaginationMeta,
  AnalyticsSummaryData,
} from '../types/index';

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface StorageAdapter {
  fetchTransactions(params?: {
    page?: number;
    limit?: number;
    filters?: TransactionFilter;
  }): Promise<PaginatedResult<UnifiedTransaction>>;

  createTransaction(values: TransactionFormValues): Promise<UnifiedTransaction>;

  updateTransaction(id: string, values: TransactionFormValues, original?: UnifiedTransaction): Promise<UnifiedTransaction>;

  deleteTransaction(id: string): Promise<{ deletedId: string }>;

  getAnalyticsSummary?(filters?: TransactionFilter): Promise<AnalyticsSummaryData>;
}
