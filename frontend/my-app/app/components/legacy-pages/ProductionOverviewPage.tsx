import { ActionButton } from "../legacy-ui/ActionButton";
import { LegacyCard, LegacyCardHeader } from "../legacy-ui/LegacyCard";
import { PageHeader } from "../legacy-ui/PageHeader";
import { SummaryCard } from "../legacy-ui/SummaryCard";

const summaryCards = [
  { label: "Total Plans", valueId: "totalPlans", hint: "All production plans" },
  { label: "Draft", valueId: "draftPlans", hint: "Plans not yet confirmed" },
  { label: "In Progress", valueId: "inProgressPlans", hint: "Currently running" },
  { label: "Completed", valueId: "completedPlans", hint: "Finished plans" },
];

export function ProductionOverviewPage() {
  return (
    <div className="pp-page production-overview-page">
      <PageHeader
        title="Production Overview"
        subtitle="Plan count, demand mix, quantity load, and product distribution."
        actions={
          <>
            <ActionButton href="/Production/Plan/PlansDetails" variant="light">
              View Plans
            </ActionButton>
            <ActionButton href="/Production/Create" variant="primary">
              Create Production Plan
            </ActionButton>
          </>
        }
      />

      <div className="pp-summary-grid">
        {summaryCards.map((card) => (
          <SummaryCard key={card.valueId} {...card} />
        ))}
      </div>

      <div className="production-chart-grid">
        <LegacyCard className="production-chart-card">
          <LegacyCardHeader title="Status Mix" subtitle="Current plan count by production status." />
          <div className="status-chart-layout">
            <div id="statusDonutChart" className="donut-chart" aria-label="Production status chart">
              <div className="donut-chart-center">
                <strong id="statusDonutTotal">0</strong>
                <span>Plans</span>
              </div>
            </div>
            <div id="statusLegend" className="chart-legend">
              Loading status data...
            </div>
          </div>
        </LegacyCard>

        <LegacyCard className="production-chart-card">
          <LegacyCardHeader title="Demand Quantity" subtitle="Planned quantity grouped by demand source." />
          <div id="demandQuantityChart" className="horizontal-chart">
            Loading demand chart...
          </div>
        </LegacyCard>
      </div>

      <LegacyCard className="production-chart-card">
        <LegacyCardHeader title="Production Quantity Timeline" subtitle="Quantity load by planned start date." />
        <div id="quantityTimelineChart" className="column-chart">
          Loading timeline chart...
        </div>
      </LegacyCard>

      <LegacyCard className="production-chart-card">
        <LegacyCardHeader title="Top Products By Quantity" subtitle="Product quantity aggregated across all current plans." />
        <div id="topProductChart" className="horizontal-chart compact">
          Loading product chart...
        </div>
      </LegacyCard>
    </div>
  );
}
