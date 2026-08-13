"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { fetchProducts, ProductDto } from "./api/product.api";
import { fetchSuppliers, SupplierDto } from "./api/supplier.api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for things we don't have APIs for yet
  const stats = {
    totalUsers: 142,
    activeWarehouses: 4,
    totalProducts: products.length,
    totalSuppliers: suppliers.length,
  };

  const auditLogs = [
    { id: 1, user: "John Doe", action: "Created new product 'Denim Jacket'", time: "2 mins ago" },
    { id: 2, user: "Sarah Smith", action: "Updated supplier 'ABC Textiles'", time: "1 hour ago" },
    { id: 3, user: "Admin", action: "Modified role permissions for 'Warehouse Manager'", time: "3 hours ago" },
    { id: 4, user: "Mike Johnson", action: "Added new warehouse 'North Wing'", time: "5 hours ago" },
    { id: 5, user: "Admin", action: "Deleted obsolete material category", time: "1 day ago" },
  ];

  useEffect(() => {
    Promise.all([
      fetchProducts().catch(() => []),
      fetchSuppliers().catch(() => [])
    ]).then(([prods, sups]) => {
      setProducts(prods);
      setSuppliers(sups);
      setLoading(false);
    });
  }, []);

  // Prepare chart data
  const userGrowthData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "Active Users",
        data: [65, 78, 90, 105, 120, 135, 142],
        borderColor: "#0f172a",
        backgroundColor: "rgba(15, 23, 42, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Group products by category ID/Name
  const categoryCounts: Record<string, number> = {};
  products.forEach(p => {
    const cat = p.categoryId || p.productCategoryId || "Uncategorized";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  
  // If no products, provide dummy data for visualization
  const hasProducts = products.length > 0;
  
  const productCategoryData = {
    labels: hasProducts ? Object.keys(categoryCounts) : ["Apparel", "Footwear", "Accessories", "Raw Materials"],
    datasets: [
      {
        data: hasProducts ? Object.values(categoryCounts) : [45, 25, 20, 10],
        backgroundColor: ["#0f172a", "#3b82f6", "#10b981", "#f59e0b", "#6366f1", "#ec4899"],
        borderWidth: 0,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: "#f1f5f9" } },
      x: { grid: { display: false } }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "right" as const },
    },
    cutout: "70%",
  };

  if (loading) {
    return (
      <div className="pp-page min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="pp-page p-6 max-w-[1600px] mx-auto bg-slate-50/50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Overview</h1>
        <p className="text-slate-500 mt-1 text-sm">Monitor system health, data quality, and recent administrative activities.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl">group</span>
          </div>
          <div className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">Total Users</div>
          <div className="text-4xl font-extrabold text-slate-900">{stats.totalUsers}</div>
          <div className="mt-2 text-xs font-medium text-emerald-600 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            <span>+12 this month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl">category</span>
          </div>
          <div className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">Total Products</div>
          <div className="text-4xl font-extrabold text-slate-900">{stats.totalProducts}</div>
          <div className="mt-2 text-xs font-medium text-slate-500 flex items-center gap-1">
            <span>In active catalog</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl">storefront</span>
          </div>
          <div className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">Total Suppliers</div>
          <div className="text-4xl font-extrabold text-slate-900">{stats.totalSuppliers}</div>
          <div className="mt-2 text-xs font-medium text-amber-600 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">pending_actions</span>
            <span>2 pending approval</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl">warehouse</span>
          </div>
          <div className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">Active Warehouses</div>
          <div className="text-4xl font-extrabold text-slate-900">{stats.activeWarehouses}</div>
          <div className="mt-2 text-xs font-medium text-slate-500 flex items-center gap-1">
            <span>Operating at 85% capacity</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col">
          <h2 className="text-base font-bold text-slate-900 mb-4">User Growth</h2>
          <div className="relative flex-1 min-h-[300px] w-full">
            <Line data={userGrowthData} options={lineOptions} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col">
          <h2 className="text-base font-bold text-slate-900 mb-4">Products by Category</h2>
          <div className="relative flex-1 min-h-[300px] w-full flex items-center justify-center">
            <div className="w-[80%] h-full">
              <Doughnut data={productCategoryData} options={doughnutOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400">history</span>
            Recent Audit Logs
          </h2>
          <button className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
            View All Logs &rarr;
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm shrink-0">
                {log.user.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-900 font-medium">{log.action}</p>
                <p className="text-xs text-slate-500 mt-0.5">by <span className="font-semibold text-slate-700">{log.user}</span> &bull; {log.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}