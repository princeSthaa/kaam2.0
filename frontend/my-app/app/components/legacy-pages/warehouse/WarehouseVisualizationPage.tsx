import { ActionButton } from "../../legacy-ui/ActionButton";
import { TableShell } from "../../legacy-ui/TableShell";

type Kpi = {
  label: string;
  value: string;
  hint: string;
  icon: string;
  tone: "blue" | "green" | "soft";
  progress?: number;
};

type Room = {
  floor: string;
  name: string;
  utilization: number;
  shelves: string;
  tone: "blue" | "green" | "amber" | "purple";
  active?: boolean;
};

type Shelf = {
  code: string;
  floor: string;
  room: string;
  rack: string;
  shelf: string;
  item: string;
  type: "Raw Material" | "Finished Goods";
  quantity: string;
  capacity: string;
  util: number;
  status: "In Use" | "Low Stock" | "Blocked";
  level: number;
  tone: "low" | "medium" | "high" | "full";
  active?: boolean;
};

const kpis: Kpi[] = [
  {
    label: "Warehouse Capacity",
    value: "72%",
    hint: "Used: 1,440 / 2,000 shelf slots",
    icon: "warehouse",
    tone: "blue",
    progress: 72,
  },
  { label: "Floors", value: "2", hint: "Total floors", icon: "apartment", tone: "soft" },
  { label: "Rooms", value: "8", hint: "Total rooms", icon: "meeting_room", tone: "soft" },
  { label: "Racks", value: "48", hint: "Total racks", icon: "view_in_ar", tone: "soft" },
  {
    label: "Available Shelves",
    value: "54",
    hint: "28% available",
    icon: "check_circle",
    tone: "green",
  },
];

const rooms: Room[] = [
  { floor: "Floor 1", name: "Raw Wood Room", utilization: 75, shelves: "36 / 48 shelves", tone: "blue", active: true },
  { floor: "Floor 1", name: "Fabric Room", utilization: 58, shelves: "28 / 48 shelves", tone: "green" },
  { floor: "Floor 2", name: "Packaging Room", utilization: 88, shelves: "42 / 48 shelves", tone: "amber" },
  { floor: "Floor 2", name: "Finished Goods Room", utilization: 56, shelves: "27 / 48 shelves", tone: "purple" },
];

