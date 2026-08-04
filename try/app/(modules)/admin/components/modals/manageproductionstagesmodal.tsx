"use client";

import React, { useState } from "react";

export interface ProductionStageItem {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  defaultDurationMinutes: number;
}

const INITIAL_STAGES: ProductionStageItem[] = [
  {
    id: "1",
    code: "STG-001",
    name: "Cutting",
    description: "Precision fabric cutting based on graded markers and patterns.",
    icon: "content_cut",
    isActive: true,
    defaultDurationMinutes: 20,
  },
  {
    id: "2",
    code: "STG-042",
    name: "Laser Detailing",
    description: "High-precision laser etching for denim fading and distress patterns.",
    icon: "lens_blur",
    isActive: true,
    defaultDurationMinutes: 15,
  },
  {
    id: "3",
    code: "STG-002",
    name: "Stitching",
    description: "Assembly of cut panels into finished garments using sewing lines.",
    icon: "precision_manufacturing",
    isActive: true,
    defaultDurationMinutes: 45,
  },
  {
    id: "4",
    code: "STG-088",
    name: "Chemical Wash",
    description: "Enzyme and bleach treatments for softening and color reduction.",
    icon: "science",
    isActive: false,
    defaultDurationMinutes: 30,
  },
  {
    id: "5",
    code: "STG-015",
    name: "Button Hole & Hardware",
    description: "Specialized machine operation for cutting buttonholes and applying rivets.",
    icon: "radio_button_checked",
    isActive: true,
    defaultDurationMinutes: 10,
  },
  {
    id: "6",
    code: "STG-008",
    name: "Ironing & Pressing",
    description: "Final steam pressing and form shaping before audit inspection.",
    icon: "iron",
    isActive: true,
    defaultDurationMinutes: 12,
  },
  {
    id: "7",
    code: "STG-010",
    name: "Quality Control (QC)",
    description: "AQL 2.5 defect inspection and measurement compliance verification.",
    icon: "verified",
    isActive: true,
    defaultDurationMinutes: 10,
  },
  {
    id: "8",
    code: "STG-012",
    name: "Packaging & Tagging",
    description: "Hangtag attachment, folding, polybagging, and master carton packing.",
    icon: "inventory_2",
    isActive: true,
    defaultDurationMinutes: 8,
  },
];

const AVAILABLE_ICONS = [
  "content_cut",
  "precision_manufacturing",
  "lens_blur",
  "science",
  "radio_button_checked",
  "iron",
  "verified",
  "inventory_2",
  "style",
  "palette",
  "dry_cleaning",
  "checklist",
];

interface ManageProductionStagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateStages?: (stages: ProductionStageItem[]) => void;
}

