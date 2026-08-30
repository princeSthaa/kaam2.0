"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchOrders } from "../api/order.api";
import { Order } from "../dto/order.dto";

export function useOrders(customerId?: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOrders(customerId);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || "Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return { orders, setOrders, loading, error, refetch: loadOrders };
}
