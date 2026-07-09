import { ActionButton } from "../../legacy-ui/ActionButton";

const shelfPreview = [
  ["S-01", "high"],
  ["S-02", "full"],
  ["S-03", "medium"],
  ["S-04", "low"],
  ["S-05", "high"],
  ["S-06", "medium"],
  ["S-07", "low"],
  ["S-08", "high"],
];

function ShelfPreview() {
  return (
    <section className="warehouse-shelf-preview" aria-label="Shelf rack preview">
      <div className="warehouse-shelf-preview-copy">
        <span className="warehouse-eyebrow">Shelf visualization</span>
        <h2>Rack and shelf layout</h2>
        <p>Open the full warehouse floor view with rooms, racks, shelves, utilization, and selected shelf details.</p>
        <ActionButton href="/Warehouse/Visualization" variant="light" size="sm" className="fw-semibold text-decoration-none">
          <span className="material-symbols-outlined" aria-hidden="true">visibility</span>
          Open Visualization
        </ActionButton>
      </div>

      <div className="warehouse-rack-mini" aria-hidden="true">
        {[4, 3, 2, 1].map((level) => (
          <div className="warehouse-rack-mini-level" key={level}>
            <span>Level {level}</span>
            <div>
              {shelfPreview.slice((4 - level) * 2, (4 - level) * 2 + 2).map(([code, tone]) => (
                <i className={`warehouse-rack-mini-shelf ${tone}`} key={code}>
                  {code}
                </i>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function WarehouseIndexPage() {
  return (
    <section className="warehouse-page" data-warehouse-app data-template-url="/html/warehouse/module-panel.html">
      <div className="warehouse-hero">
        <div>
          <span className="warehouse-eyebrow">IMS Warehouse Control</span>
          <h1 className="warehouse-title">Warehouse</h1>
          <p className="warehouse-subtitle">
            Raw materials, finished goods, locations, transfers, damage control, purchase demand, and dispatch tracking.
          </p>
        </div>
        <div className="warehouse-hero-actions">
          <button className="btn btn-light btn-sm fw-semibold" type="button" data-action="open-module" data-module-id="receive-materials">
            <span className="material-symbols-outlined" aria-hidden="true">inventory</span>
            Receive
          </button>
          <button className="btn btn-dark btn-sm fw-semibold" type="button" data-action="open-module" data-module-id="issue-materials">
            <span className="material-symbols-outlined" aria-hidden="true">forklift</span>
            Issue
          </button>
          <ActionButton href="/Warehouse/Visualization" variant="outline-secondary" size="sm" className="warehouse-visual-hero-link fw-semibold text-decoration-none">
            <span className="material-symbols-outlined" aria-hidden="true">shelves</span>
            Shelf View
          </ActionButton>
        </div>
      </div>

      <ShelfPreview />

      <div className="row g-3" data-kpi-grid></div>

      <div className="warehouse-workspace">
        <aside className="warehouse-sidebar">
          <div className="warehouse-sidebar-head">
            <span className="material-symbols-outlined" aria-hidden="true">warehouse</span>
            <span>Modules</span>
          </div>
          <div className="nav nav-pills warehouse-module-nav" data-module-nav role="tablist" aria-label="Warehouse modules"></div>
        </aside>

        <div className="warehouse-main">
          <div className="warehouse-toolbar">
            <div className="input-group input-group-sm warehouse-search">
              <span className="input-group-text bg-white">
                <span className="material-symbols-outlined" aria-hidden="true">search</span>
              </span>
              <input className="form-control" type="search" placeholder="Search stock, batch, location" data-warehouse-search />
            </div>
            <select className="form-select form-select-sm warehouse-filter" data-stock-type-filter aria-label="Stock type filter" defaultValue="all">
              <option value="all">All stock</option>
              <option value="Raw Material">Raw materials</option>
              <option value="Finished Goods">Finished goods</option>
            </select>
          </div>

          <div data-module-panel></div>
        </div>
      </div>
    </section>
  );
}
