import { test, expect } from '@playwright/test';

test.describe('AnalyticsSummary Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/analytics-summary');
    await page.waitForSelector('[data-testid="analytics-fixture-container"]');
  });

  test('renders positive balance summary correctly with visual snapshot', async ({ page }) => {
    const positiveSection = page.locator('[data-testid="analytics-positive"]');
    await expect(positiveSection).toBeVisible();

    // Verify text content
    await expect(positiveSection.getByText('Total Income')).toBeVisible();
    await expect(positiveSection.getByText('Total Expenses')).toBeVisible();
    await expect(positiveSection.getByText('Net Balance')).toBeVisible();

    // Verify formatted amounts
    await expect(positiveSection.getByText(/1,25,000/)).toBeVisible();
    await expect(positiveSection.getByText(/48,500/)).toBeVisible();
    await expect(positiveSection.getByText(/76,500/)).toBeVisible();

    // Visual golden screenshot
    await expect(positiveSection).toHaveScreenshot('analytics-summary-positive.png');
  });

  test('renders negative balance (deficit) summary correctly with visual snapshot', async ({ page }) => {
    const negativeSection = page.locator('[data-testid="analytics-negative"]');
    await expect(negativeSection).toBeVisible();

    // Verify formatted USD currency and negative balance
    await expect(negativeSection.getByText(/30,000/)).toBeVisible();
    await expect(negativeSection.getByText(/52,000/)).toBeVisible();
    await expect(negativeSection.getByText(/22,000/)).toBeVisible();

    // Visual golden screenshot
    await expect(negativeSection).toHaveScreenshot('analytics-summary-negative.png');
  });

  test('calculates totals dynamically from transaction array and excludes VOID transactions', async ({ page }) => {
    const calculatedSection = page.locator('[data-testid="analytics-calculated"]');
    await expect(calculatedSection).toBeVisible();

    // Income: 150000 | Expenses (excluding 50000 VOID): 35000 + 12000 = 47000 | Net: 103000
    await expect(calculatedSection.getByText(/1,50,000/)).toBeVisible();
    await expect(calculatedSection.getByText(/47,000/)).toBeVisible();
    await expect(calculatedSection.getByText(/1,03,000/)).toBeVisible();

    // Visual golden screenshot
    await expect(calculatedSection).toHaveScreenshot('analytics-summary-calculated.png');
  });
});
