"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Dashboard from './components/Dashboard';
import StockModal from './components/StockModal';
import RequisitionDrawer from './components/RequisitionDrawer';
import SummaryReview from './components/SummaryReview';
import { AppHeader } from "@/app/components/AppHeader";
import { Sidebar } from "@/app/components/Sidebar";
import { PageShell } from "@/app/components/ui/PageShell";
import { usePathname } from "next/navigation";

const defaultDemoData = {
  kind: "customer",
  selectedSourceId: "CUST-992",
  sourceDetail: {
    id: "CUST-992",
    customerCode: "CUST-992",
    name: "Pokhara Lakeside Retailers",
    customerName: "Pokhara Lakeside Retailers",
    address: "Lakeside, Pokhara, Nepal",
    location: "Nepal",
    phone: "+977-1-4XXXXXX",
    paymentTerms: "Net 30"
  },
  basket: [
    {
      id: "demo-item-1",
      orderNo: "ORD-992-A",
      productId: "PRD-001",
      productCode: "PRD-001",
      productName: "Men's Premium Cotton Jacket",
      category: "Garment",
      variant: "Cotton-Blend (Navy)",
      quantity: 250,
      deliveryDate: "2026-07-24",
      productImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuAlUeWpFy-wuIvTig-iJ_65-mPE5GcpTW41Rn6N576ieJzqBRCe6zolJVQ804RBUABZ-zEO4QWxDwnJtcKMR4yjUg5UIgUQbeC4oPSNuLicTSTgXIpWVWpDGah3wv3p6pl53vrbiQWTD9ThHdlwSAwPPNEpnSG64RiivjYDAFWVOoD3_-eEisIIZHR60YANe5nzgEcO0GXVtT4LAo6BH3kuaL4xOhqBgAZfbpPegz3nzVctERq-gc-XZwquZHCGN-PWNg",
      sizes: { XS: 20, S: 40, M: 80, L: 60, XL: 30, XXL: 20 }
    },
    {
      id: "demo-item-2",
      orderNo: "ORD-992-B",
      productId: "PRD-002",
      productCode: "PRD-002",
      productName: "Men's Premium Cotton Jacket",
      category: "Garment",
      variant: "Polyester (Black)",
      quantity: 200,
      deliveryDate: "2026-07-24",
      productImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuAlUeWpFy-wuIvTig-iJ_65-mPE5GcpTW41Rn6N576ieJzqBRCe6zolJVQ804RBUABZ-zEO4QWxDwnJtcKMR4yjUg5UIgUQbeC4oPSNuLicTSTgXIpWVWpDGah3wv3p6pl53vrbiQWTD9ThHdlwSAwPPNEpnSG64RiivjYDAFWVOoD3_-eEisIIZHR60YANe5nzgEcO0GXVtT4LAo6BH3kuaL4xOhqBgAZfbpPegz3nzVctERq-gc-XZwquZHCGN-PWNg",
      sizes: { XS: 10, S: 30, M: 60, L: 60, XL: 30, XXL: 10 }
    }
  ]
};

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

  // Load from localStorage on Mount
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
          setTempData(defaultDemoData);
        }
      } else {
        setTempData(defaultDemoData);
      }
    }
  }, []);

  const handleConfirm = () => {
    if (!tempData) return;

    // Create unique plan code
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0].replaceAll("-", "");
    const rand = Math.floor(100 + Math.random() * 900);
    const planNo = `PP-${dateStr}-${rand}`;

    const totalQuantity = tempData.basket.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);

    const newPlan = {
      id: planNo,
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
      products: tempData.basket.map((item: any, idx: number) => ({
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
      })),
      activities: [
        {
          title: "Plan created from CreateDetails dashboard",
          text: `Initialized production run. Supervisor: ${fieldValues.supervisor}. Assembly: ${fieldValues.productionLine}.`
        }
      ]
    };

    // Save to localStorage list
    if (typeof window !== "undefined") {
      const existingStr = localStorage.getItem("productionPlans") || "[]";
      let existing = [];
      try {
        existing = JSON.parse(existingStr);
      } catch (err) {
        existing = [];
      }
      existing.unshift(newPlan);
      localStorage.setItem("productionPlans", JSON.stringify(existing));
      
      // Clean temp basket
      localStorage.removeItem("temp_plan_basket");
    }

    setShowSummaryReview(false);
    router.push("/Production/Plan/PlansDetails");
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
      <div className="pp-page text-center py-50">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-16 text-muted">Retrieving plan configurations...</p>
      </div>
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
