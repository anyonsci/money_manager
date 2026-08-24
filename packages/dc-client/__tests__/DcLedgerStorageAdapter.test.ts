import { DcLedgerStorageAdapter, dcLedgerStorageAdapter } from '../src/adapters/DcLedgerStorageAdapter';
import { api } from '../src/api/endpoints';
import { LedgerTranspilerService } from '../src/services/ledger-transpiler';
import * as authModule from '../src/auth/index';
import { DeriveCountTransaction } from '../src/types/index';

jest.mock('../src/api/endpoints', () => ({
  api: {
    transactions: {
      list: jest.fn(),
      void: jest.fn(),
    },
    accounts: {
      list: jest.fn(),
    },
  },
}));

describe('DC Client - DcLedgerStorageAdapter', () => {
  const wsId = 'ws-adapter-test';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(authModule, 'getStoredActiveWorkspaceId').mockReturnValue(wsId);
  });

  it('exports singleton dcLedgerStorageAdapter', () => {
    expect(dcLedgerStorageAdapter).toBeInstanceOf(DcLedgerStorageAdapter);
  });

  it('allows setting custom workspace ID and currency', () => {
    const adapter = new DcLedgerStorageAdapter('custom-ws', 'USD');
    adapter.setWorkspace('new-ws', 'EUR');
    expect(adapter).toBeDefined();
  });

  it('throws error when no active workspace is available', async () => {
    jest.spyOn(authModule, 'getStoredActiveWorkspaceId').mockReturnValue(null);
    const adapter = new DcLedgerStorageAdapter();

    await expect(adapter.fetchTransactions()).rejects.toThrow(
      'No active workspace selected in DeriveCount Ledger.'
    );
  });

  describe('fetchTransactions', () => {
    it('fetches transactions and accounts, returning paginated result', async () => {
      const adapter = new DcLedgerStorageAdapter(wsId);

      const mockDcTx: DeriveCountTransaction = {
        id: 'tx-1',
        workspaceId: wsId,
        transactionDate: '2025-01-01',
        postedAt: '2025-01-01T00:00:00Z',
        description: 'Groceries',
        tags: ['type:expense', 'category:food', 'account:Bank'],
        status: 'POSTED',
        createdAt: '2025-01-01T00:00:00Z',
        legs: [{ accountId: 'acc-1', amount: -50, unitSymbol: 'INR' }],
      };

      (api.transactions.list as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: [mockDcTx],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });
      (api.accounts.list as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: [{ id: 'acc-1', name: 'Bank' }],
      });

      const result = await adapter.fetchTransactions({ page: 1, limit: 20 });

      expect(result.data.length).toBe(1);
      expect(result.data[0].id).toBe('tx-1');
      expect(result.data[0].category).toBe('food');
      expect(result.meta.total).toBe(1);
    });
  });

  describe('createTransaction', () => {
    it('transpiles and posts new transaction', async () => {
      const adapter = new DcLedgerStorageAdapter(wsId);

      const mockForm = {
        amount: '100',
        account: 'Cash',
        category: 'food',
        subCategory: '',
        note: 'Snacks',
        type: 'expense' as const,
        date: '2025-01-05',
      };

      const mockCreatedDc: DeriveCountTransaction = {
        id: 'tx-new',
        workspaceId: wsId,
        transactionDate: '2025-01-05',
        postedAt: '2025-01-05T00:00:00Z',
        description: 'Snacks',
        tags: ['type:expense', 'category:food', 'account:Cash'],
        status: 'POSTED',
        createdAt: '2025-01-05T00:00:00Z',
        legs: [{ accountId: 'acc-cash', amount: -100, unitSymbol: 'INR' }],
      };

      jest.spyOn(LedgerTranspilerService, 'transpileAndPost').mockResolvedValueOnce(mockCreatedDc);

      const result = await adapter.createTransaction(mockForm);

      expect(result.id).toBe('tx-new');
      expect(result.amount).toBe(100);
      expect(result.category).toBe('food');
    });
  });

  describe('updateTransaction', () => {
    it('voids old transaction and posts new entry', async () => {
      const adapter = new DcLedgerStorageAdapter(wsId);
      (api.transactions.void as jest.Mock).mockResolvedValueOnce({ success: true });

      const mockCreatedDc: DeriveCountTransaction = {
        id: 'tx-updated',
        workspaceId: wsId,
        transactionDate: '2025-01-06',
        postedAt: '2025-01-06T00:00:00Z',
        description: 'Updated note',
        tags: ['type:expense', 'category:food', 'account:Cash'],
        status: 'POSTED',
        createdAt: '2025-01-06T00:00:00Z',
        legs: [{ accountId: 'acc-cash', amount: -120, unitSymbol: 'INR' }],
      };

      jest.spyOn(LedgerTranspilerService, 'transpileAndPost').mockResolvedValueOnce(mockCreatedDc);

      const result = await adapter.updateTransaction('old-tx-id', {
        amount: '120',
        account: 'Cash',
        category: 'food',
        subCategory: '',
        note: 'Updated note',
        type: 'expense',
        date: '2025-01-06',
      });

      expect(api.transactions.void).toHaveBeenCalledWith(wsId, 'old-tx-id');
      expect(result.id).toBe('tx-updated');
      expect(result.amount).toBe(120);
    });
  });

  describe('deleteTransaction', () => {
    it('voids transaction and returns deletedId', async () => {
      const adapter = new DcLedgerStorageAdapter(wsId);
      (api.transactions.void as jest.Mock).mockResolvedValueOnce({ success: true });

      const result = await adapter.deleteTransaction('tx-to-delete');

      expect(api.transactions.void).toHaveBeenCalledWith(wsId, 'tx-to-delete');
      expect(result).toEqual({ deletedId: 'tx-to-delete' });
    });

    it('throws error when void API fails', async () => {
      const adapter = new DcLedgerStorageAdapter(wsId);
      (api.transactions.void as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Cannot void reconciled transaction',
      });

      await expect(adapter.deleteTransaction('tx-rec')).rejects.toThrow(
        'Cannot void reconciled transaction'
      );
    });
  });
});