export function ManageProductionStagesModal({
  isOpen,
  onClose,
  onUpdateStages,
}: ManageProductionStagesModalProps) {
  const [stages, setStages] = useState<ProductionStageItem[]>(INITIAL_STAGES);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // New/Edit Stage Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [stageName, setStageName] = useState("");
  const [stageCode, setStageCode] = useState("");
  const [stageDesc, setStageDesc] = useState("");
  const [stageIcon, setStageIcon] = useState("content_cut");
  const [stageDuration, setStageDuration] = useState<number>(30);

  if (!isOpen) return null;

  const filteredStages = stages.filter((stage) => {
    const matchesSearch =
      stage.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stage.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stage.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL"
        ? true
        : statusFilter === "ACTIVE"
          ? stage.isActive
          : !stage.isActive;

    return matchesSearch && matchesStatus;
  });

  const handleToggleStageStatus = (id: string) => {
    const updated = stages.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s));
    setStages(updated);
    if (onUpdateStages) onUpdateStages(updated);
  };

  const handleDeleteStage = (id: string) => {
    const updated = stages.filter((s) => s.id !== id);
    setStages(updated);
    if (onUpdateStages) onUpdateStages(updated);
  };

  const handleOpenAddForm = () => {
    setEditingStageId(null);
    setStageName("");
    setStageCode(`STG-0${stages.length + 10}`);
    setStageDesc("");
    setStageIcon("content_cut");
    setStageDuration(25);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (stage: ProductionStageItem) => {
    setEditingStageId(stage.id);
    setStageName(stage.name);
    setStageCode(stage.code);
    setStageDesc(stage.description);
    setStageIcon(stage.icon);
    setStageDuration(stage.defaultDurationMinutes);
    setIsFormOpen(true);
  };

  const handleSaveStageForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stageName.trim()) return;

    if (editingStageId) {
      // Edit existing
      const updated = stages.map((s) =>
        s.id === editingStageId
          ? {
            ...s,
            name: stageName,
            code: stageCode,
            description: stageDesc,
            icon: stageIcon,
            defaultDurationMinutes: stageDuration,
          }
          : s
      );
      setStages(updated);
      if (onUpdateStages) onUpdateStages(updated);
    } else {
      // Create new stage
      const newStageItem: ProductionStageItem = {
        id: Date.now().toString(),
        code: stageCode.toUpperCase() || `STG-${Date.now().toString().slice(-3)}`,
        name: stageName,
        description: stageDesc || "Custom production process stage.",
        icon: stageIcon,
        isActive: true,
        defaultDurationMinutes: stageDuration || 30,
      };
      const updated = [newStageItem, ...stages];
      setStages(updated);
      if (onUpdateStages) onUpdateStages(updated);
    }

    setIsFormOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900 my-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-900">account_tree</span>
              Manage Production Stages
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure global manufacturing processes and stage workflows for garment production.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleOpenAddForm}
              className="px-3.5 py-2 bg-slate-900 text-white rounded-lg font-mono text-xs font-bold hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              Add New Stage
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-900"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
              search
            </span>
            <input
              type="text"
              placeholder="Search stages by name, code, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label className="font-mono text-[11px] font-bold text-slate-500 uppercase">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-xs text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses ({stages.length})</option>
              <option value="ACTIVE">Active ({stages.filter((s) => s.isActive).length})</option>
              <option value="INACTIVE">Inactive ({stages.filter((s) => !s.isActive).length})</option>
            </select>
          </div>
        </div>

        {/* Modal Body / Table View */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-4">
          {/* Inline Add/Edit Stage Drawer/Card */}
          {isFormOpen && (
            <form
              onSubmit={handleSaveStageForm}
              className="bg-white p-5 rounded-xl border-2 border-slate-900 shadow-md space-y-4 animate-in fade-in duration-200"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-900 text-base">
                    {editingStageId ? "edit" : "add_task"}
                  </span>
                  {editingStageId ? "Edit Production Stage" : "Create New Production Stage"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-slate-400 hover:text-slate-900"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="font-semibold text-slate-700 text-xs">Stage Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Embroidery & Patchwork"
                    value={stageName}
                    onChange={(e) => setStageName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="font-semibold text-slate-700 text-xs">Stage Code</label>
                  <input
                    type="text"
                    placeholder="e.g. STG-099"
                    value={stageCode}
                    onChange={(e) => setStageCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none uppercase"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="font-semibold text-slate-700 text-xs">Stage Icon</label>
                  <select
                    value={stageIcon}
                    onChange={(e) => setStageIcon(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none cursor-pointer"
                  >
                    {AVAILABLE_ICONS.map((iconName) => (
                      <option key={iconName} value={iconName}>
                        {iconName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col space-y-1 md:col-span-2">
                  <label className="font-semibold text-slate-700 text-xs">Description</label>
                  <input
                    type="text"
                    placeholder="Brief summary of stage operations..."
                    value={stageDesc}
                    onChange={(e) => setStageDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="font-semibold text-slate-700 text-xs">Std Duration (mins)</label>
                  <input
                    type="number"
                    min={1}
                    value={stageDuration}
                    onChange={(e) => setStageDuration(parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-3 py-1.5 font-mono text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-mono text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 shadow"
                >
                  {editingStageId ? "Update Stage" : "Save New Stage"}
                </button>
              </div>
            </form>
          )}

          {/* Stages Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-100/70 border-b border-slate-200 font-mono text-[10px] font-bold text-slate-500 uppercase">
                <tr>
                  <th className="py-3 px-4 w-14 text-center">Icon</th>
                  <th className="py-3 px-4 w-44">Stage Name</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 w-28 text-center">Std Time</th>
                  <th className="py-3 px-4 w-28 text-center">Status</th>
                  <th className="py-3 px-4 w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredStages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-mono">
                      No production stages match your search query.
                    </td>
                  </tr>
                ) : (
                  filteredStages.map((stage) => (
                    <tr
                      key={stage.id}
                      className={`hover:bg-slate-50/80 transition-colors ${!stage.isActive ? "opacity-60 bg-slate-50/40" : ""
                        }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center mx-auto">
                          <span className="material-symbols-outlined text-lg">{stage.icon}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{stage.name}</div>
                        <div className="font-mono text-[10px] text-slate-400 font-semibold">{stage.code}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{stage.description}</td>
                      <td className="py-3 px-4 text-center font-mono text-xs font-semibold text-slate-700">
                        {stage.defaultDurationMinutes} mins
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStageStatus(stage.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition-all flex items-center justify-center gap-1 mx-auto ${stage.isActive
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                            }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${stage.isActive ? "bg-emerald-600" : "bg-slate-500"
                              }`}
                          ></span>
                          {stage.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditForm(stage)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Stage"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteStage(stage.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Stage"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-xs">
          <span className="font-mono text-slate-500 text-[11px]">
            Total Manufacturing Stages: <strong className="text-slate-900">{stages.length}</strong> ({stages.filter((s) => s.isActive).length} active)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-mono font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManageProductionStagesModal;
