"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";

export type StructureNode = {
  id: string;
  code: string;
  name: string;
  levelType: "floor" | "room" | "rack" | "level" | "shelf";
  typeTag: string;
  maxCap: string;
  parentId?: string;
  isExpanded?: boolean;
};

export default function AdminWarehouseDirectoryPage() {
  const [isWarehouseMenuOpen, setIsWarehouseMenuOpen] = useState(false);
  const warehouseMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (warehouseMenuRef.current && !warehouseMenuRef.current.contains(e.target as Node)) {
        setIsWarehouseMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  const [addType, setAddType] = useState<"floor" | "room" | "rack" | "level" | "shelf">("floor");
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newTag, setNewTag] = useState("Main Storage");
  const [newCap, setNewCap] = useState("5,000kg");
  const [parentSelection, setParentSelection] = useState("");

  // Default Structure Nodes
  const [nodes, setNodes] = useState<StructureNode[]>([
    { id: "flr-01", code: "FLR-01", name: "Floor 1", levelType: "floor", typeTag: "Main Storage", maxCap: "--" },
    { id: "flr-01-rm-a", code: "FLR-01-RM-A", name: "Room A", levelType: "room", typeTag: "General Area", maxCap: "--", parentId: "flr-01" },
    { id: "flr-01-ra", code: "FLR-01-RA", name: "Rack A", levelType: "rack", typeTag: "High Density", maxCap: "10,000kg", parentId: "flr-01-rm-a" },
    { id: "flr-01-ra-l1", code: "FLR-01-RA-L1", name: "Level 1 (Base)", levelType: "level", typeTag: "Pallet Storage", maxCap: "2,500kg", parentId: "flr-01-ra" },
    { id: "flr-01-ra-l1-s1", code: "FLR-01-RA-L1-S1", name: "Shelf 1A (Bin 01)", levelType: "shelf", typeTag: "Bin Location", maxCap: "500kg", parentId: "flr-01-ra-l1" },
  ]);

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenAddModal = (type: "floor" | "room" | "rack" | "level" | "shelf", defaultParentId?: string) => {
    setAddType(type);
    setNewCode(type === "floor" ? `FLR-0${nodes.filter((n) => n.levelType === "floor").length + 1}` : "");
    setNewName("");
    setNewTag(type === "floor" ? "Main Storage" : type === "room" ? "General Area" : type === "rack" ? "High Density" : type === "level" ? "Pallet Storage" : "Bin Location");
    setNewCap(type === "shelf" ? "500kg" : type === "level" ? "2,500kg" : type === "rack" ? "10,000kg" : "--");
    setParentSelection(defaultParentId || "");
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (node: StructureNode) => {
    setEditingNodeId(node.id);
    setAddType(node.levelType);
    setNewCode(node.code);
    setNewName(node.name);
    setNewTag(node.typeTag);
    setNewCap(node.maxCap);
    setParentSelection(node.parentId || "");
    setIsEditModalOpen(true);
  };

  const handleAddStructure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newCode) return;
    const newNode: StructureNode = {
      id: newCode.toLowerCase().replace(/\s+/g, "-"),
      code: newCode,
      name: newName,
      levelType: addType,
      typeTag: newTag,
      maxCap: newCap,
      parentId: parentSelection || undefined,
    };
    setNodes((prev) => [...prev, newNode]);
    if (parentSelection) setExpandedNodes((prev) => ({ ...prev, [parentSelection]: true }));
    setIsAddModalOpen(false);
  };

  const handleUpdateStructure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNodeId || !newName || !newCode) return;
    setNodes((prev) => prev.map((n) => n.id === editingNodeId ? { ...n, code: newCode, name: newName, typeTag: newTag, maxCap: newCap, parentId: parentSelection || undefined } : n));
    setIsEditModalOpen(false);
    setEditingNodeId(null);
  };

  const handleDeleteNode = (id: string) => {
    if (confirm("Are you sure you want to delete this structure location?")) {
      setNodes((prev) => prev.filter((n) => n.id !== id && n.parentId !== id));
    }
  };

  const filteredNodes = useMemo(() => {
    if (!searchTerm.trim()) return nodes;
    const lower = searchTerm.toLowerCase();
    return nodes.filter((n) => n.name.toLowerCase().includes(lower) || n.code.toLowerCase().includes(lower) || n.typeTag.toLowerCase().includes(lower));
  }, [nodes, searchTerm]);

  const floorNodes = useMemo(() => filteredNodes.filter((n) => n.levelType === "floor"), [filteredNodes]);
  const getRoomsForFloor = (floorId: string) => filteredNodes.filter((n) => n.levelType === "room" && n.parentId === floorId);
  const getRacksForRoom = (roomId: string) => filteredNodes.filter((n) => n.levelType === "rack" && n.parentId === roomId);
  const getLevelsForRack = (rackId: string) => filteredNodes.filter((n) => n.levelType === "level" && n.parentId === rackId);
  const getShelvesForLevel = (levelId: string) => filteredNodes.filter((n) => n.levelType === "shelf" && n.parentId === levelId);

  return (
    <div className="space-y-6 text-slate-800">
      {/* Page Title & Main Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Warehouse Directory
            </h1>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              Storage Layout
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your warehouses, structure locations, floor layouts, racks, levels, and shelf bins.
          </p>
        </div>
        
        {/* Action Header Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Warehouse Menu Dropdown */}
          <div className="relative" ref={warehouseMenuRef}>
            <button
              type="button"
              onClick={() => setIsWarehouseMenuOpen((prev) => !prev)}
              className="flex items-center justify-center gap-2 bg-slate-100 border border-slate-200 text-slate-900 py-2.5 px-4 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all shadow-sm active:scale-95 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-base text-slate-600">tune</span>
              <span>Warehouse Menu</span>
              <span className="material-symbols-outlined text-sm text-slate-500">expand_more</span>
            </button>

            {isWarehouseMenuOpen && (
              <div className="absolute right-0 sm:left-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-fadeIn">
                <button
                  type="button"
                  onClick={() => setIsWarehouseMenuOpen(false)}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-xs font-semibold text-slate-900 transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-500 text-base">domain_add</span>
                  <span>Add Warehouse</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsWarehouseMenuOpen(false)}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-xs font-semibold text-slate-900 transition-colors border-t border-slate-100"
                >
                  <span className="material-symbols-outlined text-slate-500 text-base">download</span>
                  <span>Export Directory</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => handleOpenAddModal("floor")}
            className="flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 px-4 rounded-xl font-bold text-xs hover:bg-slate-800 transition-all shadow-md active:scale-95 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>Add Floor</span>
          </button>
        </div>
      </div>

      {/* Stats Overview Grid (4 KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Warehouses */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between min-h-[150px]">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Warehouses
            </span>
            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-800">
              <span className="material-symbols-outlined text-xl">warehouse</span>
            </div>
          </div>
          <div className="text-4xl font-bold text-slate-900">4</div>
        </div>

        {/* Active Locations */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between min-h-[150px]">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Zones
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <span className="material-symbols-outlined text-xl">location_on</span>
            </div>
          </div>
          <div className="text-4xl font-bold text-slate-900">12</div>
        </div>

        {/* Total Capacity */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between min-h-[150px]">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Capacity Utilization
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700">
              <span className="material-symbols-outlined text-xl">inventory_2</span>
            </div>
          </div>
          <div className="text-4xl font-bold text-slate-900">78%</div>
        </div>

        {/* Audit Compliance */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between min-h-[150px]">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Audit Compliance
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-700">
              <span className="material-symbols-outlined text-xl">rule</span>
            </div>
          </div>
          <div className="text-4xl font-bold text-slate-900">95%</div>
        </div>
      </div>

      {/* Directory Grid & Tree Section */}
      <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
        {/* Table Controls Bar */}
        <div className="p-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative min-w-[240px] flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                search
              </span>
              <input
                type="text"
                placeholder="Search structure by code, name, type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenAddModal("room")}
                className="flex items-center justify-center gap-2 bg-slate-100 border border-slate-200 text-slate-700 py-2 px-3 rounded-lg font-bold text-xs hover:bg-slate-200 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">meeting_room</span>
                <span>Add Room</span>
              </button>

              <button
                onClick={() => handleOpenAddModal("rack")}
                className="flex items-center justify-center gap-2 bg-slate-100 border border-slate-200 text-slate-700 py-2 px-3 rounded-lg font-bold text-xs hover:bg-slate-200 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">shelves</span>
                <span>Add Rack</span>
              </button>

              <button
                onClick={() => handleOpenAddModal("shelf")}
                className="flex items-center justify-center gap-2 bg-slate-100 border border-slate-200 text-slate-700 py-2 px-3 rounded-lg font-bold text-xs hover:bg-slate-200 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">grid_view</span>
                <span>Add Shelf</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tree Table Header */}
        <div className="grid grid-cols-5 px-6 py-3.5 bg-slate-100/70 border-b border-slate-200">
          <div className="col-span-2 text-xs font-bold text-slate-600 uppercase tracking-wider">STRUCTURE LEVEL</div>
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">LOCATION TYPE</div>
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider text-right">MAX CAP</div>
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider text-right">ACTIONS</div>
        </div>

        {/* Tree Rows */}
        <div className="divide-y divide-slate-100">
          {floorNodes.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm font-semibold">
              No warehouse structures match your search criteria.
            </div>
          ) : (
            floorNodes.map((floor) => {
              const isFloorExpanded = !!expandedNodes[floor.id] || !!searchTerm;
              const childRooms = getRoomsForFloor(floor.id);

              return (
                <React.Fragment key={floor.id}>
                  
                  {/* FLOOR ROW */}
                  <div className="grid grid-cols-5 px-6 py-4 bg-white hover:bg-slate-50 transition-colors items-center group">
                    <div className="col-span-2 flex items-center space-x-3">
                      {childRooms.length > 0 ? (
                        <button
                          onClick={() => toggleExpand(floor.id)}
                          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors shrink-0"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {isFloorExpanded ? "expand_more" : "chevron_right"}
                          </span>
                        </button>
                      ) : (
                        <div className="w-6 shrink-0"></div>
                      )}
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[20px]">domain</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-sm">{floor.name}</span>
                        <span className="text-xs text-slate-400 font-mono">CODE: {floor.code}</span>
                      </div>
                    </div>

                    <div>
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-[10px] font-bold font-mono">
                        {floor.typeTag}
                      </span>
                    </div>

                    <div className="font-mono text-xs font-bold text-slate-900 text-right">
                      {floor.maxCap}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenAddModal("room", floor.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-600 transition-colors">
                        <span className="material-symbols-outlined text-[16px]">add</span>
                      </button>
                      <button onClick={() => handleOpenEditModal(floor)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-600 transition-colors">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button onClick={() => handleDeleteNode(floor.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 hover:text-red-600 text-slate-600 transition-colors">
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>

                  {/* ROOM ROWS */}
                  {isFloorExpanded &&
                    childRooms.map((room) => {
                      const isRoomExpanded = !!expandedNodes[room.id] || !!searchTerm;
                      const childRacks = getRacksForRoom(room.id);

                      return (
                        <React.Fragment key={room.id}>
                          <div className="grid grid-cols-5 px-6 py-3 bg-slate-50/60 hover:bg-slate-100 transition-colors items-center group border-t border-slate-100/50">
                            <div className="col-span-2 flex items-center space-x-3 pl-12">
                              {childRacks.length > 0 ? (
                                <button
                                  onClick={() => toggleExpand(room.id)}
                                  className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors shrink-0"
                                >
                                  <span className="material-symbols-outlined text-[18px]">
                                    {isRoomExpanded ? "expand_more" : "chevron_right"}
                                  </span>
                                </button>
                              ) : (
                                <div className="w-6 shrink-0"></div>
                              )}
                              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[18px]">meeting_room</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-slate-800 text-[13px]">{room.name}</span>
                                <span className="text-[11px] text-slate-400 font-mono">CODE: {room.code}</span>
                              </div>
                            </div>

                            <div>
                              <span className="px-2.5 py-0.5 bg-slate-200/50 text-slate-700 rounded text-[10px] font-bold font-mono">
                                {room.typeTag}
                              </span>
                            </div>

                            <div className="font-mono text-[11px] font-bold text-slate-700 text-right">
                              {room.maxCap}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleOpenAddModal("rack", room.id)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-200 text-slate-600 transition-colors">
                                <span className="material-symbols-outlined text-[15px]">add</span>
                              </button>
                              <button onClick={() => handleOpenEditModal(room)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-200 text-slate-600 transition-colors">
                                <span className="material-symbols-outlined text-[15px]">edit</span>
                              </button>
                              <button onClick={() => handleDeleteNode(room.id)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-50 hover:text-red-600 text-slate-600 transition-colors">
                                <span className="material-symbols-outlined text-[15px]">delete</span>
                              </button>
                            </div>
                          </div>

                          {/* RACK ROWS */}
                          {isRoomExpanded &&
                            childRacks.map((rack) => {
                              const isRackExpanded = !!expandedNodes[rack.id] || !!searchTerm;
                              const childLevels = getLevelsForRack(rack.id);

                              return (
                                <React.Fragment key={rack.id}>
                                  <div className="grid grid-cols-5 px-6 py-2.5 bg-white/90 hover:bg-slate-50 transition-colors items-center group border-t border-slate-100/30">
                                    <div className="col-span-2 flex items-center space-x-3 pl-24">
                                      {childLevels.length > 0 ? (
                                        <button
                                          onClick={() => toggleExpand(rack.id)}
                                          className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors shrink-0"
                                        >
                                          <span className="material-symbols-outlined text-[16px]">
                                            {isRackExpanded ? "expand_more" : "chevron_right"}
                                          </span>
                                        </button>
                                      ) : (
                                        <div className="w-5 shrink-0"></div>
                                      )}
                                      <div className="text-slate-500 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-[18px]">shelves</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <span className="font-semibold text-slate-800 text-xs">{rack.name}</span>
                                        <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 rounded">{rack.code}</span>
                                      </div>
                                    </div>

                                    <div>
                                      <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                                        {rack.typeTag}
                                      </span>
                                    </div>

                                    <div className="font-mono text-[11px] text-slate-700 text-right">
                                      {rack.maxCap}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => handleOpenAddModal("level", rack.id)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-200 text-slate-600 transition-colors">
                                        <span className="material-symbols-outlined text-[14px]">add</span>
                                      </button>
                                      <button onClick={() => handleOpenEditModal(rack)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-200 text-slate-600 transition-colors">
                                        <span className="material-symbols-outlined text-[14px]">edit</span>
                                      </button>
                                      <button onClick={() => handleDeleteNode(rack.id)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 hover:text-red-600 text-slate-600 transition-colors">
                                        <span className="material-symbols-outlined text-[14px]">delete</span>
                                      </button>
                                    </div>
                                  </div>

                                  {/* LEVEL ROWS */}
                                  {isRackExpanded &&
                                    childLevels.map((lvl) => {
                                      const isLevelExpanded = !!expandedNodes[lvl.id] || !!searchTerm;
                                      const childShelves = getShelvesForLevel(lvl.id);

                                      return (
                                        <React.Fragment key={lvl.id}>
                                          <div className="grid grid-cols-5 px-6 py-2 bg-slate-50/80 hover:bg-slate-100 transition-colors items-center group">
                                            <div className="col-span-2 flex items-center space-x-2 pl-[136px]">
                                              {childShelves.length > 0 ? (
                                                <button
                                                  onClick={() => toggleExpand(lvl.id)}
                                                  className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors shrink-0"
                                                >
                                                  <span className="material-symbols-outlined text-[14px]">
                                                    {isLevelExpanded ? "expand_more" : "chevron_right"}
                                                  </span>
                                                </button>
                                              ) : (
                                                <div className="w-4 flex items-center justify-center shrink-0">
                                                  <span className="material-symbols-outlined text-slate-300 text-[12px]">horizontal_rule</span>
                                                </div>
                                              )}
                                              <span className="material-symbols-outlined text-slate-400 text-[16px]">layers</span>
                                              <span className="font-medium text-slate-700 text-xs">{lvl.name}</span>
                                              <span className="text-[9px] text-slate-400 font-mono bg-white border border-slate-200 px-1 rounded">{lvl.code}</span>
                                            </div>

                                            <div>
                                              <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                                                {lvl.typeTag}
                                              </span>
                                            </div>

                                            <div className="font-mono text-[10px] text-slate-600 text-right">
                                              {lvl.maxCap}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <button onClick={() => handleOpenAddModal("shelf", lvl.id)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-200 text-slate-500 transition-colors">
                                                <span className="material-symbols-outlined text-[14px]">add</span>
                                              </button>
                                              <button onClick={() => handleOpenEditModal(lvl)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-200 text-slate-500 transition-colors">
                                                <span className="material-symbols-outlined text-[14px]">edit</span>
                                              </button>
                                              <button onClick={() => handleDeleteNode(lvl.id)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 hover:text-red-500 text-slate-500 transition-colors">
                                                <span className="material-symbols-outlined text-[14px]">delete</span>
                                              </button>
                                            </div>
                                          </div>

                                          {/* SHELF ROWS */}
                                          {isLevelExpanded &&
                                            childShelves.map((shf) => (
                                              <div key={shf.id} className="grid grid-cols-5 px-6 py-1.5 bg-white/90 hover:bg-slate-50 transition-colors items-center group">
                                                <div className="col-span-2 flex items-center space-x-2 pl-[168px]">
                                                  <div className="w-4 flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined text-emerald-400 text-[12px]">subdirectory_arrow_right</span>
                                                  </div>
                                                  <span className="material-symbols-outlined text-emerald-600 text-[14px]">grid_view</span>
                                                  <span className="font-medium text-slate-800 text-[11px]">{shf.name}</span>
                                                  <span className="text-[9px] text-slate-400 font-mono">{shf.code}</span>
                                                </div>

                                                <div>
                                                  <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                                                    {shf.typeTag}
                                                  </span>
                                                </div>

                                                <div className="font-mono text-[10px] text-slate-500 text-right">
                                                  {shf.maxCap}
                                                </div>

                                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                  <button onClick={() => handleOpenEditModal(shf)} className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-200 text-slate-400 transition-colors">
                                                    <span className="material-symbols-outlined text-[13px]">edit</span>
                                                  </button>
                                                  <button onClick={() => handleDeleteNode(shf.id)} className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-50 hover:text-red-500 text-slate-400 transition-colors">
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
            })
          )}
        </div>
      </div>

      {/* ── MODAL: ADD / EDIT STRUCTURE LOCATION ── */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col relative border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 rounded-t-2xl">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight font-mono">
                {isAddModalOpen ? `Add New ${addType.toUpperCase()}` : `Edit ${addType.toUpperCase()} Details`}
              </h2>
              <button
                onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={isAddModalOpen ? handleAddStructure : handleUpdateStructure} className="p-6 space-y-4 text-sm">
              {/* Parent Selection if applicable */}
              {addType !== "floor" && (
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 text-xs">
                    PARENT {addType === "room" ? "FLOOR" : addType === "rack" ? "ROOM" : addType === "level" ? "RACK" : "LEVEL"}
                  </label>
                  <select
                    value={parentSelection}
                    onChange={(e) => setParentSelection(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                  >
                    <option value="">-- Select Parent --</option>
                    {addType === "room"
                      ? nodes.filter((n) => n.levelType === "floor").map((f) => <option key={f.id} value={f.id}>{f.name} ({f.code})</option>)
                      : addType === "rack"
                      ? nodes.filter((n) => n.levelType === "room").map((rm) => <option key={rm.id} value={rm.id}>{rm.name} ({rm.code})</option>)
                      : addType === "level"
                      ? nodes.filter((n) => n.levelType === "rack").map((r) => <option key={r.id} value={r.id}>{r.name} ({r.code})</option>)
                      : nodes.filter((n) => n.levelType === "level").map((l) => <option key={l.id} value={l.id}>{l.name} ({l.code})</option>)}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 text-xs">LOCATION CODE</label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="e.g. FLR-03"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 text-xs">LOCATION NAME</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Floor 3"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 text-xs">TYPE TAG</label>
                  <select
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                  >
                    <option>Main Storage</option>
                    <option>High Density</option>
                    <option>Pallet Storage</option>
                    <option>Finished Goods</option>
                    <option>Cold Storage</option>
                    <option>Bin Location</option>
                    <option>General Area</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 text-xs">MAX CAPACITY</label>
                  <input
                    type="text"
                    value={newCap}
                    onChange={(e) => setNewCap(e.target.value)}
                    placeholder="e.g. 10,000kg"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-200 mt-6">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                  className="px-4 py-2 font-bold text-slate-700 hover:bg-slate-100 rounded-lg text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg text-xs hover:bg-slate-800 transition-colors shadow-sm"
                >
                  {isAddModalOpen ? "Save Structure" : "Update Structure"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
