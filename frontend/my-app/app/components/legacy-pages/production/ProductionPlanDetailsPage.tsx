"use client";

import { useSearchParams } from "next/navigation";
import { ActionButton } from "../../legacy-ui/ActionButton";
import { TableShell } from "../../legacy-ui/TableShell";

const summaryFields = [
  ["Demand Type", "summaryDemandType"],
  ["Source Name", "summarySourceName"],
  ["Product", "summaryProduct"],
  ["Total Quantity", "summaryQuantity"],
  ["Planned Start", "summaryStartDate"],
  ["Planned Completion", "summaryCompletionDate"],
  ["Required Date", "summaryRequiredDate"],
  ["Priority", "summaryPriority"],
];

const overviewFields = [
  ["Plan No", "overviewPlanNo"],
  ["Plan Date", "overviewPlanDate"],
  ["Demand Type", "overviewDemandType"],
  ["Source Name", "overviewSourceName"],
  ["Output Destination", "overviewOutputDestination"],
  ["Status", "overviewStatus"],
];

const sourceFields = [
  ["Code", "sourceCode"],
  ["Name", "sourceDetailName"],
  ["Phone / Contact", "sourcePhone"],
  ["Location", "sourceLocation"],
  ["Extra Info", "sourceExtra"],
];


const dateFields = [
  ["Plan Date", "datePlanDate"],
  ["Planned Start", "dateStartDate"],
  ["Planned Completion", "dateCompletionDate"],
  ["Required Date", "dateRequiredDate"],
  ["Buffer Days", "dateBufferDays"],
];

const tabs = [
  ["Overview", "overviewTab"],
  ["Materials", "materialsTab"],
  ["Stages", "stagesTab"],
  ["Size Breakdown", "sizesTab"],
  ["Activity", "activityTab"],
];

const sizeFields = [
  ["XS", "sizeXS"],
  ["S", "sizeS"],
  ["M", "sizeM"],
  ["L", "sizeL"],
  ["XL", "sizeXL"],
  ["XXL", "sizeXXL"],
];

function SummaryGrid({ fields, className = "pp-detail-summary-grid" }: { fields: string[][]; className?: string }) {
  return (
    <div className={className}>
      {fields.map(([label, id]) => (
        <div className="summary-box" key={id}>
          <span>{label}</span>
          <strong id={id}>-</strong>
        </div>
      ))}
    </div>
  );
}

function SelectedInfoGrid({ fields }: { fields: string[][] }) {
  return (
    <div className="selected-info-card">
      {fields.map(([label, id]) => (
        <div key={id}>
          <span>{label}</span>
          <strong id={id}>-</strong>
        </div>
      ))}
    </div>
  );
}

function ProductWorkspace({
  countId,
  listId,
  detailId,
  emptyText,
}: {
  countId: string;
  listId: string;
  detailId: string;
  emptyText: string;
}) {
  return (
    <div className="product-horizontal-workspace mt-10">
      <div className="product-horizontal-shelf-header">
        <div className="shelf-header-title">
          <span className="material-symbols-outlined icon-span">inventory_2</span>
          <span>Products In Plan</span>
          <strong id={countId} className="count-badge">0</strong>
        </div>
      </div>

      <div className="horizontal-product-shelf mb-20">
        <button
          type="button"
          className="rack-nav-btn"
          aria-label="Scroll left"
          onClick={(event) => {
            const scrollContainer = event.currentTarget.nextElementSibling;
            if (scrollContainer) {
              scrollContainer.scrollBy({ left: -240, behavior: "smooth" });
            }
          }}
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        
        <div id={listId} className="horizontal-product-scroll" role="listbox">
          <div className="empty-cell">Loading plan products...</div>
        </div>

        <button
          type="button"
          className="rack-nav-btn"
          aria-label="Scroll right"
          onClick={(event) => {
            const scrollContainer = event.currentTarget.previousElementSibling;
            if (scrollContainer) {
              scrollContainer.scrollBy({ left: 240, behavior: "smooth" });
            }
          }}
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>

      <section id={detailId} className="product-horizontal-detail mt-20">
        <div className="product-editor-empty detail">{emptyText}</div>
      </section>
    </div>
  );
}

function TabButton({ label, target, active }: { label: string; target: string; active?: boolean }) {
  return (
    <button type="button" className={`pp-tab ${active ? "active" : ""}`} data-tab={target}>
      {label}
    </button>
  );
}

