import {
  StorageAdapter,
  UnifiedTransaction,
  TransactionFormValues,
  TransactionFilter,
  PaginatedResult,
  ApiResponse,
} from '@money-manager/core';
import { apiClient, getApiUrl } from '../services/apiClient';

const DEFAULT_LIMIT = 200;

const mockTransactions: UnifiedTransaction[] = [
  {
    id: 'tx-001',
    transactionDate: '2026-08-01T09:30:00.000Z',
    timestamp: '2026-08-01T09:30:00.000Z',
    amount: 24.5,
    account: 'Checking',
    category: 'Need',
    subCategory: 'Supermarket',
    note: 'Weekly need',
    type: 'expense',
    status: 'POSTED',
    createdAt: '2026-08-01T09:30:00.000Z',
    updatedAt: '2026-08-01T09:30:00.000Z',
    createdBy: 'family@example.com',
    updatedBy: 'family@example.com'
  },
  {
    id: 'tx-002',
    transactionDate: '2026-07-30T14:15:00.000Z',
    timestamp: '2026-07-30T14:15:00.000Z',
    amount: 3200,
    account: 'Checking',
    category: 'Salary',
    subCategory: 'Payroll',
    note: 'Monthly salary',
    type: 'income',
    status: 'POSTED',
    createdAt: '2026-07-30T14:15:00.000Z',
    updatedAt: '2026-07-30T14:15:00.000Z',
    createdBy: 'parent@example.com',
    updatedBy: 'parent@example.com'
  },
  {
    id: 'tx-003',
    transactionDate: '2026-07-29T18:20:00.000Z',
    timestamp: '2026-07-29T18:20:00.000Z',
    amount: 42.0,
    account: 'Checking',
    category: 'Food',
    subCategory: 'Dinner',
    note: 'Dinner out',
    type: 'expense',
    status: 'POSTED',
    createdAt: '2026-07-29T18:20:00.000Z',
    updatedAt: '2026-07-29T18:20:00.000Z',
    createdBy: 'family@example.com',
    updatedBy: 'family@example.com'
  },
  {
    id: 'tx-004',
    transactionDate: '2026-07-28T07:45:00.000Z',
    timestamp: '2026-07-28T07:45:00.000Z',
    amount: 89.0,
    account: 'Savings',
    category: 'Travel',
    subCategory: 'Fuel',
    note: 'Gas refill',
    type: 'expense',
    status: 'POSTED',
    createdAt: '2026-07-28T07:45:00.000Z',
    updatedAt: '2026-07-28T07:45:00.000Z',
    createdBy: 'parent@example.com',
    updatedBy: 'parent@example.com'
  },
  {
    id: 'tx-005',
    transactionDate: '2026-07-25T12:00:00.000Z',
    timestamp: '2026-07-25T12:00:00.000Z',
    amount: 1500,
    account: 'Checking',
    category: 'Others',
    subCategory: 'Design',
    note: 'Project payment',
    type: 'income',
    status: 'POSTED',
    createdAt: '2026-07-25T12:00:00.000Z',
    updatedAt: '2026-07-25T12:00:00.000Z',
    createdBy: 'family@example.com',
    updatedBy: 'family@example.com'
  },
  {
    id: 'tx-006',
    transactionDate: '2026-07-20T16:30:00.000Z',
    timestamp: '2026-07-20T16:30:00.000Z',
    amount: 63.2,
    account: 'Checking',
    category: 'Need',
    subCategory: 'Electricity',
    note: 'Power bill',
    type: 'expense',
    status: 'POSTED',
    createdAt: '2026-07-20T16:30:00.000Z',
    updatedAt: '2026-07-20T16:30:00.000Z',
    createdBy: 'parent@example.com',
    updatedBy: 'parent@example.com'
  }
];

const formatIsoTimestamp = (dateString?: string, fallback?: string) => {
  if (!dateString) return fallback || new Date().toISOString();
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return `${dateString}T12:00:00.000Z`;
  }
  try {
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? (fallback || new Date().toISOString()) : d.toISOString();
  } catch {
    return fallback || new Date().toISOString();
  }
};

