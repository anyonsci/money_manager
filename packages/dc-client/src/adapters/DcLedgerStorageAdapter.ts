import {
  StorageAdapter,
  PaginatedResult,
  UnifiedTransaction,
  TransactionFormValues,
  TransactionFilter,
} from '@money-manager/core';
import { api } from '../api/endpoints';
import { LedgerTranspilerService } from '../services/ledger-transpiler';
import { getStoredActiveWorkspaceId } from '../auth/index';
import type { Account } from '../types/index';

export class DcLedgerStorageAdapter implements StorageAdapter {
  private workspaceId: string | null = null;
  private currency: string = 'INR';

  constructor(workspaceId?: string, currency: string = 'INR') {
    if (workspaceId) this.workspaceId = workspaceId;
    this.currency = currency;
  }

  setWorkspace(workspaceId: string, currency = 'INR') {
    this.workspaceId = workspaceId;
    this.currency = currency;
  }

  private getActiveWorkspaceId(): string {
    const wsId = this.workspaceId || getStoredActiveWorkspaceId();
    if (!wsId) {
      throw new Error('No active workspace selected in DeriveCount Ledger.');
    }
    return wsId;
  }

  async fetchTransactions(params?: {
    page?: number;
    limit?: number;
    filters?: TransactionFilter;
  }): Promise<PaginatedResult<UnifiedTransaction>> {
    const wsId = this.getActiveWorkspaceId();
    const page = params?.page || 1;
    const limit = params?.limit || 20;

    const [txRes, accRes] = await Promise.all([
      api.transactions.list(wsId, {
        page,
        limit,
        startDate: params?.filters?.startDate,
        endDate: params?.filters?.endDate,
        search: params?.filters?.search,
      }),
      api.accounts.list(wsId),
    ]);

    const accountsMap = new Map<string, Account>();
    if (accRes.success && accRes.data) {
      accRes.data.forEach((acc) => accountsMap.set(acc.id, acc));
    }

    const rawTxs = txRes.data || [];
    const formatted: UnifiedTransaction[] = rawTxs.map((t) => {
      const f = LedgerTranspilerService.transpileToFrontend(t, accountsMap);
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
        raw: t,
      };
    });

    const total = txRes.meta?.total || formatted.length;
    const totalPages = txRes.meta?.totalPages || Math.ceil(total / limit) || 1;

    return {
      data: formatted,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async createTransaction(values: TransactionFormValues): Promise<UnifiedTransaction> {
    const wsId = this.getActiveWorkspaceId();
    const createdDc = await LedgerTranspilerService.transpileAndPost(wsId, values, this.currency);
    const f = LedgerTranspilerService.transpileToFrontend(createdDc);
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
      raw: createdDc,
    };
  }

  async updateTransaction(
    id: string,
    values: TransactionFormValues,
    _original?: UnifiedTransaction
  ): Promise<UnifiedTransaction> {
    const wsId = this.getActiveWorkspaceId();
    // In double-entry accounting, edits void the original entry and post a new entry
    if (id) {
      await api.transactions.void(wsId, id);
    }
    const createdDc = await LedgerTranspilerService.transpileAndPost(wsId, values, this.currency);
    const f = LedgerTranspilerService.transpileToFrontend(createdDc);
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
      raw: createdDc,
    };
  }

  async deleteTransaction(id: string): Promise<{ deletedId: string }> {
    const wsId = this.getActiveWorkspaceId();
    const res = await api.transactions.void(wsId, id);
    if (!res.success) {
      const errStr = typeof res.error === 'string' ? res.error : res.error?.message;
      throw new Error(errStr || 'Failed to void transaction');
    }
    return { deletedId: id };
  }
}

export const dcLedgerStorageAdapter = new DcLedgerStorageAdapter();
