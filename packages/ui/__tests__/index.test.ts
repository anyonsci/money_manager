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
    expect(UIExports.TransactionCard).toBeDefined();
    expect(UIExports.TransactionList).toBeDefined();
    expect(UIExports.TransactionModal).toBeDefined();
    expect(UIExports.Pagination).toBeDefined();
    expect(UIExports.QuickEntryView).toBeDefined();
  });
});
