import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Workspace } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from './AuthContext.js';
import { getStoredActiveWorkspaceId, setStoredActiveWorkspaceId } from '../utils/auth.js';

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  isLoadingWorkspaces: boolean;
  setActiveWorkspace: (workspace: Workspace) => void;
  updateActiveWorkspace: (data: { name?: string; defaultCurrency?: string }) => Promise<Workspace>;
  createWorkspace: (name: string, type: 'PERSONAL' | 'SHARED', currency: string) => Promise<Workspace>;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(null);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState<boolean>(false);

  const fetchWorkspaces = async () => {
    if (!isAuthenticated) {
      setWorkspaces([]);
      setActiveWorkspaceState(null);
      return;
    }

    setIsLoadingWorkspaces(true);
    try {
      const res = await api.workspaces.list();
      if (res.success && res.data) {
        const list = res.data;
        setWorkspaces(list);

        const savedId = getStoredActiveWorkspaceId();
        const found = list.find((w) => w.id === savedId);

        if (found) {
          setActiveWorkspaceState(found);
        } else if (list.length > 0) {
          setActiveWorkspaceState(list[0]);
          setStoredActiveWorkspaceId(list[0].id);
        }
      }
    } catch (err) {
      console.warn('Failed to load workspaces:', err);
    } finally {
      setIsLoadingWorkspaces(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [isAuthenticated]);

  const setActiveWorkspace = (workspace: Workspace) => {
    setActiveWorkspaceState(workspace);
    setStoredActiveWorkspaceId(workspace.id);
  };

  const updateActiveWorkspace = async (data: { name?: string; defaultCurrency?: string }): Promise<Workspace> => {
    if (!activeWorkspace) throw new Error('No active workspace selected');

    const res = await api.workspaces.update(activeWorkspace.id, data);
    if (res.success && res.data) {
      const updated = res.data;
      setWorkspaces((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
      setActiveWorkspaceState(updated);
      return updated;
    }
    throw new Error(res.error?.message || 'Failed to update workspace');
  };

  const createWorkspace = async (
    name: string,
    type: 'PERSONAL' | 'SHARED',
    currency: string
  ): Promise<Workspace> => {
    const res = await api.workspaces.create({
      name,
      type,
      defaultCurrency: currency || 'USD',
    });

    if (res.success && res.data) {
      const newWs = res.data;
      setWorkspaces((prev) => [newWs, ...prev]);
      setActiveWorkspace(newWs);
      return newWs;
    }

    throw new Error(res.error?.message || 'Failed to create workspace');
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        isLoadingWorkspaces,
        setActiveWorkspace,
        updateActiveWorkspace,
        createWorkspace,
        refreshWorkspaces: fetchWorkspaces,
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
