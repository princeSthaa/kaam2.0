import { API_MAIN_URL } from "@/app/(modules)/api/constant";

const WAREHOUSE_BASE_URL = `${API_MAIN_URL}/warehouse`;
const FLOOR_BASE_URL = `${API_MAIN_URL}/warehouse-floor`;
const ROOM_BASE_URL = `${API_MAIN_URL}/warehouse-room`;
const RACK_BASE_URL = `${API_MAIN_URL}/warehouse-rack`;
const SHELF_BASE_URL = `${API_MAIN_URL}/warehouse-shelf`;

// ======================== DTO Interfaces ========================

export interface WarehouseShelfDto {
  id: string;
  code?: string;
  name: string;
  capacity?: string;
  warehouseRackId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WarehouseRackDto {
  id: string;
  code?: string;
  name: string;
  warehouseRoomId: string;
  createdAt?: string;
  updatedAt?: string;
  warehouseShelves?: WarehouseShelfDto[];
}

export interface WarehouseRoomDto {
  id: string;
  code?: string;
  name: string;
  warehouseFloorId: string;
  createdAt?: string;
  updatedAt?: string;
  warehouseRacks?: WarehouseRackDto[];
}

export interface WarehouseFloorDto {
  id: string;
  code?: string;
  name: string;
  warehouseId: string;
  createdAt?: string;
  updatedAt?: string;
  warehouseRooms?: WarehouseRoomDto[];
}

export interface WarehouseDto {
  id: string;
  code?: string;
  name: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
  warehouseFloors?: WarehouseFloorDto[];
}

// Create Payload Types
export interface WarehouseCreateDto {
  name: string;
  location: string;
  code?: string;
}

export interface WarehouseFloorCreateDto {
  name: string;
  warehouseId: string;
  code?: string;
}

export interface WarehouseRoomCreateDto {
  name: string;
  warehouseFloorId: string;
  code?: string;
}

export interface WarehouseRackCreateDto {
  name: string;
  warehouseRoomId: string;
  code?: string;
}

export interface WarehouseShelfCreateDto {
  name: string;
  warehouseRackId: string;
  capacity: string;
  code?: string;
}

// ======================== API Service Functions ========================

// 1. WAREHOUSE (api/warehouse)
export async function fetchWarehouses(params?: {
  id?: string;
  code?: string;
  name?: string;
  location?: string;
}): Promise<WarehouseDto[]> {
  const query = new URLSearchParams();
  if (params?.id) query.append("id", params.id);
  if (params?.code) query.append("code", params.code);
  if (params?.name) query.append("name", params.name);
  if (params?.location) query.append("location", params.location);

  const url = `${WAREHOUSE_BASE_URL}${query.toString() ? `?${query.toString()}` : ""}`;
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to fetch warehouses: ${errText || response.statusText}`);
  }

  return await response.json();
}

export async function fetchWarehouseById(id: string): Promise<WarehouseDto> {
  const response = await fetch(`${WAREHOUSE_BASE_URL}/${id}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch warehouse ${id}: ${response.statusText}`);
  }
  return await response.json();
}

export async function createWarehouse(payload: WarehouseCreateDto): Promise<void> {
  const response = await fetch(WAREHOUSE_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: payload.name,
      location: payload.location,
      code: payload.code || "",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create warehouse: ${errorText || response.statusText}`);
  }
}

export async function updateWarehouse(id: string, payload: Partial<WarehouseCreateDto>): Promise<void> {
  const response = await fetch(`${WAREHOUSE_BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update warehouse ${id}: ${errorText || response.statusText}`);
  }
}

export async function deleteWarehouse(id: string): Promise<void> {
  const response = await fetch(`${WAREHOUSE_BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete warehouse ${id}: ${errorText || response.statusText}`);
  }
}

// 2. WAREHOUSE FLOOR (api/warehouse-floor)
export async function fetchWarehouseFloors(warehouseId?: string): Promise<WarehouseFloorDto[]> {
  const query = new URLSearchParams();
  if (warehouseId) query.append("warehouseId", warehouseId);

  const url = `${FLOOR_BASE_URL}${query.toString() ? `?${query.toString()}` : ""}`;
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to fetch warehouse floors: ${errText || response.statusText}`);
  }

  return await response.json();
}

export async function createWarehouseFloor(payload: WarehouseFloorCreateDto): Promise<WarehouseFloorDto> {
  const response = await fetch(FLOOR_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: payload.name,
      warehouseId: payload.warehouseId,
      code: payload.code || "",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create warehouse floor: ${errorText || response.statusText}`);
  }

  return await response.json();
}

