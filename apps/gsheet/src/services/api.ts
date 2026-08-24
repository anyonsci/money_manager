import { UnifiedTransaction, TransactionFormValues, ApiResponse } from '@money-manager/core';
import { gsheetStorageAdapter } from '../adapters/GSheetStorageAdapter';

export const fetchTransactions = async (page = 1, limit = 200): Promise<ApiResponse<UnifiedTransaction[]>> => {
  const result = await gsheetStorageAdapter.fetchTransactions({ page, limit });
  return {
    success: true,
    data: result.data,
    meta: result.meta,
  };
};

export const createTransaction = async (values: TransactionFormValues): Promise<UnifiedTransaction> => {
  return await gsheetStorageAdapter.createTransaction(values);
};

export const updateTransaction = async (
  transaction: UnifiedTransaction,
  values: TransactionFormValues
): Promise<UnifiedTransaction> => {
  return await gsheetStorageAdapter.updateTransaction(transaction.id, values, transaction);
};

export const deleteTransaction = async (transactionId: string): Promise<{ deletedId: string }> => {
  return await gsheetStorageAdapter.deleteTransaction(transactionId);
};
