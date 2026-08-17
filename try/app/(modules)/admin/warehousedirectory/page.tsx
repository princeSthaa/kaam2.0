"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  fetchWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  createWarehouseFloor,
  updateWarehouseFloor,
  deleteWarehouseFloor,
  createWarehouseRoom,
  updateWarehouseRoom,
  deleteWarehouseRoom,
  createWarehouseRack,
  updateWarehouseRack,
  deleteWarehouseRack,
  createWarehouseShelf,
  updateWarehouseShelf,
  deleteWarehouseShelf,
  WarehouseDto,
  WarehouseFloorDto,
  WarehouseRoomDto,
  WarehouseRackDto,
  WarehouseShelfDto,
} from "../api/constant";

type StructureType = "warehouse" | "floor" | "room" | "rack" | "shelf";

interface ModalState {
  isOpen: boolean;
  mode: "add" | "edit";
  type: StructureType;
  // Warehouse fields
  warehouseId?: string;
  name: string;
  location: string;
  // Floor fields
  floorId?: string;
  // Room fields
  roomId?: string;
  floorParentId?: string;
  // Rack fields
  rackId?: string;
  roomParentId?: string;
  // Shelf fields
  shelfId?: string;
  rackParentId?: string;
  capacity: string;
  code?: string;
}

const initialModalState: ModalState = {
  isOpen: false,
  mode: "add",
  type: "warehouse",
  name: "",
  location: "",
  warehouseId: "",
  floorId: "",
  floorParentId: "",
  roomId: "",
  roomParentId: "",
  rackId: "",
  rackParentId: "",
  shelfId: "",
  capacity: "",
  code: "",
};

