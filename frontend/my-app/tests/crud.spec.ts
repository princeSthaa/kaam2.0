import { test, expect } from '@playwright/test';

test.describe('CRUD Operations for Customers and Orders', () => {
  // Test Customer CRUD
  test('should create, view, update, and delete a customer via API', async ({ request }) => {
    // 1. Create a customer
    const newCustomer = {
      name: 'Playwright User',
      email: 'playwright@test.com',
      phone: '9800000000',
      address: 'Test Street, Kathmandu',
      company: 'Testing Corp',
    };

    const createRes = await request.post('http://localhost:5083/api/customers', {
      data: newCustomer,
    });
    expect(createRes.ok()).toBeTruthy();
    const createdCustomer = await createRes.json();
    expect(createdCustomer.name).toBe('Playwright User');
    expect(createdCustomer.id).toBeTruthy();

    const customerId = createdCustomer.id;

    // 2. Read the customer
    const getRes = await request.get(`http://localhost:5083/api/customers/${customerId}`);
    expect(getRes.ok()).toBeTruthy();
    const fetchedCustomer = await getRes.json();
    expect(fetchedCustomer.name).toBe('Playwright User');

    // 3. Update the customer
    const updateRes = await request.put(`http://localhost:5083/api/customers/${customerId}`, {
      data: { ...fetchedCustomer, company: 'Updated Testing Corp' },
    });
    expect(updateRes.ok()).toBeTruthy();
    const updatedCustomer = await updateRes.json();
    expect(updatedCustomer.company).toBe('Updated Testing Corp');

    // 4. Create an Order for this customer
    const newOrder = {
      customerId: customerId,
      orderNumber: `ORD-TEST-${Date.now()}`,
      status: 'Pending',
      totalAmount: 1500,
      dueDate: new Date().toISOString(),
      items: [],
    };

    const createOrderRes = await request.post('http://localhost:5083/api/orders', {
      data: newOrder,
    });
    expect(createOrderRes.ok()).toBeTruthy();
    const createdOrder = await createOrderRes.json();
    expect(createdOrder.customerId).toBe(customerId);
    expect(createdOrder.id).toBeTruthy();

    const orderId = createdOrder.id;

    // 5. Update the Order
    const updateOrderRes = await request.put(`http://localhost:5083/api/orders/${orderId}`, {
      data: { ...createdOrder, status: 'Completed' },
    });
    expect(updateOrderRes.ok()).toBeTruthy();
    const updatedOrder = await updateOrderRes.json();
    expect(updatedOrder.status).toBe('Completed');

    // 6. Delete the Order
    const deleteOrderRes = await request.delete(`http://localhost:5083/api/orders/${orderId}`);
    expect(deleteOrderRes.ok()).toBeTruthy();

    // Verify Order is deleted
    const getOrderRes = await request.get(`http://localhost:5083/api/orders/${orderId}`);
    expect(getOrderRes.status()).toBe(404);

    // 7. Delete the Customer
    const deleteCustomerRes = await request.delete(`http://localhost:5083/api/customers/${customerId}`);
    expect(deleteCustomerRes.ok()).toBeTruthy();

    // Verify Customer is deleted
    const getDeletedCustomerRes = await request.get(`http://localhost:5083/api/customers/${customerId}`);
    expect(getDeletedCustomerRes.status()).toBe(404);
  });
});
