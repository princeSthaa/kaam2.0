"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ActionButton } from "@/app/components/ui/ActionButton";
import { FormField } from "@/app/components/ui/FormField";
import { LegacyCard, LegacyCardHeader } from "@/app/components/ui/LegacyCard";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { createCustomer } from "../../api/customer.api";

const customerTypeOptions = [
  { value: "Retail", label: "Retail" },
  { value: "Wholesale", label: "Wholesale" },
  { value: "Distributor", label: "Distributor" },
  { value: "Export", label: "Export" },
];

export default function CrmCreateCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      company: formData.get("company") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      // Customer type or PAN VAT aren't in our core model yet, but could be added later
    };

    try {
      await createCustomer(data);
      router.push("/crm/customers");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to create customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pp-page">
      <PageHeader
        title="Add New Customer"
        subtitle="Register a new client, wholesaler, or retail contact."
        actions={
          <ActionButton href="/crm/customers" variant="light">
            &larr; Back to List
          </ActionButton>
        }
      />

      <LegacyCard as="div">
        <LegacyCardHeader title="Customer Details" subtitle="Please fill out the required information below." />
        <div className="card-body" style={{ padding: 20 }}>
          <form id="addCustomerFormReact" onSubmit={handleSubmit}>
            <div className="pp-filter-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
              <div className="text-danger" style={{ gridColumn: "1 / -1" }}></div>
              <FormField name="name" label={<>Full Name <span className="text-danger">*</span></>} placeholder="e.g. Ram Shrestha" required />
              <FormField name="company" label="Company / Business Name" placeholder="e.g. Everest Garments Pvt. Ltd." />
              <FormField name="email" label="Email Address" placeholder="contact" />
              <FormField name="phone" label={<>Phone Number <span className="text-danger">*</span></>} placeholder="e.g. 98XXXXXXXX" required />
              <FormField name="panvat" label="PAN / VAT Number" placeholder="9-digit PAN/VAT" />
              <FormField name="type" label="Customer Type" as="select" options={customerTypeOptions} />
              <FormField name="address" label="Full Address" as="textarea" rows={3} placeholder="Street, City, Province" full />
            </div>

            <div className="form-actions" style={{ marginTop: 30, display: "flex", gap: 15, justifyContent: "flex-end" }}>
              <ActionButton type="reset" variant="light">Clear</ActionButton>
              <ActionButton type="submit" variant="primary">
                {loading ? "Saving..." : "Save Customer"}
              </ActionButton>
            </div>
          </form>
        </div>
      </LegacyCard>
    </div>
  );
}
