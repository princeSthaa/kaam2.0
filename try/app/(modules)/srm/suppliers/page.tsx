"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  fetchSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  SupplierDto
} from "../api/supplier.api";

interface Supplier {
  id: string;
  name: string;
  code: string;
  category: "FABRIC" | "TRIMS" | "HARDWARE" | "PACKAGING" | string;
  status: "ACTIVE" | "UNDER REVIEW" | "BLACKLISTED" | string;
  lastAudit: string;
  materialsSupplied: string;
  email: string;
  phone: string;
  location: string;
  complianceScore: number;
  materialCategoryIds?: string[];
}

const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: "1",
    name: "Indigo Textiles Co.",
    code: "SUP-24091",
    category: "FABRIC",
    status: "ACTIVE",
    lastAudit: "Oct 12, 2023",
    materialsSupplied: "14,200 m",
    email: "contact@indigotextiles.com",
    phone: "+977 1-4235890",
    location: "Kathmandu, Nepal",
    complianceScore: 96,
  },
  {
    id: "2",
    name: "Global Threads",
    code: "SUP-19283",
    category: "TRIMS",
    status: "UNDER REVIEW",
    lastAudit: "Nov 05, 2023",
    materialsSupplied: "8,940 units",
    email: "info@globalthreads.org",
    phone: "+977 1-5521098",
    location: "Lalitpur, Nepal",
    complianceScore: 82,
  },
  {
    id: "3",
    name: "Apex Trims Ltd",
    code: "SUP-88210",
    category: "HARDWARE",
    status: "ACTIVE",
    lastAudit: "Aug 19, 2023",
    materialsSupplied: "42,100 units",
    email: "sales@apextrims.com",
    phone: "+880 2-8812903",
    location: "Dhaka, Bangladesh",
    complianceScore: 94,
  },
  {
    id: "4",
    name: "Loom & Shuttle",
    code: "SUP-00452",
    category: "FABRIC",
    status: "BLACKLISTED",
    lastAudit: "Dec 01, 2022",
    materialsSupplied: "0 m",
    email: "compliance@loomshuttle.io",
    phone: "+91 11-4902188",
    location: "Surat, India",
    complianceScore: 45,
  },
  {
    id: "5",
    name: "Vanguard Synthetics",
    code: "SUP-33104",
    category: "FABRIC",
    status: "ACTIVE",
    lastAudit: "Jan 14, 2024",
    materialsSupplied: "28,500 m",
    email: "orders@vanguardsyn.com",
    phone: "+86 20-8349210",
    location: "Guangzhou, China",
    complianceScore: 98,
  },
  {
    id: "6",
    name: "Precision Hardware Corp",
    code: "SUP-77120",
    category: "HARDWARE",
    status: "ACTIVE",
    lastAudit: "Feb 02, 2024",
    materialsSupplied: "105,000 units",
    email: "support@precisionhw.com",
    phone: "+86 574-8790123",
    location: "Ningbo, China",
    complianceScore: 92,
  },
  {
    id: "7",
    name: "EcoPack Solutions",
    code: "SUP-66201",
    category: "PACKAGING",
    status: "ACTIVE",
    lastAudit: "Jan 28, 2024",
    materialsSupplied: "54,000 units",
    email: "green@ecopack.np",
    phone: "+977 1-4781200",
    location: "Bhaktapur, Nepal",
    complianceScore: 99,
  },
  {
    id: "8",
    name: "Himalayan Zippers & Fasteners",
    code: "SUP-41092",
    category: "TRIMS",
    status: "UNDER REVIEW",
    lastAudit: "Mar 10, 2024",
    materialsSupplied: "12,300 units",
    email: "zippers@himalayan.com",
    phone: "+977 1-4439012",
    location: "Kathmandu, Nepal",
    complianceScore: 78,
  },
];

