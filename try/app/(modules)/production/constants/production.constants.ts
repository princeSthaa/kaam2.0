export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

export const FABRIC_CATEGORIES = ["Cotton", "Pique", "Fleece", "Denim", "Polyester", "Linen"] as const;

export const WORK_CENTERS = [
  "QC Station 1",
  "Cutter Auto-B",
  "Line 4A",
  "Sewing Floor",
  "QC Table",
  "Packing Area",
  "Embroidery Unit",
] as const;

export const STAGE_STATUS_OPTIONS = [
  "Select Status",
  "Not Started",
  "Ready",
  "In Progress",
  "On Hold",
  "Completed",
  "Rejected",
] as const;

export const DEMAND_TYPE_OPTIONS = [
  "All Demand Types",
  "Customer Order",
  "Outlet Replenishment",
  "In-house Stock",
] as const;

export const PLAN_PRIORITIES = ["Normal", "Urgent", "Seasonal", "Low", "High"] as const;

export const STAGE_COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-pink-500",
  "bg-indigo-500",
] as const;

export const STAGE_LIGHT_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-orange-100 text-orange-700",
  "bg-teal-100 text-teal-700",
  "bg-pink-100 text-pink-700",
  "bg-indigo-100 text-indigo-700",
] as const;
