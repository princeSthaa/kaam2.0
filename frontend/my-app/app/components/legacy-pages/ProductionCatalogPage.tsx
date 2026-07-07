import { ActionButton } from "../legacy-ui/ActionButton";
import { TableShell } from "../legacy-ui/TableShell";

type CatalogKind = "customer" | "outlet";

type FilterConfig = {
  id: string;
  label: string;
  type: "input" | "select";
  placeholder?: string;
  options?: string[];
};

type StatConfig = {
  label: string;
  id: string;
};

const catalogConfig = {
  customer: {
    pageClass: "production-customers-page",
    title: "Select Customer",
    subtitle: "Choose a customer first, then create a production plan from that customer's order items.",
    eyebrow: "Customer Catalog",
    overviewTitle: "Customers with Active Orders",
    overviewText: "Review each customer's open order quantity, delivery pressure, and order items before planning.",
    sectionTitle: "Customer List",
    resultId: "customerCatalogResultText",
    resultText: "Showing customers with production-ready orders.",
    gridId: "productionCustomerGrid",
    gridClass: "production-customer-grid",
    loadingText: "Loading customers...",
    modalId: "customerDetailModal",
    modalTitleId: "customerDetailName",
    modalSubtitleId: "customerDetailSubtitle",
    modalTitle: "Customer Detail",
    modalSubtitle: "Open order items for this customer.",
    createPlanLinkId: "customerDetailCreatePlanLink",
    createPlanHref: "/Production/Customer/CreateCustomer",
    productRefsId: "customerDetailProductRefs",
    emptyRefsText: "No product references found.",
    tableBodyId: "customerDetailOrdersBody",
    emptyTableText: "No orders found.",
    tableHeaders: ["Order No", "Product", "Color Sets", "Qty", "Delivery", "Priority"],
    tableColSpan: 6,
    stats: [
      { label: "Customers", id: "customerCatalogTotalCustomers" },
      { label: "Open Orders", id: "customerCatalogTotalOrders" },
      { label: "Total Qty", id: "customerCatalogTotalQty" },
      { label: "Urgent", id: "customerCatalogUrgentCount" },
    ] satisfies StatConfig[],
    filters: [
      {
        id: "customerCatalogSearch",
        label: "Search Customer",
        type: "input",
        placeholder: "Search name, code, phone, location, order no...",
      },
      {
        id: "customerCatalogTypeFilter",
        label: "Customer Type",
        type: "select",
        options: ["All Types", "School", "Retailer", "Business Customer"],
      },
      {
        id: "customerCatalogPriorityFilter",
        label: "Priority",
        type: "select",
        options: ["All Priorities", "Urgent", "Normal", "Seasonal"],
      },
      {
        id: "customerCatalogSort",
        label: "Sort By",
        type: "select",
        options: ["Nearest Delivery Date", "Customer Name", "Quantity High to Low", "Order Count"],
      },
    ] satisfies FilterConfig[],
    modalSummary: [
      ["Customer Code", "customerDetailCode"],
      ["Phone", "customerDetailPhone"],
      ["Location", "customerDetailAddress"],
      ["Total Qty", "customerDetailQty"],
    ],
  },
  outlet: {
    pageClass: "production-outlets-page production-customers-page",
    title: "Select Outlet",
    subtitle: "Choose an outlet first, then create a production plan from that outlet's replenishment demand.",
    eyebrow: "Outlet Catalog",
    overviewTitle: "Outlets with Replenishment Demand",
    overviewText: "Review open demand items, suggested quantity, stock pressure, and next required date before planning.",
    sectionTitle: "Outlet List",
    resultId: "outletCatalogResultText",
    resultText: "Showing outlets with replenishment demand.",
    gridId: "productionOutletGrid",
    gridClass: "production-customer-grid production-outlet-grid",
    loadingText: "Loading outlets...",
    modalId: "outletCatalogDetailModal",
    modalTitleId: "outletCatalogDetailName",
    modalSubtitleId: "outletCatalogDetailSubtitle",
    modalTitle: "Outlet Detail",
    modalSubtitle: "Open replenishment demand for this outlet.",
    createPlanLinkId: "outletCatalogCreatePlanLink",
    createPlanHref: "/Production/Outlet/CreateOutlet",
    productRefsId: "outletCatalogProductRefs",
    emptyRefsText: "No demand references found.",
    tableBodyId: "outletCatalogDetailDemandBody",
    emptyTableText: "No demand found.",
    tableHeaders: ["Demand No", "Product", "Color Sets", "Suggested", "Required", "Status"],
    tableColSpan: 6,
    stats: [
      { label: "Outlets", id: "outletCatalogTotalOutlets" },
      { label: "Demand Items", id: "outletCatalogTotalDemand" },
      { label: "Total Qty", id: "outletCatalogTotalQty" },
      { label: "Critical", id: "outletCatalogCriticalCount" },
    ] satisfies StatConfig[],
    filters: [
      {
        id: "outletCatalogSearch",
        label: "Search Outlet",
        type: "input",
        placeholder: "Search outlet, code, location, manager, product...",
      },
      {
        id: "outletCatalogStatusFilter",
        label: "Stock Status",
        type: "select",
        options: ["All Status", "Critical", "Low Stock", "Reorder Soon"],
      },
      {
        id: "outletCatalogVelocityFilter",
        label: "Sales Velocity",
        type: "select",
        options: ["All Velocity", "Fast", "Normal", "Slow"],
      },
      {
        id: "outletCatalogSort",
        label: "Sort By",
        type: "select",
        options: ["Nearest Required Date", "Suggested Qty High to Low", "Demand Count", "Outlet Name"],
      },
    ] satisfies FilterConfig[],
    modalSummary: [
      ["Outlet Code", "outletCatalogDetailCode"],
      ["Manager", "outletCatalogDetailManager"],
      ["Location", "outletCatalogDetailLocation"],
      ["Total Qty", "outletCatalogDetailQty"],
    ],
  },
};

