"use client";

import { useState, useEffect, useCallback } from "react";

export function useOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:5083/api/customer-orders");
      if (!res.ok) throw new Error("Failed to fetch customer orders");
      const data = await res.json();
      setOrders(data || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return { orders, loading, error, refetch: loadOrders };
}
