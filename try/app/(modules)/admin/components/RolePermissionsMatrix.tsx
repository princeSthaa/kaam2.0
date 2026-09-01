"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  RoleDto,
  PageDto,
  PermissionDto,
  fetchRolePageMatrix,
  saveRolePageMatrix,
  RolePageMatrixItem,
} from "../api/constant";

interface RolePermissionsMatrixProps {
  roles: RoleDto[];
  pages: PageDto[];
  permissions: PermissionDto[];
  onPermissionsChanged?: () => void;
}

export function RolePermissionsMatrix({
  roles,
  pages,
  permissions,
  onPermissionsChanged,
}: RolePermissionsMatrixProps) {
  // 1. Filter out Super Admin from selectable roles
  const assignableRoles = useMemo(() => {
    return roles.filter(
      (r) =>
        !r.isSuperAdmin &&
        (r.name || r.roleName || "").trim().toLowerCase() !== "super admin"
    );
  }, [roles]);

  const [selectedRoleId, setSelectedRoleId] = useState<string>(() => {
    return assignableRoles[0]?.id || "";
  });

  // Keep selectedRoleId valid when roles change
  useEffect(() => {
    if (!selectedRoleId && assignableRoles.length > 0) {
      setSelectedRoleId(assignableRoles[0].id);
    } else if (
      selectedRoleId &&
      !assignableRoles.some((r) => r.id === selectedRoleId) &&
      assignableRoles.length > 0
    ) {
      setSelectedRoleId(assignableRoles[0].id);
    }
  }, [assignableRoles, selectedRoleId]);

  // 2. Identify top modules (pages with root route or direct children of dashboard "/")
  const dashboardPage = useMemo(
    () => pages.find((p) => p.route === "/" || p.name.toLowerCase() === "dashboard"),
    [pages]
  );

  const moduleList = useMemo(() => {
    return pages
      .filter((p) => {
        if (p.id === dashboardPage?.id || p.route === "/") return false;
        // Direct child of dashboard or 1 segment route like /crm, /production, /warehouse, etc.
        const isChildOfDashboard = dashboardPage && p.parentPageId === dashboardPage.id;
        const isOneSegment =
          p.route.startsWith("/") && p.route.split("/").filter(Boolean).length === 1;
        return isChildOfDashboard || isOneSegment;
      })
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [pages, dashboardPage]);

  const [selectedModuleId, setSelectedModuleId] = useState<string>("");
  const [selectedSubmoduleId, setSelectedSubmoduleId] = useState<string>("");

  // Submodules under the selected module
  const submodules = useMemo(() => {
    if (!selectedModuleId) return [];
    const mod = pages.find((p) => p.id === selectedModuleId);
    if (!mod) return [];

    return pages.filter(
      (p) =>
        p.id !== mod.id &&
        p.parentPageId === mod.id &&
        pages.some((child) => child.parentPageId === p.id) // has child pages
    );
  }, [pages, selectedModuleId]);

  // Reset submodule when module changes
  useEffect(() => {
    setSelectedSubmoduleId("");
  }, [selectedModuleId]);

  // Pages to display in the matrix table
  const visiblePages = useMemo(() => {
    let result = pages.filter((p) => p.id !== dashboardPage?.id && p.route !== "/");

    if (selectedModuleId) {
      const mod = pages.find((p) => p.id === selectedModuleId);
      if (mod) {
        result = result.filter(
          (p) => p.parentPageId === mod.id || p.route.startsWith(mod.route)
        );
      }
    }

    if (selectedSubmoduleId) {
      const sub = pages.find((p) => p.id === selectedSubmoduleId);
      if (sub) {
        result = result.filter(
          (p) => p.id === sub.id || p.parentPageId === sub.id || p.route.startsWith(sub.route)
        );
      }
    }

    return result.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [pages, dashboardPage, selectedModuleId, selectedSubmoduleId]);

  // 3. Matrix State: Map of pageId -> Set of action strings ("GET", "POST", "PUT", "DELETE")
  const [matrixData, setMatrixData] = useState<Record<string, Set<string>>>({});
  const [savedItems, setSavedItems] = useState<RolePageMatrixItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Load matrix for selected role
  const loadMatrix = useCallback(async (roleId: string) => {
    if (!roleId) return;
    setIsLoading(true);
    setFeedback(null);
    try {
      const items = await fetchRolePageMatrix(roleId);
      setSavedItems(items);

      const mapping: Record<string, Set<string>> = {};
      items.forEach((item) => {
        if (item.actions) {
          const actSet = new Set(
            item.actions.split(",").map((a) => a.trim().toUpperCase()).filter(Boolean)
          );
          mapping[item.pageId] = actSet;
        }
      });
      setMatrixData(mapping);
    } catch (err) {
      console.error("Failed to load role page matrix:", err);
      setFeedback({
        type: "error",
        message: "Failed to load permissions matrix. Please retry.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedRoleId) {
      loadMatrix(selectedRoleId);
    }
  }, [selectedRoleId, loadMatrix]);

  // Checkbox toggle helpers
  const handleToggle = (pageId: string, action: string) => {
    setMatrixData((prev) => {
      const currentSet = new Set(prev[pageId] || []);
      if (currentSet.has(action)) {
        currentSet.delete(action);
      } else {
        currentSet.add(action);
      }

      const updated = { ...prev };
      if (currentSet.size === 0) {
        delete updated[pageId];
      } else {
        updated[pageId] = currentSet;
      }
      return updated;
    });
  };

  // Row toggles
  const handleRowToggleAll = (pageId: string) => {
    setMatrixData((prev) => ({
      ...prev,
      [pageId]: new Set(["GET", "POST", "PUT", "DELETE"]),
    }));
  };

  const handleRowClear = (pageId: string) => {
    setMatrixData((prev) => {
      const updated = { ...prev };
      delete updated[pageId];
      return updated;
    });
  };

  // Column toggles for visible pages
  const isColAllChecked = (action: string) => {
    if (visiblePages.length === 0) return false;
    return visiblePages.every((p) => matrixData[p.id]?.has(action));
  };

  const handleColToggleAll = (action: string) => {
    const allChecked = isColAllChecked(action);
    setMatrixData((prev) => {
      const updated = { ...prev };
      visiblePages.forEach((p) => {
        const set = new Set(updated[p.id] || []);
        if (allChecked) {
          set.delete(action);
          if (set.size === 0) {
            delete updated[p.id];
            return;
          }
        } else {
          set.add(action);
        }
        updated[p.id] = set;
      });
      return updated;
    });
  };

  // Bulk actions for visible pages
  const handleSelectAllVisible = () => {
    setMatrixData((prev) => {
      const updated = { ...prev };
      visiblePages.forEach((p) => {
        updated[p.id] = new Set(["GET", "POST", "PUT", "DELETE"]);
      });
      return updated;
    });
  };

  const handleClearAllVisible = () => {
    setMatrixData((prev) => {
      const updated = { ...prev };
      visiblePages.forEach((p) => {
        delete updated[p.id];
      });
      return updated;
    });
  };

  // Save changes
  const handleSave = async () => {
    if (!selectedRoleId) return;
    setIsSaving(true);
    setFeedback(null);

    try {
      // Build assignment payload for all pages currently in matrixData
      // and any page previously saved (to allow clearing)
      const allPageIds = new Set([
        ...Object.keys(matrixData),
        ...savedItems.map((item) => item.pageId),
      ]);

      const assignments = Array.from(allPageIds).map((pageId) => ({
        pageId,
        actions: Array.from(matrixData[pageId] || []),
      }));

      const updated = await saveRolePageMatrix(selectedRoleId, assignments);
      setSavedItems(updated);

      const mapping: Record<string, Set<string>> = {};
      updated.forEach((item) => {
        if (item.actions) {
          const actSet = new Set(
            item.actions.split(",").map((a) => a.trim().toUpperCase()).filter(Boolean)
          );
          mapping[item.pageId] = actSet;
        }
      });
      setMatrixData(mapping);

      const roleName = assignableRoles.find((r) => r.id === selectedRoleId)?.name || "Role";
      setFeedback({
        type: "success",
        message: `Permissions successfully saved and updated for ${roleName}!`,
      });

      if (onPermissionsChanged) {
        onPermissionsChanged();
      }
    } catch (err) {
      console.error("Save matrix error:", err);
      setFeedback({
        type: "error",
        message: "Failed to save permissions. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const selectedRoleName =
    assignableRoles.find((r) => r.id === selectedRoleId)?.name ||
    assignableRoles.find((r) => r.id === selectedRoleId)?.roleName ||
    "Selected Role";

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-xs font-medium ${
            feedback.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-rose-50 border border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base shrink-0">
              {feedback.type === "success" ? "check_circle" : "error"}
            </span>
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-700"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Top Filter & Selection Bar */}
      <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Group / Role Selector (Super Admin Excluded) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-slate-500">groups</span>
              Role / Group Name <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all shadow-sm"
            >
              {assignableRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name || role.roleName}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Module Name Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-slate-500">folder</span>
              Module Name
            </label>
            <select
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all shadow-sm"
            >
              <option value="">All Modules ({moduleList.length})</option>
              {moduleList.map((mod) => (
                <option key={mod.id} value={mod.id}>
                  {mod.name} ({mod.route})
                </option>
              ))}
            </select>
          </div>

          {/* 3. Submodule Name Selector (if applicable) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-slate-500">subdirectory_arrow_right</span>
              Submodule Section
            </label>
            <select
              value={selectedSubmoduleId}
              onChange={(e) => setSelectedSubmoduleId(e.target.value)}
              disabled={!selectedModuleId || submodules.length === 0}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all shadow-sm disabled:opacity-50 disabled:bg-slate-100"
            >
              <option value="">
                {!selectedModuleId
                  ? "Select a module first"
                  : submodules.length === 0
                  ? "All pages in module"
                  : `All Submodules (${submodules.length})`}
              </option>
              {submodules.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/80">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 font-mono">
            <span>Configuring:</span>
            <span className="px-2.5 py-0.5 rounded-md bg-slate-900 text-white font-bold">
              {selectedRoleName}
            </span>
            <span className="text-slate-400">|</span>
            <span>{visiblePages.length} Pages</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAllVisible}
              className="px-3 py-1.5 text-xs font-bold font-mono text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={handleClearAllVisible}
              className="px-3 py-1.5 text-xs font-bold font-mono text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="px-4 py-1.5 text-xs font-bold font-mono text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">save</span>
                  Save Permissions
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Permission Matrix Table */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-900 text-white font-mono text-[11px] uppercase tracking-wider">
                <th className="p-3.5 w-12 text-center">#</th>
                <th className="p-3.5 min-w-[200px]">Page Name</th>
                <th className="p-3.5 min-w-[220px]">Route</th>
                {/* Checkbox columns matching user's image */}
                <th className="p-3.5 text-center w-28">
                  <label className="flex items-center justify-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isColAllChecked("GET")}
                      onChange={() => handleColToggleAll("GET")}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>Read (GET)</span>
                  </label>
                </th>
                <th className="p-3.5 text-center w-28">
                  <label className="flex items-center justify-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isColAllChecked("PUT")}
                      onChange={() => handleColToggleAll("PUT")}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <span>Modify (PUT)</span>
                  </label>
                </th>
                <th className="p-3.5 text-center w-28">
                  <label className="flex items-center justify-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isColAllChecked("POST")}
                      onChange={() => handleColToggleAll("POST")}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>Add (POST)</span>
                  </label>
                </th>
                <th className="p-3.5 text-center w-28">
                  <label className="flex items-center justify-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isColAllChecked("DELETE")}
                      onChange={() => handleColToggleAll("DELETE")}
                      className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                    <span>Delete</span>
                  </label>
                </th>
                <th className="p-3.5 text-center w-24">Quick</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-mono">
                    <div className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                      Loading permissions matrix...
                    </div>
                  </td>
                </tr>
              ) : visiblePages.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-mono">
                    No pages found for the selected module filter.
                  </td>
                </tr>
              ) : (
                visiblePages.map((page, idx) => {
                  const assigned = matrixData[page.id] || new Set();
                  const hasGet = assigned.has("GET");
                  const hasPut = assigned.has("PUT");
                  const hasPost = assigned.has("POST");
                  const hasDelete = assigned.has("DELETE");
                  const isAnyChecked = assigned.size > 0;

                  return (
                    <tr
                      key={page.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isAnyChecked ? "bg-white" : "bg-slate-50/30 opacity-75"
                      }`}
                    >
                      <td className="p-3 text-center font-mono text-slate-400 font-bold">
                        {idx + 1}
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {page.icon && (
                            <span className="material-symbols-outlined text-slate-400 text-base shrink-0">
                              {page.icon}
                            </span>
                          )}
                          <div>
                            <div className="font-bold text-slate-900">{page.name}</div>
                            {page.parentPageId && (
                              <div className="text-[10px] text-slate-400 font-mono">
                                Parent: {pages.find((p) => p.id === page.parentPageId)?.name || "Module"}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-3 font-mono text-[11px] text-slate-600">
                        {page.route}
                      </td>

                      {/* Read / GET */}
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={hasGet}
                          onChange={() => handleToggle(page.id, "GET")}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* Modify / PUT */}
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={hasPut}
                          onChange={() => handleToggle(page.id, "PUT")}
                          className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                      </td>

                      {/* Add / POST */}
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={hasPost}
                          onChange={() => handleToggle(page.id, "POST")}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>

                      {/* Delete / DELETE */}
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={hasDelete}
                          onChange={() => handleToggle(page.id, "DELETE")}
                          className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                        />
                      </td>

                      {/* Quick row actions */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            title="Check All Permissions"
                            onClick={() => handleRowToggleAll(page.id)}
                            className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          >
                            All
                          </button>
                          <button
                            type="button"
                            title="Clear All Permissions"
                            onClick={() => handleRowClear(page.id)}
                            className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-500 transition-colors"
                          >
                            None
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer save bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            {Object.keys(matrixData).length} pages configured with active permissions
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadMatrix(selectedRoleId)}
              disabled={isLoading || isSaving}
              className="px-3.5 py-1.5 text-xs font-bold font-mono text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="px-4 py-1.5 text-xs font-bold font-mono text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              {isSaving ? "Saving..." : "Save Permissions"}
            </button>
          </div>
        </div>
      </div>

      {/* Summary of Currently Assigned Permissions (matching background table in user's image) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">verified_user</span>
            Active Permissions Assigned to {selectedRoleName} ({savedItems.length} Pages)
          </h3>
        </div>

        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-mono text-[11px] uppercase tracking-wider border-b border-slate-200">
                <th className="p-3 w-10 text-center">#</th>
                <th className="p-3">Module / Section</th>
                <th className="p-3">Page Name</th>
                <th className="p-3">Route</th>
                <th className="p-3">Permissions Assigned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {savedItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400 font-mono">
                    No permissions assigned to this role yet. Use the matrix above to assign permissions.
                  </td>
                </tr>
              ) : (
                savedItems.map((item, idx) => {
                  const actList = (item.actions || "").split(",").filter(Boolean);
                  return (
                    <tr key={item.pageId} className="hover:bg-slate-50/50">
                      <td className="p-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="p-3 font-medium text-slate-700">
                        {item.parentPageName || "Root Module"}
                      </td>
                      <td className="p-3 font-bold text-slate-900">{item.pageName}</td>
                      <td className="p-3 font-mono text-[11px] text-slate-600">{item.pageRoute}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {actList.map((act) => {
                            const upper = act.toUpperCase();
                            let badgeStyle = "bg-slate-100 text-slate-700 border-slate-200";
                            if (upper === "GET") badgeStyle = "bg-blue-50 text-blue-700 border-blue-200";
                            if (upper === "POST") badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
                            if (upper === "PUT") badgeStyle = "bg-amber-50 text-amber-800 border-amber-200";
                            if (upper === "DELETE") badgeStyle = "bg-rose-50 text-rose-700 border-rose-200";

                            const label =
                              upper === "GET"
                                ? "Read"
                                : upper === "POST"
                                ? "Add"
                                : upper === "PUT"
                                ? "Modify"
                                : upper === "DELETE"
                                ? "Delete"
                                : upper;

                            return (
                              <span
                                key={act}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${badgeStyle}`}
                              >
                                {label}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
export default RolePermissionsMatrix;
