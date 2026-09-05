import * as CoreExports from '../src/index';

describe('Core Index Exports', () => {
  it('exports all domain constants, formatters, domain logic, and auth utilities', () => {
    expect(CoreExports.ALLOWED_CATEGORIES).toBeDefined();
    expect(CoreExports.CATEGORY_COLORS).toBeDefined();
    expect(CoreExports.isAllowedCategory).toBeDefined();
    expect(CoreExports.getCanonicalCategory).toBeDefined();
    expect(CoreExports.formatCurrency).toBeDefined();
    expect(CoreExports.formatSignedCurrency).toBeDefined();
    expect(CoreExports.formatDate).toBeDefined();
    expect(CoreExports.formatInputDate).toBeDefined();
    expect(CoreExports.getTransactionTypeLabel).toBeDefined();
    expect(CoreExports.getCategoryIcon).toBeDefined();
    expect(CoreExports.parseCsvTransaction).toBeDefined();
    expect(CoreExports.parseQuickEntry).toBeDefined();
    expect(CoreExports.CommaQuickEntryParser).toBeDefined();
    expect(CoreExports.DoubleSpaceQuickEntryParser).toBeDefined();
    expect(CoreExports.SingleSpaceQuickEntryParser).toBeDefined();
    expect(CoreExports.createAuthStorage).toBeDefined();
    expect(CoreExports.parseJwt).toBeDefined();
    expect(CoreExports.isTokenExpired).toBeDefined();
  });
});
