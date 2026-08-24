import { apiClient } from './client';
import type {
  ApiResponse,
  Workspace,
  AccountGroup,
  Account,
  DeriveCountTransaction,
  UserProfile,
} from '../types/index';

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
    update: async (id: string, data: { name?: string; defaultCurrency?: string }) => {
      const response = await apiClient.patch<ApiResponse<Workspace>>(`/api/workspaces/${id}`, data);
      return response.data;
    },
    delete: async (id: string) => {
      const response = await apiClient.delete<ApiResponse<{ id: string }>>(`/api/workspaces/${id}`);
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
    create: async (workspaceId: string, data: { name: string; accountType: string }) => {
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
      data: { name: string; accountGroupId: string; unitSymbol: string }
    ) => {
      const response = await apiClient.post<ApiResponse<Account>>(
        `/api/workspaces/${workspaceId}/accounts`,
        data
      );
      return response.data;
    },
  },

  // Double-Entry Transactions
  transactions: {
    list: async (
      workspaceId: string,
      params?: {
        page?: number;
        limit?: number;
        startDate?: string;
        endDate?: string;
        tag?: string;
        search?: string;
      }
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
        transactionDate: string;
        description: string;
        tags: string[];
        status: 'POSTED' | 'DRAFT' | 'VOID';
        legs: Array<{
          accountId: string;
          amount: string | number;
          unitSymbol: string;
        }>;
      }
    ) => {
      const response = await apiClient.post<ApiResponse<DeriveCountTransaction>>(
        `/api/workspaces/${workspaceId}/transactions`,
        data
      );
      return response.data;
    },
    get: async (workspaceId: string, id: string) => {
      const response = await apiClient.get<ApiResponse<DeriveCountTransaction>>(
        `/api/workspaces/${workspaceId}/transactions/${id}`
      );
      return response.data;
    },
    void: async (workspaceId: string, id: string) => {
      const response = await apiClient.post<ApiResponse<DeriveCountTransaction>>(
        `/api/workspaces/${workspaceId}/transactions/${id}/void`
      );
      return response.data;
    },
  },
};
