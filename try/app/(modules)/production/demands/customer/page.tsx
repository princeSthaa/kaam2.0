"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ActionButton } from "@/app/components/ui/ActionButton";
import { MaterialIcon } from "@/app/components/ui/MaterialIcon";
import { adToBs } from "@/app/components/ui/dateUtils";
import { fetchCustomers } from "../../../crm/api/customer.api";
import { fetchOrders } from "../../../crm/api/order.api";
import { fetchFabrics, Fabric } from "../../../crm/api/catalog.api";
import { Customer } from "../../../crm/dto/customer.dto";
import { Order } from "../../../crm/dto/order.dto";
import { checkMaterials } from "../../api/production.api";
import "../../styles/production-demand-plan.css";

const draftStorageKey = "kaam.productionPlanDrafts.v1";

function buildPlanNo(prefix: string) {
  const now = new Date();
  const date = [now.getFullYear(), now.getMonth() + 1, now.getDate()]
    .map((part) => String(part).padStart(2, "0"))
    .join("");
  const time = [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map((part) => String(part).padStart(2, "0"))
    .join("");

  return `${prefix}-${date}-${time}`;
}

function resolveMediaUrl(path?: string, defaultType: "product" | "fabric" = "product"): string {
  if (!path || path === "default.png" || path.includes("place-holder")) {
    const fallbackFile = defaultType === "fabric" ? "FAB-001.jpg" : "polo-shirt.jpg";
    return `http://localhost:5083/Media/images/${defaultType === "fabric" ? "fabrics" : "products"}/${fallbackFile}`;
  }
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return `http://localhost:5083${path}`;
  return `http://localhost:5083/Media/images/${defaultType === "fabric" ? "fabrics" : "products"}/${path}`;
}

function saveProductionDraft(plan: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  const planNo = String(plan.planNo || plan.planId || plan.id || "");
  if (!planNo) return;

  let drafts: Array<Record<string, unknown>> = [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(draftStorageKey) || "[]");
    drafts = Array.isArray(parsed) ? parsed : [];
  } catch {
    drafts = [];
  }

  const nextDrafts = drafts.filter((draft) => String(draft.planNo || draft.planId || draft.id) !== planNo);
  nextDrafts.unshift(plan);
  window.localStorage.setItem(draftStorageKey, JSON.stringify(nextDrafts.slice(0, 100)));
}

function normalizeSizeRows(sizes: Record<string, number> | Array<{ size: string; quantity: number }> | undefined) {
  if (Array.isArray(sizes)) return sizes;
  if (!sizes) return [];

  return Object.entries(sizes)
    .map(([size, quantity]) => ({ size, quantity: Number(quantity) || 0 }))
    .filter((row) => row.quantity > 0);
}

function CustomerDemandContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const customerIdParam = searchParams.get("customerId");
  const selectedOrderNumber = searchParams.get("orderNumber");

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [liveCustomers, setLiveCustomers] = useState<Customer[]>([]);
  const [liveOrders, setLiveOrders] = useState<Order[]>([]);
  const [existingPlans, setExistingPlans] = useState<any[]>([]);
  const [existingPlanProducts, setExistingPlanProducts] = useState<any[]>([]);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);

  // Horizontal Scroll Ref for Customer Orders Carousel
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -240, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 240, behavior: "smooth" });
    }
  };

  useEffect(() => {
    setIsLoadingData(true);
    Promise.all([
      fetchCustomers().then(setLiveCustomers).catch(console.error),
      fetchOrders(customerIdParam || undefined).then(setLiveOrders).catch(console.error),
      fetchFabrics().then(setFabrics).catch(console.error),
      fetch("http://localhost:5083/api/production-plans").then(r => r.ok ? r.json() : []).then(setExistingPlans).catch(console.error),
      fetch("http://localhost:5083/api/production-plan-product").then(r => r.ok ? r.json() : []).then(setExistingPlanProducts).catch(console.error)
    ]).finally(() => {
      setIsLoadingData(false);
    });
  }, [customerIdParam]);

  // Retrieve customer detail
  const sourceDetail = useMemo<any>(() => {
    if (!customerIdParam) return null;
    const targetId = String(customerIdParam).toLowerCase();
    const dbCust = liveCustomers.find(c => String(c.id).toLowerCase() === targetId);
    if (dbCust) {
      const custIdLower = String(dbCust.id).toLowerCase();
      return {
        id: dbCust.id,
        customerName: dbCust.name,
        phone: dbCust.phone,
        address: dbCust.address,
        paymentTerms: "Net 30",
        ordersCount: liveOrders.filter(o => String(o.customerId).toLowerCase() === custIdLower).length,
        totalQty: liveOrders.filter(o => String(o.customerId).toLowerCase() === custIdLower).reduce((sum, o) => sum + o.totalAmount, 0),
      };
    }
    return null;
  }, [customerIdParam, liveCustomers, liveOrders]);

  // Retrieve matching catalog items
  const catalogItems = useMemo(() => {
    if (!customerIdParam) return [];

    const plannedOrderItemIds = new Set<string>();
    existingPlans.forEach((p: any) => {
      const prods = p.productionPlanProducts || p.products || [];
      prods.forEach((prod: any) => {
        if (prod.orderItemId) plannedOrderItemIds.add(String(prod.orderItemId));
      });
    });

    existingPlanProducts.forEach((pp: any) => {
      if (pp.orderItemId) plannedOrderItemIds.add(String(pp.orderItemId));
    });

    if (typeof window !== "undefined") {
      try {
        const drafts = JSON.parse(localStorage.getItem(draftStorageKey) || "[]");
        drafts.forEach((d: any) => {
          (d.products || []).forEach((prod: any) => {
            if (prod.orderItemId) plannedOrderItemIds.add(String(prod.orderItemId));
          });
        });
      } catch {}
    }

    const targetId = String(customerIdParam).toLowerCase();
    const custOrders = liveOrders.filter(o =>
      String(o.customerId).toLowerCase() === targetId &&
      (!selectedOrderNumber || o.orderNumber === selectedOrderNumber)
    );

    if (custOrders.length > 0) {
      const itemsList: any[] = [];
      custOrders.forEach((o) => {
        const orderItems = o.orderItems || o.items;
        if (orderItems && orderItems.length > 0) {
          orderItems.forEach((item: any, index: number) => {
            const isPlanned = plannedOrderItemIds.has(String(item.id));
            if (isPlanned) return;

            const sizeRows = Array.isArray(item.orderItemSizes) ? item.orderItemSizes : [];
            const sizes = sizeRows.reduce((result: Record<string, number>, sizeRow: any) => {
              const size = String(sizeRow.size || "").trim();
              const quantity = Number(sizeRow.quantity) || 0;
              if (size && quantity > 0) result[size] = quantity;
              return result;
            }, {});
            const qty = sizeRows.length
              ? (Object.values(sizes) as number[]).reduce((sum, quantity) => sum + quantity, 0)
              : Number(item.quantity) || 0;

            let resolvedVariant = item.variant || item.color || item.fabricName || item.fabric?.name || item.product?.variant || item.product?.color;

            // Extract material name from orderItemMaterials
            if (!resolvedVariant && Array.isArray(item.orderItemMaterials) && item.orderItemMaterials.length > 0) {
              const firstMat = item.orderItemMaterials.find((m: any) => m.material?.name || m.materialName || m.materialId);
              if (firstMat) {
                resolvedVariant = firstMat.material?.name || firstMat.materialName;
                if (!resolvedVariant && firstMat.materialId) {
                  const matchedFabric = fabrics.find(f => String(f.id).toLowerCase() === String(firstMat.materialId).toLowerCase());
                  if (matchedFabric) resolvedVariant = matchedFabric.name;
                }
              }
            }

            if (!resolvedVariant && sizeRows.length > 0) {
              const firstFabricId = sizeRows.find((s: any) => s.fabricId)?.fabricId || item.fabricId;
              if (firstFabricId) {
                const matchedFabric = fabrics.find(f => String(f.id).toLowerCase() === String(firstFabricId).toLowerCase());
                if (matchedFabric) {
                  resolvedVariant = matchedFabric.name;
                }
              }
            }

            if (!resolvedVariant) {
              resolvedVariant = "Standard Variant";
            }

            itemsList.push({
              id: `${o.id || o.orderNumber}-${index}`,
              orderId: o.id,
              orderNo: o.orderNumber,
              customerId: o.customerId,
              productId: item.productId || item.product?.id || "PRD-001",
              productName: item.product?.name || item.productName || `Item #${index + 1}`,
              category: item.category || item.product?.category || "General",
              variant: resolvedVariant,
              quantity: qty,
              deliveryDate: o.dueDate,
              priority: "Normal",
              productImage: resolveMediaUrl(item.product?.imagePath, "product"),
              productionNotes: o.status,
              sizes,
              orderItemMaterials: item.orderItemMaterials || [],
            });
          });
        }
      });
      return itemsList;
    }
    return [];
  }, [customerIdParam, selectedOrderNumber, liveOrders, existingPlans, existingPlanProducts, fabrics]);

  // Basket state
  const [basket, setBasket] = useState<any[]>([]);
  const [isBasketMinimized, setIsBasketMinimized] = useState(false);

  // Detailed Modal state
  const [modalItem, setModalItem] = useState<any | null>(null);

  // 3D Preview Modal state
  const [show3dModal, setShow3dModal] = useState(false);
  const [active3dSide, setActive3dSide] = useState<"front" | "back">("front");

  // Material Requirement State
  const [bulkChecked, setBulkChecked] = useState(false);
  const [isCheckingBulk, setIsCheckingBulk] = useState(false);
  const [bulkMaterials, setBulkMaterials] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddToBasket = (item: any) => {
    setBasket(prev => {
      const exists = prev.some(b => b.id === item.id);
      if (exists) return prev.filter(b => b.id !== item.id);
      return [...prev, item];
    });
    setBulkChecked(false);
  };

  const handleRemoveFromBasket = (id: string | number) => {
    setBasket(prev => prev.filter(b => b.id !== id));
    setBulkChecked(false);
  };

  const handleClearBasket = () => {
    setBasket([]);
    setBulkChecked(false);
  };

  const basketStats = useMemo(() => {
    const totalItems = basket.length;
    const totalQty = basket.reduce((sum, item) => sum + item.quantity, 0);
    const dates = basket.map(item => item.deliveryDate || item.requiredDate).filter(Boolean).sort();
    const earliestDate = dates[0] || "-";
    return { totalItems, totalQty, earliestDate };
  }, [basket]);

  const handleCheckBulkMaterials = async () => {
    if (!basket.length) return;
    setIsCheckingBulk(true);
    setBulkChecked(false);
    try {
      const payload = basket.map(item => ({ productId: item.productId, quantity: item.quantity }));
      const res = await checkMaterials(payload);
      const materials = res.materials || [];
      const finalMaterials = materials.map((mat: any) => {
        const required = Number(mat.requiredQty) || 0;
        const available = Number(mat.availableQty) || 0;
        const shortage = Math.max(required - available, 0);
        return {
          materialCode: mat.materialCode || mat.materialName,
          materialName: mat.materialName,
          materialType: 'Raw Material',
          requiredQty: required,
          availableQty: available,
          shortageQty: shortage,
          unit: mat.unit,
          status: shortage > 0 ? "Shortage" : "Available"
        };
      });
      setBulkMaterials(finalMaterials);
      setBulkChecked(true);
    } catch (err) {
      console.error(err);
      alert("Failed to check materials with the warehouse.");
    } finally {
      setIsCheckingBulk(false);
    }
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!basket.length) return;
    setIsSubmitting(true);

    if (typeof window !== "undefined") {
      const tempData = { kind: "customer", sourceDetail, basket, selectedSourceId: customerIdParam };
      localStorage.setItem("temp_plan_basket", JSON.stringify(tempData));
    }

    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/production/plans/CreateCustomerPlan");
    }, 800);
  };

  // Single item Material Calculation preview inside Modal
  const [itemMaterialPreview, setItemMaterialPreview] = useState<any[]>([]);

  useEffect(() => {
    if (!modalItem) {
      setItemMaterialPreview([]);
      return;
    }

    if (Array.isArray(modalItem.orderItemMaterials) && modalItem.orderItemMaterials.length > 0) {
      const mapped = modalItem.orderItemMaterials.map((m: any) => ({
        materialName: m.material?.name || m.materialName || "Selected Material",
        requiredQty: m.requiredQuantity || m.quantity || 0,
        availableQty: 1000,
        shortageQty: 0,
        unit: m.unit || "m",
        status: "Available"
      }));
      setItemMaterialPreview(mapped);
      return;
    }

    checkMaterials([{ productId: modalItem.productId, quantity: modalItem.quantity }])
      .then(res => setItemMaterialPreview(res.materials || []))
      .catch(console.error);
  }, [modalItem]);

  const itemMeasurementChart = useMemo(() => {
    if (!modalItem) return [];
    return [
      { size: "XS", chest: 34, shoulder: 15, sleeve: 22, length: 25, unit: "inch" },
      { size: "S", chest: 36, shoulder: 16, sleeve: 23, length: 26, unit: "inch" },
      { size: "M", chest: 38, shoulder: 17, sleeve: 24, length: 27, unit: "inch" },
      { size: "L", chest: 40, shoulder: 18, sleeve: 25, length: 28, unit: "inch" },
      { size: "XL", chest: 42, shoulder: 19, sleeve: 26, length: 29, unit: "inch" }
    ];
  }, [modalItem]);

  if (isLoadingData) {
    return (
      <div className="min-h-[calc(100vh-64px)] w-full max-w-7xl mx-auto p-6 flex flex-col justify-center items-center">
        <div className="text-center p-12 bg-white rounded-2xl border border-slate-200 shadow-xs max-w-md mx-auto">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-base">Loading Demand Plan...</h4>
          <p className="text-xs text-slate-500 mt-1">Fetching customer details and order items.</p>
        </div>
      </div>
    );
  }

  if (!customerIdParam || !sourceDetail) {
    return (
      <div className="min-h-[calc(100vh-64px)] w-full max-w-7xl mx-auto p-6">
        <div className="max-w-xl mx-auto mt-20 text-center p-8 rounded-2xl shadow-xs border bg-red-50 border-red-200 text-red-700">
          <span className="text-4xl mb-4 inline-block">
            <MaterialIcon name="warning" />
          </span>
          <h3 className="font-bold text-lg text-slate-900">No Customer Selected</h3>
          <p className="mt-2 mb-6 text-sm text-slate-600">Please select a customer from the catalog to start planning.</p>
          <Link href="/production/demands/catalog/customer" className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all">
            Go to Customer Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] w-full max-w-7xl mx-auto p-6 flex flex-col gap-6 text-slate-900 bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:px-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Create Customer Order Plan</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">Configure garments, size matrices, and bulk materials for {sourceDetail.customerName}.</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link href="/production/demands/catalog/customer" className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-all shadow-xs">
            <MaterialIcon name="chevron_left" />
            Choose Customer
          </Link>
          <Link href="/production/demands" className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-all shadow-xs">
            Change Demand Type
          </Link>
          <Link href="/production/plans" className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm shadow-blue-500/20">
            Back to Plans
          </Link>
        </div>
      </div>

      {/* Selected Customer & Order Summary Card */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <MaterialIcon name="person" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Customer Account</span>
            <strong className="text-slate-900 text-base font-bold">{sourceDetail.customerName}</strong>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-5 md:gap-6 text-xs border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
          {(selectedOrderNumber || catalogItems[0]?.orderNo) && (
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">Order Ref</span>
              <span className="inline-block mt-0.5 px-2.5 py-1 bg-blue-50 text-blue-700 font-mono font-bold text-xs rounded-lg border border-blue-200 shadow-2xs">
                {selectedOrderNumber || catalogItems[0]?.orderNo}
              </span>
            </div>
          )}
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-slate-400">Phone</span>
            <strong className="text-slate-900 font-medium">{sourceDetail.phone || "N/A"}</strong>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-slate-400">Location</span>
            <strong className="text-slate-900 font-medium">{sourceDetail.address || "N/A"}</strong>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-slate-400">Payment Terms</span>
            <strong className="text-slate-900 font-medium">{sourceDetail.paymentTerms}</strong>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-slate-400">Open Orders</span>
            <strong className="text-slate-900 font-bold">{sourceDetail.ordersCount} items</strong>
          </div>
        </div>
      </section>

      {/* Hero Catalog Card */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block mb-1">Customer Order Catalog</span>
          <h2 className="text-xl font-bold text-slate-900">Demand Items Awaiting Production</h2>
          <p className="text-slate-500 text-xs mt-1">Select items to convert into the plan basket. Check material capacity in bulk below.</p>
        </div>
        <div className="flex flex-wrap gap-5 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">Selected Basket Items</span>
            <strong className="text-lg font-bold text-slate-900">{basketStats.totalItems}</strong>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total Plan Qty</span>
            <strong className="text-lg font-bold text-slate-900">{basketStats.totalQty.toLocaleString()} pcs</strong>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">Earliest Required Date</span>
            <strong className="text-lg font-bold text-slate-900">{adToBs(basketStats.earliestDate)}</strong>
          </div>
        </div>
      </section>

      {/* Main Two-Column Split Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* Customer Orders Carousel Section */}
        <main className="flex flex-col gap-4 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Customer Orders</h2>
              <p className="text-xs text-slate-500">Select items to plan for the production run</p>
            </div>
            {/* Scroll Navigation Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={scrollLeft}
                title="Scroll Left"
                className="w-8 h-8 rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-center shadow-2xs transition-all cursor-pointer"
              >
                <MaterialIcon name="chevron_left" />
              </button>
              <button
                type="button"
                onClick={scrollRight}
                title="Scroll Right"
                className="w-8 h-8 rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-center shadow-2xs transition-all cursor-pointer"
              >
                <MaterialIcon name="chevron_right" />
              </button>
            </div>
          </div>

          {/* Horizontal Scrolling Carousel Container */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth snap-x snap-mandatory min-w-0 no-scrollbar"
            style={{ scrollbarWidth: "thin" }}
          >
            {catalogItems.length ? (
              catalogItems.map((item: any) => {
                const isInBasket = basket.some((b) => b.id === item.id);
                const isUrgent = item.priority === "Urgent" || item.priority === "Critical";

                return (
                  <div
                    key={item.id}
                    className={`w-[220px] shrink-0 snap-start bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden relative ${
                      isInBasket
                        ? "border-blue-600 bg-slate-50/70 shadow-md ring-2 ring-blue-500/20"
                        : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                    }`}
                  >
                    {/* Compact Image */}
                    <div className="relative w-full h-32 bg-slate-100 overflow-hidden">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className={`w-full h-full object-cover ${isInBasket ? "brightness-90" : ""}`}
                      />

                      {/* Status Chip */}
                      <span
                        title={isInBasket ? "Item in Plan Basket" : "Ready for Planning"}
                        className={`absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs z-10 ${
                          isInBasket ? "bg-emerald-600 text-white" : "bg-slate-900/80 text-white"
                        }`}
                      >
                        {isInBasket ? "Added" : "Ready"}
                      </span>

                      {/* Priority Tag (if urgent) */}
                      {isUrgent && (
                        <span
                          title="Priority: Urgent"
                          className="absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-600 text-white shadow-2xs z-10"
                        >
                          Urgent
                        </span>
                      )}
                    </div>

                    {/* Compact Body */}
                    <div className="p-3 flex flex-col gap-2 flex-1 justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 line-clamp-1" title={item.productName}>
                          {item.productName}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{item.variant}</p>
                      </div>

                      {/* Icon Specs with Hover Tooltips */}
                      <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
                        <div
                          title={`Target Quantity: ${item.quantity.toLocaleString()} pcs`}
                          className="flex items-center gap-1 font-mono font-bold text-slate-800 text-[11px] cursor-help"
                        >
                          <MaterialIcon name="inventory_2" style={{ fontSize: "14px", color: "#64748b" }} />
                          <span>{item.quantity} pcs</span>
                        </div>

                        <div
                          title={`Required Delivery Date: ${adToBs(item.deliveryDate || item.requiredDate)}`}
                          className="flex items-center gap-1 text-[10px] text-slate-500 font-mono cursor-help"
                        >
                          <MaterialIcon name="event" style={{ fontSize: "14px", color: "#94a3b8" }} />
                          <span>{adToBs(item.deliveryDate || item.requiredDate)}</span>
                        </div>
                      </div>

                      {/* Icon Action Buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          title="View Item Details"
                          onClick={() => setModalItem(item)}
                          className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                        >
                          <MaterialIcon name="info" style={{ fontSize: "15px" }} />
                          <span>Info</span>
                        </button>

                        <button
                          type="button"
                          title={isInBasket ? "Remove from Basket" : "Add to Plan Basket"}
                          onClick={() => handleAddToBasket(item)}
                          className={`flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isInBasket
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-blue-600 text-white hover:bg-blue-700 shadow-2xs"
                          }`}
                        >
                          <MaterialIcon name={isInBasket ? "check" : "add"} style={{ fontSize: "15px" }} />
                          <span>{isInBasket ? "Added" : "Add"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="w-full py-10 text-center text-xs text-slate-400 italic">No open customer items found.</div>
            )}
          </div>
        </main>

        {/* Sticky Plan Basket Panel */}
        <aside className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col gap-3 sticky top-6 transition-all">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                <MaterialIcon name="shopping_basket" style={{ fontSize: "16px" }} />
              </span>
              <div>
                <h3 className="font-bold text-sm text-slate-900 leading-tight">Plan Basket</h3>
                <span className="text-[10px] text-slate-500 font-mono">
                  {basketStats.totalItems} items ({basketStats.totalQty.toLocaleString()} pcs)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {basket.length > 0 && !isBasketMinimized && (
                <button
                  type="button"
                  title="Clear all basket items"
                  className="text-red-500 hover:text-red-700 text-[11px] font-bold p-1 rounded hover:bg-red-50 transition-all cursor-pointer mr-1"
                  onClick={handleClearBasket}
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                title={isBasketMinimized ? "Expand Basket Panel" : "Minimize Basket Panel"}
                className="w-7 h-7 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer"
                onClick={() => setIsBasketMinimized(!isBasketMinimized)}
              >
                <MaterialIcon name={isBasketMinimized ? "unfold_more" : "unfold_less"} style={{ fontSize: "16px" }} />
              </button>
            </div>
          </div>

          {!isBasketMinimized && (
            <>
              {/* Compact Basket Items List */}
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-0.5">
                {basket.length ? (
                  basket.map((item: any) => (
                    <div
                      className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100 text-xs hover:border-slate-200 transition-all"
                      key={item.id}
                    >
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-8 h-8 rounded-lg object-cover shrink-0 bg-white border border-slate-200"
                      />
                      <div className="flex-1 min-w-0">
                        <strong className="block text-slate-900 font-bold text-xs truncate" title={item.productName}>
                          {item.productName}
                        </strong>
                        <span className="block text-slate-500 text-[10px] truncate">{item.variant}</span>
                      </div>
                      <span
                        title={`Item Quantity: ${item.quantity} pcs`}
                        className="text-[11px] font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0"
                      >
                        {item.quantity} pcs
                      </span>
                      <button
                        type="button"
                        title="Remove item"
                        className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 cursor-pointer transition-all shrink-0"
                        onClick={() => handleRemoveFromBasket(item.id)}
                      >
                        <MaterialIcon name="close" style={{ fontSize: "14px" }} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl text-center">
                    <span className="text-2xl mb-1 text-slate-300">
                      <MaterialIcon name="shopping_basket" />
                    </span>
                    <span className="text-[11px]">Basket is empty</span>
                  </div>
                )}
              </div>

              {/* Compact Stats Row with Hover Tooltips */}
              <div className="grid grid-cols-3 gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100 text-xs my-1">
                <div
                  title={`Total Basket Items: ${basketStats.totalItems}`}
                  className="flex flex-col items-center justify-center text-center p-1 rounded bg-white border border-slate-100 cursor-help"
                >
                  <MaterialIcon name="inventory_2" style={{ fontSize: "15px", color: "#3b82f6" }} />
                  <span className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">Items</span>
                  <strong className="text-slate-900 text-xs font-bold font-mono">{basketStats.totalItems}</strong>
                </div>

                <div
                  title={`Total Production Quantity: ${basketStats.totalQty.toLocaleString()} pcs`}
                  className="flex flex-col items-center justify-center text-center p-1 rounded bg-white border border-slate-100 cursor-help"
                >
                  <MaterialIcon name="numbers" style={{ fontSize: "15px", color: "#10b981" }} />
                  <span className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">Qty</span>
                  <strong className="text-slate-900 text-xs font-bold font-mono">{basketStats.totalQty.toLocaleString()}</strong>
                </div>

                <div
                  title={`Earliest Date: ${adToBs(basketStats.earliestDate)} | Material Status: ${
                    bulkChecked ? "Checked OK" : "Pending Check"
                  }`}
                  className="flex flex-col items-center justify-center text-center p-1 rounded bg-white border border-slate-100 cursor-help"
                >
                  <MaterialIcon
                    name={bulkChecked ? "verified" : "event"}
                    style={{ fontSize: "15px", color: bulkChecked ? "#059669" : "#f59e0b" }}
                  />
                  <span className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">Status</span>
                  <strong className={`text-[10px] font-bold font-mono ${bulkChecked ? "text-emerald-700" : "text-amber-700"}`}>
                    {bulkChecked ? "OK" : "Pending"}
                  </strong>
                </div>
              </div>

              {/* Action Buttons */}
              <form onSubmit={handleCreatePlan} className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  title="Check Raw Material Capacity for Basket Items"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                  disabled={!basket.length || isCheckingBulk}
                  onClick={handleCheckBulkMaterials}
                >
                  <MaterialIcon name="inventory" style={{ fontSize: "15px" }} />
                  <span>{isCheckingBulk ? "Checking..." : "Check Materials"}</span>
                </button>

                <button
                  type="submit"
                  title="Proceed to Plan Details & Creation Setup"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  disabled={!basket.length || isSubmitting}
                >
                  {isSubmitting ? (
                    "Redirecting..."
                  ) : (
                    <>
                      <span>Proceed to Plan</span>
                      <MaterialIcon name="arrow_forward" style={{ fontSize: "15px" }} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </aside>
      </div>

      {/* Bulk Material requirement table */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Bulk Material Requirement</h2>
            <p className="text-xs text-slate-500 mt-0.5">Calculated total material required for all basket items.</p>
          </div>
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">Material Code</th>
                <th className="px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">Material Name</th>
                <th className="px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">Type</th>
                <th className="px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">Required Qty</th>
                <th className="px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">Available Qty</th>
                <th className="px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">Shortage Qty</th>
                <th className="px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">Unit</th>
                <th className="px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bulkChecked && bulkMaterials.length ? (
                bulkMaterials.map(mat => (
                  <tr key={mat.materialCode} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">{mat.materialCode}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{mat.materialName}</td>
                    <td className="px-4 py-3 text-slate-500">{mat.materialType}</td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-800">{Number(mat.requiredQty.toFixed(1))}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{mat.availableQty}</td>
                    <td className={`px-4 py-3 font-mono font-bold ${mat.shortageQty > 0 ? "text-red-600" : "text-emerald-600"}`}>
                      {mat.shortageQty > 0 ? Number(mat.shortageQty.toFixed(1)) : "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{mat.unit}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${mat.status === "Shortage" ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                        {mat.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400 italic">
                    {basket.length
                      ? 'Click "Check Materials in Bulk" in the basket panel to calculate requirements.'
                      : "Add items to basket to start checking materials."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Item Detail Modal */}
      {modalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-100 z-10">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Order Details</h2>
                <p className="text-xs text-slate-500 mt-0.5">Inspection for {modalItem.productName} ({modalItem.orderNo || modalItem.demandNo})</p>
              </div>
              <button type="button" className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-all cursor-pointer" onClick={() => setModalItem(null)}>
                <MaterialIcon name="close" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 items-start">
                {/* Visual Block */}
                <div>
                  <img src={modalItem.productImage} alt={modalItem.productName} className="w-full rounded-2xl shadow-sm object-cover bg-slate-50 border border-slate-100" />
                  <div className="border-t border-slate-100 pt-3 mt-3 flex justify-around text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Category</span>
                      <strong className="text-xs font-bold text-slate-900">{modalItem.category}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Priority</span>
                      <strong className="text-xs font-bold text-slate-900">{modalItem.priority}</strong>
                    </div>
                  </div>
                </div>

                {/* Info block */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-900">{modalItem.productName}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-slate-400">Planned Quantity</span>
                      <strong className="text-slate-900 font-bold">{modalItem.quantity.toLocaleString()} pcs</strong>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-slate-400">Required Date</span>
                      <strong className="text-slate-900 font-bold">{adToBs(modalItem.deliveryDate || modalItem.requiredDate)}</strong>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-slate-400">Variant / Fabric</span>
                      <strong className="text-slate-900 font-bold">{modalItem.variant}</strong>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Planning Notes</span>
                    <p className="text-xs text-slate-700 mt-1 m-0">{modalItem.productionNotes || "No notes available."}</p>
                  </div>

                  <div className="flex flex-col gap-2.5 pt-2">
                    <button
                      type="button"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
                      onClick={() => {
                        setActive3dSide("front");
                        setShow3dModal(true);
                      }}
                    >
                      <MaterialIcon name="view_in_ar" />
                      3D Mockup Preview
                    </button>
                    {basket.some(b => b.id === modalItem.id) ? (
                      <button
                        type="button"
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all cursor-pointer"
                        onClick={() => {
                          handleAddToBasket(modalItem);
                          setModalItem(null);
                        }}
                      >
                        <MaterialIcon name="check_circle" />
                        Remove from Plan
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
                        onClick={() => {
                          handleAddToBasket(modalItem);
                          setModalItem(null);
                        }}
                      >
                        <MaterialIcon name="add" />
                        Add to Production Plan
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Subtables: Sizes, Measurements, Materials */}
              <div className="space-y-6 pt-4 border-t border-slate-100">
                <section>
                  <div className="mb-2">
                    <h3 className="text-sm font-bold text-slate-900">Sizing Matrix Breakdown</h3>
                    <p className="text-xs text-slate-500">Required distributions across standard sizes.</p>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-4 py-2.5 font-semibold text-slate-600">Size</th>
                          <th className="px-4 py-2.5 font-semibold text-slate-600">Variant</th>
                          <th className="px-4 py-2.5 font-semibold text-slate-600">Quantity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {Object.entries(modalItem.sizes).map(([sz, qty]: any) => (
                          <tr key={sz}>
                            <td className="px-4 py-2.5 font-bold text-slate-900">{sz}</td>
                            <td className="px-4 py-2.5 text-slate-600">{modalItem.variant}</td>
                            <td className="px-4 py-2.5 font-mono text-slate-800">{qty} pcs</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section>
                  <div className="mb-2">
                    <h3 className="text-sm font-bold text-slate-900">Standard Measurements</h3>
                    <p className="text-xs text-slate-500">Standard grade specs used for tailors.</p>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-4 py-2.5 font-semibold text-slate-600">Size</th>
                          <th className="px-4 py-2.5 font-semibold text-slate-600">Chest</th>
                          <th className="px-4 py-2.5 font-semibold text-slate-600">Shoulder</th>
                          <th className="px-4 py-2.5 font-semibold text-slate-600">Sleeve</th>
                          <th className="px-4 py-2.5 font-semibold text-slate-600">Length</th>
                          <th className="px-4 py-2.5 font-semibold text-slate-600">Unit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {itemMeasurementChart.map(m => (
                          <tr key={m.size}>
                            <td className="px-4 py-2.5 font-bold text-slate-900">{m.size}</td>
                            <td className="px-4 py-2.5 text-slate-600">{m.chest}</td>
                            <td className="px-4 py-2.5 text-slate-600">{m.shoulder}</td>
                            <td className="px-4 py-2.5 text-slate-600">{m.sleeve}</td>
                            <td className="px-4 py-2.5 text-slate-600">{m.length}</td>
                            <td className="px-4 py-2.5 text-slate-500">{m.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section>
                  <div className="mb-2">
                    <h3 className="text-sm font-bold text-slate-900">Raw Materials Preview</h3>
                    <p className="text-xs text-slate-500">Standard material estimates for this item's quantities.</p>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-4 py-2.5 font-semibold text-slate-600">Material</th>
                          <th className="px-4 py-2.5 font-semibold text-slate-600">Required</th>
                          <th className="px-4 py-2.5 font-semibold text-slate-600">Available</th>
                          <th className="px-4 py-2.5 font-semibold text-slate-600">Shortage</th>
                          <th className="px-4 py-2.5 font-semibold text-slate-600">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {itemMaterialPreview.map((mat: any) => (
                          <tr key={mat.materialName}>
                            <td className="px-4 py-2.5 font-bold text-slate-900">{mat.materialName}</td>
                            <td className="px-4 py-2.5 font-mono text-slate-800">{Number(mat.requiredQty.toFixed(1))} {mat.unit}</td>
                            <td className="px-4 py-2.5 font-mono text-slate-600">{mat.availableQty} {mat.unit}</td>
                            <td className={`px-4 py-2.5 font-mono font-bold ${mat.shortageQty > 0 ? "text-red-600" : "text-emerald-600"}`}>
                              {mat.shortageQty > 0 ? `${Number(mat.shortageQty.toFixed(1))} ${mat.unit}` : "-"}
                            </td>
                            <td className="px-4 py-2.5">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${mat.status === "Shortage" ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                                {mat.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3D Shirt Preview Modal Drawer */}
      {show3dModal && modalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-100 z-10">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">3D Product Mockup</h2>
                <p className="text-xs text-slate-500 mt-0.5">Active design visual for {modalItem.productName}</p>
              </div>
              <button type="button" className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-all cursor-pointer" onClick={() => setShow3dModal(false)}>
                <MaterialIcon name="close" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6 items-start">
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                      <button
                        type="button"
                        className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${active3dSide === "front" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"}`}
                        onClick={() => setActive3dSide("front")}
                      >
                        Front
                      </button>
                      <button
                        type="button"
                        className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${active3dSide === "back" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"}`}
                        onClick={() => setActive3dSide("back")}
                      >
                        Back
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 p-6 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center relative min-h-[320px]">
                    <div className="uppercase font-bold text-[10px] bg-slate-900 text-white py-1 px-3 rounded-full absolute top-3 left-3 tracking-wider">
                      {active3dSide === "front" ? "Front View" : "Back View"}
                    </div>
                    <img
                      src={active3dSide === "front" ? "/images/mockup3dimages/whiteshirtfront.png" : "/images/mockup3dimages/whiteshirtback.png"}
                      alt="3D mockup"
                      className="max-h-[280px] object-contain"
                      onError={(e) => {
                        e.currentTarget.src = modalItem.productImage;
                      }}
                    />
                  </div>
                </section>

                <aside className="space-y-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block mb-1">Interactive Mockup</span>
                    <h3 className="text-lg font-bold text-slate-900">{modalItem.productName}</h3>
                    <p className="text-slate-500 text-xs mt-1">{modalItem.productionNotes || "No notes."}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Selected Variant / Fabric</div>
                    <strong className="text-slate-900 text-sm font-bold mt-1 block">{modalItem.variant}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Size split</div>
                    <div className="flex gap-2 flex-wrap">
                      {Object.keys(modalItem.sizes).map(sz => (
                        <span key={sz} className="py-1 px-2.5 border border-slate-200 rounded-lg text-xs font-bold bg-white text-slate-800">{sz}</span>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 text-xs">
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-slate-400">Order Ref</span>
                      <strong className="text-slate-900 font-bold">{modalItem.orderNo || modalItem.demandNo}</strong>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-slate-400">Quantity</span>
                      <strong className="text-slate-900 font-bold">{modalItem.quantity.toLocaleString()} pcs</strong>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerDemandPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-64px)] w-full max-w-7xl mx-auto p-6 text-center text-slate-500">Loading customer demand workspace...</div>}>
      <CustomerDemandContent />
    </Suspense>
  );
}
