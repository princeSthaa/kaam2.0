"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/app/components/Sidebar';
import { PageShell } from '@/app/components/ui/PageShell';
import { AppHeader } from '@/app/components/AppHeader';
import './create.css';

const demandChoices = [
  {
    icon: "person",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    title: "Customer Order",
    text: "Use this when a school, retailer, or business customer has ordered garments.",
    points: [
      "Select customer from customer master",
      "Show customer delivery and payment details",
      "Plan product, size, materials, and stages",
    ],
    href: "/Production/Customer/Customers",
    cta: "Start Customer Order Plan",
    badge: "5 Pending Orders",
    badgeColor: "error"
  },
  {
    icon: "storefront",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    title: "Outlet Replenishment",
    text: "Use this when your own outlet needs stock replenishment.",
    points: [
      "Select outlet from outlet master",
      "Show outlet location and manager details",
      "Plan product, size, materials, and transfer",
    ],
    href: "/Production/Outlet/Outlets",
    cta: "Start Outlet Plan",
    badge: "3 Replenishment Alerts",
    badgeColor: "amber"
  },
  {
    icon: "factory",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    title: "In-house Stock",
    text: "Use this when production is for internal warehouse stock.",
    points: [
      "Select production reason",
      "Select warehouse",
      "Plan product, size, materials, and storage destination",
    ],
    href: "/Production/InHouse/CreateInHouse",
    cta: "Start In-house Plan",
    badge: null,
    badgeColor: ""
  },
];

export default function ProductionCreatePage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5083/api/production-plans')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPlans(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pendingCustomerOrders = plans.filter(p => (p.demandType || p.DemandType) === 'Customer Order' && (p.status || p.Status) === 'Active').length;
  const pendingReplenishments = plans.filter(p => (p.demandType || p.DemandType) === 'Outlet Replenishment' && (p.status || p.Status) === 'Active').length;

  const drafts = plans.filter(p => (p.status || p.Status) === 'Draft' || (p.status || p.Status) === 'Needs Approval').slice(0, 5);

  const getStatusColor = (status: string) => {
    if (status === 'Needs Approval') return 'bg-amber-100 text-amber-800';
    if (status === 'Draft') return 'bg-surface-container-highest text-on-surface';
    return 'bg-blue-100 text-blue-800';
  };
  return (
    <>
      <AppHeader pathname="/Production/Create" />
      <PageShell sidebar={<Sidebar section="production" pathname="/Production/Create" />}>
        <main className="create-main">
          
          {/* Header Section */}
          <div className="create-header">
            <Link 
              href="/Production/Plan/PlansDetails" 
              className="create-back-link"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Back to Plans
            </Link>
            <h1 className="create-title">Create Production Plan</h1>
            <p className="create-subtitle">
              Choose the type of production demand you want to plan. Each option provides a tailored workflow and tools specifically designed for that context.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="create-grid">
            {demandChoices.map((choice) => (
              <Link 
                href={choice.href} 
                key={choice.href}
                className="create-card"
              >
                {/* Badge */}
                {choice.title === "Customer Order" && pendingCustomerOrders > 0 && (
                  <div className={`create-badge ${choice.badgeColor}`}>
                    {pendingCustomerOrders} Pending {pendingCustomerOrders === 1 ? 'Order' : 'Orders'}
                  </div>
                )}
                {choice.title === "Outlet Replenishment" && pendingReplenishments > 0 && (
                  <div className={`create-badge ${choice.badgeColor}`}>
                    {pendingReplenishments} Replenishment {pendingReplenishments === 1 ? 'Alert' : 'Alerts'}
                  </div>
                )}

                {/* Icon */}
                <div className={`create-icon-wrapper ${choice.iconBg} ${choice.iconColor}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>{choice.icon}</span>
                </div>

                <h3 className="create-card-title">
                  {choice.title}
                </h3>
                <p className="create-card-text">
                  {choice.text}
                </p>

                {/* Bullet Points */}
                <ul className="create-points-list">
                  {choice.points.map((point, idx) => (
                    <li key={idx} className="create-point-item">
                      <span className="material-symbols-outlined">check</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="create-card-cta">
                  {choice.cta}
                  <span className="material-symbols-outlined">arrow_forward</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Recent Drafts Section */}
          <div className="recent-drafts-section">
            <div className="recent-drafts-card">
              <div className="recent-drafts-header">
                <span className="material-symbols-outlined text-secondary" style={{ fontSize: '24px' }}>history</span>
                <h2 className="recent-drafts-title">Recent Drafts &amp; Unfinished Plans</h2>
              </div>
              <div className="drafts-table-wrapper">
                <table className="drafts-table">
                  <thead>
                    <tr>
                      <th>Plan ID</th>
                      <th>Demand Type</th>
                      <th>Last Modified</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '48px' }}>
                          Loading recent drafts...
                        </td>
                      </tr>
                    ) : drafts.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '48px', fontWeight: 600 }}>
                          No drafts or unfinished plans found.
                        </td>
                      </tr>
                    ) : (
                      drafts.map((draft: any) => (
                        <tr key={draft.planId || draft.PlanId}>
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--primary, #0284c7)' }}>{draft.planId || draft.PlanId}</div>
                          </td>
                          <td>{draft.demandType || draft.DemandType}</td>
                          <td>
                            {new Date(draft.plannedStartDate || draft.PlannedStartDate || Date.now()).toLocaleDateString()}
                          </td>
                          <td>
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold font-label-md ${getStatusColor(draft.status || draft.Status)}`}>
                              {draft.status || draft.Status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <Link href={`/Production/Batch/${draft.planId || draft.PlanId}`} className="draft-resume-link">
                              Resume Plan
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </main>
      </PageShell>
    </>
  );
}