function CategoryMultiSelect({ selectedIds, onChange }: { selectedIds: string[], onChange: (ids: string[]) => void }) {
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetch("http://localhost:5083/api/material")
      .then(res => res.json())
      .then((data: any[]) => {
        const unique = new Map();
        if (Array.isArray(data)) {
          data.forEach(item => {
            if (item.materialCategoryId && item.materialTypeName) {
              unique.set(item.materialCategoryId, item.materialTypeName);
            }
          });
        }
        const catArray = Array.from(unique.entries()).map(([id, name]) => ({ id, name }));
        setCategories(catArray);
      })
      .catch(err => console.error("Failed to fetch material categories:", err));
  }, []);

  const filtered = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(x => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <div 
        className="w-full min-h-[40px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus-within:ring-2 focus-within:ring-slate-900 cursor-pointer flex flex-wrap gap-2 items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedIds.length === 0 && <span className="text-slate-400">Select Categories...</span>}
        {selectedIds.map(id => {
          const cat = categories.find(c => c.id === id);
          return (
            <span key={id} className="bg-slate-900 text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 shadow-sm">
              {cat ? cat.name.toUpperCase() : id}
              <span 
                className="material-symbols-outlined text-[14px] cursor-pointer hover:text-slate-300" 
                onClick={(e) => { e.stopPropagation(); toggle(id); }}
              >
                close
              </span>
            </span>
          );
        })}
      </div>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 flex flex-col overflow-hidden">
          <div className="p-2 border-b border-slate-100 bg-slate-50 sticky top-0">
            <input 
              type="text" 
              placeholder="Search categories..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded text-slate-900 outline-none text-xs focus:ring-1 focus:ring-slate-900"
              onClick={e => e.stopPropagation()}
            />
          </div>
          <div className="overflow-y-auto p-1">
            {filtered.map(cat => (
              <div 
                key={cat.id} 
                className="px-3 py-2 hover:bg-slate-100 rounded cursor-pointer flex items-center gap-2 text-xs font-semibold text-slate-700 transition-colors"
                onClick={(e) => { e.stopPropagation(); toggle(cat.id); }}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedIds.includes(cat.id) ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-300 bg-white'}`}>
                  {selectedIds.includes(cat.id) && <span className="material-symbols-outlined text-[12px] font-bold">check</span>}
                </div>
                {cat.name}
              </div>
            ))}
            {filtered.length === 0 && <div className="px-3 py-4 text-center text-xs text-slate-500">No categories found</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [activeTab, setActiveTab] = useState<"DIRECTORY" | "COMPLIANCE">("DIRECTORY");

  // Modals state
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({
    category: "FABRIC",
    status: "ACTIVE",
    materialCategoryIds: [],
  });

  const loadSuppliersFromApi = async () => {
    try {
      const data = await fetchSuppliers();
      if (Array.isArray(data) && data.length > 0) {
        const mapped: Supplier[] = data.map((s: SupplierDto) => ({
          id: s.id,
          name: s.name,
          code: s.supplierCode || "SUP-AUTO",
          category: (s.materialCategories?.[0]?.name?.toUpperCase() as any) || "FABRIC",
          status: s.status === "Blacklisted" ? "BLACKLISTED" : s.status === "Inactive" ? "UNDER REVIEW" : "ACTIVE",
          lastAudit: s.updatedAt ? new Date(s.updatedAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "Recently",
          materialsSupplied: `${s.totalOrders || 0} orders`,
          email: s.contactEmail || "contact@company.com",
          phone: s.contactPhone || "+977 1-0000000",
          location: s.address || "Kathmandu, Nepal",
          complianceScore: s.rating ? Math.round(s.rating) : 90,
        }));
        setSuppliers(mapped);
      }
    } catch (err) {
      console.warn("Backend API supplier fetch failed, using initial store:", err);
    }
  };

  useEffect(() => {
    loadSuppliersFromApi();
  }, []);

  // Filtered suppliers calculation
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier) => {
      const matchesSearch =
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "ALL" || supplier.category === selectedCategory;

      const matchesStatus =
        selectedStatus === "ALL" || supplier.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [suppliers, searchTerm, selectedCategory, selectedStatus]);

  // Statistics calculation
  const totalCount = suppliers.length;
  const activeCount = suppliers.filter((s) => s.status === "ACTIVE").length;
  const reviewCount = suppliers.filter((s) => s.status === "UNDER REVIEW").length;
  const avgCompliance = (
    suppliers.reduce((acc, curr) => acc + curr.complianceScore, 0) / (suppliers.length || 1)
  ).toFixed(1);

  const handleAddSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.name || !newSupplier.code) return;

    try {
      await createSupplier({
        supplierCode: newSupplier.code,
        name: newSupplier.name,
        contactEmail: newSupplier.email || "",
        contactPhone: newSupplier.phone || "",
        address: newSupplier.location || "",
        status: newSupplier.status === "BLACKLISTED" ? "Blacklisted" : newSupplier.status === "UNDER REVIEW" ? "Inactive" : "Active",
        materialCategoryIds: newSupplier.materialCategoryIds || [],
      });

      await loadSuppliersFromApi();
    } catch (err) {
      console.error("Failed to create supplier via API:", err);
      const created: Supplier = {
        id: String(Date.now()),
        name: newSupplier.name,
        code: newSupplier.code,
        category: (newSupplier.category as any) || "FABRIC",
        status: (newSupplier.status as any) || "ACTIVE",
        lastAudit: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
        materialsSupplied: newSupplier.materialsSupplied || "0 units",
        email: newSupplier.email || "supplier@example.com",
        phone: newSupplier.phone || "+977 1-0000000",
        location: newSupplier.location || "Kathmandu, Nepal",
        complianceScore: 90,
      };

      setSuppliers((prev) => [created, ...prev]);
    }

    setIsAddModalOpen(false);
    setNewSupplier({ category: "FABRIC", status: "ACTIVE", materialCategoryIds: [] });
  };

  const handleEditSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier) return;

    try {
      if (editingSupplier.id.includes("-")) {
        await updateSupplier(editingSupplier.id, {
          supplierCode: editingSupplier.code,
          name: editingSupplier.name,
          contactEmail: editingSupplier.email,
          contactPhone: editingSupplier.phone,
          address: editingSupplier.location,
          status: editingSupplier.status === "BLACKLISTED" ? "Blacklisted" : editingSupplier.status === "UNDER REVIEW" ? "Inactive" : "Active"
        });
        await loadSuppliersFromApi();
      }
    } catch (err) {
      console.error("Failed to update supplier via API:", err);
    }

    setSuppliers(
      suppliers.map((s) => (s.id === editingSupplier.id ? editingSupplier : s))
    );
    if (selectedSupplier && selectedSupplier.id === editingSupplier.id) {
      setSelectedSupplier(editingSupplier);
    }
    setEditingSupplier(null);
  };

  const exportSupplierList = () => {
    const jsonStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(filteredSuppliers, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `suppliers_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Page Title & Main Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Supplier Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage and audit your global supply network from a centralized hub.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportSupplierList}
            className="flex items-center space-x-2 px-4 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-semibold text-xs rounded-lg shadow-sm transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Export List</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 font-semibold text-xs rounded-lg shadow transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>Add Supplier</span>
          </button>
        </div>
      </div>
      {/* Stats Overview Grid (4 KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Suppliers */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between min-h-[150px]">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Suppliers
            </span>
            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-800">
              <span className="material-symbols-outlined text-xl">assignment_turned_in</span>
            </div>
          </div>
          <div className="text-4xl font-bold text-slate-900">{totalCount}</div>
        </div>

        {/* Active Partners */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between min-h-[150px]">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Partners
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <span className="material-symbols-outlined text-xl">check_circle</span>
            </div>
          </div>
          <div className="text-4xl font-bold text-slate-900">{activeCount}</div>
        </div>

        {/* Under Review */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between min-h-[150px]">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Under Review
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700">
              <span className="material-symbols-outlined text-xl">pending</span>
            </div>
          </div>
          <div className="text-4xl font-bold text-slate-900">{reviewCount}</div>
        </div>

        {/* Audit Compliance */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between min-h-[150px]">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Audit Compliance
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-700">
              <span className="material-symbols-outlined text-xl">rule</span>
            </div>
          </div>
          <div className="text-4xl font-bold text-slate-900">{avgCompliance}%</div>
        </div>
      </div>

      {/* Directory Grid & Table Section */}
      <div className="srm-glass-card rounded-2xl overflow-hidden border border-slate-200">
        {/* Table Controls Bar */}
        <div className="p-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative min-w-[240px] flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                search
              </span>
              <input
                type="text"
                placeholder="Search by name, ID or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all"
              />
            </div>

            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs font-semibold border border-slate-200 bg-slate-50 rounded-lg py-2 px-3 focus:ring-2 focus:ring-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="ALL">CATEGORY: ALL</option>
              <option value="FABRIC">FABRIC</option>
              <option value="TRIMS">TRIMS</option>
              <option value="HARDWARE">HARDWARE</option>
              <option value="PACKAGING">PACKAGING</option>
            </select>

            {/* Status Select */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs font-semibold border border-slate-200 bg-slate-50 rounded-lg py-2 px-3 focus:ring-2 focus:ring-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="ALL">STATUS: ALL</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="UNDER REVIEW">UNDER REVIEW</option>
              <option value="BLACKLISTED">BLACKLISTED</option>
            </select>
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-500 font-mono">
            <span>
              DISPLAYING {filteredSuppliers.length} OF {suppliers.length}
            </span>
          </div>
        </div>

        {/* Supplier Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100/70 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Supplier Name
                </th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Last Audit
                </th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider text-right">
                  Materials Supplied
                </th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-4xl block mb-2">
                      search_off
                    </span>
                    No matching suppliers found. Try modifying filters.
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="srm-table-row">
                    {/* Supplier Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                          {getInitials(supplier.name)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 text-sm">
                            {supplier.name}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            ID: {supplier.code}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-bold font-mono">
                        {supplier.category}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {supplier.status === "ACTIVE" && (
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md srm-badge-active">
                          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                          <span className="font-mono text-xs font-bold">ACTIVE</span>
                        </div>
                      )}
                      {supplier.status === "UNDER REVIEW" && (
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md srm-badge-warning">
                          <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                          <span className="font-mono text-xs font-bold">UNDER REVIEW</span>
                        </div>
                      )}
                      {supplier.status === "BLACKLISTED" && (
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md srm-badge-error">
                          <span className="w-2 h-2 rounded-full bg-red-600"></span>
                          <span className="font-mono text-xs font-bold">BLACKLISTED</span>
                        </div>
                      )}
                    </td>

                    {/* Last Audit */}
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">
                      {supplier.lastAudit}
                    </td>

                    {/* Materials Supplied */}
                    <td className="px-6 py-4 text-right font-mono text-xs font-bold text-slate-900">
                      {supplier.materialsSupplied}
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedSupplier(supplier)}
                        className="text-slate-900 hover:text-blue-600 font-bold text-xs uppercase tracking-wide hover:underline transition-all"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
          <button className="flex items-center space-x-1 font-semibold hover:text-slate-900 transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Previous</span>
          </button>
          <div className="flex items-center space-x-1 font-mono">
            <button className="w-7 h-7 rounded bg-slate-900 text-white font-bold">
              1
            </button>
            <button className="w-7 h-7 rounded hover:bg-slate-200">2</button>
            <button className="w-7 h-7 rounded hover:bg-slate-200">3</button>
            <span>...</span>
            <button className="w-7 h-7 rounded hover:bg-slate-200">12</button>
          </div>
          <button className="flex items-center space-x-1 font-semibold hover:text-slate-900 transition-colors">
            <span>Next</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Contextual Insights Section */}
      <div className="pt-2">
        {/* Supplier Risks Card */}
        <div className="srm-glass-card rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center justify-between">
              <span>Supplier Risks</span>
              <span className="text-xs font-mono text-red-600 bg-red-50 px-2 py-0.5 rounded">
                2 ALERTS
              </span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50/80 rounded-xl border border-red-200">
                <div className="flex items-center space-x-3">
                  <span className="material-symbols-outlined text-red-600">report</span>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Indigo Textiles</div>
                    <div className="text-[11px] text-slate-500">Audit Expiring (4 days)</div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-sm hover:text-slate-900 cursor-pointer">
                  arrow_forward
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-amber-50/80 rounded-xl border border-amber-200">
                <div className="flex items-center space-x-3">
                  <span className="material-symbols-outlined text-amber-600">warning</span>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Apex Trims</div>
                    <div className="text-[11px] text-slate-500">New Lead Time Issue</div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-sm hover:text-slate-900 cursor-pointer">
                  arrow_forward
                </span>
              </div>
            </div>
          </div>

          {/* Risk Score Trend */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase mb-2">
              Risk Score Trend
            </div>
            <div className="flex items-end space-x-2 h-12">
              <div className="flex-1 bg-slate-300 rounded-t h-1/2" title="W1"></div>
              <div className="flex-1 bg-slate-300 rounded-t h-3/4" title="W2"></div>
              <div className="flex-1 bg-slate-400 rounded-t h-2/3" title="W3"></div>
              <div className="flex-1 bg-slate-900 rounded-t h-full" title="W4 Current"></div>
              <div className="flex-1 bg-slate-300 rounded-t h-1/3" title="W5"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Supplier Profile Detail Modal (Stitch Screen 17ad6fb5139e4f15a91dedda8d9fb40e) */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 lg:p-8 srm-modal-backdrop overflow-y-auto">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col relative border border-slate-200 srm-modal-content">
            {/* Close Button */}
            <button
              onClick={() => setSelectedSupplier(null)}
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors z-20"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            {/* Main Content Body */}
            <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-slate-50">
              {/* Header Banner */}
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white font-bold text-lg flex items-center justify-center shadow">
                    {getInitials(selectedSupplier.name)}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-900">
                      {selectedSupplier.name}
                    </h1>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className="bg-emerald-50 text-emerald-700 font-mono font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        {selectedSupplier.status}
                      </span>
                      <span className="text-slate-500 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">
                          location_on
                        </span>
                        {selectedSupplier.location}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold shadow-sm transition-all">
                    <span className="material-symbols-outlined text-base">
                      contact_support
                    </span>
                    <span>Contact</span>
                  </button>
                  <button
                    onClick={() => setEditingSupplier(selectedSupplier)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-semibold shadow transition-all"
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                    <span>Edit Profile</span>
                  </button>
                </div>
              </header>

              {/* Performance Summary Bento Grid */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-mono">
                    Performance Summary
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Last Audit: {selectedSupplier.lastAudit}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Card 1 */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-28">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                      <span>ON-TIME DELIVERY</span>
                      <span className="material-symbols-outlined text-slate-700">schedule</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-slate-900">94.8%</span>
                      <span className="text-emerald-600 font-mono text-xs font-bold">+1.2%</span>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-28">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                      <span>QUALITY GRADE</span>
                      <span className="material-symbols-outlined text-slate-700">verified</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-slate-900">A-</span>
                      <span className="text-slate-500 font-mono text-xs">Top 5%</span>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-white p-4 rounded-xl border-l-4 border-l-emerald-600 border border-slate-200 shadow-sm flex flex-col justify-between h-28">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                      <span>RISK LEVEL</span>
                      <span className="material-symbols-outlined text-emerald-600">gpp_good</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-emerald-700 uppercase">Low</span>
                      <span className="text-slate-500 font-mono text-xs">Stable</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Contact Info & Recent Transactions Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Contact Information (1 col) */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
                  <h3 className="font-bold text-slate-900 font-mono uppercase tracking-wider border-b border-slate-100 pb-2">
                    Contact Information
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <span className="material-symbols-outlined text-slate-400 text-base">person</span>
                      <div>
                        <p className="text-[10px] text-slate-400 font-mono uppercase">Primary Liaison</p>
                        <p className="font-bold text-slate-900">Roberto Mendoza</p>
                        <p className="text-[11px] text-slate-500">Procurement Director</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <span className="material-symbols-outlined text-slate-400 text-base">mail</span>
                      <div>
                        <p className="text-[10px] text-slate-400 font-mono uppercase">Email Address</p>
                        <p className="font-medium text-slate-900 underline truncate">
                          {selectedSupplier.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <span className="material-symbols-outlined text-slate-400 text-base">call</span>
                      <div>
                        <p className="text-[10px] text-slate-400 font-mono uppercase">Phone Number</p>
                        <p className="font-medium text-slate-900">{selectedSupplier.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <span className="material-symbols-outlined text-slate-400 text-base">domain</span>
                      <div>
                        <p className="text-[10px] text-slate-400 font-mono uppercase">Location</p>
                        <p className="text-slate-700">{selectedSupplier.location}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Transactions Table (2 cols) */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between text-xs">
                  <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 font-mono uppercase tracking-wider">
                      Recent Transactions
                    </h3>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Supplied: {selectedSupplier.materialsSupplied}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px]">
                        <tr>
                          <th className="px-4 py-2.5 uppercase">PO Number</th>
                          <th className="px-4 py-2.5 uppercase">Date</th>
                          <th className="px-4 py-2.5 uppercase">Value</th>
                          <th className="px-4 py-2.5 uppercase text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-xs">
                        <tr className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-bold text-slate-900">#PO-2023-8821</td>
                          <td className="px-4 py-3 text-slate-600">Oct 08, 2023</td>
                          <td className="px-4 py-3 font-bold text-slate-900">Rs 42,350.00</td>
                          <td className="px-4 py-3 text-right">
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">
                              DELIVERED
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-bold text-slate-900">#PO-2023-8794</td>
                          <td className="px-4 py-3 text-slate-600">Sep 24, 2023</td>
                          <td className="px-4 py-3 font-bold text-slate-900">Rs 18,900.00</td>
                          <td className="px-4 py-3 text-right">
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">
                              DELIVERED
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-bold text-slate-900">#PO-2023-8910</td>
                          <td className="px-4 py-3 text-slate-600">Oct 11, 2023</td>
                          <td className="px-4 py-3 font-bold text-slate-900">Rs 112,400.00</td>
                          <td className="px-4 py-3 text-right">
                            <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-200">
                              TRANSIT
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Active Materials Catalog */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-mono">
                    Active Materials Catalog ({selectedSupplier.category})
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
                      <span className="material-symbols-outlined text-lg">texture</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400">M-882-C</span>
                      <h4 className="font-bold text-slate-900">Egyptian Cotton 800TC</h4>
                      <p className="text-[10px] font-mono text-emerald-600 font-semibold">IN STOCK: 2,400kg</p>
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
                      <span className="material-symbols-outlined text-lg">waves</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400">M-910-S</span>
                      <h4 className="font-bold text-slate-900">Ultra-Strength Silk</h4>
                      <p className="text-[10px] font-mono text-amber-600 font-semibold">LOW STOCK: 120kg</p>
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
                      <span className="material-symbols-outlined text-lg">colorize</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400">D-441-B</span>
                      <h4 className="font-bold text-slate-900">Reactive Indigo Dye</h4>
                      <p className="text-[10px] font-mono text-emerald-600 font-semibold">IN STOCK: 4,000L</p>
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
                      <span className="material-symbols-outlined text-lg">category</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400">P-122-Z</span>
                      <h4 className="font-bold text-slate-900">Industrial Spindles</h4>
                      <p className="text-[10px] font-mono text-slate-500">REORDERED: 50 units</p>
                    </div>
                  </div>
                </div>
              </section>
            </main>
          </div>
        </div>
      )}

      {/* Add Supplier Modal (Stitch Onboarding Design) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 srm-modal-backdrop overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 srm-modal-content space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow">
                  <span className="material-symbols-outlined">add_business</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Create New Account</h2>
                  <p className="text-xs text-slate-500 font-sans">
                    Initialize entry for Industrial SRM procurement
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {/* <span className="px-2.5 py-1 bg-slate-100 rounded font-mono text-xs text-slate-700 font-bold border border-slate-200">
                  ID: K-SRM-8821
                </span> */}
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* Modal Body - 2 Columns Bento Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Form (8 cols) */}
              <form onSubmit={handleAddSupplierSubmit} className="lg:col-span-8 space-y-6 text-xs">
                {/* Core Identity Section */}
                <section className="space-y-3">
                  <h3 className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1 h-3 bg-slate-900 rounded-full"></span>
                    CORE IDENTITY
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">BRAND / COMPANY NAME *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Apex Industrial Fabrics"
                        value={newSupplier.name || ""}
                        onChange={(e) =>
                          setNewSupplier({ ...newSupplier, name: e.target.value })
                        }
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">SUPPLIER CODE *</label>
                      <input
                        type="text"
                        required
                        placeholder="SUP-FAB-2026-X"
                        value={newSupplier.code || ""}
                        onChange={(e) =>
                          setNewSupplier({ ...newSupplier, code: e.target.value })
                        }
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="font-semibold text-slate-700 block mb-1">CATEGORIES</label>
                      <div className="relative">
                        <CategoryMultiSelect 
                          selectedIds={newSupplier.materialCategoryIds || []} 
                          onChange={(ids) => setNewSupplier({ ...newSupplier, materialCategoryIds: ids })} 
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Communication Nodes Section */}
                <section className="space-y-3">
                  <h3 className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1 h-3 bg-slate-900 rounded-full"></span>
                    COMMUNICATION NODES
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">EMAIL ADDRESS</label>
                      <input
                        type="email"
                        placeholder="name@company.com"
                        value={newSupplier.email || ""}
                        onChange={(e) =>
                          setNewSupplier({ ...newSupplier, email: e.target.value })
                        }
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">PHONE</label>
                      <input
                        type="tel"
                        placeholder="+977 1-4000000"
                        value={newSupplier.phone || ""}
                        onChange={(e) =>
                          setNewSupplier({ ...newSupplier, phone: e.target.value })
                        }
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </section>

                {/* Physical Location Section */}
                <section className="space-y-3">
                  <h3 className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1 h-3 bg-slate-900 rounded-full"></span>
                    PHYSICAL LOCATION
                  </h3>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">PRIMARY ADDRESS</label>
                    <textarea
                      rows={2}
                      placeholder="Full facility address including City, Country"
                      value={newSupplier.location || ""}
                      onChange={(e) =>
                        setNewSupplier({ ...newSupplier, location: e.target.value })
                      }
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none resize-none"
                    ></textarea>
                  </div>
                </section>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-5 py-2.5 font-mono text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    DISCARD
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-slate-900 text-white font-mono text-xs font-bold rounded-lg shadow-lg hover:bg-slate-800 active:scale-95 transition-all"
                  >
                    CREATE SUPPLIER ACCOUNT
                  </button>
                </div>
              </form>

              {/* Right Column: Visual Preview Cards (4 cols) */}
              <div className="lg:col-span-4 space-y-4">
                {/* Onboarding Preview Card */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col items-center text-center space-y-3">
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    ONBOARDING PREVIEW
                  </div>
                  <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow">
                    {newSupplier.name ? getInitials(newSupplier.name) : "SUP"}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {newSupplier.name || "Brand Name Placeholder"}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">
                      {newSupplier.code || "SUP-AUTO-ID"}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold rounded border border-emerald-200 inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-ping"></span>
                    ACTIVE REG
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Supplier Profile Modal (Stitch Screen e94d7e52336c48969932aef18ccc0f5c) */}
      {editingSupplier && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 srm-modal-backdrop overflow-y-auto">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col relative border border-slate-200 srm-modal-content">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 shadow-sm">
                  <span className="material-symbols-outlined text-xl">edit_note</span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight font-mono">
                    Edit Supplier Profile
                  </h2>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="font-semibold text-slate-800">{editingSupplier.name}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-mono text-[11px] text-slate-600 bg-slate-200/60 px-1.5 py-0.5 rounded font-bold">
                      {editingSupplier.code}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setEditingSupplier(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditSupplierSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* Core Identity */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 pb-1 border-b border-slate-200">
                  <span className="material-symbols-outlined text-slate-700 text-base">domain</span>
                  <h3 className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Core Identity
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1">
                    <label className="font-semibold text-slate-700">Brand / Company Name</label>
                    <input
                      type="text"
                      required
                      value={editingSupplier.name}
                      onChange={(e) =>
                        setEditingSupplier({ ...editingSupplier, name: e.target.value })
                      }
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Supplier Code</label>
                    <div className="relative">
                      <input
                        type="text"
                        disabled
                        value={editingSupplier.code}
                        className="w-full h-10 px-3 bg-slate-100 border border-dashed border-slate-300 rounded-lg font-mono text-slate-500 cursor-not-allowed"
                      />
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                        lock
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Category</label>
                    <select
                      value={editingSupplier.category}
                      onChange={(e) =>
                        setEditingSupplier({
                          ...editingSupplier,
                          category: e.target.value as any,
                        })
                      }
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    >
                      <option value="FABRIC">Fabric</option>
                      <option value="TRIMS">Trims</option>
                      <option value="HARDWARE">Hardware</option>
                      <option value="PACKAGING">Packaging</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 pb-1 border-b border-slate-200">
                  <span className="material-symbols-outlined text-slate-700 text-base">contact_phone</span>
                  <h3 className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Contact Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Email Address</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                        mail
                      </span>
                      <input
                        type="email"
                        value={editingSupplier.email}
                        onChange={(e) =>
                          setEditingSupplier({ ...editingSupplier, email: e.target.value })
                        }
                        className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Phone Number</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                        call
                      </span>
                      <input
                        type="tel"
                        value={editingSupplier.phone}
                        onChange={(e) =>
                          setEditingSupplier({ ...editingSupplier, phone: e.target.value })
                        }
                        className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Physical Location */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 pb-1 border-b border-slate-200">
                  <span className="material-symbols-outlined text-slate-700 text-base">location_on</span>
                  <h3 className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Physical Location
                  </h3>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Billing Address</label>
                  <textarea
                    rows={2}
                    value={editingSupplier.location}
                    onChange={(e) =>
                      setEditingSupplier({ ...editingSupplier, location: e.target.value })
                    }
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Helper Banner */}
              <div className="flex items-center space-x-3 p-3 bg-slate-100 rounded-xl border border-slate-200 text-slate-700">
                <span className="material-symbols-outlined text-slate-800 text-base">info</span>
                <p className="text-[11px] leading-tight">
                  Changes will reflect across all open contracts and procurement cycles.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingSupplier(null)}
                  className="px-5 py-2.5 font-mono text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-slate-900 text-white font-mono text-xs font-bold rounded-lg shadow-lg hover:bg-slate-800 active:scale-95 transition-all flex items-center space-x-2"
                >
                  <span className="material-symbols-outlined text-base">save</span>
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
