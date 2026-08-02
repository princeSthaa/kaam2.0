"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ActionButton } from "@/app/components/ui/ActionButton";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { TableShell } from "@/app/components/ui/TableShell";
import { MaterialIcon } from "@/app/components/ui/MaterialIcon";
import { fetchCustomers } from "../../crm/api/customer.api";
import { fetchOrders } from "../../crm/api/order.api";
import { fetchProducts, resolveMediaUrl, Product } from "../../crm/api/catalog.api";
import { Customer } from "../../crm/dto/customer.dto";
import { Order } from "../../crm/dto/order.dto";

function OpenOrdersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const customerId = searchParams.get("customerId");

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!customerId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [custData, orderData, prodData, plansData, planProdsData] = await Promise.all([
          fetchCustomers().catch(() => []),
          fetchOrders(customerId).catch(() => []),
          fetchProducts().catch(() => []),
          fetch("http://localhost:5083/api/production-plans").then(r => r.ok ? r.json() : []).catch(() => []),
          fetch("http://localhost:5083/api/production-plan-product").then(r => r.ok ? r.json() : []).catch(() => []),
        ]);

        const targetId = String(customerId).toLowerCase();
        const foundCust = Array.isArray(custData)
          ? custData.find((c) => String(c.id).toLowerCase() === targetId)
          : null;
        setCustomer(foundCust || null);

        const plannedOrderItemIds = new Set<string>();
        const plannedOrderProductKeys = new Set<string>();

        (plansData || []).forEach((p: any) => {
          const prods = p.productionPlanProducts || p.products || [];
          prods.forEach((prod: any) => {
            if (prod.orderItemId) plannedOrderItemIds.add(String(prod.orderItemId).toLowerCase());
            if (prod.orderNo && prod.productId) {
              plannedOrderProductKeys.add(`${String(prod.orderNo).toLowerCase()}_${String(prod.productId).toLowerCase()}`);
            }
          });
        });

        (planProdsData || []).forEach((prod: any) => {
          if (prod.orderItemId) plannedOrderItemIds.add(String(prod.orderItemId).toLowerCase());
          if (prod.orderNo && prod.productId) {
            plannedOrderProductKeys.add(`${String(prod.orderNo).toLowerCase()}_${String(prod.productId).toLowerCase()}`);
          }
        });

        const custOrders = Array.isArray(orderData)
          ? orderData
              .filter((o) => {
                if (String(o.customerId).toLowerCase() !== targetId) return false;
                const statusStr = String(o.status || "").toLowerCase();
                if (statusStr === "planned" || statusStr === "completed" || statusStr === "cancelled" || o.status === 4) return false;
                return true;
              })
              .map((o) => {
                const rawItems = o.orderItems || o.items || [];
                const orderNoKey = String(o.orderNumber || o.id || "").toLowerCase();

                const openItems = rawItems.filter((item: any) => {
                  const itemIdStr = String(item.id || item.orderItemId || "").toLowerCase();
                  const itemProdIdStr = String(item.productId || "").toLowerCase();

                  if (itemIdStr && plannedOrderItemIds.has(itemIdStr)) return false;
                  if (orderNoKey && itemProdIdStr && plannedOrderProductKeys.has(`${orderNoKey}_${itemProdIdStr}`)) return false;

                  return true;
                });

                return {
                  ...o,
                  displayItems: openItems,
                };
              })
              .filter((o) => o.displayItems.length > 0)
          : [];

        setOrders(custOrders);
        setProducts(prodData || []);
      } catch (err) {
        console.error("Error loading open orders:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [customerId]);

  const getProductImage = (item: any) => {
    if (item.product?.imagePath) {
      return resolveMediaUrl(item.product.imagePath, "product");
    }
    const itemProdId = String(item.productId || item.id || "").toLowerCase();
    const itemName = String(item.productName || item.product?.name || "").toLowerCase();

    const found = products.find(
      (p) =>
        String(p.id).toLowerCase() === itemProdId ||
        String(p.name).toLowerCase() === itemName
    );

    if (found?.imagePath) {
      return resolveMediaUrl(found.imagePath, "product");
    }

    return resolveMediaUrl("polo-shirt.jpg", "product");
  };

  const handleProceedOrder = (orderNo?: string) => {
    if (!customerId) return;
    let url = `/production/demands/customer?customerId=${encodeURIComponent(customerId)}`;
    if (orderNo) {
      url += `&orderNumber=${encodeURIComponent(orderNo)}`;
    }
    router.push(url);
  };

  if (loading) {
    return (
      <div className="pp-page">
        <div className="text-center p-12 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-md mx-auto mt-12">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading open orders...</span>
          </div>
          <h4 className="font-bold text-slate-800 text-base">Loading Open Orders...</h4>
          <p className="text-xs text-slate-500 mt-1">Fetching customer orders and item details.</p>
        </div>
      </div>
    );
  }

  if (!customerId || !customer) {
    return (
      <div className="pp-page">
        <div className="alert alert-warning max-w-600 mx-auto mt-12 text-center p-8 rounded-2xl shadow-sm border bg-amber-50 text-amber-800 border-amber-200">
          <span style={{ fontSize: "40px", marginBottom: "16px", display: "inline-block" }}>
            <MaterialIcon name="warning" />
          </span>
          <h3 className="font-bold text-lg text-slate-900">No Customer Selected</h3>
          <p className="mt-2 mb-6 text-sm text-slate-600">Please select a customer from the catalog to view their open orders.</p>
          <Link href="/production/demands/catalog/customer" className="btn btn-primary">
            Go to Customer Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pp-page space-y-6">
      {/* Header & Quick Action */}
      <PageHeader
        title={`Open Orders: ${customer.name}`}
        subtitle={`Each order for ${customer.company || customer.name} is displayed below with its product breakdown. Proceed with demand planning per order.`}
        actions={
          <ActionButton href="/production/demands/catalog/customer" variant="secondary">
            &larr; Back to Customer Catalog
          </ActionButton>
        }
      />

      {/* Customer Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-lg shadow-sm">
            {customer.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">{customer.name}</h3>
            <p className="text-xs text-slate-500">{customer.company || "Retail Account"} | {customer.phone || "No phone"} | {customer.address || "No location"}</p>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-xs border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-6">
          <div>
            <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">Open Orders</span>
            <strong className="text-slate-900 text-base font-bold">{orders.length}</strong>
          </div>
          <div>
            <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">Customer Type</span>
            <span className="inline-block mt-0.5 px-2 py-0.5 bg-blue-50 text-blue-700 font-mono font-bold text-[10px] rounded border border-blue-200">
              {customer.type || "Retail"}
            </span>
          </div>
        </div>
      </div>

      {/* Dedicated Card Container for Each Order */}
      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-sm shadow-sm">
            <span className="material-symbols-outlined text-3xl text-slate-300 d-block mb-2">folder_open</span>
            No open orders found for this customer.
          </div>
        ) : (
          orders.map((o) => {
            const orderItems = o.displayItems || o.orderItems || o.items || [];
            const createdDateFormatted = o.createdAt
              ? new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
              : "Recently";
            const dueDateFormatted = o.dueDate
              ? new Date(o.dueDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
              : "Not set";
            const totalQty = orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
            const orderKey = o.orderNumber || o.id || "";

            return (
              <div
                key={o.id || o.orderNumber}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-slate-300 transition-all"
              >
                {/* Order Header Bar */}
                <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0 border border-blue-100">
                      <span className="material-symbols-outlined text-xl">receipt</span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-mono font-bold text-slate-900 text-base">{orderKey}</h4>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold font-mono rounded border ${
                            o.status === "Completed"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : o.status === "Planned"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : o.status === "Processing"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {o.status || "Pending"}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">Date Created: {createdDateFormatted}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">Delivery Due</span>
                      <span className="font-mono font-bold text-slate-900 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-amber-600">event</span>
                        {dueDateFormatted}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">Total Amount</span>
                      <span className="font-mono font-bold text-slate-900">Rs. {(o.totalAmount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Order Products Table */}
                <div className="overflow-x-auto">
                  <TableShell
                    headers={[
                      "Thumbnail",
                      "Product Name",
                      "Sizes & Quantities",
                      "Order Quantity",
                      "Unit Price",
                      "Total Price",
                    ]}
                    tableClassName="pp-table text-left"
                  >
                    {orderItems.length > 0 ? (
                      orderItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 text-xs">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
                              <img
                                src={getProductImage(item)}
                                alt={item.productName || item.product?.name || "Product Thumbnail"}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-900 text-xs">
                            {item.productName || item.product?.name || "Garment Product"}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600">
                            {item.orderItemSizes && item.orderItemSizes.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {item.orderItemSizes.map((s: any, sIdx: number) => (
                                  <span key={sIdx} className="bg-blue-50/70 text-blue-800 px-2 py-0.5 rounded text-[10px] font-mono border border-blue-200">
                                    {s.size}: <strong>{s.quantity}</strong>
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Standard Variant</span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-slate-900 text-xs">
                            {item.quantity || 0} pcs
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-600 text-xs">
                            Rs. {(item.unitPrice || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-slate-900 text-xs">
                            Rs. {((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center text-slate-400 py-6 text-xs italic">
                          No item details recorded for this order.
                        </td>
                      </tr>
                    )}
                  </TableShell>
                </div>

                {/* Order Card Footer Action */}
                <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 flex items-center space-x-4 font-medium">
                    <span>Line Items: <strong className="text-slate-900 font-mono">{orderItems.length}</strong></span>
                    <span>Total Volume: <strong className="text-slate-900 font-mono">{totalQty} pcs</strong></span>
                  </div>

                  <button
                    onClick={() => handleProceedOrder(orderKey)}
                    className="btn btn-primary flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm hover:shadow transition-all"
                  >
                    <span>Proceed to Demand</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function OpenOrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading open orders workspace...</div>}>
      <OpenOrdersContent />
    </Suspense>
  );
}
