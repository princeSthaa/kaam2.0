"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";

import { MaterialIcon } from "@/app/components/ui/MaterialIcon";

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

const inProgressPlans: ProductionPlan[] = [];

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
  const [selectedPlanNo, setSelectedPlanNo] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  
  const [inProgressPlansList, setInProgressPlansList] = useState<ProductionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
      fetch("http://localhost:5083/api/production-plans")
        .then((res) => res.json())
        .then((data: any[]) => {
          const mapped = data.filter(p => {
             const s = (p.status || "").toLowerCase();
             return s !== "draft" && s !== "completed" && s !== "cancelled";
          }).map(p => ({
             planNo: p.planId || p.PlanId || p.planNo || p.id,
             demandType: p.demandType || p.DemandType || "Unknown",
             sourceName: p.sourceName || p.SourceName || "Unknown",
             productName: p.planName || p.PlanName || "Unknown",
             variant: p.products?.[0]?.variant || p.Products?.[0]?.Variant || "Standard",
             quantity: p.quantity || p.Quantity || 0,
             priority: p.priority || p.Priority || "Normal",
             outputDestination: "Unknown",
             plannedStartDate: p.plannedStartDate || p.PlannedStartDate || new Date().toISOString(),
             plannedCompletionDate: p.plannedCompletionDate || p.PlannedCompletionDate || new Date().toISOString(),
             requiredDate: p.products?.[0]?.requiredDate || p.Products?.[0]?.RequiredDate || new Date().toISOString(),
             status: p.status || p.Status || "Unknown",
             products: (p.products || p.Products || []).map((prod: any) => ({
                 productCode: prod.productCode || prod.ProductCode || prod.productId || prod.ProductId || "",
                 productName: prod.productName || prod.ProductName || "Unknown Product",
                 category: prod.category || prod.Category || "General",
                 variant: prod.variant || prod.Variant || "Standard",
                 quantity: prod.quantity || prod.Quantity || 0,
                 sourceName: p.sourceName || p.SourceName || "",
                 requiredDate: prod.requiredDate || prod.RequiredDate || new Date().toISOString(),
                 productImage: prod.productImage || prod.ProductImage || "/images/products/place-holder.png",
                 productionNotes: p.productionNotes || p.ProductionNotes || "",
                 sizes: Array.isArray(prod.sizes || prod.Sizes) ? (prod.sizes || prod.Sizes) : [],
             })),
             stages: Array.isArray(p.stages || p.Stages) ? (p.stages || p.Stages).map((stg: any) => ({
                 stageName: stg.stageName || stg.StageName || "",
                 workCenter: stg.workCenter || stg.WorkCenter || "",
                 plannedStartDate: stg.plannedStartDate || stg.PlannedStartDate || new Date().toISOString(),
                 plannedEndDate: stg.plannedEndDate || stg.PlannedEndDate || new Date().toISOString(),
                 status: stg.status || stg.Status || "Not Started",
                 completedQty: stg.completedQty || stg.CompletedQty || 0,
                 rejectedQty: stg.rejectedQty || stg.RejectedQty || 0
             })) : []
          }));
          setInProgressPlansList(mapped);
          if (mapped.length > 0) {
             setSelectedPlanNo(mapped[0].planNo);
          }
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch plans", err);
          setIsLoading(false);
        });
    }, []);

  const filteredPlans = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return inProgressPlansList
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
  }, [priorityFilter, query, sortBy, sourceFilter, stageFilter, inProgressPlansList]);

  const selectedPlan = filteredPlans.find((plan) => plan.planNo === selectedPlanNo) ?? filteredPlans[0] ?? null;
  const selectedStage = selectedPlan ? getActiveStage(selectedPlan) : null;
  const selectedProduct = selectedPlan ? selectedPlan.products[0] : null;
  const totalQuantity = filteredPlans.reduce((sum, plan) => sum + plan.quantity, 0);
  const activeQuantity = filteredPlans.reduce((sum, plan) => sum + (getActiveStage(plan)?.completedQty ?? 0), 0);

  if (isLoading) {
      return <div className="p-8">Loading in progress plans...</div>;
  }

  return (
    <div className="pp-page production-floor-page">
      <div className="production-floor-hero">
        <div>
          <span className="floor-kicker">Production Stages</span>
          <h1>In Progress Overview</h1>
          <p>Visual stage progress for active plans, quantities, required dates, and product-level details.</p>
        </div>
        <div className="floor-hero-actions">
          <Link className="btn btn-light" href="/production/plans">
            <MaterialIcon name="table_view" />
            View Plans
          </Link>
          <Link className="btn btn-primary" href="/production">
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
                            className={selectedPlan?.planNo === plan.planNo ? "rack-product-card selected" : "rack-product-card"}
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
          {selectedPlan && selectedStage && selectedProduct ? (
            <>
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
          </>
          ) : (
            <div className="p-8 text-slate-500 text-center">No active plan selected or available.</div>
          )}
        </aside>
      </div>
    </div>
  );
}


