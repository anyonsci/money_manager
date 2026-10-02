import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  SpendingPaceChart,
  NeedsWantsSplit,
  AccountOutflowList,
  DayOfWeekSpending,
  CategoryMoMTrends,
  SubcategoryBreakdown,
} from '../src/index';
import { UnifiedTransaction } from '@money-manager/core';

describe('UI Analytics New Components', () => {
  const fixedRefDate = new Date(2026, 9, 2); // Oct 2, 2026

  const sampleTransactions: UnifiedTransaction[] = [
    // This month (Oct 2026)
    {
      id: 'tx-1',
      transactionDate: '2026-10-01',
      amount: 500,
      type: 'expense',
      category: 'need',
      subCategory: 'Groceries',
      account: 'Card',
    },
    {
      id: 'tx-2',
      transactionDate: '2026-10-02',
      amount: 150,
      type: 'expense',
      category: 'food',
      subCategory: 'Coffee',
      account: 'Cash',
    },
    // Last month (Sep 2026)
    {
      id: 'tx-3',
      transactionDate: '2026-09-01',
      amount: 400,
      type: 'expense',
      category: 'need',
      subCategory: 'Groceries',
      account: 'Card',
    },
    {
      id: 'tx-4',
      transactionDate: '2026-09-02',
      amount: 300,
      type: 'expense',
      category: 'travel',
      subCategory: 'Metro',
      account: 'UPI',
    },
    {
      id: 'tx-5',
      transactionDate: '2026-09-15',
      amount: 1200,
      type: 'expense',
      category: 'rent',
      subCategory: 'Apartment',
      account: 'Bank',
    },
  ];

  describe('SpendingPaceChart', () => {
    it('renders empty state when no expenses exist', () => {
      render(<SpendingPaceChart transactions={[]} referenceDate={fixedRefDate} />);
      expect(screen.getByText('No recent spending pace data')).toBeInTheDocument();
    });

    it('renders spending pace comparison and header metrics', () => {
      render(
        <SpendingPaceChart
          transactions={sampleTransactions}
          referenceDate={fixedRefDate}
          currency="USD"
          locale="en-US"
        />
      );

      expect(screen.getByText(/vs. same time last month/)).toBeInTheDocument();
      expect(screen.getByText('This Month:')).toBeInTheDocument();
      expect(screen.getByText('$650.00')).toBeInTheDocument(); // 500 + 150
      expect(screen.getByText('Last Month:')).toBeInTheDocument();
      expect(screen.getByText('$1,900.00')).toBeInTheDocument(); // 400 + 300 + 1200
    });
  });

  describe('NeedsWantsSplit', () => {
    it('renders empty state when no expenses exist', () => {
      render(<NeedsWantsSplit transactions={[]} />);
      expect(screen.getByText('No expenses for Needs vs. Wants breakdown')).toBeInTheDocument();
    });

    it('correctly splits expenses into essentials and discretionary', () => {
      // Oct 2026 expenses: need (500) is Essential; food (150) is Discretionary
      render(
        <NeedsWantsSplit
          transactions={sampleTransactions.slice(0, 2)}
          currency="USD"
          locale="en-US"
        />
      );

      // Total = 650; Needs = 500 (77%), Wants = 150 (23%)
      expect(screen.getByText(/Needs \(77%\)/)).toBeInTheDocument();
      expect(screen.getByText(/Wants \(23%\)/)).toBeInTheDocument();
      expect(screen.getAllByText('$500.00').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('$150.00').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('AccountOutflowList', () => {
    it('renders empty state when no transactions exist', () => {
      render(<AccountOutflowList transactions={[]} />);
      expect(screen.getByText('No account outflow data')).toBeInTheDocument();
    });

    it('renders ranked accounts with outflow percentages', () => {
      render(
        <AccountOutflowList
          transactions={sampleTransactions}
          currency="USD"
          locale="en-US"
        />
      );

      // Accounts: Bank (1200), Card (900), UPI (300), Cash (150)
      expect(screen.getByText('Bank')).toBeInTheDocument();
      expect(screen.getByText('$1,200.00')).toBeInTheDocument();
      expect(screen.getByText('Card')).toBeInTheDocument();
      expect(screen.getByText('$900.00')).toBeInTheDocument();
      expect(screen.getByText('UPI')).toBeInTheDocument();
      expect(screen.getByText('Cash')).toBeInTheDocument();
    });
  });

  describe('DayOfWeekSpending', () => {
    it('renders empty state when no transactions exist', () => {
      render(<DayOfWeekSpending transactions={[]} />);
      expect(screen.getByText('No day-of-week spending data')).toBeInTheDocument();
    });

    it('computes weekday vs weekend metrics and displays columns', () => {
      render(
        <DayOfWeekSpending
          transactions={sampleTransactions}
          currency="USD"
          locale="en-US"
        />
      );

      expect(screen.getByText('Weekday Daily Avg')).toBeInTheDocument();
      expect(screen.getByText('Weekend Daily Avg')).toBeInTheDocument();
      expect(screen.getByText('Mon')).toBeInTheDocument();
      expect(screen.getByText('Fri')).toBeInTheDocument();
      expect(screen.getByText('Sun')).toBeInTheDocument();
    });
  });

  describe('CategoryMoMTrends', () => {
    it('renders empty state when transactions have no consecutive month data', () => {
      render(<CategoryMoMTrends transactions={[]} referenceDate={fixedRefDate} />);
      expect(screen.getByText('No Month-over-Month comparison data')).toBeInTheDocument();
    });

    it('identifies increases and decreases between consecutive months', () => {
      render(
        <CategoryMoMTrends
          transactions={sampleTransactions}
          referenceDate={fixedRefDate}
          currency="USD"
          locale="en-US"
        />
      );

      // need was 400 in Sep, 500 in Oct (+100, +25%)
      expect(screen.getByText('need')).toBeInTheDocument();
      expect(screen.getByText('+25%')).toBeInTheDocument();
      expect(screen.getByText('+$100.00')).toBeInTheDocument();

      // food was 0 in Sep, 150 in Oct (NEW)
      expect(screen.getByText('food')).toBeInTheDocument();
      expect(screen.getByText('NEW')).toBeInTheDocument();
    });
  });

  describe('SubcategoryBreakdown', () => {
    it('renders empty state when no transactions exist', () => {
      render(<SubcategoryBreakdown transactions={[]} />);
      expect(screen.getByText('No subcategory data available')).toBeInTheDocument();
    });

    it('renders subcategories and allows filtering by category pill', () => {
      render(
        <SubcategoryBreakdown
          transactions={sampleTransactions}
          currency="USD"
          locale="en-US"
        />
      );

      expect(screen.getByText('Groceries')).toBeInTheDocument();
      expect(screen.getByText('Apartment')).toBeInTheDocument();
      expect(screen.getByText('Coffee')).toBeInTheDocument();

      // Click 'need' category filter pill
      const needBtn = screen.getByRole('button', { name: /need/i });
      fireEvent.click(needBtn);

      expect(screen.getByText('Groceries')).toBeInTheDocument();
      expect(screen.queryByText('Apartment')).not.toBeInTheDocument();
      expect(screen.queryByText('Coffee')).not.toBeInTheDocument();
    });
  });
});
