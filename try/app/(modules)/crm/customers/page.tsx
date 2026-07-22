"use client";

import { useState } from "react";
import { ActionButton } from "@/app/components/ui/ActionButton";
import { BootstrapCard, BootstrapCardHeader } from "@/app/components/ui/BootstrapCard";
import { useCustomers } from "../hooks";
import { CustomerRow } from "../components/CustomerRow";
import { updateCustomer } from "../api/customer.api";
import { Customer } from "../dto/customer.dto";

export default function CrmCustomerFilterPage() {
  const { customers, loading, refetch } = useCustomers();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const handleEdit = (c: Customer) => setSelectedCustomer(c);

  const handleSaveStatus = async (status: string) => {
    if (!selectedCustomer?.id) return;
    try {
      await updateCustomer(selectedCustomer.id, { ...selectedCustomer });
      setSelectedCustomer(null);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = () => {
    setSearchQuery("");
    setTypeFilter("");
    setStatusFilter("");
  };

  const filtered = customers.filter(c => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = (c.name || "").toLowerCase().includes(q)
        || (c.email || "").toLowerCase().includes(q)
        || (c.phone || "").toLowerCase().includes(q)
        || (c.address || "").toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="container-fluid px-0 py-3">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-2 border-bottom">
        <div>
          <h1 className="h3 mb-1">Customer Filter</h1>
          <p className="text-muted mb-0">Search by customer details, region, or status.</p>
        </div>
      </div>

      <BootstrapCard
        className="mb-4"
        header={
          <BootstrapCardHeader
            title="Filter Customers"
            subtitle="Search by customer details, region, or status."
            action={<button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleReset}>Reset Filters</button>}
          />
        }
      >
        <div className="row g-3">
          <div className="col-12 col-sm-6 col-lg-3">
            <label htmlFor="customerTypeFilter" className="form-label fw-bold">Customer Type</label>
            <select id="customerTypeFilter" className="form-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              <option value="Retail">Retail</option>
              <option value="Wholesale">Wholesale</option>
              <option value="Distributor">Distributor</option>
            </select>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <label htmlFor="statusFilter" className="form-label fw-bold">Status</label>
            <select id="statusFilter" className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Blacklisted">Blacklisted</option>
            </select>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <label htmlFor="customerSearch" className="form-label fw-bold">Customer Search</label>
            <input type="text" id="customerSearch" className="form-control" placeholder="Search name, email, or phone..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>
      </BootstrapCard>

      <BootstrapCard
        bodyClassName="card-body p-0"
        header={
          <div className="card-header bg-white py-3">
            <h5 className="mb-1">Customer Directory</h5>
            <p className="text-muted small mb-0">Showing {filtered.length} customer records.</p>
          </div>
        }
      >
        <div className="table-responsive">
          <table className="table table-hover table-striped align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Customer ID</th>
                <th>Name</th>
                <th>Contact Info</th>
                <th>Location</th>
                <th>Company</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center text-muted py-4">Loading customers...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-muted py-4">No customers found.</td></tr>
              ) : (
                filtered.map(c => (
                  <CustomerRow key={c.id} customer={c} onEdit={handleEdit} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </BootstrapCard>
    </div>
  );
}