const shelves: Shelf[] = [
  {
    code: "S-01",
    floor: "Floor 1",
    room: "Raw Wood Room",
    rack: "Rack 02",
    shelf: "Shelf 01",
    item: "Plywood sheet",
    type: "Raw Material",
    quantity: "95 pcs",
    capacity: "150 pcs",
    util: 62,
    status: "In Use",
    level: 4,
    tone: "high",
  },
  {
    code: "S-02",
    floor: "Floor 1",
    room: "Raw Wood Room",
    rack: "Rack 02",
    shelf: "Shelf 02",
    item: "Sal wood",
    type: "Raw Material",
    quantity: "360 cft",
    capacity: "450 cft",
    util: 80,
    status: "In Use",
    level: 4,
    tone: "high",
  },
  {
    code: "S-03",
    floor: "Floor 1",
    room: "Raw Wood Room",
    rack: "Rack 02",
    shelf: "Shelf 03",
    item: "Seasoned teak wood",
    type: "Raw Material",
    quantity: "420 cft",
    capacity: "540 cft",
    util: 78,
    status: "In Use",
    level: 4,
    tone: "full",
    active: true,
  },
  {
    code: "S-04",
    floor: "Floor 1",
    room: "Raw Wood Room",
    rack: "Rack 02",
    shelf: "Shelf 04",
    item: "Cut timber pieces",
    type: "Raw Material",
    quantity: "290 cft",
    capacity: "400 cft",
    util: 73,
    status: "In Use",
    level: 3,
    tone: "high",
  },
  {
    code: "S-05",
    floor: "Floor 1",
    room: "Raw Wood Room",
    rack: "Rack 02",
    shelf: "Shelf 05",
    item: "Wood polish cartons",
    type: "Raw Material",
    quantity: "70 boxes",
    capacity: "160 boxes",
    util: 44,
    status: "In Use",
    level: 3,
    tone: "medium",
  },
  {
    code: "S-06",
    floor: "Floor 1",
    room: "Raw Wood Room",
    rack: "Rack 02",
    shelf: "Shelf 06",
    item: "Packing labels",
    type: "Raw Material",
    quantity: "18 rolls",
    capacity: "120 rolls",
    util: 15,
    status: "Low Stock",
    level: 3,
    tone: "low",
  },
  {
    code: "S-07",
    floor: "Floor 2",
    room: "Finished Goods Room",
    rack: "Rack 06",
    shelf: "Shelf 01",
    item: "Finished dining chair",
    type: "Finished Goods",
    quantity: "120 pcs",
    capacity: "220 pcs",
    util: 55,
    status: "In Use",
    level: 2,
    tone: "medium",
  },
  {
    code: "S-08",
    floor: "Floor 2",
    room: "Finished Goods Room",
    rack: "Rack 06",
    shelf: "Shelf 02",
    item: "Packed flour 5kg",
    type: "Finished Goods",
    quantity: "100 pack",
    capacity: "150 pack",
    util: 67,
    status: "In Use",
    level: 2,
    tone: "medium",
  },
  {
    code: "S-09",
    floor: "Floor 2",
    room: "Finished Goods Room",
    rack: "Rack 06",
    shelf: "Shelf 03",
    item: "Water bottle [1L each]",
    type: "Finished Goods",
    quantity: "45 pack",
    capacity: "150 pack",
    util: 30,
    status: "Low Stock",
    level: 2,
    tone: "low",
  },
  {
    code: "S-10",
    floor: "Floor 2",
    room: "Packaging Room",
    rack: "Rack 01",
    shelf: "Shelf 01",
    item: "Printed packaging box",
    type: "Raw Material",
    quantity: "1200 pcs",
    capacity: "1600 pcs",
    util: 75,
    status: "In Use",
    level: 1,
    tone: "high",
  },
  {
    code: "S-11",
    floor: "Floor 1",
    room: "Fabric Room",
    rack: "Rack 05",
    shelf: "Shelf 01",
    item: "Cotton fabric roll",
    type: "Raw Material",
    quantity: "95 kg",
    capacity: "180 kg",
    util: 53,
    status: "In Use",
    level: 1,
    tone: "high",
  },
  {
    code: "S-12",
    floor: "Floor 2",
    room: "Finished Goods Room",
    rack: "Rack 08",
    shelf: "Shelf 01",
    item: "Bottled product case",
    type: "Finished Goods",
    quantity: "32 cases",
    capacity: "140 cases",
    util: 23,
    status: "Low Stock",
    level: 1,
    tone: "low",
  },
];

const locationRows = [shelves[2], shelves[7], shelves[10], shelves[11]];

const lowStockItems = [
  { location: "Rack 08 - Shelf 01", item: "Bottled product case", type: "Finished Goods", quantity: "32 CASES" },
  { location: "Rack 02 - Shelf 06", item: "Packing labels", type: "Raw Material", quantity: "18 ROLLS" },
  { location: "Rack 05 - Shelf 03", item: "Coffee 250g", type: "Finished Goods", quantity: "12 PACK" },
  { location: "Rack 04 - Shelf 02", item: "Sugar 1kg", type: "Finished Goods", quantity: "7 PACK" },
];

function ProgressBar({ value, tone }: { value: number; tone?: Shelf["tone"] }) {
  return (
    <div className="progress table-progress">
      <div className={`progress-bar ${tone ?? progressTone(value)}`} style={{ width: `${value}%` }} />
    </div>
  );
}

