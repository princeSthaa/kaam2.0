"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  fetchEmployees,
  deleteEmployee,
  EmployeeDto,
  fetchDepartments,
  deleteDepartment,
  DepartmentDto,
  fetchRoles,
  deleteRole,
  RoleDto,
  fetchPermissions,
  deletePermission,
  PermissionDto,
  fetchPages,
  deletePage,
  PageDto,
  fetchRolePageAccesses,
  deleteRolePageAccess,
  RolePageAccessDto,
  fetchRolePagePermissions,
  deleteRolePagePermission,
  RolePagePermissionDto,
} from "../api/constant";
import { CreateEmployeeModal } from "../components/modals/createemployeemodal";
import { CreateRoleModal } from "../components/modals/createrolemodal";
import { CreateDepartmentModal } from "../components/modals/createdepartmentmodal";
import { CreatePermissionModal } from "../components/modals/createpermissionmodal";
import { CreatePageModal } from "../components/modals/createpagemodal";
import { CreateRolePageAccessModal } from "../components/modals/createrolepageaccessmodal";
import { CreateRolePagePermissionModal } from "../components/modals/createrolepagepermissionmodal";
import { RolePermissionsMatrix } from "../components/RolePermissionsMatrix";
import { usePathname } from "next/navigation";

const INITIAL_EMPLOYEES: EmployeeDto[] = [
  {
    id: "545f64e3-573d-4d77-bf1e-81ba39874619",
    firstName: "Prince",
    lastName: "Shrestha",
    fullName: "Prince Shrestha",
    phoneNumber: "9800000000",
    email: "prince.shrestha@gmail.com",
    employeeRoleId: "9c88036a-1d47-4221-bd8b-e93ea0df15b3",
    roleName: "Administrator",
    departmentId: "e114e966-8bc1-4aa7-a872-a2acfcff0bc0",
    departmentName: "Engineering",
    departmentCode: "ENG",
    isActive: true,
    createdAt: "2026-08-25T07:13:56.5326965",
    updatedAt: "2026-08-25T07:13:56.5326965",
  },
  {
    id: "6a12bc34-88de-4123-9f12-a1b2c3d4e5f6",
    firstName: "Jane",
    lastName: "Doe",
    fullName: "Jane Doe",
    phoneNumber: "9811223344",
    email: "jane.doe@kaam.io",
    employeeRoleId: "9c88036a-1d47-4221-bd8b-e93ea0df15b4",
    roleName: "Floor Manager",
    departmentId: "e114e966-8bc1-4aa7-a872-a2acfcff0bc1",
    departmentName: "Production & Assembly",
    departmentCode: "PRD",
    isActive: true,
    createdAt: "2026-08-20T10:15:00.0000000",
    updatedAt: "2026-08-20T10:15:00.0000000",
  },
  {
    id: "7b23cd45-99ef-5234-af23-b2c3d4e5f6a7",
    firstName: "Robert",
    lastName: "Smith",
    fullName: "Robert Smith",
    phoneNumber: "9844556677",
    email: "r.smith@kaam.io",
    employeeRoleId: "9c88036a-1d47-4221-bd8b-e93ea0df15b5",
    roleName: "Operator L2",
    departmentId: "e114e966-8bc1-4aa7-a872-a2acfcff0bc1",
    departmentName: "Production & Assembly",
    departmentCode: "PRD",
    isActive: true,
    createdAt: "2026-08-22T08:30:00.0000000",
    updatedAt: "2026-08-22T08:30:00.0000000",
  },
  {
    id: "8c34de56-aa01-6345-b034-c3d4e5f6a7b8",
    firstName: "Maria",
    lastName: "Kowalski",
    fullName: "Maria Kowalski",
    phoneNumber: "9866778899",
    email: "m.kowalski@kaam.io",
    employeeRoleId: "9c88036a-1d47-4221-bd8b-e93ea0df15b6",
    roleName: "Forklift Operator",
    departmentId: "e114e966-8bc1-4aa7-a872-a2acfcff0bc2",
    departmentName: "Warehouse & Logistics",
    departmentCode: "WHS",
    isActive: false,
    createdAt: "2026-08-15T14:20:00.0000000",
    updatedAt: "2026-08-15T14:20:00.0000000",
  },
];

const INITIAL_ROLES: RoleDto[] = [
  {
    id: "9c88036a-1d47-4221-bd8b-e93ea0df15b3",
    roleName: "Administrator",
    description: "System Administrator with full access across system settings, RBAC and catalogs.",
  },
  {
    id: "9c88036a-1d47-4221-bd8b-e93ea0df15b4",
    roleName: "Floor Manager",
    description: "Supervises daily shopfloor operations, inventory movements, and staff scheduling.",
  },
  {
    id: "9c88036a-1d47-4221-bd8b-e93ea0df15b5",
    roleName: "Operator L2",
    description: "Assembly line operator responsible for batch production runs and equipment operation.",
  },
  {
    id: "9c88036a-1d47-4221-bd8b-e93ea0df15b6",
    roleName: "Forklift Operator",
    description: "Material handling, warehouse racking, bin replenishment and raw good transfers.",
  },
];

const INITIAL_DEPARTMENTS: DepartmentDto[] = [
  {
    id: "e114e966-8bc1-4aa7-a872-a2acfcff0bc0",
    name: "Engineering",
    departmentCode: "ENG",
    code: "ENG",
  },
  {
    id: "e114e966-8bc1-4aa7-a872-a2acfcff0bc1",
    name: "Production & Assembly",
    departmentCode: "PRD",
    code: "PRD",
  },
  {
    id: "e114e966-8bc1-4aa7-a872-a2acfcff0bc2",
    name: "Warehouse & Logistics",
    departmentCode: "WHS",
    code: "WHS",
  },
  {
    id: "e114e966-8bc1-4aa7-a872-a2acfcff0bc3",
    name: "Quality Control",
    departmentCode: "QC",
    code: "QC",
  },
];

const INITIAL_PERMISSIONS: PermissionDto[] = [
  {
    id: "perm-1",
    name: "View",
    action: "Get",
    description: "Permission to view records and personnel directories",
  },
  {
    id: "perm-2",
    name: "Create",
    action: "Post",
    description: "Permission to create user",
  },
  {
    id: "perm-3",
    name: "Edit",
    action: "Put",
    description: "Permission to modify system entities and records",
  },
  {
    id: "perm-4",
    name: "Delete",
    action: "Delete",
    description: "Permission to permanently remove system resources",
  },
];

const INITIAL_PAGES: PageDto[] = [
  {
    id: "c2c1fe98-14f3-4ed4-ae1c-d1eced7ee7d0",
    name: "CustomerFilter",
    route: "/crm/customers",
    icon: "filter_alt",
    parentPageId: null,
    parentPageName: "CRM",
    displayOrder: 1,
    isActive: true,
    createdAt: "2026-08-25T07:13:56.5326965",
    updatedAt: "2026-08-25T07:13:56.5326965",
  },
  {
    id: "d3d2fe99-25f4-5fe5-bf2d-e2fded8ff8e1",
    name: "Product Directory",
    route: "/admin/product",
    icon: "category",
    parentPageId: null,
    parentPageName: "Admin",
    displayOrder: 2,
    isActive: true,
    createdAt: "2026-08-25T07:13:56.5326965",
    updatedAt: "2026-08-25T07:13:56.5326965",
  },
  {
    id: "e4e3fe00-36f5-6ff6-cf3e-f3feed9009f2",
    name: "Material Directory",
    route: "/admin/material",
    icon: "precision_manufacturing",
    parentPageId: null,
    parentPageName: "Admin",
    displayOrder: 3,
    isActive: true,
    createdAt: "2026-08-25T07:13:56.5326965",
    updatedAt: "2026-08-25T07:13:56.5326965",
  },
];

