"use client";

import React, { useState, useEffect } from "react";
import { createRole, updateRole, RoleDto, PageDto } from "../../api/constant";
import { useRbac } from "@/app/lib/useRbac";

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (role: RoleDto) => void;
  initialData?: RoleDto | null;
  pages?: PageDto[];
}

export function CreateRoleModal({ isOpen, onClose, onSaved, initialData, pages = [] }: CreateRoleModalProps) {
  const { currentUser } = useRbac();
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [modulePageId, setModulePageId] = useState("");
  const [isModuleAdmin, setIsModuleAdmin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isEdit = !!initialData?.id;
  const modulePages = pages.filter((page) => {
    const route = page.route?.replace(/\/$/, "") || "";
    return route !== "/" && route !== "/admin" && route.split("/").filter(Boolean).length === 1;
  });

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      setRoleName(initialData.roleName || initialData.name || "");
      setDescription(initialData.description || "");
      setModulePageId(initialData.modulePageId || currentUser?.modulePageId || "");
      setIsModuleAdmin(initialData.isModuleAdmin ?? false);
    } else {
      setRoleName("");
      setDescription("");
      setModulePageId(currentUser?.modulePageId || modulePages[0]?.id || "");
      setIsModuleAdmin(false);
    }
    setErrorMsg(null);
  }, [isOpen, initialData]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  const handleClose = () => {
    if (isSubmitting) return;
    setRoleName("");
    setDescription("");
    setModulePageId("");
    setIsModuleAdmin(false);
    setErrorMsg(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      setErrorMsg("Role Name is required.");
      return;
    }
    if (!modulePageId) {
      setErrorMsg("A module is required for this role.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (isEdit && initialData?.id) {
        await updateRole(initialData.id, {
          roleName: roleName.trim(),
          description: description.trim(),
          modulePageId,
          isModuleAdmin: currentUser?.isSuperAdmin ? isModuleAdmin : false,
        });
        if (onSaved) {
          onSaved({
            ...initialData,
            roleName: roleName.trim(),
            description: description.trim(),
            modulePageId,
            isModuleAdmin: currentUser?.isSuperAdmin ? isModuleAdmin : false,
            updatedAt: new Date().toISOString(),
          });
        }
      } else {
        const created = await createRole({
          roleName: roleName.trim(),
          description: description.trim(),
          modulePageId,
          isModuleAdmin: currentUser?.isSuperAdmin ? isModuleAdmin : false,
        });
        if (onSaved) {
          onSaved(created);
        }
      }
      handleClose();
    } catch (err: any) {
      console.error("Save role failed:", err);
      setErrorMsg(err instanceof Error ? err.message : "Could not save the role.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden text-slate-900 transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-lg">security</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">
                {isEdit ? "Edit Role" : "Create New Role"}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                {isEdit ? "Update role details and permissions" : "Define a new access role"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-start gap-2 text-xs font-medium">
              <span className="material-symbols-outlined text-rose-600 text-base shrink-0">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Role Name */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 text-[11px] uppercase tracking-wider font-mono">
              Role Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-slate-900 focus:bg-white focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 text-[11px] uppercase tracking-wider font-mono">
              Description
            </label>
            <div className="relative">
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-slate-900 focus:bg-white focus:outline-none transition-all resize-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 text-[11px] uppercase tracking-wider font-mono">
              Module <span className="text-rose-500">*</span>
            </label>
            {currentUser?.isSuperAdmin ? (
              <select
                required
                value={modulePageId}
                onChange={(event) => setModulePageId(event.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-slate-900 focus:outline-none"
              >
                <option value="">Select module</option>
                {modulePages.map((page) => <option key={page.id} value={page.id}>{page.name}</option>)}
              </select>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-bold text-slate-700">
                {currentUser?.moduleName || "Assigned module"}
              </div>
            )}
          </div>

          {currentUser?.isSuperAdmin && (
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 font-bold text-slate-700">
              <input type="checkbox" checked={isModuleAdmin} onChange={(event) => setIsModuleAdmin(event.target.checked)} />
              Module administrator
            </label>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-slate-600 font-bold text-xs hover:bg-slate-100 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                  <span>Saving Role...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">
                    {isEdit ? "check" : "add"}
                  </span>
                  <span>{isEdit ? "Update Role" : "Create Role"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateRoleModal;
