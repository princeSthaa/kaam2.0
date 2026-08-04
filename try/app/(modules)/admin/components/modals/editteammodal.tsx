"use client";

import React, { useState, useEffect } from "react";

export interface TeamMember {
  id: string;
  name: string;
  employeeId: string;
  role: "Lead" | "Operator" | "Technician" | "Inspector";
  certification: string;
  avatar: string;
}

export interface TeamItem {
  id: string;
  name: string;
  status: "ACTIVE" | "STANDBY" | "UNDER REVIEW";
  primaryStage: string;
  primaryStageIcon: string;
  currentBatch: string;
  efficiency: number;
  specializations: string[];
  assignedCount: number;
  members: TeamMember[];
  selectedStage: string;
  outputTrend: number[];
  qualityRate: number;
}

interface EditTeamModalProps {
  isOpen: boolean;
  team: TeamItem | null;
  onClose: () => void;
  onSave: (updatedTeam: TeamItem) => void;
  onDuplicate?: (teamToDuplicate: TeamItem) => void;
  onDeactivate?: (teamId: string) => void;
  onManageRoster?: (team: TeamItem) => void;
}

const AVAILABLE_STAGES = [
  { id: "Cutting", name: "Cutting", icon: "content_cut" },
  { id: "Printing", name: "Printing", icon: "print" },
  { id: "Sewing", name: "Sewing", icon: "styler" },
  { id: "Washing", name: "Washing", icon: "local_laundry_service" },
  { id: "QC Inspection", name: "QC Inspection", icon: "verified" },
  { id: "Packaging", name: "Packaging", icon: "inventory_2" },
];

export function EditTeamModal({
  isOpen,
  team,
  onClose,
  onSave,
  onDuplicate,
  onDeactivate,
  onManageRoster,
}: EditTeamModalProps) {
  const [viewMode, setViewMode] = useState<"MENU" | "FORM">("MENU");
  const [formData, setFormData] = useState<TeamItem | null>(null);

  useEffect(() => {
    if (team) {
      setFormData({ ...team });
      setViewMode("MENU");
    }
  }, [team, isOpen]);

  if (!isOpen || !formData) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stageIcon = AVAILABLE_STAGES.find((s) => s.name === formData.primaryStage)?.icon || "groups";
    onSave({
      ...formData,
      primaryStageIcon: stageIcon,
      selectedStage: formData.primaryStage,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      {/* Stitch Design: Team Action Menu Modal */}
      {viewMode === "MENU" ? (
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden flex flex-col animate-fadeIn text-slate-900">
          {/* Modal Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-start bg-slate-50/70">
            <div>
              <h2 className="font-bold text-sm text-slate-900">{formData.name} Actions</h2>
              <p className="text-xs text-slate-500 mt-0.5">Primary Stage: {formData.primaryStage}</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-900 transition-colors p-1"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Action List */}
          <div className="flex flex-col py-2">
            {/* Action Item: Edit Details */}
            <button
              onClick={() => setViewMode("FORM")}
              className="flex items-center px-5 py-3 hover:bg-slate-50 transition-colors w-full text-left group"
            >
              <span className="material-symbols-outlined text-slate-400 group-hover:text-slate-900 mr-3 text-lg">
                edit
              </span>
              <span className="text-xs font-semibold text-slate-900">Edit Team Details</span>
            </button>

            {/* Action Item: Manage Roster */}
            <button
              onClick={() => {
                if (onManageRoster) onManageRoster(formData);
                onClose();
              }}
              className="flex items-center px-5 py-3 hover:bg-slate-50 transition-colors w-full text-left group"
            >
              <span className="material-symbols-outlined text-slate-400 group-hover:text-slate-900 mr-3 text-lg">
                groups
              </span>
              <span className="text-xs font-semibold text-slate-900">Manage Team Roster</span>
            </button>

            {/* Action Item: Performance History */}
            <button
              onClick={() => {
                alert(`Viewing output history for ${formData.name}. Quality Rate: ${formData.qualityRate}%`);
              }}
              className="flex items-center px-5 py-3 hover:bg-slate-50 transition-colors w-full text-left group"
            >
              <span className="material-symbols-outlined text-slate-400 group-hover:text-slate-900 mr-3 text-lg">
                monitoring
              </span>
              <span className="text-xs font-semibold text-slate-900">View Performance History</span>
            </button>

            {/* Action Item: Duplicate */}
            <button
              onClick={() => {
                if (onDuplicate) onDuplicate(formData);
                onClose();
              }}
              className="flex items-center px-5 py-3 hover:bg-slate-50 transition-colors w-full text-left group"
            >
              <span className="material-symbols-outlined text-slate-400 group-hover:text-slate-900 mr-3 text-lg">
                content_copy
              </span>
              <span className="text-xs font-semibold text-slate-900">Duplicate Configuration</span>
            </button>

            <div className="h-px bg-slate-100 my-1 mx-5"></div>

            {/* Action Item: Deactivate (Destructive) */}
            <button
              onClick={() => {
                if (onDeactivate) onDeactivate(formData.id);
                onClose();
              }}
              className="flex items-center px-5 py-3 hover:bg-red-50 transition-colors w-full text-left group mt-1"
            >
              <span className="material-symbols-outlined text-red-600 mr-3 text-lg">block</span>
              <span className="text-xs font-semibold text-red-600">Deactivate Team</span>
            </button>
          </div>

          {/* Footer Info */}
          <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between font-mono text-[11px]">
            <span className="text-slate-500 uppercase font-bold">ID: {formData.id.toUpperCase()}</span>
            <span
              className={`font-bold ${
                formData.status === "ACTIVE"
                  ? "text-emerald-700"
                  : formData.status === "UNDER REVIEW"
                  ? "text-amber-700"
                  : "text-slate-500"
              }`}
            >
              {formData.status}
            </span>
          </div>
        </div>
      ) : (
        /* Edit Details Form Modal */
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-5 text-slate-900 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("MENU")}
                className="text-slate-400 hover:text-slate-900 transition-colors"
                title="Back to action menu"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
              </button>
              <h3 className="font-bold text-slate-900 text-base">Edit {formData.name}</h3>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-900">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Team Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-slate-900 focus:outline-none"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="UNDER REVIEW">UNDER REVIEW</option>
                  <option value="STANDBY">STANDBY</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Primary Stage</label>
                <select
                  value={formData.primaryStage}
                  onChange={(e) => setFormData({ ...formData, primaryStage: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-slate-900 focus:outline-none"
                >
                  {AVAILABLE_STAGES.map((stg) => (
                    <option key={stg.id} value={stg.name}>
                      {stg.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Current Batch</label>
                <input
                  type="text"
                  value={formData.currentBatch}
                  onChange={(e) => setFormData({ ...formData, currentBatch: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Target Efficiency (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.efficiency}
                  onChange={(e) => setFormData({ ...formData, efficiency: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode("MENU")}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 text-white font-bold rounded-lg shadow hover:bg-slate-800 active:scale-95"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default EditTeamModal;
