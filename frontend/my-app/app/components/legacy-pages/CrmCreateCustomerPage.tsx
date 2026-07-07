import { ActionButton } from "../legacy-ui/ActionButton";
import { FormField } from "../legacy-ui/FormField";
import { LegacyCard, LegacyCardHeader } from "../legacy-ui/LegacyCard";
import { PageHeader } from "../legacy-ui/PageHeader";

const customerTypeOptions = [
  { value: "Retail", label: "Retail" },
  { value: "Wholesale", label: "Wholesale" },
  { value: "Distributor", label: "Distributor" },
  { value: "Export", label: "Export" },
];

export function CrmCreateCustomerPage() {
  return (
    <div className="pp-page">
      <PageHeader
        title="Add New Customer"
        subtitle="Register a new client, wholesaler, or retail contact."
        actions={
          <ActionButton href="/CRM/Index" variant="light">
            &larr; Back to List
          </ActionButton>
        }
      />

      <LegacyCard as="div">
        <LegacyCardHeader title="Customer Details" subtitle="Please fill out the required information below." />
        <div className="card-body" style={{ padding: 20 }}>
          <form method="post" id="addCustomerForm">
            <div className="pp-filter-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
              <div className="text-danger" style={{ gridColumn: "1 / -1" }}></div>
              <FormField name="Input.CustomerName" label={<>Full Name <span className="text-danger">*</span></>} placeholder="e.g. Ram Shrestha" />
              <FormField name="Input.CompanyName" label="Company / Business Name" placeholder="e.g. Everest Garments Pvt. Ltd." />
              <FormField name="Input.Email" label="Email Address" placeholder="contact" />
              <FormField name="Input.Phone" label={<>Phone Number <span className="text-danger">*</span></>} placeholder="e.g. 98XXXXXXXX" />
              <FormField name="Input.PanVatNo" label="PAN / VAT Number" placeholder="9-digit PAN/VAT" />
              <FormField name="Input.CustomerType" label="Customer Type" as="select" options={customerTypeOptions} />
              <FormField name="Input.Address" label="Full Address" as="textarea" rows={3} placeholder="Street, City, Province" full />
            </div>

            <div className="form-actions" style={{ marginTop: 30, display: "flex", gap: 15, justifyContent: "flex-end" }}>
              <ActionButton type="reset" variant="light">Clear</ActionButton>
              <ActionButton type="submit" variant="primary">Save Customer</ActionButton>
            </div>
          </form>
        </div>
      </LegacyCard>
    </div>
  );
}
