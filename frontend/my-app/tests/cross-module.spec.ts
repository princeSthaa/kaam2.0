import { test, expect } from '@playwright/test';

test.describe('Cross-Module Flow: CRM -> Production', () => {
  test('should create customer and order in CRM, then process in Production', async ({ page }) => {
    // 1. Create a Customer in CRM
    await page.goto('http://localhost:3000/CRM/Customer/CreateCustomer');
    await page.fill('input[name="name"]', 'Cross Module Customer');
    await page.fill('input[name="phone"]', '9800000002');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:3000/CRM/Index', { timeout: 10000 });

    // 2. Create Order in CRM
    await page.goto('http://localhost:3000/CRM/Order/CreateOrder');
    
    // Select the customer we just created (assuming it's an option)
    const customerSelect = page.locator('select[name="CustomerId"]');
    await customerSelect.selectOption({ label: 'Cross Module Customer (Retail)' });

    // Navigate Legacy Wizard Steps
    // Step 1 -> Step 2
    await page.locator('button:has-text("Next") >> visible=true').click();
    // Step 2 -> Step 3
    await page.locator('button:has-text("Next") >> visible=true').click();
    // Step 3 -> Step 4
    await page.locator('button:has-text("Next") >> visible=true').click();

    await page.fill('input[name="GlobalDeliveryDate"]', '2026-12-31', { force: true });
    await page.locator('form#createOrderFormReact').evaluate((form: HTMLFormElement) => form.requestSubmit());
    await expect(page).toHaveURL('http://localhost:3000/CRM/Index', { timeout: 10000 });

    // 3. Go to Production Planning Customer Catalog
    await page.goto('http://localhost:3000/Production/Customer'); // Assuming this route exists
    await page.waitForTimeout(2000);

    // Is the customer visible here?
    await expect(page.locator('text=Cross Module Customer').first()).toBeVisible({ timeout: 10000 });
  });
});
