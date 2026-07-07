import { ActionButton } from "../legacy-ui/ActionButton";
import { TableShell } from "../legacy-ui/TableShell";
import { WarehousePageHeader } from "../legacy-ui/WarehousePageHeader";

export function WarehouseStockPage() {
  return (
    <section className="warehouse-page">
      <WarehousePageHeader
        title="Stock"
        subtitle="View raw materials, finished goods, locations, and stock status."
        actions={
          <ActionButton href="/Warehouse/Index" variant="secondary" size="sm">
            Back to Dashboard
          </ActionButton>
        }
      />

      <div className="warehouse-toolbar">
        <input
          className="form-control form-control-sm"
          type="search"
          placeholder="Search item, SKU, location"
          id="stockSearch"
        />

        <select className="form-select form-select-sm" id="stockTypeFilter">
          <option value="all">All Stock</option>
          <option value="Raw Material">Raw Material</option>
          <option value="Finished Goods">Finished Goods</option>
        </select>
      </div>

      <TableShell
        id="stockTable"
        headers={["SKU", "Item", "Type", "Quantity", "Location", "Status"]}
        tableClassName="table table-hover align-middle warehouse-table"
        wrapperClassName="table-responsive warehouse-table-wrap"
      />
    </section>
  );
}
