"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MaterialIcon } from "@/app/components/ui/MaterialIcon";
import { adToBs } from "@/app/components/ui/dateUtils";
import { API_MAIN_URL } from "@/app/(modules)/api/constant";
import { fetchFabrics, Fabric, resolveMediaUrl } from "../../../crm/api/catalog.api";
import { checkMaterials } from "../../api/constant";
import { draftStorageKey } from "../../api/production.helpers";
import { fetchProducts as fetchAdminProducts } from "../../../admin/api/product.api";
import { mockProductionPlans } from "../../api/production.mock";

const dispatchMockFallback = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("MockDataFallback"));
  }
};

// Default Mock Outlets list
const DEFAULT_OUTLETS = [
  {
    id: "OUT-001",
    outletCode: "OUT-NRD-01",
    outletName: "New Road Flagship Outlet",
    location: "New Road Commercial Hub, Kathmandu",
    manager: "Suman Joshi",
    phone: "+977-9841234567",
    email: "newroad.store@kaamgarments.com",
    restockPolicy: "Bi-Weekly Auto-Replenish",
    leadTimeDays: 4,
    transitWarehouse: "Central Finished Goods Warehouse",
  },
  {
    id: "OUT-002",
    outletCode: "OUT-LPR-02",
    outletName: "Lalitpur Mall Brand Store",
    location: "Pulchowk, Lalitpur (Opp. Labim Mall)",
    manager: "Pooja Shrestha",
    phone: "+977-9851098765",
    email: "lalitpur.store@kaamgarments.com",
    restockPolicy: "Weekly Stock Buffer",
    leadTimeDays: 3,
    transitWarehouse: "Central Finished Goods Warehouse",
  },
  {
    id: "OUT-003",
    outletCode: "OUT-PKR-03",
    outletName: "Pokhara Lakeside Concept Outlet",
    location: "Lakeside Street 6, Pokhara",
    manager: "Kiran Gurung",
    phone: "+977-9801234890",
    email: "pokhara.store@kaamgarments.com",
    restockPolicy: "Monthly Bulk Replenishment",
    leadTimeDays: 7,
    transitWarehouse: "Pokhara Transit Store",
  },
  {
    id: "OUT-004",
    outletCode: "OUT-BKT-04",
    outletName: "Bhaktapur Durbar Square Store",
    location: "Durbar Square Gate, Bhaktapur",
    manager: "Anil Prajapati",
    phone: "+977-9841987654",
    email: "bhaktapur.store@kaamgarments.com",
    restockPolicy: "Bi-Weekly Replenish",
    leadTimeDays: 4,
    transitWarehouse: "Central Finished Goods Warehouse",
  },
  {
    id: "OUT-005",
    outletCode: "OUT-THM-05",
    outletName: "Thamel Tourist Flagship Store",
    location: "Thamel Marg, Kathmandu",
    manager: "Bikash Maharjan",
    phone: "+977-9818765432",
    email: "thamel.store@kaamgarments.com",
    restockPolicy: "Weekly Fast-Turnover",
    leadTimeDays: 3,
    transitWarehouse: "Central Finished Goods Warehouse",
  },
];