export async function updateWarehouseFloor(id: string, payload: Partial<WarehouseFloorCreateDto>): Promise<void> {
  const response = await fetch(`${FLOOR_BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update warehouse floor ${id}: ${errorText || response.statusText}`);
  }
}

export async function deleteWarehouseFloor(id: string): Promise<void> {
  const response = await fetch(`${FLOOR_BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete warehouse floor ${id}: ${errorText || response.statusText}`);
  }
}

// 3. WAREHOUSE ROOM (api/warehouse-room)
export async function fetchWarehouseRooms(warehouseFloorId?: string): Promise<WarehouseRoomDto[]> {
  const query = new URLSearchParams();
  if (warehouseFloorId) query.append("warehouseFloorId", warehouseFloorId);

  const url = `${ROOM_BASE_URL}${query.toString() ? `?${query.toString()}` : ""}`;
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to fetch warehouse rooms: ${errText || response.statusText}`);
  }

  return await response.json();
}

export async function createWarehouseRoom(payload: WarehouseRoomCreateDto): Promise<WarehouseRoomDto> {
  const response = await fetch(ROOM_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: payload.name,
      warehouseFloorId: payload.warehouseFloorId,
      code: payload.code || "",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create warehouse room: ${errorText || response.statusText}`);
  }

  return await response.json();
}

export async function updateWarehouseRoom(id: string, payload: Partial<WarehouseRoomCreateDto>): Promise<void> {
  const response = await fetch(`${ROOM_BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update warehouse room ${id}: ${errorText || response.statusText}`);
  }
}

export async function deleteWarehouseRoom(id: string): Promise<void> {
  const response = await fetch(`${ROOM_BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete warehouse room ${id}: ${errorText || response.statusText}`);
  }
}

// 4. WAREHOUSE RACK (api/warehouse-rack)
export async function fetchWarehouseRacks(warehouseRoomId?: string): Promise<WarehouseRackDto[]> {
  const query = new URLSearchParams();
  if (warehouseRoomId) query.append("warehouseRoomId", warehouseRoomId);

  const url = `${RACK_BASE_URL}${query.toString() ? `?${query.toString()}` : ""}`;
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to fetch warehouse racks: ${errText || response.statusText}`);
  }

  return await response.json();
}

export async function createWarehouseRack(payload: WarehouseRackCreateDto): Promise<WarehouseRackDto> {
  const response = await fetch(RACK_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: payload.name,
      warehouseRoomId: payload.warehouseRoomId,
      code: payload.code || "",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create warehouse rack: ${errorText || response.statusText}`);
  }

  return await response.json();
}

export async function updateWarehouseRack(id: string, payload: Partial<WarehouseRackCreateDto>): Promise<void> {
  const response = await fetch(`${RACK_BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update warehouse rack ${id}: ${errorText || response.statusText}`);
  }
}

export async function deleteWarehouseRack(id: string): Promise<void> {
  const response = await fetch(`${RACK_BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete warehouse rack ${id}: ${errorText || response.statusText}`);
  }
}

// 5. WAREHOUSE SHELF (api/warehouse-shelf)
export async function fetchWarehouseShelves(warehouseRackId?: string): Promise<WarehouseShelfDto[]> {
  const query = new URLSearchParams();
  if (warehouseRackId) query.append("warehouseRackId", warehouseRackId);

  const url = `${SHELF_BASE_URL}${query.toString() ? `?${query.toString()}` : ""}`;
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to fetch warehouse shelves: ${errText || response.statusText}`);
  }

  return await response.json();
}

export async function createWarehouseShelf(payload: WarehouseShelfCreateDto): Promise<WarehouseShelfDto> {
  const response = await fetch(SHELF_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: payload.name,
      warehouseRackId: payload.warehouseRackId,
      capacity: payload.capacity,
      code: payload.code || "",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create warehouse shelf: ${errorText || response.statusText}`);
  }

  return await response.json();
}

export async function updateWarehouseShelf(id: string, payload: Partial<WarehouseShelfCreateDto>): Promise<void> {
  const response = await fetch(`${SHELF_BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update warehouse shelf ${id}: ${errorText || response.statusText}`);
  }
}

export async function deleteWarehouseShelf(id: string): Promise<void> {
  const response = await fetch(`${SHELF_BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete warehouse shelf ${id}: ${errorText || response.statusText}`);
  }
}
