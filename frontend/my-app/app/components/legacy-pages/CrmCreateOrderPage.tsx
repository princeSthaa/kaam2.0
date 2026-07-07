"use client";

import type { ReactNode } from "react";

import { ActionButton } from "../legacy-ui/ActionButton";
import { PageHeader } from "../legacy-ui/PageHeader";

type StepControlProps = {
  children: ReactNode;
  step?: number;
  type?: "button" | "submit";
  className?: string;
};

const customerOptions = [
  { value: "", label: "-- Choose an existing customer --" },
  { value: "CUS-1001", label: "Ram Bahadur Thapa (Retail)" },
  { value: "CUS-1002", label: "Sita Sharma (Wholesale)" },
  { value: "CUS-1003", label: "Hari Khadka (Distributor)" },
];

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
  children: ReactNode;
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
            <form method="post" id="createOrderForm">
              <WizardStep id="step-1" title="Customer Details" active>
                <div className="form-group">
                  <label htmlFor="CustomerId">
                    Select Customer <span className="text-danger">*</span>
                  </label>
                  <select id="CustomerId" name="CustomerId" className="form-control" required>
                    {customerOptions.map((option) => (
                      <option key={option.value || "empty"} value={option.value}>
                        {option.label}
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
