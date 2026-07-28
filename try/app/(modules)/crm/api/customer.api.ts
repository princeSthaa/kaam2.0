import { Customer } from "../dto/customer.dto";

const API_BASE_URL = 'http://localhost:5083/api';

export async function fetchCustomers(): Promise<Customer[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/customer`, { cache: 'no-store' });
    if (res.ok) {
      return await res.json();
    }
    const errorText = await res.text();
    console.warn("Failed to fetch customers from API:", res.status, errorText);
  } catch (err) {
    console.error("Error connecting to Customer API:", err);
  }
  return [];
}

export async function createCustomer(customer: Partial<Customer>): Promise<Customer> {
  const payload = {
    type: customer.type || "Retail",
    company: customer.company || "",
    panVat: customer.panVat || "",
    createdAt: customer.createdAt || new Date().toISOString(),
    updatedAt: customer.updatedAt || new Date().toISOString(),
    ...customer,
  };

  const res = await fetch(`${API_BASE_URL}/customer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("API Error creating customer:", res.status, errorText);
    throw new Error(`Failed to create customer: ${errorText}`);
  }
  return res.json();
}

export async function updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer> {
  const res = await fetch(`${API_BASE_URL}/customer/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customer),
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error("API Error updating customer:", res.status, errorText);
    throw new Error(`Failed to update customer: ${errorText}`);
  }
  return res.json();
}

export async function deleteCustomer(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/customer/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete customer');
}
