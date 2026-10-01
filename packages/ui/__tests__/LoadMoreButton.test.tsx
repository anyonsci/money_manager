import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoadMoreButton } from '../src/components/transactions/LoadMoreButton';

describe('UI Component - LoadMoreButton', () => {
  it('renders load more button when hasMore is true', () => {
    const handleLoadMore = jest.fn();
    render(
      <LoadMoreButton
        onLoadMore={handleLoadMore}
        hasMore={true}
        loadedCount={10}
        totalCount={50}
        batchSize={200}
      />
    );

    expect(screen.getByText(/Showing/i)).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: /load more/i });
    expect(btn).toBeInTheDocument();
    expect(screen.getByText('+200')).toBeInTheDocument();

    fireEvent.click(btn);
    expect(handleLoadMore).toHaveBeenCalledTimes(1);
  });

  it('renders loading state when isLoading is true', () => {
    render(
      <LoadMoreButton
        onLoadMore={jest.fn()}
        hasMore={true}
        isLoading={true}
        loadedCount={10}
      />
    );

    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(screen.getByText('Loading more...')).toBeInTheDocument();
  });

  it('renders all loaded message when hasMore is false and loadedCount > 0', () => {
    render(
      <LoadMoreButton
        onLoadMore={jest.fn()}
        hasMore={false}
        loadedCount={10}
        totalCount={10}
      />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText(/All 10 transactions loaded/i)).toBeInTheDocument();
  });

  it('renders nothing when hasMore is false and loadedCount is 0', () => {
    const { container } = render(
      <LoadMoreButton
        onLoadMore={jest.fn()}
        hasMore={false}
        loadedCount={0}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
