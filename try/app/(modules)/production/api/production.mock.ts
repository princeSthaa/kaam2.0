import { ProductionPlan, ProductionSummary } from "../dto/production.dto";

// Mock data for production plans
export const mockProductionPlans: ProductionPlan[] = [
  {
    id: "mock-1",
    planNumber: "PLN-1001",
    title: "Summer Collection T-Shirts",
    status: "In Progress",
    demandSource: "Customer",
    totalQuantity: 500,
    priority: "High",
    progress: 45,
    blocked: false,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-2",
    planNumber: "PLN-1002",
    title: "Winter Jackets Batch A",
    status: "Draft",
    demandSource: "In-House",
    totalQuantity: 200,
    priority: "Medium",
    progress: 0,
    blocked: false,
    startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-3",
    planNumber: "PLN-1003",
    title: "Denim Jeans Restock",
    status: "Completed",
    demandSource: "Outlet",
    totalQuantity: 1000,
    priority: "Low",
    progress: 100,
    blocked: false,
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock data for production summary
export const mockProductionSummary: ProductionSummary = {
  totalPlans: 3,
  draftPlans: 1,
  inProgressPlans: 1,
  completedPlans: 1,
};

// Mock response for check materials
export const mockCheckMaterialsResponse = {
  status: "success",
  available: true,
  message: "All materials are available for the requested products.",
  details: [
    { material: "Cotton Fabric", required: 100, available: 500 },
    { material: "Buttons", required: 50, available: 200 }
  ]
};

// Mock function to simulate plan creation
export const mockCreateProductionPlan = (plan: any): any => {
  return {
    ...plan,
    id: `mock-${Date.now()}`,
    planId: `PLN-MOCK-${Math.floor(Math.random() * 1000)}`,
    status: "Draft",
  };
};
