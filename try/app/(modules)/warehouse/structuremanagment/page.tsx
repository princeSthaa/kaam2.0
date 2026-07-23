"use client";

import React, { useState, useMemo } from "react";
import "../styles/warehouse-structure.css";

export type StructureNode = {
  id: string;
  code: string;
  name: string;
  levelType: "floor" | "rack" | "level";
  typeTag: string;
  maxCap: string;
  parentId?: string;
  isExpanded?: boolean;
};

export default function WarehouseStructureManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  const [addType, setAddType] = useState<"floor" | "rack" | "level">("floor");
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newTag, setNewTag] = useState("Main Storage");
  const [newCap, setNewCap] = useState("5,000kg");
  const [parentSelection, setParentSelection] = useState("");

  // Default Structure Nodes (Floors, Racks, and Levels)
  const [nodes, setNodes] = useState<StructureNode[]>([
    {
      id: "flr-01",
      code: "FLR-01",
      name: "Floor 1",
      levelType: "floor",
      typeTag: "Main Storage",
      maxCap: "--",
    },
    {
      id: "flr-01-ra",
      code: "FLR-01-RA",
      name: "Rack A",
      levelType: "rack",
      typeTag: "High Density",
      maxCap: "10,000kg",
      parentId: "flr-01",
    },
    {
      id: "flr-01-ra-l1",
      code: "FLR-01-RA-L1",
      name: "Level 1 (Base)",
      levelType: "level",
      typeTag: "Pallet Storage",
      maxCap: "2,500kg",
      parentId: "flr-01-ra",
    },
    {
      id: "flr-01-ra-l2",
      code: "FLR-01-RA-L2",
      name: "Level 2 (Mid)",
      levelType: "level",
      typeTag: "Pallet Storage",
      maxCap: "2,500kg",
      parentId: "flr-01-ra",
    },
    {
      id: "flr-01-rb",
      code: "FLR-01-RB",
      name: "Rack B",
      levelType: "rack",
      typeTag: "Standard Rack",
      maxCap: "8,000kg",
      parentId: "flr-01",
    },
    {
      id: "flr-02",
      code: "FLR-02",
      name: "Floor 2",
      levelType: "floor",
      typeTag: "Finished Goods",
      maxCap: "--",
    },
    {
      id: "flr-02-ra",
      code: "FLR-02-RA",
      name: "Rack A (Finished)",
      levelType: "rack",
      typeTag: "High Density",
      maxCap: "12,000kg",
      parentId: "flr-02",
    },
  ]);

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenAddModal = (type: "floor" | "rack" | "level") => {
    setAddType(type);
    setNewCode(type === "floor" ? `FLR-0${nodes.filter((n) => n.levelType === "floor").length + 1}` : "");
    setNewName("");
    setNewTag(type === "floor" ? "Main Storage" : type === "rack" ? "High Density" : "Pallet Storage");
    setNewCap(type === "level" ? "2,500kg" : type === "rack" ? "10,000kg" : "--");
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
    if (parentSelection) {
      setExpandedNodes((prev) => ({ ...prev, [parentSelection]: true }));
    }
    setIsAddModalOpen(false);
  };

  const handleUpdateStructure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNodeId || !newName || !newCode) return;

    setNodes((prev) =>
      prev.map((n) =>
        n.id === editingNodeId
          ? {
              ...n,
              code: newCode,
              name: newName,
              typeTag: newTag,
              maxCap: newCap,
              parentId: parentSelection || undefined,
            }
          : n
      )
    );

    setIsEditModalOpen(false);
    setEditingNodeId(null);
  };

  const handleDeleteNode = (id: string) => {
    if (confirm("Are you sure you want to delete this structure location?")) {
      setNodes((prev) => prev.filter((n) => n.id !== id && n.parentId !== id));
    }
  };

  // Filtered nodes based on search term
  const filteredNodes = useMemo(() => {
    if (!searchTerm.trim()) return nodes;
    const lower = searchTerm.toLowerCase();
    return nodes.filter(
      (n) =>
        n.name.toLowerCase().includes(lower) ||
        n.code.toLowerCase().includes(lower) ||
        n.typeTag.toLowerCase().includes(lower)
    );
  }, [nodes, searchTerm]);

  // Organize floors, racks, and levels hierarchically
  const floorNodes = useMemo(() => {
    return filteredNodes.filter((n) => n.levelType === "floor");
  }, [filteredNodes]);

  const getRacksForFloor = (floorId: string) => {
    return filteredNodes.filter((n) => n.levelType === "rack" && n.parentId === floorId);
  };

  const getLevelsForRack = (rackId: string) => {
    return filteredNodes.filter((n) => n.levelType === "level" && n.parentId === rackId);
  };

  return (
    <div className="wh-struct-page">
      
      {/* ── HEADER CARD WITH SEPARATED TITLE & CONTROL TOOLBAR ── */}
      <div className="wh-struct-header">
        
        {/* Title & Description Row */}
        <div className="border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Structure Management</h1>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              Storage Layout
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Configure physical storage locations, floor layouts, racks, and shelf levels.</p>
        </div>

        {/* Dedicated Control Toolbar (Action Buttons + Search Bar) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Action Buttons Group */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleOpenAddModal("floor")}
              className="wh-struct-btn-primary"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Add Floor</span>
            </button>

            <button
              onClick={() => handleOpenAddModal("rack")}
              className="wh-struct-btn-secondary"
            >
              <span className="material-symbols-outlined text-[18px]">shelves</span>
              <span>Add Rack</span>
            </button>
          </div>

          {/* Search Bar Group (Explicit CSS Padding) */}
          <div className="wh-struct-search-wrapper">
            <span className="material-symbols-outlined wh-struct-search-icon">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search structure by code, name, type..."
              className="wh-struct-search-input"
            />
          </div>

        </div>
      </div>

      {/* ── STRUCTURE TREE DATA TABLE CARD ── */}
      <div className="wh-struct-card">
        
        {/* Table Header */}
        <div className="wh-struct-table-head">
          <div>STRUCTURE LEVEL</div>
          <div>ID / CODE</div>
          <div>LOCATION TYPE</div>
          <div className="text-right">MAX CAP</div>
          <div className="text-center">ACTIONS</div>
        </div>

        {/* Tree Rows */}
        <div>
          {floorNodes.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm font-semibold">
              No warehouse structures match your search criteria.
            </div>
          ) : (
            floorNodes.map((floor) => {
              const isFloorExpanded = !!expandedNodes[floor.id] || !!searchTerm;
              const childRacks = getRacksForFloor(floor.id);

              return (
                <React.Fragment key={floor.id}>
                  
                  {/* FLOOR ROW (LEVEL 1) */}
                  <div className="wh-struct-row bg-white">
                    <div className="wh-struct-node-title wh-struct-level-indent-1">
                      {childRacks.length > 0 ? (
                        <button
                          onClick={() => toggleExpand(floor.id)}
                          className="wh-struct-expand-btn"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {isFloorExpanded ? "expand_more" : "chevron_right"}
                          </span>
                        </button>
                      ) : (
                        <div className="w-6"></div>
                      )}
                      <span className="material-symbols-outlined text-blue-600 text-[22px]">domain</span>
                      <span className="font-bold text-slate-900 text-sm">{floor.name}</span>
                    </div>

                    <div>
                      <span className="wh-struct-code-badge">{floor.code}</span>
                    </div>

                    <div>
                      <span className="wh-struct-type-tag storage">{floor.typeTag}</span>
                    </div>

                    <div className="font-mono text-xs font-bold text-slate-600 text-right">
                      {floor.maxCap}
                    </div>

                    {/* Action Buttons with EDIT Pencil Icon */}
                    <div className="wh-struct-action-buttons">
                      <button
                        onClick={() => handleOpenAddModal("rack")}
                        title="Add Rack to Floor"
                        className="wh-struct-icon-btn"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(floor)}
                        title="Edit Floor"
                        className="wh-struct-icon-btn"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteNode(floor.id)}
                        title="Delete Floor"
                        className="wh-struct-icon-btn danger"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>

                  {/* RACK ROWS (CHILDREN OF FLOOR) */}
                  {isFloorExpanded &&
                    childRacks.map((rack) => {
                      const isRackExpanded = !!expandedNodes[rack.id] || !!searchTerm;
                      const childLevels = getLevelsForRack(rack.id);

                      return (
                        <React.Fragment key={rack.id}>
                          <div className="wh-struct-row bg-slate-50/60">
                            <div className="wh-struct-node-title wh-struct-level-indent-2">
                              {childLevels.length > 0 ? (
                                <button
                                  onClick={() => toggleExpand(rack.id)}
                                  className="wh-struct-expand-btn"
                                >
                                  <span className="material-symbols-outlined text-[18px]">
                                    {isRackExpanded ? "expand_more" : "chevron_right"}
                                  </span>
                                </button>
                              ) : (
                                <div className="w-6"></div>
                              )}
                              <span className="material-symbols-outlined text-slate-600 text-[20px]">shelves</span>
                              <span className="font-semibold text-slate-800 text-xs">{rack.name}</span>
                            </div>

                            <div>
                              <span className="wh-struct-code-badge">{rack.code}</span>
                            </div>

                            <div>
                              <span className="wh-struct-type-tag density">{rack.typeTag}</span>
                            </div>

                            <div className="font-mono text-xs font-bold text-slate-700 text-right">
                              {rack.maxCap}
                            </div>

                            {/* Action Buttons with EDIT Pencil Icon */}
                            <div className="wh-struct-action-buttons">
                              <button
                                onClick={() => handleOpenAddModal("level")}
                                title="Add Level to Rack"
                                className="wh-struct-icon-btn"
                              >
                                <span className="material-symbols-outlined text-[16px]">add</span>
                              </button>
                              <button
                                onClick={() => handleOpenEditModal(rack)}
                                title="Edit Rack"
                                className="wh-struct-icon-btn"
                              >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteNode(rack.id)}
                                title="Delete Rack"
                                className="wh-struct-icon-btn danger"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                              </button>
                            </div>
                          </div>

                          {/* LEVEL ROWS (CHILDREN OF RACK) */}
                          {isRackExpanded &&
                            childLevels.map((lvl) => (
                              <div key={lvl.id} className="wh-struct-row bg-white/90">
                                <div className="wh-struct-node-title wh-struct-level-indent-3">
                                  <div className="w-6 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-slate-300 text-[16px]">
                                      horizontal_rule
                                    </span>
                                  </div>
                                  <span className="material-symbols-outlined text-slate-400 text-[18px]">layers</span>
                                  <span className="font-medium text-slate-700 text-xs">{lvl.name}</span>
                                </div>

                                <div>
                                  <span className="wh-struct-code-badge">{lvl.code}</span>
                                </div>

                                <div>
                                  <span className="wh-struct-type-tag pallet">{lvl.typeTag}</span>
                                </div>

                                <div className="font-mono text-xs font-semibold text-slate-600 text-right">
                                  {lvl.maxCap}
                                </div>

                                {/* Action Buttons with EDIT Pencil Icon */}
                                <div className="wh-struct-action-buttons">
                                  <button
                                    onClick={() => handleOpenEditModal(lvl)}
                                    title="Edit Level"
                                    className="wh-struct-icon-btn"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteNode(lvl.id)}
                                    title="Delete Level"
                                    className="wh-struct-icon-btn danger"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                        </React.Fragment>
                      );
                    })}
                </React.Fragment>
              );
            })
          )}
        </div>

      </div>

      {/* ── MODAL: ADD STRUCTURE LOCATION ── */}
      {isAddModalOpen && (
        <div className="wh-struct-modal-overlay">
          <div className="wh-struct-modal">
            <div className="wh-struct-modal-header">
              <h3>Add New {addType.toUpperCase()}</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddStructure}>
              <div className="wh-struct-modal-body">
                
                {/* Parent Selection if Rack or Level */}
                {addType !== "floor" && (
                  <div className="wh-struct-field">
                    <label>PARENT {addType === "rack" ? "FLOOR" : "RACK"}</label>
                    <select
                      value={parentSelection}
                      onChange={(e) => setParentSelection(e.target.value)}
                      required
                    >
                      <option value="">-- Select Parent --</option>
                      {addType === "rack"
                        ? nodes
                            .filter((n) => n.levelType === "floor")
                            .map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.name} ({f.code})
                              </option>
                            ))
                        : nodes
                            .filter((n) => n.levelType === "rack")
                            .map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name} ({r.code})
                              </option>
                            ))}
                    </select>
                  </div>
                )}

                {/* Structure Code */}
                <div className="wh-struct-field">
                  <label>LOCATION CODE</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="e.g. FLR-03 or RACK-C"
                    required
                  />
                </div>

                {/* Structure Name */}
                <div className="wh-struct-field">
                  <label>LOCATION NAME</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Floor 3 or Rack C (High Bay)"
                    required
                  />
                </div>

                {/* Type Tag */}
                <div className="wh-struct-field">
                  <label>TYPE TAG</label>
                  <select value={newTag} onChange={(e) => setNewTag(e.target.value)}>
                    <option>Main Storage</option>
                    <option>High Density</option>
                    <option>Pallet Storage</option>
                    <option>Finished Goods</option>
                    <option>Cold Storage</option>
                  </select>
                </div>

                {/* Max Capacity */}
                <div className="wh-struct-field">
                  <label>MAX CAPACITY</label>
                  <input
                    type="text"
                    value={newCap}
                    onChange={(e) => setNewCap(e.target.value)}
                    placeholder="e.g. 10,000kg or --"
                  />
                </div>

              </div>

              <div className="wh-struct-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="wh-struct-btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="wh-struct-btn-primary">
                  Save Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT STRUCTURE LOCATION ── */}
      {isEditModalOpen && (
        <div className="wh-struct-modal-overlay">
          <div className="wh-struct-modal">
            <div className="wh-struct-modal-header">
              <h3>Edit {addType.toUpperCase()} Details</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateStructure}>
              <div className="wh-struct-modal-body">
                
                {/* Parent Selection if Rack or Level */}
                {addType !== "floor" && (
                  <div className="wh-struct-field">
                    <label>PARENT {addType === "rack" ? "FLOOR" : "RACK"}</label>
                    <select
                      value={parentSelection}
                      onChange={(e) => setParentSelection(e.target.value)}
                      required
                    >
                      <option value="">-- Select Parent --</option>
                      {addType === "rack"
                        ? nodes
                            .filter((n) => n.levelType === "floor")
                            .map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.name} ({f.code})
                              </option>
                            ))
                        : nodes
                            .filter((n) => n.levelType === "rack")
                            .map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name} ({r.code})
                              </option>
                            ))}
                    </select>
                  </div>
                )}

                {/* Structure Code */}
                <div className="wh-struct-field">
                  <label>LOCATION CODE</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    required
                  />
                </div>

                {/* Structure Name */}
                <div className="wh-struct-field">
                  <label>LOCATION NAME</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>

                {/* Type Tag */}
                <div className="wh-struct-field">
                  <label>TYPE TAG</label>
                  <select value={newTag} onChange={(e) => setNewTag(e.target.value)}>
                    <option>Main Storage</option>
                    <option>High Density</option>
                    <option>Pallet Storage</option>
                    <option>Finished Goods</option>
                    <option>Cold Storage</option>
                  </select>
                </div>

                {/* Max Capacity */}
                <div className="wh-struct-field">
                  <label>MAX CAPACITY</label>
                  <input
                    type="text"
                    value={newCap}
                    onChange={(e) => setNewCap(e.target.value)}
                  />
                </div>

              </div>

              <div className="wh-struct-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="wh-struct-btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="wh-struct-btn-primary">
                  Update Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
