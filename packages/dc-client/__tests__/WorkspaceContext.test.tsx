import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { WorkspaceProvider, useWorkspace } from '../src/context/WorkspaceContext';
import { api } from '../src/api/endpoints';
import * as authModule from '../src/auth/index';
import { Workspace } from '../src/types/index';

jest.mock('../src/api/endpoints', () => ({
  api: {
    workspaces: {
      list: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('DC Client - WorkspaceContext', () => {
  const mockWorkspaces: Workspace[] = [
    { id: 'ws-1', name: 'Personal Finances', type: 'PERSONAL', defaultCurrency: 'INR' },
    { id: 'ws-2', name: 'Business Hub', type: 'SHARED', defaultCurrency: 'USD' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('throws error when useWorkspace is used outside WorkspaceProvider', () => {
    // Suppress React error boundary console output during error expectation
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useWorkspace());
    }).toThrow('useWorkspace must be used within a WorkspaceProvider');

    consoleSpy.mockRestore();
  });

  it('fetches workspaces on mount and selects matching stored workspace', async () => {
    jest.spyOn(authModule, 'getStoredActiveWorkspaceId').mockReturnValue('ws-2');
    (api.workspaces.list as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: mockWorkspaces,
    });

    const { result } = renderHook(() => useWorkspace(), {
      wrapper: ({ children }) => <WorkspaceProvider>{children}</WorkspaceProvider>,
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.workspaces).toEqual(mockWorkspaces);
    expect(result.current.activeWorkspace).toEqual(mockWorkspaces[1]);
  });

  it('falls back to the first workspace if stored workspace does not match', async () => {
    jest.spyOn(authModule, 'getStoredActiveWorkspaceId').mockReturnValue('non-existent-id');
    (api.workspaces.list as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: mockWorkspaces,
    });

    const setStoredSpy = jest.spyOn(authModule, 'setStoredActiveWorkspaceId');

    const { result } = renderHook(() => useWorkspace(), {
      wrapper: ({ children }) => <WorkspaceProvider>{children}</WorkspaceProvider>,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.activeWorkspace).toEqual(mockWorkspaces[0]);
    expect(setStoredSpy).toHaveBeenCalledWith('ws-1');
  });

  it('sets active workspace by ID string and by object', async () => {
    (api.workspaces.list as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: mockWorkspaces,
    });

    const { result } = renderHook(() => useWorkspace(), {
      wrapper: ({ children }) => <WorkspaceProvider>{children}</WorkspaceProvider>,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setActiveWorkspace('ws-2');
    });
    expect(result.current.activeWorkspace?.id).toBe('ws-2');

    act(() => {
      result.current.selectWorkspace(mockWorkspaces[0]);
    });
    expect(result.current.activeWorkspace?.id).toBe('ws-1');
  });

  it('creates new workspace and activates it', async () => {
    (api.workspaces.list as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: [mockWorkspaces[0]],
    });

    const newWs: Workspace = {
      id: 'ws-new',
      name: 'Travel Fund',
      type: 'PERSONAL',
      defaultCurrency: 'EUR',
    };

    (api.workspaces.create as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: newWs,
    });

    const { result } = renderHook(() => useWorkspace(), {
      wrapper: ({ children }) => <WorkspaceProvider>{children}</WorkspaceProvider>,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let created: Workspace | undefined;
    await act(async () => {
      created = await result.current.createWorkspace('Travel Fund', 'PERSONAL', 'EUR');
    });

    expect(created).toEqual(newWs);
    expect(result.current.workspaces).toContainEqual(newWs);
    expect(result.current.activeWorkspace).toEqual(newWs);
  });

  it('updates active workspace name and currency', async () => {
    (api.workspaces.list as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: [mockWorkspaces[0]],
    });

    const updatedWs: Workspace = {
      ...mockWorkspaces[0],
      name: 'Updated Name',
      defaultCurrency: 'USD',
    };

    (api.workspaces.update as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: updatedWs,
    });

    const { result } = renderHook(() => useWorkspace(), {
      wrapper: ({ children }) => <WorkspaceProvider>{children}</WorkspaceProvider>,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.updateActiveWorkspace({ name: 'Updated Name', defaultCurrency: 'USD' });
    });

    expect(result.current.activeWorkspace?.name).toBe('Updated Name');
    expect(result.current.activeWorkspace?.defaultCurrency).toBe('USD');
  });

  it('handles workspace fetch errors gracefully', async () => {
    (api.workspaces.list as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useWorkspace(), {
      wrapper: ({ children }) => <WorkspaceProvider>{children}</WorkspaceProvider>,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
  });
});
