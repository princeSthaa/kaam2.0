import { ActionButton } from "../legacy-ui/ActionButton";
import { PageHeader } from "../legacy-ui/PageHeader";
import { SummaryCard } from "../legacy-ui/SummaryCard";

const crmSummaryCards = [
  { label: "Total Customers", valueId: "totalCustomers", hint: "All registered customers" },
  { label: "Active", valueId: "activeCustomers", hint: "Ordered in last 30 days" },
  { label: "Pending Orders", valueId: "pendingOrders", hint: "Currently unfulfilled" },
  { label: "New This Month", valueId: "newCustomers", hint: "Recently onboarded" },
];

export function CrmIndexPage() {
  return (
    <div className="pp-page">
      <PageHeader
        title="Customer Management"
        subtitle="Manage customer relationships, track basic information, and take new orders."
        actions={
          <ActionButton href="/CRM/Customer/CreateCustomer" variant="primary">
            + Add New Customer
          </ActionButton>
        }
      />
      <div className="pp-summary-grid">
        {crmSummaryCards.map((card) => (
          <SummaryCard key={card.valueId} {...card} />
        ))}
      </div>
    </div>
  );
}
