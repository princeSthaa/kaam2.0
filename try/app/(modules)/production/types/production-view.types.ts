export interface ProductionFilterState {
  searchQuery: string;
  priorityFilter: string;
  demandFilter: string;
  statusFilter: string;
  sortBy: "date" | "priority" | "progress";
}

export interface GanttTaskItem {
  id: string;
  planNo: string;
  productName: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: string;
  priority: string;
}

export interface KanbanColumnConfig {
  id: string;
  title: string;
  statuses: string[];
  color: string;
}

export interface ProductionPaginationState {
  page: number;
  pageSize: number;
  totalRecords: number;
}
