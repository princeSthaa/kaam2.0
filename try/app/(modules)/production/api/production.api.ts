import { ProductionPlan, ProductionSummary } from "../dto/production.dto";

const API_BASE_URL = 'http://localhost:5083/api';

const statusMap: Record<number, string> = {
  0: "Draft",
  1: "Pending",
  2: "In Progress",
  3: "OnHold",
  4: "Completed", // wait, backend is 4 = NotStarted? Let's just use string "NotStarted" or mapping.
  5: "Cancelled"
};
// Actually, in backend PlanStatus: Draft=0, Pending=1, InProgress=2, OnHold=3, NotStarted=4, Completed=5, Cancelled=6
// Let's map it safely.
const mapStatus = (status: any) => {
  if (status === 0 || status === "0" || status === "Draft") return "Draft";
  if (status === 1 || status === "1" || status === "Pending") return "Pending";
  if (status === 2 || status === "2" || status === "InProgress" || status === "In Progress") return "In Progress";
  if (status === 3 || status === "3" || status === "OnHold") return "OnHold";
  if (status === 4 || status === "4" || status === "NotStarted" || status === "Not Started") return "Not Started";
  if (status === 5 || status === "5" || status === "Completed") return "Completed";
  if (status === 6 || status === "6" || status === "Cancelled") return "Cancelled";
  return String(status || "Draft");
};

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
    if (!res.ok) throw new Error("Failed to fetch plans");
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

export async function checkMaterials(products: { productId: string, quantity: number }[]): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/production-plans/check-materials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ products }),
  });
  if (!res.ok) throw new Error("Failed to check materials");
  return res.json();
}
