"use client";

import { useEffect, useState } from "react";
import { ActionButton } from "@/app/components/ui/ActionButton";
import { BootstrapCard, BootstrapCardHeader } from "@/app/components/ui/BootstrapCard";
import { fetchCustomers, updateCustomer } from "../api/customer.api";
import { Customer } from "../dto/customer.dto";

const filters = [
  { id: "customerTypeFilter", label: "Customer Type", type: "select", options: ["All Types", "Retail", "Wholesale", "Distributor"] },
  { id: "statusFilter", label: "Status", type: "select", options: ["All Statuses", "Active", "Inactive", "Blacklisted"] },
  { id: "customerSearch", label: "Customer Search", type: "input", placeholder: "Search name, email, or phone..." },
  { id: "locationSearch", label: "Location Search", type: "input", placeholder: "Search city or address..." },
];

export default function CrmCustomerFilterPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (c: Customer) => setSelectedCustomer(c);
  
  const handleSaveStatus = async (status: string) => {
    if (!selectedCustomer?.id) return;
    try {
      await updateCustomer(selectedCustomer.id, { ...selectedCustomer }); // mock update, as status isn't in base DTO yet
      setSelectedCustomer(null);
      loadCustomers();
    } catch(err) {
      console.error(err);
    }
  };

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
            action={<ActionButton id="resetFiltersBtn" variant="outline-secondary" size="sm">Reset Filters</ActionButton>}
          />
        }
      >
        <div className="row g-3">
          {filters.map((filter) => (
            <div className="col-12 col-sm-6 col-lg-3" key={filter.id}>
              <label htmlFor={filter.id} className="form-label fw-bold">{filter.label}</label>
              {filter.type === "select" ? (
                <select id={filter.id} className="form-select">
                  {filter.options?.map((option, index) => (
                    <option key={option} value={index === 0 ? "" : option}>{option}</option>
                  ))}
                </select>
              ) : (
                <input type="text" id={filter.id} className="form-control" placeholder={filter.placeholder} />
              )}
            </div>
          ))}
        </div>
      </BootstrapCard>

      <BootstrapCard
        bodyClassName="card-body p-0"
        header={
          <div className="card-header bg-white py-3">
            <h5 className="mb-1">Customer Directory</h5>
            <p className="text-muted small mb-0">Showing customer records.</p>
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
              ) : customers.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-muted py-4">No customers found.</td></tr>
              ) : (
                customers.map(c => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td><div className="fw-bold">{c.name}</div></td>
                    <td><div>{c.email}</div><small className="text-muted">{c.phone}</small></td>
                    <td>{c.address}</td>
                    <td>{c.company}</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(c)}>Edit</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </BootstrapCard>
    </div>
  );
}