const normalizeTransaction = (item: any): UnifiedTransaction => {
  return {
    id: item.id || `tx-${Date.now()}`,
    transactionDate: item.timestamp || item.transactionDate || item.date || new Date().toISOString(),
    timestamp: item.timestamp || item.transactionDate || item.date,
    amount: Number(item.amount),
    account: item.account,
    category: item.category,
    subCategory: item.subCategory || '',
    note: item.note || '',
    type: item.type,
    status: 'POSTED',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    createdBy: item.createdBy,
    updatedBy: item.updatedBy,
    raw: item
  };
};

export class GSheetStorageAdapter implements StorageAdapter {
  async fetchTransactions(params: {
    page?: number;
    limit?: number;
    filters?: TransactionFilter;
  } = {}): Promise<PaginatedResult<UnifiedTransaction>> {
    const page = params.page || 1;
    const limit = params.limit || DEFAULT_LIMIT;
    const apiUrl = getApiUrl();

    if (!apiUrl) {
      const start = (page - 1) * limit;
      const end = start + limit;
      const pageItems = mockTransactions.slice(start, end);
      const totalRows = mockTransactions.length;
      const totalPages = Math.max(1, Math.ceil(totalRows / limit));

      return {
        data: pageItems,
        meta: {
          page,
          limit,
          total: totalRows,
          totalRows,
          totalPages
        }
      };
    }

    const response = await apiClient.post(apiUrl, JSON.stringify({
      action: 'read',
      page,
      limit
    }));

    const resData = response.data as ApiResponse<any[]>;
    const rawList = Array.isArray(resData.data) ? resData.data : [];
    const normalized = rawList.map(normalizeTransaction);

    return {
      data: normalized,
      meta: resData.meta || {
        page,
        limit,
        total: normalized.length,
        totalRows: normalized.length,
        totalPages: 1
      }
    };
  }

  async createTransaction(values: TransactionFormValues): Promise<UnifiedTransaction> {
    const apiUrl = getApiUrl();
    const timestamp = formatIsoTimestamp(values.date);

    if (!apiUrl) {
      const created: UnifiedTransaction = {
        id: `tx-${Date.now()}`,
        transactionDate: timestamp,
        timestamp,
        amount: Number(values.amount),
        account: values.account,
        category: values.category,
        subCategory: values.subCategory,
        note: values.note,
        type: values.type,
        status: 'POSTED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'demo@example.com',
        updatedBy: 'demo@example.com'
      };
      mockTransactions.unshift(created);
      return created;
    }

    const response = await apiClient.post(apiUrl, JSON.stringify({
      action: 'create',
      timestamp,
      date: values.date,
      type: values.type,
      amount: Number(values.amount),
      account: values.account,
      category: values.category,
      subCategory: values.subCategory,
      note: values.note
    }));

    return normalizeTransaction(response.data.data);
  }

  async updateTransaction(
    id: string,
    values: TransactionFormValues,
    original?: UnifiedTransaction
  ): Promise<UnifiedTransaction> {
    const apiUrl = getApiUrl();
    const timestamp = formatIsoTimestamp(values.date, original?.timestamp);

    if (!apiUrl) {
      const updated: UnifiedTransaction = {
        ...(original || {}),
        id,
        amount: Number(values.amount),
        account: values.account,
        category: values.category,
        subCategory: values.subCategory,
        note: values.note,
        type: values.type,
        transactionDate: timestamp,
        timestamp,
        status: 'POSTED',
        updatedAt: new Date().toISOString()
      };
      const index = mockTransactions.findIndex((item) => item.id === id);
      if (index >= 0) {
        mockTransactions[index] = updated;
      }
      return updated;
    }

    const response = await apiClient.post(apiUrl, JSON.stringify({
      action: 'update',
      id,
      timestamp,
      date: values.date,
      type: values.type,
      amount: Number(values.amount),
      account: values.account,
      category: values.category,
      subCategory: values.subCategory,
      note: values.note
    }));

    return normalizeTransaction(response.data.data);
  }

  async deleteTransaction(transactionId: string): Promise<{ deletedId: string }> {
    const apiUrl = getApiUrl();

    if (!apiUrl) {
      const index = mockTransactions.findIndex((item) => item.id === transactionId);
      if (index >= 0) {
        mockTransactions.splice(index, 1);
      }
      return { deletedId: transactionId };
    }

    const response = await apiClient.post(apiUrl, JSON.stringify({
      action: 'delete',
      id: transactionId
    }));

    return response.data.data as { deletedId: string };
  }
}

export const gsheetStorageAdapter = new GSheetStorageAdapter();
