import { ProductionPlan, ProductionSummary } from "../dto/production.dto";

const API_BASE_URL = 'http://localhost:5083/api';

/**
 * Maps numeric or string backend PlanStatus enum values into standard UI status strings.
 * PlanStatus enum: Draft=0, Active=1, Cutting=2, Stitching=3, NotStarted=4, Completed=5, OnHold=6, Blocked=7, Cancelled=8
 */
const mapStatus = (status: any): string => {
  if (status === 0 || status === "0" || status === "Draft") return "Draft";
  if (status === 1 || status === "1" || status === "Active") return "Active";
  if (status === 2 || status === "2" || status === "Cutting") return "In Progress";
  if (status === 3 || status === "3" || status === "Stitching") return "In Progress";
  if (status === 4 || status === "4" || status === "NotStarted" || status === "Not Started") return "Not Started";
  if (status === 5 || status === "5" || status === "Completed") return "Completed";
  if (status === 6 || status === "6" || status === "OnHold" || status === "On Hold") return "On Hold";
  if (status === 7 || status === "7" || status === "Blocked") return "Blocked";
  if (status === 8 || status === "8" || status === "Cancelled") return "Cancelled";
  return String(status || "Draft");
};

/**
 * Fetches all production plans from the backend API with optional search parameters.
 * @param params Search or filter query parameters
 * @returns Array of formatted ProductionPlan objects
 */
export async function fetchProductionPlans(params?: Record<string, string>): Promise<ProductionPlan[]> {
  try {
    const url = new URL(`${API_BASE_URL}/production-plans`);
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) {
          url.searchParams.append(key, params[key]);
        }
      });
    }
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch production plans");
    const data = await res.json();
    return data.map((p: any) => ({
      id: p.id,
      planNumber: p.planId || "N/A",
      title: p.planName || "Untitled",
      status: mapStatus(p.status),
      demandSource: p.demandType === "Customer Order" ? "Customer" : p.demandType === "Outlet Replenishment" ? "Outlet" : "In-House",
      totalQuantity: p.quantity || 0,
      priority: p.priority?.toString(),
      progress: p.progress || 0,
      blocked: p.blocked || false,
      startDate: p.plannedStartDate,
      endDate: p.plannedCompletionDate
    }));
  } catch (err) {
    console.error("fetchProductionPlans Error:", err);
    return [];
  }
}

/**
 * Computes high-level production summary counts across all plans.
 */
export async function fetchProductionSummary(): Promise<ProductionSummary> {
  const plans = await fetchProductionPlans();
  return {
    totalPlans: plans.length,
    draftPlans: plans.filter(p => p.status === "Draft").length,
    inProgressPlans: plans.filter(p => p.status === "In Progress").length,
    completedPlans: plans.filter(p => p.status === "Completed").length,
  };
}

/**
 * Submits a new production plan to the backend API.
 * @param plan Production plan payload
 */
export async function createProductionPlan(plan: any): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/production-plans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(plan),
  });
  if (!res.ok) throw new Error("Failed to create production plan");
  const text = await res.text();
  return text ? JSON.parse(text) : plan;
}

/**
 * Checks material availability against required quantities for products.
 */
export async function checkMaterials(products: { productId: string, quantity: number }[]): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/production-plans/check-materials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ products }),
  });
  if (!res.ok) throw new Error("Failed to check material availability");
  return res.json();
}
