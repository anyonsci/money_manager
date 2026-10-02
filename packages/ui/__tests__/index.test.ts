import * as UIExports from '../src/index';

describe('UI Index Exports', () => {
  it('exports all layout, common, analytics, and transaction components', () => {
    expect(UIExports.ResponsiveLayout).toBeDefined();
    expect(UIExports.Navigation).toBeDefined();
    expect(UIExports.Modal).toBeDefined();
    expect(UIExports.PageLoader).toBeDefined();
    expect(UIExports.PwaInstallPrompt).toBeDefined();
    expect(UIExports.AnalyticsSummary).toBeDefined();
    expect(UIExports.CategoryPieChart).toBeDefined();
    expect(UIExports.MonthlyExpenseChart).toBeDefined();
    expect(UIExports.SpendingPaceChart).toBeDefined();
    expect(UIExports.NeedsWantsSplit).toBeDefined();
    expect(UIExports.AccountOutflowList).toBeDefined();
    expect(UIExports.DayOfWeekSpending).toBeDefined();
    expect(UIExports.CategoryMoMTrends).toBeDefined();
    expect(UIExports.SubcategoryBreakdown).toBeDefined();
    expect(UIExports.TransactionCard).toBeDefined();
    expect(UIExports.TransactionList).toBeDefined();
    expect(UIExports.TransactionModal).toBeDefined();
    expect(UIExports.Pagination).toBeDefined();
    expect(UIExports.QuickEntryView).toBeDefined();
  });
});
