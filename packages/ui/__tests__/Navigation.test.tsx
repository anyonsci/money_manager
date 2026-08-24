import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Navigation } from '../src/components/layout/Navigation';

describe('UI Component - Navigation', () => {
  it('renders all three primary navigation links', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Navigation />
      </MemoryRouter>
    );

    const quickEntryLink = screen.getByRole('link', { name: /quick entry/i });
    const transactionsLink = screen.getByRole('link', { name: /transactions/i });
    const analyticsLink = screen.getByRole('link', { name: /analytics/i });

    expect(quickEntryLink).toBeInTheDocument();
    expect(transactionsLink).toBeInTheDocument();
    expect(analyticsLink).toBeInTheDocument();

    expect(quickEntryLink).toHaveAttribute('href', '/');
    expect(transactionsLink).toHaveAttribute('href', '/transactions');
    expect(analyticsLink).toHaveAttribute('href', '/analytics');
  });

  it('applies active styling to the current route link', () => {
    render(
      <MemoryRouter initialEntries={['/transactions']}>
        <Navigation />
      </MemoryRouter>
    );

    const transactionsLink = screen.getByRole('link', { name: /transactions/i });
    expect(transactionsLink.className).toContain('text-brand-400');
  });
});
