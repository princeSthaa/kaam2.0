"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Dashboard from '../components/Dashboard';
import StockModal from '../components/StockModal';
import RequisitionDrawer from '../components/RequisitionDrawer';
import SummaryReview from '../components/SummaryReview';
import { AppHeader } from "@/app/components/AppHeader";
import { Sidebar } from "@/app/components/Sidebar";
import { PageShell } from "@/app/components/ui/PageShell";
import { usePathname } from "next/navigation";

// Removed defaultDemoData

export default function CreateDetailsPage() {
  const router = useRouter();
  const pathname = usePathname();

  // State Management
  const [showStockModal, setShowStockModal] = useState(false);
  const [showRequisitionDrawer, setShowRequisitionDrawer] = useState(false);
  const [showSummaryReview, setShowSummaryReview] = useState(false);

  const [tempData, setTempData] = useState<any>(null);
  const [fieldValues, setFieldValues] = useState({
    planStartDate: "2026-07-10",
    planEndDate: "2026-07-24",
    supervisor: "A. Sharma (Shift 1)",
    productionLine: "Line 4",
    materialWarehouse: "Hub B",
    globalNotes: ""
  });

  const [stages, setStages] = useState<any[]>([
    { id: "01", name: "Material Check", workCenter: "QC Station 1", leadHours: "4", date: "2026-07-10" },
    { id: "02", name: "Cutting", workCenter: "Cutter Auto-B", leadHours: "12", date: "2026-07-11" },
    { id: "03", name: "Stitching", workCenter: "Line 4A", leadHours: "48", date: "2026-07-13" }
  ]);

  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Load from localStorage on Mount, or fetch API orders
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("temp_plan_basket");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setTempData(parsed);
          
          // Pre-fill header settings based on basket details
          const today = new Date().toISOString().split("T")[0];
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + 14);
          const endStr = futureDate.toISOString().split("T")[0];

          setFieldValues(prev => ({
            ...prev,
            planStartDate: today,
            planEndDate: endStr
          }));
        } catch (e) {
          console.error("Failed to parse temp_plan_basket from localStorage", e);
          fetchOrders();
        }
      } else {
        fetchOrders();
      }
    }
  }, []);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch("http://localhost:5083/api/orders");
      const orders = await res.json();
      setAvailableOrders(orders.filter((o: any) => o.status === "Pending" || o.status === "Confirmed"));
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSelectOrder = async (order: any) => {
    // Fetch customer details
    let customerDetail = { customerName: "Unknown Customer", address: "" };
    try {
      const cres = await fetch(`http://localhost:5083/api/customers/${order.customerId}`);
      if (cres.ok) {
        const cust = await cres.json();
        customerDetail = {
          ...cust,
          customerName: cust.name || cust.companyName || "Unknown Customer"
        };
      }
    } catch (e) { console.error(e); }

    const mappedData = {
      kind: "customer",
      selectedSourceId: order.customerId,
      sourceDetail: {
        id: order.customerId,
        customerCode: order.customerId.substring(0, 8).toUpperCase(),
        name: customerDetail.customerName,
        customerName: customerDetail.customerName,
        address: customerDetail.address || "Pending Address",
        location: "Nepal",
        phone: "-",
        paymentTerms: "Net 30"
      },
      basket: order.items.map((item: any, index: number) => ({
        id: `item-${index}`,
        orderNo: order.orderNumber,
        productId: `PRD-${index+1}`,
        productCode: `PRD-${index+1}`,
        productName: item.productName,
        category: "Garment",
        variant: item.fabricName || "Standard",
        quantity: item.quantity,
        deliveryDate: order.dueDate.split('T')[0],
        productImage: null,
        sizes: { XS: Math.floor(item.quantity * 0.1), S: Math.floor(item.quantity * 0.2), M: Math.floor(item.quantity * 0.4), L: Math.floor(item.quantity * 0.2), XL: Math.floor(item.quantity * 0.1) }
      }))
    };

    setTempData(mappedData);
    
    // Set dates
    const today = new Date().toISOString().split("T")[0];
    setFieldValues(prev => ({
      ...prev,
      planStartDate: today,
      planEndDate: order.dueDate.split('T')[0]
    }));
  };

  const handleConfirm = () => {
    if (!tempData) return;

    // Create unique plan code
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0].replaceAll("-", "");
    const rand = Math.floor(100 + Math.random() * 900);
    const planNo = `PP-${dateStr}-${rand}`;

    const totalQuantity = tempData.basket.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);

    const newPlan = {
      planId: planNo,
      planNo,
      planDate: today.toISOString().split("T")[0],
      demandType: tempData.kind === "customer" ? "Customer Order" : "Outlet Replenishment",
      planName: `Production Plan - ${tempData.sourceDetail?.customerName || tempData.sourceDetail?.name || "Demo"} (${planNo})`,
      sourceId: tempData.selectedSourceId,
      sourceName: tempData.sourceDetail?.customerName || tempData.sourceDetail?.name,
      productId: tempData.basket[0]?.productId || "PRD-001",
      productName: tempData.basket[0]?.productName || "Men's Premium Cotton Jacket",
      quantity: totalQuantity,
      priority: "High",
      status: "Draft",
      supervisor: fieldValues.supervisor,
      productionLine: fieldValues.productionLine,
      materialWarehouse: fieldValues.materialWarehouse,
      sourceDetail: tempData.sourceDetail,
      kind: tempData.kind,
      plannedStartDate: fieldValues.planStartDate,
      plannedCompletionDate: fieldValues.planEndDate,
      productionNotes: fieldValues.globalNotes || "Created from CreateDetails interactive flow.",
      stages: stages.map((st, idx) => ({
        stageId: `STG-${st.id}`,
        stageName: st.name,
        workCenter: st.workCenter,
        plannedStartDate: st.date,
        plannedEndDate: st.date,
        operator: fieldValues.supervisor,
        status: "Not Started",
        completedQty: 0,
        rejectedQty: 0
      })),
      products: tempData.basket.map((item: any, idx: number) => {
        return {
          lineId: `${planNo}-L${idx + 1}`,
          orderNo: item.orderNo || "ORD-DEMO",
          productId: item.productId,
          productCode: item.productCode || item.productId,
          productName: item.productName,
          category: item.category || "Garment",
          variant: item.variant,
          quantity: item.quantity,
          requiredDate: item.deliveryDate,
          status: "Draft",
          sizes: Object.entries(item.sizes || {}).map(([size, quantity]) => ({ size, quantity: Number(quantity) }))
        };
      }),
      activities: [
        {
          title: "Plan created from CreateDetails dashboard",
          text: `Initialized production run. Supervisor: ${fieldValues.supervisor}. Assembly: ${fieldValues.productionLine}.`
        }
      ]
    };

    // Save to Backend API instead of localStorage
    if (typeof window !== "undefined") {
      fetch("http://localhost:5083/api/production-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPlan)
      })
      .then(res => res.json())
      .then(savedPlan => {
        localStorage.removeItem("temp_plan_basket");
        setShowSummaryReview(false);
        // We use the generated planNo (which acts as PlanId in frontend) for routing
        router.push(`/Production/Plan/ProcessAssignment?planId=${planNo}`);
      })
      .catch(err => {
        console.error("Failed to save production plan to API:", err);
        alert("Failed to save plan to backend.");
      });
    }
  };

  const handleCancel = () => {
    if (tempData && tempData.selectedSourceId) {
      if (tempData.kind === "customer") {
        router.push(`/Production/Customer/CreateCustomer?customerId=${tempData.selectedSourceId}`);
      } else {
        router.push(`/Production/Outlet/CreateOutlet?outletId=${tempData.selectedSourceId}`);
      }
    } else {
      router.push("/Production/Customer/Customers");
    }
  };

  if (!tempData) {
    return (
      <>
        <AppHeader pathname={pathname} />
        <PageShell sidebar={<Sidebar section="production" pathname={pathname} />} contentClassName="bg-slate-50">
          <div className="max-w-4xl mx-auto p-6 lg:p-10 pt-16">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="mb-8 text-center">
                <span className="material-symbols-outlined text-[48px] text-kaam-primary mb-4 bg-kaam-primary/10 p-4 rounded-full">add_shopping_cart</span>
                <h1 className="text-2xl font-bold text-slate-900">Select Demand Source</h1>
                <p className="text-slate-500 mt-2">Select a pending CRM Order to create a new Production Plan.</p>
              </div>

              {loadingOrders ? (
                <div className="text-center py-10">
                  <span className="material-symbols-outlined animate-spin text-3xl text-slate-400">autorenew</span>
                  <p className="text-slate-500 mt-3 font-medium">Loading pending orders...</p>
                </div>
              ) : availableOrders.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                  <span className="material-symbols-outlined text-4xl text-slate-300">inbox</span>
                  <p className="text-slate-500 mt-3 font-medium">No pending orders found in CRM.</p>
                  <button onClick={() => router.push('/CRM')} className="mt-4 text-kaam-primary font-bold hover:underline">Go to CRM to create an Order</button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {availableOrders.map(order => (
                    <div key={order.id} 
                         onClick={() => handleSelectOrder(order)}
                         className="flex items-center justify-between p-5 rounded-xl border border-slate-200 hover:border-kaam-primary hover:shadow-md cursor-pointer transition-all group bg-slate-50 hover:bg-white">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-kaam-primary/10 rounded-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-kaam-primary text-xl">receipt_long</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-kaam-primary transition-colors">
                            Order {order.orderNumber}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">event</span> Due: {order.dueDate.split('T')[0]}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">inventory_2</span> {order.items.reduce((s:number, i:any) => s+i.quantity, 0)} units</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{order.status}</span>
                        <span className="text-kaam-primary font-bold text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0 -translate-x-2">
                          Select <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </PageShell>
      </>
    );
  }

  const hideLayout = showStockModal || showRequisitionDrawer || showSummaryReview;

  return (
    <>
      {hideLayout && (
        <style>{`
          .topbar, .sidebar {
            display: none !important;
          }
          .page-container.with-sidebar {
            padding-top: 0 !important;
          }
          .layout-wrapper {
            padding-left: 0 !important;
            min-height: 100vh !important;
          }
        `}</style>
      )}
      <AppHeader pathname={pathname} />
      <PageShell
        sidebar={<Sidebar section="production" pathname={pathname} />}
        contentClassName="create-details-content"
      >
        <Dashboard 
          tempData={tempData}
          fieldValues={fieldValues}
          setFieldValues={setFieldValues}
          stages={stages}
          setStages={setStages}
          onVerifyStock={() => setShowStockModal(true)}
          onReviewPlan={() => setShowSummaryReview(true)}
          onCancel={handleCancel}
        />
      </PageShell>
      {showStockModal && (
        <StockModal 
          tempData={tempData}
          onClose={() => setShowStockModal(false)} 
          onRequestProcurement={() => {
            setShowStockModal(false);
            setShowRequisitionDrawer(true);
          }}
        />
      )}
      {showRequisitionDrawer && (
        <RequisitionDrawer 
          tempData={tempData}
          onClose={() => setShowRequisitionDrawer(false)}
        />
      )}
      {showSummaryReview && (
        <SummaryReview 
          tempData={tempData}
          fieldValues={fieldValues}
          stages={stages}
          onClose={() => setShowSummaryReview(false)}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}
