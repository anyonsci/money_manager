import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

const createValidMockJwt = (email = 'test@example.com') => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      email,
      name: 'Test User',
      exp: Math.floor(Date.now() / 1000) + 3600,
    })
  );
  return `${header}.${payload}.signature`;
};

const TestConsumer: React.FC = () => {
  const { accessToken, isLoading, user } = useAuth();
  return (
    <div>
      <div data-testid="loading-state">{isLoading ? 'loading' : 'ready'}</div>
      <div data-testid="token-state">{accessToken || 'no-token'}</div>
      <div data-testid="user-state">{user?.email || 'no-user'}</div>
    </div>
  );
};

describe('gsheet AuthContext Fast Boot', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
  });

  test('boots synchronously without loading delay when valid token exists in storage', () => {
    const validToken = createValidMockJwt('fast@example.com');
    localStorage.setItem('gsheet_access_token', validToken);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // Initial paint must be ready immediately (no loading screen!)
    expect(screen.getByTestId('loading-state')).toHaveTextContent('ready');
    expect(screen.getByTestId('token-state')).toHaveTextContent(validToken);
    expect(screen.getByTestId('user-state')).toHaveTextContent('fast@example.com');
  });

  test('boots synchronously into unauthenticated state when no token exists in storage', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // Initial paint must not block on loading screen if no callback is in the URL
    expect(screen.getByTestId('loading-state')).toHaveTextContent('ready');
    expect(screen.getByTestId('token-state')).toHaveTextContent('no-token');
    expect(screen.getByTestId('user-state')).toHaveTextContent('no-user');
  });
});
