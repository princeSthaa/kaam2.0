"use client";

import { useState, useEffect } from "react";
import { ActionButton } from "@/app/components/ui/ActionButton";
import { BootstrapCard, BootstrapCardHeader } from "@/app/components/ui/BootstrapCard";
import { fetchProductionPlans } from "../api/production.api";
import { ProductionPlan } from "../dto/production.dto";

const selectFilters = [
  { id: "demandTypeFilter", label: "Demand Type", options: ["All Demand Types", "Customer Order", "Outlet Replenishment", "In-house Stock"] },
  { id: "statusFilter", label: "Status", options: ["All Statuses", "Draft", "In Progress", "Completed", "Cancelled"] },
];

export default function ProductionPlansListPage() {
  const [plans, setPlans] = useState<ProductionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductionPlans().then(data => {
      setPlans(data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  return (
    <div className="pp-page">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-2 border-bottom">
        <div>
          <h1 className="h3 mb-1">Production Plans</h1>
          <p className="text-muted mb-0">Select a plan from the list and manage its stages.</p>
        </div>
        <div className="mt-3 mt-md-0">
          <ActionButton href="/production/demands" variant="primary">
            + Create Production Plan
          </ActionButton>
        </div>
      </div>

      <BootstrapCard className="mb-4">
        <BootstrapCardHeader title="Filter Production Plans" subtitle="Search by product, source, demand type, or status." />
        <div className="card-body">
          <div className="row g-3">
            {selectFilters.map((filter) => (
              <div className="col-12 col-sm-6 col-lg-3" key={filter.id}>
                <label htmlFor={filter.id} className="form-label fw-bold">{filter.label}</label>
                <select id={filter.id} className="form-select">
                  {filter.options.map(o => <option key={o} value={o === `All ${filter.label}s` ? "" : o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div className="col-12 col-sm-6 col-lg-3">
              <label className="form-label fw-bold">Product Search</label>
              <input type="text" className="form-control" placeholder="Search product name..." />
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <label className="form-label fw-bold">Source Search</label>
              <input type="text" className="form-control" placeholder="Search source..." />
            </div>
          </div>
        </div>
      </BootstrapCard>

      <BootstrapCard>
        <BootstrapCardHeader title="Plan Table" subtitle="Scan production plans quickly and manage them." />
        <div className="table-responsive">
          <table className="table table-hover table-striped align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Plan No</th>
                <th>Title</th>
                <th>Demand Source</th>
                <th>Total Qty</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center text-muted py-4">Loading plans...</td></tr>
              ) : plans.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-muted py-4">No plans found.</td></tr>
              ) : (
                plans.map(p => (
                  <tr key={p.id}>
                    <td><div className="fw-bold">{p.planNumber}</div></td>
                    <td>{p.title}</td>
                    <td><span className="badge bg-secondary">{p.demandSource}</span></td>
                    <td>{p.totalQuantity}</td>
                    <td>
                      <span className={`badge ${p.status === 'Completed' ? 'bg-success' : p.status === 'Draft' ? 'bg-warning' : 'bg-primary'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <ActionButton href={`/production/plans/${p.id}`} variant="outline-primary" size="sm">
                        View
                      </ActionButton>
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
