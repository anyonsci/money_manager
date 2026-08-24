import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ResponsiveLayout } from '../src/components/layout/ResponsiveLayout';

describe('UI Component - ResponsiveLayout', () => {
  it('renders brand title, subtitle, and children', () => {
    render(
      <MemoryRouter>
        <ResponsiveLayout
          brandTitle="My Finance Portal"
          brandSubtitle="Track everything easily"
        >
          <div data-testid="test-child">Child Content</div>
        </ResponsiveLayout>
      </MemoryRouter>
    );

    expect(screen.getByText('My Finance Portal')).toBeInTheDocument();
    expect(screen.getByText('Track everything easily')).toBeInTheDocument();
    expect(screen.getByTestId('test-child')).toHaveTextContent('Child Content');
  });

  it('renders brand badge, brand icon, header controls, and user avatar', () => {
    render(
      <MemoryRouter>
        <ResponsiveLayout
          brandBadge="BETA"
          brandIcon={<span data-testid="brand-icon">🌟</span>}
          headerControls={<button data-testid="sync-btn">Sync</button>}
          userAvatar={<div data-testid="avatar">Avatar</div>}
        >
          <div>Main</div>
        </ResponsiveLayout>
      </MemoryRouter>
    );

    expect(screen.getByText('BETA')).toBeInTheDocument();
    expect(screen.getByTestId('brand-icon')).toBeInTheDocument();
    expect(screen.getByTestId('sync-btn')).toBeInTheDocument();
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
  });

  it('handles onLogoClick callback when clicked', () => {
    const handleLogoClick = jest.fn();
    render(
      <MemoryRouter>
        <ResponsiveLayout onLogoClick={handleLogoClick}>
          <div>Main</div>
        </ResponsiveLayout>
      </MemoryRouter>
    );

    const logoBtn = screen.getByRole('button', { name: /money manager/i });
    fireEvent.click(logoBtn);
    expect(handleLogoClick).toHaveBeenCalledTimes(1);
  });

  it('renders bottom navigation by default and hides when showNav is false', () => {
    const { rerender } = render(
      <MemoryRouter>
        <ResponsiveLayout showNav={true}>
          <div>Main</div>
        </ResponsiveLayout>
      </MemoryRouter>
    );

    expect(screen.getByText('Quick Entry')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <ResponsiveLayout showNav={false}>
          <div>Main</div>
        </ResponsiveLayout>
      </MemoryRouter>
    );

    expect(screen.queryByText('Quick Entry')).not.toBeInTheDocument();
  });
});
