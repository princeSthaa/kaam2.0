import { ProductionPlan, ProductionSummary } from "../dto/production.dto";

const API_BASE_URL = 'http://localhost:5083/api';

export async function fetchProductionPlans(): Promise<ProductionPlan[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/productionplan`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch plans");
    return await res.json();
  } catch (err) {
    // Backend not connected yet. Return empty array instead of mock data.
    return [];
  }
}

export async function fetchProductionSummary(): Promise<ProductionSummary> {
  const plans = await fetchProductionPlans();
  return {
    totalPlans: plans.length,
    draftPlans: plans.filter(p => p.status === "Draft").length,
    inProgressPlans: plans.filter(p => p.status === "In Progress").length,
    completedPlans: plans.filter(p => p.status === "Completed").length,
  };
}

