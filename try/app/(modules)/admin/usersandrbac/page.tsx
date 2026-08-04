"use client";

import React, { useState, useMemo } from "react";

export interface UserItem {
  id: string;
  name: string;
  email: string;
  systemId: string;
  role: string;
  status: "Active" | "Suspended" | "Pending";
  lastActive: string;
  initials: string;
  colorClass: string;
}

const INITIAL_USERS: UserItem[] = [
  {
    id: "1",
    name: "Jane Doe",
    email: "jane.doe@kaam.io",
    systemId: "USR-9482",
    role: "Floor Manager",
    status: "Active",
    lastActive: "10 mins ago",
    initials: "JD",
    colorClass: "bg-slate-900 text-white",
  },
  {
    id: "2",
    name: "Robert Smith",
    email: "r.smith@kaam.io",
    systemId: "USR-1023",
    role: "Operator L2",
    status: "Active",
    lastActive: "2 hrs ago",
    initials: "RS",
    colorClass: "bg-blue-100 text-blue-900",
  },
  {
    id: "3",
    name: "Maria Kowalski",
    email: "m.kowalski@kaam.io",
    systemId: "USR-8834",
    role: "Forklift Op",
    status: "Suspended",
    lastActive: "4 days ago",
    initials: "MK",
    colorClass: "bg-slate-200 text-slate-700",
  },
  {
    id: "4",
    name: "Alexander Vance",
    email: "a.vance@kaam.io",
    systemId: "USR-4410",
    role: "System Admin",
    status: "Active",
    lastActive: "Just now",
    initials: "AV",
    colorClass: "bg-purple-100 text-purple-900",
  },
  {
    id: "5",
    name: "Sunita Shrestha",
    email: "s.shrestha@kaam.io",
    systemId: "USR-5521",
    role: "Floor Manager",
    status: "Active",
    lastActive: "1 hr ago",
    initials: "SS",
    colorClass: "bg-emerald-100 text-emerald-900",
  },
];

export default function UsersAndRbacPage() {
  const [users, setUsers] = useState<UserItem[]>(INITIAL_USERS);
  const [activeTab, setActiveTab] = useState<"users" | "roles">("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.systemId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = roleFilter === "ALL" || u.role.toLowerCase() === roleFilter.toLowerCase();
      const matchStatus = statusFilter === "ALL" || u.status.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

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
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Users &amp; RBAC
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage personnel access, assigned security roles, and system permissions.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => showToast("Exporting users directory to CSV...")}
              className="bg-white text-slate-900 font-bold text-xs py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">download</span> Export CSV
            </button>
            <button
              type="button"
              onClick={() => showToast("Opening Add User dialog...")}
              className="bg-slate-900 text-white font-bold text-xs py-2.5 px-4 rounded-xl hover:bg-slate-800 transition-all shadow-md flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">person_add</span> Add User
            </button>
          </div>
        </div>

        {/* Summary Cards Bento (3 Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Total Active Users
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {users.filter((u) => u.status === "Active").length}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">group</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Pending Approvals
              </span>
              <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">
                {users.filter((u) => u.status === "Pending").length || 2}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">pending_actions</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">
                System Admins
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {users.filter((u) => u.role === "System Admin").length || 1}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-900 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation & Directory */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="border-b border-slate-200 px-6 pt-4 flex gap-6 bg-slate-50/60">
            <button
              type="button"
              onClick={() => setActiveTab("users")}
              className={`pb-3 font-mono text-xs font-bold transition-all border-b-2 ${
                activeTab === "users"
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              Users Directory
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("roles")}
              className={`pb-3 font-mono text-xs font-bold transition-all border-b-2 ${
                activeTab === "roles"
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              Roles &amp; Permissions
            </button>
          </div>

          {activeTab === "users" ? (
            <div className="p-0 flex-1">
              {/* Table Toolbar */}
              <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/40">
                <div className="relative w-full sm:w-80">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search by name, ID, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors shadow-sm"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto font-mono text-xs">
                  <span className="text-slate-400 font-bold text-[10px] uppercase mr-1">FILTER BY:</span>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="Floor Manager">Floor Manager</option>
                    <option value="Operator L2">Operator L2</option>
                    <option value="Forklift Op">Forklift Op</option>
                    <option value="System Admin">System Admin</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="ALL">Status: All</option>
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-slate-200 font-mono text-[10px] text-slate-500 uppercase tracking-wider">
                      <th className="px-6 py-3 font-bold">User Details</th>
                      <th className="px-6 py-3 font-bold">System ID</th>
                      <th className="px-6 py-3 font-bold">Assigned Role</th>
                      <th className="px-6 py-3 font-bold">Status</th>
                      <th className="px-6 py-3 font-bold">Last Active</th>
                      <th className="px-6 py-3 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 font-mono">
                          No users found matching your filters.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm shrink-0 ${u.colorClass}`}
                              >
                                {u.initials}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-sm leading-snug">{u.name}</div>
                                <div className="text-slate-500 font-mono text-[11px]">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-3.5 font-mono font-bold text-slate-700">{u.systemId}</td>

                          <td className="px-6 py-3.5">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 font-mono font-bold text-[11px]">
                              {u.role}
                            </span>
                          </td>

                          <td className="px-6 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                                u.status === "Active"
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : "bg-rose-50 text-rose-800 border border-rose-200"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  u.status === "Active" ? "bg-emerald-600" : "bg-rose-600"
                                }`}
                              ></span>
                              {u.status}
                            </span>
                          </td>

                          <td className="px-6 py-3.5 font-mono text-slate-500">{u.lastActive}</td>

                          <td className="px-6 py-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => showToast(`User actions for ${u.name}`)}
                              className="text-slate-400 hover:text-slate-900 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
                            >
                              <span className="material-symbols-outlined text-base">more_vert</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50/60 font-mono text-xs text-slate-500">
                <span>Showing {filteredUsers.length} of {users.length} users</span>
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
          ) : (
            /* Roles & Permissions Tab Content */
            <div className="p-6 space-y-4 font-mono text-xs text-slate-700">
              <h3 className="font-bold text-sm text-slate-900">Configured System Roles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-sm">Floor Manager</span>
                    <span className="bg-slate-200 text-slate-800 text-[10px] px-2 py-0.5 rounded font-bold">2 Users</span>
                  </div>
                  <p className="text-slate-500 text-[11px] font-sans">Supervises daily shopfloor operations, inventory moves, and staff scheduling.</p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-sm">System Admin</span>
                    <span className="bg-slate-200 text-slate-800 text-[10px] px-2 py-0.5 rounded font-bold">1 User</span>
                  </div>
                  <p className="text-slate-500 text-[11px] font-sans">Full administrative control over user onboarding, RBAC permissions, and master data.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Permissions Blueprint Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-slate-900 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-base">Role Blueprint: Floor Manager</h3>
            <p className="text-xs text-slate-500">
              Quick overview of capabilities assigned to the currently selected role filter.
            </p>
            <ul className="space-y-2 font-mono text-xs text-slate-800">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                Inventory Edit &amp; Stock Movements
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                Staff Shift Scheduling
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-500 text-base">cancel</span>
                Global System Configuration
              </li>
            </ul>
            <button
              type="button"
              onClick={() => showToast("Navigating to Role Editor...")}
              className="mt-2 text-slate-900 font-mono text-xs font-bold hover:underline uppercase flex items-center gap-1"
            >
              Edit Permissions <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
