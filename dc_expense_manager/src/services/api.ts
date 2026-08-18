import { apiClient } from './apiClient.js';
import type {
  ApiResponse,
  Workspace,
  AccountGroup,
  Account,
  DeriveCountTransaction,
  UserProfile,
} from '../types/index.js';

export const api = {
  // Authentication
  auth: {
    googleLogin: async (idToken: string) => {
      const response = await apiClient.post<ApiResponse<{ token: string; refreshToken: string; user: UserProfile }>>(
        '/api/auth/google',
        { token: idToken }
      );
      return response.data;
    },
    getMe: async () => {
      const response = await apiClient.get<ApiResponse<{ user: UserProfile; workspaces: Workspace[] }>>(
        '/api/auth/me'
      );
      return response.data;
    },
    logout: async () => {
      const response = await apiClient.post<ApiResponse<{ message: string }>>('/api/auth/logout');
      return response.data;
    },
  },

  // Workspaces
  workspaces: {
    list: async () => {
      const response = await apiClient.get<ApiResponse<Workspace[]>>('/api/workspaces');
      return response.data;
    },
    create: async (data: { name: string; type: 'PERSONAL' | 'SHARED'; defaultCurrency: string }) => {
      const response = await apiClient.post<ApiResponse<Workspace>>('/api/workspaces', data);
      return response.data;
    },
    get: async (id: string) => {
      const response = await apiClient.get<ApiResponse<Workspace>>(`/api/workspaces/${id}`);
      return response.data;
    },
  },

  // Account Groups
  accountGroups: {
    list: async (workspaceId: string) => {
      const response = await apiClient.get<ApiResponse<AccountGroup[]>>(
        `/api/workspaces/${workspaceId}/account-groups`
      );
      return response.data;
    },
    create: async (
      workspaceId: string,
      data: { name: string; accountType: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE' }
    ) => {
      const response = await apiClient.post<ApiResponse<AccountGroup>>(
        `/api/workspaces/${workspaceId}/account-groups`,
        data
      );
      return response.data;
    },
  },

  // Accounts
  accounts: {
    list: async (workspaceId: string) => {
      const response = await apiClient.get<ApiResponse<Account[]>>(
        `/api/workspaces/${workspaceId}/accounts`
      );
      return response.data;
    },
    create: async (
      workspaceId: string,
      data: { accountGroupId: string; name: string; unitSymbol: string }
    ) => {
      const response = await apiClient.post<ApiResponse<Account>>(
        `/api/workspaces/${workspaceId}/accounts`,
        data
      );
      return response.data;
    },
  },

  // Transactions
  transactions: {
    list: async (
      workspaceId: string,
      params: {
        page?: number;
        limit?: number;
        startDate?: string;
        endDate?: string;
        search?: string;
        tag?: string;
        status?: 'POSTED' | 'DRAFT' | 'VOID';
      } = {}
    ) => {
      const response = await apiClient.get<ApiResponse<DeriveCountTransaction[]>>(
        `/api/workspaces/${workspaceId}/transactions`,
        { params }
      );
      return response.data;
    },
    create: async (
      workspaceId: string,
      data: {
        transactionDate: string | Date;
        postedAt?: string | Date;
        description: string;
        tags?: string[];
        legs: Array<{
          accountId: string;
          amount: number;
          unitSymbol: string;
          exchangeRate?: number;
          baseAmount?: number;
        }>;
      }
    ) => {
      const response = await apiClient.post<ApiResponse<DeriveCountTransaction>>(
        `/api/workspaces/${workspaceId}/transactions`,
        data
      );
      return response.data;
    },
    void: async (workspaceId: string, transactionId: string) => {
      const response = await apiClient.post<ApiResponse<DeriveCountTransaction>>(
        `/api/workspaces/${workspaceId}/transactions/${transactionId}?action=void`
      );
      return response.data;
    },
  },

  // Reports
  reports: {
    getBalanceSheet: async (workspaceId: string) => {
      const response = await apiClient.get<ApiResponse<any>>(
        `/api/workspaces/${workspaceId}/reports/balance-sheet`
      );
      return response.data;
    },
    getIncomeStatement: async (
      workspaceId: string,
      params: { startDate?: string; endDate?: string } = {}
    ) => {
      const response = await apiClient.get<ApiResponse<any>>(
        `/api/workspaces/${workspaceId}/reports/income-statement`,
        { params }
      );
      return response.data;
    },
  },
};
