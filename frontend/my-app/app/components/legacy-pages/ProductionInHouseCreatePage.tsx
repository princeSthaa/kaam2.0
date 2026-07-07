import { ActionButton } from "../legacy-ui/ActionButton";
import { TableShell } from "../legacy-ui/TableShell";

const reasons = ["Stock Replenishment", "Seasonal Production", "Forecast Demand", "Sample Production"];
const priorities = ["Normal", "Urgent", "Seasonal"];
const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

const materialHeaders = [
  "Material Code",
  "Material Name",
  "Material Type",
  "Required Qty",
  "Available Qty",
  "Shortage Qty",
  "Unit",
  "Status",
];

function SelectField({
  id,
  name,
  label,
  options,
  placeholder,
}: {
  id?: string;
  name: string;
  label: string;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <select name={name} id={id} className="form-control" defaultValue="">
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function DateField({
  label,
  bsId,
  adId,
  name,
  readOnly,
}: {
  label: string;
  bsId: string;
  adId: string;
  name: string;
  readOnly?: boolean;
}) {
  return (
    <div className="form-group">
      <label htmlFor={bsId}>{label}</label>
      <input type="text" id={bsId} className="form-control nepali-date inhouse-bs-date" placeholder="YYYY-MM-DD" readOnly />
      <input name={name} type="date" id={adId} className="form-control hidden-ad-date" readOnly={readOnly} />
    </div>
  );
}

function SizeBreakdownSection() {
  return (
    <section className="pp-card">
      <div className="pp-card-header">
        <div>
          <h2>Size Breakdown</h2>
          <p>Total size quantity must match total production quantity.</p>
        </div>
      </div>

      <div className="size-grid">
        {sizes.map((size) => (
          <div className="form-group" key={size}>
            <label>{size}</label>
            <input
              type="number"
              min="0"
              name={`Size${size}`}
              id={`size${size}`}
              className="form-control size-input"
              defaultValue="0"
            />
          </div>
        ))}
      </div>

      <div className="calculation-strip">
        <div>
          <span>Total Size Quantity</span>
          <strong id="sizeTotal">0</strong>
        </div>
        <div>
          <span>Difference</span>
          <strong id="sizeDifference">0</strong>
        </div>
        <div id="sizeValidationMessage" className="validation-message warning">
          Enter total quantity and size breakdown.
        </div>
      </div>
    </section>
  );
}

export function ProductionInHouseCreatePage() {
  return (
    <div className="pp-page inhouse-plan-page" id="inHousePlanPage">
      <div className="pp-page-header">
        <div>
          <h1>Create In-house Stock Plan</h1>
          <p>Plan garment production for internal warehouse stock.</p>
        </div>

        <div className="pp-header-actions">
          <ActionButton href="/Production/Create">Change Demand Type</ActionButton>
          <ActionButton href="/Production/Plan/PlansDetails">Back to Plans</ActionButton>
        </div>
      </div>

      <form method="post" id="productionPlanForm">
        <input name="DemandType" type="hidden" id="demandType" value="In-house Stock" />
        <input name="Variant" type="hidden" id="variantSummaryInput" />
        <input name="VariantBreakdownJson" type="hidden" id="variantBreakdownJson" />

        <div className="pp-create-grid">
          <section className="pp-card">
            <div className="pp-card-header">
              <div>
                <h2>In-house Stock Information</h2>
                <p>Select reason and warehouse for internal production.</p>
              </div>
            </div>

            <div className="form-grid two-col">
              <div className="form-group">
                <label>Plan No</label>
                <input name="PlanNo" className="form-control" readOnly />
              </div>

              <DateField label="Plan Date (BS)" bsId="planDateBs" adId="planDate" name="PlanDate" readOnly />
            </div>

            <div id="inHouseSection" className="conditional-section">
              <h3>In-house Stock</h3>
              <p>Create a production plan for internal stock requirement.</p>
              <div className="form-grid two-col">
                <SelectField name="InHouseReason" id="inHouseReason" label="Reason" options={reasons} placeholder="Select Reason" />
                <SelectField name="WarehouseId" id="warehouseDropdown" label="Warehouse" options={[]} placeholder="Select Warehouse" />
              </div>
            </div>
          </section>

          <section className="pp-card">
            <div className="pp-card-header">
              <div>
                <h2>Product Planning Production Stages</h2>
                <p>Select product, quantity, color, priority, and destination.</p>
              </div>
            </div>

            <div className="form-grid two-col">
              <div className="form-group full">
                <label>Product & Color Palette</label>
                <select name="ProductId" id="productDropdown" className="form-control" defaultValue="">
                  <option value="">Select Product & Palette</option>
                </select>
              </div>

              <div className="form-group">
                <label>Total Quantity</label>
                <input name="TotalQuantity" type="number" min="1" id="totalQuantity" className="form-control" placeholder="Example: 220" />
              </div>

              <SelectField name="Priority" label="Priority" options={priorities} />

              <div className="form-group full">
                <label>Output Destination</label>
                <select name="OutputDestination" className="form-control" defaultValue="Finished Goods Warehouse">
                  <option value="Finished Goods Warehouse">Finished Goods Warehouse</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        <section className="pp-card variant-quantity-card hidden" id="variantQuantitySection">
          <div className="pp-card-header">
            <div>
              <h2>Selected Palette Preview</h2>
              <p>Colors included in the selected fabric palette.</p>
            </div>
          </div>
          <div className="palette-preview-container" id="inhousePalettePreview" />
        </section>

        <section className="pp-card measurement-chart-card">
          <div className="pp-card-header">
            <div>
              <h2>Measurement Chart</h2>
              <p>Specification used by production team.</p>
            </div>
          </div>
          <TableShell
            bodyId="inhouseMeasurementBody"
            headers={["Size", "Chest", "Shoulder", "Sleeve", "Length", "Unit"]}
            tableClassName="pp-table compact-table"
          >
            <tr>
              <td colSpan={6} className="empty-cell">Select product to view measurement data.</td>
            </tr>
          </TableShell>
        </section>

        <SizeBreakdownSection />

        <section className="pp-card">
          <div className="pp-card-header">
            <div>
              <h2>Planned Dates</h2>
              <p>Plan start and completion dates before the required date.</p>
            </div>
          </div>

          <div className="form-grid four-col">
            <DateField label="Required Date (BS)" bsId="requiredDateBs" adId="requiredDate" name="RequiredDate" />
            <DateField label="Planned Start Date (BS)" bsId="plannedStartDateBs" adId="plannedStartDate" name="PlannedStartDate" />
            <DateField label="Planned Completion Date (BS)" bsId="plannedCompletionDateBs" adId="plannedCompletionDate" name="PlannedCompletionDate" />
            <div className="form-group">
              <label>Buffer Days</label>
              <input type="text" id="bufferDays" className="form-control" defaultValue="0 days" readOnly />
            </div>
          </div>

          <div id="dateValidationMessage" className="validation-message">
            Select dates to validate production schedule.
          </div>
        </section>

        <section className="pp-card">
          <div className="pp-card-header">
            <div>
              <h2>Material Requirement Preview</h2>
              <p>Materials are calculated from BOM and material master data only.</p>
            </div>
            <ActionButton id="checkMaterialBtn">Check Material Availability</ActionButton>
          </div>

          <TableShell bodyId="materialRequirementBody" headers={materialHeaders}>
            <tr>
              <td colSpan={8} className="empty-cell">Select product and quantity to preview material requirement.</td>
            </tr>
          </TableShell>
        </section>

        <div className="pp-action-bar">
          <button type="submit" name="ActionType" value="Draft" className="btn btn-light">Save as Draft</button>
          <ActionButton id="checkMaterialBottomBtn" variant="outline">Check Material Availability</ActionButton>
          <button type="submit" name="ActionType" value="Create" className="btn btn-primary">Create Production Plan</button>
          <ActionButton href="/Production/Index" variant="danger-light">Cancel</ActionButton>
        </div>
      </form>
    </div>
  );
}
