"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { MaterialIcon } from "../ui/MaterialIcon";

type ProductionStage = {
  stageName: string;
  workCenter: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  status: "Completed" | "In Progress" | "Not Started" | "On Hold";
  completedQty: number;
  rejectedQty: number;
  remarks?: string;
};

type ProductionProduct = {
  productCode: string;
  productName: string;
  category: string;
  variant: string;
  quantity: number;
  sourceName: string;
  requiredDate: string;
  productImage: string;
  productionNotes: string;
  sizes: Array<{ size: string; quantity: number }>;
};

type ProductionPlan = {
  planNo: string;
  demandType: string;
  sourceName: string;
  productName: string;
  variant: string;
  quantity: number;
  priority: "Urgent" | "Normal" | "Seasonal";
  outputDestination: string;
  plannedStartDate: string;
  plannedCompletionDate: string;
  requiredDate: string;
  status: "Material Check" | "Cutting" | "On Hold";
  products: ProductionProduct[];
  stages: ProductionStage[];
};

const rackStages = [
  { key: "Material Check", label: "Material Check", icon: "inventory_2" },
  { key: "Cutting", label: "Cutting", icon: "content_cut" },
  { key: "Stitching / Sewing", label: "Stitching", icon: "design_services" },
  { key: "Finishing", label: "Finishing", icon: "checkroom" },
  { key: "Quality Check", label: "Quality Check", icon: "fact_check" },
  { key: "On Hold", label: "On Hold", icon: "pause_circle" },
] as const;

