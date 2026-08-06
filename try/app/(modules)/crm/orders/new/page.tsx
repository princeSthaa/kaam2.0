"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ActionButton } from "@/app/components/ui/ActionButton";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { fetchCustomers } from "../../api/customer.api";
import { Customer } from "../../dto/customer.dto";
import { createOrder } from "../../api/order.api";
import { fetchProducts, fetchFabrics, resolveMediaUrl, Product, Fabric } from "../../api/catalog.api";
import { NepaliDatePicker } from "@/app/components/ui/NepaliDatePicker";
import { bsToAd } from "@/app/components/ui/dateUtils";

type StepControlProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
};

function StepButton({ children, onClick, type = "button", className = "btn btn-primary", disabled }: StepControlProps) {
  return (
    <button type={type} className={className} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function WizardIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="step-indicator">
      <div className={`step-bullet ${currentStep >= 1 ? "active" : ""}`}>1. Customer</div>
      <div className={`step-bullet ${currentStep >= 2 ? "active" : ""}`}>2. Products</div>
      <div className={`step-bullet ${currentStep >= 3 ? "active" : ""}`}>3. Materials & Sizes</div>
      <div className={`step-bullet ${currentStep >= 4 ? "active" : ""}`}>4. Delivery</div>
    </div>
  );
}

function WizardStep({
  stepNumber,
  currentStep,
  title,
  children,
}: {
  stepNumber: number;
  currentStep: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`wizard-step ${currentStep === stepNumber ? "active" : ""}`}>
      <h3 className="order-step-title">{title}</h3>
      {children}
    </div>
  );
}

function CreateOrderStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          .wizard-step { display: none; }
          .wizard-step.active { display: block; animation: fadeIn 0.3s ease-in-out; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
          .pp-card { overflow: visible !important; }
          .order-card-body { padding: 20px; }
          .step-indicator { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .step-bullet { flex: 1; text-align: center; padding: 10px; border-bottom: 2px solid #ccc; font-weight: bold; color: #aaa; transition: 0.3s; }
          .step-bullet.active { border-bottom-color: #4CAF50; color: #4CAF50; }
          .order-step-title { margin-bottom: 15px; }
          .product-row { display: flex; align-items: center; border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; border-radius: 6px; background: #fff; gap: 15px; }
          .fabric-row { display: flex; align-items: center; gap: 15px; margin-top: 15px; padding: 10px; background: #fdfdfd; border: 1px dashed #ccc; border-radius: 6px; flex-wrap: wrap; }
          .fabric-sample { width: 40px; height: 40px; border-radius: 4px; border: 1px solid #ccc; object-fit: cover; background: #fff; }
          .size-table-container { margin-top: 10px; overflow-x: auto; width: 100%; }
          .size-table { width: 100%; text-align: center; border-collapse: collapse; }
          .size-table th, .size-table td { border: 1px solid #eee; padding: 8px; min-width: 60px; }
          .size-table th { background: #f9f9f9; }
          .size-input { width: 60px; text-align: center; margin: 0 auto; }
          .rate-row { color: #555; font-size: 0.9em; background: #fcfcfc; }
          .product-config-block { background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .delivery-date-row { display: flex; gap: 10px; margin-top: 5px; align-items: center; }
          .central-material-calc { padding: 15px; background: #eef7f2; border-radius: 8px; border-left: 4px solid #4CAF50; margin-top: 20px; }
          .fabric-item { cursor: pointer; border: 1px solid #e0e0e0; border-radius: 12px; padding: 10px; text-align: center; transition: 0.2s; }
          .fabric-item:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1); }
          .fabric-item img { width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 10px; }
          .dropdown-menu.show { display: block !important; }
          .fabric-modal-body { max-height: 500px; overflow-y: auto; }
          .delivery-type-panel { background: #fdfdfd; border: 1px solid #eee; padding: 15px; border-radius: 8px; }
          
          /* Custom Searchable Dropdown Styling */
          .searchable-select { position: relative; width: 100%; }
          .searchable-select-btn { width: 100%; display: flex; align-items: center; justify-content: space-between; text-align: left; padding: 10px 14px; background: #fff; border: 1px solid #ced4da; border-radius: 8px; cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s; font-size: 0.95rem; }
          .searchable-select-btn:focus, .searchable-select-btn:hover { border-color: #0f172a; outline: none; }
          .searchable-select-menu { position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 1050; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05); overflow: hidden; }
          .searchable-select-search-box { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; background: #f8fafc; }
          .searchable-select-search-input { width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.85rem; outline: none; background: #fff; }
          .searchable-select-search-input:focus { border-color: #0f172a; box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.1); }
          .searchable-select-list { max-height: 220px; overflow-y: auto; }
          .searchable-select-item { display: flex; align-items: center; gap: 12px; width: 100%; padding: 10px 14px; border: none; background: transparent; text-align: left; cursor: pointer; font-size: 0.9rem; color: #1e293b; transition: background-color 0.15s; border-bottom: 1px solid #f8fafc; }
          .searchable-select-item:last-child { border-bottom: none; }
          .searchable-select-item:hover { background-color: #f1f5f9; }
          .searchable-select-item.selected { background-color: #f0fdf4; font-weight: 600; color: #166534; }
          .searchable-select-no-results { padding: 16px; text-align: center; color: #94a3b8; font-size: 0.85rem; }

          .fabric-cat-col:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
          @media (max-width: 700px) {
            .step-indicator { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
            .product-row, .delivery-date-row { align-items: stretch; flex-direction: column; }
          }
        `,
      }}
    />
  );
}

interface SearchableOption {
  value: string;
  label: string;
  sublabel?: string;
  image?: string;
}

function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "-- Select --",
  searchPlaceholder = "Search...",
}: {
  options: SearchableOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredOptions = options.filter((o) => {
    const term = searchTerm.toLowerCase();
    const matchesLabel = o.label.toLowerCase().includes(term);
    const matchesSublabel = o.sublabel ? o.sublabel.toLowerCase().includes(term) : false;
    return matchesLabel || matchesSublabel;
  });

  return (
    <div className="searchable-select" ref={containerRef}>
      <button
        type="button"
        className="searchable-select-btn"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setSearchTerm("");
        }}
      >
        {selectedOption ? (
          <div className="d-flex align-items-center gap-2 overflow-hidden">
            {selectedOption.image && (
              <img
                src={selectedOption.image}
                alt={selectedOption.label}
                style={{ width: "32px", height: "32px", objectFit: "cover", borderRadius: "6px", flexShrink: 0 }}
              />
            )}
            <div className="text-truncate">
              <span className="fw-bold">{selectedOption.label}</span>
              {selectedOption.sublabel && (
                <span className="text-muted ms-2 small">({selectedOption.sublabel})</span>
              )}
            </div>
          </div>
        ) : (
          <span className="text-muted">{placeholder}</span>
        )}
        <span className="text-muted ms-2">&#9662;</span>
      </button>

      {isOpen && (
        <div className="searchable-select-menu">
          <div className="searchable-select-search-box">
            <input
              type="text"
              className="searchable-select-search-input"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <div className="searchable-select-list">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`searchable-select-item ${option.value === value ? "selected" : ""}`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  {option.image && (
                    <img
                      src={option.image}
                      alt={option.label}
                      style={{ width: "36px", height: "36px", objectFit: "cover", borderRadius: "6px", flexShrink: 0 }}
                    />
                  )}
                  <div className="d-flex flex-column text-truncate">
                    <span className="fw-semibold">{option.label}</span>
                    {option.sublabel && <small className="text-muted">{option.sublabel}</small>}
                  </div>
                </button>
              ))
            ) : (
              <div className="searchable-select-no-results">No matching results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ProductSelect({ value, onChange, products }: { value: string; onChange: (val: string) => void; products: any[] }) {
  const options: SearchableOption[] = products.map((p) => ({
    value: p.productId || p.id,
    label: p.name || "Product",
    image: p.imagePath,
  }));

  return (
    <SearchableSelect
      options={options}
      value={value}
      onChange={onChange}
      placeholder="-- Select Product --"
      searchPlaceholder="Search product by name..."
    />
  );
}

function FabricModalReact({ isOpen, onClose, onSelect, fabrics }: { isOpen: boolean; onClose: () => void; onSelect: (fabricId: string) => void; fabrics: Fabric[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setSelectedCategory(null);
      setSearch("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getCat = (f: Fabric) => f.category || (f as any).materialCategoryName || (f as any).type || "General";
  const categories = Array.from(new Set(fabrics.map(getCat)));

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div className="modal fade show" style={{ display: "block" }} tabIndex={-1} aria-modal="true" role="dialog">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{selectedCategory ? `Select Fabric - ${selectedCategory}` : "Select Fabric Category"}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body fabric-modal-body" style={{ maxHeight: "500px", overflowY: "auto" }}>
              {!selectedCategory ? (
                <>
                  <input type="text" className="form-control mb-3" placeholder="Search categories..." value={search} onChange={(e) => setSearch(e.target.value)} />
                  <div className="row">
                    {categories.filter((c) => c.toLowerCase().includes(search.toLowerCase())).map((cat) => {
                      const catFabrics = fabrics.filter((f) => getCat(f) === cat);
                      return (
                        <div key={cat} className="col-md-4 col-sm-6 mb-4">
                          <div className="border rounded fabric-cat-col text-center bg-white shadow-sm" style={{ cursor: "pointer", transition: "transform 0.2s", overflow: "hidden" }} onClick={() => { setSelectedCategory(cat); setSearch(""); }}>
                            <div className="d-flex" style={{ width: "100%", background: "#eee" }}>
                              {catFabrics.slice(0, 4).map((f) => (
                                <img key={f.id} src={resolveMediaUrl(f.imagePath, "fabric")} alt={f.name} style={{ flex: 1, height: "100px", objectFit: "cover", minWidth: 0 }} />
                              ))}
                            </div>
                            <div className="p-3 border-top">
                              <strong style={{ fontSize: "1.1em", color: "#333" }}>{cat}</strong>
                              <br />
                              <small className="text-muted">{catFabrics.length} fabric options</small>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  <div className="d-flex mb-3 gap-2 align-items-center">
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedCategory(null)}>
                      &larr; Back
                    </button>
                    <input type="text" className="form-control" placeholder="Search fabrics..." value={search} onChange={(e) => setSearch(e.target.value)} />
                  </div>
                  <div className="row">
                    {fabrics
                      .filter((f) => getCat(f) === selectedCategory)
                      .filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
                      .map((f) => (
                        <div key={f.id} className="col-md-4 col-sm-6 mb-3">
                          <div
                            className="fabric-item bg-white shadow-sm"
                            onClick={() => {
                              onSelect(f.id);
                              onClose();
                            }}
                          >
                            <img src={resolveMediaUrl(f.imagePath, "fabric")} alt={f.name} />
                            <strong>{f.name}</strong>
                            <br />
                            <small className="text-muted">{f.id}</small>
                          </div>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function CrmCreateOrderPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // ================= State Management for Order Details =================
  const [customerId, setCustomerId] = useState<string>("");
  const [deliveryType, setDeliveryType] = useState("Single");
  const [globalDeliveryDate, setGlobalDeliveryDate] = useState("");
  const [globalDeliveryNote, setGlobalDeliveryNote] = useState("");
  const [remarks, setRemarks] = useState("");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [productsData, setProductsData] = useState<any[]>([]);
  const [fabricsData, setFabricsData] = useState<Fabric[]>([]);

  // Deeply nested state to hold products -> fabrics -> sizes/quantities
  type ProductRowData = {
    id: string;
    productId: string;
    fabrics: { id: string; fabricId: string; quantities: Record<string, number> }[];
  };
  const [selectedProductRows, setSelectedProductRows] = useState<ProductRowData[]>([]);

  // BOM State
  const [bomData, setBomData] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [calculatedBoms, setCalculatedBoms] = useState<any[]>([]);
  const [editableBomQuantities, setEditableBomQuantities] = useState<Record<string, string>>({}); // Stores manual overrides of BOM quantities
  const [fabricModalState, setFabricModalState] = useState<{ isOpen: boolean; rowId?: string; fabricRowId?: string }>({ isOpen: false });

  const sizeMultipliers: Record<string, number> = { XS: 0.8, S: 0.9, M: 1.0, L: 1.1, XL: 1.2, XXL: 1.3 };

  // ================= Fetching Initial Data =================
  useEffect(() => {
    fetchCustomers().then(setCustomers).catch(console.error);

    Promise.all([
      fetchProducts(),
      fetchFabrics(),
      fetch("http://localhost:5083/api/bill-of-material").then((r) => r.json()).catch(() => ({ value: [] })),
      fetch("http://localhost:5083/api/material").then((r) => r.json()).catch(() => ({ value: [] })),
    ])
      .then(([prods, fabs, bomsRes, matsRes]) => {
        const mappedProds = prods.map((p) => ({
          productId: p.id || (p as any).productId,
          id: p.id || (p as any).productId,
          name: p.name,
          imagePath: resolveMediaUrl(p.imagePath, "product"),
          sizes: p.sizes && p.sizes.length > 0 ? p.sizes : ["S"],
        }));
        setProductsData(mappedProds);
        setFabricsData(fabs);
        setBomData(bomsRes.value || bomsRes || []);
        setMaterials(matsRes.value || matsRes || []);

        // Initialize with one empty row
        setSelectedProductRows([
          {
            id: Date.now().toString(),
            productId: "",
            fabrics: [{ id: Date.now().toString() + "_f", fabricId: "", quantities: {} }],
          },
        ]);
      })
      .catch(console.error);
  }, []);

  // ================= BOM Calculation based on React State =================
  useEffect(() => {
    let aggregatedMaterials: Record<string, { materialId: string; name: string; unit: string; required: number }> = {};
    let newEditableBoms = { ...editableBomQuantities };

    selectedProductRows.forEach((row) => {
      if (!row.productId) return;

      row.fabrics.forEach((fab) => {
        const fabricDef = fabricsData.find((f) => f.id === fab.fabricId);
        const fabricName = fabricDef ? fabricDef.name : "";

        const hasQuantities = Object.values(fab.quantities).some((qty) => qty > 0);

        if (hasQuantities && bomData.length > 0 && materials.length > 0) {
          let boms = bomData.filter((b) => b.productId === row.productId);
          boms.forEach((bom) => {
            let mat = materials.find((m) => m.id === bom.materialId);
            if (mat) {
              let matName = mat.name;
              let isColorSpecific = mat.type === "Fabric" || mat.type === "Thread" || mat.type === "Accessory";

              if (isColorSpecific && matName.includes("Dyed") && fabricName && fabricName !== "No fabric selected") {
                matName = matName.replace("Dyed", fabricName);
              }

              let totalReq = 0;
              for (let size in fab.quantities) {
                let multiplier = sizeMultipliers[size] || 1.0;
                let count = fab.quantities[size] || 0;
                let req = count * bom.qtyPerUnit * multiplier;
                req = req + req * ((bom.wastagePercent || 0) / 100);
                totalReq += req;
              }

              if (totalReq > 0) {
                let key = `${bom.materialId}_${matName}`;
                if (!aggregatedMaterials[key]) {
                  aggregatedMaterials[key] = {
                    materialId: bom.materialId,
                    name: matName,
                    unit: mat.unit || "units",
                    required: 0,
                  };
                }
                aggregatedMaterials[key].required += totalReq;
              }
            }
          });
        }
      });
    });

    const calculatedArray = Object.values(aggregatedMaterials);
    setCalculatedBoms(calculatedArray);

    // Sync calculated values into editable state if not manually touched yet
    calculatedArray.forEach(mat => {
      const stateKey = `${mat.materialId}_${mat.name}`;
      if (!newEditableBoms[stateKey]) {
        newEditableBoms[stateKey] = mat.required.toFixed(2);
      }
    });
    setEditableBomQuantities(newEditableBoms);

  }, [selectedProductRows, bomData, materials, fabricsData]);

  const handleEditableBomChange = (materialId: string, materialName: string, value: string) => {
    const stateKey = `${materialId}_${materialName}`;
    setEditableBomQuantities((prev) => ({
      ...prev,
      [stateKey]: value,
    }));
  };

  // ================= Step Validation Logic =================
  const validateAndProceed = (targetStep: number) => {
    setErrorMsg("");

    // Only validate if moving FORWARD
    if (targetStep > currentStep) {
      if (currentStep === 1) {
        if (!customerId) {
          setErrorMsg("Please select a customer before proceeding.");
          return;
        }
      }

      if (currentStep === 2) {
        const hasSelectedProducts = selectedProductRows.some((r) => r.productId !== "");
        if (!hasSelectedProducts) {
          setErrorMsg("Please select at least one product before proceeding.");
          return;
        }
      }

      if (currentStep === 3) {
        let hasValidItems = false;
        let missingFabric = false;

        selectedProductRows.forEach(row => {
          if (row.productId) {
            row.fabrics.forEach(fab => {
              const hasQty = Object.values(fab.quantities).some(q => q > 0);
              if (hasQty) hasValidItems = true;
              if (hasQty && !fab.fabricId) missingFabric = true;
            });
          }
        });

        if (!hasValidItems) {
          setErrorMsg("Please add a quantity for at least one size.");
          return;
        }
        if (missingFabric) {
          setErrorMsg("Please select a fabric for all products that have quantities.");
          return;
        }
      }
    }

    setCurrentStep(targetStep);
  };

  // ================= State Mutators for Products/Fabrics =================
  const addProductRow = () => {
    setSelectedProductRows((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        productId: "",
        fabrics: [{ id: Date.now().toString() + "_f", fabricId: "", quantities: {} }],
      },
    ]);
  };

  const removeProductRow = (id: string) => setSelectedProductRows((prev) => prev.filter((r) => r.id !== id));

  const updateProductRow = (id: string, productId: string) => setSelectedProductRows((prev) => prev.map((r) => (r.id === id ? { ...r, productId } : r)));

  const addFabricToRow = (rowId: string) => setSelectedProductRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, fabrics: [...r.fabrics, { id: Date.now().toString() + "_f", fabricId: "", quantities: {} }] } : r)));

  const removeFabricFromRow = (rowId: string, fabricRowId: string) => setSelectedProductRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, fabrics: r.fabrics.filter((f) => f.id !== fabricRowId) } : r)));

  const updateFabricForRow = (rowId: string, fabricRowId: string, fabricId: string) => setSelectedProductRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, fabrics: r.fabrics.map((f) => (f.id === fabricRowId ? { ...f, fabricId } : f)) } : r)));

  const updateQuantity = (rowId: string, fabricRowId: string, size: string, qty: number) => {
    setSelectedProductRows((prev) =>
      prev.map((r) => {
        if (r.id === rowId) {
          return {
            ...r,
            fabrics: r.fabrics.map((f) => {
              if (f.id === fabricRowId) {
                return {
                  ...f,
                  quantities: {
                    ...f.quantities,
                    [size]: isNaN(qty) ? 0 : qty,
                  },
                };
              }
              return f;
            }),
          };
        }
        return r;
      }),
    );
  };

  // ================= Final Submit Handler =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const items: any[] = [];

    selectedProductRows.forEach((row) => {
      if (row.productId) {
        const product = productsData.find((p) => p.productId === row.productId);
        row.fabrics.forEach((fab) => {
          const orderItemSizes: any[] = [];
          for (let size in fab.quantities) {
            let qty = fab.quantities[size];
            if (qty > 0) {
              const basePrice = 150;
              const multiplier = sizeMultipliers[size] || 1.0;
              const rate = Math.round(basePrice * 1.5 * multiplier);

              orderItemSizes.push({
                size,
                fabricId: fab.fabricId,
                quantity: qty,
                unitPrice: rate,
                totalPrice: rate * qty,
              });
            }
          }

          if (orderItemSizes.length === 0) return;

          const quantity = orderItemSizes.reduce((sum, s) => sum + s.quantity, 0);

          const unitPrice = Math.round(orderItemSizes.reduce(
            (sum, s) => sum + s.unitPrice * s.quantity,
            0,
          ) / quantity);

          items.push({
            productId: row.productId,
            quantity,
            unitPrice,
            totalPrice: unitPrice * quantity,
            discount: 0,
            createdAt: new Date().toISOString(),
            orderItemSizes,
          });
        });
      }
    });

    if (items.length === 0) {
      setErrorMsg("Please add at least one product with a quantity greater than 0.");
      return;
    }

    let dueDateIso = new Date().toISOString();
    if (globalDeliveryDate) {
      const adDeliveryDate = bsToAd(globalDeliveryDate);
      const parts = adDeliveryDate.split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        dueDateIso = `${parts[0]}-${parts[1]}-${parts[2]}T00:00:00Z`;
      } else if (parts.length === 3) {
        dueDateIso = `${parts[2]}-${parts[1]}-${parts[0]}T00:00:00Z`;
      } else {
        dueDateIso = new Date(adDeliveryDate).toISOString();
      }
    }

    // Build the final BOM array using the manually edited quantities
    const finalOrderMaterials = calculatedBoms.map(mat => {
      const stateKey = `${mat.materialId}_${mat.name}`;
      return {
        materialId: mat.materialId,
        materialName: mat.name,
        quantity: parseFloat(editableBomQuantities[stateKey]) || mat.required
      };
    });

    const order = {
      customerId: customerId,
      orderNumber: `ORD-${Date.now()}`,
      status: "Pending",
      totalAmount: items.reduce((sum, i) => sum + i.totalPrice, 0),
      dueDate: dueDateIso,
      createdAt: new Date().toISOString(),
      orderItems: items,
      orderMaterials: finalOrderMaterials, // Include the editable BOM materials
      remarks: remarks,
      deliveryNote: globalDeliveryNote,
      deliveryType: deliveryType
    };

    try {
      await createOrder(order);
      router.push("/crm");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to save order");
    }
  };

  return (
    <>
      <CreateOrderStyles />
      <div className="pp-page">
        <PageHeader title="Create New Order" subtitle="Draft a new customer order via the setup wizard." actions={<ActionButton href="/CRM/Index">&larr; Back to Orders</ActionButton>} />

        <div className="pp-card">
          <div className="card-body order-card-body">

            {/* Validation Error Banner */}
            {errorMsg && (
              <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                <strong>Error: </strong> <span className="ms-2">{errorMsg}</span>
              </div>
            )}

            <WizardIndicator currentStep={currentStep} />

            <form onSubmit={handleSubmit}>

              {/* ================= STEP 1 ================= */}
              <WizardStep stepNumber={1} currentStep={currentStep} title="Customer Details">
                <div className="form-group">
                  <label htmlFor="CustomerId">Select Customer <span className="text-danger">*</span></label>
                  <SearchableSelect
                    options={customers.map((c) => ({
                      value: c.id || "",
                      label: c.name || "Customer",
                      sublabel: c.company || "Retail",
                    }))}
                    value={customerId}
                    onChange={(val) => setCustomerId(val)}
                    placeholder="-- Choose an existing customer --"
                    searchPlaceholder="Search customer by name or company..."
                  />
                </div>
                <div className="form-actions mt-4 text-end">
                  <StepButton onClick={() => validateAndProceed(2)}>Next &rarr;</StepButton>
                </div>
              </WizardStep>

              {/* ================= STEP 2 ================= */}
              <WizardStep stepNumber={2} currentStep={currentStep} title="Product Selection">
                <div>
                  {selectedProductRows.map((row) => (
                    <div key={row.id} className="product-row">
                      <div style={{ flex: 1 }}>
                        <label>Select Product</label>
                        <ProductSelect
                          value={row.productId}
                          onChange={(val) => updateProductRow(row.id, val)}
                          products={productsData}
                        />
                      </div>
                      <div>
                        <button type="button" className="btn btn-danger btn-sm mt-4" onClick={() => removeProductRow(row.id)}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" className="btn btn-outline-primary mt-2" onClick={addProductRow}>
                  + Add Product
                </button>
                <div className="form-actions mt-4 d-flex justify-content-between">
                  <StepButton onClick={() => validateAndProceed(1)} className="btn btn-light">&larr; Back</StepButton>
                  <StepButton onClick={() => validateAndProceed(3)}>Next &rarr;</StepButton>
                </div>
              </WizardStep>

              {/* ================= STEP 3 ================= */}
              <WizardStep stepNumber={3} currentStep={currentStep} title="Material & Size Configuration">
                <div>
                  {selectedProductRows.filter((r) => r.productId).map((row) => {
                    const product = productsData.find((p) => p.productId === row.productId);
                    if (!product) return null;
                    return (
                      <div key={row.id} className="product-config-block">
                        <div className="d-flex align-items-center mb-3">
                          <img src={product.imagePath} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', marginRight: '15px' }} />
                          <h5 style={{ margin: 0 }}>{product.name}</h5>
                        </div>

                        {row.fabrics.map((fabricRow) => {
                          const selectedFabric = fabricsData.find((f) => f.id === fabricRow.fabricId);
                          return (
                            <div key={fabricRow.id} className="fabric-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '15px', marginTop: '15px', padding: '15px', background: '#fdfdfd', border: '1px dashed #ccc', borderRadius: '6px' }}>
                              <div className="d-flex align-items-center w-100">
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  {selectedFabric && (
                                    <img src={resolveMediaUrl(selectedFabric.imagePath, "fabric")} style={{ width: '40px', height: '40px', borderRadius: '4px', border: '1px solid #ccc', objectFit: 'cover' }} alt={selectedFabric.name} />
                                  )}
                                  <button type="button" className="btn btn-outline-info btn-sm" onClick={() => setFabricModalState({ isOpen: true, rowId: row.id, fabricRowId: fabricRow.id })}>
                                    Select Fabric
                                  </button>
                                  <span style={{ fontWeight: 500 }}>
                                    {selectedFabric ? selectedFabric.name : "No fabric selected"}
                                  </span>
                                </div>
                                <button type="button" className="btn btn-sm btn-outline-danger ms-3" onClick={() => removeFabricFromRow(row.id, fabricRow.id)}>X</button>
                              </div>

                              <div className="size-table-container">
                                <table className="size-table">
                                  <thead>
                                    <tr>
                                      {product.sizes.map((s: string) => <th key={s}>{s}</th>)}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      {product.sizes.map((s: string) => (
                                        <td key={s}>
                                          <input
                                            type="text"
                                            className="form-control size-input"
                                            placeholder="0"
                                            value={fabricRow.quantities[s] || ""}
                                            onChange={(e) => updateQuantity(row.id, fabricRow.id, s, parseInt(e.target.value.replace(/[^0-9]/g, "")))}
                                          />
                                        </td>
                                      ))}
                                    </tr>
                                    <tr className="rate-row">
                                      {product.sizes.map((s: string) => {
                                        const rate = Math.round(150 * 1.5 * (sizeMultipliers[s] || 1.0));
                                        return <td key={s}>Rs. {rate}</td>;
                                      })}
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          );
                        })}
                        <button type="button" className="btn btn-sm btn-outline-secondary mt-3" onClick={() => addFabricToRow(row.id)}>
                          + Add Fabric
                        </button>
                      </div>
                    );
                  })}
                </div>

                {calculatedBoms.length > 0 && (
                  <div className="central-material-calc mt-4 p-3 bg-white border rounded shadow-sm">
                    <h5 className="mb-3 text-success">Consolidated Material Requirements</h5>
                    <div className="table-responsive">
                      <table className="table table-bordered table-sm mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Material Name</th>
                            <th>Unit</th>
                            <th>Calculated Req.</th>
                            <th>Final Qty (To Source)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {calculatedBoms.map((mat, idx) => {
                            const stateKey = `${mat.materialId}_${mat.name}`;
                            return (
                              <tr key={idx}>
                                <td className="align-middle">
                                  {mat.name}
                                  {/* Keeping hidden fields just in case a legacy form wrapper requires them */}
                                  <input type="hidden" name={`OrderMaterials[${idx}].MaterialName`} value={mat.name} />
                                  <input type="hidden" name={`OrderMaterials[${idx}].MaterialId`} value={mat.materialId} />
                                </td>
                                <td className="align-middle">{mat.unit}</td>
                                <td className="align-middle">{mat.required.toFixed(2)}</td>
                                <td>
                                  <input
                                    type="number"
                                    step="0.01"
                                    className="form-control form-control-sm"
                                    name={`OrderMaterials[${idx}].Quantity`}
                                    value={editableBomQuantities[stateKey] || mat.required.toFixed(2)}
                                    onChange={(e) => handleEditableBomChange(mat.materialId, mat.name, e.target.value)}
                                    style={{ width: "120px" }}
                                    required
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="form-actions mt-4 d-flex justify-content-between">
                  <StepButton onClick={() => validateAndProceed(2)} className="btn btn-light">&larr; Back</StepButton>
                  <StepButton onClick={() => validateAndProceed(4)}>Next &rarr;</StepButton>
                </div>
              </WizardStep>

              {/* ================= STEP 4 ================= */}
              <WizardStep stepNumber={4} currentStep={currentStep} title="Delivery Details">
                <div className="form-group mb-4 delivery-type-panel">
                  <label><strong>Delivery Schedule Type</strong></label>
                  <div className="d-flex gap-4 mt-2">
                    <label>
                      <input type="radio" value="Single" checked={deliveryType === "Single"} onChange={() => setDeliveryType("Single")} /> Single Delivery
                      (All Products)
                    </label>
                    <label>
                      <input type="radio" value="Multiple" checked={deliveryType === "Multiple"} onChange={() => setDeliveryType("Multiple")} /> Multiple Deliveries (Per Product)
                    </label>
                  </div>
                </div>

                {deliveryType === "Single" && (
                  <div className="product-config-block">
                    <h5 className="mb-3">Global Delivery Date</h5>
                    <div className="delivery-date-row">
                      <NepaliDatePicker
                        className="form-control form-control-sm nepali-date"
                        placeholder="YYYY-MM-DD"
                        enableNepaliPicker
                        value={globalDeliveryDate}
                        onChange={(e) => setGlobalDeliveryDate(e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Destination / Note"
                        value={globalDeliveryNote}
                        onChange={(e) => setGlobalDeliveryNote(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="form-group mt-4">
                  <label>Overall Order Instructions</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  ></textarea>
                </div>

                <div className="form-actions mt-4 d-flex justify-content-between">
                  <StepButton onClick={() => validateAndProceed(3)} className="btn btn-light">&larr; Back</StepButton>
                  <StepButton type="submit" className="btn btn-success">Save Order</StepButton>
                </div>
              </WizardStep>
            </form>
          </div>
        </div>
      </div>

      {/* ================= FABRIC MODAL ================= */}
      <FabricModalReact
        isOpen={fabricModalState.isOpen}
        onClose={() => setFabricModalState({ isOpen: false })}
        onSelect={(fabricId) => {
          if (fabricModalState.rowId && fabricModalState.fabricRowId) {
            updateFabricForRow(fabricModalState.rowId, fabricModalState.fabricRowId, fabricId);
          }
        }}
        fabrics={fabricsData}
      />
    </>
  );
}
