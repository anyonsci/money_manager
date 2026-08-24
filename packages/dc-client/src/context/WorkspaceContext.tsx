import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '../api/endpoints';
import { getStoredActiveWorkspaceId, setStoredActiveWorkspaceId } from '../auth/index';
import type { Workspace } from '../types/index';

export interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  isLoading: boolean;
  error: string | null;
  setActiveWorkspace: (workspace: Workspace | string) => void;
  selectWorkspace: (workspace: Workspace | string) => void;
  refreshWorkspaces: () => Promise<void>;
  updateActiveWorkspace: (data: { name?: string; defaultCurrency?: string }) => Promise<void>;
  updateWorkspaceCurrency: (workspaceId: string, currency: string) => Promise<void>;
  createWorkspace: (name: string, type?: 'PERSONAL' | 'SHARED', defaultCurrency?: string) => Promise<Workspace>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshWorkspaces = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.workspaces.list();
      if (res.success && res.data) {
        setWorkspaces(res.data);

        const storedId = getStoredActiveWorkspaceId();
        let matched = res.data.find((w) => w.id === storedId);

        if (!matched && res.data.length > 0) {
          matched = res.data[0];
        }

        if (matched) {
          setActiveWorkspaceState(matched);
          setStoredActiveWorkspaceId(matched.id);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load workspaces');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshWorkspaces();
  }, [refreshWorkspaces]);

  const setActiveWorkspace = (workspaceOrId: Workspace | string) => {
    if (typeof workspaceOrId === 'string') {
      const matched = workspaces.find((w) => w.id === workspaceOrId);
      if (matched) {
        setActiveWorkspaceState(matched);
        setStoredActiveWorkspaceId(matched.id);
      }
    } else if (workspaceOrId && typeof workspaceOrId === 'object') {
      setActiveWorkspaceState(workspaceOrId);
      setStoredActiveWorkspaceId(workspaceOrId.id);
    }
  };

  const updateActiveWorkspace = async (data: { name?: string; defaultCurrency?: string }) => {
    if (!activeWorkspace) throw new Error('No active workspace to update');
    const res = await api.workspaces.update(activeWorkspace.id, data);
    if (res.success && res.data) {
      const updated = res.data;
      setWorkspaces((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
      setActiveWorkspaceState(updated);
      return;
    }
    const errStr = typeof res.error === 'string' ? res.error : res.error?.message;
    throw new Error(errStr || 'Failed to update workspace');
  };

  const updateWorkspaceCurrency = async (workspaceId: string, currency: string) => {
    const res = await api.workspaces.update(workspaceId, { defaultCurrency: currency });
    if (res.success && res.data) {
      const updated = res.data;
      setWorkspaces((prev) => prev.map((w) => (w.id === workspaceId ? updated : w)));
      if (activeWorkspace?.id === workspaceId) {
        setActiveWorkspaceState(updated);
      }
      return;
    }
    const errStr = typeof res.error === 'string' ? res.error : res.error?.message;
    throw new Error(errStr || 'Failed to update workspace');
  };

  const createWorkspace = async (
    name: string,
    type: 'PERSONAL' | 'SHARED' = 'PERSONAL',
    defaultCurrency: string = 'INR'
  ) => {
    const res = await api.workspaces.create({
      name,
      type,
      defaultCurrency,
    });
    if (res.success && res.data) {
      const created = res.data;
      setWorkspaces((prev) => [...prev, created]);
      setActiveWorkspaceState(created);
      setStoredActiveWorkspaceId(created.id);
      return created;
    }
    const errStr = typeof res.error === 'string' ? res.error : res.error?.message;
    throw new Error(errStr || 'Failed to create workspace');
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        isLoading,
        error,
        setActiveWorkspace,
        selectWorkspace: setActiveWorkspace,
        refreshWorkspaces,
        updateActiveWorkspace,
        updateWorkspaceCurrency,
        createWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
