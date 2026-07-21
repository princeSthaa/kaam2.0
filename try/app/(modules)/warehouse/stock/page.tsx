import { ActionButton } from "@/app/components/ui/ActionButton";
import { TableShell } from "@/app/components/ui/TableShell";
import { WarehousePageHeader } from "@/app/components/ui/WarehousePageHeader";
import { fetchWarehouseStock } from "../api/warehouse.api";

export default async function WarehouseStockPage() {
  const stockItems = await fetchWarehouseStock();

  return (
    <section className="warehouse-page">
      <WarehousePageHeader
        title="Stock"
        subtitle="View raw materials, finished goods, locations, and stock status."
        actions={
          <ActionButton href="/warehouse" variant="secondary" size="sm">
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
      >
        {stockItems.length === 0 ? (
          <tr>
            <td colSpan={6} className="text-center text-muted py-4">No stock items available from API.</td>
          </tr>
        ) : (
          stockItems.map((item) => (
            <tr key={item.sku}>
              <td>{item.sku}</td>
              <td className="fw-medium">{item.item}</td>
              <td>{item.type}</td>
              <td>{item.quantity}</td>
              <td>{item.location}</td>
              <td>
                <span className={`badge ${item.status === 'In Stock' ? 'bg-success' : item.status === 'Low Stock' ? 'bg-warning' : 'bg-secondary'}`}>
                  {item.status}
                </span>
              </td>
            </tr>
          ))
        )}
      </TableShell>
    </section>
  );
}
