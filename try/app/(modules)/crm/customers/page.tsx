"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useCustomers } from "../hooks";
import { CustomerRow } from "../components/CustomerRow";
import { EditCustomerModal } from "../components/EditCustomerModal";
import { deleteCustomer } from "../api/constant";
import { Customer } from "../dto/customer.dto";

export default function CrmCustomerFilterPage() {
  const { customers, loading, refetch } = useCustomers();
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "type" | "id" | "company">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleEdit = (c: Customer) => {
    setEditingCustomer(c);
  };

  const handleCustomerSaved = (updated: Customer) => {
    showToast(`Customer "${updated.name}" updated successfully!`);
    refetch();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCustomer?.id) return;
    setIsDeleting(true);
    try {
      await deleteCustomer(deletingCustomer.id);
      showToast(`Customer "${deletingCustomer.name}" deleted successfully.`);
      setDeletingCustomer(null);
      refetch();
    } catch (err: any) {
      console.error(err);
      showToast(err?.message || "Failed to delete customer.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReset = () => {
    setSearchQuery("");
    setTypeFilter("");
    setSortBy("name");
    setSortOrder("asc");
    setCurrentPage(1);
  };

  // Filtered and Sorted Customers
  const filtered = useMemo(() => {
    let result = [...customers];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          (c.name || "").toLowerCase().includes(q) ||
          (c.email || "").toLowerCase().includes(q) ||
          (c.phone || "").toLowerCase().includes(q) ||
          (c.address || "").toLowerCase().includes(q) ||
          (c.company || "").toLowerCase().includes(q) ||
          (c.panVat || "").toLowerCase().includes(q) ||
          (c.id || "").toLowerCase().includes(q)
      );
    }

    if (typeFilter) {
      result = result.filter(
        (c) => (c.type || "").toLowerCase() === typeFilter.toLowerCase()
      );
    }

    result.sort((a, b) => {
      let valA = "";
      let valB = "";
      if (sortBy === "name") {
        valA = a.name || "";
        valB = b.name || "";
      } else if (sortBy === "type") {
        valA = a.type || "";
        valB = b.type || "";
      } else if (sortBy === "company") {
        valA = a.company || "";
        valB = b.company || "";
      } else if (sortBy === "id") {
        valA = a.id || "";
        valB = b.id || "";
      }
      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });

    return result;
  }, [customers, searchQuery, typeFilter, sortBy, sortOrder]);

  // Paginated Slices
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-[10000] px-4 py-3 rounded-xl shadow-xl border flex items-center gap-2.5 text-xs font-bold transition-all animate-bounce ${
            toastMessage.type === "success"
              ? "bg-emerald-900 text-emerald-100 border-emerald-700"
              : "bg-rose-900 text-rose-100 border-rose-700"
          }`}
        >
          <span className="material-symbols-outlined text-base">
            {toastMessage.type === "success" ? "check_circle" : "error"}
          </span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-xl">contacts</span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                Customer Management
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Directory of retail, wholesale, distributor, and corporate clients.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-2xs transition-all"
            title="Refresh list"
          >
            <span className={`material-symbols-outlined text-sm ${loading ? "animate-spin" : ""}`}>
              refresh
            </span>
            <span>Refresh</span>
          </button>
          <Link
            href="/crm/customers/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-sm font-bold">add</span>
            <span>Add Customer</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center">
          {/* Search Box */}
          <div className="lg:col-span-6 relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              search
            </span>
            <input
              type="text"
              placeholder="Search by name, email, phone, address, company, or PAN..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-sm">cancel</span>
              </button>
            )}
          </div>

          {/* Type Filter */}
          <div className="lg:col-span-3">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none cursor-pointer transition-all"
            >
              <option value="">All Customer Types</option>
              <option value="Retail">Retail</option>
              <option value="Wholesale">Wholesale</option>
              <option value="Distributor">Distributor</option>
              <option value="Export">Export</option>
              <option value="Corporate">Corporate</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="lg:col-span-2">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split("-") as [any, any];
                setSortBy(sb);
                setSortOrder(so);
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none cursor-pointer transition-all"
            >
              <option value="name-asc">Name (A &rarr; Z)</option>
              <option value="name-desc">Name (Z &rarr; A)</option>
              <option value="type-asc">Type (A &rarr; Z)</option>
              <option value="company-asc">Company (A &rarr; Z)</option>
              <option value="id-asc">ID (Ascending)</option>
            </select>
          </div>

          {/* Reset */}
          <div className="lg:col-span-1 flex justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-colors flex items-center justify-center gap-1"
              title="Reset all filters"
            >
              <span className="material-symbols-outlined text-sm">filter_alt_off</span>
              <span className="lg:hidden">Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Customers Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
          <div>
            <h2 className="font-extrabold text-sm text-slate-900">
              Customer Directory
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} &ndash;{" "}
              {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} total customer records
            </p>
          </div>

          {/* Rows per page selector */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Customer ID</th>
                <th className="py-3 px-4">Customer &amp; Type</th>
                <th className="py-3 px-4">Contact Information</th>
                <th className="py-3 px-4">Address / Location</th>
                <th className="py-3 px-4">Company &amp; PAN</th>
                <th className="py-3 px-4 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <div className="inline-flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-3xl animate-spin text-blue-600">
                        progress_activity
                      </span>
                      <span className="font-semibold text-xs text-slate-600">
                        Loading customers...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <div className="inline-flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-3xl text-slate-300">
                        person_search
                      </span>
                      <span className="font-bold text-xs text-slate-700">
                        No customers match your criteria
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Try adjusting search filters or adding a new customer.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((c) => (
                  <CustomerRow
                    key={c.id || Math.random()}
                    customer={c}
                    onEdit={handleEdit}
                    onDelete={(cust) => setDeletingCustomer(cust)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 font-medium">
              Page <strong className="text-slate-800">{currentPage}</strong> of{" "}
              <strong className="text-slate-800">{totalPages}</strong>
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-bold transition-all shadow-2xs"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, idx, arr) => (
                  <span key={p} className="flex items-center">
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="px-1 text-slate-400 font-mono">...</span>
                    )}
                    <button
                      type="button"
                      onClick={() => setCurrentPage(p)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                        currentPage === p
                          ? "bg-slate-900 text-white shadow-xs"
                          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {p}
                    </button>
                  </span>
                ))}
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-bold transition-all shadow-2xs"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Customer Modal */}
      <EditCustomerModal
        isOpen={!!editingCustomer}
        customer={editingCustomer}
        onClose={() => setEditingCustomer(null)}
        onSaved={handleCustomerSaved}
      />

      {/* Delete Confirmation Modal */}
      {deletingCustomer && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 text-slate-800 animate-scaleUp">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">delete_forever</span>
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Delete Customer</h3>
                <p className="text-xs text-slate-500 font-medium">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Are you sure you want to permanently delete customer{" "}
              <strong className="text-slate-900 font-bold">"{deletingCustomer.name}"</strong> (
              <span className="font-mono">{deletingCustomer.id}</span>)?
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingCustomer(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all flex items-center gap-1.5 disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Customer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