const INITIAL_ROLE_PAGE_ACCESSES: RolePageAccessDto[] = [
  {
    id: "c2c1fe98-14f3-4ed4-ae1c-d1eced7ee7d0",
    roleId: "9c88036a-1d47-4221-bd8b-e93ea0df15b3",
    pageId: "c2c1fe98-14f3-4ed4-ae1c-d1eced7ee7d0",
    roleName: "Administrator",
    pageName: "CustomerFilter",
    pageRoute: "/crm/customers",
    pageIcon: "filter_alt",
    createdAt: "2026-08-25T07:13:56.5326965",
    updatedAt: "2026-08-25T07:13:56.5326965",
  },
  {
    id: "d3d2fe99-25f4-5fe5-bf2d-e2fded8ff8e1",
    roleId: "9c88036a-1d47-4221-bd8b-e93ea0df15b3",
    pageId: "d3d2fe99-25f4-5fe5-bf2d-e2fded8ff8e1",
    roleName: "Administrator",
    pageName: "Product Directory",
    pageRoute: "/admin/product",
    pageIcon: "category",
    createdAt: "2026-08-25T07:13:56.5326965",
    updatedAt: "2026-08-25T07:13:56.5326965",
  },
  {
    id: "e4e3fe00-36f5-6ff6-cf3e-f3feed9009f2",
    roleId: "9c88036a-1d47-4221-bd8b-e93ea0df15b4",
    pageId: "e4e3fe00-36f5-6ff6-cf3e-f3feed9009f2",
    roleName: "Floor Manager",
    pageName: "Material Directory",
    pageRoute: "/admin/material",
    pageIcon: "precision_manufacturing",
    createdAt: "2026-08-25T07:13:56.5326965",
    updatedAt: "2026-08-25T07:13:56.5326965",
  },
];

const INITIAL_ROLE_PAGE_PERMISSIONS: RolePagePermissionDto[] = [
  {
    id: "rpp-1",
    rolePageAccessId: "c2c1fe98-14f3-4ed4-ae1c-d1eced7ee7d0",
    permissionId: "perm-1",
    permissionName: "View",
    permissionAction: "Get",
    pageName: "CustomerFilter",
    pageRoute: "/crm/customers",
    createdAt: "2026-08-25T07:13:56.5326965",
    updatedAt: "2026-08-25T07:13:56.5326965",
  },
  {
    id: "rpp-2",
    rolePageAccessId: "c2c1fe98-14f3-4ed4-ae1c-d1eced7ee7d0",
    permissionId: "perm-2",
    permissionName: "Create",
    permissionAction: "Post",
    pageName: "CustomerFilter",
    pageRoute: "/crm/customers",
    createdAt: "2026-08-25T07:13:56.5326965",
    updatedAt: "2026-08-25T07:13:56.5326965",
  },
  {
    id: "rpp-3",
    rolePageAccessId: "d3d2fe99-25f4-5fe5-bf2d-e2fded8ff8e1",
    permissionId: "perm-3",
    permissionName: "Edit",
    permissionAction: "Put",
    pageName: "Product Directory",
    pageRoute: "/admin/product",
    createdAt: "2026-08-25T07:13:56.5326965",
    updatedAt: "2026-08-25T07:13:56.5326965",
  },
];

const COLOR_CLASSES = [
  "bg-slate-900 text-white",
  "bg-blue-100 text-blue-900",
  "bg-purple-100 text-purple-900",
  "bg-emerald-100 text-emerald-900",
  "bg-amber-100 text-amber-900",
  "bg-rose-100 text-rose-900",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLOR_CLASSES[Math.abs(hash) % COLOR_CLASSES.length];
}

function getInitials(firstName: string, lastName: string, fullName?: string) {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (fullName) {
    const parts = fullName.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return fullName.slice(0, 2).toUpperCase();
  }
  return "EM";
}