// Default outlet demand items template per outlet
const DEFAULT_OUTLET_DEMAND_DATA: Record<string, any[]> = {
  "OUT-001": [
    {
      id: "DEM-NRD-101",
      demandNo: "DEM-NRD-101",
      productId: "PRD-001",
      productCode: "PRD-POLO-NAVY",
      productName: "Corporate Pique Polo T-Shirt",
      category: "Corporate Wear",
      variant: "Pique Knit (Navy Blue)",
      currentStock: 14,
      targetBuffer: 120,
      suggestedQty: 106,
      salesVelocity: "Fast",
      stockStatus: "Critical",
      dailySalesRate: "12 pcs/day",
      daysOfCover: "1.2 Days",
      requiredDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      productImage: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&auto=format&fit=crop&q=60",
      sizes: { XS: 12, S: 24, M: 35, L: 25, XL: 10 },
      storeInventorySizes: { XS: 2, S: 3, M: 4, L: 3, XL: 2 },
      targetBufferSizes: { XS: 14, S: 27, M: 39, L: 28, XL: 12 },
    },
    {
      id: "DEM-NRD-102",
      demandNo: "DEM-NRD-102",
      productId: "PRD-002",
      productCode: "PRD-SHT-WHT",
      productName: "Men Casual Cotton Shirt",
      category: "Retail Garment",
      variant: "Dyed Cotton (Pure White)",
      currentStock: 25,
      targetBuffer: 90,
      suggestedQty: 65,
      salesVelocity: "Fast",
      stockStatus: "Low Stock",
      dailySalesRate: "8 pcs/day",
      daysOfCover: "3.1 Days",
      requiredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      productImage: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&auto=format&fit=crop&q=60",
      sizes: { S: 15, M: 25, L: 20, XL: 5 },
      storeInventorySizes: { S: 5, M: 10, L: 8, XL: 2 },
      targetBufferSizes: { S: 20, M: 35, L: 28, XL: 7 },
    },
    {
      id: "DEM-NRD-103",
      demandNo: "DEM-NRD-103",
      productId: "PRD-003",
      productCode: "PRD-TRK-GRY",
      productName: "Winter Fleece Tracksuit Set",
      category: "Sports Uniform",
      variant: "Fleece Knit (Heather Grey)",
      currentStock: 8,
      targetBuffer: 60,
      suggestedQty: 52,
      salesVelocity: "Seasonal",
      stockStatus: "Critical",
      dailySalesRate: "6 pcs/day",
      daysOfCover: "1.3 Days",
      requiredDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      productImage: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=60",
      sizes: { S: 10, M: 20, L: 16, XL: 6 },
      storeInventorySizes: { S: 1, M: 3, L: 3, XL: 1 },
      targetBufferSizes: { S: 11, M: 23, L: 19, XL: 7 },
    },
    {
      id: "DEM-NRD-104",
      demandNo: "DEM-NRD-104",
      productId: "PRD-004",
      productCode: "PRD-CHN-BEI",
      productName: "Classic Stretch Chino Pant",
      category: "Formal & Casual",
      variant: "Dyed Cotton (Khaki Beige)",
      currentStock: 30,
      targetBuffer: 80,
      suggestedQty: 50,
      salesVelocity: "Normal",
      stockStatus: "Reorder Soon",
      dailySalesRate: "5 pcs/day",
      daysOfCover: "6.0 Days",
      requiredDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      productImage: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop&q=60",
      sizes: { S: 10, M: 18, L: 16, XL: 6 },
      storeInventorySizes: { S: 6, M: 12, L: 9, XL: 3 },
      targetBufferSizes: { S: 16, M: 30, L: 25, XL: 9 },
    },
  ],
  "OUT-002": [
    {
      id: "DEM-LPR-201",
      demandNo: "DEM-LPR-201",
      productId: "PRD-001",
      productCode: "PRD-POLO-BLK",
      productName: "Corporate Pique Polo T-Shirt",
      category: "Corporate Wear",
      variant: "Pique Knit (Midnight Black)",
      currentStock: 9,
      targetBuffer: 90,
      suggestedQty: 81,
      salesVelocity: "Fast",
      stockStatus: "Critical",
      dailySalesRate: "10 pcs/day",
      daysOfCover: "0.9 Days",
      requiredDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      productImage: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&auto=format&fit=crop&q=60",
      sizes: { XS: 8, S: 20, M: 30, L: 18, XL: 5 },
      storeInventorySizes: { XS: 1, S: 2, M: 3, L: 2, XL: 1 },
      targetBufferSizes: { XS: 9, S: 22, M: 33, L: 20, XL: 6 },
    },
    {
      id: "DEM-LPR-202",
      demandNo: "DEM-LPR-202",
      productId: "PRD-002",
      productCode: "PRD-SHT-BLU",
      productName: "Men Casual Cotton Shirt",
      category: "Retail Garment",
      variant: "Dyed Cotton (Sky Blue)",
      currentStock: 18,
      targetBuffer: 75,
      suggestedQty: 57,
      salesVelocity: "Normal",
      stockStatus: "Low Stock",
      dailySalesRate: "7 pcs/day",
      daysOfCover: "2.5 Days",
      requiredDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      productImage: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&auto=format&fit=crop&q=60",
      sizes: { S: 12, M: 22, L: 18, XL: 5 },
      storeInventorySizes: { S: 3, M: 7, L: 6, XL: 2 },
      targetBufferSizes: { S: 15, M: 29, L: 24, XL: 7 },
    },
    {
      id: "DEM-LPR-203",
      demandNo: "DEM-LPR-203",
      productId: "PRD-003",
      productCode: "PRD-TRK-NVY",
      productName: "Winter Fleece Tracksuit Set",
      category: "Sports Uniform",
      variant: "Fleece Knit (Navy)",
      currentStock: 12,
      targetBuffer: 50,
      suggestedQty: 38,
      salesVelocity: "Seasonal",
      stockStatus: "Low Stock",
      dailySalesRate: "5 pcs/day",
      daysOfCover: "2.4 Days",
      requiredDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      productImage: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=60",
      sizes: { S: 8, M: 15, L: 12, XL: 3 },
      storeInventorySizes: { S: 2, M: 5, L: 4, XL: 1 },
      targetBufferSizes: { S: 10, M: 20, L: 16, XL: 4 },
    },
  ],
  "OUT-003": [
    {
      id: "DEM-PKR-301",
      demandNo: "DEM-PKR-301",
      productId: "PRD-003",
      productCode: "PRD-WND-BLK",
      productName: "Zip-Up Softshell Windbreaker Jacket",
      category: "Outerwear",
      variant: "Midnight Black Windbreaker",
      currentStock: 6,
      targetBuffer: 70,
      suggestedQty: 64,
      salesVelocity: "Fast",
      stockStatus: "Critical",
      dailySalesRate: "9 pcs/day",
      daysOfCover: "0.7 Days",
      requiredDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      productImage: "https://images.unsplash.com/photo-1544441893-675973e31985?w=500&auto=format&fit=crop&q=60",
      sizes: { S: 12, M: 25, L: 20, XL: 7 },
      storeInventorySizes: { S: 1, M: 2, L: 2, XL: 1 },
      targetBufferSizes: { S: 13, M: 27, L: 22, XL: 8 },
    },
    {
      id: "DEM-PKR-302",
      demandNo: "DEM-PKR-302",
      productId: "PRD-001",
      productCode: "PRD-POLO-MRN",
      productName: "Corporate Pique Polo T-Shirt",
      category: "Corporate Wear",
      variant: "Pique Knit (Maroon)",
      currentStock: 15,
      targetBuffer: 80,
      suggestedQty: 65,
      salesVelocity: "Normal",
      stockStatus: "Low Stock",
      dailySalesRate: "6 pcs/day",
      daysOfCover: "2.5 Days",
      requiredDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      productImage: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&auto=format&fit=crop&q=60",
      sizes: { S: 15, M: 25, L: 20, XL: 5 },
      storeInventorySizes: { S: 3, M: 6, L: 4, XL: 2 },
      targetBufferSizes: { S: 18, M: 31, L: 24, XL: 7 },
    },
  ],
  "OUT-004": [
    {
      id: "DEM-BKT-401",
      demandNo: "DEM-BKT-401",
      productId: "PRD-002",
      productCode: "PRD-SHT-KRT",
      productName: "Traditional Cotton Kurta Shirt",
      category: "Cultural & Retail",
      variant: "Dyed Cotton (Crimson Red)",
      currentStock: 10,
      targetBuffer: 60,
      suggestedQty: 50,
      salesVelocity: "Fast",
      stockStatus: "Critical",
      dailySalesRate: "7 pcs/day",
      daysOfCover: "1.4 Days",
      requiredDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      productImage: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&auto=format&fit=crop&q=60",
      sizes: { S: 10, M: 20, L: 15, XL: 5 },
      storeInventorySizes: { S: 2, M: 4, L: 3, XL: 1 },
      targetBufferSizes: { S: 12, M: 24, L: 18, XL: 6 },
    },
  ],
  "OUT-005": [
    {
      id: "DEM-THM-501",
      demandNo: "DEM-THM-501",
      productId: "PRD-001",
      productCode: "PRD-TEE-NPL",
      productName: "Heritage Graphic Cotton T-Shirt",
      category: "Tourist & Souvenir",
      variant: "Dyed Cotton (Forest Green)",
      currentStock: 12,
      targetBuffer: 150,
      suggestedQty: 138,
      salesVelocity: "Fast",
      stockStatus: "Critical",
      dailySalesRate: "18 pcs/day",
      daysOfCover: "0.6 Days",
      requiredDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      productImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60",
      sizes: { XS: 18, S: 35, M: 45, L: 30, XL: 10 },
      storeInventorySizes: { XS: 1, S: 3, M: 4, L: 3, XL: 1 },
      targetBufferSizes: { XS: 19, S: 38, M: 49, L: 33, XL: 11 },
    },
    {
      id: "DEM-THM-502",
      demandNo: "DEM-THM-502",
      productId: "PRD-003",
      productCode: "PRD-JKT-FLC",
      productName: "Heavy Mountain Fleece Jacket",
      category: "Outerwear",
      variant: "Fleece Knit (Heather Grey)",
      currentStock: 15,
      targetBuffer: 85,
      suggestedQty: 70,
      salesVelocity: "Fast",
      stockStatus: "Low Stock",
      dailySalesRate: "10 pcs/day",
      daysOfCover: "1.5 Days",
      requiredDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      productImage: "https://images.unsplash.com/photo-1544441893-675973e31985?w=500&auto=format&fit=crop&q=60",
      sizes: { S: 15, M: 25, L: 22, XL: 8 },
      storeInventorySizes: { S: 3, M: 5, L: 5, XL: 2 },
      targetBufferSizes: { S: 18, M: 30, L: 27, XL: 10 },
    },
  ],
};

function OutletDemandContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const outletIdParam = searchParams.get("outletId");
  const selectedDemandNo = searchParams.get("demandNo");

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [liveOutlets, setLiveOutlets] = useState<any[]>(DEFAULT_OUTLETS);
  const [selectedOutletId, setSelectedOutletId] = useState<string>(
    outletIdParam || DEFAULT_OUTLETS[0].id
  );
  const [adminProducts, setAdminProducts] = useState<any[]>([]);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [existingPlans, setExistingPlans] = useState<any[]>([]);

  // Filters State
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [stockStatusFilter, setStockStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Horizontal Scroll Ref for Outlet Demand Items Carousel
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -250, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 250, behavior: "smooth" });
    }
  };

  useEffect(() => {
    setIsLoadingData(true);
    Promise.all([
      fetchAdminProducts().then(setAdminProducts).catch(() => []),
      fetchFabrics().then(setFabrics).catch(() => []),
      fetch(`${API_MAIN_URL}/production-plans`)
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then(setExistingPlans)
        .catch((err) => {
          console.error(err);
          dispatchMockFallback();
          setExistingPlans(mockProductionPlans);
        }),
    ]).finally(() => {
      setIsLoadingData(false);
    });
  }, []);

  // Update selected outlet if query param changes
  useEffect(() => {
    if (outletIdParam) {
      setSelectedOutletId(outletIdParam);
    }
  }, [outletIdParam]);

  // Retrieve current active outlet detail
  const sourceDetail = useMemo(() => {
    const targetId = String(selectedOutletId).toLowerCase();
    const found = liveOutlets.find(
      (o) =>
        String(o.id).toLowerCase() === targetId ||
        String(o.outletCode).toLowerCase() === targetId
    );
    return found || liveOutlets[0];
  }, [selectedOutletId, liveOutlets]);

  // Retrieve demand items for current selected outlet
  const catalogItems = useMemo(() => {
    const outletKey = sourceDetail.id;
    let baseItems = DEFAULT_OUTLET_DEMAND_DATA[outletKey] || DEFAULT_OUTLET_DEMAND_DATA["OUT-001"];

    // Check if any demands already exist in planned state
    const plannedDemandNos = new Set<string>();
    existingPlans.forEach((p: any) => {
      const prods = p.productionPlanProducts || p.products || [];
      prods.forEach((prod: any) => {
        if (prod.orderNo) plannedDemandNos.add(String(prod.orderNo));
      });
    });

    if (typeof window !== "undefined") {
      try {
        const drafts = JSON.parse(localStorage.getItem(draftStorageKey) || "[]");
        drafts.forEach((d: any) => {
          (d.products || []).forEach((prod: any) => {
            if (prod.orderNo) plannedDemandNos.add(String(prod.orderNo));
          });
        });
      } catch {}
    }

    let items = baseItems.map((item, idx) => {
      // Enrich with admin product images/BOM if match exists
      const matchedAdminProd = adminProducts.find(
        (p) =>
          p.sku?.toLowerCase() === item.productCode?.toLowerCase() ||
          p.name?.toLowerCase() === item.productName?.toLowerCase()
      );

      const resolvedImage = matchedAdminProd?.imagePath
        ? resolveMediaUrl(matchedAdminProd.imagePath, "product")
        : item.productImage;

      return {
        ...item,
        isPlanned: plannedDemandNos.has(item.demandNo),
        productImage: resolvedImage,
        materialRequirements: matchedAdminProd?.materialRequirements || [],
      };
    });

    // Apply Filters
    if (categoryFilter !== "All") {
      items = items.filter((i) => i.category === categoryFilter);
    }
    if (stockStatusFilter !== "All") {
      items = items.filter((i) => i.stockStatus === stockStatusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(
        (i) =>
          i.productName.toLowerCase().includes(q) ||
          i.productCode.toLowerCase().includes(q) ||
          i.variant.toLowerCase().includes(q) ||
          i.demandNo.toLowerCase().includes(q)
      );
    }

    if (selectedDemandNo) {
      items = items.filter((i) => i.demandNo === selectedDemandNo);
    }

    return items;
  }, [
    sourceDetail,
    adminProducts,
    existingPlans,
    categoryFilter,
    stockStatusFilter,
    searchQuery,
    selectedDemandNo,
  ]);

  // Categories list for filter pills
  const availableCategories = useMemo(() => {
    const outletKey = sourceDetail.id;
    const baseItems = DEFAULT_OUTLET_DEMAND_DATA[outletKey] || DEFAULT_OUTLET_DEMAND_DATA["OUT-001"];
    const cats = new Set<string>(baseItems.map((i) => i.category));
    return ["All", ...Array.from(cats)];
  }, [sourceDetail]);

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
  const [showMaterialCheckModal, setShowMaterialCheckModal] = useState(false);
  const [materialModalProducts, setMaterialModalProducts] = useState<any[]>([]);
  const [plannerDecisions, setPlannerDecisions] = useState<
    Record<string, { available: boolean; notes: string }>
  >({});
  const [isLoadingBoms, setIsLoadingBoms] = useState(false);
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
        const availableSizeKeys = ["XS", "S", "M", "L", "XL"];
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

  const handleRemoveFromBasket = (id: string | number) => {
    setBasket((prev) => prev.filter((b) => b.id !== id));
    setBulkChecked(false);
  };

  const handleClearBasket = () => {
    setBasket([]);
    setBulkChecked(false);
  };

  const basketStats = useMemo(() => {
    const totalItems = basket.length;
    const totalQty = basket.reduce((sum, item) => sum + item.quantity, 0);
    const dates = basket.map((item) => item.requiredDate || item.deliveryDate).filter(Boolean).sort();
    const earliestDate = dates[0] || "-";
    return { totalItems, totalQty, earliestDate };
  }, [basket]);

  const handleCheckBulkMaterials = async () => {
    if (!basket.length) return;
    setIsCheckingBulk(true);
    setShowMaterialCheckModal(true);
    setIsLoadingBoms(true);
    setBulkChecked(false);

    try {
      const productsPayload = basket.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
      const checkRes = await checkMaterials(productsPayload).catch(() => ({ materials: [] }));
      const checkMaterialsList = checkRes.materials || [];

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

          const reqQtyPerUnit = Number(req.quantity) || 1.6;
          const totalReqQty = reqQtyPerUnit * item.quantity;
          const availableStock = matchedMat ? Number(matchedMat.availableQty) || 450 : 450;
          const shortage = Math.max(0, totalReqQty - availableStock);

          return {
            materialName: req.materialType?.name || "Premium Store Garment Fabric",
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
                  materialName: item.variant || "Standard Dyed Cotton Fabric & Accessories",
                  size: "All",
                  reqQtyPerUnit: 1.6,
                  totalReqQty: 1.6 * item.quantity,
                  availableStock: 600,
                  shortage: 0,
                  unit: "m",
                  status: "Available",
                },
                {
                  materialName: "Polyester Sewing Thread",
                  size: "All",
                  reqQtyPerUnit: 0.2,
                  totalReqQty: 0.2 * item.quantity,
                  availableStock: 2500,
                  shortage: 0,
                  unit: "tube",
                  status: "Available",
                },
                {
                  materialName: "Outlet Brand Tag & Hangloop",
                  size: "All",
                  reqQtyPerUnit: 1,
                  totalReqQty: item.quantity,
                  availableStock: 8000,
                  shortage: 0,
                  unit: "pcs",
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

      const initialDecisions: Record<string, { available: boolean; notes: string }> = {};
      mappedProducts.forEach((p) => {
        initialDecisions[p.id] = {
          available: plannerDecisions[p.id]?.available ?? true,
          notes: plannerDecisions[p.id]?.notes || "Stock verified for outlet replenishment batch",
        };
      });
      setPlannerDecisions(initialDecisions);
    } catch (err) {
      console.error("Error loading BOM details for outlet:", err);
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
      const tempData = {
        kind: "outlet",
        sourceDetail: {
          name: sourceDetail.outletName,
          outletName: sourceDetail.outletName,
          outletCode: sourceDetail.outletCode,
          location: sourceDetail.location,
          address: sourceDetail.location,
          manager: sourceDetail.manager,
          phone: sourceDetail.phone,
          restockPolicy: sourceDetail.restockPolicy,
        },
        basket: basket.map((item) => ({
          ...item,
          orderNo: item.demandNo || `DEM-${item.id}`,
          orderId: item.demandNo || `DEM-${item.id}`,
          deliveryDate: item.requiredDate,
        })),
        selectedSourceId: sourceDetail.id,
      };
      localStorage.setItem("temp_plan_basket", JSON.stringify(tempData));
    }

    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/production/plans/CreateCustomerPlan");
    }, 600);
  };

  // Single item Measurement specs
  const itemMeasurementChart = useMemo(() => {
    if (!modalItem) return [];
    return [
      { size: "XS", chest: 34, shoulder: 15, sleeve: 22, length: 25, unit: "inch" },
      { size: "S", chest: 36, shoulder: 16, sleeve: 23, length: 26, unit: "inch" },
      { size: "M", chest: 38, shoulder: 17, sleeve: 24, length: 27, unit: "inch" },
      { size: "L", chest: 40, shoulder: 18, sleeve: 25, length: 28, unit: "inch" },
      { size: "XL", chest: 42, shoulder: 19, sleeve: 26, length: 29, unit: "inch" },
    ];
  }, [modalItem]);

  if (isLoadingData) {
    return (
      <div className="min-h-[calc(100vh-64px)] w-full max-w-7xl mx-auto p-6 flex flex-col justify-center items-center">
        <div className="text-center p-12 bg-white rounded-2xl border border-slate-200 shadow-xs max-w-md mx-auto">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-base">Loading Outlet Demand Workspace...</h4>
          <p className="text-xs text-slate-500 mt-1">Retrieving store inventory depletion and replenishment matrices.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] w-full max-w-7xl mx-auto p-6 flex flex-col gap-6 text-slate-900 bg-slate-50 font-sans">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:px-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Retail Store Replenishment
            </span>
            <span className="text-xs text-slate-400 font-mono">Demand Source: Outlet</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Create Outlet Replenishment Plan
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Configure garment size matrices, store buffer replenishment, and bulk fabric checking for {sourceDetail.outletName}.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Outlet Quick Switcher */}
          <div className="relative inline-block">
            <select
              value={selectedOutletId}
              onChange={(e) => {
                setSelectedOutletId(e.target.value);
                router.replace(`/production/demands/outlet?outletId=${e.target.value}`);
              }}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-white text-slate-800 border border-slate-300 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs cursor-pointer pr-8"
            >
              {liveOutlets.map((outlet) => (
                <option key={outlet.id} value={outlet.id}>
                  {outlet.outletName} ({outlet.outletCode})
                </option>
              ))}
            </select>
          </div>

          <Link
            href="/production/demands/catalog/outlet"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-all shadow-xs"
          >
            <MaterialIcon name="storefront" style={{ fontSize: "16px" }} />
            <span>Outlet Catalog</span>
          </Link>

          <Link
            href="/production/demands"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-all shadow-xs"
          >
            <span>Change Demand Stream</span>
          </Link>

          <Link
            href="/production/plans"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm shadow-emerald-500/20"
          >
            <MaterialIcon name="format_list_bulleted" style={{ fontSize: "16px" }} />
            <span>All Plans</span>
          </Link>
        </div>
      </div>

      {/* Selected Outlet & Store Inventory Summary Card */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 shadow-2xs">
            <MaterialIcon name="store" style={{ fontSize: "26px" }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Retail Outlet Branch
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-bold border border-slate-200">
                {sourceDetail.outletCode}
              </span>
            </div>
            <strong className="text-slate-900 text-base font-bold block mt-0.5">
              {sourceDetail.outletName}
            </strong>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-5 md:gap-6 text-xs border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Location / Branch
            </span>
            <strong className="text-slate-900 font-medium">{sourceDetail.location}</strong>
          </div>

          <div>
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Store Manager
            </span>
            <strong className="text-slate-900 font-medium">{sourceDetail.manager} ({sourceDetail.phone})</strong>
          </div>

          <div>
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Restock Schedule
            </span>
            <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200">
              {sourceDetail.restockPolicy}
            </span>
          </div>

          <div>
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Transit Dispatch Warehouse
            </span>
            <strong className="text-slate-900 font-medium">{sourceDetail.transitWarehouse}</strong>
          </div>

          <div>
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Open Demand Items
            </span>
            <strong className="text-emerald-700 font-bold text-sm">
              {catalogItems.length} SKUs Awaiting
            </strong>
          </div>
        </div>
      </section>

      {/* Hero Demand Header & Summary Stats */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
            Store Restock Queue
          </span>
          <h2 className="text-xl font-bold text-slate-900">
            Outlet Replenishment Demand Catalog
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Select items to allocate production quantities. Check warehouse raw material stock in bulk before finalizing.
          </p>
        </div>

        <div className="flex flex-wrap gap-5 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              Selected in Basket
            </span>
            <strong className="text-lg font-bold text-slate-900">{basketStats.totalItems} items</strong>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              Total Replenish Qty
            </span>
            <strong className="text-lg font-bold text-emerald-700">
              {basketStats.totalQty.toLocaleString()} pcs
            </strong>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              Target Completion (BS)
            </span>
            <strong className="text-lg font-bold text-slate-900">
              {basketStats.earliestDate !== "-" ? adToBs(basketStats.earliestDate) : "—"}
            </strong>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
            <MaterialIcon name="filter_list" style={{ fontSize: "16px" }} />
            Category:
          </span>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                categoryFilter === cat
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="All">All Stock Statuses</option>
            <option value="Critical">Critical Stockout</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Reorder Soon">Reorder Soon</option>
          </select>

          <div className="relative">
            <input
              type="text"
              placeholder="Search SKU, product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 sm:w-60 pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 flex items-center">
              <MaterialIcon name="search" style={{ fontSize: "16px" }} />
            </span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Split Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* Outlet Demands Carousel & Grid Section */}
        <main className="flex flex-col gap-4 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Outlet Replenishment Queue</span>
                <span className="text-xs font-mono font-normal text-slate-500">
                  ({catalogItems.length} active demand items)
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Click &quot;Configure Sizes &amp; Add&quot; to review store stock gap and allocate production units
              </p>
            </div>

            {/* Scroll Navigation Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={scrollLeft}
                title="Scroll Left"
                className="w-8 h-8 rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-center shadow-2xs transition-all cursor-pointer"
              >
                <MaterialIcon name="chevron_left" style={{ fontSize: "18px" }} />
              </button>
              <button
                type="button"
                onClick={scrollRight}
                title="Scroll Right"
                className="w-8 h-8 rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-center shadow-2xs transition-all cursor-pointer"
              >
                <MaterialIcon name="chevron_right" style={{ fontSize: "18px" }} />
              </button>
            </div>
          </div>

          {/* Horizontal Scrolling Carousel Container */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth snap-x snap-mandatory min-w-0"
            style={{ scrollbarWidth: "thin" }}
          >
            {catalogItems.length > 0 ? (
              catalogItems.map((item: any) => {
                const basketItem = basket.find((b) => b.id === item.id);
                const isInBasket = Boolean(basketItem);
                const isCritical = item.stockStatus === "Critical";
                const isLowStock = item.stockStatus === "Low Stock";

                // Format proceeding text: e.g. Proceeding: 60 pcs (S:15, M:25, L:20)
                let proceedingText = null;
                if (basketItem) {
                  const sizesObj = basketItem.selectedSizes || basketItem.sizes || {};
                  const activeEntries = Object.entries(sizesObj).filter(([_, q]) => Number(q) > 0);
                  const total = activeEntries.reduce((sum, [_, q]) => sum + Number(q), 0);
                  const sizePairs = activeEntries.map(([s, q]) => `${s}:${q}`).join(", ");
                  proceedingText = `Basket: ${total} pcs${sizePairs ? ` (${sizePairs})` : ""}`;
                }

                return (
                  <div
                    key={item.id}
                    className={`w-[240px] shrink-0 snap-start bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden relative ${
                      isInBasket
                        ? "border-emerald-600 bg-emerald-50/20 shadow-md ring-2 ring-emerald-500/20"
                        : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                    }`}
                  >
                    {/* Image & Status Badges */}
                    <div className="relative w-full h-36 bg-slate-100 overflow-hidden">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className={`w-full h-full object-cover ${isInBasket ? "brightness-95" : ""}`}
                      />

                      {/* Added Status Chip */}
                      <span
                        title={isInBasket ? "Item Added to Planning Basket" : "Available in Outlet Queue"}
                        className={`absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs z-10 shadow-2xs ${
                          isInBasket ? "bg-emerald-600 text-white" : "bg-slate-900/80 text-white"
                        }`}
                      >
                        {isInBasket ? "In Basket" : "Demand Open"}
                      </span>

                      {/* Stock Alert Badge */}
                      <span
                        className={`absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-md shadow-2xs z-10 ${
                          isCritical
                            ? "bg-red-600 text-white"
                            : isLowStock
                            ? "bg-amber-500 text-white"
                            : "bg-blue-600 text-white"
                        }`}
                      >
                        {item.stockStatus}
                      </span>

                      {/* Demand Reference Bar at bottom of image */}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/80 to-transparent p-2 text-white flex items-center justify-between text-[10px] font-mono">
                        <span>{item.demandNo}</span>
                        <span>{item.salesVelocity} Velocity</span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-3 flex flex-col gap-2 flex-1 justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 line-clamp-1" title={item.productName}>
                          {item.productName}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{item.variant}</p>
                      </div>

                      {/* Store Stock Gap Metrics */}
                      <div className="bg-slate-50 rounded-xl p-2 border border-slate-100 flex flex-col gap-1.5 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Store On-Hand:</span>
                          <strong className="text-slate-700 font-mono">{item.currentStock} pcs</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Target Min Buffer:</span>
                          <strong className="text-slate-700 font-mono">{item.targetBuffer} pcs</strong>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-200/80 pt-1 font-bold">
                          <span className="text-emerald-800">Suggested Gap:</span>
                          <span className="font-mono text-emerald-700 text-xs font-extrabold">
                            +{item.suggestedQty} pcs
                          </span>
                        </div>
                      </div>

                      {/* Target Required Date */}
                      <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500 border-t border-slate-100">
                        <span className="flex items-center gap-1 font-mono">
                          <MaterialIcon name="speed" style={{ fontSize: "14px", color: "#64748b" }} />
                          {item.dailySalesRate}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[10px]">
                          <MaterialIcon name="event" style={{ fontSize: "13px", color: "#94a3b8" }} />
                          {adToBs(item.requiredDate)}
                        </span>
                      </div>

                      {/* Proceeding Text Badge on Card */}
                      {proceedingText && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1 text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                          <MaterialIcon name="check_circle" style={{ fontSize: "12px", color: "#059669" }} />
                          <span className="truncate">{proceedingText}</span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          title="View Specs & BOM"
                          onClick={() => setModalItem(item)}
                          className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                        >
                          <MaterialIcon name="info" style={{ fontSize: "15px" }} />
                          <span>Specs</span>
                        </button>

                        <button
                          type="button"
                          title={isInBasket ? "Edit size matrix" : "Allocate sizes & add to basket"}
                          onClick={() => handleOpenSizeModal(item)}
                          className={`flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isInBasket
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200"
                              : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs"
                          }`}
                        >
                          <MaterialIcon name={isInBasket ? "tune" : "add"} style={{ fontSize: "15px" }} />
                          <span>{isInBasket ? "Edit" : "Add"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="w-full py-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                <MaterialIcon name="inventory_2" style={{ fontSize: "32px", color: "#cbd5e1" }} />
                <p className="mt-2 mb-0 font-medium">No open replenishment items match the selected filter.</p>
              </div>
            )}
          </div>

          {/* Detailed Outlet Store Inventory Table View */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs mt-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <MaterialIcon name="table_chart" style={{ fontSize: "18px", color: "#059669" }} />
                <span>Store SKU Inventory &amp; Replenishment Breakdown</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {sourceDetail.outletName}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-mono text-[11px] bg-slate-50/60 uppercase">
                    <th className="py-2.5 px-3">Item / SKU</th>
                    <th className="py-2.5 px-3">Variant / Color</th>
                    <th className="py-2.5 px-3 text-center">Store Stock</th>
                    <th className="py-2.5 px-3 text-center">Target Buffer</th>
                    <th className="py-2.5 px-3 text-center">Suggested Gap</th>
                    <th className="py-2.5 px-3 text-center">Days Cover</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-end">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {catalogItems.map((item: any) => {
                    const inBasket = basket.some((b) => b.id === item.id);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          <div className="flex items-center gap-2">
                            <img
                              src={item.productImage}
                              alt=""
                              className="w-7 h-7 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <span>{item.productName}</span>
                              <span className="block text-[10px] text-slate-400 font-mono">{item.productCode}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{item.variant}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-medium">{item.currentStock} pcs</td>
                        <td className="py-2.5 px-3 text-center font-mono font-medium">{item.targetBuffer} pcs</td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">
                          +{item.suggestedQty} pcs
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-500">{item.daysOfCover}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.stockStatus === "Critical"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : item.stockStatus === "Low Stock"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {item.stockStatus}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-end">
                          <button
                            type="button"
                            onClick={() => handleOpenSizeModal(item)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              inBasket
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                : "bg-emerald-600 text-white hover:bg-emerald-700"
                            }`}
                          >
                            {inBasket ? "Configured" : "Select"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Sticky Plan Basket Panel */}
        <aside className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col gap-3 sticky top-6 transition-all">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                <MaterialIcon name="shopping_basket" style={{ fontSize: "16px" }} />
              </span>
              <div>
                <h3 className="font-bold text-sm text-slate-900 leading-tight">Plan Basket</h3>
                <span className="text-[10px] text-slate-500 font-mono">
                  {basketStats.totalItems} SKUs ({basketStats.totalQty.toLocaleString()} pcs)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {basket.length > 0 && !isBasketMinimized && (
                <button
                  type="button"
                  onClick={handleClearBasket}
                  className="text-[11px] text-red-600 hover:underline px-1.5 py-0.5 font-semibold cursor-pointer"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsBasketMinimized((prev) => !prev)}
                className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                title={isBasketMinimized ? "Expand Basket" : "Minimize Basket"}
              >
                <MaterialIcon
                  name={isBasketMinimized ? "expand_more" : "expand_less"}
                  style={{ fontSize: "18px" }}
                />
              </button>
            </div>
          </div>

          {!isBasketMinimized && (
            <div className="flex flex-col gap-3">
              {/* Basket Items List */}
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                {basket.length ? (
                  basket.map((item) => {
                    const activeSizes = Object.entries(item.selectedSizes || item.sizes || {}).filter(
                      ([_, q]) => Number(q) > 0
                    );

                    return (
                      <div
                        key={item.id}
                        className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/70 flex flex-col gap-1.5 relative group"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={item.productImage}
                              alt=""
                              className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <h5 className="font-bold text-xs text-slate-900 truncate">
                                {item.productName}
                              </h5>
                              <span className="text-[10px] text-slate-400 font-mono block truncate">
                                {item.variant}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="font-mono font-bold text-xs text-emerald-700">
                              {item.quantity} pcs
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFromBasket(item.id)}
                              className="text-slate-400 hover:text-red-600 p-0.5 rounded cursor-pointer"
                              title="Remove item"
                            >
                              <MaterialIcon name="close" style={{ fontSize: "14px" }} />
                            </button>
                          </div>
                        </div>

                        {/* Size Tags */}
                        {activeSizes.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-200/50">
                            {activeSizes.map(([sz, qty]) => (
                              <span
                                key={sz}
                                className="px-1.5 py-0.5 rounded bg-white text-[10px] font-mono font-bold text-slate-700 border border-slate-200"
                              >
                                {sz}: {qty}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                    <MaterialIcon name="shopping_basket" style={{ fontSize: "24px", color: "#cbd5e1" }} />
                    <p className="mt-1 mb-0">Planning basket is empty</p>
                    <span className="text-[10px] text-slate-400">Select items from the queue</span>
                  </div>
                )}
              </div>

              {/* Basket Summary Stats */}
              {basket.length > 0 && (
                <div className="bg-emerald-50/60 rounded-xl p-2.5 border border-emerald-100 flex flex-col gap-1 text-xs">
                  <div className="flex items-center justify-between text-emerald-900">
                    <span>Total Replenish Units:</span>
                    <strong className="font-mono font-bold text-sm text-emerald-800">
                      {basketStats.totalQty.toLocaleString()} pcs
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 text-[11px]">
                    <span>Target Delivery Date:</span>
                    <span className="font-mono">{adToBs(basketStats.earliestDate)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 text-[11px]">
                    <span>Dispatch Location:</span>
                    <span className="font-medium truncate max-w-[150px]">{sourceDetail.transitWarehouse}</span>
                  </div>
                </div>
              )}

              {/* Material Stock Check Button */}
              {basket.length > 0 && (
                <button
                  type="button"
                  onClick={handleCheckBulkMaterials}
                  disabled={isCheckingBulk}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    bulkChecked
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-slate-800 hover:bg-slate-900 text-white shadow-2xs"
                  }`}
                >
                  <MaterialIcon
                    name={bulkChecked ? "check_circle" : "inventory"}
                    style={{ fontSize: "16px", color: bulkChecked ? "#047857" : "#fff" }}
                  />
                  <span>
                    {isCheckingBulk
                      ? "Checking Warehouse BOM..."
                      : bulkChecked
                      ? "BOM Stock Verified"
                      : "Verify Material Stock"}
                  </span>
                </button>
              )}

              {/* Create Plan Button */}
              <button
                type="button"
                onClick={handleCreatePlan}
                disabled={!basket.length || isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white shadow-sm shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MaterialIcon name="precision_manufacturing" style={{ fontSize: "16px" }} />
                <span>{isSubmitting ? "Generating Plan..." : "Configure Plan & Stages"}</span>
              </button>
            </div>
          )}
        </aside>
      </div>

      {/* ================= SIZE CONFIGURATION MODAL ================= */}
      {sizeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <img
                  src={sizeModalItem.productImage}
                  alt=""
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{sizeModalItem.productName}</h3>
                  <span className="text-xs text-slate-500 font-mono">
                    {sizeModalItem.variant} | {sourceDetail.outletName}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSizeModalItem(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <MaterialIcon name="close" style={{ fontSize: "18px" }} />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between text-xs bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Suggested Gap</span>
                  <strong className="text-emerald-800 font-mono text-sm">+{sizeModalItem.suggestedQty} pcs</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Store Stock</span>
                  <strong className="text-slate-700 font-mono text-sm">{sizeModalItem.currentStock} pcs</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Min Buffer</span>
                  <strong className="text-slate-700 font-mono text-sm">{sizeModalItem.targetBuffer} pcs</strong>
                </div>
              </div>

              {/* Size Input Matrix */}
              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Allocate Units by Garment Size:
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {["XS", "S", "M", "L", "XL", "XXL"].map((sz) => {
                    const suggestedForSize = sizeModalItem.sizes?.[sz] || 0;
                    const storeInv = sizeModalItem.storeInventorySizes?.[sz] || 0;
                    const val = selectedSizeQuantities[sz] ?? suggestedForSize;

                    return (
                      <div
                        key={sz}
                        className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 flex flex-col gap-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-800 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                            {sz}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Stock: {storeInv}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 mt-1">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedSizeQuantities((prev) => ({
                                ...prev,
                                [sz]: Math.max(0, (prev[sz] ?? suggestedForSize) - 5),
                              }))
                            }
                            className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={val}
                            onChange={(e) =>
                              setSelectedSizeQuantities((prev) => ({
                                ...prev,
                                [sz]: Math.max(0, parseInt(e.target.value, 10) || 0),
                              }))
                            }
                            className="w-full text-center font-mono font-bold text-xs py-1 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedSizeQuantities((prev) => ({
                                ...prev,
                                [sz]: (prev[sz] ?? suggestedForSize) + 5,
                              }))
                            }
                            className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total Summary */}
              <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl text-xs font-bold">
                <span className="text-slate-600">Total Allocated Quantity:</span>
                <span className="font-mono text-emerald-800 text-sm font-extrabold">
                  {Object.values(selectedSizeQuantities).reduce((a, b) => a + (Number(b) || 0), 0)} pcs
                </span>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSizeModalItem(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSizeSelection}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
              >
                Confirm Allocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= BULK MATERIAL STOCK VERIFICATION MODAL ================= */}
      {showMaterialCheckModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <MaterialIcon name="inventory" style={{ fontSize: "20px", color: "#059669" }} />
                  <span>Warehouse Material Verification &amp; BOM Check</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm fabric and trims availability before scheduling production lines
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMaterialCheckModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <MaterialIcon name="close" style={{ fontSize: "18px" }} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex flex-col gap-4">
              {isLoadingBoms ? (
                <div className="text-center py-10">
                  <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span className="text-xs text-slate-500">Checking raw material stock in warehouse...</span>
                </div>
              ) : (
                materialModalProducts.map((prod) => (
                  <div key={prod.id} className="border border-slate-200 rounded-2xl p-4 bg-white flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={prod.productImage}
                          alt=""
                          className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                        />
                        <div>
                          <strong className="text-xs text-slate-900 block">{prod.productName}</strong>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Plan Qty: {prod.quantity} pcs | {prod.variant}
                          </span>
                        </div>
                      </div>

                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={plannerDecisions[prod.id]?.available ?? true}
                          onChange={(e) =>
                            setPlannerDecisions((prev) => ({
                              ...prev,
                              [prod.id]: {
                                available: e.target.checked,
                                notes: prev[prod.id]?.notes || "",
                              },
                            }))
                          }
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>Material Verified</span>
                      </label>
                    </div>

                    {/* BOM Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase font-mono">
                            <th className="py-1.5 px-2">Material / Trim</th>
                            <th className="py-1.5 px-2 text-center">Req / Unit</th>
                            <th className="py-1.5 px-2 text-center">Total Req</th>
                            <th className="py-1.5 px-2 text-center">Warehouse Stock</th>
                            <th className="py-1.5 px-2 text-end">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 font-mono text-[11px]">
                          {prod.bom.map((bItem: any, idx: number) => (
                            <tr key={idx}>
                              <td className="py-1.5 px-2 text-slate-800">{bItem.materialName}</td>
                              <td className="py-1.5 px-2 text-center text-slate-500">
                                {bItem.reqQtyPerUnit} {bItem.unit}
                              </td>
                              <td className="py-1.5 px-2 text-center font-bold text-slate-800">
                                {bItem.totalReqQty.toFixed(1)} {bItem.unit}
                              </td>
                              <td className="py-1.5 px-2 text-center text-slate-600">
                                {bItem.availableStock} {bItem.unit}
                              </td>
                              <td className="py-1.5 px-2 text-end">
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  {bItem.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowMaterialCheckModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleConfirmPlannerVerification}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
              >
                Confirm &amp; Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PRODUCT SPECS / MEASUREMENT MODAL ================= */}
      {modalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-xl w-full overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <img
                  src={modalItem.productImage}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{modalItem.productName}</h3>
                  <span className="text-xs text-slate-500 font-mono">
                    {modalItem.productCode} | {modalItem.category}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalItem(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <MaterialIcon name="close" style={{ fontSize: "18px" }} />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              {/* Garment Technical Specs */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Garment Measurement Specifications (Inches):
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-center border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-mono text-[10px] uppercase">
                        <th className="py-2 px-2">Size</th>
                        <th className="py-2 px-2">Chest</th>
                        <th className="py-2 px-2">Shoulder</th>
                        <th className="py-2 px-2">Sleeve</th>
                        <th className="py-2 px-2">Length</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {itemMeasurementChart.map((spec) => (
                        <tr key={spec.size}>
                          <td className="py-2 px-2 font-bold text-slate-800">{spec.size}</td>
                          <td className="py-2 px-2 text-slate-600">{spec.chest}&quot;</td>
                          <td className="py-2 px-2 text-slate-600">{spec.shoulder}&quot;</td>
                          <td className="py-2 px-2 text-slate-600">{spec.sleeve}&quot;</td>
                          <td className="py-2 px-2 text-slate-600">{spec.length}&quot;</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Outlet Restock Analytics */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Current Store Stock</span>
                  <strong className="text-slate-800 font-mono text-sm">{modalItem.currentStock} pcs</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Target Buffer Level</span>
                  <strong className="text-slate-800 font-mono text-sm">{modalItem.targetBuffer} pcs</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Sales Velocity</span>
                  <strong className="text-emerald-700 font-mono">{modalItem.salesVelocity} ({modalItem.dailySalesRate})</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Target Required Date</span>
                  <strong className="text-slate-800 font-mono">{adToBs(modalItem.requiredDate)}</strong>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setModalItem(null)}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-800 text-white hover:bg-slate-900 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OutletDemandPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-64px)] w-full max-w-7xl mx-auto p-6 text-center text-slate-500">
          Loading outlet demand workspace...
        </div>
      }
    >
      <OutletDemandContent />
    </Suspense>
  );
}
