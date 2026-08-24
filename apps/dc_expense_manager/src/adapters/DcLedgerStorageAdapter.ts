import {
  StorageAdapter,
  UnifiedTransaction,
  TransactionFormValues,
  TransactionFilter,
  PaginatedResult,
} from '@money-manager/core';
import { api } from '../services/api';
import { LedgerTranspilerService } from '../services/ledger-transpiler.service';

export class DcLedgerStorageAdapter implements StorageAdapter {
  private workspaceId: string;
  private currency: string;

  constructor(workspaceId: string, currency: string = 'USD') {
    this.workspaceId = workspaceId;
    this.currency = currency;
  }

  setWorkspace(workspaceId: string, currency: string = 'USD') {
    this.workspaceId = workspaceId;
    this.currency = currency;
  }

  async fetchTransactions(params: {
    page?: number;
    limit?: number;
    filters?: TransactionFilter;
  } = {}): Promise<PaginatedResult<UnifiedTransaction>> {
    if (!this.workspaceId) {
      return { data: [], meta: { page: 1, limit: 50, total: 0, totalPages: 1 } };
    }

    const res = await api.transactions.list(this.workspaceId, {
      page: params.page || 1,
      limit: params.limit || 50,
      search: params.filters?.search,
      status: params.filters?.status,
    });

    const rawList = res.data || [];
    const formatted = rawList.map((tx) => {
      const f = LedgerTranspilerService.formatTransaction(tx);
      return {
        id: f.id,
        transactionDate: f.transactionDate,
        amount: f.amount,
        account: f.account,
        category: f.category,
        subCategory: f.subCategory,
        note: f.note,
        type: f.type,
        status: f.status,
        raw: f.raw,
      } as UnifiedTransaction;
    });

    return {
      data: formatted,
      meta: res.meta || {
        page: params.page || 1,
        limit: params.limit || 50,
        total: formatted.length,
        totalPages: 1,
      },
    };
  }

  async createTransaction(values: TransactionFormValues): Promise<UnifiedTransaction> {
    const rawTx = await LedgerTranspilerService.postTranspiledTransaction(
      this.workspaceId,
      values,
      this.currency
    );
    const f = LedgerTranspilerService.formatTransaction(rawTx);
    return {
      id: f.id,
      transactionDate: f.transactionDate,
      amount: f.amount,
      account: f.account,
      category: f.category,
      subCategory: f.subCategory,
      note: f.note,
      type: f.type,
      status: f.status,
      raw: f.raw,
    };
  }

  async updateTransaction(
    id: string,
    values: TransactionFormValues,
  ): Promise<UnifiedTransaction> {
    const rawTx = await LedgerTranspilerService.editTransaction(
      this.workspaceId,
      id,
      values,
      this.currency
    );
    const f = LedgerTranspilerService.formatTransaction(rawTx);
    return {
      id: f.id,
      transactionDate: f.transactionDate,
      amount: f.amount,
      account: f.account,
      category: f.category,
      subCategory: f.subCategory,
      note: f.note,
      type: f.type,
      status: f.status,
      raw: f.raw,
    };
  }

  async deleteTransaction(id: string): Promise<{ deletedId: string }> {
    await api.transactions.void(this.workspaceId, id);
    return { deletedId: id };
  }
}
