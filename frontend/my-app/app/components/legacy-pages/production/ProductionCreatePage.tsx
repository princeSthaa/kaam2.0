import { ActionButton } from "../../legacy-ui/ActionButton";
import { LegacyCard, LegacyCardHeader } from "../../legacy-ui/LegacyCard";
import { PageHeader } from "../../legacy-ui/PageHeader";

const demandChoices = [
  {
    icon: "👤",
    title: "Customer Order",
    text: "Use this when a school, retailer, or business customer has ordered garments.",
    points: [
      "Select customer from customer master",
      "Show customer delivery and payment details",
      "Plan product, size, materials, and stages",
    ],
    href: "/Production/Customer/Customers",
    cta: "Start Customer Order Plan",
  },
  {
    icon: "🏬",
    title: "Outlet Replenishment",
    text: "Use this when your own outlet needs stock replenishment.",
    points: [
      "Select outlet from outlet master",
      "Show outlet location and manager details",
      "Plan product, size, materials, and transfer",
    ],
    href: "/Production/Outlet/Outlets",
    cta: "Start Outlet Plan",
  },
  {
    icon: "🏭",
    title: "In-house Stock",
    text: "Use this when production is for internal warehouse stock.",
    points: [
      "Select production reason",
      "Select warehouse",
      "Plan product, size, materials, and storage destination",
    ],
    href: "/Production/InHouse/CreateInHouse",
    cta: "Start In-house Plan",
  },
];

export function ProductionCreatePage() {
  return (
    <div className="pp-page">
      <PageHeader
        title="Create Production Plan"
        subtitle="Choose the type of production demand you want to plan."
        actions={
          <ActionButton href="/Production/Plan/PlansDetails" variant="light">
            Back to Plans
          </ActionButton>
        }
      />

      <LegacyCard>
        <LegacyCardHeader title="Select Demand Type" />
        <div className="demand-choice-grid">
          {demandChoices.map((choice) => (
            <div className="demand-choice-card" key={choice.href}>
              <div className="demand-icon">{choice.icon}</div>
              <h3>{choice.title}</h3>
              <p>{choice.text}</p>
              <ul>
                {choice.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <ActionButton href={choice.href} variant="primary">
                {choice.cta}
              </ActionButton>
            </div>
          ))}
        </div>
      </LegacyCard>
    </div>
  );
}
