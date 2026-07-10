"use client";

import { useState, useEffect, useMemo } from "react";
import { ActionButton } from "../../legacy-ui/ActionButton";
import { TableShell } from "../../legacy-ui/TableShell";
import { fetchCustomers, fetchOrders, Customer } from "../../../../lib/api";

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
    gridId: "productionCustomerGridReact",
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
        placeholder: "Search name, company, phone, location, order no...",
      },
      {
        id: "customerCatalogTypeFilter",
        label: "Customer Type",
        type: "select",
        options: ["All Types", "Retail", "Wholesale", "Distributor"],
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

function FilterField({
  field,
  value,
  onChange,
}: {
  field: FilterConfig;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="form-group">
      <label htmlFor={field.id}>{field.label}</label>
      {field.type === "input" ? (
        <input
          type="text"
          id={field.id}
          className="form-control"
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <select
          id={field.id}
          className="form-control"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
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

function CatalogModal({
  kind,
  item,
  onClose,
}: {
  kind: CatalogKind;
  item: any | null;
  onClose: () => void;
}) {
  if (!item) return null;
  const config = catalogConfig[kind];

  const getSummaryValue = (id: string) => {
    if (id === "customerDetailCode" || id === "outletCatalogDetailCode") return item.code || item.company || "-";
    if (id === "customerDetailPhone") return item.phone || "-";
    if (id === "customerDetailAddress") return item.address || "-";
    if (id === "customerDetailQty" || id === "outletCatalogDetailQty") return `${item.totalQty.toLocaleString()} pcs`;
    if (id === "outletCatalogDetailManager") return item.manager || "-";
    if (id === "outletCatalogDetailLocation") return item.location || "-";
    return "-";
  };

  const createPlanHref = kind === "customer"
    ? `/Production/Customer/CreateCustomer?customerId=${item.id}`
    : `/Production/Outlet/CreateOutlet?outletId=${item.id}`;

  return (
    <div className="pp-modal" id={config.modalId} style={{ display: "block" }}>
      <div className="pp-modal-backdrop" onClick={onClose} />

      <div className="pp-modal-panel large customer-detail-modal-panel">
        <div className="pp-modal-header">
          <div>
            <h2>{item.name}</h2>
            <p>{kind === "customer" ? `${item.orderCount} open order items` : `${item.demandCount} open demand items`} ready for planning.</p>
          </div>

          <button type="button" className="modal-close-btn border-0 bg-transparent fs-20 fw-bold cursor-pointer" onClick={onClose}>&times;</button>
        </div>

        <div className="pp-modal-body">
          <div className="customer-detail-summary-grid">
            {config.modalSummary.map(([label, id]) => (
              <div key={id}>
                <span>{label}</span>
                <strong id={id}>{getSummaryValue(id)}</strong>
              </div>
            ))}
          </div>

          <div className="customer-detail-action-row mb-4">
            <ActionButton href={createPlanHref} variant="primary" className="w-100">
              Create Plan
            </ActionButton>
          </div>

          <div className="customer-detail-products mb-4" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {kind === "customer" ? (
              item.orders?.map((order: any) => (
                <article className="customer-detail-product-ref" key={order.id} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <div>
                    <strong>{order.productName}</strong>
                    <span className="d-block text-muted text-xs">{order.orderNo} | {order.quantity} pcs | {order.variant}</span>
                  </div>
                </article>
              ))
            ) : (
              item.demands?.map((demand: any) => (
                <article className="customer-detail-product-ref" key={demand.id} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <div>
                    <strong>{demand.productName}</strong>
                    <span className="d-block text-muted text-xs">{demand.demandNo} | {demand.suggestedQty} pcs | {demand.variant}</span>
                  </div>
                </article>
              ))
            )}
          </div>

          <TableShell
            headers={config.tableHeaders}
            tableClassName="pp-table compact-table customer-detail-orders-table"
          >
            {kind === "customer" ? (
              item.orders?.length > 0 ? (
                item.orders.map((order: any) => (
                  <tr key={order.id}>
                    <td><strong>{order.orderNo}</strong></td>
                    <td>{order.productName}</td>
                    <td>{order.variant}</td>
                    <td>{order.quantity}</td>
                    <td>{new Date(order.deliveryDate).toLocaleDateString("en-US", { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td>
                      <span className={`priority-badge ${order.priority === "Urgent" ? "priority-urgent" : "priority-normal"}`}>
                        {order.priority}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={config.tableColSpan} className="empty-cell">{config.emptyTableText}</td>
                </tr>
              )
            ) : (
              item.demands?.length > 0 ? (
                item.demands.map((demand: any) => (
                  <tr key={demand.id}>
                    <td><strong>{demand.demandNo}</strong></td>
                    <td>{demand.productName}</td>
                    <td>{demand.variant}</td>
                    <td>{demand.suggestedQty}</td>
                    <td>{new Date(demand.requiredDate).toLocaleDateString("en-US", { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td>
                      <span className={`priority-badge ${demand.stockStatus === "Critical" ? "priority-urgent" : "priority-normal"}`}>
                        {demand.stockStatus}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={config.tableColSpan} className="empty-cell">{config.emptyTableText}</td>
                </tr>
              )
            )}
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

  const [customers, setCustomers] = useState<(Customer & { orderCount: number; totalQty: number; orders: any[]; highestPriority: string })[]>([]);
  const [outlets, setOutlets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  // Filters State
  const [searchText, setSearchText] = useState("");
  const [filter1, setFilter1] = useState("");
  const [filter2, setFilter2] = useState("");
  const [sortBy, setSortBy] = useState(kind === "customer" ? "deliveryDate" : "requiredDate");

  // Re-initialize state when kind changes
  useEffect(() => {
    setSearchText("");
    setFilter1("");
    setFilter2("");
    setSortBy(kind === "customer" ? "deliveryDate" : "requiredDate");
    setSelectedItem(null);
  }, [kind]);

  useEffect(() => {
    if (kind === "customer") {
      setLoading(true);
      Promise.all([fetchCustomers(), fetchOrders()]).then(([custs, ords]) => {
        const combined = custs.map(c => {
          const cOrders = ords.filter(o => o.customerId === c.id);
          const mappedOrders: any[] = [];
          
          cOrders.forEach(o => {
            if (o.items) {
              o.items.forEach(item => {
                mappedOrders.push({
                  id: `${o.id}-${item.productName}-${item.quantity}`,
                  orderNo: o.orderNumber,
                  productName: item.productName,
                  variant: (item as any).variant || "Standard Color",
                  quantity: item.quantity,
                  deliveryDate: o.dueDate,
                  priority: (o as any).priority || "Normal",
                });
              });
            }
          });

          const totalQty = mappedOrders.reduce((sum, item) => sum + (item.quantity || 0), 0);
          const highestPriority = mappedOrders.some(item => item.priority === "Urgent") ? "Urgent" : "Normal";

          return {
            ...c,
            orderCount: cOrders.length,
            totalQty: totalQty || cOrders.length,
            orders: mappedOrders,
            highestPriority,
          };
        }).filter(c => c.orderCount > 0);
        
        setCustomers(combined);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    } else {
      setLoading(true);
      // Load outlet data from window variables
      const rawDemands = (window as any).outletDemandCatalogData || (window as any).outletDemands || [];
      const grouped: Record<string, any> = {};
      
      rawDemands.forEach((demand: any) => {
        const key = String(demand.outletId || demand.outletCode || demand.outletName);
        if (!grouped[key]) {
          grouped[key] = {
            id: demand.outletId,
            code: demand.outletCode || "OUT-001",
            name: demand.outletName,
            location: demand.outletLocation,
            manager: demand.outletManager,
            phone: demand.phone,
            demands: [],
            demandCount: 0,
            totalQty: 0,
            fastCount: 0,
            earliestRequired: demand.requiredDate,
            highestStockStatus: demand.stockStatus || "Low Stock"
          };
        }
        
        grouped[key].demands.push(demand);
        grouped[key].demandCount += 1;
        grouped[key].totalQty += Number(demand.suggestedQty || 0);
        
        if (demand.salesVelocity === "Fast") {
          grouped[key].fastCount += 1;
        }
        if (demand.requiredDate && (!grouped[key].earliestRequired || demand.requiredDate < grouped[key].earliestRequired)) {
          grouped[key].earliestRequired = demand.requiredDate;
        }
        
        const getWeight = (status: string) => {
          if (status === "Critical") return 1;
          if (status === "Low Stock") return 2;
          return 3;
        };
        if (getWeight(demand.stockStatus) < getWeight(grouped[key].highestStockStatus)) {
          grouped[key].highestStockStatus = demand.stockStatus;
        }
      });
      
      setOutlets(Object.values(grouped));
      setLoading(false);
    }
  }, [kind]);

  const filteredCustomers = useMemo(() => {
    if (kind !== "customer") return [];
    let result = [...customers];

    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q)) ||
        c.orders.some(o => o.orderNo.toLowerCase().includes(q) || o.productName.toLowerCase().includes(q))
      );
    }

    if (filter1) {
      result = result.filter(c => c.company === filter1);
    }

    if (filter2) {
      result = result.filter(c => c.orders.some(o => o.priority === filter2));
    }

    result.sort((a, b) => {
      if (sortBy === "customerName") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "quantityHigh") {
        return b.totalQty - a.totalQty;
      }
      if (sortBy === "orderCount") {
        return b.orderCount - a.orderCount;
      }
      // Sort by delivery date
      const aDate = a.orders.map(o => o.deliveryDate).filter(Boolean).sort()[0] || "";
      const bDate = b.orders.map(o => o.deliveryDate).filter(Boolean).sort()[0] || "";
      if (!aDate) return 1;
      if (!bDate) return -1;
      return aDate.localeCompare(bDate);
    });

    return result;
  }, [kind, customers, searchText, filter1, filter2, sortBy]);

  const filteredOutlets = useMemo(() => {
    if (kind !== "outlet") return [];
    let result = [...outlets];

    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      result = result.filter(o =>
        o.name.toLowerCase().includes(q) ||
        o.code.toLowerCase().includes(q) ||
        o.location.toLowerCase().includes(q) ||
        (o.manager && o.manager.toLowerCase().includes(q)) ||
        o.demands.some((d: any) => d.demandNo.toLowerCase().includes(q) || d.productName.toLowerCase().includes(q))
      );
    }

    if (filter1) {
      result = result.filter(o => o.highestStockStatus === filter1);
    }

    if (filter2) {
      result = result.filter(o => o.demands.some((d: any) => d.salesVelocity === filter2));
    }

    result.sort((a, b) => {
      if (sortBy === "outletName") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "quantityHigh") {
        return b.totalQty - a.totalQty;
      }
      if (sortBy === "demandCount") {
        return b.demandCount - a.demandCount;
      }
      // Sort by required date
      if (!a.earliestRequired) return 1;
      if (!b.earliestRequired) return -1;
      return a.earliestRequired.localeCompare(b.earliestRequired);
    });

    return result;
  }, [kind, outlets, searchText, filter1, filter2, sortBy]);

  // Compute KPI values
  const getStatValue = (id: string) => {
    if (kind === "customer") {
      if (id === "customerCatalogTotalCustomers") return customers.length;
      if (id === "customerCatalogTotalOrders") return customers.reduce((sum, c) => sum + c.orderCount, 0);
      if (id === "customerCatalogTotalQty") return customers.reduce((sum, c) => sum + c.totalQty, 0).toLocaleString();
      if (id === "customerCatalogUrgentCount") {
        return customers.reduce((sum, c) => sum + c.orders.filter(o => o.priority === "Urgent").length, 0);
      }
    } else {
      if (id === "outletCatalogTotalOutlets") return outlets.length;
      if (id === "outletCatalogTotalDemand") return outlets.reduce((sum, o) => sum + o.demandCount, 0);
      if (id === "outletCatalogTotalQty") return outlets.reduce((sum, o) => sum + o.totalQty, 0).toLocaleString();
      if (id === "outletCatalogCriticalCount") {
        return outlets.reduce((sum, o) => sum + o.demands.filter((d: any) => d.stockStatus === "Critical").length, 0);
      }
    }
    return 0;
  };

  const resultText = kind === "customer"
    ? `Showing ${filteredCustomers.length} customer${filteredCustomers.length === 1 ? "" : "s"} with production-ready orders.`
    : `Showing ${filteredOutlets.length} outlet${filteredOutlets.length === 1 ? "" : "s"} with replenishment demand.`;

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
                  <strong id={stat.id}>{getStatValue(stat.id)}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pp-card customer-catalog-filter-card">
          <div className={filterGridClass}>
            {config.filters.map((field) => {
              let value = "";
              let onChange = (val: string) => {};
              if (field.id.endsWith("Search")) {
                value = searchText;
                onChange = setSearchText;
              } else if (field.id.endsWith("TypeFilter") || field.id.endsWith("StatusFilter")) {
                value = filter1;
                onChange = setFilter1;
              } else if (field.id.endsWith("PriorityFilter") || field.id.endsWith("VelocityFilter")) {
                value = filter2;
                onChange = setFilter2;
              } else if (field.id.endsWith("Sort")) {
                value = sortBy;
                onChange = setSortBy;
              }
              return (
                <FilterField
                  field={field}
                  value={value}
                  onChange={onChange}
                  key={field.id}
                />
              );
            })}
          </div>
        </section>

        <section className="customer-catalog-section">
          <div className="catalog-section-header">
            <div>
              <h2>{config.sectionTitle}</h2>
              <p id={config.resultId}>{resultText}</p>
            </div>
          </div>

          <div id={config.gridId} className={config.gridClass}>
            {loading ? (
              <div className="empty-cell">{config.loadingText}</div>
            ) : kind === "customer" ? (
              filteredCustomers.length > 0 ? (
                filteredCustomers.map(c => (
                  <article key={c.id} className="production-customer-card">
                    <div className="production-customer-identity">
                      <div className="production-customer-avatar">{c.name.charAt(0)}</div>
                      <div>
                        <span className="customer-code">{c.company || "Retail"}</span>
                        <h3>{c.name}</h3>
                      </div>
                    </div>
                    <div className="production-customer-body">
                      <p>{c.address || "No Address Provided"}</p>
                      <div className="production-customer-meta-grid">
                        <div><span>Open Orders</span><strong>{c.orderCount}</strong></div>
                        <div><span>Phone</span><strong>{c.phone}</strong></div>
                      </div>
                      <div className="production-customer-actions mt-3 d-flex gap-2">
                        <button type="button" className="btn btn-light w-100" onClick={() => setSelectedItem(c)}>
                          View More
                        </button>
                        <a className="btn btn-primary w-100" href={`/Production/Customer/CreateCustomer?customerId=${c.id}`}>
                          Create Plan
                        </a>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-cell">No customers found.</div>
              )
            ) : (
              filteredOutlets.length > 0 ? (
                filteredOutlets.map(o => (
                  <article key={o.id} className="production-customer-card production-outlet-card">
                    <div className="production-customer-identity">
                      <div className="production-customer-avatar">{o.name.charAt(0)}</div>
                      <div>
                        <span className="customer-code">{o.code}</span>
                        <h3>{o.name}</h3>
                      </div>
                      <span className={`priority-badge ${o.highestStockStatus === "Critical" ? "priority-urgent" : "priority-normal"}`}>
                        {o.highestStockStatus}
                      </span>
                    </div>
                    <div className="production-customer-body">
                      <div className="production-customer-heading">
                        <span className="customer-type">{o.manager || "Manager not set"}</span>
                        <span className="customer-next-item">{o.demands[0]?.productName || "No active demand"}</span>
                      </div>
                      <p>{o.location || "No Location Provided"}</p>
                      <div className="production-customer-meta-grid">
                        <div><span>Demand Items</span><strong>{o.demandCount}</strong></div>
                        <div><span>Total Suggested</span><strong>{o.totalQty.toLocaleString()} pcs</strong></div>
                        <div>
                          <span>Required Date</span>
                          <strong>
                            {o.earliestRequired ? new Date(o.earliestRequired).toLocaleDateString("en-US", { day: '2-digit', month: 'short' }) : "-"}
                          </strong>
                        </div>
                      </div>
                      <div className="production-customer-actions mt-3 d-flex gap-2">
                        <button type="button" className="btn btn-light w-100" onClick={() => setSelectedItem(o)}>
                          View More
                        </button>
                        <a className="btn btn-primary w-100" href={`/Production/Outlet/CreateOutlet?outletId=${o.id}`}>
                          Create Plan
                        </a>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-cell">No outlets found.</div>
              )
            )}
          </div>
        </section>
      </div>

      <CatalogModal
        kind={kind}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
}
