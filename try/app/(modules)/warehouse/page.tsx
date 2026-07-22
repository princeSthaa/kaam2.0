import { ActionButton } from "@/app/components/ui/ActionButton";
import { fetchWarehouseKpis, fetchShelfPreview } from "./api/warehouse.api";
import { WarehouseKpiCard } from "./components/WarehouseKpiCard";
import { ShelfPreviewGrid } from "./components/ShelfPreviewGrid";

export default async function WarehouseIndexPage() {
  const kpis = await fetchWarehouseKpis();
  const shelves = await fetchShelfPreview();

  return (
    <section className="warehouse-page">
      <div className="warehouse-hero">
        <div>
          <span className="warehouse-eyebrow">IMS Warehouse Control</span>
          <h1 className="warehouse-title">Warehouse</h1>
          <p className="warehouse-subtitle">
            Raw materials, finished goods, locations, transfers, damage control, purchase demand, and dispatch tracking.
          </p>
        </div>
        <div className="warehouse-hero-actions">
          <button className="btn btn-light btn-sm fw-semibold" type="button">
            <span className="material-symbols-outlined" aria-hidden="true">inventory</span>
            Receive
          </button>
          <button className="btn btn-dark btn-sm fw-semibold" type="button">
            <span className="material-symbols-outlined" aria-hidden="true">forklift</span>
            Issue
          </button>
          <ActionButton href="/warehouse/visualization" variant="light" size="sm" className="fw-semibold text-decoration-none">
            <span className="material-symbols-outlined" aria-hidden="true">shelves</span>
            Shelf View
          </ActionButton>
        </div>
      </div>

      <section className="warehouse-shelf-preview" aria-label="Shelf rack preview">
        <div className="warehouse-shelf-preview-copy">
          <span className="warehouse-eyebrow">Shelf visualization</span>
          <h2>Rack and shelf layout</h2>
          <p>Open the full warehouse floor view with rooms, racks, shelves, utilization, and selected shelf details.</p>
          <ActionButton href="/warehouse/visualization" variant="light" size="sm" className="fw-semibold text-decoration-none">
            <span className="material-symbols-outlined" aria-hidden="true">visibility</span>
            Open Visualization
          </ActionButton>
        </div>

        <div className="warehouse-rack-mini" aria-hidden="true">
          <ShelfPreviewGrid shelves={shelves} />
        </div>
      </section>

      <div className="row g-3">
        {kpis.length === 0 ? (
          <div className="col-12 text-muted">No KPI data available from server.</div>
        ) : (
          kpis.map((kpi, idx) => (
            <div className="col-md-3" key={idx}>
              <WarehouseKpiCard icon={kpi.icon} label={kpi.label} value={kpi.value} helper={kpi.helper} tone={kpi.tone} />
            </div>
          ))
        )}
      </div>
    </section>
  );
}




