import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  MonthlyExpenseChart,
  parseYearMonth,
  getPastMonthsBuckets,
} from '../src/components/analytics/MonthlyExpenseChart';
import { UnifiedTransaction } from '@money-manager/core';

describe('UI Component - MonthlyExpenseChart', () => {
  describe('Helper functions', () => {
    it('parseYearMonth parses YYYY-MM-DD strings accurately without timezone shift', () => {
      const res = parseYearMonth('2026-08-15');
      expect(res).toEqual({ year: 2026, month: 7 }); // August is index 7
    });

    it('parseYearMonth parses ISO strings accurately', () => {
      const res = parseYearMonth('2026-10-02T12:00:00.000Z');
      expect(res).toEqual({ year: 2026, month: 9 }); // October is index 9
    });

    it('parseYearMonth returns null for invalid inputs', () => {
      expect(parseYearMonth('')).toBeNull();
      expect(parseYearMonth(undefined)).toBeNull();
      expect(parseYearMonth('invalid-date')).toBeNull();
    });

    it('getPastMonthsBuckets returns past 6 months in chronological order', () => {
      const refDate = new Date(2026, 9, 2); // Oct 2, 2026
      const buckets = getPastMonthsBuckets(6, refDate);
      expect(buckets).toHaveLength(6);
      expect(buckets[0].key).toBe('2026-05'); // May
      expect(buckets[1].key).toBe('2026-06'); // Jun
      expect(buckets[2].key).toBe('2026-07'); // Jul
      expect(buckets[3].key).toBe('2026-08'); // Aug
      expect(buckets[4].key).toBe('2026-09'); // Sep
      expect(buckets[5].key).toBe('2026-10'); // Oct
    });

    it('getPastMonthsBuckets handles cross-year boundaries correctly', () => {
      const refDate = new Date(2026, 1, 15); // Feb 15, 2026
      const buckets = getPastMonthsBuckets(6, refDate);
      expect(buckets).toHaveLength(6);
      expect(buckets[0].key).toBe('2025-09'); // Sep 2025
      expect(buckets[1].key).toBe('2025-10'); // Oct 2025
      expect(buckets[2].key).toBe('2025-11'); // Nov 2025
      expect(buckets[3].key).toBe('2025-12'); // Dec 2025
      expect(buckets[4].key).toBe('2026-01'); // Jan 2026
      expect(buckets[5].key).toBe('2026-02'); // Feb 2026
    });
  });

  describe('Rendering', () => {
    const fixedRefDate = new Date(2026, 9, 2); // Oct 2, 2026

    it('renders empty state when transactions array is empty', () => {
      render(
        <MonthlyExpenseChart
          transactions={[]}
          referenceDate={fixedRefDate}
        />
      );

      expect(
        screen.getByText('No expense data available for the past 6 months')
      ).toBeInTheDocument();
    });

    it('renders empty state when all transactions are income or void', () => {
      const transactions: UnifiedTransaction[] = [
        {
          id: '1',
          transactionDate: '2026-09-10',
          amount: 5000,
          type: 'income',
          category: 'salary',
          account: 'Bank',
        },
        {
          id: '2',
          transactionDate: '2026-09-12',
          amount: 250,
          type: 'expense',
          category: 'food',
          account: 'Cash',
          status: 'VOID', // Voided!
        },
      ];

      render(
        <MonthlyExpenseChart
          transactions={transactions}
          referenceDate={fixedRefDate}
        />
      );

      expect(
        screen.getByText('No expense data available for the past 6 months')
      ).toBeInTheDocument();
    });

    it('renders 6-month stacked expense chart, metrics, and category legend correctly', () => {
      const transactions: UnifiedTransaction[] = [
        // August 2026: 400 food + 200 travel = 600
        {
          id: '1',
          transactionDate: '2026-08-10',
          amount: 400,
          type: 'expense',
          category: 'food',
          account: 'Card',
        },
        {
          id: '2',
          transactionDate: '2026-08-15',
          amount: 200,
          type: 'expense',
          category: 'travel',
          account: 'Card',
        },
        // September 2026: 600 food = 600
        {
          id: '3',
          transactionDate: '2026-09-01',
          amount: 600,
          type: 'expense',
          category: 'food',
          account: 'Card',
        },
        // October 2026: 300 need = 300
        {
          id: '4',
          transactionDate: '2026-10-01',
          amount: 300,
          type: 'expense',
          category: 'need',
          account: 'Bank',
        },
        // Outside 6-month window (April 2026): should be ignored
        {
          id: '5',
          transactionDate: '2026-04-20',
          amount: 999,
          type: 'expense',
          category: 'rent',
          account: 'Bank',
        },
      ];

      // Total 6-month expense = 400 + 200 + 600 + 300 = 1500
      // Monthly average = 1500 / 6 = 250

      render(
        <MonthlyExpenseChart
          transactions={transactions}
          referenceDate={fixedRefDate}
          currency="USD"
          locale="en-US"
          title="Past 6 Months Spending"
        />
      );

      // Verify Title & Subtitle
      expect(screen.getByText('Past 6 Months Spending')).toBeInTheDocument();
      expect(screen.getByText('Category-stacked expense trends over time')).toBeInTheDocument();

      // Verify Header Metrics
      expect(screen.getByText('$1,500.00')).toBeInTheDocument();
      expect(screen.getByText('$250.00')).toBeInTheDocument();

      // Verify 6-Month Category Breakdown Legend
      expect(screen.getByText('6-Month Category Breakdown')).toBeInTheDocument();
      expect(screen.getByText('food')).toBeInTheDocument();
      expect(screen.getByText('$1,000.00')).toBeInTheDocument(); // 400 + 600
      expect(screen.getByText('(67%)')).toBeInTheDocument();

      expect(screen.getByText('need')).toBeInTheDocument();
      expect(screen.getByText('$300.00')).toBeInTheDocument();
      expect(screen.getByText('(20%)')).toBeInTheDocument();

      expect(screen.getByText('travel')).toBeInTheDocument();
      expect(screen.getByText('$200.00')).toBeInTheDocument();
      expect(screen.getByText('(13%)')).toBeInTheDocument();

      // Ensure excluded category (rent from April) is NOT shown
      expect(screen.queryByText('rent')).not.toBeInTheDocument();
    });

    it('displays filtered month pill and clears filter on button click', () => {
      const onSelectMonth = jest.fn();
      const transactions: UnifiedTransaction[] = [
        {
          id: '1',
          transactionDate: '2026-08-10',
          amount: 400,
          type: 'expense',
          category: 'food',
          account: 'Card',
        },
      ];

      const { rerender } = render(
        <MonthlyExpenseChart
          transactions={transactions}
          referenceDate={fixedRefDate}
          currency="USD"
          locale="en-US"
          selectedMonth="2026-08"
          onSelectMonth={onSelectMonth}
        />
      );

      // Verify filter pill is shown
      expect(screen.getByText(/Filtered: Aug '26/)).toBeInTheDocument();

      // Click clear filter
      const clearBtn = screen.getByTitle('Clear month filter');
      fireEvent.click(clearBtn);

      expect(onSelectMonth).toHaveBeenCalledWith(null);

      // Re-render without selected month
      rerender(
        <MonthlyExpenseChart
          transactions={transactions}
          referenceDate={fixedRefDate}
          currency="USD"
          locale="en-US"
          selectedMonth={null}
          onSelectMonth={onSelectMonth}
        />
      );

      expect(screen.queryByText(/Filtered:/)).not.toBeInTheDocument();
    });
  });
});
