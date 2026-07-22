"use client";

import { ActionButton } from "@/app/components/ui/ActionButton";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { SummaryCard } from "@/app/components/ui/SummaryCard";
import { useCustomers } from "./hooks";

export default function CrmIndexPage() {
  const { customers, loading } = useCustomers();

  const crmSummaryCards = [
    { label: "Total Customers", value: loading ? "..." : customers.length.toString(), hint: "All registered customers" },
    { label: "Active", value: "0", hint: "Ordered in last 30 days" },
    { label: "Pending Orders", value: "0", hint: "Currently unfulfilled" },
    { label: "New This Month", value: "0", hint: "Recently onboarded" },
  ];

  return (
    <div className="pp-page">
      <PageHeader
        title="Customer Management"
        subtitle="Manage customer relationships, track basic information, and take new orders."
        actions={
          <ActionButton href="/crm/customers/new" variant="primary">
            + Add New Customer
          </ActionButton>
        }
      />
      <div className="pp-summary-grid">
        {crmSummaryCards.map((card, i) => (
          <SummaryCard key={i} label={card.label} value={card.value} hint={card.hint} />
        ))}
      </div>
    </div>
  );
}

