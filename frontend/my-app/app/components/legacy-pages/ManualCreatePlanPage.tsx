import { ActionButton } from "../legacy-ui/ActionButton";

const basisOptions = [
  {
    id: "basisDemand",
    value: "Customer Demand",
    icon: "fa-cart-shopping",
    label: "Customer Demand",
    defaultChecked: true,
  },
  {
    id: "basisInhouse",
    value: "In-house Production",
    icon: "fa-industry",
    label: "In-house Production",
    defaultChecked: false,
  },
];

const planFields = [
  {
    id: "inputPlanName",
    label: "Plan Name",
    type: "text",
    className: "form-control bg-light",
    placeholder: "e.g. Q3 Denim Pant Run",
    wrapperClassName: "col-12",
    required: true,
  },
  {
    id: "inputStartDate",
    label: "Start Date",
    type: "date",
    className: "form-control bg-light",
    wrapperClassName: "col-md-6",
    required: true,
  },
  {
    id: "inputEndDate",
    label: "End Date",
    type: "date",
    className: "form-control bg-light",
    wrapperClassName: "col-md-6",
    required: true,
  },
  {
    id: "inputQty",
    label: "Target Quantity",
    type: "number",
    className: "form-control border-primary shadow-sm",
    wrapperClassName: "col-md-6",
    min: 1,
    defaultValue: "0",
    required: true,
  },
];

function PlanField({ field }: { field: (typeof planFields)[number] }) {
  return (
    <div className={field.wrapperClassName}>
      <label className="form-label fw-semibold small text-dark mb-1">{field.label}</label>
      <div className={field.type === "date" ? "input-icon-wrapper" : undefined}>
        <input
          type={field.type}
          id={field.id}
          className={field.className}
          placeholder={field.placeholder}
          min={field.min}
          defaultValue={field.defaultValue}
          required={field.required}
        />
      </div>
    </div>
  );
}

export function ManualCreatePlanPage() {
  return (
    <div id="formView" className="container-fluid max-w-1200 mx-auto">
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h1 className="fs-4 fw-bold mb-1">Create Production Plan</h1>
          <p className="text-secondary small mb-0">Configure output and manually add materials to calculate costs.</p>
        </div>
        <ActionButton href="/Production/Index" variant="outline-secondary" size="sm" className="fw-semibold text-decoration-none">
          <i className="fa-solid fa-arrow-left me-1" /> Back to List
        </ActionButton>
      </div>

      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-4">
          <form id="createPlanForm">
            <div className="mb-4 pb-4 border-bottom">
              <label className="form-label fw-bold text-dark mb-3">Plan Basis</label>
              <div className="d-flex gap-4">
                {basisOptions.map((basis) => (
                  <div className="form-check" key={basis.id}>
                    <input
                      className="form-check-input"
                      type="radio"
                      name="planBasis"
                      id={basis.id}
                      value={basis.value}
                      defaultChecked={basis.defaultChecked}
                    />
                    <label className="form-check-label fw-semibold text-secondary" htmlFor={basis.id}>
                      <i className={`fa-solid ${basis.icon} me-1`} /> {basis.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="row g-4 mb-4 pb-4 border-bottom">
              {planFields.map((field) => (
                <PlanField field={field} key={field.id} />
              ))}

              <div className="col-md-6">
                <label className="form-label fw-semibold small text-dark mb-1">Unit of Measure</label>
                <div className="input-icon-wrapper">
                  <select id="inputUOM" className="form-select bg-light" defaultValue="Pieces (pcs)">
                    <option>Pieces (pcs)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="fs-6 fw-bold mb-0">Material & Cost Calculation</h3>
                <button type="button" id="btnAddMaterial" className="btn btn-outline-primary btn-sm px-3 fw-semibold">
                  <i className="fa-solid fa-plus me-1" /> Add Material
                </button>
              </div>

              <div className="table-responsive border rounded-3 mb-3">
                <table className="table table-borderless table-hover align-middle mb-0">
                  <thead className="table-light border-bottom">
                    <tr>
                      <th className="text-secondary text-uppercase fw-semibold" style={{ fontSize: "0.75rem", width: "35%" }}>Material Name</th>
                      <th className="text-secondary text-uppercase fw-semibold" style={{ fontSize: "0.75rem", width: "20%" }}>Qty Per Unit</th>
                      <th className="text-secondary text-uppercase fw-semibold" style={{ fontSize: "0.75rem", width: "20%" }}>Cost Per Unit (Rs.)</th>
                      <th className="text-secondary text-uppercase fw-semibold text-primary text-end pe-4" style={{ fontSize: "0.75rem", width: "25%" }}>Total Cost</th>
                    </tr>
                  </thead>
                  <tbody id="bomTableBody">
                    <tr id="bomEmptyState">
                      <td colSpan={4} className="text-center text-secondary py-4 bg-light">
                        <i className="fa-solid fa-boxes-stacked fs-4 mb-2 d-block text-muted" />
                        Click "Add Material" to start building your production costs.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-end">
                <div className="bg-primary-subtle border border-primary text-primary px-4 py-3 rounded-3 shadow-sm d-flex align-items-center gap-3">
                  <span className="fw-semibold">Estimated Run Cost:</span>
                  <span className="fs-4 fw-bold" id="totalRunCost">Rs. 0.00</span>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4 pt-3 border-top">
              <button type="submit" className="btn btn-success px-4 py-2 fw-semibold shadow-sm">
                <i className="fa-solid fa-floppy-disk me-1" /> Save Production Plan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
