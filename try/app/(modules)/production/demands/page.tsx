"use client";

import { ActionButton } from "@/app/components/ui/ActionButton";
import { BootstrapCard, BootstrapCardHeader } from "@/app/components/ui/BootstrapCard";
import { PageHeader } from "@/app/components/ui/PageHeader";

const demandChoices = [
  {
    icon: "person",
    title: "Customer Order",
    text: "Use this when a school, retailer, or business customer has ordered garments.",
    points: [
      "Select customer from customer master",
      "Show customer delivery and payment details",
      "Plan product, size, materials, and stages",
    ],
    href: "/production/demands/catalog/customer",
    cta: "Start Customer Order Plan",
  },
  {
    icon: "storefront",
    title: "Outlet Replenishment",
    text: "Use this when your own outlet needs stock replenishment.",
    points: [
      "Select outlet from outlet master",
      "Show outlet location and manager details",
      "Plan product, size, materials, and transfer",
    ],
    href: "/production/demands/catalog/outlet",
    cta: "Start Outlet Plan",
  },
  {
    icon: "inventory_2",
    title: "In-house Stock",
    text: "Use this when production is for internal warehouse stock.",
    points: [
      "Select production reason",
      "Select warehouse",
      "Plan product, size, materials, and storage destination",
    ],
    href: "/production/demands/in-house",
    cta: "Start In-house Plan",
  },
];

export default function ProductionCreatePage() {
  return (
    <div className="pp-page">
      <PageHeader
        title="Create Production Plan"
        subtitle="Choose the type of production demand you want to plan."
        actions={
          <ActionButton href="/production/plans" variant="light">
            Cancel
          </ActionButton>
        }
      />

      <div className="row g-4 mt-2">
        {demandChoices.map((choice, i) => (
          <div className="col-md-4" key={i}>
            <BootstrapCard className="h-100">
              <div className="card-body text-center py-5">
                <span className="material-symbols-outlined fs-1 text-primary mb-3">{choice.icon}</span>
                <h4 className="mb-3">{choice.title}</h4>
                <p className="text-muted mb-4">{choice.text}</p>
                <ul className="list-unstyled text-start text-muted mb-4 px-3">
                  {choice.points.map((pt, j) => (
                    <li key={j} className="mb-2 d-flex align-items-start">
                      <span className="material-symbols-outlined fs-6 text-success me-2">check</span>
                      <small>{pt}</small>
                    </li>
                  ))}
                </ul>
                <ActionButton href={choice.href} variant="primary" className="w-100">
                  {choice.cta}
                </ActionButton>
              </div>
            </BootstrapCard>
          </div>
        ))}
      </div>
    </div>
  );
}
