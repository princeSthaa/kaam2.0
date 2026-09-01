"use client";

import React, { useState, useEffect } from "react";
import {
  createEmployee,
  updateEmployee,
  fetchDepartments,
  fetchRoles,
  DepartmentDto,
  RoleDto,
  EmployeeDto,
} from "../../api/constant";

interface CreateEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (employee: EmployeeDto) => void;
  onSaved?: (employee: EmployeeDto) => void;
  initialData?: EmployeeDto | null;
  existingDepartments?: DepartmentDto[];
  existingRoles?: RoleDto[];
}

export function CreateEmployeeModal({
  isOpen,
  onClose,
  onCreated,
  onSaved,
  initialData,
  existingDepartments,
  existingRoles,
}: CreateEmployeeModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [employeeRoleId, setEmployeeRoleId] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [departments, setDepartments] = useState<DepartmentDto[]>(existingDepartments || []);
  const [roles, setRoles] = useState<RoleDto[]>(
    (existingRoles || []).filter(
      (r) => !r.isSuperAdmin && (r.name || r.roleName) !== "Super Admin"
    )
  );
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isEdit = !!initialData?.id;

  // Initialize or pre-populate data when modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setFirstName(initialData.firstName || "");
      setLastName(initialData.lastName || "");
      setEmail(initialData.email || "");
      setPhoneNumber(initialData.phoneNumber || "");
      setPassword("");
      setDepartmentId(initialData.departmentId || "");
      setEmployeeRoleId(initialData.employeeRoleId || "");
      setIsActive(initialData.isActive ?? true);
    } else {
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhoneNumber("");
      setPassword("");
      setDepartmentId(departments[0]?.id || "");
      setEmployeeRoleId(roles[0]?.id || "");
      setIsActive(true);
    }
    setErrorMsg(null);

    setLoadingOptions(true);
    Promise.all([fetchDepartments(), fetchRoles()])
      .then(([deptData, roleData]) => {
        if (Array.isArray(deptData) && deptData.length > 0) {
          setDepartments(deptData);
          if (!initialData && !departmentId) setDepartmentId(deptData[0].id);
        }
        if (Array.isArray(roleData) && roleData.length > 0) {
          const filtered = roleData.filter(
            (r) => !r.isSuperAdmin && (r.name || r.roleName) !== "Super Admin"
          );
          setRoles(filtered);
          if (!initialData && !employeeRoleId && filtered.length > 0) setEmployeeRoleId(filtered[0].id);
        }
      })
      .catch((err) => {
        console.warn("Could not refresh departments/roles from API:", err);
      })
      .finally(() => {
        setLoadingOptions(false);
      });
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

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhoneNumber("");
    setPassword("");
    setDepartmentId(departments[0]?.id || "");
    setEmployeeRoleId(roles[0]?.id || "");
    setIsActive(true);
    setErrorMsg(null);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg("First Name and Last Name are required.");
      return;
    }
    if (!isEdit && password.length < 4) {
      setErrorMsg("An initial password of at least 4 characters is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const selectedDept = departments.find((d) => d.id === departmentId);
    const selectedRole = roles.find((r) => r.id === employeeRoleId);

    try {
      if (isEdit && initialData?.id) {
        await updateEmployee(initialData.id, {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim() || undefined,
          phoneNumber: phoneNumber.trim() || undefined,
          departmentId: departmentId || undefined,
          employeeRoleId: employeeRoleId || undefined,
          password: password || undefined,
          isActive,
        });

        const updated: EmployeeDto = {
          ...initialData,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          fullName: `${firstName.trim()} ${lastName.trim()}`,
          email: email.trim(),
          phoneNumber: phoneNumber.trim(),
          departmentId: departmentId || undefined,
          departmentName: selectedDept?.name || initialData.departmentName || "Engineering",
          departmentCode: selectedDept?.departmentCode || selectedDept?.code || initialData.departmentCode || "ENG",
          employeeRoleId: employeeRoleId || undefined,
          password,
          roleName: selectedRole?.roleName || initialData.roleName || "Staff",
          isActive,
          updatedAt: new Date().toISOString(),
        };

        if (onSaved) {
          onSaved(updated);
        } else if (onCreated) {
          onCreated(updated);
        }
      } else {
        const created = await createEmployee({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim() || undefined,
          phoneNumber: phoneNumber.trim() || undefined,
          departmentId: departmentId || undefined,
          employeeRoleId: employeeRoleId || undefined,
          isActive,
        });

        const fullEmployee: EmployeeDto = {
          ...created,
          fullName: created.fullName || `${firstName.trim()} ${lastName.trim()}`,
          departmentName: created.departmentName || selectedDept?.name || "General",
          departmentCode: created.departmentCode || selectedDept?.departmentCode || selectedDept?.code || "DEP",
          roleName: created.roleName || selectedRole?.roleName || "Staff",
        };

        if (onSaved) {
          onSaved(fullEmployee);
        } else if (onCreated) {
          onCreated(fullEmployee);
        }
      }
      resetForm();
      onClose();
    } catch (err: any) {
      console.error("Save employee failed:", err);
      setErrorMsg(err instanceof Error ? err.message : "Could not save the employee.");
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
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden text-slate-900 transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-lg">badge</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">
                {isEdit ? "Edit Employee" : "Add New Employee"}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                {isEdit ? "Update personnel record & departmental assignment" : "Create personnel record & assign RBAC roles"}
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

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-start gap-2 text-xs font-medium">
              <span className="material-symbols-outlined text-rose-600 text-base shrink-0">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 text-[11px] uppercase tracking-wider font-mono">
                First Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-slate-900 focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 text-[11px] uppercase tracking-wider font-mono">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-slate-900 focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 text-[11px] uppercase tracking-wider font-mono">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-slate-900 focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 text-[11px] uppercase tracking-wider font-mono">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-slate-900 focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Department & Role (Loaded from API) */}
          {!isEdit && (
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 text-[11px] uppercase tracking-wider font-mono">
                Initial Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                minLength={4}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-slate-900 focus:bg-white focus:outline-none transition-all"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 text-[11px] uppercase tracking-wider font-mono">
                  Department
                </label>
                {loadingOptions && (
                  <span className="text-[10px] text-slate-400 animate-pulse font-mono">Loading...</span>
                )}
              </div>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-slate-900 focus:bg-white focus:outline-none transition-all"
              >
                {departments.length > 0 ? (
                  departments.map((dept) => {
                    const code = dept.departmentCode || dept.code;
                    return (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} {code ? `(${code})` : ""}
                      </option>
                    );
                  })
                ) : (
                  <option value="">No departments found</option>
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 text-[11px] uppercase tracking-wider font-mono">
                  Assigned Role
                </label>
                {loadingOptions && (
                  <span className="text-[10px] text-slate-400 animate-pulse font-mono">Loading...</span>
                )}
              </div>
              <select
                value={employeeRoleId}
                onChange={(e) => setEmployeeRoleId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-slate-900 focus:bg-white focus:outline-none transition-all"
              >
                {roles.length > 0 ? (
                  roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.roleName}
                    </option>
                  ))
                ) : (
                  <option value="">No roles found</option>
                )}
              </select>
            </div>
          </div>

          {/* Account Status */}
          <div className="pt-2">
            <label className="font-bold text-slate-700 text-[11px] uppercase tracking-wider font-mono mb-2 block">
              Account Status
            </label>
            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={isActive}
                  onChange={() => setIsActive(true)}
                  className="accent-slate-900 w-4 h-4 cursor-pointer"
                />
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={!isActive}
                  onChange={() => setIsActive(false)}
                  className="accent-slate-900 w-4 h-4 cursor-pointer"
                />
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span> Inactive / Suspended
                </span>
              </label>
            </div>
          </div>

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
                  <span>Saving Employee...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">
                    {isEdit ? "check" : "person_add"}
                  </span>
                  <span>{isEdit ? "Update Employee" : "Create Employee"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateEmployeeModal;
