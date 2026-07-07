import { ActionButton } from "../legacy-ui/ActionButton";
import { BootstrapCard, BootstrapCardHeader } from "../legacy-ui/BootstrapCard";

const filters = [
  {
    id: "customerTypeFilter",
    label: "Customer Type",
    type: "select",
    options: ["All Types", "Retail", "Wholesale", "Distributor"],
  },
  {
    id: "statusFilter",
    label: "Status",
    type: "select",
    options: ["All Statuses", "Active", "Inactive", "Blacklisted"],
  },
  {
    id: "customerSearch",
    label: "Customer Search",
    type: "input",
    placeholder: "Search name, email, or phone...",
  },
  {
    id: "locationSearch",
    label: "Location Search",
    type: "input",
    placeholder: "Search city or address...",
  },
];

const modalReadOnlyFields = [
  ["editCustomerDisplayId", "Customer ID"],
  ["editCustomerName", "Customer Name"],
  ["editCustomerPhone", "Phone"],
  ["editCustomerEmail", "Email"],
  ["editCustomerLocation", "Location"],
  ["editCustomerType", "Customer Type"],
  ["editCustomerOrders", "Total Orders"],
  ["editCustomerRegDate", "Registration Date"],
  ["editCustomerLastOrderDate", "Last Order Date"],
];

export function CrmCustomerFilterPage() {
  return (
    <div className="container-fluid px-0 py-3">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-2 border-bottom">
        <div>
          <h1 className="h3 mb-1">Customer Filter</h1>
          <p className="text-muted mb-0">Search by customer details, region, or status.</p>
        </div>
      </div>

      <BootstrapCard
        className="mb-4"
        header={
          <BootstrapCardHeader
            title="Filter Customers"
            subtitle="Search by customer details, region, or status."
            action={
              <ActionButton id="resetFiltersBtn" variant="outline-secondary" size="sm">
                Reset Filters
              </ActionButton>
            }
          />
        }
      >
        <div className="row g-3">
          {filters.map((filter) => (
            <div className="col-12 col-sm-6 col-lg-3" key={filter.id}>
              <label htmlFor={filter.id} className="form-label fw-bold">
                {filter.label}
              </label>
              {filter.type === "select" ? (
                <select id={filter.id} className="form-select">
                  {filter.options?.map((option, index) => (
                    <option key={option} value={index === 0 ? "" : option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input type="text" id={filter.id} className="form-control" placeholder={filter.placeholder} />
              )}
            </div>
          ))}
        </div>
      </BootstrapCard>

      <BootstrapCard
        bodyClassName="card-body p-0"
        header={
          <div className="card-header bg-white py-3">
            <h5 className="mb-1">Customer Directory</h5>
            <p id="tableInfoText" className="text-muted small mb-0">
              Showing customer records.
            </p>
          </div>
        }
      >
        <div className="table-responsive">
          <table className="table table-hover table-striped align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Customer ID</th>
                <th>Name</th>
                <th>Contact Info</th>
                <th>Location</th>
                <th>Type</th>
                <th>Total Orders</th>
                <th>Status</th>
                <th className="text-end text-right">Actions</th>
              </tr>
            </thead>
            <tbody id="customersTableBody">
              <tr id="loadingRow" style={{ display: "none" }}>
                <td colSpan={8} className="text-center text-muted py-4">
                  Loading customers...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </BootstrapCard>

      <div className="modal fade" id="editCustomerModal" tabIndex={-1} aria-labelledby="editCustomerModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="editCustomerModalLabel">Edit Customer Status</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form id="editCustomerForm">
                <input type="hidden" id="editCustomerId" />
                <div className="row">
                  {modalReadOnlyFields.map(([id, label]) => (
                    <div className="col-md-6 mb-3" key={id}>
                      <label className="form-label fw-bold">{label}</label>
                      <input type="text" className="form-control bg-light" id={id} readOnly />
                    </div>
                  ))}
                </div>
                <hr />
                <div className="mb-3">
                  <label htmlFor="editCustomerStatus" className="form-label fw-bold">Active Status</label>
                  <select className="form-select" id="editCustomerStatus">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Blacklisted">Blacklisted</option>
                  </select>
                  <small className="text-muted">This is the only field you can modify here.</small>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" className="btn btn-primary" id="saveCustomerBtn">Save changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
