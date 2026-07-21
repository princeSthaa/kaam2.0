import { Customer } from "../dto/customer.dto";

const API_BASE_URL = 'http://localhost:5083/api';

export async function fetchCustomers(): Promise<Customer[]> {
  const res = await fetch(`${API_BASE_URL}/customer`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch customers');
  return res.json();
}

export async function createCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
  const res = await fetch(`${API_BASE_URL}/customer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customer),
  });
  if (!res.ok) throw new Error('Failed to create customer');
  return res.json();
}

export async function updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer> {
  const res = await fetch(`${API_BASE_URL}/customer/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customer),
  });
  if (!res.ok) throw new Error('Failed to update customer');
  return res.json();
}

export async function deleteCustomer(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/customer/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete customer');
}

