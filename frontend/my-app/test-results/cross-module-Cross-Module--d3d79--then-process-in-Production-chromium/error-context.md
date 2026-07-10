# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cross-module.spec.ts >> Cross-Module Flow: CRM -> Production >> should create customer and order in CRM, then process in Production
- Location: tests\cross-module.spec.ts:4:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected: "http://localhost:3000/CRM/Index"
Received: "http://localhost:3000/CRM/Order/CreateOrder"
Timeout:  10000ms

Call log:
  - Expect "toHaveURL" with timeout 10000ms
    23 × unexpected value "http://localhost:3000/CRM/Order/CreateOrder"

```

```yaml
- banner:
  - link "kaam":
    - /url: /
  - navigation:
    - link "Dashboard":
      - /url: /
    - link "CRM":
      - /url: /CRM/Index
    - link "Production":
      - /url: /Production/Index
    - link "Warehouse":
      - /url: /Warehouse/Index
    - link "Analytics":
      - /url: /Analytics/Index
    - link "Privacy":
      - /url: /Privacy
  - button "Notifications": notifications
  - link "Profile":
    - /url: /Account/Profile
    - text: account_circle
- main:
  - complementary:
    - text: Customer Management
    - navigation:
      - link "dashboard Overview":
        - /url: /CRM/Index
      - link "filter_list Filter Customers":
        - /url: /CRM/CustomerFilter/Index
      - link "add_circle Create Customer":
        - /url: /CRM/Customer/CreateCustomer
      - link "add_circle Create Order":
        - /url: /CRM/Order/CreateOrder
      - link "history Audit Log":
        - /url: /CRM/Audit
  - heading "Create New Order" [level=1]
  - paragraph: Draft a new customer order via the setup wizard.
  - link "← Back to Orders":
    - /url: /CRM/Index
  - text: 1. Customer 2. Products 3. Materials & Sizes 4. Delivery
  - heading "Product Selection" [level=3]
  - img
  - button "-- Select a Product --"
  - button "X"
  - button "+ Add Product"
  - button "← Back"
  - button "Next →"
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Cross-Module Flow: CRM -> Production', () => {
  4  |   test('should create customer and order in CRM, then process in Production', async ({ page }) => {
  5  |     // 1. Create a Customer in CRM
  6  |     await page.goto('http://localhost:3000/CRM/Customer/CreateCustomer');
  7  |     await page.fill('input[name="name"]', 'Cross Module Customer');
  8  |     await page.fill('input[name="phone"]', '9800000002');
  9  |     await page.click('button[type="submit"]');
  10 |     await expect(page).toHaveURL('http://localhost:3000/CRM/Index', { timeout: 10000 });
  11 | 
  12 |     // 2. Create Order in CRM
  13 |     await page.goto('http://localhost:3000/CRM/Order/CreateOrder');
  14 |     
  15 |     // Select the customer we just created (assuming it's an option)
  16 |     const customerSelect = page.locator('select[name="CustomerId"]');
  17 |     await customerSelect.selectOption({ label: 'Cross Module Customer (Retail)' });
  18 | 
  19 |     // Navigate Legacy Wizard Steps
  20 |     // Step 1 -> Step 2
  21 |     await page.locator('button:has-text("Next") >> visible=true').click();
  22 |     // Step 2 -> Step 3
  23 |     await page.locator('button:has-text("Next") >> visible=true').click();
  24 |     // Step 3 -> Step 4
  25 |     await page.locator('button:has-text("Next") >> visible=true').click();
  26 | 
  27 |     await page.fill('input[name="GlobalDeliveryDate"]', '2026-12-31', { force: true });
  28 |     await page.locator('form#createOrderFormReact').evaluate((form: HTMLFormElement) => form.requestSubmit());
> 29 |     await expect(page).toHaveURL('http://localhost:3000/CRM/Index', { timeout: 10000 });
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  30 | 
  31 |     // 3. Go to Production Planning Customer Catalog
  32 |     await page.goto('http://localhost:3000/Production/Customer'); // Assuming this route exists
  33 |     await page.waitForTimeout(2000);
  34 | 
  35 |     // Is the customer visible here?
  36 |     await expect(page.locator('text=Cross Module Customer').first()).toBeVisible({ timeout: 10000 });
  37 |   });
  38 | });
  39 | 
```