"use client";
import { API_MAIN_URL } from "@/app/(modules)/api/constant";

const API_BASE_URL = `${API_MAIN_URL}/production-plans`;
import { mockProductionPlans } from "../../api/production.mock";

const dispatchMockFallback = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("MockDataFallback"));
  }
};
import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ActionButton } from "@/app/components/ui/ActionButton";
import { MaterialIcon } from "@/app/components/ui/MaterialIcon";
import { adToBs } from "@/app/components/ui/dateUtils";
import { fetchCustomers } from "../../../crm/api/customer.api";
import { fetchOrders } from "../../../crm/api/order.api";
import { fetchFabrics, Fabric, resolveMediaUrl } from "../../../crm/api/catalog.api";
import { Customer } from "../../../crm/dto/customer.dto";
import { Order } from "../../../crm/dto/order.dto";
import { checkMaterials } from "../../api/constant";
import { buildPlanNo, saveProductionDraft, normalizeSizeRows, draftStorageKey } from "../../api/production.helpers";
import { fetchProducts as fetchAdminProducts } from "../../../admin/api/product.api";




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
      fetch(`${API_MAIN_URL}/production-plans`).then(r => r.ok ? r.json() : Promise.reject()).then(setExistingPlans).catch((err) => { console.error(err); dispatchMockFallback(); setExistingPlans(mockProductionPlans); }),
      fetch(`${API_MAIN_URL}/production-plan-product`).then(r => r.ok ? r.json() : Promise.reject()).then(setExistingPlanProducts).catch((err) => { console.error(err); dispatchMockFallback(); setExistingPlanProducts([]); })
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

  useEffect(() => {
    if (!isLoadingData && (!customerIdParam || !sourceDetail)) {
      router.replace("/production/demands/catalog/customer");
    }
  }, [isLoadingData, customerIdParam, sourceDetail, router]);

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
      } catch { }
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

  // Size Quantity Selection Modal state
  const [sizeModalItem, setSizeModalItem] = useState<any | null>(null);
  const [selectedSizeQuantities, setSelectedSizeQuantities] = useState<Record<string, number>>({});

  // 3D Preview Modal state
  const [show3dModal, setShow3dModal] = useState(false);
  const [active3dSide, setActive3dSide] = useState<"front" | "back">("front");

  // Material Requirement State
  const [bulkChecked, setBulkChecked] = useState(false);
  const [isCheckingBulk, setIsCheckingBulk] = useState(false);
  const [bulkMaterials, setBulkMaterials] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenSizeModal = (item: any) => {
    setSizeModalItem(item);
    const existingInBasket = basket.find((b) => b.id === item.id);
    if (existingInBasket && existingInBasket.selectedSizes) {
      setSelectedSizeQuantities({ ...existingInBasket.selectedSizes });
    } else {
      const initial: Record<string, number> = {};
      const availableEntries = Object.entries(item.sizes || {}).filter(([_, qty]) => Number(qty) > 0);

      if (availableEntries.length > 0) {
        availableEntries.forEach(([sz, qty]) => {
          initial[sz] = Number(qty) || 0;
        });
      } else {
        const availableSizeKeys =
          item.sizes && Object.keys(item.sizes).length > 0 ? Object.keys(item.sizes) : ["S", "M", "L", "XL"];
        availableSizeKeys.forEach((sz: string) => {
          initial[sz] = item.sizes?.[sz] !== undefined ? Number(item.sizes[sz]) || 0 : 0;
        });
      }
      setSelectedSizeQuantities(initial);
    }
  };

  const handleConfirmSizeSelection = () => {
    if (!sizeModalItem) return;

    const activeSizes: Record<string, number> = {};
    let totalQty = 0;
    Object.entries(selectedSizeQuantities).forEach(([sz, qty]) => {
      const num = Number(qty) || 0;
      if (num > 0) {
        activeSizes[sz] = num;
        totalQty += num;
      }
    });

    if (totalQty === 0) {
      setBasket((prev) => prev.filter((b) => b.id !== sizeModalItem.id));
    } else {
      const updatedItem = {
        ...sizeModalItem,
        quantity: totalQty,
        selectedSizes: activeSizes,
      };
      setBasket((prev) => {
        const exists = prev.some((b) => b.id === sizeModalItem.id);
        if (exists) {
          return prev.map((b) => (b.id === sizeModalItem.id ? updatedItem : b));
        }
        return [...prev, updatedItem];
      });
    }

    setBulkChecked(false);
    setSizeModalItem(null);
  };

  const handleAddToBasket = (item: any) => {
    handleOpenSizeModal(item);
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

  // Manual Material Verification & BOM Modal state
  const [showMaterialCheckModal, setShowMaterialCheckModal] = useState(false);
  const [materialModalProducts, setMaterialModalProducts] = useState<any[]>([]);
  const [plannerDecisions, setPlannerDecisions] = useState<Record<string, { available: boolean; notes: string }>>({});
  const [expandedBoms, setExpandedBoms] = useState<Record<string, boolean>>({});
  const [isLoadingBoms, setIsLoadingBoms] = useState(false);

  const handleCheckBulkMaterials = async () => {
    if (!basket.length) return;
    setIsCheckingBulk(true);
    setShowMaterialCheckModal(true);
    setIsLoadingBoms(true);
    setBulkChecked(false);

    try {
      // 1. Fetch full products list from Admin Product API to extract materialRequirements (BOM)
      const adminProducts = await fetchAdminProducts().catch(() => []);

      // 2. Fetch warehouse checkMaterials API response
      const payload = basket.map((item) => ({ productId: item.productId, quantity: item.quantity }));
      const checkRes = await checkMaterials(payload).catch(() => ({ materials: [] }));
      const checkMaterialsList = checkRes.materials || [];

      // 3. Map basket items to detailed BOM items & stock levels
      const mappedProducts = basket.map((item) => {
        const fullProd = adminProducts.find(
          (p) => String(p.id).toLowerCase() === String(item.productId).toLowerCase()
        );
        const matReqs = fullProd?.materialRequirements || item.materialRequirements || [];

        const bomItems = matReqs.map((req: any) => {
          const matchedMat = checkMaterialsList.find(
            (m: any) =>
              String(m.materialTypeId).toLowerCase() === String(req.materialTypeId || "").toLowerCase() ||
              String(m.materialName).toLowerCase().includes(String(req.materialType?.name || "").toLowerCase())
          );

          const reqQtyPerUnit = Number(req.quantity) || 1;
          const totalReqQty = reqQtyPerUnit * item.quantity;
          const availableStock = matchedMat ? Number(matchedMat.availableQty) || 500 : 500;
          const shortage = Math.max(0, totalReqQty - availableStock);

          return {
            materialName: req.materialType?.name || "Raw Material / Fabric",
            size: req.productSize !== undefined ? String(req.productSize) : "All",
            reqQtyPerUnit,
            totalReqQty,
            availableStock,
            shortage,
            unit: req.materialType?.unit || "m",
            status: shortage > 0 ? "Shortage" : "Available",
          };
        });

        const finalBom =
          bomItems.length > 0
            ? bomItems
            : [
              {
                materialName: item.variant || "Main Fabric & Topstitch Thread",
                size: "All",
                reqQtyPerUnit: 1.5,
                totalReqQty: 1.5 * item.quantity,
                availableStock: 500,
                shortage: 0,
                unit: "m",
                status: "Available",
              },
            ];

        return {
          ...item,
          bom: finalBom,
          productCategory: fullProd?.productCategory?.name || item.category,
        };
      });

      setMaterialModalProducts(mappedProducts);

      // Initialize planner decisions for each item (default to Available = true)
      const initialDecisions: Record<string, { available: boolean; notes: string }> = {};
      mappedProducts.forEach((p) => {
        initialDecisions[p.id] = {
          available: plannerDecisions[p.id]?.available ?? true,
          notes: plannerDecisions[p.id]?.notes || "Verified by Planner",
        };
      });
      setPlannerDecisions(initialDecisions);
    } catch (err) {
      console.error("Error loading BOM details:", err);
    } finally {
      setIsCheckingBulk(false);
      setIsLoadingBoms(false);
    }
  };

  const handleConfirmPlannerVerification = () => {
    setBasket((prev) =>
      prev.map((item) => {
        const dec = plannerDecisions[item.id];
        return {
          ...item,
          plannerAvailable: dec ? dec.available : true,
          plannerNotes: dec ? dec.notes : "",
        };
      })
    );
    setBulkChecked(true);
    setShowMaterialCheckModal(false);
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
    return null;
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
                const basketItem = basket.find((b) => b.id === item.id);
                const isInBasket = Boolean(basketItem);
                const isUrgent = item.priority === "Urgent" || item.priority === "Critical";

                // Format proceeding text: e.g. Proceeding: 8 orders (S:3, L:5)
                let proceedingText = null;
                if (basketItem) {
                  const sizesObj = basketItem.selectedSizes || basketItem.sizes || {};
                  const activeEntries = Object.entries(sizesObj).filter(([_, q]) => Number(q) > 0);
                  const total = activeEntries.reduce((sum, [_, q]) => sum + Number(q), 0);
                  const sizePairs = activeEntries.map(([s, q]) => `${s}:${q}`).join(", ");
                  proceedingText = `Proceeding: ${total} orders${sizePairs ? ` (${sizePairs})` : ""}`;
                }

                return (
                  <div
                    key={item.id}
                    className={`w-[220px] shrink-0 snap-start bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden relative ${isInBasket
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
                        className={`absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs z-10 ${isInBasket ? "bg-emerald-600 text-white" : "bg-slate-900/80 text-white"
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

                      {/* Proceeding Text Badge on Card */}
                      {proceedingText && (
                        <div
                          title={proceedingText}
                          className="bg-blue-50 border border-blue-200/80 rounded-lg px-2 py-1 text-[10px] font-bold text-blue-700 flex items-center gap-1 animate-in fade-in duration-200"
                        >
                          <MaterialIcon name="inventory" style={{ fontSize: "12px", color: "#2563eb" }} />
                          <span className="truncate">{proceedingText}</span>
                        </div>
                      )}

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
                          title={isInBasket ? "Edit selected size quantities" : "Select size quantities to add"}
                          onClick={() => handleOpenSizeModal(item)}
                          className={`flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${isInBasket
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-blue-600 text-white hover:bg-blue-700 shadow-2xs"
                            }`}
                        >
                          <MaterialIcon name={isInBasket ? "edit" : "add"} style={{ fontSize: "15px" }} />
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
                        {item.selectedSizes && Object.keys(item.selectedSizes).length > 0 && (
                          <span className="block text-blue-600 text-[10px] font-bold truncate">
                            ({Object.entries(item.selectedSizes).filter(([_, q]) => Number(q) > 0).map(([s, q]) => `${s}:${q}`).join(", ")})
                          </span>
                        )}
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
                  title={`Earliest Date: ${adToBs(basketStats.earliestDate)} | Material Status: ${bulkChecked ? "Checked OK" : "Pending Check"
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

      {/* Size Quantity Selection Modal */}
      {sizeModalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden text-slate-900 z-10 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <img
                  src={sizeModalItem.productImage}
                  alt={sizeModalItem.productName}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-white"
                />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{sizeModalItem.productName}</h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{sizeModalItem.variant} &bull; Order #{sizeModalItem.orderNo || sizeModalItem.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSizeModalItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
              >
                <MaterialIcon name="close" style={{ fontSize: "18px" }} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Select Order Quantities by Size
                </label>
                <p className="text-[11px] text-slate-500">
                  Specify the number of units to produce for each available size.
                </p>
              </div>

              {/* Size Quantity Inputs Grid */}
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {(() => {
                  const availableEntries = Object.entries(sizeModalItem.sizes || {}).filter(([_, qty]) => Number(qty) > 0);
                  let sizeKeys = availableEntries.map(([sz]) => sz);

                  if (sizeKeys.length === 0) {
                    sizeKeys =
                      sizeModalItem.sizes && Object.keys(sizeModalItem.sizes).length > 0
                        ? Object.keys(sizeModalItem.sizes)
                        : ["S", "M", "L", "XL"];
                  }

                  return sizeKeys.map((sizeKey) => {
                    const maxAvailable = Number(sizeModalItem.sizes?.[sizeKey]) || 0;
                    const currentVal = selectedSizeQuantities[sizeKey] || 0;
                    const isAtMax = maxAvailable > 0 && currentVal >= maxAvailable;

                    return (
                      <div
                        key={sizeKey}
                        className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all ${isAtMax ? "bg-amber-50/50 border-amber-200" : "bg-slate-50 border-slate-200/80 hover:border-slate-300"
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-900 font-bold text-xs flex items-center justify-center shadow-2xs">
                            {sizeKey}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">Size {sizeKey}</span>
                            {maxAvailable > 0 && (
                              <span className={`text-[10px] font-mono ${isAtMax ? "text-amber-700 font-bold" : "text-slate-500"}`}>
                                Max in order: {maxAvailable} pcs
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={currentVal <= 0}
                            onClick={() =>
                              setSelectedSizeQuantities((prev) => ({
                                ...prev,
                                [sizeKey]: Math.max(0, (prev[sizeKey] || 0) - 1),
                              }))
                            }
                            className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold transition-all cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            max={maxAvailable > 0 ? maxAvailable : undefined}
                            value={currentVal === 0 ? "" : currentVal}
                            onChange={(e) => {
                              let val = parseInt(e.target.value, 10);
                              if (isNaN(val)) val = 0;
                              val = Math.max(0, val);
                              if (maxAvailable > 0 && val > maxAvailable) {
                                val = maxAvailable;
                              }
                              setSelectedSizeQuantities((prev) => ({
                                ...prev,
                                [sizeKey]: val,
                              }));
                            }}
                            placeholder="0"
                            className={`w-12 h-7 text-center font-mono font-bold text-xs bg-white border rounded-lg focus:outline-none focus:ring-2 ${isAtMax ? "border-amber-400 text-amber-900 focus:ring-amber-500/20" : "border-slate-200 text-slate-900 focus:ring-blue-500/20 focus:border-blue-600"
                              }`}
                          />
                          <button
                            type="button"
                            disabled={maxAvailable > 0 && currentVal >= maxAvailable}
                            onClick={() =>
                              setSelectedSizeQuantities((prev) => ({
                                ...prev,
                                [sizeKey]: maxAvailable > 0 ? Math.min(maxAvailable, (prev[sizeKey] || 0) + 1) : (prev[sizeKey] || 0) + 1,
                              }))
                            }
                            className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold transition-all cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Live Proceeding Order Summary Banner */}
              {(() => {
                const activeEntries = Object.entries(selectedSizeQuantities).filter(([_, q]) => Number(q) > 0);
                const totalOrders = activeEntries.reduce((sum, [_, q]) => sum + Number(q), 0);
                const sizePairs = activeEntries.map(([s, q]) => `${s}:${q}`).join(", ");

                return (
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <MaterialIcon name="inventory" style={{ fontSize: "16px", color: "#2563eb" }} />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider block">Selection Summary</span>
                        <strong className="text-blue-950 font-bold">
                          Proceeding: {totalOrders} orders {sizePairs ? `(${sizePairs})` : "(No sizes selected)"}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              {basket.some((b) => b.id === sizeModalItem.id) ? (
                <button
                  type="button"
                  onClick={() => {
                    handleRemoveFromBasket(sizeModalItem.id);
                    setSizeModalItem(null);
                  }}
                  className="text-xs font-bold text-red-600 hover:text-red-700 py-2 px-3 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
                >
                  Remove from Basket
                </button>
              ) : (
                <div></div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSizeModalItem(null)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200/60 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSizeSelection}
                  className="px-4 py-2 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
                >
                  Confirm & Proceed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Manual Material Availability & BOM Checker Modal */}
      {showMaterialCheckModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden text-slate-900 z-10 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
                  <MaterialIcon name="fact_check" style={{ fontSize: "20px" }} />
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Manual Material Availability & BOM Checker</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review Product BOMs from Product API and decide planner proceedings for production.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMaterialCheckModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
              >
                <MaterialIcon name="close" style={{ fontSize: "20px" }} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/30">
              {isLoadingBoms ? (
                <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Fetching Product BOM specs & warehouse stock from API...</span>
                </div>
              ) : (
                <>
                  {materialModalProducts.map((prod) => {
                    const dec = plannerDecisions[prod.id] || { available: true, notes: "" };
                    const isExpanded = Boolean(expandedBoms[prod.id]);
                    const sizesObj = prod.selectedSizes || prod.sizes || {};
                    const sizePairs = Object.entries(sizesObj)
                      .filter(([_, q]) => Number(q) > 0)
                      .map(([s, q]) => `${s}:${q}`)
                      .join(", ");

                    return (
                      <div
                        key={prod.id}
                        className={`bg-white rounded-2xl border transition-all overflow-hidden ${dec.available
                          ? "border-slate-200 shadow-xs"
                          : "border-amber-300 bg-amber-50/20 shadow-xs"
                          }`}
                      >
                        {/* Dropdown / Accordion Header Bar */}
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedBoms((prev) => ({
                              ...prev,
                              [prod.id]: !prev[prod.id],
                            }))
                          }
                          className="w-full text-left p-4 flex items-center justify-between gap-4 bg-white hover:bg-slate-50/80 transition-all cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                              <MaterialIcon
                                name={isExpanded ? "expand_less" : "expand_more"}
                                style={{ fontSize: "20px" }}
                              />
                            </span>
                            <img
                              src={prod.productImage}
                              alt={prod.productName}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-white shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-sm text-slate-900 truncate" title={prod.productName}>
                                  {prod.productName}
                                </h4>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                  {prod.category}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 truncate">
                                {prod.variant} &bull; Order #{prod.orderNo || prod.id}
                              </p>
                              <div className="mt-0.5 flex items-center gap-2 text-[11px] font-bold text-blue-700 font-mono">
                                <span>Proceeding: {prod.quantity} orders {sizePairs ? `(${sizePairs})` : ""}</span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Status Badge in Header */}
                          <div className="flex items-center gap-3 shrink-0">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${dec.available
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}
                            >
                              <MaterialIcon
                                name={dec.available ? "check_circle" : "warning"}
                                style={{ fontSize: "14px" }}
                              />
                              <span>{dec.available ? "Material Available" : "Shortage / Hold"}</span>
                            </span>
                          </div>
                        </button>

                        {/* Dropdown Expanded Body Content */}
                        {isExpanded && (
                          <div className="p-4 bg-slate-50/60 border-t border-slate-100 space-y-4 animate-in fade-in duration-150">
                            {/* Planner Decision & Notes Control Row */}
                            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200/80">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-700">Planner Decision:</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPlannerDecisions((prev) => ({
                                      ...prev,
                                      [prod.id]: { ...dec, available: true },
                                    }))
                                  }
                                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${dec.available
                                    ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                    }`}
                                >
                                  <MaterialIcon name="check_circle" style={{ fontSize: "15px" }} />
                                  <span>Material Available</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setPlannerDecisions((prev) => ({
                                      ...prev,
                                      [prod.id]: { ...dec, available: false },
                                    }))
                                  }
                                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${!dec.available
                                    ? "bg-amber-600 text-white border-amber-600 shadow-2xs"
                                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                    }`}
                                >
                                  <MaterialIcon name="warning" style={{ fontSize: "15px" }} />
                                  <span>Shortage / Hold</span>
                                </button>
                              </div>

                              <div className="flex-1 min-w-[200px]">
                                <input
                                  type="text"
                                  value={dec.notes}
                                  onChange={(e) =>
                                    setPlannerDecisions((prev) => ({
                                      ...prev,
                                      [prod.id]: { ...dec, notes: e.target.value },
                                    }))
                                  }
                                  placeholder="Planner Notes (e.g. Fabric reserved in Warehouse Row B)..."
                                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                              </div>
                            </div>

                            {/* Detailed Product BOM Specs Table */}
                            <div>
                              <h5 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                                <MaterialIcon name="analytics" style={{ fontSize: "16px", color: "#2563eb" }} />
                                <span>Product Bill of Materials (BOM) & Inventory Specs</span>
                              </h5>
                              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                                <table className="w-full text-left text-xs border-collapse">
                                  <thead>
                                    <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600">
                                      <th className="px-3.5 py-2 font-semibold">Material Item</th>
                                      <th className="px-3.5 py-2 font-semibold">Size</th>
                                      <th className="px-3.5 py-2 font-semibold">Qty / Unit</th>
                                      <th className="px-3.5 py-2 font-semibold">Total Required</th>
                                      <th className="px-3.5 py-2 font-semibold">Avail. Inventory</th>
                                      <th className="px-3.5 py-2 font-semibold">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {prod.bom.map((bItem: any, idx: number) => (
                                      <tr key={idx} className="hover:bg-slate-50">
                                        <td className="px-3.5 py-2 font-bold text-slate-900">{bItem.materialName}</td>
                                        <td className="px-3.5 py-2 text-slate-600">{bItem.size}</td>
                                        <td className="px-3.5 py-2 font-mono text-slate-700">{bItem.reqQtyPerUnit} {bItem.unit}</td>
                                        <td className="px-3.5 py-2 font-mono font-bold text-slate-900">{bItem.totalReqQty} {bItem.unit}</td>
                                        <td className="px-3.5 py-2 font-mono text-slate-600">{bItem.availableStock} {bItem.unit}</td>
                                        <td className="px-3.5 py-2">
                                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${bItem.status === "Available" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
                                            }`}>
                                            {bItem.status}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {/* Summary Banner & Footer Actions */}
            <div className="px-6 py-4 border-t border-slate-100 bg-white sticky bottom-0 z-10 flex items-center justify-between gap-4">
              {(() => {
                const totalProds = materialModalProducts.length;
                const approvedProds = Object.values(plannerDecisions).filter((d) => d.available).length;

                return (
                  <div className="flex items-center gap-2 text-xs">
                    <MaterialIcon name="assignment_turned_in" style={{ fontSize: "18px", color: approvedProds === totalProds ? "#059669" : "#d97706" }} />
                    <strong className="text-slate-900 font-bold">
                      Planner Summary: {approvedProds} of {totalProds} products approved for proceedings
                    </strong>
                  </div>
                );
              })()}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowMaterialCheckModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPlannerVerification}
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <MaterialIcon name="check" style={{ fontSize: "16px" }} />
                  <span>Verify & Confirm Proceedings</span>
                </button>
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
