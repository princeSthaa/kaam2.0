import { test, expect } from '@playwright/test';

test.describe('CRUD Operations via Frontend UI', () => {
  test('should create a customer and an order using the frontend forms', async ({ page, request }) => {
    page.on('dialog', async (dialog) => {
      console.log('Dialog:', dialog.message());
      await dialog.accept();
    });

    // Navigate to Create Customer page
    await page.goto('http://localhost:3000/CRM/Customer/CreateCustomer');
    
    // Wait for form to load
    await expect(page.locator('text=Add New Customer')).toBeVisible();

    // Fill the Customer form
    await page.fill('input[name="name"]', 'UI E2E Customer');
    await page.fill('input[name="company"]', 'UI Testing Inc.');
    await page.fill('input[name="email"]', 'ui@test.com');
    await page.fill('input[name="phone"]', '9800000001');
    await page.fill('input[name="panvat"]', '123456789');
    await page.fill('textarea[name="address"]', 'Kathmandu UI Test');
    
    // Submit
    await page.click('button[type="submit"]');

    // Should redirect to CRM Index Page
    await expect(page).toHaveURL('http://localhost:3000/CRM/Index', { timeout: 10000 });
    
    // Give it a short pause to ensure backend file I/O has flushed completely
    await page.waitForTimeout(1000);

    // Check the API directly
    const res = await request.get('http://localhost:5083/api/customers');
    const customers = await res.json();
    console.log("Customers in API:", customers);
    const uiCustomer = customers.find((c: any) => c.name === 'UI E2E Customer');
    expect(uiCustomer).toBeDefined();

    // Cleanup: Delete the customer via API
    if (uiCustomer) {
      await request.delete(`http://localhost:5083/api/customers/${uiCustomer.id}`);
    }
  });
});