function progressTone(value: number): Shelf["tone"] {
  if (value <= 30) return "low";
  if (value <= 70) return "medium";
  if (value < 100) return "high";
  return "full";
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  return (
    <div className="col-12 col-md-6 col-xl-3 col-xxl">
      <div className={`kpi-card ${kpi.progress ? "wide" : ""} ${kpi.tone === "green" ? "success" : ""}`}>
        <div className={`kpi-icon ${kpi.tone}`}>
          <span className="material-symbols-outlined">{kpi.icon}</span>
        </div>
        <div className="kpi-body">
          <span>{kpi.label}</span>
          <strong>{kpi.value}</strong>
          <small>{kpi.hint}</small>
          {kpi.progress ? (
            <div className="progress slim-progress mt-2">
              <div className="progress-bar" style={{ width: `${kpi.progress}%` }} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function WarehouseLayout() {
  return (
    <div className="layout-grid">
      {rooms.map((room) => (
        <button
          className={`layout-room layout-${room.tone} ${room.active ? "active" : ""}`}
          key={`${room.floor}-${room.name}`}
          type="button"
        >
          <span className="layout-tag">{room.floor}</span>
          <strong>{room.name}</strong>
          <em>{room.utilization}%</em>
          <small>({room.shelves})</small>
        </button>
      ))}
    </div>
  );
}

function RackShelf({ shelf }: { shelf: Shelf }) {
  return (
    <button
      className={`shelf-card shelf-${shelf.tone} ${shelf.active ? "active" : ""}`}
      data-floor={shelf.floor}
      data-room={shelf.room}
      data-rack={shelf.rack}
      data-shelf={shelf.shelf}
      data-item={shelf.item}
      data-type={shelf.type}
      data-quantity={shelf.quantity}
      data-capacity={shelf.capacity}
      data-util={shelf.util}
      data-status={shelf.status}
      type="button"
    >
      {shelf.code}
    </button>
  );
}

function RackVisual() {
  return (
    <div className="rack-visual-wrap">
      <div className="level-labels">
        {[4, 3, 2, 1].map((level) => (
          <span key={level}>Level {level}</span>
        ))}
      </div>

      <div className="rack-visual">
        <div className="rack-frame left" />
        <div className="rack-frame right" />
        {[4, 3, 2, 1].map((level) => (
          <div className="rack-level" key={level}>
            {shelves.filter((shelf) => shelf.level === level).map((shelf) => (
              <RackShelf key={shelf.code} shelf={shelf} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function SelectedShelfDetails() {
  const selected = shelves.find((shelf) => shelf.active) ?? shelves[0];
  const details = [
    ["Current Stock", selected.quantity, "selectedQuantity"],
    ["Shelf Capacity", selected.capacity, "selectedCapacity"],
    ["Floor", selected.floor, "selectedFloor"],
    ["Room", selected.room, "selectedRoom"],
    ["Rack", selected.rack, "selectedRack"],
    ["Shelf", selected.shelf, "selectedShelf"],
  ];

  return (
    <div className="panel-card h-100 selected-card">
      <div className="panel-head">
        <div>
          <h2>Shelf Details</h2>
          <p>Selected item placement details</p>
        </div>
        <span id="selectedStatus" className="status-badge success">
          {selected.status}
        </span>
      </div>

      <h3 id="selectedShelfCode">{selected.shelf}</h3>
      <div className="selected-main-item" id="selectedItem">{selected.item}</div>
      <div className="selected-sub" id="selectedItemType">{selected.type}</div>

      <div className="detail-grid mt-4">
        {details.map(([label, value, id]) => (
          <div key={id}>
            <span>{label}</span>
            <strong id={id}>{value}</strong>
          </div>
        ))}
      </div>

      <div className="utilization-box">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span>Utilization</span>
          <strong id="selectedUtil">{selected.util}%</strong>
        </div>
        <div className="progress table-progress">
          <div id="selectedProgress" className="progress-bar high" style={{ width: `${selected.util}%` }} />
        </div>
      </div>

      <div className="d-grid gap-2 mt-4">
        <ActionButton variant="outline-primary" size="sm">
          <span className="material-symbols-outlined">receipt_long</span>
          View Shelf Transactions
        </ActionButton>
        <ActionButton variant="outline-secondary" size="sm">
          <span className="material-symbols-outlined">swap_horiz</span>
          Transfer From This Shelf
        </ActionButton>
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: Shelf["type"] }) {
  return <span className={`type-badge ${type === "Raw Material" ? "raw" : "finished"}`}>{type}</span>;
}

function LocationTable() {
  return (
    <TableShell
      id="locationTable"
      headers={["Floor", "Room", "Rack", "Shelf", "Item", "Type", "Quantity", "Utilization"]}
      tableClassName="table align-middle warehouse-table"
      wrapperClassName="table-responsive"
    >
      {locationRows.map((shelf) => (
        <tr key={`${shelf.rack}-${shelf.shelf}`}>
          <td>{shelf.floor}</td>
          <td>{shelf.room}</td>
          <td>{shelf.rack}</td>
          <td><strong>{shelf.shelf}</strong></td>
          <td>{shelf.item}</td>
          <td><TypeBadge type={shelf.type} /></td>
          <td>{shelf.quantity}</td>
          <td>
            <div className="util-cell">
              <ProgressBar value={shelf.util} />
              <span>{shelf.util}%</span>
            </div>
          </td>
        </tr>
      ))}
    </TableShell>
  );
}

export function WarehouseVisualizationPage() {
  return (
    <section className="warehouse-visual-page">
      <div className="page-header">
        <div>
          <div className="breadcrumb-line">Inventory <span>&gt;</span> Warehouse Visualization</div>
          <h1>Warehouse Visualization</h1>
          <p>Kathmandu Central DC - Visual shelf tracking by floor, room, rack, and shelf.</p>
        </div>

        <div className="header-actions">
          <select className="form-select form-select-sm warehouse-select" defaultValue="Kathmandu Central DC">
            <option>Kathmandu Central DC</option>
            <option>Lalitpur Warehouse</option>
            <option>Biratnagar Warehouse</option>
          </select>
          <ActionButton variant="outline-secondary" size="sm">
            <span className="material-symbols-outlined">filter_list</span>
            Filter
          </ActionButton>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-5 col-xxl-4">
          <div className="panel-card h-100">
            <div className="panel-head">
              <div>
                <h2>Warehouse Layout</h2>
                <p>Occupancy by floor and room</p>
              </div>
            </div>
            <WarehouseLayout />
            <div className="receiving-strip">Receiving / Shipping</div>
          </div>
        </div>

        <div className="col-12 col-xl-7 col-xxl-4">
          <div className="panel-card h-100">
            <div className="panel-head">
              <div>
                <h2 id="rackVisualTitle">Floor 1 &gt; Raw Wood Room &gt; Rack 02</h2>
                <p>Selected rack shelf utilization</p>
              </div>
            </div>
            <RackVisual />
            <div className="legend shelf-legend">
              <span><i className="dot empty" /> Empty</span>
              <span><i className="dot low" /> Low (0-30%)</span>
              <span><i className="dot medium" /> Medium (31-70%)</span>
              <span><i className="dot high" /> High (71-100%)</span>
              <span><i className="dot full" /> Full</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-xxl-4">
          <SelectedShelfDetails />
        </div>
      </div>

      <div className="row g-4 mt-1">
        <div className="col-12 col-xl-7">
          <div className="panel-card h-100">
            <div className="panel-head">
              <div>
                <h2>Location Stock Table</h2>
                <p>Storage by floor, room, rack, shelf, and item type</p>
              </div>
              <div className="table-actions">
                <input
                  id="locationSearch"
                  className="form-control form-control-sm"
                  type="search"
                  placeholder="Search floor, room, rack, shelf, item, or type..."
                />
              </div>
            </div>
            <LocationTable />
          </div>
        </div>

        <div className="col-12 col-xl-5">
          <div className="panel-card h-100">
            <div className="panel-head">
              <div>
                <h2>Low Stock Shelves</h2>
                <p>Items below reorder point</p>
              </div>
            </div>

            <div className="low-stock-list">
              {lowStockItems.map((item) => (
                <div className="low-stock-item" key={`${item.location}-${item.item}`}>
                  <div>
                    <strong>{item.location}</strong>
                    <span>{item.item}</span>
                    <small>{item.type}</small>
                  </div>
                  <b>{item.quantity}</b>
                </div>
              ))}
            </div>

            <button className="btn btn-link low-stock-link" type="button">View all low stock shelves</button>
          </div>
        </div>
      </div>
    </section>
  );
}
