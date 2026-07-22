"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ActionButton } from "@/app/components/ui/ActionButton";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { fetchCustomers } from "../../api/customer.api";
import { Customer } from "../../dto/customer.dto";
import { createOrder } from "../../api/order.api";
import { fetchProducts, fetchFabrics, resolveMediaUrl, Product, Fabric } from "../../api/catalog.api";
import { NepaliDatePicker } from "@/app/components/ui/NepaliDatePicker";

type StepControlProps = {
  children: React.ReactNode;
  step?: number;
  type?: "button" | "submit";
  className?: string;
};

function callLegacy(name: string, ...args: unknown[]) {
  const fn = (window as unknown as Record<string, (...values: unknown[]) => void>)[name];
  if (typeof fn === "function") fn(...args);
}

function StepButton({ children, step, type = "button", className = "btn btn-primary" }: StepControlProps) {
  return (
    <button type={type} className={className} onClick={step ? () => callLegacy("goToStep", step) : undefined}>
      {children}
    </button>
  );
}

function WizardIndicator() {
  return (
    <div className="step-indicator">
      <div className="step-bullet active" id="indicator-1">
        1. Customer
      </div>
      <div className="step-bullet" id="indicator-2">
        2. Products
      </div>
      <div className="step-bullet" id="indicator-3">
        3. Materials & Sizes
      </div>
      <div className="step-bullet" id="indicator-4">
        4. Delivery
      </div>
    </div>
  );
}

function WizardStep({
  id,
  title,
  active = false,
  children,
}: {
  id: string;
  title: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className={`wizard-step ${active ? "active" : ""}`}>
      <h3 className="order-step-title">{title}</h3>
      {children}
    </div>
  );
}

