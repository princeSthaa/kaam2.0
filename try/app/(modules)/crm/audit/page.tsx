"use client";

import { PageHeader } from "@/app/components/ui/PageHeader";
import { BootstrapCard } from "@/app/components/ui/BootstrapCard";

export default function CrmAuditPage() {
  return (
    <div className="pp-page">
      <PageHeader
        title="Financial Audit & Transactions"
        subtitle="Review all financial activities, orders, and customer logs."
      />
      
      <BootstrapCard>
        <div className="card-body text-center py-5 text-muted">
          <span className="material-symbols-outlined fs-1 mb-3">history</span>
          <h4>Audit Log System</h4>
          <p>The native React implementation of the Audit Log is pending backend API integration.</p>
        </div>
      </BootstrapCard>
    </div>
  );
}