export default function AdminWarehouseDirectoryPage() {
  const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState("ALL");
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Dropdown menu state
  const [isWarehouseMenuOpen, setIsWarehouseMenuOpen] = useState(false);
  const warehouseMenuRef = useRef<HTMLDivElement>(null);

  // Modal State
  const [modalState, setModalState] = useState<ModalState>(initialModalState);

  // Delete Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: StructureType;
    id: string;
    name: string;
    parentName?: string;
  } | null>(null);

  // Show Toast helper
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (warehouseMenuRef.current && !warehouseMenuRef.current.contains(e.target as Node)) {
        setIsWarehouseMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch all warehouse directory data
  const loadWarehouseData = async (expandAllOnFirstLoad = false) => {
    setLoading(true);
    try {
      const data = await fetchWarehouses();
      const warehouseList = Array.isArray(data) ? data : [];
      setWarehouses(warehouseList);

      // Auto expand root warehouses
      if (expandAllOnFirstLoad || Object.keys(expandedNodes).length === 0) {
        const initialExpanded: Record<string, boolean> = {};
        warehouseList.forEach((w) => {
          initialExpanded[`wh-${w.id}`] = true;
          (w.warehouseFloors || []).forEach((f) => {
            initialExpanded[`flr-${f.id}`] = true;
          });
        });
        setExpandedNodes((prev) => ({ ...initialExpanded, ...prev }));
      }
    } catch (err: any) {
      console.error("Failed to load warehouse data:", err);
      showToast(err.message || "Failed to load warehouse data from server.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouseData(true);
  }, []);

  // Helper flattened lists for parent selectors
  const allFloorsWithContext = useMemo(() => {
    const list: { id: string; name: string; code?: string; warehouseName: string; warehouseId: string }[] = [];
    warehouses.forEach((w) => {
      (w.warehouseFloors || []).forEach((f) => {
        list.push({
          id: f.id,
          name: f.name,
          code: f.code,
          warehouseName: w.name,
          warehouseId: w.id,
        });
      });
    });
    return list;
  }, [warehouses]);

  const allRoomsWithContext = useMemo(() => {
    const list: {
      id: string;
      name: string;
      code?: string;
      floorName: string;
      warehouseName: string;
      floorId: string;
    }[] = [];
    warehouses.forEach((w) => {
      (w.warehouseFloors || []).forEach((f) => {
        (f.warehouseRooms || []).forEach((r) => {
          list.push({
            id: r.id,
            name: r.name,
            code: r.code,
            floorName: f.name,
            warehouseName: w.name,
            floorId: f.id,
          });
        });
      });
    });
    return list;
  }, [warehouses]);

  const allRacksWithContext = useMemo(() => {
    const list: {
      id: string;
      name: string;
      code?: string;
      roomName: string;
      floorName: string;
      warehouseName: string;
      roomId: string;
    }[] = [];
    warehouses.forEach((w) => {
      (w.warehouseFloors || []).forEach((f) => {
        (f.warehouseRooms || []).forEach((r) => {
          (r.warehouseRacks || []).forEach((rk) => {
            list.push({
              id: rk.id,
              name: rk.name,
              code: rk.code,
              roomName: r.name,
              floorName: f.name,
              warehouseName: w.name,
              roomId: r.id,
            });
          });
        });
      });
    });
    return list;
  }, [warehouses]);

  // Overall counts for KPI Cards
  const stats = useMemo(() => {
    let totalFloors = 0;
    let totalRooms = 0;
    let totalRacks = 0;
    let totalShelves = 0;
    let totalCapacityNum = 0;

    warehouses.forEach((w) => {
      const floors = w.warehouseFloors || [];
      totalFloors += floors.length;
      floors.forEach((f) => {
        const rooms = f.warehouseRooms || [];
        totalRooms += rooms.length;
        rooms.forEach((r) => {
          const racks = r.warehouseRacks || [];
          totalRacks += racks.length;
          racks.forEach((rk) => {
            const shelves = rk.warehouseShelves || [];
            totalShelves += shelves.length;
            shelves.forEach((s) => {
              const cap = parseFloat(s.capacity || "0");
              if (!isNaN(cap)) totalCapacityNum += cap;
            });
          });
        });
      });
    });

    return {
      totalWarehouses: warehouses.length,
      totalFloors,
      totalRooms,
      totalRacks,
      totalShelves,
      totalCapacity: totalCapacityNum.toLocaleString(),
    };
  }, [warehouses]);

  // Toggle node expand/collapse
  const toggleExpand = (nodeKey: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeKey]: !prev[nodeKey],
    }));
  };

  const handleExpandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    warehouses.forEach((w) => {
      allExpanded[`wh-${w.id}`] = true;
      (w.warehouseFloors || []).forEach((f) => {
        allExpanded[`flr-${f.id}`] = true;
        (f.warehouseRooms || []).forEach((r) => {
          allExpanded[`rm-${r.id}`] = true;
          (r.warehouseRacks || []).forEach((rk) => {
            allExpanded[`rck-${rk.id}`] = true;
          });
        });
      });
    });
    setExpandedNodes(allExpanded);
  };

  const handleCollapseAll = () => {
    setExpandedNodes({});
  };

  // Open Modal Helpers
  const openAddWarehouseModal = () => {
    setModalState({
      isOpen: true,
      mode: "add",
      type: "warehouse",
      name: "",
      location: "",
      capacity: "",
    });
    setIsWarehouseMenuOpen(false);
  };

  const openAddFloorModal = (defaultWarehouseId?: string) => {
    setModalState({
      isOpen: true,
      mode: "add",
      type: "floor",
      name: "",
      location: "",
      warehouseId: defaultWarehouseId || (warehouses[0]?.id ?? ""),
      capacity: "",
    });
    setIsWarehouseMenuOpen(false);
  };

  const openAddRoomModal = (defaultFloorId?: string) => {
    setModalState({
      isOpen: true,
      mode: "add",
      type: "room",
      name: "",
      location: "",
      floorParentId: defaultFloorId || (allFloorsWithContext[0]?.id ?? ""),
      capacity: "",
    });
    setIsWarehouseMenuOpen(false);
  };

  const openAddRackModal = (defaultRoomId?: string) => {
    setModalState({
      isOpen: true,
      mode: "add",
      type: "rack",
      name: "",
      location: "",
      roomParentId: defaultRoomId || (allRoomsWithContext[0]?.id ?? ""),
      capacity: "",
    });
    setIsWarehouseMenuOpen(false);
  };

  const openAddShelfModal = (defaultRackId?: string) => {
    setModalState({
      isOpen: true,
      mode: "add",
      type: "shelf",
      name: "",
      location: "",
      rackParentId: defaultRackId || (allRacksWithContext[0]?.id ?? ""),
      capacity: "200",
    });
    setIsWarehouseMenuOpen(false);
  };

  const openEditModal = (
    type: StructureType,
    item: {
      id: string;
      name: string;
      location?: string;
      code?: string;
      capacity?: string;
      parentId?: string;
    }
  ) => {
    setModalState({
      isOpen: true,
      mode: "edit",
      type,
      name: item.name,
      location: item.location || "",
      code: item.code || "",
      capacity: item.capacity || "",
      warehouseId: type === "floor" ? item.parentId : type === "warehouse" ? item.id : "",
      floorParentId: type === "room" ? item.parentId : "",
      roomParentId: type === "rack" ? item.parentId : "",
      rackParentId: type === "shelf" ? item.parentId : "",
      floorId: type === "floor" ? item.id : "",
      roomId: type === "room" ? item.id : "",
      rackId: type === "rack" ? item.id : "",
      shelfId: type === "shelf" ? item.id : "",
    });
  };

  // Submit Handler for Add / Edit
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (modalState.mode === "add") {
        if (modalState.type === "warehouse") {
          await createWarehouse({
            name: modalState.name.trim(),
            location: modalState.location.trim(),
          });
          showToast(`Warehouse "${modalState.name}" created successfully!`);
        } else if (modalState.type === "floor") {
          if (!modalState.warehouseId) {
            throw new Error("Please select a target Warehouse.");
          }
          await createWarehouseFloor({
            name: modalState.name.trim(),
            warehouseId: modalState.warehouseId,
          });
          setExpandedNodes((prev) => ({ ...prev, [`wh-${modalState.warehouseId}`]: true }));
          showToast(`Floor "${modalState.name}" added successfully!`);
        } else if (modalState.type === "room") {
          if (!modalState.floorParentId) {
            throw new Error("Please select a target Floor.");
          }
          await createWarehouseRoom({
            name: modalState.name.trim(),
            warehouseFloorId: modalState.floorParentId,
          });
          setExpandedNodes((prev) => ({ ...prev, [`flr-${modalState.floorParentId}`]: true }));
          showToast(`Room "${modalState.name}" created successfully!`);
        } else if (modalState.type === "rack") {
          if (!modalState.roomParentId) {
            throw new Error("Please select a target Room.");
          }
          await createWarehouseRack({
            name: modalState.name.trim(),
            warehouseRoomId: modalState.roomParentId,
          });
          setExpandedNodes((prev) => ({ ...prev, [`rm-${modalState.roomParentId}`]: true }));
          showToast(`Rack "${modalState.name}" created successfully!`);
        } else if (modalState.type === "shelf") {
          if (!modalState.rackParentId) {
            throw new Error("Please select a target Rack.");
          }
          await createWarehouseShelf({
            name: modalState.name.trim(),
            warehouseRackId: modalState.rackParentId,
            capacity: modalState.capacity.trim() || "0",
          });
          setExpandedNodes((prev) => ({ ...prev, [`rck-${modalState.rackParentId}`]: true }));
          showToast(`Shelf "${modalState.name}" added successfully!`);
        }
      } else {
        // Mode: EDIT
        if (modalState.type === "warehouse" && modalState.warehouseId) {
          await updateWarehouse(modalState.warehouseId, {
            name: modalState.name.trim(),
            location: modalState.location.trim(),
            code: modalState.code,
          });
          showToast(`Warehouse updated successfully!`);
        } else if (modalState.type === "floor" && modalState.floorId) {
          await updateWarehouseFloor(modalState.floorId, {
            name: modalState.name.trim(),
            code: modalState.code,
            warehouseId: modalState.warehouseId,
          });
          showToast(`Floor updated successfully!`);
        } else if (modalState.type === "room" && modalState.roomId) {
          await updateWarehouseRoom(modalState.roomId, {
            name: modalState.name.trim(),
            code: modalState.code,
            warehouseFloorId: modalState.floorParentId,
          });
          showToast(`Room updated successfully!`);
        } else if (modalState.type === "rack" && modalState.rackId) {
          await updateWarehouseRack(modalState.rackId, {
            name: modalState.name.trim(),
            code: modalState.code,
            warehouseRoomId: modalState.roomParentId,
          });
          showToast(`Rack updated successfully!`);
        } else if (modalState.type === "shelf" && modalState.shelfId) {
          await updateWarehouseShelf(modalState.shelfId, {
            name: modalState.name.trim(),
            capacity: modalState.capacity.trim(),
            code: modalState.code,
            warehouseRackId: modalState.rackParentId,
          });
          showToast(`Shelf updated successfully!`);
        }
      }

      setModalState(initialModalState);
      await loadWarehouseData();
    } catch (err: any) {
      console.error("Save error:", err);
      showToast(err.message || "Failed to save structure item.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Handler
  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    setSubmitting(true);
    try {
      const { type, id, name } = deleteConfirm;
      if (type === "warehouse") {
        await deleteWarehouse(id);
        showToast(`Warehouse "${name}" deleted.`);
      } else if (type === "floor") {
        await deleteWarehouseFloor(id);
        showToast(`Floor "${name}" deleted.`);
      } else if (type === "room") {
        await deleteWarehouseRoom(id);
        showToast(`Room "${name}" deleted.`);
      } else if (type === "rack") {
        await deleteWarehouseRack(id);
        showToast(`Rack "${name}" deleted.`);
      } else if (type === "shelf") {
        await deleteWarehouseShelf(id);
        showToast(`Shelf "${name}" deleted.`);
      }
      setDeleteConfirm(null);
      await loadWarehouseData();
    } catch (err: any) {
      console.error("Delete failed:", err);
      showToast(err.message || "Failed to delete item.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered Warehouses tree according to search term and dropdown filter
  const filteredWarehouses = useMemo(() => {
    let list = warehouses;
    if (selectedWarehouseFilter !== "ALL") {
      list = list.filter((w) => w.id === selectedWarehouseFilter);
    }

    if (!searchTerm.trim()) return list;

    const term = searchTerm.toLowerCase();

    return list
      .map((w) => {
        const matchesWarehouse =
          w.name.toLowerCase().includes(term) ||
          (w.code && w.code.toLowerCase().includes(term)) ||
          (w.location && w.location.toLowerCase().includes(term));

        const matchedFloors = (w.warehouseFloors || [])
          .map((f) => {
            const matchesFloor =
              f.name.toLowerCase().includes(term) ||
              (f.code && f.code.toLowerCase().includes(term));

            const matchedRooms = (f.warehouseRooms || [])
              .map((r) => {
                const matchesRoom =
                  r.name.toLowerCase().includes(term) ||
                  (r.code && r.code.toLowerCase().includes(term));

                const matchedRacks = (r.warehouseRacks || [])
                  .map((rk) => {
                    const matchesRack =
                      rk.name.toLowerCase().includes(term) ||
                      (rk.code && rk.code.toLowerCase().includes(term));

                    const matchedShelves = (rk.warehouseShelves || []).filter(
                      (s) =>
                        s.name.toLowerCase().includes(term) ||
                        (s.code && s.code.toLowerCase().includes(term)) ||
                        (s.capacity && s.capacity.toLowerCase().includes(term))
                    );

                    if (matchesRack || matchedShelves.length > 0) {
                      return {
                        ...rk,
                        warehouseShelves: matchedShelves.length > 0 ? matchedShelves : rk.warehouseShelves,
                      };
                    }
                    return null;
                  })
                  .filter(Boolean) as WarehouseRackDto[];

                if (matchesRoom || matchedRacks.length > 0) {
                  return {
                    ...r,
                    warehouseRacks: matchedRacks.length > 0 ? matchedRacks : r.warehouseRacks,
                  };
                }
                return null;
              })
              .filter(Boolean) as WarehouseRoomDto[];

            if (matchesFloor || matchedRooms.length > 0) {
              return {
                ...f,
                warehouseRooms: matchedRooms.length > 0 ? matchedRooms : f.warehouseRooms,
              };
            }
            return null;
          })
          .filter(Boolean) as WarehouseFloorDto[];

        if (matchesWarehouse || matchedFloors.length > 0) {
          return {
            ...w,
            warehouseFloors: matchedFloors.length > 0 ? matchedFloors : w.warehouseFloors,
          };
        }
        return null;
      })
      .filter(Boolean) as WarehouseDto[];
  }, [warehouses, selectedWarehouseFilter, searchTerm]);

  return (
    <div className="space-y-6 text-slate-800 pb-16">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white text-sm font-medium transition-all animate-fadeIn ${
            toast.type === "success" ? "bg-slate-900 border border-slate-800" : "bg-red-600 border border-red-700"
          }`}
        >
          <span className="material-symbols-outlined text-xl text-emerald-400">
            {toast.type === "success" ? "check_circle" : "error"}
          </span>
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-slate-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* Page Title & Main Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Warehouse Directory
            </h1>
            <span className="px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              Storage Hierarchy
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage warehouses, floors, rooms, racks, and shelf bin storage capacities connected to live APIs.
          </p>
        </div>

        {/* Action Header Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => loadWarehouseData()}
            disabled={loading}
            title="Refresh Directory"
            className="flex items-center justify-center p-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all shadow-xs active:scale-95 disabled:opacity-60"
          >
            <span className={`material-symbols-outlined text-lg ${loading ? "animate-spin" : ""}`}>
              refresh
            </span>
          </button>

          {/* Warehouse Dropdown Menu */}
          <div className="relative" ref={warehouseMenuRef}>
            <button
              type="button"
              onClick={() => setIsWarehouseMenuOpen((prev) => !prev)}
              className="flex items-center justify-center gap-2 bg-slate-100 border border-slate-200 text-slate-800 py-2.5 px-3.5 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all shadow-xs active:scale-95 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-base text-slate-600">tune</span>
              <span>Warehouse Menu</span>
              <span className="material-symbols-outlined text-sm text-slate-500">expand_more</span>
            </button>

            {isWarehouseMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fadeIn">
                <button
                  type="button"
                  onClick={openAddWarehouseModal}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-xs font-semibold text-slate-900 transition-colors"
                >
                  <span className="material-symbols-outlined text-blue-600 text-base">domain_add</span>
                  <span>Add New Warehouse</span>
                </button>
                <button
                  type="button"
                  onClick={() => openAddFloorModal()}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-xs font-semibold text-slate-900 transition-colors"
                >
                  <span className="material-symbols-outlined text-indigo-600 text-base">layers</span>
                  <span>Add Floor</span>
                </button>
                <button
                  type="button"
                  onClick={() => openAddRoomModal()}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-xs font-semibold text-slate-900 transition-colors"
                >
                  <span className="material-symbols-outlined text-emerald-600 text-base">meeting_room</span>
                  <span>Add Room</span>
                </button>
                <button
                  type="button"
                  onClick={() => openAddRackModal()}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-xs font-semibold text-slate-900 transition-colors"
                >
                  <span className="material-symbols-outlined text-amber-600 text-base">shelves</span>
                  <span>Add Rack</span>
                </button>
                <button
                  type="button"
                  onClick={() => openAddShelfModal()}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-xs font-semibold text-slate-900 transition-colors border-b border-slate-100"
                >
                  <span className="material-symbols-outlined text-purple-600 text-base">grid_view</span>
                  <span>Add Shelf</span>
                </button>
                <div className="px-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      handleExpandAll();
                      setIsWarehouseMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-100 rounded-lg flex items-center gap-2 text-xs font-medium text-slate-600"
                  >
                    <span className="material-symbols-outlined text-sm">unfold_more</span>
                    <span>Expand All</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleCollapseAll();
                      setIsWarehouseMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-100 rounded-lg flex items-center gap-2 text-xs font-medium text-slate-600"
                  >
                    <span className="material-symbols-outlined text-sm">unfold_less</span>
                    <span>Collapse All</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={openAddWarehouseModal}
            className="flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 px-4 rounded-xl font-bold text-xs hover:bg-slate-800 transition-all shadow-md active:scale-95 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>Add Warehouse</span>
          </button>
        </div>
      </div>

      {/* Stats Overview Grid (4 KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Warehouses */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between min-h-[130px]">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Warehouses
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
              <span className="material-symbols-outlined text-xl">warehouse</span>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">{stats.totalWarehouses}</div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">Active facilities registered</div>
        </div>

        {/* Floors & Rooms */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between min-h-[130px]">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Floors & Rooms
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700">
              <span className="material-symbols-outlined text-xl">domain</span>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            {stats.totalFloors} <span className="text-base text-slate-400 font-normal">flr /</span> {stats.totalRooms} <span className="text-base text-slate-400 font-normal">rm</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">Mapped structural zones</div>
        </div>

        {/* Total Racks */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between min-h-[130px]">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Storage Racks
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
              <span className="material-symbols-outlined text-xl">shelves</span>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">{stats.totalRacks}</div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">Active bay racking systems</div>
        </div>

        {/* Total Shelves & Capacity */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between min-h-[130px]">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Shelf Units & Cap
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <span className="material-symbols-outlined text-xl">grid_view</span>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            {stats.totalShelves} <span className="text-xs text-slate-500 font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 align-middle ml-1">{stats.totalCapacity} Cap</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">Total storage shelf capacity</div>
        </div>
      </div>

      {/* Directory Grid & Tree Section */}
      <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
        {/* Table Controls Bar */}
        <div className="p-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search Input */}
            <div className="relative min-w-[260px] flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                search
              </span>
              <input
                type="text"
                placeholder="Search warehouse, floor, room, rack, or shelf..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Warehouse Filter Dropdown */}
            <div className="min-w-[180px]">
              <select
                value={selectedWarehouseFilter}
                onChange={(e) => setSelectedWarehouseFilter(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all"
              >
                <option value="ALL">All Warehouses ({warehouses.length})</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.code || "WAR"})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Add Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => openAddFloorModal()}
                className="flex items-center justify-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-700 py-2 px-3 rounded-lg font-bold text-xs hover:bg-slate-200 transition-all shadow-2xs"
              >
                <span className="material-symbols-outlined text-sm text-indigo-600">add</span>
                <span>Floor</span>
              </button>

              <button
                onClick={() => openAddRoomModal()}
                className="flex items-center justify-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-700 py-2 px-3 rounded-lg font-bold text-xs hover:bg-slate-200 transition-all shadow-2xs"
              >
                <span className="material-symbols-outlined text-sm text-emerald-600">add</span>
                <span>Room</span>
              </button>

              <button
                onClick={() => openAddRackModal()}
                className="flex items-center justify-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-700 py-2 px-3 rounded-lg font-bold text-xs hover:bg-slate-200 transition-all shadow-2xs"
              >
                <span className="material-symbols-outlined text-sm text-amber-600">add</span>
                <span>Rack</span>
              </button>

              <button
                onClick={() => openAddShelfModal()}
                className="flex items-center justify-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-700 py-2 px-3 rounded-lg font-bold text-xs hover:bg-slate-200 transition-all shadow-2xs"
              >
                <span className="material-symbols-outlined text-sm text-purple-600">add</span>
                <span>Shelf</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tree Table Header */}
        <div className="grid grid-cols-12 px-6 py-3.5 bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
          <div className="col-span-6">STRUCTURE HIERARCHY (WAREHOUSE &gt; FLOOR &gt; ROOM &gt; RACK &gt; SHELF)</div>
          <div className="col-span-2">LOCATION / TAG</div>
          <div className="col-span-2 text-right">CAPACITY / SUB-UNITS</div>
          <div className="col-span-2 text-right">ACTIONS</div>
        </div>

        {/* Loading State */}
        {loading && warehouses.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-3">
            <div className="w-10 h-10 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-semibold">Loading warehouse directory hierarchy...</p>
          </div>
        ) : filteredWarehouses.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-4">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">warehouse</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">No warehouse structures found</p>
              <p className="text-xs text-slate-400 mt-1">
                {searchTerm
                  ? `No structure elements matching "${searchTerm}".`
                  : "Start by creating your first warehouse facility."}
              </p>
            </div>
            <button
              onClick={openAddWarehouseModal}
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>Add First Warehouse</span>
            </button>
          </div>
        ) : (
          /* Tree Rows */
          <div className="divide-y divide-slate-100">
            {filteredWarehouses.map((warehouse) => {
              const isWhExpanded = !!expandedNodes[`wh-${warehouse.id}`] || !!searchTerm;
              const floors = warehouse.warehouseFloors || [];

              return (
                <React.Fragment key={`wh-${warehouse.id}`}>
                  {/* ────────────────── LEVEL 0: WAREHOUSE ROW ────────────────── */}
                  <div className="grid grid-cols-12 px-6 py-4 bg-white hover:bg-slate-50/90 transition-colors items-center group">
                    {/* Structure name and expander */}
                    <div className="col-span-6 flex items-center space-x-3">
                      {floors.length > 0 ? (
                        <button
                          onClick={() => toggleExpand(`wh-${warehouse.id}`)}
                          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors shrink-0"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {isWhExpanded ? "expand_more" : "chevron_right"}
                          </span>
                        </button>
                      ) : (
                        <div className="w-6 shrink-0"></div>
                      )}

                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 shadow-2xs">
                        <span className="material-symbols-outlined text-[22px]">warehouse</span>
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm">
                            {warehouse.name}
                          </span>
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/60 rounded text-[10px] font-mono font-bold">
                            {warehouse.code || "WAR"}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-[13px] text-slate-400">pin_drop</span>
                          {warehouse.location || "Location not specified"}
                        </span>
                      </div>
                    </div>

                    {/* Tag / Location */}
                    <div className="col-span-2">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-[11px] font-bold">
                        {warehouse.location || "Main Facility"}
                      </span>
                    </div>

                    {/* Capacity / Sub-units */}
                    <div className="col-span-2 text-right">
                      <span className="text-xs font-semibold text-slate-700 font-mono">
                        {floors.length} {floors.length === 1 ? "Floor" : "Floors"}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="col-span-2 flex justify-end gap-1.5 items-center">
                      <button
                        title="Add Floor to this Warehouse"
                        onClick={() => openAddFloorModal(warehouse.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/70 transition-colors shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[17px]">add</span>
                      </button>
                      <button
                        title="Edit Warehouse"
                        onClick={() =>
                          openEditModal("warehouse", {
                            id: warehouse.id,
                            name: warehouse.name,
                            location: warehouse.location,
                            code: warehouse.code,
                          })
                        }
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/70 transition-colors shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[17px]">edit</span>
                      </button>
                      <button
                        title="Delete Warehouse"
                        onClick={() =>
                          setDeleteConfirm({
                            isOpen: true,
                            type: "warehouse",
                            id: warehouse.id,
                            name: warehouse.name,
                          })
                        }
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200/70 transition-colors shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[17px]">delete</span>
                      </button>
                    </div>
                  </div>

                  {/* ────────────────── LEVEL 1: FLOOR ROWS ────────────────── */}
                  {isWhExpanded &&
                    floors.map((floor) => {
                      const isFloorExpanded = !!expandedNodes[`flr-${floor.id}`] || !!searchTerm;
                      const rooms = floor.warehouseRooms || [];

                      return (
                        <React.Fragment key={`flr-${floor.id}`}>
                          <div className="grid grid-cols-12 px-6 py-3.5 bg-slate-50/70 hover:bg-slate-100/80 transition-colors items-center group border-t border-slate-100">
                            {/* Structure name and expander with indentation */}
                            <div className="col-span-6 flex items-center space-x-3 pl-8">
                              {rooms.length > 0 ? (
                                <button
                                  onClick={() => toggleExpand(`flr-${floor.id}`)}
                                  className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors shrink-0"
                                >
                                  <span className="material-symbols-outlined text-[18px]">
                                    {isFloorExpanded ? "expand_more" : "chevron_right"}
                                  </span>
                                </button>
                              ) : (
                                <div className="w-5 shrink-0"></div>
                              )}

                              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                                <span className="material-symbols-outlined text-[19px]">domain</span>
                              </div>

                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-800 text-[13px]">
                                    {floor.name}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-mono bg-white border border-slate-200 px-1.5 py-0.2 rounded font-semibold">
                                    {floor.code || "FLR"}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400">
                                  Floor level under {warehouse.name}
                                </span>
                              </div>
                            </div>

                            {/* Tag */}
                            <div className="col-span-2">
                              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200/50 rounded text-[10px] font-bold font-mono">
                                Floor Level
                              </span>
                            </div>

                            {/* Sub-units count */}
                            <div className="col-span-2 text-right">
                              <span className="text-xs font-semibold text-slate-600 font-mono">
                                {rooms.length} {rooms.length === 1 ? "Room" : "Rooms"}
                              </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="col-span-2 flex justify-end gap-1.5 items-center">
                              <button
                                title="Add Room to this Floor"
                                onClick={() => openAddRoomModal(floor.id)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60 transition-colors shadow-2xs"
                              >
                                <span className="material-symbols-outlined text-[15px]">add</span>
                              </button>
                              <button
                                title="Edit Floor"
                                onClick={() =>
                                  openEditModal("floor", {
                                    id: floor.id,
                                    name: floor.name,
                                    code: floor.code,
                                    parentId: warehouse.id,
                                  })
                                }
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60 transition-colors shadow-2xs"
                              >
                                <span className="material-symbols-outlined text-[15px]">edit</span>
                              </button>
                              <button
                                title="Delete Floor"
                                onClick={() =>
                                  setDeleteConfirm({
                                    isOpen: true,
                                    type: "floor",
                                    id: floor.id,
                                    name: floor.name,
                                    parentName: warehouse.name,
                                  })
                                }
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200/60 transition-colors shadow-2xs"
                              >
                                <span className="material-symbols-outlined text-[15px]">delete</span>
                              </button>
                            </div>
                          </div>

                          {/* ────────────────── LEVEL 2: ROOM ROWS ────────────────── */}
                          {isFloorExpanded &&
                            rooms.map((room) => {
                              const isRoomExpanded = !!expandedNodes[`rm-${room.id}`] || !!searchTerm;
                              const racks = room.warehouseRacks || [];

                              return (
                                <React.Fragment key={`rm-${room.id}`}>
                                  <div className="grid grid-cols-12 px-6 py-3 bg-white/90 hover:bg-slate-50 transition-colors items-center group border-t border-slate-100/60">
                                    {/* Structure name and expander with double indentation */}
                                    <div className="col-span-6 flex items-center space-x-3 pl-16">
                                      {racks.length > 0 ? (
                                        <button
                                          onClick={() => toggleExpand(`rm-${room.id}`)}
                                          className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors shrink-0"
                                        >
                                          <span className="material-symbols-outlined text-[17px]">
                                            {isRoomExpanded ? "expand_more" : "chevron_right"}
                                          </span>
                                        </button>
                                      ) : (
                                        <div className="w-5 shrink-0"></div>
                                      )}

                                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                                        <span className="material-symbols-outlined text-[17px]">meeting_room</span>
                                      </div>

                                      <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                          <span className="font-semibold text-slate-800 text-xs">
                                            {room.name}
                                          </span>
                                          <span className="text-[10px] text-slate-400 font-mono bg-slate-50 border border-slate-200 px-1 rounded">
                                            {room.code || "Room"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Tag */}
                                    <div className="col-span-2">
                                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/50 rounded text-[10px] font-bold font-mono">
                                        Room Area
                                      </span>
                                    </div>

                                    {/* Sub-units count */}
                                    <div className="col-span-2 text-right">
                                      <span className="text-[11px] font-semibold text-slate-600 font-mono">
                                        {racks.length} {racks.length === 1 ? "Rack" : "Racks"}
                                      </span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="col-span-2 flex justify-end gap-1.5 items-center">
                                      <button
                                        title="Add Rack to this Room"
                                        onClick={() => openAddRackModal(room.id)}
                                        className="w-6 h-6 flex items-center justify-center rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/60 transition-colors shadow-2xs"
                                      >
                                        <span className="material-symbols-outlined text-[14px]">add</span>
                                      </button>
                                      <button
                                        title="Edit Room"
                                        onClick={() =>
                                          openEditModal("room", {
                                            id: room.id,
                                            name: room.name,
                                            code: room.code,
                                            parentId: floor.id,
                                          })
                                        }
                                        className="w-6 h-6 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60 transition-colors"
                                      >
                                        <span className="material-symbols-outlined text-[14px]">edit</span>
                                      </button>
                                      <button
                                        title="Delete Room"
                                        onClick={() =>
                                          setDeleteConfirm({
                                            isOpen: true,
                                            type: "room",
                                            id: room.id,
                                            name: room.name,
                                            parentName: floor.name,
                                          })
                                        }
                                        className="w-6 h-6 flex items-center justify-center rounded bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200/60 transition-colors"
                                      >
                                        <span className="material-symbols-outlined text-[14px]">delete</span>
                                      </button>
                                    </div>
                                  </div>

                                  {/* ────────────────── LEVEL 3: RACK ROWS ────────────────── */}
                                  {isRoomExpanded &&
                                    racks.map((rack) => {
                                      const isRackExpanded = !!expandedNodes[`rck-${rack.id}`] || !!searchTerm;
                                      const shelves = rack.warehouseShelves || [];

                                      return (
                                        <React.Fragment key={`rck-${rack.id}`}>
                                          <div className="grid grid-cols-12 px-6 py-2.5 bg-slate-50/60 hover:bg-slate-100/70 transition-colors items-center group border-t border-slate-100/40">
                                            {/* Structure name and expander with triple indentation */}
                                            <div className="col-span-6 flex items-center space-x-2.5 pl-24">
                                              {shelves.length > 0 ? (
                                                <button
                                                  onClick={() => toggleExpand(`rck-${rack.id}`)}
                                                  className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors shrink-0"
                                                >
                                                  <span className="material-symbols-outlined text-[16px]">
                                                    {isRackExpanded ? "expand_more" : "chevron_right"}
                                                  </span>
                                                </button>
                                              ) : (
                                                <div className="w-5 shrink-0"></div>
                                              )}

                                              <div className="w-6 h-6 rounded bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200/60">
                                                <span className="material-symbols-outlined text-[16px]">shelves</span>
                                              </div>

                                              <div className="flex items-center space-x-2">
                                                <span className="font-semibold text-slate-800 text-xs">
                                                  {rack.name}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-mono bg-white border border-slate-200 px-1 rounded">
                                                  {rack.code || "RCK"}
                                                </span>
                                              </div>
                                            </div>

                                            {/* Tag */}
                                            <div className="col-span-2">
                                              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200/50 rounded text-[9px] font-bold font-mono">
                                                Rack Bay
                                              </span>
                                            </div>

                                            {/* Sub-units count */}
                                            <div className="col-span-2 text-right">
                                              <span className="text-[11px] font-semibold text-slate-600 font-mono">
                                                {shelves.length} {shelves.length === 1 ? "Shelf" : "Shelves"}
                                              </span>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="col-span-2 flex justify-end gap-1.5 items-center">
                                              <button
                                                title="Add Shelf to this Rack"
                                                onClick={() => openAddShelfModal(rack.id)}
                                                className="w-6 h-6 flex items-center justify-center rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/60 transition-colors shadow-2xs"
                                              >
                                                <span className="material-symbols-outlined text-[14px]">add</span>
                                              </button>
                                              <button
                                                title="Edit Rack"
                                                onClick={() =>
                                                  openEditModal("rack", {
                                                    id: rack.id,
                                                    name: rack.name,
                                                    code: rack.code,
                                                    parentId: room.id,
                                                  })
                                                }
                                                className="w-6 h-6 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60 transition-colors"
                                              >
                                                <span className="material-symbols-outlined text-[13px]">edit</span>
                                              </button>
                                              <button
                                                title="Delete Rack"
                                                onClick={() =>
                                                  setDeleteConfirm({
                                                    isOpen: true,
                                                    type: "rack",
                                                    id: rack.id,
                                                    name: rack.name,
                                                    parentName: room.name,
                                                  })
                                                }
                                                className="w-6 h-6 flex items-center justify-center rounded bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200/60 transition-colors"
                                              >
                                                <span className="material-symbols-outlined text-[13px]">delete</span>
                                              </button>
                                            </div>
                                          </div>

                                          {/* ────────────────── LEVEL 4: SHELF ROWS (NO LEVEL IN BETWEEN!) ────────────────── */}
                                          {isRackExpanded &&
                                            shelves.map((shelf) => (
                                              <div
                                                key={`shf-${shelf.id}`}
                                                className="grid grid-cols-12 px-6 py-2 bg-white/95 hover:bg-slate-50 transition-colors items-center group border-t border-slate-100/30"
                                              >
                                                {/* Structure name and icon with quadruple indentation */}
                                                <div className="col-span-6 flex items-center space-x-2 pl-[132px]">
                                                  <div className="w-4 flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined text-purple-400 text-[13px]">
                                                      subdirectory_arrow_right
                                                    </span>
                                                  </div>
                                                  <span className="material-symbols-outlined text-purple-600 text-[15px]">
                                                    grid_view
                                                  </span>
                                                  <span className="font-medium text-slate-800 text-[11px]">
                                                    {shelf.name}
                                                  </span>
                                                  <span className="text-[9px] text-slate-400 font-mono bg-slate-50 border border-slate-200 px-1 rounded">
                                                    {shelf.code || "SHF"}
                                                  </span>
                                                </div>

                                                {/* Tag */}
                                                <div className="col-span-2">
                                                  <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200/50 rounded text-[9px] font-bold font-mono">
                                                    Shelf Unit
                                                  </span>
                                                </div>

                                                {/* Capacity */}
                                                <div className="col-span-2 font-mono text-[11px] font-bold text-slate-700 text-right">
                                                  {shelf.capacity ? `${shelf.capacity} cap` : "--"}
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="col-span-2 flex justify-end gap-1.5 items-center">
                                                  <button
                                                    title="Edit Shelf"
                                                    onClick={() =>
                                                      openEditModal("shelf", {
                                                        id: shelf.id,
                                                        name: shelf.name,
                                                        code: shelf.code,
                                                        capacity: shelf.capacity,
                                                        parentId: rack.id,
                                                      })
                                                    }
                                                    className="w-5 h-5 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200/60 transition-colors"
                                                  >
                                                    <span className="material-symbols-outlined text-[13px]">edit</span>
                                                  </button>
                                                  <button
                                                    title="Delete Shelf"
                                                    onClick={() =>
                                                      setDeleteConfirm({
                                                        isOpen: true,
                                                        type: "shelf",
                                                        id: shelf.id,
                                                        name: shelf.name,
                                                        parentName: rack.name,
                                                      })
                                                    }
                                                    className="w-5 h-5 flex items-center justify-center rounded bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200/60 transition-colors"
                                                  >
                                                    <span className="material-symbols-outlined text-[13px]">delete</span>
                                                  </button>
                                                </div>
                                              </div>
                                            ))}
                                        </React.Fragment>
                                      );
                                    })}
                                </React.Fragment>
                              );
                            })}
                        </React.Fragment>
                      );
                    })}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* ────────────────── UNIFIED ADD / EDIT STRUCTURE MODAL ────────────────── */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col relative border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <span
                  className={`material-symbols-outlined p-1.5 rounded-lg text-lg ${
                    modalState.type === "warehouse"
                      ? "bg-blue-100 text-blue-700"
                      : modalState.type === "floor"
                      ? "bg-indigo-100 text-indigo-700"
                      : modalState.type === "room"
                      ? "bg-emerald-100 text-emerald-700"
                      : modalState.type === "rack"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {modalState.type === "warehouse"
                    ? "warehouse"
                    : modalState.type === "floor"
                    ? "domain"
                    : modalState.type === "room"
                    ? "meeting_room"
                    : modalState.type === "rack"
                    ? "shelves"
                    : "grid_view"}
                </span>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight font-mono">
                    {modalState.mode === "add"
                      ? `Add New ${modalState.type.toUpperCase()}`
                      : `Edit ${modalState.type.toUpperCase()} Details`}
                  </h2>
                  <p className="text-[11px] text-slate-500 font-sans">
                    {modalState.type === "warehouse"
                      ? "Top-level warehouse facility (api/warehouse)"
                      : modalState.type === "floor"
                      ? "Floor zone inside a warehouse (api/warehouse-floor)"
                      : modalState.type === "room"
                      ? "Room section inside a floor (api/warehouse-room)"
                      : modalState.type === "rack"
                      ? "Rack shelving system inside a room (api/warehouse-rack)"
                      : "Shelf unit storage slot inside a rack (api/warehouse-shelf)"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalState(initialModalState)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 text-sm">
              {/* Type Switcher when in Add mode if opened from general button */}
              {modalState.mode === "add" && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                    Structure Type
                  </label>
                  <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-xl">
                    {(["warehouse", "floor", "room", "rack", "shelf"] as StructureType[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setModalState((prev) => ({
                            ...prev,
                            type: t,
                            warehouseId: prev.warehouseId || warehouses[0]?.id || "",
                            floorParentId: prev.floorParentId || allFloorsWithContext[0]?.id || "",
                            roomParentId: prev.roomParentId || allRoomsWithContext[0]?.id || "",
                            rackParentId: prev.rackParentId || allRacksWithContext[0]?.id || "",
                          }));
                        }}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-bold capitalize transition-all ${
                          modalState.type === t
                            ? "bg-white text-slate-900 shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 1. Parent Warehouse selector for FLOOR */}
              {modalState.type === "floor" && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                    Parent Warehouse <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={modalState.warehouseId || ""}
                    onChange={(e) =>
                      setModalState((prev) => ({ ...prev, warehouseId: e.target.value }))
                    }
                    required
                    disabled={modalState.mode === "edit"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-slate-900 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                  >
                    <option value="">-- Select Warehouse --</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.code || "WAR"}) - {w.location || "No Location"}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 2. Parent Floor selector for ROOM */}
              {modalState.type === "room" && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                    Parent Floor (warehouseFloorId) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={modalState.floorParentId || ""}
                    onChange={(e) =>
                      setModalState((prev) => ({ ...prev, floorParentId: e.target.value }))
                    }
                    required
                    disabled={modalState.mode === "edit"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-slate-900 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                  >
                    <option value="">-- Select Floor --</option>
                    {allFloorsWithContext.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.warehouseName} &gt; {f.name} ({f.code || "FLR"})
                      </option>
                    ))}
                  </select>
                  {allFloorsWithContext.length === 0 && (
                    <p className="text-[11px] text-amber-600">
                      No floors available. Please create a floor first.
                    </p>
                  )}
                </div>
              )}

              {/* 3. Parent Room selector for RACK */}
              {modalState.type === "rack" && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                    Parent Room (warehouseRoomId) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={modalState.roomParentId || ""}
                    onChange={(e) =>
                      setModalState((prev) => ({ ...prev, roomParentId: e.target.value }))
                    }
                    required
                    disabled={modalState.mode === "edit"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-slate-900 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                  >
                    <option value="">-- Select Room --</option>
                    {allRoomsWithContext.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.warehouseName} &gt; {r.floorName} &gt; {r.name} ({r.code || "Room"})
                      </option>
                    ))}
                  </select>
                  {allRoomsWithContext.length === 0 && (
                    <p className="text-[11px] text-amber-600">
                      No rooms available. Please create a room first.
                    </p>
                  )}
                </div>
              )}

              {/* 4. Parent Rack selector for SHELF */}
              {modalState.type === "shelf" && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                    Parent Rack (warehouseRackId) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={modalState.rackParentId || ""}
                    onChange={(e) =>
                      setModalState((prev) => ({ ...prev, rackParentId: e.target.value }))
                    }
                    required
                    disabled={modalState.mode === "edit"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-slate-900 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                  >
                    <option value="">-- Select Rack --</option>
                    {allRacksWithContext.map((rk) => (
                      <option key={rk.id} value={rk.id}>
                        {rk.warehouseName} &gt; {rk.floorName} &gt; {rk.roomName} &gt; {rk.name} (
                        {rk.code || "RCK"})
                      </option>
                    ))}
                  </select>
                  {allRacksWithContext.length === 0 && (
                    <p className="text-[11px] text-amber-600">
                      No racks available. Please create a rack first.
                    </p>
                  )}
                </div>
              )}

              {/* Name field (all types) */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={modalState.name}
                  onChange={(e) => setModalState((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder={
                    modalState.type === "warehouse"
                      ? "e.g. Kathmandu Central Logistics Hub"
                      : modalState.type === "floor"
                      ? "e.g. Ground Floor"
                      : modalState.type === "room"
                      ? "e.g. Raw Material Storage A"
                      : modalState.type === "rack"
                      ? "e.g. Heavy Duty Rack 01"
                      : "e.g. Shelf A1 - Top Bin"
                  }
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>

              {/* Location field (Warehouse only) */}
              {modalState.type === "warehouse" && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                    Location / Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={modalState.location}
                    onChange={(e) =>
                      setModalState((prev) => ({ ...prev, location: e.target.value }))
                    }
                    placeholder="e.g. Ktm, Lalitpur, Birgunj, etc."
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-slate-900 outline-none"
                  />
                </div>
              )}

              {/* Capacity field (Shelf only) */}
              {modalState.type === "shelf" && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                    Capacity (units / kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={modalState.capacity}
                    onChange={(e) =>
                      setModalState((prev) => ({ ...prev, capacity: e.target.value }))
                    }
                    placeholder="e.g. 200"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-slate-900 outline-none"
                  />
                </div>
              )}

              {/* Code display in Edit Mode */}
              {modalState.mode === "edit" && modalState.code && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 text-xs uppercase tracking-wider">
                    System Code
                  </label>
                  <input
                    type="text"
                    value={modalState.code}
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-500 text-xs font-mono font-bold"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-200 mt-6">
                <button
                  type="button"
                  onClick={() => setModalState(initialModalState)}
                  disabled={submitting}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-bold rounded-lg text-xs hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting && (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>
                    {modalState.mode === "add"
                      ? `Save ${modalState.type}`
                      : `Update ${modalState.type}`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────── DELETE CONFIRMATION DIALOG ────────────────── */}
      {deleteConfirm && deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xl">delete_forever</span>
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Delete {deleteConfirm.type.toUpperCase()}?
                </h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
              Are you sure you want to delete{" "}
              <strong className="text-slate-900 font-bold">"{deleteConfirm.name}"</strong>?
              {deleteConfirm.type !== "shelf" && (
                <span className="block mt-1 text-red-600 font-medium">
                  Warning: All nested child structures within this {deleteConfirm.type} will also be affected.
                </span>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                disabled={submitting}
                className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-bold rounded-lg text-xs hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {submitting && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
