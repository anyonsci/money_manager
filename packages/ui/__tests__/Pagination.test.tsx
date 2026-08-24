import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from '../src/components/transactions/Pagination';

describe('UI Component - Pagination', () => {
  it('does not render if totalPages is 1 or less', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={jest.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders page info and total entries', () => {
    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        totalRows={48}
        onPageChange={jest.fn()}
      />
    );

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('(48 total entries)')).toBeInTheDocument();
  });

  it('disables Prev button on first page and enables Next', () => {
    const handlePageChange = jest.fn();
    render(
      <Pagination
        currentPage={1}
        totalPages={3}
        onPageChange={handlePageChange}
      />
    );

    const prevBtn = screen.getByRole('button', { name: /prev/i });
    const nextBtn = screen.getByRole('button', { name: /next/i });

    expect(prevBtn).toBeDisabled();
    expect(nextBtn).toBeEnabled();

    fireEvent.click(nextBtn);
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });

  it('disables Next button on last page and enables Prev', () => {
    const handlePageChange = jest.fn();
    render(
      <Pagination
        currentPage={3}
        totalPages={3}
        onPageChange={handlePageChange}
      />
    );

    const prevBtn = screen.getByRole('button', { name: /prev/i });
    const nextBtn = screen.getByRole('button', { name: /next/i });

    expect(prevBtn).toBeEnabled();
    expect(nextBtn).toBeDisabled();

    fireEvent.click(prevBtn);
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });

  it('disables both buttons when loading is true', () => {
    render(
      <Pagination
        currentPage={2}
        totalPages={4}
        loading={true}
        onPageChange={jest.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /prev/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });
});