function FabricModal() {
  return (
    <div className="modal fade" id="fabricModal" tabIndex={-1} aria-hidden="true">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="fabricModalTitle">
              Select Fabric Category
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div className="modal-body fabric-modal-body">
            <div id="fabricCategoryView">
              <input type="text" id="fabricCategorySearch" className="form-control mb-3" placeholder="Search categories..." />
              <div className="row" id="fabricCategoryGrid"></div>
            </div>
            <div id="fabricItemView" style={{ display: "none" }}>
              <div className="d-flex mb-3 gap-2 align-items-center">
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => callLegacy("showFabricCategories")}>
                  &larr; Back
                </button>
                <input type="text" id="fabricSearch" className="form-control" placeholder="Search fabrics..." />
              </div>
              <div className="row" id="fabricGrid"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateOrderStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          .wizard-step { display: none; }
          .wizard-step.active { display: block; }
          .pp-card { overflow: visible !important; }
          .order-card-body { padding: 20px; }
          .step-indicator { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .step-bullet { flex: 1; text-align: center; padding: 10px; border-bottom: 2px solid #ccc; font-weight: bold; color: #aaa; }
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
          .delivery-type-panel { background: #fdfdfd; border: 1px solid #eee; padding: 15px; border-radius: 8px; }
          .product-select-dropdown { width: 100%; position: relative; }
          .product-select-btn { width: 100%; display: flex; align-items: center; justify-content: space-between; text-align: left; height: auto; padding: 8px 12px; background: #fff; border: 1px solid #ced4da; border-radius: 6px; }
          .product-select-menu { position: absolute; top: 100%; left: 0; right: 0; z-index: 1000; max-height: 300px; overflow-y: auto; background: #fff; border: 1px solid #ced4da; border-radius: 6px; margin-top: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .product-select-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; cursor: pointer; border-bottom: 1px solid #f1f1f1; background: #fff; border-left: 0; border-right: 0; border-top: 0; width: 100%; text-align: left; transition: background 0.2s; }
          .product-select-item:hover { background: #f8f9fa; }
          .product-select-item:last-child { border-bottom: none; }
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

function FabricModalReact({ 
  isOpen, 
  onClose, 
  onSelect, 
  fabrics 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSelect: (fabricId: string) => void; 
  fabrics: Fabric[] 
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Reset state when opened/closed
  useEffect(() => {
    if (!isOpen) {
      setSelectedCategory(null);
      setSearch("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getCat = (f: Fabric) => f.category || (f as any).type || "General";
  const categories = Array.from(new Set(fabrics.map(getCat)));

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    setSearch("");
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setSearch("");
  };

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div className="modal fade show" style={{ display: "block" }} tabIndex={-1} aria-modal="true" role="dialog">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {selectedCategory ? `Select Fabric - ${selectedCategory}` : "Select Fabric Category"}
              </h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body fabric-modal-body" style={{ maxHeight: "500px", overflowY: "auto" }}>
              {!selectedCategory ? (
                <>
                  <input 
                    type="text" 
                    className="form-control mb-3" 
                    placeholder="Search categories..." 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                  />
                  <div className="row">
                    {categories.filter(c => c.toLowerCase().includes(search.toLowerCase())).map(cat => {
                      const catFabrics = fabrics.filter(f => getCat(f) === cat);
                      return (
                        <div key={cat} className="col-md-4 col-sm-6 mb-4">
                          <div 
                            className="border rounded fabric-cat-col text-center bg-white shadow-sm" 
                            style={{ cursor: "pointer", transition: "transform 0.2s", overflow: "hidden" }}
                            onClick={() => handleCategoryClick(cat)}
                          >
                            <div className="d-flex" style={{ width: "100%", background: "#eee" }}>
                              {catFabrics.slice(0, 4).map(f => (
                                <img key={f.id} src={resolveMediaUrl(f.imagePath, "fabric")} alt={f.name} style={{ flex: 1, height: "100px", objectFit: "cover", minWidth: 0 }} />
                              ))}
                            </div>
                            <div className="p-3 border-top">
                              <strong style={{ fontSize: "1.1em", color: "#333" }}>{cat}</strong><br/>
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
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleBack}>
                      &larr; Back
                    </button>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Search fabrics..." 
                      value={search} 
                      onChange={e => setSearch(e.target.value)} 
                    />
                  </div>
                  <div className="row">
                    {fabrics
                      .filter(f => getCat(f) === selectedCategory)
                      .filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
                      .map(f => (
                        <div key={f.id} className="col-md-4 col-sm-6 mb-3">
                          <div 
                            className="fabric-item bg-white shadow-sm" 
                            onClick={() => {
                              onSelect(f.id);
                              onClose();
                            }}
                          >
                            <img src={resolveMediaUrl(f.imagePath, "fabric")} alt={f.name} />
                            <strong>{f.name}</strong><br/>
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

function ProductSelect({ 
  value, 
  onChange, 
  products 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  products: any[] 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedProduct = products.find(p => p.productId === value);

  return (
    <div className="product-select-dropdown">
      <button 
        type="button" 
        className="product-select-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedProduct ? (
          <div className="d-flex align-items-center gap-2">
            <img src={selectedProduct.imagePath} alt={selectedProduct.name} style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '4px' }} />
            <span>{selectedProduct.name}</span>
          </div>
        ) : (
          <span className="text-muted">-- Select Product --</span>
        )}
        <span className="text-muted">&#9662;</span>
      </button>

      {isOpen && (
        <div className="product-select-menu">
          {products.map(p => (
            <button 
              key={p.productId} 
              type="button" 
              className="product-select-item"
              onClick={() => { onChange(p.productId); setIsOpen(false); }}
            >
              <img src={p.imagePath} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CrmCreateOrderPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [productsData, setProductsData] = useState<any[]>([]);
  const [fabricsData, setFabricsData] = useState<Fabric[]>([]);
  
  type ProductRowData = {
    id: string;
    productId: string;
    fabrics: { id: string; fabricId: string }[];
  };
  const [selectedProductRows, setSelectedProductRows] = useState<ProductRowData[]>([]);
  
  const [deliveryType, setDeliveryType] = useState("Single");
  const [globalDeliveryDate, setGlobalDeliveryDate] = useState("");
  const [showBom, setShowBom] = useState(false);
  const [fabricModalState, setFabricModalState] = useState<{isOpen: boolean, rowId?: string, fabricRowId?: string}>({ isOpen: false });

  const [bomData, setBomData] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [calculatedBoms, setCalculatedBoms] = useState<any[]>([]);

  const sizeMultipliers: Record<string, number> = { "XS": 0.8, "S": 0.9, "M": 1.0, "L": 1.1, "XL": 1.2, "XXL": 1.3 };

  const recalculateBom = () => {
    let aggregatedMaterials: Record<string, { materialId: string, name: string, unit: string, required: number }> = {};
    let hasValue = false;

    document.querySelectorAll('.product-config-block').forEach(pBlock => {
      const prodId = pBlock.getAttribute('data-productid');
      if (!prodId) return;

      const fabricRows = pBlock.querySelectorAll('.fabric-row');
      fabricRows.forEach(fBlock => {
        const fabricName = fBlock.querySelector('.fabric-name-display')?.textContent || "";
        
        let sizeCounts: Record<string, number> = {};
        fBlock.querySelectorAll('.size-input').forEach(input => {
          const size = input.getAttribute('data-size');
          const val = (input as HTMLInputElement).value.replace(/[^0-9]/g, '');
          (input as HTMLInputElement).value = val;
          const qty = parseInt(val) || 0;
          if (size && qty > 0) {
            sizeCounts[size] = (sizeCounts[size] || 0) + qty;
            hasValue = true;
          }
        });

        if (Object.keys(sizeCounts).length > 0 && bomData.length > 0 && materials.length > 0) {
          let boms = bomData.filter(b => b.productId === prodId);
          boms.forEach(bom => {
            let mat = materials.find(m => m.id === bom.materialId);
            if (mat) {
              let matName = mat.name;
              let isColorSpecific = (mat.type === "Fabric" || mat.type === "Thread" || mat.type === "Accessory");
              if (isColorSpecific && matName.includes("Dyed") && fabricName && fabricName !== "No fabric selected") {
                matName = matName.replace("Dyed", fabricName);
              }

              let totalReq = 0;
              for (let size in sizeCounts) {
                let multiplier = sizeMultipliers[size] || 1.0;
                let count = sizeCounts[size];
                let req = count * bom.qtyPerUnit * multiplier;
                req = req + (req * ((bom.wastagePercent || 0) / 100));
                totalReq += req;
              }

              let key = matName;
              if (!aggregatedMaterials[key]) {
                aggregatedMaterials[key] = {
                  materialId: mat.id,
                  name: matName,
                  unit: mat.unit || mat.unitOfMeasure || "unit",
                  required: 0
                };
              }
              aggregatedMaterials[key].required += totalReq;
            }
          });
        }
      });
    });

    setCalculatedBoms(Object.values(aggregatedMaterials));
    setShowBom(hasValue);
  };

  const addProductRow = () => {
    setSelectedProductRows(prev => [...prev, { 
      id: Date.now().toString(), 
      productId: "",
      fabrics: [{ id: Date.now().toString() + "_f", fabricId: "" }]
    }]);
  };

  const removeProductRow = (id: string) => {
    setSelectedProductRows(prev => prev.filter(r => r.id !== id));
  };

  const updateProductRow = (id: string, productId: string) => {
    setSelectedProductRows(prev => prev.map(r => r.id === id ? { ...r, productId } : r));
  };

  const addFabricToRow = (rowId: string) => {
    setSelectedProductRows(prev => prev.map(r => {
      if (r.id === rowId) {
        return { ...r, fabrics: [...r.fabrics, { id: Date.now().toString() + "_f", fabricId: "" }] };
      }
      return r;
    }));
  };

  const removeFabricFromRow = (rowId: string, fabricRowId: string) => {
    setSelectedProductRows(prev => prev.map(r => {
      if (r.id === rowId) {
        return { ...r, fabrics: r.fabrics.filter(f => f.id !== fabricRowId) };
      }
      return r;
    }));
  };

  const updateFabricForRow = (rowId: string, fabricRowId: string, newFabricVal: string) => {
    setSelectedProductRows(prev => prev.map(r => {
      if (r.id === rowId) {
        return {
          ...r,
          fabrics: r.fabrics.map(f => f.id === fabricRowId ? { ...f, fabricId: newFabricVal } : f)
        };
      }
      return r;
    }));
    setTimeout(() => recalculateBom(), 50);
  };

  useEffect(() => {
    fetchCustomers().then(setCustomers).catch(console.error);

    (window as any).goToStep = (step: number) => {
      document.querySelectorAll(".wizard-step").forEach((el) => el.classList.remove("active"));
      const stepEl = document.getElementById(`step-${step}`);
      if (stepEl) stepEl.classList.add("active");

      document.querySelectorAll(".step-bullet").forEach((el) => el.classList.remove("active"));
      const indicatorEl = document.getElementById(`indicator-${step}`);
      if (indicatorEl) indicatorEl.classList.add("active");
    };

    Promise.all([
      fetchProducts(), 
      fetchFabrics(),
      fetch("http://localhost:5083/api/bill-of-material").then(r => r.json()).catch(() => ({ value: [] })),
      fetch("http://localhost:5083/api/material").then(r => r.json()).catch(() => ({ value: [] }))
    ]).then(([prods, fabs, bomsRes, matsRes]) => {
      const mappedProds = prods.map(p => ({
        productId: p.id,
        name: p.name,
        imagePath: resolveMediaUrl(p.imagePath, "product"),
        sizes: p.sizes?.length ? p.sizes : ["XS", "S", "M", "L", "XL", "XXL"]
      }));
      setProductsData(mappedProds);
      setFabricsData(fabs);
      setBomData(bomsRes.value || bomsRes || []);
      setMaterials(matsRes.value || matsRes || []);
      setSelectedProductRows([{ 
        id: Date.now().toString(), 
        productId: "",
        fabrics: [{ id: Date.now().toString() + "_f", fabricId: "" }]
      }]);
    }).catch(console.error);
  }, []);

  // Recalculate BOM when base data changes
  useEffect(() => {
    recalculateBom();
  }, [bomData, materials]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Harvest products from the legacy DOM
    const items: any[] = [];
    document.querySelectorAll(".product-config-block").forEach(block => {
      const prodId = block.getAttribute('data-productid') || "";
      const name = block.querySelector("h5")?.textContent || "Unknown Product";
      const productImage = block.querySelector("img")?.getAttribute("src") || "";
      
      block.querySelectorAll(".size-input").forEach(input => {
        const qty = parseInt((input as HTMLInputElement).value) || 0;
        if (qty > 0) {
          const fabricRow = input.closest(".fabric-row");
          const fabricNameText = fabricRow?.querySelector(".fabric-name-display")?.textContent || "Standard Fabric";
          const fabricName = fabricNameText === "No fabric selected" ? "Standard Fabric" : fabricNameText;
          const fabricId = fabricRow?.getAttribute("data-fabricid") || "";

          const table = input.closest("table");
          let unitPrice = 0;
          if (table) {
             const td = input.closest("td");
             if (td) {
               const idx = Array.from(td.parentElement!.children).indexOf(td);
               const rateText = table.querySelector(".rate-row")?.children[idx]?.textContent || "";
               unitPrice = parseFloat(rateText.replace(/[^0-9.]/g, "")) || 0;
             }
          }

          const sizeHeader = input.closest("td")
            ? (() => {
                const td = input.closest("td")!;
                const idx = Array.from(td.parentElement!.children).indexOf(td);
                const table = td.closest("table");
                return table?.querySelector("thead tr")?.children[idx]?.textContent?.trim() || "";
              })()
            : "";
          const variant = [fabricName, sizeHeader].filter(Boolean).join(" / ") || "Standard";

          if (!fabricId) {
            alert(`Please select a fabric for ${name}.`);
            throw new Error("Missing fabric");
          }

          items.push({ 
            orderId: "", // Backend requires this field even though it's set on the server
            productId: prodId,
            fabricId: fabricId,
            quantity: qty, 
            unitPrice: unitPrice,
            totalPrice: qty * unitPrice,
            discount: 0,
            createdAt: new Date().toISOString()
          });
        }
      });
    });

    const customerId = formData.get("CustomerId") as string;
    if (!customerId) {
      alert("Please go back to Step 1 and select a Customer.");
      return;
    }

    if (items.length === 0) {
      alert("Please add at least one product with a quantity greater than 0.");
      return;
    }

    let dueDateIso = new Date().toISOString();
    const rawDate = formData.get("GlobalDeliveryDate") as string;
    if (rawDate) {
      const parts = rawDate.split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        // Already YYYY-MM-DD
        dueDateIso = `${parts[0]}-${parts[1]}-${parts[2]}T00:00:00Z`;
      } else if (parts.length === 3) {
        // DD-MM-YYYY to YYYY-MM-DD
        dueDateIso = `${parts[2]}-${parts[1]}-${parts[0]}T00:00:00Z`;
      } else {
        dueDateIso = new Date(rawDate).toISOString();
      }
    }

    const order = {
      customerId: customerId,
      orderNumber: `ORD-${Date.now()}`,
      status: "Pending", // Pending status
      totalAmount: items.reduce((sum, i) => sum + i.totalPrice, 0),
      dueDate: dueDateIso,
      createdAt: new Date().toISOString(),
      orderItems: items, // Send orderItems as expected by C# backend
    };

    try {
      await createOrder(order);
      router.push("/crm");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to save order");
    }
  };

  return (
    <>
      <CreateOrderStyles />
      <div className="pp-page">
        <PageHeader
          title="Create New Order"
          subtitle="Draft a new customer order via the setup wizard."
          actions={<ActionButton href="/CRM/Index">&larr; Back to Orders</ActionButton>}
        />

        <div className="pp-card">
          <div className="card-body order-card-body">
            <WizardIndicator />
            <form id="createOrderFormReact" onSubmit={handleSubmit}>
              <WizardStep id="step-1" title="Customer Details" active>
                <div className="form-group">
                  <label htmlFor="CustomerId">
                    Select Customer <span className="text-danger">*</span>
                  </label>
                  <select id="CustomerId" name="CustomerId" className="form-control" required>
                    <option value="">-- Choose an existing customer --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.company || 'Retail'})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-actions mt-4 text-end">
                  <StepButton step={2}>Next &rarr;</StepButton>
                </div>
              </WizardStep>

              <WizardStep id="step-2" title="Product Selection">
                <div id="selectedProductsRows">
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
                  <StepButton step={1} className="btn btn-light">
                    &larr; Back
                  </StepButton>
                  <StepButton step={3}>Next &rarr;</StepButton>
                </div>
              </WizardStep>

              <WizardStep id="step-3" title="Material & Size Configuration">
                <div id="materialsSizesContainer">
                  {selectedProductRows.filter(r => r.productId).map((row) => {
                    const product = productsData.find(p => p.productId === row.productId);
                    if (!product) return null;
                    return (
                      <div key={row.id} className="product-config-block" data-productid={row.productId}>
                        <div className="d-flex align-items-center mb-3">
                          <img src={product.imagePath} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', marginRight: '15px' }} />
                          <h5 style={{ margin: 0 }}>{product.name}</h5>
                        </div>

                        {row.fabrics.map((fabricRow, index) => {
                          const selectedFabric = fabricsData.find(f => f.id === fabricRow.fabricId);
                          return (
                            <div key={fabricRow.id} className="fabric-row" data-fabricid={fabricRow.fabricId} style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '15px', marginTop: '15px', padding: '15px', background: '#fdfdfd', border: '1px dashed #ccc', borderRadius: '6px' }}>
                              <div className="d-flex align-items-center w-100">
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  {selectedFabric && (
                                    <img src={resolveMediaUrl(selectedFabric.imagePath, "fabric")} style={{ width: '40px', height: '40px', borderRadius: '4px', border: '1px solid #ccc', objectFit: 'cover' }} alt={selectedFabric.name} />
                                  )}
                                  <button type="button" className="btn btn-outline-info btn-sm" onClick={() => setFabricModalState({ isOpen: true, rowId: row.id, fabricRowId: fabricRow.id })}>
                                    Select Fabric
                                  </button>
                                  <span className="fabric-name-display" style={{ fontWeight: 500 }}>
                                    {selectedFabric ? selectedFabric.name : "No fabric selected"}
                                  </span>
                                </div>
                                <button type="button" className="btn btn-sm btn-outline-danger ms-3" onClick={() => removeFabricFromRow(row.id, fabricRow.id)}>
                                  X
                                </button>
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
                                        <input type="text" data-size={s} pattern="\d*" className="form-control size-input" min="0" placeholder="0" onChange={recalculateBom} />
                                      </td>
                                    ))}
                                  </tr>
                                  <tr className="rate-row">
                                    {product.sizes.map((s: string) => {
                                      const multiplier = sizeMultipliers[s] || 1.0;
                                      const rate = Math.round(150 * 1.5 * multiplier);
                                      return (
                                        <td key={s}>Rs. {rate}</td>
                                      );
                                    })}
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )})}

                        <button type="button" className="btn btn-sm btn-outline-secondary mt-3" onClick={() => addFabricToRow(row.id)}>
                          + Add Fabric
                        </button>
                      </div>
                    );
                  })}
                </div>
                {showBom && (
                  <div id="centralMaterialBOM" className="central-material-calc mt-4 p-3 bg-white border rounded shadow-sm">
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
                          {calculatedBoms.length > 0 ? (
                            calculatedBoms.map((mat, idx) => (
                              <tr key={idx}>
                                <td className="align-middle">
                                  {mat.name}
                                  <input type="hidden" name={`OrderMaterials[${idx}].MaterialName`} value={mat.name} />
                                  <input type="hidden" name={`OrderMaterials[${idx}].MaterialId`} value={mat.materialId} />
                                </td>
                                <td className="align-middle">{mat.unit}</td>
                                <td className="align-middle">{mat.required.toFixed(2)}</td>
                                <td>
                                  <input 
                                    key={`${mat.name}-${mat.required}`}
                                    type="number" 
                                    step="0.01" 
                                    className="form-control form-control-sm" 
                                    name={`OrderMaterials[${idx}].Quantity`} 
                                    defaultValue={mat.required.toFixed(2)} 
                                    style={{ width: "120px" }} 
                                    required 
                                  />
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="text-center text-muted py-3">
                                Calculating BOM... Ensure materials and bom data are seeded.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                <div className="form-actions mt-4 d-flex justify-content-between">
                  <StepButton step={2} className="btn btn-light">
                    &larr; Back
                  </StepButton>
                  <StepButton step={4}>Next &rarr;</StepButton>
                </div>
              </WizardStep>

              <WizardStep id="step-4" title="Delivery Details">
                <div className="form-group mb-4 delivery-type-panel">
                  <label>
                    <strong>Delivery Schedule Type</strong>
                  </label>
                  <div className="d-flex gap-4 mt-2">
                    <label>
                      <input type="radio" name="DeliveryType" value="Single" checked={deliveryType === "Single"} onChange={() => setDeliveryType("Single")} /> Single Delivery
                      (All Products)
                    </label>
                    <label>
                      <input type="radio" name="DeliveryType" value="Multiple" checked={deliveryType === "Multiple"} onChange={() => setDeliveryType("Multiple")} /> Multiple Deliveries (Per
                      Product)
                    </label>
                  </div>
                </div>

                <div id="singleDeliveryContainer" className="product-config-block" style={{ display: deliveryType === "Single" ? "block" : "none" }}>
                  <h5 className="mb-3">Global Delivery Date</h5>
                  <div className="delivery-date-row">
                    <NepaliDatePicker
                      name="GlobalDeliveryDate"
                      className="form-control form-control-sm nepali-date"
                      id="globalDateInput"
                      placeholder="DD-MM-YYYY"
                      required={deliveryType === "Single"}
                      value={globalDeliveryDate}
                      onChange={(e) => setGlobalDeliveryDate(e.target.value)}
                    />
                    <input type="text" name="GlobalDeliveryNote" className="form-control form-control-sm" placeholder="Destination / Note" />
                  </div>
                </div>

                <div id="multipleDeliveryContainer" style={{ display: deliveryType === "Multiple" ? "block" : "none" }}></div>

                <div className="form-group mt-4">
                  <label htmlFor="Remarks">Overall Order Instructions</label>
                  <textarea id="Remarks" name="Remarks" className="form-control" rows={2}></textarea>
                </div>
                <div className="form-actions mt-4 d-flex justify-content-between">
                  <StepButton step={3} className="btn btn-light">
                    &larr; Back
                  </StepButton>
                  <StepButton type="submit" className="btn btn-success">
                    Save Order
                  </StepButton>
                </div>
              </WizardStep>
            </form>
          </div>
        </div>
      </div>
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
