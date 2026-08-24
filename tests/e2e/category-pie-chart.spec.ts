import { test, expect } from '@playwright/test';

test.describe('CategoryPieChart Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/category-pie-chart');
    await page.waitForSelector('[data-testid="piechart-fixture-container"]');
  });

  test('renders populated chart with category legends and total amount', async ({ page }) => {
    const chartSection = page.locator('[data-testid="piechart-populated"]');
    await expect(chartSection).toBeVisible();

    // Verify title and total calculation (28000 + 14500 + 6200 + 4500 + 3200 + 1800 = 58200)
    await expect(chartSection.getByText('Monthly Expense Breakdown')).toBeVisible();
    await expect(chartSection.getByText(/58,200/)).toBeVisible();

    // Verify category labels in legend
    await expect(chartSection.getByText('Housing & Rent')).toBeVisible();
    await expect(chartSection.getByText('Groceries')).toBeVisible();
    await expect(chartSection.getByText('Food & Dining')).toBeVisible();
    await expect(chartSection.getByText('Transportation')).toBeVisible();
    await expect(chartSection.getByText('Entertainment')).toBeVisible();
    await expect(chartSection.getByText('Utilities')).toBeVisible();

    // Ensure VOID and income categories are NOT in the pie chart
    await expect(chartSection.getByText('Salary')).not.toBeVisible();

    // Visual snapshot
    await expect(chartSection).toHaveScreenshot('category-piechart-populated.png');
  });

  test('renders empty state when no expenses are provided', async ({ page }) => {
    const emptySection = page.locator('[data-testid="piechart-empty"]');
    await expect(emptySection).toBeVisible();
    await expect(emptySection.getByText('No expense data available for the selected period')).toBeVisible();

    // Visual snapshot
    await expect(emptySection).toHaveScreenshot('category-piechart-empty.png');
  });
});
