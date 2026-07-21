import { ActionButton } from "@/app/components/ui/ActionButton";
import { TableShell } from "@/app/components/ui/TableShell";
import { fetchWarehouseVisualData } from "../api/warehouse.api";

export default async function WarehouseVisualizationPage() {
  const { kpis, rooms, shelves, locationRows, lowStockItems } = await fetchWarehouseVisualData();
  const selected = shelves.find((shelf: any) => shelf.active) ?? shelves[0];

  const details = selected ? [
    ["Current Stock", selected.quantity || "0", "selectedQuantity"],
    ["Shelf Capacity", selected.capacity || "0", "selectedCapacity"],
    ["Stock Type", selected.type || "N/A", "selectedType"]
  ] : [];

  return (
    <section className="warehouse-page" data-template-url="/html/warehouse/visualization.html">
      <div className="warehouse-hero">
        <div>
          <span className="warehouse-eyebrow">IMS Warehouse Control</span>
          <h1 className="warehouse-title">Floor Visualization</h1>
          <p className="warehouse-subtitle">Visual overview of warehouse rooms, rack utilization, and low stock locations.</p>
        </div>
        <div className="warehouse-hero-actions">
          <ActionButton href="/warehouse" variant="outline-secondary" size="sm" className="fw-semibold text-decoration-none">
            <span className="material-symbols-outlined" aria-hidden="true">dashboard</span>
            Back to Dashboard
          </ActionButton>
          <ActionButton href="/warehouse/stock" variant="secondary" size="sm" className="fw-semibold text-decoration-none">
            <span className="material-symbols-outlined" aria-hidden="true">list_alt</span>
            List View
          </ActionButton>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {kpis.length === 0 ? (
          <div className="col-12 text-muted">No KPI data available.</div>
        ) : (
          kpis.map((kpi: any, index: number) => (
            <div className="col-md-3" key={index}>
              <div className={`kpi-card ${kpi.tone}`}>
                <div className="kpi-icon">
                  <span className="material-symbols-outlined" aria-hidden="true">{kpi.icon}</span>
                </div>
                <div className="kpi-data w-100">
                  <span className="kpi-label">{kpi.label}</span>
                  <div className="d-flex align-items-baseline gap-2">
                    <span className="kpi-value">{kpi.value}</span>
                    {kpi.progress !== undefined && (
                      <div className="progress flex-grow-1" style={{ height: '6px' }}>
                        <div className="progress-bar bg-success" role="progressbar" style={{ width: `${kpi.progress}%` }} aria-valuenow={kpi.progress} aria-valuemin={0} aria-valuemax={100}></div>
                      </div>
                    )}
                  </div>
                  <span className="kpi-helper">{kpi.hint}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-header bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Rooms & Racks</h5>
              <span className="badge bg-light text-dark border">Ground Floor</span>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {rooms.length === 0 ? (
                  <div className="col-12 text-muted">No rooms available.</div>
                ) : (
                  rooms.map((room: any, index: number) => (
                    <div className="col-md-6" key={index}>
                      <div className={`p-3 rounded border ${room.active ? `border-${room.tone}` : ''} bg-light position-relative`} style={{ cursor: 'pointer' }}>
                        {room.active && <div className={`position-absolute top-0 start-0 w-100 h-100 bg-${room.tone} opacity-10 rounded`}></div>}
                        <div className="d-flex justify-content-between mb-2">
                          <span className="fw-semibold">{room.name}</span>
                          <span className={`badge bg-${room.tone}-subtle text-${room.tone}`}>{room.utilization}%</span>
                        </div>
                        <div className="text-muted small mb-3">{room.shelves}</div>
                        <div className="progress" style={{ height: '4px' }}>
                          <div className={`progress-bar bg-${room.tone}`} role="progressbar" style={{ width: `${room.utilization}%` }} aria-valuenow={room.utilization} aria-valuemin={0} aria-valuemax={100}></div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <hr className="my-4" />

              <h6 className="fw-bold mb-3">Rack 01 Visualization</h6>
              <div className="p-4 bg-light rounded d-flex justify-content-center align-items-center mb-3">
                <div className="warehouse-rack-mini w-100" style={{ maxWidth: '400px' }}>
                  {shelves.length === 0 ? (
                    <div className="text-muted text-center py-4">No shelf data.</div>
                  ) : (
                    [4, 3, 2, 1].map((level) => (
                      <div className="warehouse-rack-mini-level" key={level}>
                        <span>Level {level}</span>
                        <div>
                          {shelves.slice((4 - level) * 4, (4 - level) * 4 + 4).map((shelf: any, idx: number) => (
                            <i className={`warehouse-rack-mini-shelf ${shelf.tone} ${shelf.active ? 'active shadow-sm border-dark' : ''}`} key={idx} style={{ cursor: 'pointer' }}>
                              {shelf.code}
                            </i>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="d-flex justify-content-center gap-4 small text-muted">
                <div className="d-flex align-items-center gap-1"><i className="warehouse-rack-mini-shelf empty d-inline-block" style={{width:'16px',height:'16px'}}></i> Empty</div>
                <div className="d-flex align-items-center gap-1"><i className="warehouse-rack-mini-shelf low d-inline-block" style={{width:'16px',height:'16px'}}></i> Low</div>
                <div className="d-flex align-items-center gap-1"><i className="warehouse-rack-mini-shelf medium d-inline-block" style={{width:'16px',height:'16px'}}></i> Medium</div>
                <div className="d-flex align-items-center gap-1"><i className="warehouse-rack-mini-shelf high d-inline-block" style={{width:'16px',height:'16px'}}></i> High</div>
                <div className="d-flex align-items-center gap-1"><i className="warehouse-rack-mini-shelf full d-inline-block" style={{width:'16px',height:'16px'}}></i> Full</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
              <h5 className="mb-0 fw-bold">Shelf {selected?.code || 'Details'}</h5>
            </div>
            <div className="card-body">
              {selected ? (
                <>
                  <div className={`p-3 rounded bg-${selected.tone}-subtle text-${selected.tone} fw-semibold d-flex align-items-center justify-content-between mb-4`}>
                    <span>{selected.item || "Empty"}</span>
                    <span className="material-symbols-outlined">{selected.tone === 'empty' ? 'inventory_2' : 'deployed_code'}</span>
                  </div>
                  <ul className="list-group list-group-flush mb-4">
                    {details.map(([label, value]) => (
                      <li className="list-group-item d-flex justify-content-between px-0 py-2 border-light" key={label}>
                        <span className="text-muted">{label}</span>
                        <span className="fw-medium">{value}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="d-grid gap-2">
                    <button className="btn btn-outline-secondary btn-sm">Move Stock</button>
                    <button className="btn btn-light btn-sm text-danger">Report Damage</button>
                  </div>
                </>
              ) : (
                <div className="text-muted">No shelf selected.</div>
              )}
            </div>
          </div>

          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold text-danger d-flex align-items-center gap-2">
                <span className="material-symbols-outlined fs-5">warning</span>
                Low Stock
              </h5>
            </div>
            <div className="card-body p-0 pt-3">
              <div className="list-group list-group-flush">
                {lowStockItems.length === 0 ? (
                  <div className="list-group-item text-muted">No low stock items.</div>
                ) : (
                  lowStockItems.map((item: any, idx: number) => (
                    <div className="list-group-item border-light py-3" key={idx}>
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <span className="fw-semibold text-dark">{item.item}</span>
                        <span className="badge bg-danger-subtle text-danger">{item.quantity}</span>
                      </div>
                      <div className="d-flex justify-content-between small">
                        <span className="text-muted">{item.location}</span>
                        <span className="text-muted">{item.type}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

