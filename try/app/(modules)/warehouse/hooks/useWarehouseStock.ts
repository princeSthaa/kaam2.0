"use client";

import { useState, useEffect, useCallback } from "react";

export function useWarehouseStock() {
  const [stockList, setStockList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadStock = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:5083/api/material");
      if (!res.ok) throw new Error("Failed to fetch warehouse stock");
      const data = await res.json();
      setStockList(data || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load stock list");
      setStockList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStock();
  }, [loadStock]);

  return { stockList, loading, error, refetch: loadStock };
}
