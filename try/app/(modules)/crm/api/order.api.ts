import { Order } from "../dto/order.dto";

const API_BASE_URL = 'http://localhost:5083/api';

export async function fetchOrders(): Promise<Order[]> {
  const res = await fetch(`${API_BASE_URL}/order`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch orders');
  const text = await res.text();
  return text ? JSON.parse(text) : (null as any);
}

export async function createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
  const res = await fetch(`${API_BASE_URL}/order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error("API Error Response:", errorText);
    throw new Error(`Failed to create order: ${res.status} - ${errorText}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : (null as any);
}

export async function updateOrder(id: string, order: Partial<Order>): Promise<Order> {
  const res = await fetch(`${API_BASE_URL}/order/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });
  if (!res.ok) throw new Error('Failed to update order');
  const text = await res.text();
  return text ? JSON.parse(text) : (null as any);
}

export async function deleteOrder(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/order/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete order');
}

