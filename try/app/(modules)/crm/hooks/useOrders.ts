"use client";

import { useState, useEffect, useCallback } from "react";
import { API_MAIN_URL } from "../api/constant";
const API_BASE_URL = `${API_MAIN_URL}/customer`;

export function useOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}`);
      if (!res.ok) throw new Error("Failed to fetch orders");
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
