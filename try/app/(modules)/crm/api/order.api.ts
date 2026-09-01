import { Order } from "../dto/order.dto";
import { API_MAIN_URL } from "@/app/(modules)/api/constant";
import { mockOrders } from "./crm.mock";

const dispatchMockFallback = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("MockDataFallback"));
  }
};

// const API_BASE_URL = '/api/bff';

const API_BASE_URL = `${API_MAIN_URL}/order`;

export async function fetchOrders(customerId?: string): Promise<Order[]> {
  try {
    const query = customerId ? `?customerId=${encodeURIComponent(customerId)}` : "";
    const res = await fetch(`${API_BASE_URL}${query}`, { cache: 'no-store', credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch orders');
    const text = await res.text();
    return text ? JSON.parse(text) : (null as any);
  } catch (err) {
    console.error("fetchOrders error:", err);
    dispatchMockFallback();
    if (customerId) {
      return mockOrders.filter(o => o.customerId === customerId);
    }
    return mockOrders;
  }
}

export async function createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
  const res = await fetch(`${API_BASE_URL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(order)
    // body: JSON.stringify(order),
    // body: JSON.stringify({ orderDto: order }),
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
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(order),
  });
  if (!res.ok) throw new Error('Failed to update order');
  const text = await res.text();
  return text ? JSON.parse(text) : (null as any);
}

export async function deleteOrder(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE', credentials: 'include' });
  if (!res.ok) throw new Error('Failed to delete order');
}

