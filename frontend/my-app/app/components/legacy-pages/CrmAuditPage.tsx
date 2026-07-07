import { ActionButton } from "../legacy-ui/ActionButton";
import { FormField } from "../legacy-ui/FormField";
import { LegacyCard, LegacyCardHeader } from "../legacy-ui/LegacyCard";
import { PageHeader } from "../legacy-ui/PageHeader";
import { SummaryCard } from "../legacy-ui/SummaryCard";
import { TableShell } from "../legacy-ui/TableShell";

const summaryCards = [
  { label: "Total Transactions", valueId: "auditTotalTx", hint: "Count in selected range" },
  { label: "Total Received (Rs)", valueId: "auditTotalReceived", hint: "Successful payments" },
  { label: "Total Discounts & Refunds (Rs)", valueId: "auditTotalDiscounts", hint: "Money out or waived" },
  { label: "Flagged Financials", valueId: "auditFlaggedTx", hint: "Pending, bounced, or anomalies" },
];

export function CrmAuditPage() {
  return (
    <div className="pp-page crm-audit-page">
      <PageHeader
        title="Financial Audit & Transactions"
        subtitle="Track payments, invoicing, refunds, and financial adjustments."
        actions={
          <ActionButton id="exportAuditBtn" variant="outline-primary">
            Export Financial Report
          </ActionButton>
        }
      />

      <div className="pp-summary-grid">
        {summaryCards.map((card) => (
          <SummaryCard key={card.valueId} {...card} />
        ))}
      </div>

      <LegacyCard as="div" className="audit-filter-card mb-20">
        <LegacyCardHeader title="Filter Transactions" />
        <div className="card-body" style={{ padding: 20 }}>
          <form id="auditFilterForm">
            <div className="pp-filter-grid audit-filter-bar">
              <FormField
                id="auditDateFrom"
                label="Date From"
                type="date"
              />
              <FormField
                id="auditDateTo"
                label="Date To"
                type="date"
              />
              <FormField
                id="auditEventType"
                label="Transaction Type"
                as="select"
                options={[
                  { value: "", label: "All Transactions" },
                  { value: "Payment Received", label: "Payment Received" },
                  { value: "Invoice Issued", label: "Invoice Issued" },
                  { value: "Discount Applied", label: "Discount Applied" },
                  { value: "Refund Processed", label: "Refund Processed" },
                  { value: "Price Adjusted", label: "Price Adjusted" },
                  { value: "Payment Bounced", label: "Payment Bounced" },
                ]}
              />
              <FormField
                id="auditUserFilter"
                label="Handled By"
                as="select"
                options={[
                  { value: "", label: "All Staff" },
                  { value: "System", label: "System (Auto)" },
                  { value: "Rajesh Shrestha", label: "Rajesh Shrestha" },
                  { value: "Anita Gurung", label: "Anita Gurung" },
                ]}
              />
              <FormField
                id="auditSeverityFilter"
                label="Status/Severity"
                as="select"
                options={[
                  { value: "", label: "All" },
                  { value: "info", label: "Cleared / Normal" },
                  { value: "warning", label: "Pending / Flagged" },
                  { value: "critical", label: "Failed / Reversed" },
                ]}
              />
            </div>
            <div className="form-actions mt-20" style={{ display: "flex", justifyContent: "flex-end" }}>
              <ActionButton id="resetAuditFilters" type="button" variant="light">
                Reset Filters
              </ActionButton>
            </div>
          </form>
        </div>
      </LegacyCard>

      <LegacyCard as="div" className="audit-table-card">
        <div style={{ padding: 20 }}>
          <TableShell
            headers={["Date & Time", "Type", "Description", "Amount (Rs)", "Reference", "Handled By", "Status"]}
            bodyId="auditTableBody"
          />
        </div>
      </LegacyCard>

      {/* Detail Modal */}
      <div className="pp-modal hidden" id="auditDetailModal">
        <div className="pp-modal-backdrop" id="auditModalBackdrop"></div>
        <div className="pp-modal-panel">
          <div className="pp-modal-header">
            <div>
              <h2>Transaction Details</h2>
              <p>Comprehensive breakdown of financial event</p>
            </div>
            <button type="button" className="modal-close-btn" id="auditModalClose">
              &times;
            </button>
          </div>
          <div className="pp-modal-body">
            <div className="form-grid two-col mb-20">
              <div>
                <label className="fw-bold" style={{display: 'block', marginBottom: '5px'}}>Timestamp</label>
                <div id="detailTimestamp" className="p-2 bg-light border rounded"></div>
              </div>
              <div>
                <label className="fw-bold" style={{display: 'block', marginBottom: '5px'}}>Transaction Type</label>
                <div id="detailEventType" className="p-2 bg-light border rounded"></div>
              </div>
              <div>
                <label className="fw-bold" style={{display: 'block', marginBottom: '5px'}}>Amount</label>
                <div id="detailAmount" className="p-2 bg-light border rounded fw-bold fs-5"></div>
              </div>
              <div>
                <label className="fw-bold" style={{display: 'block', marginBottom: '5px'}}>Payment Method</label>
                <div id="detailMethod" className="p-2 bg-light border rounded"></div>
              </div>
              <div>
                <label className="fw-bold" style={{display: 'block', marginBottom: '5px'}}>Reference Entity</label>
                <div id="detailEntity" className="p-2 bg-light border rounded"></div>
              </div>
              <div>
                <label className="fw-bold" style={{display: 'block', marginBottom: '5px'}}>Handled By</label>
                <div id="detailUser" className="p-2 bg-light border rounded"></div>
              </div>
              <div className="full">
                <label className="fw-bold" style={{display: 'block', marginBottom: '5px'}}>Description</label>
                <div id="detailDescription" className="p-2 bg-light border rounded"></div>
              </div>
              <div className="full" id="detailChangesContainer" style={{display: 'none'}}>
                <label className="fw-bold" style={{display: 'block', marginBottom: '5px'}}>Pricing Changes / Breakdowns</label>
                <div id="detailChanges" className="audit-changes-block"></div>
              </div>
              <div className="full" id="detailNotesContainer" style={{display: 'none'}}>
                <label className="fw-bold" style={{display: 'block', marginBottom: '5px'}}>Internal Notes</label>
                <div id="detailNotes" className="p-2 bg-warning-light border rounded text-dark"></div>
              </div>
              <div className="full">
                <label className="fw-bold" style={{display: 'block', marginBottom: '5px'}}>Status / Severity</label>
                <div id="detailSeverity"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
