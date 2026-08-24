import { test, expect } from '@playwright/test';

test.describe('TransactionModal Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/transaction-modal');
    await page.waitForSelector('[data-testid="modal-fixture-container"]');
  });

  test('opens create modal, fills form, and submits valid transaction', async ({ page }) => {
    // Click button to open Create modal
    await page.click('#btn-open-create');

    const modalTitle = page.getByRole('heading', { name: 'New Transaction' });
    await expect(modalTitle).toBeVisible();

    // Verify default state (Expense selected)
    const expenseToggle = page.getByRole('button', { name: 'Expense' });
    await expect(expenseToggle).toBeVisible();

    // Switch to Income
    const incomeToggle = page.getByRole('button', { name: 'Income' });
    await incomeToggle.click();

    // Fill form fields
    const amountInput = page.locator('input[placeholder="0.00"]');
    await amountInput.fill('45000');

    const subCategoryInput = page.locator('input[placeholder="e.g. Groceries, Fuel"]');
    await subCategoryInput.fill('Consulting');

    const noteInput = page.locator('input[placeholder="Short description..."]');
    await noteInput.fill('Q3 Architectural advisory retainer');

    // Visual snapshot of open create modal
    const modalContainer = page.locator('.relative.w-full.max-w-lg');
    await expect(modalContainer).toBeVisible();
    await expect(modalContainer).toHaveScreenshot('transaction-modal-create.png');

    // Submit form
    const submitBtn = page.getByRole('button', { name: 'Create Entry' });
    await submitBtn.click();

    // Modal should close
    await expect(modalTitle).not.toBeVisible();

    // Verify submitted payload
    const payloadText = await page.locator('[data-testid="submitted-payload"]').textContent();
    expect(payloadText).toContain('"amount":"45000"');
    expect(payloadText).toContain('"type":"income"');
    expect(payloadText).toContain('"subCategory":"Consulting"');
  });

  test('opens edit modal prepopulated with transaction values', async ({ page }) => {
    // Click button to open Edit modal
    await page.click('#btn-open-edit');

    const modalTitle = page.getByRole('heading', { name: 'Edit Transaction' });
    await expect(modalTitle).toBeVisible();

    // Verify prepopulated values
    const amountInput = page.locator('input[placeholder="0.00"]');
    await expect(amountInput).toHaveValue('3200');

    const noteInput = page.locator('input[placeholder="Short description..."]');
    await expect(noteInput).toHaveValue('Organic store vegetables & fruits');

    // Visual snapshot of open edit modal
    const modalContainer = page.locator('.relative.w-full.max-w-lg');
    await expect(modalContainer).toBeVisible();
    await expect(modalContainer).toHaveScreenshot('transaction-modal-edit.png');

    // Cancel edit
    const cancelBtn = page.getByRole('button', { name: 'Cancel' });
    await cancelBtn.click();
    await expect(modalTitle).not.toBeVisible();
  });
});
