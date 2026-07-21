const API_BASE_URL = 'http://localhost:5083/api';

export type WarehouseKpi = {
  label: string;
  value: string;
  helper: string;
  icon: string;
  tone: string;
};

export type ShelfStatus = {
  code: string;
  tone: 'high' | 'full' | 'medium' | 'low';
};

export type StockItem = {
  sku: string;
  item: string;
  type: string;
  quantity: string;
  location: string;
  status: string;
};

export type VisualKpi = {
  label: string;
  value: string;
  hint: string;
  icon: string;
  tone: "blue" | "green" | "soft";
  progress?: number;
};

export type VisualRoom = {
  floor: string;
  name: string;
  utilization: number;
  shelves: string;
  tone: "blue" | "green" | "amber" | "purple";
  active?: boolean;
};

export type VisualShelf = {
  code: string;
  tone: "high" | "medium" | "low" | "full" | "empty";
  active?: boolean;
  item?: string;
  quantity?: string;
  capacity?: string;
  type?: string;
};

export type VisualLowStock = {
  location: string;
  item: string;
  type: string;
  quantity: string;
};

export async function fetchWarehouseKpis(): Promise<WarehouseKpi[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/warehouse/kpis`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch kpis");
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function fetchShelfPreview(): Promise<ShelfStatus[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/warehouse/shelves/preview`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch shelf preview");
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function fetchWarehouseStock(): Promise<StockItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/warehouse/stock`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch stock");
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function fetchWarehouseVisualData() {
  try {
    const res = await fetch(`${API_BASE_URL}/warehouse/visualization`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch visual data");
    return await res.json();
  } catch (err) {
    return {
      kpis: [] as VisualKpi[],
      rooms: [] as VisualRoom[],
      shelves: [] as VisualShelf[],
      locationRows: [] as VisualShelf[],
      lowStockItems: [] as VisualLowStock[]
    };
  }
}

