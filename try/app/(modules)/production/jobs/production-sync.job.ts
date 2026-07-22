import { fetchProductionPlans } from "../api/production.api";

export async function syncProductionDraftsJob(): Promise<{ syncedCount: number }> {
  try {
    const draftsKey = "pending_production_plan";
    const stored = typeof window !== "undefined" ? localStorage.getItem(draftsKey) : null;
    if (!stored) return { syncedCount: 0 };

    const parsed = JSON.parse(stored);
    if (parsed && parsed.planNo) {
      // Background sync payload to server
      const res = await fetch("http://localhost:5083/api/production-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      if (res.ok) {
        localStorage.removeItem(draftsKey);
        return { syncedCount: 1 };
      }
    }
  } catch (err) {
    console.warn("Background draft sync pending:", err);
  }
  return { syncedCount: 0 };
}