export function ProductionPlanDetailsPage() {
  const searchParams = useSearchParams();
  const planId = searchParams.get("planNo") || searchParams.get("planId") || searchParams.get("id") || "PP-20260529-001";

  return (
    <div className="pp-page">
      <div className="pp-page-header">
        <div>
          <h1>Production Plan Details</h1>
          <p>View production plan summary, materials, stages, size breakdown, and activity.</p>
        </div>

        <div className="pp-header-actions">
          <ActionButton href="/Production/Plan/PlansDetails">Back to Plans</ActionButton>
          <ActionButton id="editPlanBtn" href={`/Production/Plan/Edit?id=${planId}`} variant="primary">Edit Plan</ActionButton>
          <ActionButton id="stageUpdateBtn" href={`/Production/Plan/StageUpdate?id=${planId}`} variant="outline">Update Stage</ActionButton>
        </div>
      </div>

      <input type="hidden" id="selectedPlanId" value={planId} />

      <section className="pp-card">
        <div className="pp-card-header">
          <div>
            <h2 id="detailsPlanNo">Loading...</h2>
            <p id="detailsPlanSubtitle">Loading production plan information...</p>
          </div>

          <span id="detailsStatusBadge" className="status-badge">Loading</span>
        </div>

        <SummaryGrid fields={summaryFields} />
      </section>

      <section className="pp-card">
        <div className="pp-tabs">
          {tabs.map(([label, target], index) => (
            <TabButton label={label} target={target} active={index === 0} key={target} />
          ))}
        </div>

        <div id="overviewTab" className="pp-tab-panel active">
          <div className="detail-panel">
            <h3>Demand Information</h3>
            <SelectedInfoGrid fields={overviewFields} />
          </div>

          <div className="detail-panel mt-20">
            <h3>Products In This Plan</h3>
            <ProductWorkspace
              countId="detailsProductCount"
              listId="detailsProductList"
              detailId="activeProductDetail"
              emptyText="Select a product from the list to view details."
            />
          </div>

          <div className="detail-panel mt-20">
            <h3 id="sourceDetailTitle">Source Details</h3>
            <SelectedInfoGrid fields={sourceFields} />
          </div>

          <div className="detail-panel mt-20">
            <h3>Planning Dates</h3>
            <SummaryGrid fields={dateFields} />
          </div>
        </div>

        <div id="materialsTab" className="pp-tab-panel">
          <div className="pp-card-header inner">
            <div>
              <h2>Material Requirements</h2>
              <p>Materials are calculated from BOM and material master mock data.</p>
            </div>
          </div>

          <TableShell
            bodyId="detailsMaterialBody"
            headers={["Material Code", "Material Name", "Material Type", "Required Qty", "Available Qty", "Shortage Qty", "Unit", "Status"]}
          >
            <tr>
              <td colSpan={8} className="empty-cell">Loading material requirements...</td>
            </tr>
          </TableShell>
        </div>

        <div id="stagesTab" className="pp-tab-panel">
          <div className="pp-card-header inner">
            <div>
              <h2>Production Stage Progress</h2>
              <p>Default garment production stages and current progress.</p>
            </div>
          </div>

          <div className="stage-progress-strip" id="stageProgressStrip">
            Loading stage progress...
          </div>

          <TableShell
            bodyId="detailsStagesBody"
            wrapperClassName="pp-table-wrapper mt-20"
            headers={[
              "Stage Name",
              "Work Center / Department",
              "Planned Start",
              "Planned End",
              "Actual Start",
              "Actual End",
              "Completed Qty",
              "Rejected Qty",
              "Status",
            ]}
          >
            <tr>
              <td colSpan={9} className="empty-cell">Loading production stages...</td>
            </tr>
          </TableShell>
        </div>

        <div id="sizesTab" className="pp-tab-panel">
          <div className="pp-card-header inner">
            <div>
              <h2>Size Breakdown</h2>
              <p>Quantity distribution by garment size.</p>
            </div>
          </div>

          <div className="size-summary-grid">
            {sizeFields.map(([label, id]) => (
              <div className="size-box" key={id}>
                <span>{label}</span>
                <strong id={id}>0</strong>
              </div>
            ))}
          </div>

          <div className="calculation-strip mt-20">
            <div>
              <span>Total Size Quantity</span>
              <strong id="detailsSizeTotal">0</strong>
            </div>
            <div>
              <span>Plan Quantity</span>
              <strong id="detailsPlanQuantity">0</strong>
            </div>
            <div id="detailsSizeMessage" className="validation-message">
              Loading size validation...
            </div>
          </div>

          <div className="detail-panel mt-20">
            <h3>Product Wise Size And Fabric Variants</h3>
            <ProductWorkspace
              countId="detailsSizeProductCount"
              listId="detailsSizeProductList"
              detailId="activeSizeProductDetail"
              emptyText="Select a product from the list to view its size breakdown."
            />
          </div>
        </div>

        <div id="activityTab" className="pp-tab-panel">
          <div className="pp-card-header inner">
            <div>
              <h2>Activity</h2>
              <p>Mock activity timeline for this production plan.</p>
            </div>
          </div>

          <div className="activity-timeline" id="activityTimeline">
            <div className="activity-item">
              <span className="activity-dot" />
              <div>
                <strong>Plan created</strong>
                <p>Production plan was created as a mock activity.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
