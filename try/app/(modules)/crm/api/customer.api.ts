
import { API_MAIN_URL } from "./constant";
import { Customer } from "../dto/customer.dto";
// const API_BASE_URL = 'http://localhost:5083/api';  

const API_BASE_URL = `${API_MAIN_URL}/customer`;

async function parseErrorMessage(res: Response): Promise<string> {
  const errorText = await res.text();
  try {
    const json = JSON.parse(errorText);
    if (json.errors && typeof json.errors === "object") {
      const messages = Object.values(json.errors).flat();
      if (messages.length > 0) {
        return messages.join("\n");
      }
    }
    if (json.title) return json.title;
    if (json.message) return json.message;
  } catch {
    // Return raw text if not JSON
  }
  return errorText || `HTTP ${res.status} ${res.statusText}`;
}

export async function fetchCustomers(): Promise<Customer[]> {
  try {
    const res = await fetch(`${API_BASE_URL}`, { cache: 'no-store', credentials: 'include' });
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

  const res = await fetch(`${API_BASE_URL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorMsg = await parseErrorMessage(res);
    console.error("API Error creating customer:", res.status, errorMsg);
    throw new Error(errorMsg);
  }
  return res.json();
}

export async function updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer> {
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customer),
  });
  if (!res.ok) {
    const errorMsg = await parseErrorMessage(res);
    console.error("API Error updating customer:", res.status, errorMsg);
    throw new Error(errorMsg);
  }
  return res.json();
}

export async function deleteCustomer(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const errorMsg = await parseErrorMessage(res);
    throw new Error(errorMsg);
  }
}
