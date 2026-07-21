export type ProductionPlan = {
  id: string;
  planNumber: string;
  title: string;
  status: string;
  demandSource: "Customer" | "In-House" | "Outlet";
  totalQuantity: number;
  priority?: string;
  progress?: number;
  blocked?: boolean;
  startDate?: string;
  endDate?: string;
};

export type ProductionSummary = {
  totalPlans: number;
  draftPlans: number;
  inProgressPlans: number;
  completedPlans: number;
};

