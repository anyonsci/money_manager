import { LedgerTranspilerService } from '../src/services/ledger-transpiler';
import { api } from '../src/api/endpoints';
import { Account, AccountGroup, DeriveCountTransaction } from '../src/types/index';

jest.mock('../src/api/endpoints', () => ({
  api: {
    accountGroups: {
      list: jest.fn(),
      create: jest.fn(),
    },
    accounts: {
      list: jest.fn(),
      create: jest.fn(),
    },
    transactions: {
      create: jest.fn(),
    },
  },
}));

describe('DC Client - LedgerTranspilerService', () => {
  const mockWorkspaceId = 'ws-test-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('refreshCache and ensureChartOfAccounts', () => {
    it('refreshes cache and reuses existing groups and accounts', async () => {
      const mockAssetGroup: AccountGroup = {
        id: 'ag-asset',
        workspaceId: mockWorkspaceId,
        name: 'Assets',
        accountType: 'ASSET',
      };
      const mockExpenseGroup: AccountGroup = {
        id: 'ag-expense',
        workspaceId: mockWorkspaceId,
        name: 'Expenses',
        accountType: 'EXPENSE',
      };
      const mockAssetAccount: Account = {
        id: 'acc-hdfc',
        workspaceId: mockWorkspaceId,
        accountGroupId: 'ag-asset',
        name: 'HDFC',
        unitSymbol: 'INR',
        currentBalance: '1000',
      };
      const mockCategoryAccount: Account = {
        id: 'acc-food',
        workspaceId: mockWorkspaceId,
        accountGroupId: 'ag-expense',
        name: 'food',
        unitSymbol: 'INR',
        currentBalance: '0',
      };

      (api.accountGroups.list as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: [mockAssetGroup, mockExpenseGroup],
      });
      (api.accounts.list as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: [mockAssetAccount, mockCategoryAccount],
      });

      await LedgerTranspilerService.refreshCache(mockWorkspaceId);

      const result = await LedgerTranspilerService.ensureChartOfAccounts(
        mockWorkspaceId,
        'HDFC',
        'food',
        'expense',
        'INR'
      );

      expect(result.assetAccount).toEqual(mockAssetAccount);
      expect(result.categoryAccount).toEqual(mockCategoryAccount);
      expect(api.accountGroups.create).not.toHaveBeenCalled();
      expect(api.accounts.create).not.toHaveBeenCalled();
    });

    it('creates missing groups and accounts on the fly', async () => {
      const newWsId = 'ws-empty';
      (api.accountGroups.list as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: [],
      });
      (api.accounts.list as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: [],
      });

      // Mocks for group creations
      (api.accountGroups.create as jest.Mock)
        .mockResolvedValueOnce({
          success: true,
          data: { id: 'ag-new-asset', workspaceId: newWsId, name: 'Assets', accountType: 'ASSET' },
        })
        .mockResolvedValueOnce({
          success: true,
          data: { id: 'ag-new-income', workspaceId: newWsId, name: 'Income', accountType: 'INCOME' },
        });

      // Mocks for account creations
      (api.accounts.create as jest.Mock)
        .mockResolvedValueOnce({
          success: true,
          data: {
            id: 'acc-new-bank',
            workspaceId: newWsId,
            accountGroupId: 'ag-new-asset',
            name: 'Savings',
            unitSymbol: 'USD',
            currentBalance: '0',
          },
        })
        .mockResolvedValueOnce({
          success: true,
          data: {
            id: 'acc-new-salary',
            workspaceId: newWsId,
            accountGroupId: 'ag-new-income',
            name: 'salary',
            unitSymbol: 'USD',
            currentBalance: '0',
          },
        });

      const result = await LedgerTranspilerService.ensureChartOfAccounts(
        newWsId,
        'Savings',
        'salary',
        'income',
        'USD'
      );

      expect(result.assetAccount.name).toBe('Savings');
      expect(result.categoryAccount.name).toBe('salary');
      expect(api.accountGroups.create).toHaveBeenCalledTimes(2);
      expect(api.accounts.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('transpileAndPost', () => {
    it('throws error for non-positive amount', async () => {
      await expect(
        LedgerTranspilerService.transpileAndPost(mockWorkspaceId, {
          amount: '-50',
          account: 'Cash',
          category: 'food',
          subCategory: '',
          note: '',
          type: 'expense',
          date: '2025-01-01',
        })
      ).rejects.toThrow('Invalid transaction amount');
    });

    it('creates double-entry expense transaction with proper debit/credit legs', async () => {
      const mockAssetAccount: Account = {
        id: 'acc-cash',
        workspaceId: mockWorkspaceId,
        accountGroupId: 'ag-asset',
        name: 'Cash',
        unitSymbol: 'INR',
        currentBalance: '500',
      };
      const mockCategoryAccount: Account = {
        id: 'acc-food',
        workspaceId: mockWorkspaceId,
        accountGroupId: 'ag-expense',
        name: 'food',
        unitSymbol: 'INR',
        currentBalance: '0',
      };

      jest.spyOn(LedgerTranspilerService, 'ensureChartOfAccounts').mockResolvedValueOnce({
        assetAccount: mockAssetAccount,
        categoryAccount: mockCategoryAccount,
      });

      const mockPostedTx: DeriveCountTransaction = {
        id: 'tx-101',
        workspaceId: mockWorkspaceId,
        transactionDate: '2025-01-10',
        postedAt: '2025-01-10T12:00:00Z',
        description: 'Lunch',
        tags: ['type:expense', 'category:food', 'account:Cash', 'subcategory:groceries'],
        status: 'POSTED',
        createdAt: '2025-01-10T12:00:00Z',
        legs: [
          { accountId: 'acc-cash', amount: -250, unitSymbol: 'INR' },
          { accountId: 'acc-food', amount: 250, unitSymbol: 'INR' },
        ],
      };

      (api.transactions.create as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: mockPostedTx,
      });

      const result = await LedgerTranspilerService.transpileAndPost(
        mockWorkspaceId,
        {
          amount: '250',
          account: 'Cash',
          category: 'food',
          subCategory: 'groceries',
          note: 'Lunch',
          type: 'expense',
          date: '2025-01-10',
        },
        'INR'
      );

      expect(result).toEqual(mockPostedTx);
      expect(api.transactions.create).toHaveBeenCalledWith(
        mockWorkspaceId,
        expect.objectContaining({
          transactionDate: '2025-01-10',
          description: 'Lunch',
          status: 'POSTED',
          tags: ['type:expense', 'category:food', 'account:Cash', 'subcategory:groceries'],
          legs: [
            { accountId: 'acc-cash', amount: -250, unitSymbol: 'INR' },
            { accountId: 'acc-food', amount: 250, unitSymbol: 'INR' },
          ],
        })
      );
    });

    it('creates double-entry income transaction with proper debit/credit legs', async () => {
      const mockAssetAccount: Account = {
        id: 'acc-bank',
        workspaceId: mockWorkspaceId,
        accountGroupId: 'ag-asset',
        name: 'Bank',
        unitSymbol: 'INR',
        currentBalance: '0',
      };
      const mockCategoryAccount: Account = {
        id: 'acc-salary',
        workspaceId: mockWorkspaceId,
        accountGroupId: 'ag-income',
        name: 'salary',
        unitSymbol: 'INR',
        currentBalance: '0',
      };

      jest.spyOn(LedgerTranspilerService, 'ensureChartOfAccounts').mockResolvedValueOnce({
        assetAccount: mockAssetAccount,
        categoryAccount: mockCategoryAccount,
      });

      (api.transactions.create as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: { id: 'tx-202' },
      });

      await LedgerTranspilerService.transpileAndPost(
        mockWorkspaceId,
        {
          amount: '50000',
          account: 'Bank',
          category: 'salary',
          subCategory: '',
          note: 'Paycheck',
          type: 'income',
          date: '2025-01-31',
        },
        'INR'
      );

      expect(api.transactions.create).toHaveBeenCalledWith(
        mockWorkspaceId,
        expect.objectContaining({
          legs: [
            { accountId: 'acc-bank', amount: 50000, unitSymbol: 'INR' },
            { accountId: 'acc-salary', amount: -50000, unitSymbol: 'INR' },
          ],
        })
      );
    });
  });

  describe('transpileToFrontend', () => {
    it('transpiles raw DC transaction into frontend format parsing tags', () => {
      const rawTx: DeriveCountTransaction = {
        id: 'tx-fmt-1',
        workspaceId: mockWorkspaceId,
        transactionDate: '2025-02-15',
        postedAt: '2025-02-15T10:00:00Z',
        description: 'Coffee and snacks',
        tags: [
          'type:expense',
          'category:food',
          'subcategory:snacks',
          'account:Checking',
        ],
        status: 'POSTED',
        createdAt: '2025-02-15T10:00:00Z',
        legs: [
          { accountId: 'acc-1', amount: -150, unitSymbol: 'INR' },
          { accountId: 'acc-2', amount: 150, unitSymbol: 'INR' },
        ],
      };

      const formatted = LedgerTranspilerService.transpileToFrontend(rawTx);

      expect(formatted).toEqual({
        id: 'tx-fmt-1',
        transactionDate: '2025-02-15',
        amount: 150,
        account: 'Checking',
        category: 'food',
        subCategory: 'snacks',
        note: 'Coffee and snacks',
        type: 'expense',
        status: 'POSTED',
        raw: rawTx,
      });
    });

    it('falls back to accountsMap if account tag is missing', () => {
      const accountsMap = new Map<string, Account>();
      accountsMap.set('acc-1', {
        id: 'acc-1',
        workspaceId: mockWorkspaceId,
        accountGroupId: 'ag-1',
        name: 'Wallet Cash',
        unitSymbol: 'INR',
        currentBalance: '100',
      });

      const rawTx: DeriveCountTransaction = {
        id: 'tx-fmt-2',
        workspaceId: mockWorkspaceId,
        transactionDate: '2025-03-01',
        postedAt: '2025-03-01T08:00:00Z',
        description: 'Auto fare',
        tags: ['type:expense', 'category:travel'],
        status: 'POSTED',
        createdAt: '2025-03-01T08:00:00Z',
        legs: [{ accountId: 'acc-1', amount: -60, unitSymbol: 'INR' }],
      };

      const formatted = LedgerTranspilerService.transpileToFrontend(rawTx, accountsMap);
      expect(formatted.account).toBe('Wallet Cash');
      expect(formatted.category).toBe('travel');
      expect(formatted.amount).toBe(60);
    });
  });
});
