export type PlanPriority = "Normal" | "Urgent" | "Seasonal" | "Low" | "High";
export type PlanStatus = "Draft" | "Material Check" | "Scheduled" | "In Progress" | "Completed" | "On Hold" | "Active" | "Rejected";
export type DemandType = "Customer Order" | "Outlet Replenishment" | "In-house Stock";

export interface ProductionPlanProductDto {
  id?: string;
  lineId: string;
  productId: string;
  productCode: string;
  productName: string;
  category?: string;
  variant?: string;
  quantity: number;
  requiredDate?: string;
  status: string;
  productionNotes?: string;
  sizes?: Array<{ size: string; quantity: number }>;
}

export interface ProductionPlanStageDto {
  id?: string;
  stageId: string;
  stageName: string;
  workCenter: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
  status: string;
  completedQty?: number;
  rejectedQty?: number;
  leadHours?: string;
}

export interface ProductionPlanDto {
  id: string;
  planId: string;
  planNumber?: string;
  title?: string;
  batchId?: string;
  planName: string;
  demandType: DemandType;
  demandSource?: string;
  sourceId?: string;
  sourceName?: string;
  priority: PlanPriority;
  status: PlanStatus;
  plannedStartDate: string;
  plannedCompletionDate: string;
  quantity: number;
  totalQuantity?: number;
  estimatedCost?: number;
  supervisor?: string;
  productionLine?: string;
  materialWarehouse?: string;
  productionNotes?: string;
  planDate: string;
  outputDestination?: string;
  requiredDate?: string;
  startDate?: string;
  endDate?: string;
  progress?: number;
  blocked?: boolean;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  productionPlanProducts?: ProductionPlanProductDto[];
  productionPlanStages?: ProductionPlanStageDto[];
}

export interface ProductionSummaryDto {
  totalPlans: number;
  draftPlans: number;
  inProgressPlans: number;
  completedPlans: number;
  onHoldPlans?: number;
}
