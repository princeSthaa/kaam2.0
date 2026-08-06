"use client";

import React, { useState, useEffect } from "react";
import {
  fetchProductionStages,
  createProductionStage,
  updateProductionStage,
  deleteProductionStage,
  ProductionStageDto,
} from "../../api/productionstage.api";

export interface ProductionStageItem {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  defaultDurationMinutes: number;
}

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
  const [stages, setStages] = useState<ProductionStageItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // New/Edit Stage Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [stageName, setStageName] = useState("");
  const [stageDesc, setStageDesc] = useState("");
  const [stageIcon, setStageIcon] = useState("content_cut");
  const [stageDuration, setStageDuration] = useState<number>(30);

  const loadStages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchProductionStages();
      const mapped: ProductionStageItem[] = data.map((item, index) => ({
        id: item.id || String(index + 1),
        code: item.productionStageCode || `STG-${String(index + 1).padStart(3, "0")}`,
        name: item.name,
        description: item.description || "",
        icon: AVAILABLE_ICONS[index % AVAILABLE_ICONS.length] || "content_cut",
        isActive: item.isActive ?? true,
        defaultDurationMinutes: parseInt(item.duration || "0") || 30,
      }));
      setStages(mapped);
      if (onUpdateStages) onUpdateStages(mapped);
    } catch (err: any) {
      console.error("Failed to load production stages from API:", err);
      setError(err.message || "Failed to load stages");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStages();
    }
  }, [isOpen]);

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

  const handleToggleStageStatus = async (stage: ProductionStageItem) => {
    try {
      await updateProductionStage(stage.id, {
        name: stage.name,
        description: stage.description,
        duration: String(stage.defaultDurationMinutes),
        isActive: !stage.isActive,
      });
      await loadStages();
    } catch (err: any) {
      console.error("Failed to toggle stage status:", err);
      setError(err.message || "Failed to toggle status");
    }
  };

  const handleDeleteStage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this production stage?")) return;
    try {
      await deleteProductionStage(id);
      await loadStages();
    } catch (err: any) {
      console.error("Failed to delete production stage:", err);
      setError(err.message || "Failed to delete stage");
    }
  };

  const handleOpenAddForm = () => {
    setEditingStageId(null);
    setStageName("");
    setStageDesc("");
    setStageIcon("content_cut");
    setStageDuration(25);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (stage: ProductionStageItem) => {
    setEditingStageId(stage.id);
    setStageName(stage.name);
    setStageDesc(stage.description);
    setStageIcon(stage.icon);
    setStageDuration(stage.defaultDurationMinutes);
    setIsFormOpen(true);
  };

  const handleSaveStageForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stageName.trim()) return;

    try {
      setIsSaving(true);
      setError(null);

      if (editingStageId) {
        const existingStage = stages.find((s) => s.id === editingStageId);
        await updateProductionStage(editingStageId, {
          name: stageName,
          description: stageDesc,
          duration: String(stageDuration),
          isActive: existingStage ? existingStage.isActive : true,
        });
      } else {
        await createProductionStage({
          name: stageName,
          description: stageDesc,
          duration: String(stageDuration),
          isActive: true,
        });
      }

      setIsFormOpen(false);
      await loadStages();
    } catch (err: any) {
      console.error("Failed to save production stage:", err);
      setError(err.message || "Failed to save stage");
    } finally {
      setIsSaving(false);
    }
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

        {/* Error Banner */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-800 font-bold text-sm"
            >
              ×
            </button>
          </div>
        )}

        {/* Modal Body / Table View */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-4">
          {/* Inline Add/Edit Stage Form Card */}
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

                <div className="flex flex-col space-y-1 md:col-span-3">
                  <label className="font-semibold text-slate-700 text-xs">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Brief summary of stage operations..."
                    value={stageDesc}
                    onChange={(e) => setStageDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none resize-y min-h-[70px]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  disabled={isSaving}
                  className="px-3 py-1.5 font-mono text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 font-mono text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 shadow disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSaving && (
                    <span className="material-symbols-outlined text-sm animate-spin">
                      progress_activity
                    </span>
                  )}
                  {editingStageId ? "Update Stage" : "Save New Stage"}
                </button>
              </div>
            </form>
          )}

          {/* Stages Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500 font-mono text-xs flex items-center justify-center gap-2">
                <span className="material-symbols-outlined animate-spin text-lg">
                  progress_activity
                </span>
                Loading production stages...
              </div>
            ) : (
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
                        className={`hover:bg-slate-50/80 transition-colors ${
                          !stage.isActive ? "opacity-60 bg-slate-50/40" : ""
                        }`}
                      >
                        <td className="py-3 px-4 text-center">
                          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center mx-auto">
                            <span className="material-symbols-outlined text-lg">{stage.icon}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{stage.name}</div>
                          <div className="font-mono text-[10px] text-slate-400 font-semibold">
                            {stage.code}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                          {stage.description}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-xs font-semibold text-slate-700">
                          {stage.defaultDurationMinutes} mins
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span
                              className={`font-mono text-[11px] font-bold ${
                                stage.isActive ? "text-emerald-700" : "text-slate-400"
                              }`}
                            >
                              {stage.isActive ? "Active" : "Inactive"}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleStageStatus(stage)}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                stage.isActive ? "bg-emerald-600" : "bg-slate-300"
                              }`}
                              title={`Toggle ${stage.isActive ? "Inactive" : "Active"}`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  stage.isActive ? "translate-x-4" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>
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
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-xs">
          <span className="font-mono text-slate-500 text-[11px]">
            Total Manufacturing Stages: <strong className="text-slate-900">{stages.length}</strong> (
            {stages.filter((s) => s.isActive).length} active)
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
