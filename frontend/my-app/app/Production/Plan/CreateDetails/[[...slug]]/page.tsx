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
    planStartDateNp: "",
    planEndDate: "2026-07-24",
    planEndDateNp: "",
    supervisor: "A. Sharma (Shift 1)",
    productionLine: "Line 4",
    materialWarehouse: "Hub B",
    globalNotes: ""
  });

  const [stages, setStages] = useState<any[]>([
    { id: "01", name: "Material Check", workCenter: "QC Station 1", leadHours: "4", date: "2026-07-10", dateNp: "" },
    { id: "02", name: "Cutting", workCenter: "Cutter Auto-B", leadHours: "12", date: "2026-07-11", dateNp: "" },
    { id: "03", name: "Stitching", workCenter: "Line 4A", leadHours: "48", date: "2026-07-13", dateNp: "" }
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
            planStartDateNp: "",
            planEndDate: endStr,
            planEndDateNp: ""
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
      planStartDateNp: "",
      planEndDate: order.dueDate.split('T')[0],
      planEndDateNp: ""
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
      plannedStartDateNp: fieldValues.planStartDateNp,
      plannedCompletionDate: fieldValues.planEndDate,
      plannedCompletionDateNp: fieldValues.planEndDateNp,
      productionNotes: fieldValues.globalNotes || "Created from CreateDetails interactive flow.",
      stages: stages.map((st, idx) => ({
        stageId: `STG-${st.id}`,
        stageName: st.name,
        workCenter: st.workCenter,
        plannedStartDate: st.date,
        plannedStartDateNp: st.dateNp,
        plannedEndDate: st.date,
        plannedEndDateNp: st.dateNp,
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

  useEffect(() => {
    if (!tempData && !loadingOrders) {
      // If no data and we finished trying to fetch/load, redirect
      router.push("/Production/Create");
    }
  }, [tempData, loadingOrders, router]);

  if (!tempData) {
    return (
      <>
        <AppHeader pathname={pathname} />
        <PageShell sidebar={<Sidebar section="production" pathname={pathname} />} contentClassName="bg-slate-50">
          <div className="flex h-[80vh] items-center justify-center">
            <div className="text-center">
              <span className="material-symbols-outlined animate-spin text-4xl text-kaam-primary">autorenew</span>
              <p className="text-slate-500 mt-4 font-medium">Loading plan details...</p>
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
