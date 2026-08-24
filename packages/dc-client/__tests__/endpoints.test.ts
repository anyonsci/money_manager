import { api } from '../src/api/endpoints';
import { apiClient } from '../src/api/client';

jest.mock('../src/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('DC Client - API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('auth endpoints', () => {
    it('calls googleLogin with idToken', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: { success: true } });
      const result = await api.auth.googleLogin('google-id-token');
      expect(apiClient.post).toHaveBeenCalledWith('/api/auth/google', { token: 'google-id-token' });
      expect(result).toEqual({ success: true });
    });

    it('calls getMe', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: { success: true, data: { user: {} } } });
      const result = await api.auth.getMe();
      expect(apiClient.get).toHaveBeenCalledWith('/api/auth/me');
      expect(result.success).toBe(true);
    });

    it('calls logout', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: { success: true } });
      const result = await api.auth.logout();
      expect(apiClient.post).toHaveBeenCalledWith('/api/auth/logout');
      expect(result.success).toBe(true);
    });
  });

  describe('workspaces endpoints', () => {
    it('lists workspaces', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: { success: true, data: [] } });
      await api.workspaces.list();
      expect(apiClient.get).toHaveBeenCalledWith('/api/workspaces');
    });

    it('creates workspace', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: { success: true, data: { id: 'ws1' } } });
      await api.workspaces.create({ name: 'Personal', type: 'PERSONAL', defaultCurrency: 'INR' });
      expect(apiClient.post).toHaveBeenCalledWith('/api/workspaces', {
        name: 'Personal',
        type: 'PERSONAL',
        defaultCurrency: 'INR',
      });
    });

    it('gets workspace by id', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: { success: true, data: { id: 'ws1' } } });
      await api.workspaces.get('ws1');
      expect(apiClient.get).toHaveBeenCalledWith('/api/workspaces/ws1');
    });

    it('updates workspace', async () => {
      (apiClient.patch as jest.Mock).mockResolvedValueOnce({ data: { success: true } });
      await api.workspaces.update('ws1', { name: 'New Name' });
      expect(apiClient.patch).toHaveBeenCalledWith('/api/workspaces/ws1', { name: 'New Name' });
    });

    it('deletes workspace', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValueOnce({ data: { success: true } });
      await api.workspaces.delete('ws1');
      expect(apiClient.delete).toHaveBeenCalledWith('/api/workspaces/ws1');
    });
  });

  describe('accountGroups endpoints', () => {
    it('lists account groups for workspace', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: { success: true, data: [] } });
      await api.accountGroups.list('ws1');
      expect(apiClient.get).toHaveBeenCalledWith('/api/workspaces/ws1/account-groups');
    });

    it('creates account group', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: { success: true } });
      await api.accountGroups.create('ws1', { name: 'Assets', accountType: 'ASSET' });
      expect(apiClient.post).toHaveBeenCalledWith('/api/workspaces/ws1/account-groups', {
        name: 'Assets',
        accountType: 'ASSET',
      });
    });
  });

  describe('accounts endpoints', () => {
    it('lists accounts for workspace', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: { success: true, data: [] } });
      await api.accounts.list('ws1');
      expect(apiClient.get).toHaveBeenCalledWith('/api/workspaces/ws1/accounts');
    });

    it('creates account', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: { success: true } });
      await api.accounts.create('ws1', { name: 'Bank', accountGroupId: 'ag1', unitSymbol: 'INR' });
      expect(apiClient.post).toHaveBeenCalledWith('/api/workspaces/ws1/accounts', {
        name: 'Bank',
        accountGroupId: 'ag1',
        unitSymbol: 'INR',
      });
    });
  });

  describe('transactions endpoints', () => {
    it('lists transactions with query params', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: { success: true, data: [] } });
      await api.transactions.list('ws1', { page: 1, limit: 10, search: 'coffee' });
      expect(apiClient.get).toHaveBeenCalledWith('/api/workspaces/ws1/transactions', {
        params: { page: 1, limit: 10, search: 'coffee' },
      });
    });

    it('creates transaction', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: { success: true, data: { id: 'tx1' } } });
      const payload = {
        transactionDate: '2025-01-01',
        description: 'Dinner',
        tags: ['type:expense'],
        status: 'POSTED' as const,
        legs: [{ accountId: 'acc1', amount: 50, unitSymbol: 'INR' }],
      };
      await api.transactions.create('ws1', payload);
      expect(apiClient.post).toHaveBeenCalledWith('/api/workspaces/ws1/transactions', payload);
    });

    it('gets transaction by id', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: { success: true } });
      await api.transactions.get('ws1', 'tx1');
      expect(apiClient.get).toHaveBeenCalledWith('/api/workspaces/ws1/transactions/tx1');
    });

    it('voids transaction', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: { success: true } });
      await api.transactions.void('ws1', 'tx1');
      expect(apiClient.post).toHaveBeenCalledWith('/api/workspaces/ws1/transactions/tx1/void');
    });
  });
});
