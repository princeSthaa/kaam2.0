import { ActionButton } from "../legacy-ui/ActionButton";
import { TableShell } from "../legacy-ui/TableShell";

const demandTypes = ["Customer Order", "Outlet Replenishment", "In-house Stock"];
const inHouseReasons = ["Stock Replenishment", "Seasonal Production", "Forecast Demand", "Sample Production"];
const priorities = ["Normal", "Urgent", "Seasonal"];
const destinations = ["Finished Goods Warehouse", "Customer Dispatch", "Outlet Transfer"];
const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
const materialHeaders = ["Material Code", "Material Name", "Material Type", "Required Qty", "Available Qty", "Shortage Qty", "Unit", "Status"];

function FieldLabel({ children }: { children: string }) {
  return <label>{children}</label>;
}

function SelectField({ id, name, label, options, placeholder }: { id?: string; name: string; label: string; options: string[]; placeholder?: string }) {
  return (
    <div className="form-group">
      <FieldLabel>{label}</FieldLabel>
      <select name={name} id={id} className="form-control editable-field" defaultValue="">
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option value={option} key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function SelectedInfoCard({ id, fields }: { id: string; fields: string[][] }) {
  return (
    <div id={id} className="selected-info-card hidden">
      {fields.map(([label, fieldId]) => (
        <div key={fieldId}>
          <span>{label}</span>
          <strong id={fieldId}>-</strong>
        </div>
      ))}
    </div>
  );
}

function SizeBreakdown() {
  return (
    <section className="pp-card">
      <div className="pp-card-header">
        <div>
          <h2>Size Breakdown</h2>
          <p>Aggregate quantity distribution across all products in this production plan.</p>
        </div>
      </div>
      <div className="size-grid">
        {sizes.map((size) => (
          <div className="form-group" key={size}>
            <label>{size}</label>
            <input type="number" min="0" name={`Size${size}`} id={`size${size}`} className="form-control size-input" defaultValue="0" readOnly />
          </div>
        ))}
      </div>
      <div className="calculation-strip">
        <div><span>Total Size Quantity</span><strong id="sizeTotal">0</strong></div>
        <div><span>Difference</span><strong id="sizeDifference">0</strong></div>
        <div id="sizeValidationMessage" className="validation-message warning">Enter total quantity and size breakdown.</div>
      </div>
    </section>
  );
}

function SelectionModal({ kind }: { kind: "customer" | "outlet" }) {
  const isCustomer = kind === "customer";
  const modalId = isCustomer ? "customerModal" : "outletModal";
  const searchId = isCustomer ? "customerSearch" : "outletSearch";
  const bodyId = isCustomer ? "customerGridBody" : "outletGridBody";
  const title = isCustomer ? "Select Customer" : "Select Outlet";
  const text = isCustomer ? "Choose customer from mock customer master data." : "Choose outlet from mock outlet master data.";
  const placeholder = isCustomer ? "Search by code, name, phone, address..." : "Search by code, name, location, manager...";
  const headers = isCustomer
    ? ["Customer Code", "Name", "Type", "Phone", "Address", "Action"]
    : ["Outlet Code", "Outlet Name", "Location", "Manager", "Phone", "Action"];

  return (
    <div className="pp-modal hidden" id={modalId}>
      <div className="pp-modal-backdrop" data-close-modal={modalId} />
      <div className="pp-modal-panel large">
        <div className="pp-modal-header">
          <div>
            <h2>{title}</h2>
            <p>{text}</p>
          </div>
          <button type="button" className="modal-close-btn" data-close-modal={modalId}>x</button>
        </div>
        <div className="pp-modal-body">
          <div className="form-group">
            <label htmlFor={searchId}>{isCustomer ? "Search Customer" : "Search Outlet"}</label>
            <input type="text" id={searchId} className="form-control" placeholder={placeholder} />
          </div>
          <TableShell bodyId={bodyId} headers={headers}>
            <tr>
              <td colSpan={6} className="empty-cell">Loading {kind}s...</td>
            </tr>
          </TableShell>
        </div>
      </div>
    </div>
  );
}

export function ProductionPlanEditPage() {
  return (
    <>
      <div className="pp-page">
        <div className="pp-page-header">
          <div>
            <h1>Edit Production Plan</h1>
            <p>Edit draft production plan details before confirming production.</p>
          </div>
          <div className="pp-header-actions">
            <ActionButton href="/Production/Plan/Details">View Details</ActionButton>
            <ActionButton href="/Production/Index">Back to Plans</ActionButton>
          </div>
        </div>

        <input type="hidden" id="selectedPlanId" value="PP-20260529-001" />
        <div id="notEditableWarning" className="alert alert-warning hidden">
          This production plan is not editable because only Draft plans can be edited.
        </div>

        <form method="post" id="editProductionPlanForm">
          <input name="PlanId" type="hidden" id="PlanId" />
          <input name="CustomerId" type="hidden" id="customerId" />
          <input name="OutletId" type="hidden" id="outletId" />
          <input name="Status" type="hidden" id="planStatus" />

          <div className="pp-create-grid">
            <section className="pp-card">
              <div className="pp-card-header">
                <div>
                  <h2>Demand Information</h2>
                  <p>Update source information for the production plan.</p>
                </div>
              </div>
              <div className="form-grid two-col">
                <div className="form-group">
                  <FieldLabel>Plan No</FieldLabel>
                  <input name="PlanNo" id="planNo" className="form-control" readOnly />
                </div>
                <div className="form-group">
                  <FieldLabel>Plan Date</FieldLabel>
                  <input name="PlanDate" type="date" id="planDate" className="form-control" readOnly />
                </div>
                <div className="form-group full">
                  <FieldLabel>Demand Type</FieldLabel>
                  <select name="DemandType" id="demandType" className="form-control editable-field" defaultValue="">
                    <option value="">Select Demand Type</option>
                    {demandTypes.map((type) => <option value={type} key={type}>{type}</option>)}
                  </select>
                  <span className="field-error" />
                </div>
              </div>

              <div id="customerSection" className="conditional-section hidden">
                <div className="section-action-row">
                  <div><h3>Customer Order</h3><p>Select customer from customer master data.</p></div>
                  <ActionButton href="/Production/Customer/Customers" id="openCustomerModalBtn" variant="primary" className="editable-action">Change Customer</ActionButton>
                </div>
                <SelectedInfoCard
                  id="selectedCustomerCard"
                  fields={[
                    ["Customer Code", "selectedCustomerCode"],
                    ["Customer Name", "selectedCustomerName"],
                    ["Phone", "selectedCustomerPhone"],
                    ["Address", "selectedCustomerAddress"],
                    ["Payment Terms", "selectedCustomerPaymentTerms"],
                    ["Delivery Location", "selectedCustomerDeliveryLocation"],
                  ]}
                />
              </div>

              <div id="outletSection" className="conditional-section hidden">
                <div className="section-action-row">
                  <div><h3>Outlet Replenishment</h3><p>Select outlet from outlet master data.</p></div>
                  <ActionButton href="/Production/Outlet/Outlets" id="openOutletModalBtn" variant="primary" className="editable-action">Change Outlet</ActionButton>
                </div>
                <SelectedInfoCard
                  id="selectedOutletCard"
                  fields={[
                    ["Outlet Code", "selectedOutletCode"],
                    ["Outlet Name", "selectedOutletName"],
                    ["Location", "selectedOutletLocation"],
                    ["Manager", "selectedOutletManager"],
                    ["Phone", "selectedOutletPhone"],
                  ]}
                />
              </div>

              <div id="inHouseSection" className="conditional-section hidden">
                <h3>In-house Stock</h3>
                <p>Edit internal production reason and warehouse.</p>
                <div className="form-grid two-col">
                  <SelectField name="InHouseReason" id="inHouseReason" label="Reason" options={inHouseReasons} placeholder="Select Reason" />
                  <SelectField name="WarehouseId" id="warehouseDropdown" label="Warehouse" options={[]} placeholder="Select Warehouse" />
                </div>
              </div>
            </section>

            <section className="pp-card">
              <div className="pp-card-header">
                <div>
                  <h2>Product Planning</h2>
                  <p>Edit product, color, quantity, priority, and output destination.</p>
                </div>
                <span id="editStatusBadge" className="status-badge">Loading</span>
              </div>
              <div className="form-grid two-col">
                <div className="form-group full">
                  <FieldLabel>Product</FieldLabel>
                  <select name="ProductId" id="productDropdown" className="form-control editable-field" defaultValue="">
                    <option value="">Select Product</option>
                  </select>
                  <span className="field-error" />
                </div>
                <div className="form-group">
                  <FieldLabel>Color / Variant</FieldLabel>
                  <div className="production-palette-picker-field">
                    <input name="Variant" id="variantDropdown" className="form-control editable-field" placeholder="Select color palette or variant" />
                    <ActionButton id="mainVariantPaletteBtn" className="editable-action">
                      <span className="material-symbols-outlined">palette</span>
                      Palette
                    </ActionButton>
                  </div>
                  <div id="mainVariantPalettePreview" className="palette-preview-host" hidden />
                </div>
                <div className="form-group">
                  <FieldLabel>Total Quantity</FieldLabel>
                  <input name="TotalQuantity" type="number" min="1" id="totalQuantity" className="form-control editable-field" placeholder="Example: 500" />
                  <span className="field-error" />
                </div>
                <SelectField name="Priority" id="priority" label="Priority" options={priorities} />
                <SelectField name="OutputDestination" id="outputDestination" label="Output Destination" options={destinations} placeholder="Select Destination" />
              </div>
            </section>
          </div>

          <section className="pp-card product-editor-card">
            <div className="pp-card-header">
              <div>
                <h2>Products In This Plan</h2>
                <p>Select one product from the list, edit its production details, then move to the next product.</p>
              </div>
            </div>
            <div id="editProductList" className="edit-product-list">
              <div className="empty-cell">Loading plan products...</div>
            </div>
          </section>

          <SizeBreakdown />

          <section className="pp-card">
            <div className="pp-card-header">
              <div><h2>Planned Dates</h2><p>Edit production date plan before the required date.</p></div>
            </div>
            <div className="form-grid four-col">
              <div className="form-group"><FieldLabel>Required Date</FieldLabel><input name="RequiredDate" type="date" id="requiredDate" className="form-control editable-field" /><span className="field-error" /></div>
              <div className="form-group"><FieldLabel>Planned Start Date</FieldLabel><input name="PlannedStartDate" type="date" id="plannedStartDate" className="form-control editable-field" /><span className="field-error" /></div>
              <div className="form-group"><FieldLabel>Planned Completion Date</FieldLabel><input name="PlannedCompletionDate" type="date" id="plannedCompletionDate" className="form-control editable-field" /><span className="field-error" /></div>
              <div className="form-group"><FieldLabel>Buffer Days</FieldLabel><input type="text" id="bufferDays" className="form-control" defaultValue="0 days" readOnly /></div>
            </div>
            <div id="dateValidationMessage" className="validation-message">Select dates to validate production schedule.</div>
          </section>

          <section className="pp-card">
            <div className="pp-card-header">
              <div><h2>Material Requirement Preview</h2><p>Recalculated from selected product, quantity, BOM, and material master data.</p></div>
              <ActionButton id="checkMaterialBtn" className="editable-action">Check Material Availability</ActionButton>
            </div>
            <TableShell bodyId="materialRequirementBody" headers={materialHeaders}>
              <tr><td colSpan={8} className="empty-cell">Select product and quantity to preview material requirement.</td></tr>
            </TableShell>
          </section>

          <section className="pp-card">
            <div className="pp-card-header">
              <div><h2>Production Stages</h2><p>Default stages are shown for planning reference.</p></div>
            </div>
            <TableShell bodyId="productionStagesBody" headers={["Stage Name", "Work Center / Department", "Planned Start Date", "Planned End Date", "Status"]}>
              <tr><td colSpan={5} className="empty-cell">Production stages will appear here.</td></tr>
            </TableShell>
          </section>

          <div className="pp-action-bar">
            <button type="submit" name="ActionType" value="SaveDraft" className="btn btn-primary editable-action">Save Changes</button>
            <ActionButton id="checkMaterialBottomBtn" variant="outline" className="editable-action">Check Material Availability</ActionButton>
            <ActionButton href="/Production/Plan/Details">Cancel</ActionButton>
          </div>
        </form>
      </div>

      <SelectionModal kind="customer" />
      <SelectionModal kind="outlet" />
    </>
  );
}