const optionValues: Record<string, string> = {
  "All Types": "",
  "All Priorities": "",
  "All Status": "",
  "All Velocity": "",
  "Nearest Delivery Date": "deliveryDate",
  "Customer Name": "customerName",
  "Quantity High to Low": "quantityHigh",
  "Order Count": "orderCount",
  "Nearest Required Date": "requiredDate",
  "Suggested Qty High to Low": "quantityHigh",
  "Demand Count": "demandCount",
  "Outlet Name": "outletName",
};

function FilterField({ field }: { field: FilterConfig }) {
  return (
    <div className="form-group">
      <label htmlFor={field.id}>{field.label}</label>
      {field.type === "input" ? (
        <input type="text" id={field.id} className="form-control" placeholder={field.placeholder} />
      ) : (
        <select id={field.id} className="form-control" defaultValue={optionValues[field.options?.[0] ?? ""] ?? ""}>
          {field.options?.map((option) => (
            <option value={optionValues[option] ?? option} key={option}>
              {option}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

function CatalogModal({ kind }: { kind: CatalogKind }) {
  const config = catalogConfig[kind];

  return (
    <div className="pp-modal hidden" id={config.modalId}>
      <div className="pp-modal-backdrop" data-close-modal={config.modalId} />

      <div className="pp-modal-panel large customer-detail-modal-panel">
        <div className="pp-modal-header">
          <div>
            <h2 id={config.modalTitleId}>{config.modalTitle}</h2>
            <p id={config.modalSubtitleId}>{config.modalSubtitle}</p>
          </div>

          <button type="button" className="modal-close-btn" data-close-modal={config.modalId}>x</button>
        </div>

        <div className="pp-modal-body">
          <div className="customer-detail-summary-grid">
            {config.modalSummary.map(([label, id]) => (
              <div key={id}>
                <span>{label}</span>
                <strong id={id}>-</strong>
              </div>
            ))}
          </div>

          <div className="customer-detail-action-row">
            <ActionButton id={config.createPlanLinkId} href={config.createPlanHref} variant="primary">
              Create Plan
            </ActionButton>
          </div>

          <div className="customer-detail-products" id={config.productRefsId}>
            <div className="empty-cell">{config.emptyRefsText}</div>
          </div>

          <TableShell
            bodyId={config.tableBodyId}
            headers={config.tableHeaders}
            tableClassName="pp-table compact-table customer-detail-orders-table"
          >
            <tr>
              <td colSpan={config.tableColSpan} className="empty-cell">
                {config.emptyTableText}
              </td>
            </tr>
          </TableShell>
        </div>
      </div>
    </div>
  );
}

export function ProductionCatalogPage({ kind }: { kind: CatalogKind }) {
  const config = catalogConfig[kind];
  const filterGridClass = kind === "outlet"
    ? "customer-catalog-filter-grid outlet-catalog-filter-grid"
    : "customer-catalog-filter-grid";

  return (
    <>
      <div className={`pp-page ${config.pageClass}`}>
        <div className="pp-page-header">
          <div>
            <h1>{config.title}</h1>
            <p>{config.subtitle}</p>
          </div>

          <div className="pp-header-actions">
            <ActionButton href="/Production/Create">Change Demand Type</ActionButton>
            <ActionButton href="/Production/Index">Back to Plans</ActionButton>
          </div>
        </div>

        <section className="pp-card customer-catalog-overview-card">
          <div className="customer-catalog-overview">
            <div>
              <span className="catalog-eyebrow">{config.eyebrow}</span>
              <h2>{config.overviewTitle}</h2>
              <p>{config.overviewText}</p>
            </div>

            <div className="customer-catalog-stats">
              {config.stats.map((stat) => (
                <div key={stat.id}>
                  <span>{stat.label}</span>
                  <strong id={stat.id}>0</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pp-card customer-catalog-filter-card">
          <div className={filterGridClass}>
            {config.filters.map((field) => (
              <FilterField field={field} key={field.id} />
            ))}
          </div>
        </section>

        <section className="customer-catalog-section">
          <div className="catalog-section-header">
            <div>
              <h2>{config.sectionTitle}</h2>
              <p id={config.resultId}>{config.resultText}</p>
            </div>
          </div>

          <div id={config.gridId} className={config.gridClass}>
            <div className="empty-cell">{config.loadingText}</div>
          </div>
        </section>
      </div>

      <CatalogModal kind={kind} />
    </>
  );
}