const inProgressPlans: ProductionPlan[] = [
  {
    planNo: "PP-20260529-002",
    demandType: "Outlet Replenishment",
    sourceName: "Multiple Outlets",
    productName: "Men Casual Shirt",
    variant: "White / Sky Blue / Black",
    quantity: 330,
    priority: "Urgent",
    outputDestination: "Outlet Transfer",
    plannedStartDate: "2026-06-03",
    plannedCompletionDate: "2026-06-12",
    requiredDate: "2026-06-25",
    status: "Cutting",
    products: [
      {
        productCode: "PRD-003",
        productName: "Men Casual Shirt",
        category: "Retail Garment",
        variant: "White / Sky Blue / Black",
        quantity: 120,
        sourceName: "New Road Outlet",
        requiredDate: "2026-06-22",
        productImage: "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=640&q=80",
        productionNotes: "Fast moving item. Replenish before weekend demand.",
        sizes: [
          { size: "M", quantity: 40 },
          { size: "L", quantity: 50 },
          { size: "XL", quantity: 30 },
        ],
      },
      {
        productCode: "PRD-004",
        productName: "Corporate Polo T-Shirt",
        category: "Corporate Wear",
        variant: "Black / Charcoal",
        quantity: 130,
        sourceName: "New Road Outlet",
        requiredDate: "2026-06-25",
        productImage: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=640&q=80",
        productionNotes: "Common corporate stock item. Keep enough sizes M and L.",
        sizes: [
          { size: "S", quantity: 25 },
          { size: "M", quantity: 45 },
          { size: "L", quantity: 40 },
          { size: "XL", quantity: 20 },
        ],
      },
      {
        productCode: "PRD-005",
        productName: "Hotel Staff Uniform",
        category: "Hospitality Uniform",
        variant: "Cream / Brown",
        quantity: 80,
        sourceName: "Pokhara Lakeside Outlet",
        requiredDate: "2026-06-24",
        productImage: "https://images.unsplash.com/photo-1585846416120-3a7354ed7d39?auto=format&fit=crop&w=640&q=80",
        productionNotes: "Tourism season demand. Prioritize hospitality uniform stock.",
        sizes: [
          { size: "S", quantity: 20 },
          { size: "M", quantity: 25 },
          { size: "L", quantity: 25 },
          { size: "XL", quantity: 10 },
        ],
      },
    ],
    stages: [
      {
        stageName: "Material Check",
        workCenter: "Raw Material Store",
        plannedStartDate: "2026-06-03",
        plannedEndDate: "2026-06-03",
        actualStartDate: "2026-06-03",
        actualEndDate: "2026-06-03",
        status: "Completed",
        completedQty: 330,
        rejectedQty: 0,
      },
      {
        stageName: "Cutting",
        workCenter: "Cutting Section",
        plannedStartDate: "2026-06-04",
        plannedEndDate: "2026-06-06",
        actualStartDate: "2026-06-04",
        status: "In Progress",
        completedQty: 180,
        rejectedQty: 4,
      },
      {
        stageName: "Stitching / Sewing",
        workCenter: "Sewing Line 1",
        plannedStartDate: "2026-06-07",
        plannedEndDate: "2026-06-10",
        status: "Not Started",
        completedQty: 0,
        rejectedQty: 0,
      },
    ],
  },
  {
    planNo: "PP-20260529-003",
    demandType: "In-house Stock",
    sourceName: "Finished Goods Warehouse",
    productName: "Hotel Staff Uniform",
    variant: "Cream / Brown",
    quantity: 220,
    priority: "Seasonal",
    outputDestination: "Finished Goods Warehouse",
    plannedStartDate: "2026-06-05",
    plannedCompletionDate: "2026-06-15",
    requiredDate: "2026-06-20",
    status: "Material Check",
    products: [
      {
        productCode: "PRD-005",
        productName: "Hotel Staff Uniform",
        category: "Hospitality Uniform",
        variant: "Cream / Brown",
        quantity: 220,
        sourceName: "Finished Goods Warehouse",
        requiredDate: "2026-06-20",
        productImage: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=640&q=80",
        productionNotes: "Seasonal in-house stock for hospitality clients.",
        sizes: [
          { size: "S", quantity: 45 },
          { size: "M", quantity: 80 },
          { size: "L", quantity: 65 },
          { size: "XL", quantity: 30 },
        ],
      },
    ],
    stages: [
      {
        stageName: "Material Check",
        workCenter: "Raw Material Store",
        plannedStartDate: "2026-06-05",
        plannedEndDate: "2026-06-05",
        actualStartDate: "2026-06-05",
        status: "In Progress",
        completedQty: 0,
        rejectedQty: 0,
      },
      {
        stageName: "Cutting",
        workCenter: "Cutting Section",
        plannedStartDate: "2026-06-06",
        plannedEndDate: "2026-06-08",
        status: "Not Started",
        completedQty: 0,
        rejectedQty: 0,
      },
    ],
  },
  {
    planNo: "PP-20260529-005",
    demandType: "Outlet Replenishment",
    sourceName: "Pokhara Lakeside Outlet",
    productName: "Hotel Staff Uniform",
    variant: "Cream / Brown",
    quantity: 80,
    priority: "Seasonal",
    outputDestination: "Outlet Transfer",
    plannedStartDate: "2026-06-08",
    plannedCompletionDate: "2026-06-16",
    requiredDate: "2026-06-24",
    status: "On Hold",
    products: [
      {
        productCode: "PRD-005",
        productName: "Hotel Staff Uniform",
        category: "Hospitality Uniform",
        variant: "Cream / Brown",
        quantity: 80,
        sourceName: "Pokhara Lakeside Outlet",
        requiredDate: "2026-06-24",
        productImage: "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=640&q=80",
        productionNotes: "Waiting for printed fabric confirmation.",
        sizes: [
          { size: "S", quantity: 20 },
          { size: "M", quantity: 25 },
          { size: "L", quantity: 25 },
          { size: "XL", quantity: 10 },
        ],
      },
    ],
    stages: [
      {
        stageName: "Material Check",
        workCenter: "Raw Material Store",
        plannedStartDate: "2026-06-08",
        plannedEndDate: "2026-06-08",
        status: "On Hold",
        completedQty: 0,
        rejectedQty: 0,
        remarks: "Waiting for printed fabric confirmation.",
      },
    ],
  },
];

