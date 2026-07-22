export interface WarehouseDto {
  id: string;
  code?: string;
  name: string;
  location?: string;
  type?: string;
}

export interface WorkCenterDto {
  id: string;
  name: string;
  type: string;
  productionLine: string;
  status: "Available" | "Maintenance" | "Busy" | "Offline";
}
