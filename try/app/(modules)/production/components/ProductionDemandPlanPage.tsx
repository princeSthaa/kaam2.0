"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ActionButton } from "@/app/components/ui/ActionButton";
import { MaterialIcon } from "@/app/components/ui/MaterialIcon";
import { fetchCustomers } from "../../crm/api/customer.api";
import { Customer } from "../../crm/dto/customer.dto";
import { Order } from "../../crm/dto/order.dto";
import { fetchOrders } from "../../crm/api/order.api";

// Mock Database Lists
const mockCustomers: any[] = [];

const mockOutlets: any[] = [];

const mockProducts: any[] = [];

const mockMaterials: any[] = [];

const mockBoms: any[] = [];

const mockCustomerOrders: any[] = [];

const mockOutletDemands: any[] = [];

type DemandKind = "customer" | "outlet";

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

export function ProductionDemandPlanPageContent({ kind }: { kind: DemandKind }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Find source ID from query parameter
  const customerIdParam = searchParams.get("customerId");
  const outletIdParam = searchParams.get("outletId");
  const selectedSourceId = kind === "customer" ? customerIdParam : outletIdParam;

  const [liveCustomers, setLiveCustomers] = useState<Customer[]>([]);
  const [liveOrders, setLiveOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (kind === "customer") {
      fetchCustomers().then(setLiveCustomers).catch(console.error);
      fetchOrders().then(setLiveOrders).catch(console.error);
    }
  }, [kind]);

  // Retrieve source detail
  const sourceDetail = useMemo<any>(() => {
    if (!selectedSourceId) return null;
    if (kind === "customer") {
      const dbCust = liveCustomers.find(c => c.id === selectedSourceId);
      if (dbCust) {
        return {
          id: dbCust.id,
          customerName: dbCust.name,
          phone: dbCust.phone,
          address: dbCust.address,
          paymentTerms: "Net 30", // Placeholder if missing
          ordersCount: liveOrders.filter(o => o.customerId === dbCust.id).length,
          totalQty: liveOrders.filter(o => o.customerId === dbCust.id).reduce((sum, o) => sum + o.totalAmount, 0),
        };
      }
      return mockCustomers.find(c => c.id === selectedSourceId) || null;
    } else {
      return mockOutlets.find(o => o.id === selectedSourceId) || null;
    }
  }, [selectedSourceId, kind, liveCustomers, liveOrders]);

  // Retrieve matching catalog items
  const catalogItems = useMemo(() => {
    if (!selectedSourceId) return [];
    if (kind === "customer") {
      const custOrders = liveOrders.filter(o => o.customerId === selectedSourceId);
      if (custOrders.length > 0) {
        const itemsList: any[] = [];
        custOrders.forEach((o) => {
          if (o.items && o.items.length > 0) {
            o.items.forEach((item, index) => {
              const qty = Number(item.quantity) || 10;
              itemsList.push({
                id: `${o.id || o.orderNumber}-${index}`,
                orderNo: o.orderNumber,
                customerId: o.customerId,
                productId: "PRD-001", // Default placeholder for BOM matching
                productName: item.productName || `Item #${index + 1}`,
                category: "General",
                variant: "Standard Color",
                quantity: qty,
                deliveryDate: o.dueDate,
                priority: "Normal",
                productImage: "/images/products/place-holder.png",
                productionNotes: o.status,
                sizes: { M: Math.floor(qty / 2), L: Math.ceil(qty / 2) }
              });
            });
          } else {
            // Fallback for orders with no items
            itemsList.push({
              id: o.id || o.orderNumber,
              orderNo: o.orderNumber,
              customerId: o.customerId,
              productId: "PRD-001",
              productName: `Custom Order ${o.orderNumber}`,
              category: "General",
              variant: "Default",
              quantity: 10,
              deliveryDate: o.dueDate,
              priority: "Normal",
              productImage: "/images/products/place-holder.png",
              productionNotes: o.status,
              sizes: { M: 5, L: 5 }
            });
          }
        });
        return itemsList;
      }
      return mockCustomerOrders.filter(o => o.customerId === selectedSourceId);
    } else {
      return mockOutletDemands.filter(d => d.outletId === selectedSourceId);
    }
  }, [selectedSourceId, kind, liveOrders]);

  // Basket state
  const [basket, setBasket] = useState<any[]>([]);

  // Detailed Modal state
  const [modalItem, setModalItem] = useState<any | null>(null);

  // 3D Preview Modal state
  const [show3dModal, setShow3dModal] = useState(false);
  const [active3dSide, setActive3dSide] = useState<"front" | "back">("front");

  // Material Requirement State
  const [bulkChecked, setBulkChecked] = useState(false);
  const [bulkMaterials, setBulkMaterials] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toggle basket item
  const handleAddToBasket = (item: any) => {
    setBasket(prev => {
      const exists = prev.some(b => b.id === item.id);
      if (exists) {
        return prev.filter(b => b.id !== item.id);
      }
      return [...prev, item];
    });
    setBulkChecked(false); // Reset material check
  };

  const handleRemoveFromBasket = (id: number) => {
    setBasket(prev => prev.filter(b => b.id !== id));
    setBulkChecked(false);
  };

  const handleClearBasket = () => {
    setBasket([]);
    setBulkChecked(false);
  };

  // Compute stats for basket
  const basketStats = useMemo(() => {
    const totalItems = basket.length;
    const totalQty = basket.reduce((sum, item) => sum + item.quantity, 0);

    const dates = basket
      .map(item => item.deliveryDate || item.requiredDate)
      .filter(Boolean)
      .sort();
    const earliestDate = dates[0] || "-";

    return { totalItems, totalQty, earliestDate };
  }, [basket]);

  // Bulk material checker
  const handleCheckBulkMaterials = () => {
    if (!basket.length) return;

    const calculated: { [key: string]: any } = {};

    basket.forEach(item => {
      const boms = mockBoms.filter(b => b.productId === item.productId);
      boms.forEach(bom => {
        const material = mockMaterials.find(m => m.id === bom.materialId);
        if (!material) return;

        const baseQty = item.quantity * bom.qtyPerUnit;
        const requiredQty = baseQty + (baseQty * bom.wastagePercent) / 100;
        const key = material.materialCode;

        if (calculated[key]) {
          calculated[key].requiredQty += requiredQty;
        } else {
          calculated[key] = {
            materialCode: material.materialCode,
            materialName: material.name,
            materialType: material.type,
            requiredQty,
            availableQty: material.availableQty,
            unit: material.unit,
          };
        }
      });
    });

    const finalMaterials = Object.values(calculated).map(mat => {
      const shortageQty = Math.max(mat.requiredQty - mat.availableQty, 0);
      return {
        ...mat,
        shortageQty,
        status: shortageQty > 0 ? "Shortage" : "Available",
      };
    });

    setBulkMaterials(finalMaterials);
    setBulkChecked(true);
  };

  // Submit / Create Plan Action
  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!basket.length) return;
    setIsSubmitting(true);

    // Save temporary basket and source detail to localStorage to pass to details config page
    if (typeof window !== "undefined") {
      const tempData = {
        kind,
        sourceDetail,
        basket,
        selectedSourceId,
      };
      localStorage.setItem("temp_plan_basket", JSON.stringify(tempData));
    }

    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/production/plans/new");
    }, 800);
  };

  const handleSaveDraft = () => {
    if (!basket.length || !sourceDetail) return;

    const now = new Date().toISOString();
    const planNo = buildPlanNo(kind === "customer" ? "DRAFT-CUS" : "DRAFT-OUT");
    const products = basket.map((item: any, index) => ({
      lineId: `${planNo}-L${index + 1}`,
      orderNo: item.orderNo || "",
      demandNo: item.demandNo || "",
      productId: item.productId,
      productCode: item.productCode || item.productId,
      productName: item.productName,
      category: item.category,
      variant: item.variant,
      quantity: item.quantity,
      sourceName: sourceDetail.customerName || sourceDetail.name,
      requiredDate: item.deliveryDate || item.requiredDate,
      plannedStartDate: "",
      plannedCompletionDate: "",
      status: "Draft",
      priority: item.priority || "Normal",
      risk: ["urgent", "critical"].includes(String(item.priority || "").toLowerCase()),
      productImage: item.productImage,
      productionNotes: item.productionNotes,
      sizes: normalizeSizeRows(item.sizes),
    }));
    const requiredDates = products.map((product) => product.requiredDate).filter(Boolean).sort();

    saveProductionDraft({
      id: planNo,
      planId: planNo,
      planNo,
      planDate: now.slice(0, 10),
      demandType: kind === "customer" ? "Customer Order" : "Outlet Replenishment",
      sourceType: kind === "customer" ? "Customer" : "Outlet",
      sourceId: selectedSourceId,
      sourceName: sourceDetail.customerName || sourceDetail.name,
      productId: products[0]?.productId || "",
      productName: products[0]?.productName || "Production Plan",
      variant: products[0]?.variant || "",
      quantity: products.reduce((sum, product) => sum + Number(product.quantity || 0), 0),
      totalQuantity: products.reduce((sum, product) => sum + Number(product.quantity || 0), 0),
      priority: products.some((product) => ["Urgent", "Critical"].includes(String(product.priority))) ? "Urgent" : "Normal",
      outputDestination: kind === "customer" ? "Customer Dispatch" : "Outlet Transfer",
      requiredDate: requiredDates[0] || "",
      status: "Draft",
      draftSourceUrl: `${kind === "customer" ? "/production/demands/customer" : "/production/demands/outlet"}?${kind === "customer" ? "customerId" : "outletId"}=${selectedSourceId}`,
      draftSourceType: kind === "customer" ? "Customer" : "Outlet",
      draftSavedAt: now,
      createdAt: now,
      lastEditedAt: now,
      products,
      activities: [{ title: "Draft created", text: "Production plan draft saved from planning basket." }],
    });

    router.push("/production/drafts");
  };

  // Single item Material Calculation preview inside Modal
  const itemMaterialPreview = useMemo(() => {
    if (!modalItem) return [];
    const boms = mockBoms.filter(b => b.productId === modalItem.productId);
    return boms.map(bom => {
      const material = mockMaterials.find(m => m.id === bom.materialId);
      if (!material) return null;

      const requiredQty = modalItem.quantity * bom.qtyPerUnit;
      const shortageQty = Math.max(requiredQty - material.availableQty, 0);

      return {
        materialName: material.name,
        requiredQty,
        availableQty: material.availableQty,
        shortageQty,
        unit: material.unit,
        status: shortageQty > 0 ? "Shortage" : "Available",
      };
    }).filter(Boolean);
  }, [modalItem]);

  // Measurement chart mock helper
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

  if (!selectedSourceId || !sourceDetail) {
    return (
      <div className="pp-page">
        <div className="alert alert-warning max-w-600 mx-auto mt-50 text-center p-30 rounded-20 shadow-sm border bg-red-soft text-danger">
          <span style={{ fontSize: "40px", marginBottom: "16px", display: "inline-block" }}>
            <MaterialIcon name="warning" />
          </span>
          <h3>No {kind === "customer" ? "Customer" : "Outlet"} Selected</h3>
          <p className="mt-8 mb-20 text-muted">Please select a {kind === "customer" ? "customer" : "outlet"} from the catalog to start planning.</p>
          <Link href={kind === "customer" ? "/production/demands/catalog/customer" : "/production/demands/catalog/outlet"} className="btn btn-primary">
            Go to {kind === "customer" ? "Customer" : "Outlet"} Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pp-page">
      <style>{`
        .customer-order-card.selected {
          border-color: #2563eb !important;
          background-color: #f8fafc !important;
          box-shadow: 0 14px 34px rgba(37, 99, 235, 0.16) !important;
          transform: translateY(-2px);
        }
        .selected-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(37, 99, 235, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        .checkmark-icon {
          background-color: #2563eb;
          color: #ffffff;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
          animation: popCheckmark 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes popCheckmark {
          0% { transform: scale(0); }
          100% { transform: scale(1); }
        }
      `}</style>
      <div className="pp-page-header">
        <div>
          <h1>Create {kind === "customer" ? "Customer Order" : "Outlet Replenishment"} Plan</h1>
          <p>Configure garments, size matrices, and bulk materials for {sourceDetail.customerName || sourceDetail.name}.</p>
        </div>
        <div className="pp-header-actions">
          <Link href={kind === "customer" ? "/production/demands/catalog/customer" : "/production/demands/catalog/outlet"} className="btn btn-light">
            <MaterialIcon name="chevron_left" />
            Choose {kind === "customer" ? "Customer" : "Outlet"}
          </Link>
          <Link href="/production/demands" className="btn btn-light">
            Change Demand Type
          </Link>
          <Link href="/production/plans" className="btn btn-primary">
            Back to Plans
          </Link>
        </div>
      </div>

      {/* Selected Source Summary Card */}
      <section className="pp-card mb-24 p-20 d-flex align-items-center justify-content-between flex-wrap gap-20">
        <div className="d-flex align-items-center gap-16">
          <div className="rounded-12 d-flex align-items-center justify-content-center" style={kind === "customer" ? { backgroundColor: "#eff6ff", color: "#2563eb", width: "48px", height: "48px", flexShrink: 0 } : { backgroundColor: "#f0fdf4", color: "#16a34a", width: "48px", height: "48px", flexShrink: 0 }}>
            <MaterialIcon name={kind === "customer" ? "person" : "storefront"} />
          </div>
          <div>
            <span className="text-xs text-muted font-bold d-block uppercase tracking-wider">{kind === "customer" ? "Customer Account" : "Store Outlet"}</span>
            <strong className="fs-16">{sourceDetail.customerName || sourceDetail.name}</strong>
          </div>
        </div>
        <div className="selected-customer-stats m-0 flex-grow-1 justify-content-end d-flex gap-20 flex-wrap">
          {kind === "customer" ? (
            <>
              <div>
                <span>Phone</span>
                <strong>{sourceDetail.phone}</strong>
              </div>
              <div>
                <span>Location</span>
                <strong>{sourceDetail.address}</strong>
              </div>
              <div>
                <span>Payment Terms</span>
                <strong>{sourceDetail.paymentTerms}</strong>
              </div>
              <div>
                <span>Open Orders</span>
                <strong>{sourceDetail.ordersCount} items</strong>
              </div>
            </>
          ) : (
            <>
              <div>
                <span>Manager</span>
                <strong>{sourceDetail.manager}</strong>
              </div>
              <div>
                <span>Location</span>
                <strong>{sourceDetail.location}</strong>
              </div>
              <div>
                <span>Demand Items</span>
                <strong>{sourceDetail.demandCount} items</strong>
              </div>
              <div>
                <span>Suggested Qty</span>
                <strong>{sourceDetail.totalQty.toLocaleString()} pcs</strong>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Hero Catalog Card */}
      <section className="pp-card catalog-hero-card mb-24">
        <div className="catalog-hero-content">
          <div>
            <span className="catalog-eyebrow">{kind === "customer" ? "Customer Order Catalog" : "Outlet Replenishment Catalog"}</span>
            <h2>Demand Items Awaiting Production</h2>
            <p className="text-muted text-xs mt-4">Select items to convert into the plan basket. Check material capacity in bulk below.</p>
          </div>
          <div className="catalog-hero-stats">
            <div>
              <span>Selected Basket Items</span>
              <strong>{basketStats.totalItems}</strong>
            </div>
            <div>
              <span>Total Plan Qty</span>
              <strong>{basketStats.totalQty.toLocaleString()} pcs</strong>
            </div>
            <div>
              <span>Earliest Required Date</span>
              <strong>{basketStats.earliestDate}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Main Two-Column Split Dashboard */}
      <div className="catalog-layout">
        <main className="catalog-main">
          <div className="catalog-section-header">
            <h2>{kind === "customer" ? "Customer Orders" : "Outlet Demands"}</h2>
            <p>Select which items to plan for the production run.</p>
          </div>

          <div className="customer-order-catalog-grid">
            {catalogItems.length ? (
              catalogItems.map((item: any) => {
                const isInBasket = basket.some(b => b.id === item.id);
                const priorityClass = item.priority === "Urgent" || item.priority === "Critical" ? "status-danger" : "status-normal";
                return (
                  <div className={`customer-order-card ${isInBasket ? "selected" : ""}`} key={item.id}>
                    <div className="customer-order-image-wrap">
                      <img src={item.productImage} alt={item.productName} style={isInBasket ? { filter: "brightness(0.7) contrast(1.1)" } : undefined} />
                      <span className={`catalog-status-chip ${isInBasket ? "added" : ""}`}>
                        {isInBasket ? "Added" : "Ready"}
                      </span>
                      {isInBasket && (
                        <div className="selected-overlay">
                          <span className="checkmark-icon">
                            <MaterialIcon name="check" />
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="customer-order-card-body">
                      <div className="catalog-card-top">
                        <span className="customer-code">{item.orderNo || item.demandNo}</span>
                        <span className={`priority-badge ${priorityClass}`}>{item.priority}</span>
                      </div>

                      <h3>{item.productName}</h3>
                      <p className="catalog-customer-name">{item.variant}</p>

                      <div className="catalog-meta-grid">
                        <div>
                          <span>Target Qty</span>
                          <strong>{item.quantity.toLocaleString()} pcs</strong>
                        </div>
                        <div>
                          <span>Required Date</span>
                          <strong>{item.deliveryDate || item.requiredDate}</strong>
                        </div>
                        {kind === "outlet" && (
                          <>
                            <div>
                              <span>Current Stock</span>
                              <strong>{item.currentStock} pcs</strong>
                            </div>
                            <div>
                              <span>Velocity (30D)</span>
                              <strong>{item.last30Sales} sales</strong>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="catalog-card-actions">
                        <button type="button" className="btn btn-light" onClick={() => setModalItem(item)}>
                          View Details
                        </button>
                        <button
                          type="button"
                          className={`btn ${isInBasket ? "btn-light" : "btn-primary"}`}
                          style={isInBasket ? { backgroundColor: "#ecfdf5", color: "#047857", borderColor: "#a7f3d0" } : undefined}
                          onClick={() => handleAddToBasket(item)}
                        >
                          {isInBasket ? (
                            <span className="d-flex align-items-center justify-content-center gap-4">
                              <MaterialIcon name="check_circle" />
                              Added
                            </span>
                          ) : (
                            "Add to Plan"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-cell py-30 w-full text-center">No open items found.</div>
            )}
          </div>
        </main>

        {/* Sticky Plan Basket Panel */}
        <aside className="plan-basket-panel">
          <div className="plan-basket-header">
            <div>
              <h2>Plan Basket</h2>
              <p>Items included in the current run</p>
            </div>
            {basket.length ? (
              <button type="button" className="btn btn-link text-danger text-xs p-0 border-0 bg-transparent" onClick={handleClearBasket}>
                Clear All
              </button>
            ) : null}
          </div>

          <div className="plan-basket-items" style={{ minHeight: "180px", maxHeight: "400px", overflowY: "auto" }}>
            {basket.length ? (
              basket.map((item: any) => (
                <div className="basket-item mb-8" key={item.id}>
                  <img src={item.productImage} alt={item.productName} />
                  <div>
                    <strong>{item.productName}</strong>
                    <span>{item.orderNo || item.demandNo} | {item.quantity} pcs</span>
                  </div>
                  <button type="button" className="btn-link text-danger border-0 bg-transparent p-4 d-grid place-items-center" onClick={() => handleRemoveFromBasket(item.id)}>
                    <span style={{ fontSize: "16px", display: "inline-block" }}>
                      <MaterialIcon name="close" />
                    </span>
                  </button>
                </div>
              ))
            ) : (
              <div className="basket-empty-state d-grid place-items-center min-h-120 text-muted fs-12 border border-dashed rounded-12 p-20">
                <span style={{ fontSize: "32px", marginBottom: "8px", display: "inline-block" }}>
                  <MaterialIcon name="shopping_basket" />
                </span>
                <span>Basket is empty. Add items from the catalog.</span>
              </div>
            )}
          </div>

          <div className="plan-basket-summary border-top pt-16 mt-16">
            <div className="d-flex justify-content-between mb-8 fs-12">
              <span>Total Items:</span>
              <strong className="text-dark">{basketStats.totalItems}</strong>
            </div>
            <div className="d-flex justify-content-between mb-8 fs-12">
              <span>Total Qty:</span>
              <strong className="text-dark">{basketStats.totalQty.toLocaleString()} pcs</strong>
            </div>
            <div className="d-flex justify-content-between mb-8 fs-12">
              <span>Earliest Date:</span>
              <strong className="text-dark">{basketStats.earliestDate}</strong>
            </div>
            <div className="d-flex justify-content-between mb-16 fs-12">
              <span>Material Checked:</span>
              <strong className={bulkChecked ? "text-green" : "text-danger"}>
                {bulkChecked ? "Checked OK" : "Pending Check"}
              </strong>
            </div>
          </div>

          <form onSubmit={handleCreatePlan} className="d-flex flex-column gap-10">
            <button
              type="button"
              className="btn btn-light full-width"
              disabled={!basket.length || isSubmitting}
              onClick={handleSaveDraft}
            >
              <MaterialIcon name="draft" />
              Save to Drafts
            </button>
            <button
              type="button"
              className="btn btn-outline full-width"
              disabled={!basket.length}
              onClick={handleCheckBulkMaterials}
            >
              <MaterialIcon name="inventory" />
              Check Materials in Bulk
            </button>
            <button
              type="submit"
              className="btn btn-primary full-width"
              disabled={!basket.length || isSubmitting}
            >
              {isSubmitting ? (
                "Redirecting..."
              ) : (
                <>
                  <MaterialIcon name="arrow_forward" />
                  Proceed to Plan Details
                </>
              )}
            </button>
          </form>
        </aside>
      </div>

      {/* Bulk Material requirement table */}
      <section className="pp-card bulk-material-card mt-24">
        <div className="pp-card-header">
          <div>
            <h2>Bulk Material Requirement</h2>
            <p>Calculated total material required for all basket items.</p>
          </div>
        </div>
        <div className="pp-table-wrapper border rounded-12">
          <table className="pp-table compact-table m-0">
            <thead>
              <tr>
                <th>Material Code</th>
                <th>Material Name</th>
                <th>Type</th>
                <th>Required Qty</th>
                <th>Available Qty</th>
                <th>Shortage Qty</th>
                <th>Unit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bulkChecked && bulkMaterials.length ? (
                bulkMaterials.map(mat => (
                  <tr key={mat.materialCode}>
                    <td><code>{mat.materialCode}</code></td>
                    <td><strong>{mat.materialName}</strong></td>
                    <td>{mat.materialType}</td>
                    <td>{Number(mat.requiredQty.toFixed(1))}</td>
                    <td>{mat.availableQty}</td>
                    <td className={mat.shortageQty > 0 ? "text-danger fw-700" : "text-green"}>
                      {mat.shortageQty > 0 ? Number(mat.shortageQty.toFixed(1)) : "-"}
                    </td>
                    <td>{mat.unit}</td>
                    <td>
                      <span className={`status-badge ${mat.status === "Shortage" ? "status-shortage" : "status-completed"} text-xs`}>
                        {mat.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="empty-cell py-30 text-center text-muted">
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
        <div className="pp-modal">
          <div className="pp-modal-backdrop" onClick={() => setModalItem(null)} />
          <div className="pp-modal-panel large order-detail-modal-panel">
            <div className="pp-modal-header">
              <div>
                <h2>{kind === "customer" ? "Order Details" : "Demand Details"}</h2>
                <p>Inspection for {modalItem.productName} ({modalItem.orderNo || modalItem.demandNo})</p>
              </div>
              <button type="button" className="modal-close-btn border-0 bg-transparent" onClick={() => setModalItem(null)}>
                <MaterialIcon name="close" />
              </button>
            </div>

            <div className="pp-modal-body">
              <div className="order-detail-layout">
                {/* Visual Block */}
                <div className="order-detail-media">
                  <img src={modalItem.productImage} alt={modalItem.productName} />
                  <div className="order-detail-thumbnail-row border-top pt-12 mt-12 d-flex justify-content-around">
                    <div>
                      <span className="text-xs text-muted d-block">Category</span>
                      <strong>{modalItem.category}</strong>
                    </div>
                    <div>
                      <span className="text-xs text-muted d-block">Priority</span>
                      <strong>{modalItem.priority}</strong>
                    </div>
                  </div>
                </div>

                {/* Info block */}
                <div className="order-detail-info">
                  <h3>{modalItem.productName}</h3>
                  <div className="detail-info-grid mt-12">
                    <div>
                      <span>Planned Quantity</span>
                      <strong>{modalItem.quantity.toLocaleString()} pcs</strong>
                    </div>
                    <div>
                      <span>Required Date</span>
                      <strong>{modalItem.deliveryDate || modalItem.requiredDate}</strong>
                    </div>
                    <div>
                      <span>Variant Color</span>
                      <strong>{modalItem.variant}</strong>
                    </div>
                    {kind === "outlet" && (
                      <>
                        <div>
                          <span>Current Stock</span>
                          <strong>{modalItem.currentStock} pcs</strong>
                        </div>
                        <div>
                          <span>Reorder Limit</span>
                          <strong>{modalItem.reorderLevel} pcs</strong>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="detail-note-box mt-16 p-12 bg-light rounded-12">
                    <span className="text-xs font-bold text-muted uppercase tracking-wider">Planning Notes</span>
                    <p className="fs-12 text-dark mt-4 m-0">{modalItem.productionNotes || "No notes available."}</p>
                  </div>

                  <div className="detail-action-stack mt-20 d-flex flex-column gap-10">
                    <button
                      type="button"
                      className="btn btn-outline full-width"
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
                        className="btn btn-outline full-width"
                        style={{ backgroundColor: "#ecfdf5", color: "#047857", borderColor: "#a7f3d0" }}
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
                        className="btn btn-primary full-width"
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
              <div className="order-detail-tabs mt-24">
                {/* Sizes Breakdown */}
                <section className="detail-section mb-20">
                  <div className="detail-section-header">
                    <h3>Sizing Matrix Breakdown</h3>
                    <p>Required distributions across standard sizes.</p>
                  </div>
                  <div className="pp-table-wrapper border rounded-12">
                    <table className="pp-table compact-table m-0">
                      <thead>
                        <tr>
                          <th>Size</th>
                          <th>Variant</th>
                          <th>Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(modalItem.sizes).map(([sz, qty]: any) => (
                          <tr key={sz}>
                            <td><strong>{sz}</strong></td>
                            <td>{modalItem.variant}</td>
                            <td>{qty} pcs</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Measurements */}
                <section className="detail-section mb-20">
                  <div className="detail-section-header">
                    <h3>Standard Measurements</h3>
                    <p>Standard grade specs used for tailors.</p>
                  </div>
                  <div className="pp-table-wrapper border rounded-12">
                    <table className="pp-table compact-table m-0">
                      <thead>
                        <tr>
                          <th>Size</th>
                          <th>Chest</th>
                          <th>Shoulder</th>
                          <th>Sleeve</th>
                          <th>Length</th>
                          <th>Unit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itemMeasurementChart.map(m => (
                          <tr key={m.size}>
                            <td><strong>{m.size}</strong></td>
                            <td>{m.chest}</td>
                            <td>{m.shoulder}</td>
                            <td>{m.sleeve}</td>
                            <td>{m.length}</td>
                            <td>{m.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* BOM Requirement */}
                <section className="detail-section">
                  <div className="detail-section-header">
                    <h3>Raw Materials Preview</h3>
                    <p>Standard material estimates for this item's quantities.</p>
                  </div>
                  <div className="pp-table-wrapper border rounded-12">
                    <table className="pp-table compact-table m-0">
                      <thead>
                        <tr>
                          <th>Material</th>
                          <th>Required</th>
                          <th>Available</th>
                          <th>Shortage</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itemMaterialPreview.map((mat: any) => (
                          <tr key={mat.materialName}>
                            <td><strong>{mat.materialName}</strong></td>
                            <td>{Number(mat.requiredQty.toFixed(1))} {mat.unit}</td>
                            <td>{mat.availableQty} {mat.unit}</td>
                            <td className={mat.shortageQty > 0 ? "text-danger fw-700" : "text-green"}>
                              {mat.shortageQty > 0 ? `${Number(mat.shortageQty.toFixed(1))} ${mat.unit}` : "-"}
                            </td>
                            <td>
                              <span className={`status-badge ${mat.status === "Shortage" ? "status-shortage" : "status-completed"} text-xs`}>
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
        <div className="pp-modal product-3d-modal">
          <div className="pp-modal-backdrop" onClick={() => setShow3dModal(false)} />
          <div className="pp-modal-panel large product-3d-modal-panel">
            <div className="pp-modal-header">
              <div>
                <h2>3D Product Mockup</h2>
                <p>Active design visual for {modalItem.productName}</p>
              </div>
              <button type="button" className="modal-close-btn border-0 bg-transparent" onClick={() => setShow3dModal(false)}>
                <MaterialIcon name="close" />
              </button>
            </div>

            <div className="pp-modal-body product-3d-modal-body">
              <div className="product-3d-layout">
                {/* 3D Canvas Mock */}
                <section className="product-3d-viewer-card">
                  <div className="product-3d-viewer-head">
                    <div className="product-3d-segmented">
                      <button
                        type="button"
                        className={`product-3d-view-btn ${active3dSide === "front" ? "active" : ""}`}
                        onClick={() => setActive3dSide("front")}
                      >
                        Front
                      </button>
                      <button
                        type="button"
                        className={`product-3d-view-btn ${active3dSide === "back" ? "active" : ""}`}
                        onClick={() => setActive3dSide("back")}
                      >
                        Back
                      </button>
                    </div>
                    <div className="product-3d-hint text-xs text-muted mt-8">Click buttons to flip mockup template shirt</div>
                  </div>
                  <div className="product-3d-stage mt-16 p-24 bg-light rounded-16 border d-grid place-items-center relative" style={{ minHeight: "320px" }}>
                    <div className="product-3d-view-pill uppercase font-bold text-xs bg-dark text-white py-4 px-10 rounded-20 absolute" style={{ top: "12px", left: "12px" }}>
                      {active3dSide === "front" ? "Front View" : "Back View"}
                    </div>
                    <img
                      src={active3dSide === "front" ? "/images/mockup3dimages/whiteshirtfront.png" : "/images/mockup3dimages/whiteshirtback.png"}
                      alt="3D mockup"
                      style={{ maxHeight: "280px", objectFit: "contain" }}
                      onError={(e) => {
                        // Fallback image
                        e.currentTarget.src = modalItem.productImage;
                      }}
                    />
                  </div>
                </section>

                {/* Specs */}
                <aside className="product-3d-details-card">
                  <div>
                    <span className="catalog-eyebrow">Interactive Mockup</span>
                    <h3>{modalItem.productName}</h3>
                    <p className="text-muted text-xs">{modalItem.productionNotes || "No notes."}</p>
                  </div>
                  <div className="product-3d-option-block mt-16">
                    <div className="product-3d-option-title text-xs font-bold text-muted uppercase">Selected Variant Color</div>
                    <strong className="text-dark fs-14 mt-4 d-block">{modalItem.variant}</strong>
                  </div>
                  <div className="product-3d-option-block mt-16">
                    <div className="product-3d-option-title text-xs font-bold text-muted uppercase">Size split</div>
                    <div className="d-flex gap-8 flex-wrap mt-6">
                      {Object.keys(modalItem.sizes).map(sz => (
                        <span key={sz} className="py-4 px-8 border rounded-8 text-xs font-bold bg-white text-dark">{sz}</span>
                      ))}
                    </div>
                  </div>
                  <div className="product-3d-meta-grid border-top pt-16 mt-20">
                    <div>
                      <span>Order Ref</span>
                      <strong>{modalItem.orderNo || modalItem.demandNo}</strong>
                    </div>
                    <div>
                      <span>Quantity</span>
                      <strong>{modalItem.quantity.toLocaleString()} pcs</strong>
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

export function ProductionDemandPlanPage({ kind }: { kind: DemandKind }) {
  return (
    <Suspense fallback={<div className="pp-page text-center py-50">Loading page parameters...</div>}>
      <ProductionDemandPlanPageContent kind={kind} />
    </Suspense>
  );
}


