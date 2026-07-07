import { ActionButton } from "../legacy-ui/ActionButton";
import { TableShell } from "../legacy-ui/TableShell";

const summaryFields = [
  ["Demand Type", "stageDemandType"],
  ["Source Name", "stageSourceName"],
  ["Product", "stageProductName"],
  ["Total Quantity", "stageTotalQuantity"],
  ["Planned Start", "stagePlannedStart"],
  ["Planned Completion", "stagePlannedCompletion"],
  ["Required Date", "stageRequiredDate"],
  ["Current Stage", "stageCurrentStage"],
];

const stageStatusOptions = [
  "Select Status",
  "Not Started",
  "Ready",
  "In Progress",
  "On Hold",
  "Completed",
  "Rejected",
];

type StageSelectField = {
  kind: "select";
  name: string;
  id: string;
  label: string;
  options: string[];
};

type StageInputField = {
  kind: "input";
  name?: string;
  id: string;
  label: string;
  type: string;
  value?: string;
  readOnly?: boolean;
  min?: number;
};

type StageFormField = StageSelectField | StageInputField;

const stageFormFields: StageFormField[] = [
  {
    kind: "select",
    name: "SelectedStageId",
    id: "stageDropdown",
    label: "Stage",
    options: ["Select Stage"],
  },
  {
    kind: "select",
    name: "StageStatus",
    id: "stageStatus",
    label: "Stage Status",
    options: stageStatusOptions,
  },
  {
    kind: "input",
    id: "stagePlannedDateRange",
    label: "Planned Date",
    type: "text",
    value: "-",
    readOnly: true,
  },
  {
    kind: "input",
    name: "ActualStartDate",
    id: "actualStartDate",
    label: "Actual Start Date",
    type: "date",
  },
  {
    kind: "input",
    name: "ActualEndDate",
    id: "actualEndDate",
    label: "Actual End Date",
    type: "date",
  },
  {
    kind: "input",
    id: "actualDuration",
    label: "Actual Duration",
    type: "text",
    value: "0 days",
    readOnly: true,
  },
  {
    kind: "input",
    name: "CompletedQty",
    id: "completedQty",
    label: "Completed Qty",
    type: "number",
    min: 0,
  },
  {
    kind: "input",
    name: "RejectedQty",
    id: "rejectedQty",
    label: "Rejected Qty",
    type: "number",
    min: 0,
  },
  {
    kind: "input",
    id: "totalProcessedQty",
    label: "Total Processed",
    type: "text",
    value: "0",
    readOnly: true,
  },
];

function StageFormControl({ field }: { field: StageFormField }) {
  return (
    <div className="form-group">
      <label>{field.label}</label>
      {field.kind === "select" ? (
        <select name={field.name} id={field.id} className="form-control" defaultValue="">
          {field.options.map((option) => (
            <option value={option.startsWith("Select ") ? "" : option} key={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          name={"name" in field ? field.name : undefined}
          type={field.type}
          min={field.min}
          id={field.id}
          className="form-control"
          defaultValue={field.value}
          readOnly={field.readOnly}
        />
      )}
      {field.name ? <span className="field-error" /> : null}
    </div>
  );
}

export function ProductionStageUpdatePage() {
  return (
    <div className="pp-page">
      <div className="pp-page-header">
        <div>
          <h1>Update Production Stage</h1>
          <p>Update actual progress for cutting, stitching, finishing, quality check, and packing.</p>
        </div>

        <div className="pp-header-actions">
          <ActionButton href="/Production/Plan/Details">View Details</ActionButton>
          <ActionButton href="/Production/Index">Back to Plans</ActionButton>
        </div>
      </div>

      <input type="hidden" id="selectedPlanId" value="PP-20260529-001" />

      <section className="pp-card">
        <div className="pp-card-header">
          <div>
            <h2 id="stagePlanNo">Loading...</h2>
            <p id="stagePlanSubtitle">Loading production plan stage information...</p>
          </div>

          <span id="stagePlanStatusBadge" className="status-badge">Loading</span>
        </div>

        <div className="pp-detail-summary-grid">
          {summaryFields.map(([label, id]) => (
            <div className="summary-box" key={id}>
              <span>{label}</span>
              <strong id={id}>-</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="pp-card">
        <div className="pp-card-header">
          <div>
            <h2>Stage Progress</h2>
            <p>Track the current progress of the production plan.</p>
          </div>
        </div>

        <div className="stage-progress-strip" id="stageProgressStrip">
          Loading stage progress...
        </div>
      </section>

      <form method="post" id="stageUpdateForm">
        <input name="PlanId" type="hidden" />
        <input name="PlanNo" type="hidden" id="planNoInput" />
        <input name="SelectedStageName" type="hidden" id="selectedStageNameInput" />

        <section className="pp-card">
          <div className="pp-card-header">
            <div>
              <h2>Update Stage</h2>
              <p>Select a production stage and enter actual progress details.</p>
            </div>
          </div>

          <div className="form-grid three-col">
            {stageFormFields.map((field) => (
              <StageFormControl field={field} key={field.id} />
            ))}

            <div className="form-group full">
              <label>Remarks</label>
              <textarea
                name="Remarks"
                id="remarks"
                className="form-control"
                rows={4}
                placeholder="Example: Cutting completed for all M and L sizes. 5 pieces rejected due to fabric defect."
              />
            </div>
          </div>

          <div id="stageValidationMessage" className="validation-message mt-20">
            Select a stage to update progress.
          </div>
        </section>

        <section className="pp-card">
          <div className="pp-card-header">
            <div>
              <h2>Production Stage List</h2>
              <p>Review each stage before updating progress.</p>
            </div>
          </div>

          <TableShell
            bodyId="stageUpdateTableBody"
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
              "Action",
            ]}
          >
            <tr>
              <td colSpan={10} className="empty-cell">Loading production stages...</td>
            </tr>
          </TableShell>
        </section>

        <div className="pp-action-bar">
          <button type="submit" name="ActionType" value="SaveStage" className="btn btn-primary">
            Save Stage Update
          </button>
          <ActionButton id="clearStageFormBtn">Clear Form</ActionButton>
          <ActionButton href="/Production/Plan/Details" variant="outline">Cancel</ActionButton>
        </div>
      </form>
    </div>
  );
}
