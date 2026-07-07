import { ActionButton } from "../legacy-ui/ActionButton";
import { TableShell } from "../legacy-ui/TableShell";

type SelectFilter = {
  id: string;
  label: string;
  options: string[];
};

const demandTypeOptions = [
  "All Demand Types",
  "Customer Order",
  "Outlet Replenishment",
  "In-house Stock",
];

const statusOptions = [
  "All Statuses",
  "Draft",
  "Material Check",
  "Cutting",
  "Stitching",
  "Finishing",
  "Quality Check",
  "Packing",
  "Completed",
  "On Hold",
];

const selectFilters: SelectFilter[] = [
  { id: "demandTypeFilter", label: "Demand Type", options: demandTypeOptions },
  { id: "statusFilter", label: "Status", options: statusOptions },
];

const searchFilters = [
  {
    id: "fromDateFilter",
    label: "From Date (BS)",
    className: "form-control nepali-date",
    placeholder: "DD-MM-YYYY",
    readOnly: true,
  },
  {
    id: "toDateFilter",
    label: "To Date (BS)",
    className: "form-control nepali-date",
    placeholder: "DD-MM-YYYY",
    readOnly: true,
  },
  {
    id: "productSearch",
    label: "Product Search",
    className: "form-control",
    placeholder: "Search product name...",
    readOnly: false,
  },
  {
    id: "sourceSearch",
    label: "Source Search",
    className: "form-control",
    placeholder: "Search customer, outlet, warehouse...",
    readOnly: false,
  },
];

function optionValue(label: string) {
  return label.startsWith("All ") ? "" : label;
}

function SelectFilterField({ filter }: { filter: SelectFilter }) {
  return (
    <div className="form-group">
      <label htmlFor={filter.id}>{filter.label}</label>
      <select id={filter.id} className="form-control" defaultValue="">
        {filter.options.map((option) => (
          <option value={optionValue(option)} key={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextFilterField({ filter }: { filter: (typeof searchFilters)[number] }) {
  return (
    <div className="form-group">
      <label htmlFor={filter.id}>{filter.label}</label>
      <input
        type="text"
        id={filter.id}
        className={filter.className}
        placeholder={filter.placeholder}
        readOnly={filter.readOnly}
      />
    </div>
  );
}

export function ProductionPlansListPage() {
  return (
    <div className="plans-page">
      <div className="plans-page-header">
        <div>
          <h1>Production Plans</h1>
          <p>Select a plan from the list and use the quick reference before opening the full details or edit screen.</p>
        </div>

        <div className="plans-header-actions">
          <ActionButton href="/Production/Create" variant="primary">
            + Create Production Plan
          </ActionButton>
        </div>
      </div>

      <input type="hidden" id="selectedPlanNoFromRoute" value="PP-20260529-001" />

      <div className="pp-card">
        <div className="pp-card-header">
          <div>
            <h2>Filter Production Plans</h2>
            <p>Search by product, source, demand type, status, or date range.</p>
          </div>

          <ActionButton id="resetFiltersBtn">Reset Filters</ActionButton>
        </div>

        <div className="pp-filter-grid">
          {selectFilters.map((filter) => (
            <SelectFilterField filter={filter} key={filter.id} />
          ))}
          {searchFilters.map((filter) => (
            <TextFilterField filter={filter} key={filter.id} />
          ))}
        </div>
      </div>

      <div className="plan-view-toolbar" role="group" aria-label="Production plan view">
        <button type="button" className="view-toggle-btn active" data-plan-view="table">
          Table View
        </button>
        <button type="button" className="view-toggle-btn" data-plan-view="card">
          Card View
        </button>
      </div>

      <section className="plans-table-card" id="planTableView">
        <div className="plans-card-header">
          <div>
            <h2>Plan Table</h2>
            <p>Scan production plans quickly and open the full details when needed.</p>
          </div>
        </div>

        <TableShell
          bodyId="planTableBody"
          headers={["Plan No", "Demand Type", "Source", "Products", "Total Qty", "Required Range", "Status", "Risk", "Actions"]}
          tableClassName="plan-table"
          wrapperClassName="table-wrap"
        >
          <tr>
            <td colSpan={9} className="empty-cell">Loading plans...</td>
          </tr>
        </TableShell>

        <div id="planTablePagination" className="plan-pagination" />
      </section>

      <div className="plans-detail-layout hidden" id="planCardView">
        <section className="plans-list-card">
          <div className="plans-card-header">
            <div>
              <h2>Plan Cards</h2>
              <p>One card represents one production plan.</p>
            </div>
          </div>

          <div id="planList" className="plan-list">
            <div className="empty-cell">Loading plans...</div>
          </div>

          <div id="planPagination" className="plan-pagination" />
        </section>

        <section className="plan-detail-card">
          <div className="plans-card-header">
            <div>
              <h2>Plan Detail</h2>
              <p>Selected plan summary and quick product reference.</p>
            </div>

            <div className="plans-detail-actions">
              <ActionButton id="viewPlanDetailsBtn" href="/Production/Plan/Details">
                View Details
              </ActionButton>
              <ActionButton id="editPlanBtn" href="/Production/Plan/Edit" variant="primary">
                Edit
              </ActionButton>
            </div>
          </div>

          <div id="planDetailBody" className="plan-detail-body">
            <div className="empty-cell">Select a plan to view details.</div>
          </div>
        </section>
      </div>
    </div>
  );
}