const priorityOptions = ["All", "Urgent", "Normal", "Seasonal"] as const;
const sourceOptions = ["All", "Customer Order", "Outlet Replenishment", "In-house Stock"] as const;

function formatDate(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric" }).format(new Date(value));
}

function compactSizeList(product: ProductionProduct) {
  return product.sizes.map((item) => `${item.size}: ${item.quantity}`).join(", ");
}

function getActiveStage(plan: ProductionPlan) {
  const active = plan.stages.find((stage) => stage.status === "In Progress" || stage.status === "On Hold");
  return active ?? plan.stages[plan.stages.length - 1];
}

function getStageItems(plan: ProductionPlan, stageKey: string) {
  if (stageKey === "On Hold") {
    return plan.status === "On Hold" ? plan.products : [];
  }

  return getActiveStage(plan)?.stageName === stageKey ? plan.products : [];
}

function completionPercent(plan: ProductionPlan) {
  const activeStage = getActiveStage(plan);
  const completed = activeStage?.completedQty ?? 0;
  return Math.min(100, Math.round((completed / Math.max(plan.quantity, 1)) * 100));
}

export function ProductionInProgressVisualizationPage() {
  const [stageFilter, setStageFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState<(typeof priorityOptions)[number]>("All");
  const [sourceFilter, setSourceFilter] = useState<(typeof sourceOptions)[number]>("All");
  const [sortBy, setSortBy] = useState("requiredDate");
  const [query, setQuery] = useState("");
  const [selectedPlanNo, setSelectedPlanNo] = useState(inProgressPlans[0].planNo);
  const [savedMessage, setSavedMessage] = useState("");

  const filteredPlans = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return inProgressPlans
      .filter((plan) => stageFilter === "All" || plan.status === stageFilter || getActiveStage(plan)?.stageName === stageFilter)
      .filter((plan) => priorityFilter === "All" || plan.priority === priorityFilter)
      .filter((plan) => sourceFilter === "All" || plan.demandType === sourceFilter)
      .filter((plan) => {
        if (!normalizedQuery) return true;
        return [plan.planNo, plan.productName, plan.sourceName, plan.variant, plan.demandType]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort((a, b) => {
        if (sortBy === "quantity") return b.quantity - a.quantity;
        if (sortBy === "priority") return a.priority.localeCompare(b.priority);
        return new Date(a.requiredDate).getTime() - new Date(b.requiredDate).getTime();
      });
  }, [priorityFilter, query, sortBy, sourceFilter, stageFilter]);

  const selectedPlan = filteredPlans.find((plan) => plan.planNo === selectedPlanNo) ?? filteredPlans[0] ?? inProgressPlans[0];
  const selectedStage = getActiveStage(selectedPlan);
  const selectedProduct = selectedPlan.products[0];
  const totalQuantity = filteredPlans.reduce((sum, plan) => sum + plan.quantity, 0);
  const activeQuantity = filteredPlans.reduce((sum, plan) => sum + (getActiveStage(plan)?.completedQty ?? 0), 0);

  return (
    <div className="pp-page production-floor-page">
      <div className="production-floor-hero">
        <div>
          <span className="floor-kicker">Production Stages</span>
          <h1>In Progress Overview</h1>
          <p>Visual stage progress for active plans, quantities, required dates, and product-level details.</p>
        </div>
        <div className="floor-hero-actions">
          <Link className="btn btn-light" href="/Production/Plan/PlansDetails">
            <MaterialIcon name="table_view" />
            View Plans
          </Link>
          <Link className="btn btn-primary" href="/Production/Index">
            <MaterialIcon name="analytics" />
            Overview
          </Link>
        </div>
      </div>

      <div className="floor-summary-strip">
        <div>
          <span>Active Plans</span>
          <strong>{filteredPlans.length}</strong>
        </div>
        <div>
          <span>Total Qty</span>
          <strong>{totalQuantity.toLocaleString()}</strong>
        </div>
        <div>
          <span>Completed In Active Stage</span>
          <strong>{activeQuantity.toLocaleString()}</strong>
        </div>
        <div>
          <span>Urgent / Hold</span>
          <strong>
            {filteredPlans.filter((plan) => plan.priority === "Urgent").length} / {filteredPlans.filter((plan) => plan.status === "On Hold").length}
          </strong>
        </div>
      </div>

      <div className="floor-filter-bar" aria-label="Production stage filters">
        <label className="floor-search">
          <MaterialIcon name="search" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search plan, product, source..." />
        </label>
        <label>
          <span>Priority</span>
          <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as (typeof priorityOptions)[number])}>
            {priorityOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Source</span>
          <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value as (typeof sourceOptions)[number])}>
            {sourceOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Sort</span>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="requiredDate">Required Date</option>
            <option value="quantity">Quantity</option>
            <option value="priority">Priority</option>
          </select>
        </label>
      </div>

      <div className="stage-chip-row">
        {["All", ...rackStages.map((stage) => stage.key)].map((stage) => (
          <button
            type="button"
            key={stage}
            className={stageFilter === stage ? "stage-chip active" : "stage-chip"}
            onClick={() => setStageFilter(stage)}
          >
            {stage === "All" ? <MaterialIcon name="filter_alt" /> : null}
            {stage === "Stitching / Sewing" ? "Stitching" : stage}
          </button>
        ))}
      </div>

      <div className="production-floor-layout">
        <section className="rack-column" aria-label="Production stages">
          {rackStages
            .map((stage, index) => ({ stage, originalIndex: index }))
            .filter(({ stage }) => stageFilter === "All" || stage.key === stageFilter)
            .map(({ stage, originalIndex }) => {
              const items = filteredPlans.flatMap((plan) =>
                getStageItems(plan, stage.key).map((product) => ({
                  plan,
                  product,
                })),
              );

              return (
                <div className="stage-rack" key={stage.key}>
                  <div className="stage-rack-head">
                    <h2>
                      <MaterialIcon name={stage.icon} />
                      {originalIndex + 1}. {stage.label} Stage
                      <span>({items.length} products)</span>
                    </h2>
                    <button type="button" onClick={() => setStageFilter(stage.key)}>
                      Filter
                    </button>
                  </div>
                  <div className="rack-shelf">
                    <button
                      type="button"
                      className="rack-nav-btn"
                      aria-label={`Scroll ${stage.label} stage left`}
                      onClick={(event) => event.currentTarget.nextElementSibling?.scrollBy({ left: -180, behavior: "smooth" })}
                    >
                      <MaterialIcon name="chevron_left" />
                    </button>
                    <div className="rack-scroll">
                      {items.length ? (
                        items.map(({ plan, product }) => (
                          <button
                            type="button"
                            key={`${plan.planNo}-${product.productCode}`}
                            className={selectedPlan.planNo === plan.planNo ? "rack-product-card selected" : "rack-product-card"}
                            onClick={() => {
                              setSelectedPlanNo(plan.planNo);
                              setSavedMessage("");
                            }}
                          >
                            <span className={`rack-status-dot status-${plan.status.toLowerCase().replaceAll(" ", "-")}`} />
                            <img src={product.productImage} alt={product.productName} />
                            <span className="rack-product-meta">
                              <strong>{product.productCode}</strong>
                              <em>{plan.planNo}</em>
                            </span>
                            <span className="rack-product-color">{product.variant}</span>
                          </button>
                        ))
                      ) : (
                        <div className="rack-empty-slot">
                          <MaterialIcon name="add" />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      className="rack-nav-btn"
                      aria-label={`Scroll ${stage.label} stage right`}
                      onClick={(event) => event.currentTarget.previousElementSibling?.scrollBy({ left: 180, behavior: "smooth" })}
                    >
                      <MaterialIcon name="chevron_right" />
                    </button>
                  </div>
                </div>
              );
            })}
        </section>

        <aside className="floor-detail-panel" aria-label="Selected production details">
          <div className="floor-detail-head">
            <div>
              <span>Selected Plan ID</span>
              <h2>{selectedPlan.planNo}</h2>
              <p>{selectedPlan.productName} - {selectedPlan.variant}</p>
            </div>
            <strong className={`floor-stage-pill status-${selectedPlan.status.toLowerCase().replaceAll(" ", "-")}`}>
              {selectedPlan.status}
            </strong>
          </div>

          <div className="floor-detail-body">
            <div className="floor-context-grid">
              <div>
                <span>Demand Source</span>
                <strong>{selectedPlan.demandType}</strong>
              </div>
              <div>
                <span>Source Name</span>
                <strong>{selectedPlan.sourceName}</strong>
              </div>
              <div>
                <span>Target Qty</span>
                <strong>{selectedPlan.quantity.toLocaleString()} pcs</strong>
              </div>
              <div>
                <span>Required Date</span>
                <strong>{formatDate(selectedPlan.requiredDate)}</strong>
              </div>
            </div>

            <div className="floor-progress-card">
              <div>
                <span>Current Stage</span>
                <strong>{selectedStage.stageName}</strong>
                <em>{selectedStage.workCenter}</em>
              </div>
              <div className="floor-progress-track">
                <span style={{ width: `${completionPercent(selectedPlan)}%` }} />
              </div>
              <p>{completionPercent(selectedPlan)}% completed in this stage</p>
            </div>

            <div className="floor-product-detail">
              <img src={selectedProduct.productImage} alt={selectedProduct.productName} />
              <div>
                <span>{selectedProduct.productCode} - {selectedProduct.category}</span>
                <h3>{selectedProduct.productName}</h3>
                <p>{selectedProduct.productionNotes}</p>
              </div>
            </div>

            <div className="floor-context-grid">
              <div>
                <span>Size Breakdown</span>
                <strong>{compactSizeList(selectedProduct)}</strong>
              </div>
              <div>
                <span>Product Qty</span>
                <strong>{selectedProduct.quantity.toLocaleString()} pcs</strong>
              </div>
              <div>
                <span>Completed Qty</span>
                <strong>{selectedStage.completedQty.toLocaleString()} pcs</strong>
              </div>
              <div>
                <span>Rejected Qty</span>
                <strong>{selectedStage.rejectedQty.toLocaleString()} pcs</strong>
              </div>
            </div>

            <form
              key={selectedPlan.planNo}
              className="floor-update-form"
              onSubmit={(event) => {
                event.preventDefault();
                setSavedMessage(`Progress ready for ${selectedPlan.planNo}`);
              }}
            >
              <h3>Update Progress</h3>
              <div className="floor-form-grid">
                <label>
                  <span>Actual Start Date</span>
                  <input type="date" defaultValue={selectedStage.actualStartDate ?? ""} />
                </label>
                <label>
                  <span>Actual End Date</span>
                  <input type="date" defaultValue={selectedStage.actualEndDate ?? ""} />
                </label>
                <label>
                  <span>Completed Qty</span>
                  <input type="number" min="0" max={selectedPlan.quantity} defaultValue={selectedStage.completedQty} />
                </label>
                <label>
                  <span>Rejected Qty</span>
                  <input type="number" min="0" defaultValue={selectedStage.rejectedQty} />
                </label>
              </div>
              <label>
                <span>Remarks</span>
                <textarea defaultValue={selectedStage.remarks ?? ""} placeholder="Add any notes about issues or delays..." />
              </label>
              {savedMessage ? <p className="floor-save-message">{savedMessage}</p> : null}
              <button type="submit" className="btn btn-primary">
                <MaterialIcon name="save" />
                Save Progress
              </button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
