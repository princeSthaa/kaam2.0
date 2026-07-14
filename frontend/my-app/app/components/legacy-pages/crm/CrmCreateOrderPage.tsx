import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ActionButton } from "../../legacy-ui/ActionButton";
import { PageHeader } from "../../legacy-ui/PageHeader";
import { fetchCustomers, fetchProducts, fetchFabrics, createOrder, Customer, Product, Fabric } from "../../../../lib/api";

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
          @media (max-width: 700px) {
            .step-indicator { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
            .product-row, .delivery-date-row { align-items: stretch; flex-direction: column; }
          }
        `,
      }}
    />
  );
}

export function CrmCreateOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerIdParam = searchParams.get("customerId");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  useEffect(() => {
    fetchCustomers().then((data) => {
      setCustomers(data);
      if (customerIdParam) {
        setSelectedCustomerId(customerIdParam);
      }
    }).catch(console.error);

    if (customerIdParam) {
      setSelectedCustomerId(customerIdParam);
    }
  }, [customerIdParam]);

  useEffect(() => {

    // Inject data into window for /js/crm/create-order.v3.js?v=13
    Promise.all([fetchProducts(), fetchFabrics()]).then(([prods, fabs]) => {
      // Map API Products to legacy expected shape
      (window as any).products = prods.map(p => ({
        productId: p.id,
        name: p.name,
        imagePath: p.imagePath || "/images/products/place-holder.png",
        sizes: p.sizes || []
      }));

      // Map API Fabrics to legacy expected shape
      (window as any).fabrics = fabs.map(f => ({
        fabricId: f.id,
        name: f.name,
        category: f.category || "Cotton",
        imageUrl: f.imagePath || "/images/products/place-holder.png",
        swatchUrl: f.imagePath || "/images/products/place-holder.png"
      }));

      // Map mock BOMs for the legacy script to populate standard sizes
      (window as any).bomData = prods.map(p => ({
        productId: p.id,
        materialId: "MAT-001",
        materialName: "Primary Fabric",
        sizes: ["S", "M", "L", "XL"],
        qtyPerUnit: 1.5,
        wastagePercent: 5
      }));

      // Re-initialize fabric modal after window.fabrics is populated
      if (typeof (window as any).initFabricModal === "function") {
        (window as any).initFabricModal();
      }

      // FIX: The legacy script auto-adds the first row on DOMContentLoaded BEFORE this API call finishes.
      // We must clear that stale row and recreate it so it uses the real API data!
      const container = document.getElementById("selectedProductsRows");
      if (container) {
        container.innerHTML = ""; // Wipe the old row
        if (typeof (window as any).addProductRow === "function") {
          (window as any).addProductRow(); // Add a fresh row with real API data
        }
      }
    }).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Harvest products from the legacy DOM
    const items: any[] = [];
    document.querySelectorAll(".product-config-block").forEach(block => {
      const name = block.querySelector("h5")?.textContent || "Unknown Product";
      const productImage = block.querySelector("img")?.getAttribute("src") || "";

      block.querySelectorAll(".size-input").forEach(input => {
        const qty = parseInt((input as HTMLInputElement).value) || 0;
        if (qty > 0) {
          const fabricRow = input.closest(".fabric-row");
          const fabricName = fabricRow?.querySelector("span")?.textContent || "Standard Fabric";

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
          // Include size label as variant suffix
          const sizeHeader = input.closest("td")
            ? (() => {
                const td = input.closest("td")!;
                const idx = Array.from(td.parentElement!.children).indexOf(td);
                const table = td.closest("table");
                return table?.querySelector("thead tr")?.children[idx]?.textContent?.trim() || "";
              })()
            : "";
          const variant = [fabricName, sizeHeader].filter(Boolean).join(" / ") || "Standard";
          items.push({
            productName: name,
            quantity: qty,
            unitPrice,
            variant,
            fabricName,
            productImage
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
      if (parts.length === 3) {
        // DD-MM-YYYY to YYYY-MM-DD
        dueDateIso = `${parts[2]}-${parts[1]}-${parts[0]}T00:00:00Z`;
      } else {
        dueDateIso = new Date(rawDate).toISOString();
      }
    }

    // Compute priority: Urgent if delivery is within 14 days
    const daysUntilDelivery = (new Date(dueDateIso).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    const priority = daysUntilDelivery <= 14 ? "Urgent" : "Normal";

    const remarks = formData.get("Remarks") as string || "";

    const order = {
      customerId: customerId,
      orderNumber: `ORD-${Date.now()}`,
      status: "Pending",
      priority,
      totalAmount: items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0),
      dueDate: dueDateIso,
      remarks,
      items: items,
    };

    try {
      await createOrder(order);
      router.push("/CRM/Index");
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
                  <select
                    id="CustomerId"
                    name="CustomerId"
                    className="form-control"
                    required
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                  >
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
                <div id="selectedProductsRows"></div>
                <button type="button" className="btn btn-outline-primary" onClick={() => callLegacy("addProductRow")}>
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
                <div id="materialsSizesContainer"></div>
                <div id="centralMaterialBOM" className="central-material-calc" style={{ display: "none" }}></div>
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
                      <input type="radio" name="DeliveryType" value="Single" defaultChecked onChange={() => callLegacy("toggleDeliveryMode")} /> Single Delivery
                      (All Products)
                    </label>
                    <label>
                      <input type="radio" name="DeliveryType" value="Multiple" onChange={() => callLegacy("toggleDeliveryMode")} /> Multiple Deliveries (Per
                      Product)
                    </label>
                  </div>
                </div>

                <div id="singleDeliveryContainer" className="product-config-block">
                  <h5 className="mb-3">Global Delivery Date</h5>
                  <div className="delivery-date-row">
                    <input
                      type="text"
                      name="GlobalDeliveryDate"
                      className="form-control form-control-sm nepali-date"
                      id="globalDateInput"
                      placeholder="DD-MM-YYYY"
                      required
                    />
                    <input type="text" name="GlobalDeliveryNote" className="form-control form-control-sm" placeholder="Destination / Note" />
                  </div>
                </div>

                <div id="multipleDeliveryContainer" style={{ display: "none" }}></div>

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
      <FabricModal />
    </>
  );
}
