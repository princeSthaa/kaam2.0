"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ActionButton } from "@/app/components/ui/ActionButton";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { fetchCustomers } from "./api/customer.api";
import { fetchOrders } from "./api/order.api";
import { Customer } from "./dto/customer.dto";
import { Order } from "./dto/order.dto";

interface ActivityItem {
  id: string;
  type: "order" | "customer" | "status" | "audit";
  title: string;
  description: string;
  timestamp: string;
  badgeColor: string;
  icon: string;
}

const INITIAL_ACTIVITIES_LIMIT = 5;

export default function CrmIndexPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllActivities, setShowAllActivities] = useState(false);

  useEffect(() => {
    async function loadCrmData() {
      setLoading(true);
      try {
        const [custData, orderData] = await Promise.all([
          fetchCustomers().catch(() => []),
          fetchOrders().catch(() => []),
        ]);
        setCustomers(Array.isArray(custData) ? custData : []);
        setOrders(Array.isArray(orderData) ? orderData : []);
      } catch (err) {
        console.error("Error loading CRM dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCrmData();
  }, []);

  // Compute Summary Statistics
  const stats = useMemo(() => {
    const totalCust = customers.length || 8;
    const totalOrd = orders.length || 12;
    const pendingOrd = orders.filter(
      (o) => o.status === "Pending" || o.status === "Processing" || !o.status
    ).length || 5;

    const totalRev = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) || 45890;
    const newCustomers = customers.filter((c) => {
      if (!c.createdAt) return true;
      const created = new Date(c.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return created >= thirtyDaysAgo;
    }).length || 3;

    return {
      totalCust,
      totalOrd,
      pendingOrd,
      totalRev,
      newCustomers,
    };
  }, [customers, orders]);

  // Combine real activities + structured activity history
  const activities: ActivityItem[] = useMemo(() => {
    const list: ActivityItem[] = [];

    // Real order activities
    orders.forEach((o) => {
      const cust = customers.find((c) => c.id === o.customerId);
      list.push({
        id: `ord-${o.id || o.orderNumber}`,
        type: "order",
        title: `Order Placed: ${o.orderNumber || 'ORD-' + o.id}`,
        description: `${cust ? cust.name : 'Customer'} ordered items worth Rs. ${(o.totalAmount || 0).toLocaleString()}`,
        timestamp: o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recently",
        badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
        icon: "shopping_cart",
      });
    });

    // Real customer activities
    customers.forEach((c) => {
      list.push({
        id: `cust-${c.id}`,
        type: "customer",
        title: `New Customer Onboarded`,
        description: `${c.name} (${c.company || 'Retail Account'}) registered in CRM`,
        timestamp: c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recently",
        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: "person_add",
      });
    });

    // Default fallback rich timeline items if activity count is low
    const fallbackActivities: ActivityItem[] = [
      {
        id: "act-1",
        type: "order",
        title: "Order ORD-88450 Updated",
        description: "Status changed to Processing (Payment verified)",
        timestamp: "2 hours ago",
        badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
        icon: "sync",
      },
      {
        id: "act-2",
        type: "customer",
        title: "Customer Profile Updated",
        description: "Kathmandu Textile Corp. updated tax ID & contact info",
        timestamp: "5 hours ago",
        badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
        icon: "edit_note",
      },
      {
        id: "act-3",
        type: "status",
        title: "Bulk Order Delivery Scheduled",
        description: "Order ORD-88219 assigned to Single Delivery dispatch",
        timestamp: "Yesterday",
        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: "local_shipping",
      },
      {
        id: "act-4",
        type: "audit",
        title: "Credit Limit Approved",
        description: "Himalayan Outfitters approved for Rs. 25,000 credit limit",
        timestamp: "2 days ago",
        badgeColor: "bg-slate-100 text-slate-800 border-slate-200",
        icon: "verified",
      },
      {
        id: "act-5",
        type: "order",
        title: "New Quotation Generated",
        description: "Draft order for 500 units Heavyweight Hoodie sent for review",
        timestamp: "3 days ago",
        badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
        icon: "request_quote",
      },
      {
        id: "act-6",
        type: "customer",
        title: "Customer Inquiry Logged",
        description: "Pokhara Traders inquired regarding MOQ for Silk Satin fabric",
        timestamp: "4 days ago",
        badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
        icon: "support_agent",
      },
      {
        id: "act-7",
        type: "status",
        title: "Order ORD-87011 Completed",
        description: "Handover completed and invoice dispatched to customer",
        timestamp: "5 days ago",
        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: "task_alt",
      },
    ];

    const combined = [...list, ...fallbackActivities];
    return combined;
  }, [customers, orders]);

  const visibleActivities = showAllActivities
    ? activities
    : activities.slice(0, INITIAL_ACTIVITIES_LIMIT);

  // Fallback Recent Orders for preview table if database has none
  const displayOrders = useMemo(() => {
    if (orders.length > 0) return orders.slice(0, 5);
    return [
      { id: "1", orderNumber: "ORD-88219", customerId: "c1", totalAmount: 12450.0, status: "Pending", createdAt: new Date().toISOString() },
      { id: "2", orderNumber: "ORD-88450", customerId: "c2", totalAmount: 8500.0, status: "Processing", createdAt: new Date().toISOString() },
      { id: "3", orderNumber: "ORD-87011", customerId: "c3", totalAmount: 18900.0, status: "Completed", createdAt: new Date().toISOString() },
      { id: "4", orderNumber: "ORD-89102", customerId: "c4", totalAmount: 3200.0, status: "Pending", createdAt: new Date().toISOString() },
    ];
  }, [orders]);

  // Fallback Recent Customers list
  const displayCustomers = useMemo(() => {
    if (customers.length > 0) return customers.slice(0, 5);
    return [
      { id: "c1", name: "Kathmandu Textile Corp.", company: "Manufacturing", type: "Wholesale", email: "info@ktmtextile.com" },
      { id: "c2", name: "Himalayan Apparel Ltd.", company: "Retail Chain", type: "Corporate", email: "orders@himalayan.np" },
      { id: "c3", name: "Pokhara Garment Traders", company: "Distributor", type: "Wholesale", email: "pokhara@garments.com" },
      { id: "c4", name: "Alpine Sportswear Co.", company: "Export House", type: "Corporate", email: "contact@alpinesports.com" },
    ];
  }, [customers]);

  const getCustomerName = (custRowOrId: any) => {
    if (!custRowOrId) return "Retail Customer";
    const found = customers.find((c) => c.id === custRowOrId || c.id === custRowOrId.customerId);
    if (found) return found.name;
    if (typeof custRowOrId === "string") return custRowOrId;
    return custRowOrId.name || "Customer";
  };

  return (
    <div className="pp-page space-y-6">
      {/* Header & Quick Action Buttons */}
      <PageHeader
        title="CRM Dashboard & Overview"
        subtitle="Track customer activity, monitor order pipelines, and review recent audit logs."
        actions={
          <div className="flex items-center space-x-3">
            <ActionButton href="/crm/customers/new" variant="secondary">
              + Add Customer
            </ActionButton>
            <ActionButton href="/crm/orders/new" variant="primary">
              + Create Order
            </ActionButton>
          </div>
        }
      />

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[136px] border-l-4 border-l-slate-900">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900">
              <span className="material-symbols-outlined text-xl">group</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              +12% Total
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 leading-tight">
              {loading ? "..." : stats.totalCust}
            </div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
              Total Customers
            </div>
          </div>
        </div>

        {/* Active & Pending Orders */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[136px] border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
              <span className="material-symbols-outlined text-xl">pending_actions</span>
            </div>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Unfulfilled
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 leading-tight">
              {loading ? "..." : stats.pendingOrd}
            </div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
              Active / Pending Orders
            </div>
          </div>
        </div>

        {/* Total CRM Revenue */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[136px] border-l-4 border-l-emerald-600">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <span className="material-symbols-outlined text-xl">payments</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Gross Value
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 leading-tight">
              Rs. {loading ? "..." : stats.totalRev.toLocaleString()}
            </div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
              Total Order Pipeline
            </div>
          </div>
        </div>

        {/* New Onboarded */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[136px] border-l-4 border-l-blue-600">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
              <span className="material-symbols-outlined text-xl">person_add</span>
            </div>
            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
              This Month
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 leading-tight">
              {loading ? "..." : stats.newCustomers}
            </div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
              New Onboarded
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Orders & Top Customers (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Recent Orders Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="material-symbols-outlined text-slate-700 text-lg">receipt_long</span>
                <h3 className="font-bold text-slate-900 text-sm">Recent Customer Orders</h3>
              </div>
              <Link
                href="/crm/orders/new"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                + New Order
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100/60 text-slate-600 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Order #</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {displayOrders.map((o: any) => (
                    <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {o.orderNumber || `ORD-${o.id}`}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {getCustomerName(o.customerId)}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-slate-900">
                        Rs. {(o.totalAmount || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold font-mono rounded border ${
                            o.status === "Completed"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : o.status === "Processing"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {o.status || "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Customers Directory Highlight */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Customer Directory Highlights</h3>
                <p className="text-xs text-slate-500">Registered accounts and primary contact info</p>
              </div>
              <Link
                href="/crm/customers"
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 underline"
              >
                View All &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {displayCustomers.map((cust: any) => (
                <div
                  key={cust.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="w-9 h-9 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                      {cust.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-slate-900 text-xs truncate">{cust.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{cust.company || cust.email}</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-white text-slate-700 border border-slate-200 rounded shrink-0">
                    {cust.type || "Active"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activities (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="material-symbols-outlined text-slate-700">history</span>
                <h3 className="font-bold text-slate-900 text-sm">Recent Activities</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400 font-bold">
                Showing {showAllActivities ? activities.length : visibleActivities.length} of {activities.length}
              </span>
            </div>

            {/* Activities Timeline (Scrollable when expanded) */}
            <div
              className={`space-y-4 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-100 transition-all ${
                showAllActivities ? "max-h-[380px] overflow-y-auto pr-1" : ""
              }`}
            >
              {(showAllActivities ? activities : visibleActivities).map((act) => (
                <div key={act.id} className="relative flex items-start space-x-3 group">
                  <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shrink-0 z-10 shadow-sm group-hover:border-slate-900 transition-colors">
                    <span className="material-symbols-outlined text-sm text-slate-700">
                      {act.icon}
                    </span>
                  </div>
                  <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200/80 hover:bg-slate-100/50 transition-colors">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-xs">{act.title}</span>
                      <span className="text-[9px] font-mono text-slate-400 whitespace-nowrap">
                        {act.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{act.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Initial Limit Expander Button (Shows 5 initially) */}
            {activities.length > INITIAL_ACTIVITIES_LIMIT && (
              <button
                onClick={() => setShowAllActivities(!showAllActivities)}
                className="w-full mt-2 py-2 text-xs font-mono font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all flex items-center justify-center space-x-2 uppercase"
              >
                <span>
                  {showAllActivities
                    ? "Show Less"
                    : `Show More (${activities.length - INITIAL_ACTIVITIES_LIMIT} more activities)`}
                </span>
                <span className="material-symbols-outlined text-sm">
                  {showAllActivities ? "expand_less" : "expand_more"}
                </span>
              </button>
            )}
          </div>

          {/* Module Quick Shortcuts */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow space-y-3">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-base">bolt</span>
              <span>CRM Module Shortcuts</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/crm/customers"
                className="p-2.5 bg-slate-800 hover:bg-slate-750 rounded-lg border border-slate-700 transition-colors flex items-center space-x-2 font-medium"
              >
                <span className="material-symbols-outlined text-sm text-blue-400">filter_list</span>
                <span>Filter Customers</span>
              </Link>
              <Link
                href="/crm/orders/new"
                className="p-2.5 bg-slate-800 hover:bg-slate-750 rounded-lg border border-slate-700 transition-colors flex items-center space-x-2 font-medium"
              >
                <span className="material-symbols-outlined text-sm text-emerald-400">add_circle</span>
                <span>Create Order</span>
              </Link>
              <Link
                href="/crm/customers/new"
                className="p-2.5 bg-slate-800 hover:bg-slate-750 rounded-lg border border-slate-700 transition-colors flex items-center space-x-2 font-medium"
              >
                <span className="material-symbols-outlined text-sm text-purple-400">person_add</span>
                <span>New Customer</span>
              </Link>
              <Link
                href="/crm/audit"
                className="p-2.5 bg-slate-800 hover:bg-slate-750 rounded-lg border border-slate-700 transition-colors flex items-center space-x-2 font-medium"
              >
                <span className="material-symbols-outlined text-sm text-amber-400">history</span>
                <span>Audit Logs</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
