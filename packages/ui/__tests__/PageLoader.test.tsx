import React from 'react';
import { render, screen } from '@testing-library/react';
import { PageLoader } from '../src/components/common/PageLoader';

describe('UI Component - PageLoader', () => {
  it('renders default message', () => {
    render(<PageLoader />);
    expect(screen.getByText('Loading view...')).toBeInTheDocument();
  });

  it('renders custom message', () => {
    render(<PageLoader message="Fetching financial ledger data..." />);
    expect(screen.getByText('Fetching financial ledger data...')).toBeInTheDocument();
  });
});