function getActionBadgeColor(action?: string) {
  if (!action) return "bg-slate-100 text-slate-700 border-slate-200";
  const act = action.toUpperCase();
  if (act.includes("GET")) return "bg-blue-50 text-blue-700 border-blue-200";
  if (act.includes("POST")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (act.includes("PUT") || act.includes("PATCH")) return "bg-amber-50 text-amber-800 border-amber-200";
  if (act.includes("DELETE")) return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

function normalizeIcon(iconName?: string) {
  if (!iconName) return "web";
  const clean = iconName.toLowerCase().trim().replace(/-/g, "_");
  if (clean === "filter_icon" || clean === "filter") return "filter_alt";
  if (clean === "user_icon" || clean === "users_icon") return "groups";
  if (clean === "customer_icon" || clean === "customers_icon") return "support_agent";
  return clean;
}

export default function EmployeesAndRbacPage() {
  const [employees, setEmployees] = useState<EmployeeDto[]>(INITIAL_EMPLOYEES);
  const [roles, setRoles] = useState<RoleDto[]>(INITIAL_ROLES);
  const [departments, setDepartments] = useState<DepartmentDto[]>(INITIAL_DEPARTMENTS);
  const [permissions, setPermissions] = useState<PermissionDto[]>(INITIAL_PERMISSIONS);
  const [pages, setPages] = useState<PageDto[]>(INITIAL_PAGES);
  const [rolePageAccesses, setRolePageAccesses] = useState<RolePageAccessDto[]>(
    INITIAL_ROLE_PAGE_ACCESSES
  );
  const [rolePagePermissions, setRolePagePermissions] = useState<RolePagePermissionDto[]>(
    INITIAL_ROLE_PAGE_PERMISSIONS
  );
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<
    | "employees"
    | "role"
    | "department"
    | "permissions"
    | "pages"
    | "rolepermissions"
    | "rolepageaccess"
    | "rolepagepermission"
  >("employees");

  useEffect(() => {
    if (!pathname) return;
    if (
      pathname.includes("page-access") ||
      pathname.includes("page-permissions") ||
      pathname.includes("role-permissions") ||
      pathname.includes("access-control")
    ) {
      setActiveTab("rolepermissions");
    } else if (pathname.includes("roles")) {
      setActiveTab("role");
    } else if (pathname.includes("departments")) {
      setActiveTab("department");
    } else if (pathname.includes("permissions")) {
      setActiveTab("permissions");
    } else if (pathname.includes("pages")) {
      setActiveTab("pages");
    } else if (pathname.includes("employees")) {
      setActiveTab("employees");
    }
  }, [pathname]);

  // Search Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [roleSearchTerm, setRoleSearchTerm] = useState("");
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState("");
  const [permissionSearchTerm, setPermissionSearchTerm] = useState("");
  const [pageSearchTerm, setPageSearchTerm] = useState("");
  const [rpaSearchTerm, setRpaSearchTerm] = useState("");
  const [rppSearchTerm, setRppSearchTerm] = useState("");

  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [notification, setNotification] = useState<string | null>(null);

  // Modals
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeDto | null>(null);

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDto | null>(null);

  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentDto | null>(null);

  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<PermissionDto | null>(null);

  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<PageDto | null>(null);

  const [isRpaModalOpen, setIsRpaModalOpen] = useState(false);
  const [editingRpa, setEditingRpa] = useState<RolePageAccessDto | null>(null);

  const [isRppModalOpen, setIsRppModalOpen] = useState(false);
  const [editingRpp, setEditingRpp] = useState<RolePagePermissionDto | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Helper to read from session storage safely
  const getSessionData = <T,>(key: string, fallback: T): T => {
    if (typeof window === "undefined") return fallback;
    try {
      const stored = sessionStorage.getItem(key);
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  };

  // Helper to write to session storage safely
  const setSessionData = (key: string, value: any) => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Failed to write ${key} to sessionStorage:`, e);
    }
  };

  // Load Employees from API or session
  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await fetchEmployees();
      if (Array.isArray(data) && data.length > 0) {
        setEmployees(data);
        setSessionData("rbac_employees", data);
      } else {
        const cached = getSessionData("rbac_employees", INITIAL_EMPLOYEES);
        setEmployees(cached);
      }
    } catch (err) {
      console.warn("API offline, using session data for employees:", err);
      const cached = getSessionData("rbac_employees", INITIAL_EMPLOYEES);
      setEmployees(cached);
    } finally {
      setLoading(false);
    }
  };

  // Load Roles from API or session
  const loadRoles = async () => {
    try {
      const data = await fetchRoles();
      if (Array.isArray(data) && data.length > 0) {
        setRoles(data);
        setSessionData("rbac_roles", data);
      } else {
        const cached = getSessionData("rbac_roles", INITIAL_ROLES);
        setRoles(cached);
      }
    } catch (err) {
      const cached = getSessionData("rbac_roles", INITIAL_ROLES);
      setRoles(cached);
    }
  };

  // Load Departments from API or session
  const loadDepartments = async () => {
    try {
      const data = await fetchDepartments();
      if (Array.isArray(data) && data.length > 0) {
        setDepartments(data);
        setSessionData("rbac_departments", data);
      } else {
        const cached = getSessionData("rbac_departments", INITIAL_DEPARTMENTS);
        setDepartments(cached);
      }
    } catch (err) {
      const cached = getSessionData("rbac_departments", INITIAL_DEPARTMENTS);
      setDepartments(cached);
    }
  };

  // Load Permissions from API or session
  const loadPermissions = async () => {
    try {
      const data = await fetchPermissions();
      if (Array.isArray(data) && data.length > 0) {
        setPermissions(data);
        setSessionData("rbac_permissions", data);
      } else {
        const cached = getSessionData("rbac_permissions", INITIAL_PERMISSIONS);
        setPermissions(cached);
      }
    } catch (err) {
      const cached = getSessionData("rbac_permissions", INITIAL_PERMISSIONS);
      setPermissions(cached);
    }
  };

  // Load Pages from API or session
  const loadPages = async () => {
    try {
      const data = await fetchPages();
      if (Array.isArray(data) && data.length > 0) {
        setPages(data);
        setSessionData("rbac_pages", data);
      } else {
        const cached = getSessionData("rbac_pages", INITIAL_PAGES);
        setPages(cached);
      }
    } catch (err) {
      const cached = getSessionData("rbac_pages", INITIAL_PAGES);
      setPages(cached);
    }
  };

  // Load Role Page Accesses from API or session
  const loadRolePageAccesses = async () => {
    try {
      const data = await fetchRolePageAccesses();
      if (Array.isArray(data) && data.length > 0) {
        setRolePageAccesses(data);
        setSessionData("rbac_role_page_accesses", data);
      } else {
        const cached = getSessionData("rbac_role_page_accesses", INITIAL_ROLE_PAGE_ACCESSES);
        setRolePageAccesses(cached);
      }
    } catch (err) {
      const cached = getSessionData("rbac_role_page_accesses", INITIAL_ROLE_PAGE_ACCESSES);
      setRolePageAccesses(cached);
    }
  };

  // Load Role Page Permissions from API or session
  const loadRolePagePermissions = async () => {
    try {
      const data = await fetchRolePagePermissions();
      if (Array.isArray(data) && data.length > 0) {
        setRolePagePermissions(data);
        setSessionData("rbac_role_page_permissions", data);
      } else {
        const cached = getSessionData("rbac_role_page_permissions", INITIAL_ROLE_PAGE_PERMISSIONS);
        setRolePagePermissions(cached);
      }
    } catch (err) {
      const cached = getSessionData("rbac_role_page_permissions", INITIAL_ROLE_PAGE_PERMISSIONS);
      setRolePagePermissions(cached);
    }
  };

  // Reset all session data
  const handleResetSessionData = () => {
    if (!confirm("Reset all test data back to default demo records?")) return;
    setEmployees(INITIAL_EMPLOYEES);
    setRoles(INITIAL_ROLES);
    setDepartments(INITIAL_DEPARTMENTS);
    setPermissions(INITIAL_PERMISSIONS);
    setPages(INITIAL_PAGES);
    setRolePageAccesses(INITIAL_ROLE_PAGE_ACCESSES);
    setRolePagePermissions(INITIAL_ROLE_PAGE_PERMISSIONS);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("rbac_employees");
      sessionStorage.removeItem("rbac_roles");
      sessionStorage.removeItem("rbac_departments");
      sessionStorage.removeItem("rbac_permissions");
      sessionStorage.removeItem("rbac_pages");
      sessionStorage.removeItem("rbac_role_page_accesses");
      sessionStorage.removeItem("rbac_role_page_permissions");
    }
    showToast("Session data reset to default demo records.");
  };

  // Load Initial Data
  useEffect(() => {
    loadEmployees();
    loadRoles();
    loadDepartments();
    loadPermissions();
    loadPages();
    loadRolePageAccesses();
    loadRolePagePermissions();
  }, []);

  // Handle delete employee
  const handleDeleteEmployee = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove employee "${name}"?`)) return;

    try {
      await deleteEmployee(id);
      setEmployees((prev) => {
        const next = prev.filter((e) => e.id !== id);
        setSessionData("rbac_employees", next);
        return next;
      });
      showToast(`Employee "${name}" deleted.`);
    } catch (err) {
      setEmployees((prev) => {
        const next = prev.filter((e) => e.id !== id);
        setSessionData("rbac_employees", next);
        return next;
      });
      showToast(`Employee "${name}" removed.`);
    }
  };

  // Handle delete role
  const handleDeleteRole = async (id: string, roleName: string) => {
    if (!confirm(`Are you sure you want to delete role "${roleName}"?`)) return;

    try {
      await deleteRole(id);
      setRoles((prev) => {
        const next = prev.filter((r) => r.id !== id);
        setSessionData("rbac_roles", next);
        return next;
      });
      showToast(`Role "${roleName}" deleted.`);
    } catch (err) {
      setRoles((prev) => {
        const next = prev.filter((r) => r.id !== id);
        setSessionData("rbac_roles", next);
        return next;
      });
      showToast(`Role "${roleName}" removed.`);
    }
  };

  // Handle delete department
  const handleDeleteDepartment = async (id: string, deptName: string) => {
    if (!confirm(`Are you sure you want to delete department "${deptName}"?`)) return;

    try {
      await deleteDepartment(id);
      setDepartments((prev) => {
        const next = prev.filter((d) => d.id !== id);
        setSessionData("rbac_departments", next);
        return next;
      });
      showToast(`Department "${deptName}" deleted.`);
    } catch (err) {
      setDepartments((prev) => {
        const next = prev.filter((d) => d.id !== id);
        setSessionData("rbac_departments", next);
        return next;
      });
      showToast(`Department "${deptName}" removed.`);
    }
  };

  // Handle delete permission
  const handleDeletePermission = async (id: string, permName: string) => {
    if (!confirm(`Are you sure you want to delete permission "${permName}"?`)) return;

    try {
      await deletePermission(id);
      setPermissions((prev) => {
        const next = prev.filter((p) => p.id !== id);
        setSessionData("rbac_permissions", next);
        return next;
      });
      showToast(`Permission "${permName}" deleted.`);
    } catch (err) {
      setPermissions((prev) => {
        const next = prev.filter((p) => p.id !== id);
        setSessionData("rbac_permissions", next);
        return next;
      });
      showToast(`Permission "${permName}" removed.`);
    }
  };

  // Handle delete page
  const handleDeletePage = async (id: string, pageName: string) => {
    if (!confirm(`Are you sure you want to delete page "${pageName}"?`)) return;

    try {
      await deletePage(id);
      setPages((prev) => {
        const next = prev.filter((p) => p.id !== id);
        setSessionData("rbac_pages", next);
        return next;
      });
      showToast(`Page "${pageName}" deleted.`);
    } catch (err) {
      setPages((prev) => {
        const next = prev.filter((p) => p.id !== id);
        setSessionData("rbac_pages", next);
        return next;
      });
      showToast(`Page "${pageName}" removed.`);
    }
  };

  // Handle delete role page access
  const handleDeleteRpa = async (id: string) => {
    if (!confirm(`Are you sure you want to delete this role-page access mapping?`)) return;

    try {
      await deleteRolePageAccess(id);
      setRolePageAccesses((prev) => {
        const next = prev.filter((a) => a.id !== id);
        setSessionData("rbac_role_page_accesses", next);
        return next;
      });
      showToast(`Role-page access mapping deleted.`);
    } catch (err) {
      setRolePageAccesses((prev) => {
        const next = prev.filter((a) => a.id !== id);
        setSessionData("rbac_role_page_accesses", next);
        return next;
      });
      showToast(`Role-page access mapping removed.`);
    }
  };

  // Handle delete role page permission
  const handleDeleteRpp = async (id: string) => {
    if (!confirm(`Are you sure you want to remove this role-page permission mapping?`)) return;

    try {
      await deleteRolePagePermission(id);
      setRolePagePermissions((prev) => {
        const next = prev.filter((p) => p.id !== id);
        setSessionData("rbac_role_page_permissions", next);
        return next;
      });
      showToast(`Role-page permission removed.`);
    } catch (err) {
      setRolePagePermissions((prev) => {
        const next = prev.filter((p) => p.id !== id);
        setSessionData("rbac_role_page_permissions", next);
        return next;
      });
      showToast(`Role-page permission removed.`);
    }
  };

  const handleEmployeeSaved = (savedEmp: EmployeeDto) => {
    setEmployees((prev) => {
      const exists = prev.some((e) => e.id === savedEmp.id);
      const next = exists
        ? prev.map((e) => (e.id === savedEmp.id ? savedEmp : e))
        : [savedEmp, ...prev];
      setSessionData("rbac_employees", next);
      return next;
    });
    showToast(`Employee "${savedEmp.fullName || `${savedEmp.firstName} ${savedEmp.lastName}`}" saved successfully!`);
    setEditingEmployee(null);
  };

  const handleRoleSaved = (savedRole: RoleDto) => {
    setRoles((prev) => {
      const exists = prev.some((r) => r.id === savedRole.id);
      const next = exists
        ? prev.map((r) => (r.id === savedRole.id ? savedRole : r))
        : [savedRole, ...prev];
      setSessionData("rbac_roles", next);
      return next;
    });
    showToast(`Role "${savedRole.roleName}" saved successfully!`);
    setEditingRole(null);
  };

  const handleDepartmentSaved = (savedDept: DepartmentDto) => {
    setDepartments((prev) => {
      const exists = prev.some((d) => d.id === savedDept.id);
      const next = exists
        ? prev.map((d) => (d.id === savedDept.id ? savedDept : d))
        : [savedDept, ...prev];
      setSessionData("rbac_departments", next);
      return next;
    });
    showToast(`Department "${savedDept.name}" saved successfully!`);
    setEditingDepartment(null);
  };

  const handlePermissionSaved = (savedPerm: PermissionDto) => {
    setPermissions((prev) => {
      const exists = prev.some((p) => p.id === savedPerm.id);
      const next = exists
        ? prev.map((p) => (p.id === savedPerm.id ? savedPerm : p))
        : [savedPerm, ...prev];
      setSessionData("rbac_permissions", next);
      return next;
    });
    showToast(`Permission "${savedPerm.name}" saved successfully!`);
    setEditingPermission(null);
  };

  const handlePageSaved = (savedPage: PageDto) => {
    setPages((prev) => {
      const exists = prev.some((p) => p.id === savedPage.id);
      const next = exists
        ? prev.map((p) => (p.id === savedPage.id ? savedPage : p))
        : [savedPage, ...prev];
      setSessionData("rbac_pages", next);
      return next;
    });
    showToast(`Page "${savedPage.name}" saved successfully!`);
    setEditingPage(null);
  };

  const handleRpaSaved = (savedRpa: RolePageAccessDto | RolePageAccessDto[]) => {
    const itemsToAdd = Array.isArray(savedRpa) ? savedRpa : [savedRpa];
    setRolePageAccesses((prev) => {
      let next = [...prev];
      itemsToAdd.forEach((item) => {
        const exists = next.some((a) => a.id === item.id);
        if (exists) {
          next = next.map((a) => (a.id === item.id ? item : a));
        } else {
          next = [item, ...next];
        }
      });
      setSessionData("rbac_role_page_accesses", next);
      return next;
    });
    showToast(
      itemsToAdd.length > 1
        ? `${itemsToAdd.length} pages assigned to role successfully!`
        : "Role-page access saved successfully!"
    );
    setEditingRpa(null);
  };

  const handleRppSaved = (savedRpp: RolePagePermissionDto) => {
    setRolePagePermissions((prev) => {
      const exists = prev.some((r) => r.id === savedRpp.id);
      const next = exists
        ? prev.map((r) => (r.id === savedRpp.id ? savedRpp : r))
        : [savedRpp, ...prev];
      setSessionData("rbac_role_page_permissions", next);
      return next;
    });
    showToast(`Role-page permission saved successfully!`);
    setEditingRpp(null);
  };

  const exportCSV = () => {
    const headers = ["Full Name", "First Name", "Last Name", "Email", "Phone", "Department", "Role", "Status", "Created At"];
    const rows = employees.map((e) => [
      `"${e.fullName || `${e.firstName} ${e.lastName}`}"`,
      `"${e.firstName}"`,
      `"${e.lastName}"`,
      `"${e.email || ""}"`,
      `"${e.phoneNumber || ""}"`,
      `"${e.departmentName || ""}"`,
      `"${e.roleName || ""}"`,
      `"${e.isActive ? "Active" : "Inactive"}"`,
      `"${e.createdAt || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `employees_directory_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Employee directory exported to CSV.");
  };

  // Distinct roles (excluding Super Admin)
  const distinctRoles = useMemo(() => {
    const set = new Set<string>();
    roles.forEach((r) => {
      if (r.roleName && !r.isSuperAdmin && r.roleName.toLowerCase() !== "super admin") {
        set.add(r.roleName);
      }
    });
    employees.forEach((e) => {
      if (e.roleName && e.roleName.toLowerCase() !== "super admin") {
        set.add(e.roleName);
      }
    });
    return Array.from(set);
  }, [roles, employees]);

  // Distinct departments
  const distinctDepartments = useMemo(() => {
    const set = new Set<string>();
    departments.forEach((d) => {
      if (d.name) set.add(d.name);
    });
    employees.forEach((e) => {
      if (e.departmentName) set.add(e.departmentName);
    });
    return Array.from(set);
  }, [departments, employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const name = (e.fullName || `${e.firstName} ${e.lastName}`).toLowerCase();
      const email = (e.email || "").toLowerCase();
      const phone = (e.phoneNumber || "").toLowerCase();
      const dept = (e.departmentName || "").toLowerCase();
      const role = (e.roleName || "").toLowerCase();
      const search = searchTerm.toLowerCase();

      const matchSearch =
        name.includes(search) ||
        email.includes(search) ||
        phone.includes(search) ||
        dept.includes(search) ||
        role.includes(search);

      const matchDept = departmentFilter === "ALL" || (e.departmentName && e.departmentName.toLowerCase() === departmentFilter.toLowerCase());
      const matchRole = roleFilter === "ALL" || (e.roleName && e.roleName.toLowerCase() === roleFilter.toLowerCase());
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "Active" && e.isActive) ||
        (statusFilter === "Inactive" && !e.isActive);

      return matchSearch && matchDept && matchRole && matchStatus;
    });
  }, [employees, searchTerm, departmentFilter, roleFilter, statusFilter]);

  const filteredRoles = useMemo(() => {
    return roles.filter((r) => {
      const name = (r.roleName || "").toLowerCase();
      const desc = (r.description || "").toLowerCase();
      const search = roleSearchTerm.toLowerCase();
      return name.includes(search) || desc.includes(search);
    });
  }, [roles, roleSearchTerm]);

  const filteredDepartments = useMemo(() => {
    return departments.filter((d) => {
      const name = (d.name || "").toLowerCase();
      const code = (d.departmentCode || d.code || "").toLowerCase();
      const search = departmentSearchTerm.toLowerCase();
      return name.includes(search) || code.includes(search);
    });
  }, [departments, departmentSearchTerm]);

  const filteredPermissions = useMemo(() => {
    return permissions.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const act = (p.action || "").toLowerCase();
      const desc = (p.description || "").toLowerCase();
      const search = permissionSearchTerm.toLowerCase();
      return name.includes(search) || act.includes(search) || desc.includes(search);
    });
  }, [permissions, permissionSearchTerm]);

  const filteredPages = useMemo(() => {
    return pages.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const route = (p.route || "").toLowerCase();
      const parent = (p.parentPageName || "").toLowerCase();
      const search = pageSearchTerm.toLowerCase();
      return name.includes(search) || route.includes(search) || parent.includes(search);
    });
  }, [pages, pageSearchTerm]);

  const filteredRolePageAccesses = useMemo(() => {
    return rolePageAccesses.filter((rpa) => {
      const role = (rpa.roleName || "").toLowerCase();
      const page = (rpa.pageName || "").toLowerCase();
      const route = (rpa.pageRoute || "").toLowerCase();
      const search = rpaSearchTerm.toLowerCase();
      return role.includes(search) || page.includes(search) || route.includes(search);
    });
  }, [rolePageAccesses, rpaSearchTerm]);

  const filteredRolePagePermissions = useMemo(() => {
    return rolePagePermissions.filter((rpp) => {
      const accessId = (rpp.rolePageAccessId || "").toLowerCase();
      const permName = (rpp.permissionName || "").toLowerCase();
      const permAction = (rpp.permissionAction || "").toLowerCase();
      const page = (rpp.pageName || "").toLowerCase();
      const search = rppSearchTerm.toLowerCase();
      return (
        accessId.includes(search) ||
        permName.includes(search) ||
        permAction.includes(search) ||
        page.includes(search)
      );
    });
  }, [rolePagePermissions, rppSearchTerm]);

  const activeCount = employees.filter((e) => e.isActive).length;
  const inactiveCount = employees.filter((e) => !e.isActive).length;

  return (
    <div className="space-y-6 text-[#191c1e] font-sans pb-12 w-full max-w-full">
      {/* Toast notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 bg-[#0f172a] text-white px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center space-x-3 transition-all animate-fadeIn">
          <span className="material-symbols-outlined text-emerald-400">check_circle</span>
          <span className="text-sm font-semibold">{notification}</span>
        </div>
      )}

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <span>Admin</span>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
              <span className="text-slate-900 font-bold">
                {activeTab === "employees"
                  ? "Employee Directory"
                  : activeTab === "role"
                  ? "Role Configuration"
                  : activeTab === "department"
                  ? "Department Directory"
                  : activeTab === "permissions"
                  ? "Permissions Configuration"
                  : activeTab === "pages"
                  ? "Pages Configuration"
                  : "Role Permissions Matrix"}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {activeTab === "employees"
                ? "Employees & RBAC"
                : activeTab === "role"
                ? "Role Management"
                : activeTab === "department"
                ? "Department Management"
                : activeTab === "permissions"
                ? "Permission Management"
                : activeTab === "pages"
                ? "Page Management"
                : "Role Permissions Matrix"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {activeTab === "employees"
                ? "Manage employee directory, departmental assignments, and role-based permissions."
                : activeTab === "role"
                ? "Create, configure, and manage system roles and permissions."
                : activeTab === "department"
                ? "Manage company departments, organizational codes, and staff assignments."
                : activeTab === "permissions"
                ? "Define and manage access permissions, action verbs, and system privileges."
                : activeTab === "pages"
                ? "Configure system navigation routes, page metadata, icons, and hierarchy."
                : "Hierarchical matrix to assign pages and CRUD permissions (Read, Modify, Add, Delete) to roles."}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handleResetSessionData}
              title="Reset all in-memory/session records back to initial state"
              className="bg-white text-slate-600 font-bold text-xs py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-all shadow-sm flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base text-rose-500">restart_alt</span>
              <span>Reset Test Data</span>
            </button>

            {activeTab === "employees" && (
              <>
                <button
                  type="button"
                  onClick={exportCSV}
                  className="bg-white text-slate-900 font-bold text-xs py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">download</span> Export CSV
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingEmployee(null);
                    setIsAddEmployeeModalOpen(true);
                  }}
                  className="bg-slate-900 text-white font-bold text-xs py-2.5 px-4 rounded-xl hover:bg-slate-800 transition-all shadow-md flex items-center gap-2 active:scale-95"
                >
                  <span className="material-symbols-outlined text-base">person_add</span> Add Employee
                </button>
              </>
            )}

            {activeTab === "role" && (
              <button
                type="button"
                onClick={() => {
                  setEditingRole(null);
                  setIsRoleModalOpen(true);
                }}
                className="bg-slate-900 text-white font-bold text-xs py-2.5 px-4 rounded-xl hover:bg-slate-800 transition-all shadow-md flex items-center gap-2 active:scale-95"
              >
                <span className="material-symbols-outlined text-base">add_moderator</span> Add Role
              </button>
            )}

            {activeTab === "department" && (
              <button
                type="button"
                onClick={() => {
                  setEditingDepartment(null);
                  setIsDepartmentModalOpen(true);
                }}
                className="bg-slate-900 text-white font-bold text-xs py-2.5 px-4 rounded-xl hover:bg-slate-800 transition-all shadow-md flex items-center gap-2 active:scale-95"
              >
                <span className="material-symbols-outlined text-base">domain_add</span> Add Department
              </button>
            )}

            {activeTab === "permissions" && (
              <button
                type="button"
                onClick={() => {
                  setEditingPermission(null);
                  setIsPermissionModalOpen(true);
                }}
                className="bg-slate-900 text-white font-bold text-xs py-2.5 px-4 rounded-xl hover:bg-slate-800 transition-all shadow-md flex items-center gap-2 active:scale-95"
              >
                <span className="material-symbols-outlined text-base">vpn_key</span> Add Permission
              </button>
            )}

            {activeTab === "pages" && (
              <button
                type="button"
                onClick={() => {
                  setEditingPage(null);
                  setIsPageModalOpen(true);
                }}
                className="bg-slate-900 text-white font-bold text-xs py-2.5 px-4 rounded-xl hover:bg-slate-800 transition-all shadow-md flex items-center gap-2 active:scale-95"
              >
                <span className="material-symbols-outlined text-base">add_to_photos</span> Add Page
              </button>
            )}


          </div>
        </div>

        {/* Summary Cards Bento (3 Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Total Employees
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {employees.length}
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">{activeCount} active personnel</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">badge</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Roles &amp; Departments
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
                {roles.length} / {departments.length}
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">Configured roles / departments</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-900 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">security</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Pages &amp; Access Rules
              </span>
              <div className="text-2xl sm:text-3xl font-black text-purple-700 mt-1">
                {pages.length} / {rolePageAccesses.length}
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">Registered pages / Role assignments</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-900 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">lock_open</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation & Directory */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="border-b border-slate-200 px-6 pt-4 flex gap-6 bg-slate-50/60 overflow-x-auto">
            {/* Employee Directory Tab */}
            <button
              type="button"
              onClick={() => setActiveTab("employees")}
              className={`pb-3 font-mono text-xs font-bold transition-all border-b-2 flex items-center gap-2 shrink-0 ${
                activeTab === "employees"
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <span className="material-symbols-outlined text-base">groups</span>
              Employee Directory
            </button>

            {/* Role Tab */}
            <button
              type="button"
              onClick={() => setActiveTab("role")}
              className={`pb-3 font-mono text-xs font-bold transition-all border-b-2 flex items-center gap-2 shrink-0 ${
                activeTab === "role"
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <span className="material-symbols-outlined text-base">security</span>
              Role
            </button>

            {/* Department Tab */}
            <button
              type="button"
              onClick={() => setActiveTab("department")}
              className={`pb-3 font-mono text-xs font-bold transition-all border-b-2 flex items-center gap-2 shrink-0 ${
                activeTab === "department"
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <span className="material-symbols-outlined text-base">apartment</span>
              Department
            </button>

            {/* Permissions Tab */}
            <button
              type="button"
              onClick={() => setActiveTab("permissions")}
              className={`pb-3 font-mono text-xs font-bold transition-all border-b-2 flex items-center gap-2 shrink-0 ${
                activeTab === "permissions"
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <span className="material-symbols-outlined text-base">vpn_key</span>
              Permissions
            </button>

            {/* Pages Tab */}
            <button
              type="button"
              onClick={() => setActiveTab("pages")}
              className={`pb-3 font-mono text-xs font-bold transition-all border-b-2 flex items-center gap-2 shrink-0 ${
                activeTab === "pages"
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <span className="material-symbols-outlined text-base">web</span>
              Pages
            </button>

            {/* Role Permissions Matrix Tab */}
            <button
              type="button"
              onClick={() => setActiveTab("rolepermissions")}
              className={`pb-3 font-mono text-xs font-bold transition-all border-b-2 flex items-center gap-2 shrink-0 ${
                activeTab === "rolepermissions"
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <span className="material-symbols-outlined text-base">admin_panel_settings</span>
              Role Permissions
            </button>
          </div>

          {activeTab === "employees" && (
            <div className="p-0 flex-1">
              {/* Table Toolbar */}
              <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row justify-between items-center gap-4 bg-slate-50/40">
                <div className="relative w-full lg:w-96">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search by name, email, phone, role, dept..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors shadow-sm"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto font-mono text-xs">
                  <span className="text-slate-400 font-bold text-[10px] uppercase mr-1">FILTER:</span>

                  {/* Department Filter */}
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="ALL">All Departments</option>
                    {distinctDepartments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>

                  {/* Role Filter */}
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="ALL">All Roles</option>
                    {distinctRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="ALL">Status: All</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>

                  <button
                    type="button"
                    onClick={loadEmployees}
                    title="Refresh data"
                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">refresh</span>
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-slate-200 font-mono text-[10px] text-slate-500 uppercase tracking-wider">
                      <th className="px-6 py-3 font-bold">Employee Details</th>
                      <th className="px-6 py-3 font-bold">Contact &amp; Phone</th>
                      <th className="px-6 py-3 font-bold">Department</th>
                      <th className="px-6 py-3 font-bold">Assigned Role</th>
                      <th className="px-6 py-3 font-bold">Status</th>
                      <th className="px-6 py-3 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 font-mono">
                          <span className="material-symbols-outlined text-3xl mb-1 text-slate-300 block">person_search</span>
                          No employees found matching your filters.
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map((emp) => {
                        const displayName = emp.fullName || `${emp.firstName} ${emp.lastName}`;
                        const initials = getInitials(emp.firstName, emp.lastName, emp.fullName);
                        const colorClass = getAvatarColor(displayName);

                        return (
                          <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                            {/* Employee Details */}
                            <td className="px-6 py-3.5">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-sm shrink-0 ${colorClass}`}
                                >
                                  {initials}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900 text-sm leading-snug">{displayName}</div>
                                  <div className="text-slate-500 font-mono text-[11px]">{emp.email || "No email"}</div>
                                </div>
                              </div>
                            </td>

                            {/* Contact & Phone */}
                            <td className="px-6 py-3.5 font-mono text-slate-700">
                              <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-slate-400 text-sm">call</span>
                                <span>{emp.phoneNumber || "N/A"}</span>
                              </div>
                            </td>

                            {/* Department */}
                            <td className="px-6 py-3.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-slate-900 text-xs">
                                  {emp.departmentName || "Engineering"}
                                </span>
                                {emp.departmentCode && (
                                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] font-bold border border-slate-200">
                                    {emp.departmentCode}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Role */}
                            <td className="px-6 py-3.5">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 font-mono font-bold text-[11px]">
                                {emp.roleName || "Staff"}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="px-6 py-3.5">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                                  emp.isActive
                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                    : "bg-rose-50 text-rose-800 border border-rose-200"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    emp.isActive ? "bg-emerald-600" : "bg-rose-600"
                                  }`}
                                ></span>
                                {emp.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-3.5 text-right relative">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingEmployee(emp);
                                    setIsAddEmployeeModalOpen(true);
                                  }}
                                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                  title="Edit Employee"
                                >
                                  <span className="material-symbols-outlined text-base">edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEmployee(emp.id, displayName)}
                                  title="Delete Employee"
                                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-rose-50"
                                >
                                  <span className="material-symbols-outlined text-base">delete</span>
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

              {/* Table Footer */}
              <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50/60 font-mono text-xs text-slate-500">
                <span>
                  Showing {filteredEmployees.length} of {employees.length} employees
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled
                    className="p-1.5 rounded border border-slate-200 text-slate-300 disabled:opacity-40"
                  >
                    <span className="material-symbols-outlined text-base">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    className="p-1.5 rounded border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "role" && (
            /* Role Tab Content */
            <div className="p-0 flex-1">
              {/* Role Table Toolbar */}
              <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/40">
                <div className="relative w-full sm:w-80">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search roles by name or description..."
                    value={roleSearchTerm}
                    onChange={(e) => setRoleSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors shadow-sm"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={loadRoles}
                    title="Refresh roles"
                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">refresh</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingRole(null);
                      setIsRoleModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition-all shadow flex items-center gap-1.5 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                    <span>New Role</span>
                  </button>
                </div>
              </div>

              {/* Role Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-slate-200 font-mono text-[10px] text-slate-500 uppercase tracking-wider">
                      <th className="px-6 py-3 font-bold">Role Name</th>
                      <th className="px-6 py-3 font-bold">Description</th>
                      <th className="px-6 py-3 font-bold">Assigned Personnel</th>
                      <th className="px-6 py-3 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredRoles.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-400 font-mono">
                          <span className="material-symbols-outlined text-3xl mb-1 text-slate-300 block">security</span>
                          No roles found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredRoles.map((role) => {
                        const assignedStaffCount = employees.filter(
                          (e) => e.roleName?.toLowerCase() === role.roleName.toLowerCase()
                        ).length;

                        return (
                          <tr key={role.id} className="hover:bg-slate-50/80 transition-colors">
                            {/* Role Name */}
                            <td className="px-6 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center font-bold shrink-0">
                                  <span className="material-symbols-outlined text-base">security</span>
                                </div>
                                <span className="font-bold text-slate-900 text-sm leading-snug">
                                  {role.roleName}
                                </span>
                              </div>
                            </td>

                            {/* Description */}
                            <td className="px-6 py-3.5 text-slate-600 max-w-md">
                              <span className="line-clamp-2">
                                {role.description || <span className="text-slate-400 italic">No description provided</span>}
                              </span>
                            </td>

                            {/* Assigned Personnel */}
                            <td className="px-6 py-3.5">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 font-mono font-bold text-[11px]">
                                <span className="material-symbols-outlined text-xs text-slate-500">group</span>
                                {assignedStaffCount} {assignedStaffCount === 1 ? "Employee" : "Employees"}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingRole(role);
                                    setIsRoleModalOpen(true);
                                  }}
                                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                  title="Edit Role"
                                >
                                  <span className="material-symbols-outlined text-base">edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRole(role.id, role.roleName)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Delete Role"
                                >
                                  <span className="material-symbols-outlined text-base">delete</span>
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

              {/* Table Footer */}
              <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50/60 font-mono text-xs text-slate-500">
                <span>
                  Showing {filteredRoles.length} of {roles.length} roles
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled
                    className="p-1.5 rounded border border-slate-200 text-slate-300 disabled:opacity-40"
                  >
                    <span className="material-symbols-outlined text-base">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    className="p-1.5 rounded border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "department" && (
            /* Department Tab Content */
            <div className="p-0 flex-1">
              {/* Department Table Toolbar */}
              <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/40">
                <div className="relative w-full sm:w-80">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search departments by name or code..."
                    value={departmentSearchTerm}
                    onChange={(e) => setDepartmentSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors shadow-sm"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={loadDepartments}
                    title="Refresh departments"
                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">refresh</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingDepartment(null);
                      setIsDepartmentModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition-all shadow flex items-center gap-1.5 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                    <span>New Department</span>
                  </button>
                </div>
              </div>

              {/* Department Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-slate-200 font-mono text-[10px] text-slate-500 uppercase tracking-wider">
                      <th className="px-6 py-3 font-bold">Department Name</th>
                      <th className="px-6 py-3 font-bold">Department Code</th>
                      <th className="px-6 py-3 font-bold">Assigned Personnel</th>
                      <th className="px-6 py-3 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredDepartments.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-400 font-mono">
                          <span className="material-symbols-outlined text-3xl mb-1 text-slate-300 block">apartment</span>
                          No departments found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredDepartments.map((dept) => {
                        const deptCode = dept.departmentCode || dept.code || "DEP";
                        const assignedStaffCount = employees.filter(
                          (e) =>
                            e.departmentName?.toLowerCase() === dept.name?.toLowerCase() ||
                            e.departmentId === dept.id
                        ).length;

                        return (
                          <tr key={dept.id} className="hover:bg-slate-50/80 transition-colors">
                            {/* Department Name */}
                            <td className="px-6 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-900 flex items-center justify-center font-bold shrink-0">
                                  <span className="material-symbols-outlined text-base">apartment</span>
                                </div>
                                <span className="font-bold text-slate-900 text-sm leading-snug">
                                  {dept.name}
                                </span>
                              </div>
                            </td>

                            {/* Department Code */}
                            <td className="px-6 py-3.5 font-mono">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-200">
                                {deptCode}
                              </span>
                            </td>

                            {/* Assigned Personnel */}
                            <td className="px-6 py-3.5">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 font-mono font-bold text-[11px]">
                                <span className="material-symbols-outlined text-xs text-slate-500">group</span>
                                {assignedStaffCount} {assignedStaffCount === 1 ? "Employee" : "Employees"}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingDepartment(dept);
                                    setIsDepartmentModalOpen(true);
                                  }}
                                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                  title="Edit Department"
                                >
                                  <span className="material-symbols-outlined text-base">edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Delete Department"
                                >
                                  <span className="material-symbols-outlined text-base">delete</span>
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

              {/* Table Footer */}
              <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50/60 font-mono text-xs text-slate-500">
                <span>
                  Showing {filteredDepartments.length} of {departments.length} departments
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled
                    className="p-1.5 rounded border border-slate-200 text-slate-300 disabled:opacity-40"
                  >
                    <span className="material-symbols-outlined text-base">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    className="p-1.5 rounded border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "permissions" && (
            /* Permissions Tab Content */
            <div className="p-0 flex-1">
              {/* Permission Table Toolbar */}
              <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/40">
                <div className="relative w-full sm:w-80">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search permissions by name, action or description..."
                    value={permissionSearchTerm}
                    onChange={(e) => setPermissionSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors shadow-sm"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={loadPermissions}
                    title="Refresh permissions"
                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">refresh</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPermission(null);
                      setIsPermissionModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition-all shadow flex items-center gap-1.5 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                    <span>New Permission</span>
                  </button>
                </div>
              </div>

              {/* Permissions Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-slate-200 font-mono text-[10px] text-slate-500 uppercase tracking-wider">
                      <th className="px-6 py-3 font-bold">Permission Name</th>
                      <th className="px-6 py-3 font-bold">Action (Method)</th>
                      <th className="px-6 py-3 font-bold">Description</th>
                      <th className="px-6 py-3 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredPermissions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-400 font-mono">
                          <span className="material-symbols-outlined text-3xl mb-1 text-slate-300 block">vpn_key</span>
                          No permissions found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredPermissions.map((perm) => {
                        const badgeColor = getActionBadgeColor(perm.action);

                        return (
                          <tr key={perm.id} className="hover:bg-slate-50/80 transition-colors">
                            {/* Permission Name */}
                            <td className="px-6 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-900 flex items-center justify-center font-bold shrink-0">
                                  <span className="material-symbols-outlined text-base">key</span>
                                </div>
                                <span className="font-bold text-slate-900 text-sm leading-snug">
                                  {perm.name}
                                </span>
                              </div>
                            </td>

                            {/* Action Method Badge */}
                            <td className="px-6 py-3.5 font-mono">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${badgeColor}`}
                              >
                                {perm.action.toUpperCase()}
                              </span>
                            </td>

                            {/* Description */}
                            <td className="px-6 py-3.5 text-slate-600 max-w-md">
                              <span className="line-clamp-2">
                                {perm.description || <span className="text-slate-400 italic">No description provided</span>}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingPermission(perm);
                                    setIsPermissionModalOpen(true);
                                  }}
                                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                  title="Edit Permission"
                                >
                                  <span className="material-symbols-outlined text-base">edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePermission(perm.id, perm.name)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Delete Permission"
                                >
                                  <span className="material-symbols-outlined text-base">delete</span>
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

              {/* Table Footer */}
              <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50/60 font-mono text-xs text-slate-500">
                <span>
                  Showing {filteredPermissions.length} of {permissions.length} permissions
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled
                    className="p-1.5 rounded border border-slate-200 text-slate-300 disabled:opacity-40"
                  >
                    <span className="material-symbols-outlined text-base">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    className="p-1.5 rounded border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "pages" && (
            /* Pages Tab Content */
            <div className="p-0 flex-1">
              {/* Page Table Toolbar */}
              <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/40">
                <div className="relative w-full sm:w-80">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search pages by name, route, parent..."
                    value={pageSearchTerm}
                    onChange={(e) => setPageSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors shadow-sm"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={loadPages}
                    title="Refresh pages"
                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">refresh</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPage(null);
                      setIsPageModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition-all shadow flex items-center gap-1.5 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                    <span>New Page</span>
                  </button>
                </div>
              </div>

              {/* Page Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-slate-200 font-mono text-[10px] text-slate-500 uppercase tracking-wider">
                      <th className="px-6 py-3 font-bold">Page Name</th>
                      <th className="px-6 py-3 font-bold">Route Path</th>
                      <th className="px-6 py-3 font-bold">Parent Page</th>
                      <th className="px-6 py-3 font-bold">Order</th>
                      <th className="px-6 py-3 font-bold">Status</th>
                      <th className="px-6 py-3 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredPages.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 font-mono">
                          <span className="material-symbols-outlined text-3xl mb-1 text-slate-300 block">web</span>
                          No pages found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredPages.map((page) => {
                        return (
                          <tr key={page.id} className="hover:bg-slate-50/80 transition-colors">
                            {/* Page Name & Icon */}
                            <td className="px-6 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center font-bold shrink-0">
                                  <span className="material-symbols-outlined text-base">
                                    {normalizeIcon(page.icon)}
                                  </span>
                                </div>
                                <span className="font-bold text-slate-900 text-sm leading-snug">
                                  {page.name}
                                </span>
                              </div>
                            </td>

                            {/* Route Path */}
                            <td className="px-6 py-3.5 font-mono">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold text-[11px] border border-slate-200">
                                {page.route}
                              </span>
                            </td>

                            {/* Parent Page */}
                            <td className="px-6 py-3.5">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700 font-mono text-[11px]">
                                <span className="material-symbols-outlined text-xs text-slate-400">subdirectory_arrow_right</span>
                                {page.parentPageName || page.parentPageId || <span className="text-slate-400 italic">None (Root)</span>}
                              </span>
                            </td>

                            {/* Order */}
                            <td className="px-6 py-3.5 font-mono text-slate-700">
                              <span className="font-bold">{page.displayOrder ?? 1}</span>
                            </td>

                            {/* Status */}
                            <td className="px-6 py-3.5">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                                  page.isActive
                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                    : "bg-rose-50 text-rose-800 border border-rose-200"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    page.isActive ? "bg-emerald-600" : "bg-rose-600"
                                  }`}
                                ></span>
                                {page.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingPage(page);
                                    setIsPageModalOpen(true);
                                  }}
                                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                  title="Edit Page"
                                >
                                  <span className="material-symbols-outlined text-base">edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePage(page.id, page.name)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Delete Page"
                                >
                                  <span className="material-symbols-outlined text-base">delete</span>
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

              {/* Table Footer */}
              <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50/60 font-mono text-xs text-slate-500">
                <span>
                  Showing {filteredPages.length} of {pages.length} pages
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled
                    className="p-1.5 rounded border border-slate-200 text-slate-300 disabled:opacity-40"
                  >
                    <span className="material-symbols-outlined text-base">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    className="p-1.5 rounded border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* UNIFIED ROLE PERMISSIONS MATRIX */}
          {activeTab === "rolepermissions" && (
            <RolePermissionsMatrix
              roles={roles}
              pages={pages}
              permissions={permissions}
              onPermissionsChanged={() => {
                loadRolePageAccesses();
                loadRolePagePermissions();
              }}
            />
          )}
</div>

        {/* Permissions Blueprint Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-slate-900 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-base">RBAC Security Blueprint</h3>
            <p className="text-xs text-slate-500">
              Active security governance rules applied across all manufacturing lines and employee accounts.
            </p>
            <ul className="space-y-2 font-mono text-xs text-slate-800">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                Role-based module authorization
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                Audit trail event logging
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                Department-level data isolation
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Create / Edit Employee Modal */}
      <CreateEmployeeModal
        isOpen={isAddEmployeeModalOpen}
        onClose={() => {
          setIsAddEmployeeModalOpen(false);
          setEditingEmployee(null);
        }}
        onSaved={handleEmployeeSaved}
        initialData={editingEmployee}
        existingDepartments={departments}
        existingRoles={roles}
      />

      {/* Create / Edit Role Modal */}
      <CreateRoleModal
        isOpen={isRoleModalOpen}
        onClose={() => {
          setIsRoleModalOpen(false);
          setEditingRole(null);
        }}
        onSaved={handleRoleSaved}
        initialData={editingRole}
      />

      {/* Create / Edit Department Modal */}
      <CreateDepartmentModal
        isOpen={isDepartmentModalOpen}
        onClose={() => {
          setIsDepartmentModalOpen(false);
          setEditingDepartment(null);
        }}
        onSaved={handleDepartmentSaved}
        initialData={editingDepartment}
      />

      {/* Create / Edit Permission Modal */}
      <CreatePermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => {
          setIsPermissionModalOpen(false);
          setEditingPermission(null);
        }}
        onSaved={handlePermissionSaved}
        initialData={editingPermission}
      />

      {/* Create / Edit Page Modal */}
      <CreatePageModal
        isOpen={isPageModalOpen}
        onClose={() => {
          setIsPageModalOpen(false);
          setEditingPage(null);
        }}
        onSaved={handlePageSaved}
        initialData={editingPage}
        existingPages={pages}
      />

      {/* Create / Edit Role Page Access Modal */}
      <CreateRolePageAccessModal
        isOpen={isRpaModalOpen}
        onClose={() => {
          setIsRpaModalOpen(false);
          setEditingRpa(null);
        }}
        onSaved={handleRpaSaved}
        initialData={editingRpa}
        roles={roles}
        pages={pages}
        existingAccesses={rolePageAccesses}
      />

      {/* Create / Edit Role Page Permission Modal */}
      <CreateRolePagePermissionModal
        isOpen={isRppModalOpen}
        onClose={() => {
          setIsRppModalOpen(false);
          setEditingRpp(null);
        }}
        onSaved={handleRppSaved}
        initialData={editingRpp}
        permissions={permissions}
        pages={pages}
        roles={roles}
        rolePageAccesses={rolePageAccesses}
      />
    </div>
  );
}
