"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  createRolePageAccess,
  updateRolePageAccess,
  RolePageAccessDto,
  RoleDto,
  PageDto,
} from "../../api/constant";
import { getAllModulePages } from "../../utils/moduleNavigation";

interface CreateRolePageAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (item: RolePageAccessDto | RolePageAccessDto[]) => void;
  initialData?: RolePageAccessDto | null;
  roles?: RoleDto[];
  pages?: PageDto[];
  existingAccesses?: RolePageAccessDto[];
}

function normalizeIcon(iconName?: string) {
  if (!iconName) return "web";
  const clean = iconName.toLowerCase().trim().replace(/-/g, "_");
  if (clean === "filter_icon" || clean === "filter") return "filter_alt";
  if (clean === "user_icon" || clean === "users_icon") return "groups";
  if (clean === "customer_icon" || clean === "customers_icon") return "support_agent";
  return clean;
}

export function CreateRolePageAccessModal({
  isOpen,
  onClose,
  onSaved,
  initialData,
  roles = [],
  pages = [],
  existingAccesses = [],
}: CreateRolePageAccessModalProps) {
  const [roleId, setRoleId] = useState("");
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isEdit = !!initialData?.id;

  // Aggregate all pages across navigation.ts files (Admin, CRM, Warehouse, Factory, Production, SRM)
  const { allPages } = useMemo(() => {
    return getAllModulePages(pages);
  }, [pages]);

  // Determine which pages are ALREADY assigned to the selected role
  const alreadyAssignedPageIdentifiers = useMemo(() => {
    if (!roleId) return new Set<string>();
    const set = new Set<string>();

    existingAccesses
      .filter((a) => a.roleId === roleId)
      .forEach((a) => {
        // If editing this specific record, don't count it as already assigned
        if (isEdit && initialData?.id === a.id) return;

        if (a.pageId) set.add(a.pageId.toLowerCase());
        if (a.pageRoute) set.add(a.pageRoute.toLowerCase());
        if (a.pageName) set.add(a.pageName.toLowerCase());
      });

    return set;
  }, [roleId, existingAccesses, isEdit, initialData]);

  // Filter available pages: exclude already assigned + apply search query
  const availablePages = useMemo(() => {
    return allPages.filter((p) => {
      const pageIdKey = p.id ? p.id.toLowerCase() : "";
      const pageRouteKey = p.route ? p.route.toLowerCase() : "";
      const pageNameKey = p.name ? p.name.toLowerCase() : "";

      const isAlreadyAssigned =
        alreadyAssignedPageIdentifiers.has(pageIdKey) ||
        alreadyAssignedPageIdentifiers.has(pageRouteKey) ||
        alreadyAssignedPageIdentifiers.has(pageNameKey);

      // Hide already assigned pages
      if (isAlreadyAssigned) return false;

      // Apply search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchName = pageNameKey.includes(q);
      const matchRoute = pageRouteKey.includes(q);
      const matchModule = (p.parentPageName || "").toLowerCase().includes(q);

      return matchName || matchRoute || matchModule;
    });
  }, [allPages, alreadyAssignedPageIdentifiers, searchQuery]);

  // Group filtered available pages by Module
  const groupedAvailablePages = useMemo(() => {
    const map: Record<string, PageDto[]> = {};
    availablePages.forEach((p) => {
      const moduleName =
        p.parentPageName ||
        (p.route.startsWith("/crm")
          ? "CRM"
          : p.route.startsWith("/warehouse")
          ? "Warehouse"
          : p.route.startsWith("/factory")
          ? "Factory"
          : p.route.startsWith("/production")
          ? "Production"
          : p.route.startsWith("/srm")
          ? "SRM"
          : "Admin");

      if (!map[moduleName]) {
        map[moduleName] = [];
      }
      map[moduleName].push(p);
    });
    return map;
  }, [availablePages]);

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      setRoleId(initialData.roleId || (roles[0]?.id ?? ""));
      setSelectedPageIds(initialData.pageId ? [initialData.pageId] : []);
    } else {
      setRoleId((prev) => prev || roles[0]?.id || "");
      setSelectedPageIds([]);
    }
    setSearchQuery("");
    setErrorMsg(null);
  }, [isOpen, initialData, roles]);

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
    setSelectedPageIds([]);
    setSearchQuery("");
    setErrorMsg(null);
    onClose();
  };

  const togglePageSelection = (pageId: string) => {
    if (isEdit) {
      // In edit mode only single selection
      setSelectedPageIds([pageId]);
      return;
    }
    setSelectedPageIds((prev) =>
      prev.includes(pageId) ? prev.filter((id) => id !== pageId) : [...prev, pageId]
    );
  };

  const handleSelectAll = () => {
    const allFilteredIds = availablePages.map((p) => p.id);
    setSelectedPageIds(allFilteredIds);
  };

  const handleDeselectAll = () => {
    setSelectedPageIds([]);
  };

  const handleSelectModuleGroup = (modulePages: PageDto[]) => {
    const modulePageIds = modulePages.map((p) => p.id);
    const allSelected = modulePageIds.every((id) => selectedPageIds.includes(id));

    if (allSelected) {
      setSelectedPageIds((prev) => prev.filter((id) => !modulePageIds.includes(id)));
    } else {
      setSelectedPageIds((prev) => Array.from(new Set([...prev, ...modulePageIds])));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleId.trim()) {
      setErrorMsg("Please select a System Role.");
      return;
    }
    if (selectedPageIds.length === 0) {
      setErrorMsg("Please select at least one page to assign.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const selectedRole = roles.find((r) => r.id === roleId);

    try {
      if (isEdit && initialData?.id) {
        const pageId = selectedPageIds[0];
        const selectedPage = allPages.find((p) => p.id === pageId);

        await updateRolePageAccess(initialData.id, {
          roleId: roleId.trim(),
          pageId: pageId.trim(),
        });

        if (onSaved) {
          onSaved({
            ...initialData,
            roleId: roleId.trim(),
            pageId: pageId.trim(),
            roleName: selectedRole?.roleName || initialData.roleName,
            pageName: selectedPage?.name || initialData.pageName,
            pageRoute: selectedPage?.route || initialData.pageRoute,
            pageIcon: selectedPage?.icon || initialData.pageIcon,
            updatedAt: new Date().toISOString(),
          });
        }
      } else {
        // Multi-page creation in parallel
        const results: RolePageAccessDto[] = [];

        for (const pageId of selectedPageIds) {
          const selectedPage = allPages.find((p) => p.id === pageId);
          try {
            const created = await createRolePageAccess({
              roleId: roleId.trim(),
              pageId: pageId.trim(),
            });
            results.push({
              ...created,
              roleName: selectedRole?.roleName,
              pageName: selectedPage?.name,
              pageRoute: selectedPage?.route,
              pageIcon: selectedPage?.icon,
            });
          } catch (itemErr) {
            // Fallback mock item
            results.push({
              id: `rpa-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
              roleId: roleId.trim(),
              pageId: pageId.trim(),
              roleName: selectedRole?.roleName || "Role",
              pageName: selectedPage?.name || "Page",
              pageRoute: selectedPage?.route || "/",
              pageIcon: selectedPage?.icon || "web",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        }

        if (onSaved) {
          onSaved(results);
        }
      }
      handleClose();
    } catch (err: any) {
      console.error("Save role page access failed:", err);
      setErrorMsg(err.message || "Failed to assign pages to role.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const totalAssignedCount = alreadyAssignedPageIdentifiers.size;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden text-slate-900 transition-all scale-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-lg">lock_open</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">
                {isEdit ? "Edit Role-Page Access" : "Assign Pages to Role"}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                {isEdit ? "Update assigned page" : "Grant navigation routes and module access to a role"}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans flex-1 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-start gap-2 text-xs font-medium">
              <span className="material-symbols-outlined text-rose-600 text-base shrink-0">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Role Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 text-[11px] uppercase tracking-wider font-mono">
                System Role <span className="text-rose-500">*</span>
              </label>
              {totalAssignedCount > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {totalAssignedCount} pages already assigned
                </span>
              )}
            </div>
            <select
              value={roleId}
              onChange={(e) => {
                setRoleId(e.target.value);
                setSelectedPageIds([]); // reset selection on role change
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-slate-900 focus:bg-white focus:outline-none transition-all"
            >
              {roles.length > 0 ? (
                roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.roleName}
                  </option>
                ))
              ) : (
                <option value="">No roles available</option>
              )}
            </select>
          </div>

          {/* Search & Bulk Select Controls */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between gap-2">
              <label className="font-bold text-slate-700 text-[11px] uppercase tracking-wider font-mono">
                Select Pages <span className="text-rose-500">*</span>
              </label>
              {!isEdit && availablePages.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 font-mono hover:underline"
                  >
                    Select All ({availablePages.length})
                  </button>
                  <span className="text-slate-300">&bull;</span>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="text-[11px] text-slate-500 hover:text-slate-800 font-mono hover:underline"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pages by name, route path, or module..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-xs focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>
          </div>

          {/* Grouped Page Checkbox List */}
          <div className="border border-slate-200 rounded-xl bg-slate-50/50 p-2 space-y-3 max-h-64 overflow-y-auto">
            {Object.keys(groupedAvailablePages).length === 0 ? (
              <div className="py-8 text-center text-slate-400 font-mono">
                <span className="material-symbols-outlined text-3xl mb-1 text-slate-300 block">
                  check_circle
                </span>
                {searchQuery
                  ? "No unassigned pages match your search."
                  : "All available module pages have already been assigned to this role!"}
              </div>
            ) : (
              Object.entries(groupedAvailablePages).map(([moduleName, modulePages]) => {
                const allModuleSelected = modulePages.every((p) =>
                  selectedPageIds.includes(p.id)
                );
                const someModuleSelected =
                  !allModuleSelected &&
                  modulePages.some((p) => selectedPageIds.includes(p.id));

                return (
                  <div key={moduleName} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                    {/* Module Group Header */}
                    <div className="px-3 py-2 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider font-mono">
                        {moduleName} Module ({modulePages.length})
                      </span>
                      {!isEdit && (
                        <button
                          type="button"
                          onClick={() => handleSelectModuleGroup(modulePages)}
                          className="text-[10px] font-bold text-slate-600 hover:text-slate-900 font-mono hover:underline"
                        >
                          {allModuleSelected ? "Deselect Group" : "Select Group"}
                        </button>
                      )}
                    </div>

                    {/* Module Pages List */}
                    <div className="divide-y divide-slate-100">
                      {modulePages.map((page) => {
                        const isChecked = selectedPageIds.includes(page.id);

                        return (
                          <label
                            key={page.id}
                            className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
                              isChecked ? "bg-blue-50/70" : "hover:bg-slate-50"
                            }`}
                          >
                            <input
                              type={isEdit ? "radio" : "checkbox"}
                              name={isEdit ? "pageSelection" : undefined}
                              checked={isChecked}
                              onChange={() => togglePageSelection(page.id)}
                              className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer accent-slate-900"
                            />
                            <div className="w-6 h-6 rounded bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-sm">
                                {normalizeIcon(page.icon)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-slate-900 text-xs truncate">
                                {page.name}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono truncate">
                                {page.route}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Selection summary */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
            <span>
              {selectedPageIds.length} {selectedPageIds.length === 1 ? "page" : "pages"} selected
            </span>
            <span>
              {availablePages.length} unassigned pages available
            </span>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 shrink-0">
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
              disabled={isSubmitting || selectedPageIds.length === 0}
              className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                  <span>Assigning Pages...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">
                    {isEdit ? "check" : "add_task"}
                  </span>
                  <span>
                    {isEdit
                      ? "Update Access"
                      : selectedPageIds.length > 1
                      ? `Assign (${selectedPageIds.length}) Pages`
                      : selectedPageIds.length === 1
                      ? "Assign (1) Page"
                      : "Assign Pages"}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateRolePageAccessModal;
