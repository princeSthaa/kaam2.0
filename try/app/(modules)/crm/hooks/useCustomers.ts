"use client";
import { API_MAIN_URL } from "../api/constant";
import { useState, useEffect, useCallback } from "react";
const API_BASE_URL = `${API_MAIN_URL}/customer`;

export function useCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}`);
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();
      setCustomers(data || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load customers");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  return { customers, loading, error, refetch: loadCustomers };
}
