import { ActionButton } from "@/app/components/ui/ActionButton";
import { fetchWarehouseKpis, fetchShelfPreview } from "./api/warehouse.api";

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
          {shelves.length === 0 ? (
            <div className="p-3 text-muted" style={{ display: 'flex', alignItems: 'center', height: '100%', paddingLeft: '1rem' }}>No shelf data from API.</div>
          ) : (
            [4, 3, 2, 1].map((level) => (
              <div className="warehouse-rack-mini-level" key={level}>
                <span>Level {level}</span>
                <div>
                  {shelves.slice((4 - level) * 2, (4 - level) * 2 + 2).map((shelf) => (
                    <i className={`warehouse-rack-mini-shelf ${shelf.tone}`} key={shelf.code}>
                      {shelf.code}
                    </i>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="row g-3">
        {kpis.length === 0 ? (
          <div className="col-12 text-muted">No KPI data available from server.</div>
        ) : (
          kpis.map((kpi, idx) => (
            <div className="col-md-3" key={idx}>
              <div className={`kpi-card ${kpi.tone}`}>
                <div className="kpi-icon">
                  <span className="material-symbols-outlined" aria-hidden="true">{kpi.icon}</span>
                </div>
                <div className="kpi-data">
                  <span className="kpi-label">{kpi.label}</span>
                  <span className="kpi-value">{kpi.value}</span>
                  <span className="kpi-helper">{kpi.helper}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}




