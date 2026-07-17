"use client";

import { useState, useEffect, useMemo } from "react";
import { Sidebar } from "@/app/components/Sidebar";
import { PageShell } from "@/app/components/ui/PageShell";
import { ActionButton } from "@/app/components/legacy-ui/ActionButton";
import { TableShell } from "@/app/components/legacy-ui/TableShell";
import { fetchCustomers, fetchOrders, fetchProductionPlans, Customer } from "@/lib/api";
import "./customers.css";

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
  pageClass: "production-customers-page",
  title: "Select Customer",
  subtitle: "Choose a customer first, then create a production plan from that customer's order items.",
  eyebrow: "Customer Catalog",
  overviewTitle: "Customers with Active Orders",
  overviewText: "Review each customer's open order quantity, delivery pressure, and order items before planning.",
  sectionTitle: "Customer List",
  resultId: "customerCatalogResultText",
  gridId: "productionCustomerGridReact",
  gridClass: "production-customer-grid",
  loadingText: "Loading customers...",
  modalId: "customerDetailModal",
  tableHeaders: ["Order No", "Product", "Color Sets", "Qty", "Delivery", "Priority", "Plan Status"],
  tableColSpan: 7,
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
};

const optionValues: Record<string, string> = {
  "All Types": "",
  "All Priorities": "",
  "Nearest Delivery Date": "deliveryDate",
  "Customer Name": "customerName",
  "Quantity High to Low": "quantityHigh",
  "Order Count": "orderCount",
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
  item,
  onClose,
}: {
  item: any | null;
  onClose: () => void;
}) {
  if (!item) return null;

  const getSummaryValue = (id: string) => {
    if (id === "customerDetailCode") return item.code || item.company || "-";
    if (id === "customerDetailPhone") return item.phone || "-";
    if (id === "customerDetailAddress") return item.address || "-";
    if (id === "customerDetailQty") return `${item.totalQty.toLocaleString()} pcs`;
    return "-";
  };

  const createPlanHref = `/Production/Customer/CreateCustomer?customerId=${item.id}`;
  const unplannedOrders = item.orders?.filter((o: any) => !o.planStatus || o.planStatus === "No Plan");

  return (
    <div className="pp-modal" id={catalogConfig.modalId} style={{ display: "block" }}>
      <div className="pp-modal-backdrop customers-modal-backdrop" onClick={onClose} />

      <div className="pp-modal-panel large customer-detail-modal-panel">
        <div className="pp-modal-header">
          <div>
            <h2>{item.name}</h2>
            <p>{item.orderCount} open order items ready for planning.</p>
          </div>
          <button type="button" className="modal-close-btn border-0 bg-transparent fs-20 fw-bold cursor-pointer" onClick={onClose}>&times;</button>
        </div>

        <div className="pp-modal-body">
          <div className="customer-detail-summary-grid">
            {catalogConfig.modalSummary.map(([label, id]) => (
              <div key={id as string}>
                <span>{label}</span>
                <strong id={id as string}>{getSummaryValue(id as string)}</strong>
              </div>
            ))}
          </div>

          <div className="unplanned-summary-container">
            <h4 className="unplanned-header">
              <span style={{ fontSize: "16px" }}>📋</span>
              Unplanned Orders (Left to Process)
            </h4>
            
            {unplannedOrders?.length > 0 ? (
              <div className="unplanned-list">
                {unplannedOrders.map((order: any) => (
                  <div key={order.id} className="unplanned-item">
                    <img 
                      src={order.productImage || "/images/products/place-holder.png"} 
                      className="unplanned-item-img"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/images/products/place-holder.png"; }}
                      alt={order.productName}
                    />
                    <div className="unplanned-item-content">
                      <div className="unplanned-item-header">
                        <strong className="unplanned-item-title">{order.productName}</strong>
                        <span className="unplanned-item-subtitle">{order.orderNo}</span>
                      </div>
                      <div className="unplanned-item-details">
                        <span>Variant: {order.variant}</span>
                        <span>Qty: <strong>{order.quantity} pcs</strong></span>
                      </div>
                      <div className="unplanned-item-date">
                        Delivery Date: <strong>{new Date(order.deliveryDate).toLocaleDateString("en-US", { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="mt-3">
                  <ActionButton href={createPlanHref} variant="primary" className="w-100 justify-content-center">
                    Create Production Plan &rarr;
                  </ActionButton>
                </div>
              </div>
            ) : (
              <div className="all-planned-message">
                <span style={{ fontSize: "24px" }}>✅</span>
                All orders for this customer have active production plans.
              </div>
            )}
          </div>

          <div className="open-items-container">
            <h4 className="open-items-title">Open Items Summary</h4>
            {item.orders?.map((order: any) => (
              <article className="open-item-card" key={order.id}>
                <div className="open-item-left">
                  <img 
                    src={order.productImage || "/images/products/place-holder.png"} 
                    className="open-item-img"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/images/products/place-holder.png"; }}
                    alt={order.productName}
                  />
                  <div>
                    <strong className="open-item-text">{order.productName}</strong>
                    <span className="open-item-subtext">{order.orderNo} | {order.quantity} pcs | {order.variant}</span>
                  </div>
                </div>
                <div>
                  {order.planStatus && order.planStatus !== "No Plan" ? (
                    <span className="plan-badge plan-badge-active">
                      Plan: {order.planStatus}
                    </span>
                  ) : (
                    <span className="plan-badge plan-badge-unplanned">
                      Unplanned
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>

          <TableShell
            headers={catalogConfig.tableHeaders}
            tableClassName="pp-table compact-table customer-detail-orders-table"
          >
            {item.orders?.length > 0 ? (
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
                  <td>
                    {order.planStatus && order.planStatus !== "No Plan" ? (
                      <span className="plan-badge-table">{order.planStatus}</span>
                    ) : (
                      <span className="plan-badge-table-unplanned">Unplanned</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={catalogConfig.tableColSpan} className="empty-cell">No orders found.</td>
              </tr>
            )}
          </TableShell>
        </div>
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<(Customer & { orderCount: number; totalQty: number; orders: any[]; highestPriority: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  // Filters State
  const [searchText, setSearchText] = useState("");
  const [filter1, setFilter1] = useState("");
  const [filter2, setFilter2] = useState("");
  const [sortBy, setSortBy] = useState("deliveryDate");

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchCustomers(), fetchOrders(), fetchProductionPlans()]).then(([custs, ords, plans]) => {
      const combined = custs.map(c => {
        const cOrders = ords.filter(o => o.customerId === c.id);
        const mappedOrders: any[] = [];
        
        cOrders.forEach((o, oIdx) => {
          if (o.items) {
            o.items.forEach((item, itemIdx) => {
              // Find matching plan product status
              let planStatus = "No Plan";
              let planId = "";
              const matchedPlan = plans.find(plan => 
                plan.products?.some((p: any) => 
                  p.orderNo === o.orderNumber && 
                  p.productName.toLowerCase() === item.productName.toLowerCase() &&
                  (!item.variant || p.variant.toLowerCase() === item.variant.toLowerCase())
                )
              );
              
              if (matchedPlan) {
                const planProd = matchedPlan.products.find((p: any) => 
                  p.orderNo === o.orderNumber && 
                  p.productName.toLowerCase() === item.productName.toLowerCase()
                );
                planStatus = planProd?.status || matchedPlan.status || "Active";
                planId = matchedPlan.planId || matchedPlan.id;
              }

              mappedOrders.push({
                id: `${o.id || 'order'}-${oIdx}-${itemIdx}-${item.productName}-${item.quantity}`,
                orderNo: o.orderNumber,
                productName: item.productName,
                variant: item.variant || "Standard",
                quantity: item.quantity,
                deliveryDate: o.dueDate,
                priority: o.priority || "Normal",
                planStatus,
                planId,
                productImage: item.productImage
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
  }, []);

  const filteredCustomers = useMemo(() => {
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
  }, [customers, searchText, filter1, filter2, sortBy]);

  // Compute KPI values
  const getStatValue = (id: string) => {
    if (id === "customerCatalogTotalCustomers") return customers.length;
    if (id === "customerCatalogTotalOrders") return customers.reduce((sum, c) => sum + c.orderCount, 0);
    if (id === "customerCatalogTotalQty") return customers.reduce((sum, c) => sum + c.totalQty, 0).toLocaleString();
    if (id === "customerCatalogUrgentCount") {
      return customers.reduce((sum, c) => sum + c.orders.filter(o => o.priority === "Urgent").length, 0);
    }
    return 0;
  };

  const resultText = `Showing ${filteredCustomers.length} customer${filteredCustomers.length === 1 ? "" : "s"} with production-ready orders.`;

  return (
    <PageShell sidebar={<Sidebar section="production" pathname="/Production/Customer/Customers" />}>
      <div className={`pp-page ${catalogConfig.pageClass}`}>
        <div className="pp-page-header">
          <div>
            <h1>{catalogConfig.title}</h1>
            <p>{catalogConfig.subtitle}</p>
          </div>

          <div className="pp-header-actions">
            <ActionButton href="/Production/Create">Change Demand Type</ActionButton>
            <ActionButton href="/Production/Index">Back to Plans</ActionButton>
          </div>
        </div>

        <section className="pp-card customer-catalog-overview-card">
          <div className="customer-catalog-overview">
            <div>
              <span className="catalog-eyebrow">{catalogConfig.eyebrow}</span>
              <h2>{catalogConfig.overviewTitle}</h2>
              <p>{catalogConfig.overviewText}</p>
            </div>

            <div className="customer-catalog-stats">
              {catalogConfig.stats.map((stat) => (
                <div key={stat.id}>
                  <span>{stat.label}</span>
                  <strong id={stat.id}>{getStatValue(stat.id)}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pp-card customer-catalog-filter-card">
          <div className="customer-catalog-filter-grid">
            {catalogConfig.filters.map((field) => {
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
                  field={field as FilterConfig}
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
              <h2>{catalogConfig.sectionTitle}</h2>
              <p id={catalogConfig.resultId}>{resultText}</p>
            </div>
          </div>

          <div id={catalogConfig.gridId} className={catalogConfig.gridClass}>
            {loading ? (
              <div className="empty-cell">{catalogConfig.loadingText}</div>
            ) : filteredCustomers.length > 0 ? (
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
                      <a className="btn btn-primary w-100 text-center" href={`/Production/Customer/CreateCustomer?customerId=${c.id}`}>
                        Create Plan
                      </a>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-cell">No customers found.</div>
            )}
          </div>
        </section>
      </div>

      <CatalogModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </PageShell>
  );
}
