using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.Warehouse;
using backend.Model;

namespace backend.Service.Warehouse
{
    public class WarehouseService : IWarehouseService
    {
        private readonly AppDbContext _context;

        public WarehouseService(AppDbContext context)
        {
            _context = context;
        }

        // <crudgen:methods>
        public async Task<List<WarehouseDto>> GetAllAsync(
            string? id = null,
            string? code = null,
            string? name = null,
            string? location = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null
        )
        {
            return await _context.Database
                .SqlQuery<WarehouseDto>($@"
                    EXEC sp_GetWarehouses

                        @Id = {id},
                        @Code = {code},
                        @Name = {name},
                        @Location = {location},
                        @CreatedAt = {createdAt},
                        @CreatedBy = {createdBy},
                        @UpdatedAt = {updatedAt},
                        @UpdatedBy = {updatedBy}
                ")
                .ToListAsync();
        }

        public async Task<bool> CreateAsync(WarehouseDto warehouseDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertWarehouse

                    @Code = {warehouseDto.Code},
                    @Name = {warehouseDto.Name},
                    @Location = {warehouseDto.Location},
                    @CreatedAt = {warehouseDto.CreatedAt},
                    @CreatedBy = {warehouseDto.CreatedBy},
                    @UpdatedAt = {warehouseDto.UpdatedAt},
                    @UpdatedBy = {warehouseDto.UpdatedBy}
            ");

            return true;
        }

        public async Task<bool> UpdateAsync(string id, WarehouseDto warehouseDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateWarehouse

                    @Id = {id},
                    @Code = {warehouseDto.Code},
                    @Name = {warehouseDto.Name},
                    @Location = {warehouseDto.Location},
                    @CreatedAt = {warehouseDto.CreatedAt},
                    @CreatedBy = {warehouseDto.CreatedBy},
                    @UpdatedAt = {warehouseDto.UpdatedAt},
                    @UpdatedBy = {warehouseDto.UpdatedBy}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteWarehouse
                    @Id = {id}
            ");

            return true;
        }

        public async Task<(bool Success, string Message)> ProcessSupplierInspectionAsync(SupplierInspectionDto dto)
        {
            var mat = await _context.Materials.FirstOrDefaultAsync(m => m.Id == dto.MaterialId || m.MaterialCode == dto.MaterialId);
            var matName = mat?.Name ?? dto.MaterialName;
            var unit = mat?.Unit ?? "units";

            _context.MaterialInspections.Add(new MaterialInspection
            {
                Id = Guid.NewGuid().ToString(),
                MaterialId = dto.MaterialId,
                MaterialName = matName,
                SupplierName = dto.SupplierName,
                ReceivedQuantity = dto.ReceivedQuantity,
                InspectionStatus = dto.InspectionStatus,
                Notes = dto.Notes,
                InspectorName = dto.InspectorName,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = dto.InspectorName,
                UpdatedAt = DateTime.UtcNow,
                UpdatedBy = dto.InspectorName
            });

            if (dto.InspectionStatus.Equals("Accepted", StringComparison.OrdinalIgnoreCase))
            {
                if (mat != null)
                {
                    mat.AvailableQty += dto.ReceivedQuantity;
                    mat.UpdatedAt = DateTime.UtcNow;
                }

                // Update inventory entry
                var invItem = await _context.Inventories.FirstOrDefaultAsync(i => i.SKU == dto.MaterialId || i.ItemName == matName);
                if (invItem != null)
                {
                    invItem.Quantity += dto.ReceivedQuantity;
                    invItem.Status = "In Stock";
                    invItem.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    _context.Inventories.Add(new backend.Model.Inventory
                    {
                        Id = Guid.NewGuid().ToString(),
                        SKU = mat?.MaterialCode ?? dto.MaterialId,
                        ItemName = matName,
                        Type = "Raw Material",
                        Quantity = dto.ReceivedQuantity,
                        Location = "Warehouse Raw Material Zone A",
                        Status = "In Stock",
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = dto.InspectorName,
                        UpdatedAt = DateTime.UtcNow,
                        UpdatedBy = dto.InspectorName
                    });
                }

                _context.Transactions.Add(new backend.Model.Transaction
                {
                    Id = Guid.NewGuid().ToString(),
                    Timestamp = DateTime.UtcNow,
                    TransactionType = "Supplier Receiving (Accepted)",
                    Amount = dto.ReceivedQuantity * (mat?.CostPerUnit ?? 0),
                    PaymentMethod = "Purchase Receiving",
                    ReferenceEntity = dto.MaterialId,
                    HandledBy = dto.InspectorName,
                    Notes = $"Inspected and ACCEPTED {dto.ReceivedQuantity} {unit} of {matName} from {dto.SupplierName}. Notes: {dto.Notes}",
                    Status = "Accepted",
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = dto.InspectorName,
                    UpdatedAt = DateTime.UtcNow,
                    UpdatedBy = dto.InspectorName
                });

                await _context.SaveChangesAsync();
                return (true, $"Shipment inspected and ACCEPTED. Added {dto.ReceivedQuantity} {unit} of {matName} to warehouse inventory.");
            }
            else
            {
                // Purchase Return for damaged goods
                _context.Transactions.Add(new backend.Model.Transaction
                {
                    Id = Guid.NewGuid().ToString(),
                    Timestamp = DateTime.UtcNow,
                    TransactionType = "Purchase Return (Damaged)",
                    Amount = dto.ReceivedQuantity * (mat?.CostPerUnit ?? 0),
                    PaymentMethod = "Supplier Return",
                    ReferenceEntity = dto.MaterialId,
                    HandledBy = dto.InspectorName,
                    Notes = $"DAMAGED shipment received from supplier {dto.SupplierName}. Purchase return initiated for {dto.ReceivedQuantity} {unit} of {matName} by inspector {dto.InspectorName}. Reason: {dto.Notes}",
                    Status = "Purchase Return",
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = dto.InspectorName,
                    UpdatedAt = DateTime.UtcNow,
                    UpdatedBy = dto.InspectorName
                });

                await _context.SaveChangesAsync();
                return (true, $"Shipment marked as DAMAGED. Purchase return initiated for {dto.ReceivedQuantity} {unit} from {dto.SupplierName}.");
            }
        }

        public async Task<(bool Success, string Message)> AcceptFinishedGoodsAsync(FinishedGoodsAcceptanceDto dto)
        {
            _context.FinishedGoodsHandovers.Add(new FinishedGoodsHandover
            {
                Id = Guid.NewGuid().ToString(),
                ProductId = dto.ProductId,
                ProductName = dto.ProductName,
                SKU = dto.SKU,
                Quantity = dto.Quantity,
                SourceFactoryLine = dto.SourceFactoryLine,
                Location = dto.Location,
                AcceptedBy = dto.AcceptedBy,
                Status = "Accepted",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = dto.AcceptedBy,
                UpdatedAt = DateTime.UtcNow,
                UpdatedBy = dto.AcceptedBy
            });

            var invItem = await _context.Inventories.FirstOrDefaultAsync(i => i.SKU == dto.SKU || i.SKU == dto.ProductId || i.ItemName == dto.ProductName);
            if (invItem != null)
            {
                invItem.Quantity += dto.Quantity;
                invItem.Status = "In Stock";
                invItem.Location = string.IsNullOrEmpty(dto.Location) ? invItem.Location : dto.Location;
                invItem.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                _context.Inventories.Add(new backend.Model.Inventory
                {
                    Id = Guid.NewGuid().ToString(),
                    SKU = string.IsNullOrEmpty(dto.SKU) ? (string.IsNullOrEmpty(dto.ProductId) ? $"FG-{Guid.NewGuid().ToString().Substring(0, 5)}" : dto.ProductId) : dto.SKU,
                    ItemName = string.IsNullOrEmpty(dto.ProductName) ? "Garment Finished Product" : dto.ProductName,
                    Type = "Finished Goods",
                    Quantity = dto.Quantity,
                    Location = string.IsNullOrEmpty(dto.Location) ? "Central Warehouse Rack A" : dto.Location,
                    Status = "In Stock",
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = dto.AcceptedBy,
                    UpdatedAt = DateTime.UtcNow,
                    UpdatedBy = dto.AcceptedBy
                });
            }

            _context.Transactions.Add(new backend.Model.Transaction
            {
                Id = Guid.NewGuid().ToString(),
                Timestamp = DateTime.UtcNow,
                TransactionType = "Finished Goods Acceptance",
                Amount = dto.Quantity * 1500, // Estimated value
                PaymentMethod = "Factory Handover",
                ReferenceEntity = dto.ProductId,
                HandledBy = dto.AcceptedBy,
                Notes = $"Accepted {dto.Quantity} units of {dto.ProductName} from factory ({dto.SourceFactoryLine}) into warehouse storage ({dto.Location}). Accepted by: {dto.AcceptedBy}",
                Status = "Accepted",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = dto.AcceptedBy,
                UpdatedAt = DateTime.UtcNow,
                UpdatedBy = dto.AcceptedBy
            });

            await _context.SaveChangesAsync();
            return (true, $"Successfully accepted {dto.Quantity} units of finished product '{dto.ProductName}' into warehouse inventory.");
        }

        public async Task<(bool Success, string Message)> InitiateProductSaleAsync(ProductSaleDispatchDto dto)
        {
            var invItem = await _context.Inventories.FirstOrDefaultAsync(i => (i.SKU == dto.ProductId || i.ItemName == dto.ProductName) && i.Type == "Finished Goods");
            if (invItem == null)
            {
                // Fallback check any item by name
                invItem = await _context.Inventories.FirstOrDefaultAsync(i => i.ItemName == dto.ProductName || i.SKU == dto.ProductId);
            }

            if (invItem != null && invItem.Quantity < dto.Quantity)
            {
                return (false, $"Insufficient finished goods stock. Current available: {invItem.Quantity} units, Requested dispatch: {dto.Quantity} units.");
            }

            if (invItem != null)
            {
                invItem.Quantity -= dto.Quantity;
                invItem.UpdatedAt = DateTime.UtcNow;
            }

            _context.Transactions.Add(new backend.Model.Transaction
            {
                Id = Guid.NewGuid().ToString(),
                Timestamp = DateTime.UtcNow,
                TransactionType = "Product Sales Dispatch",
                Amount = dto.Quantity * 2000,
                PaymentMethod = "Customer Order Dispatch",
                ReferenceEntity = dto.OrderNumber,
                HandledBy = "Sales Dispatch Desk",
                Notes = $"Dispatched {dto.Quantity} units of {dto.ProductName} to Customer '{dto.CustomerName}' for Order #{dto.OrderNumber}. Notes: {dto.Notes}",
                Status = "Dispatched",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Dispatch Manager",
                UpdatedAt = DateTime.UtcNow,
                UpdatedBy = "Dispatch Manager"
            });

            await _context.SaveChangesAsync();
            return (true, $"Product sales dispatch initiated! {dto.Quantity} units of '{dto.ProductName}' dispatched to {dto.CustomerName} (Order #{dto.OrderNumber}).");
        }

        public async Task<(bool Success, string Message)> ProcessCustomerReturnAsync(CustomerReturnDto dto)
        {
            _context.CustomerReturns.Add(new CustomerReturn
            {
                Id = Guid.NewGuid().ToString(),
                OrderNumber = dto.OrderNumber,
                CustomerName = dto.CustomerName,
                ProductId = dto.ProductId,
                ReturnedQuantity = dto.ReturnedQuantity,
                Reason = dto.Reason,
                Notes = dto.Notes,
                ProcessedBy = dto.ProcessedBy,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = dto.ProcessedBy,
                UpdatedAt = DateTime.UtcNow,
                UpdatedBy = dto.ProcessedBy
            });

            _context.Inventories.Add(new backend.Model.Inventory
            {
                Id = Guid.NewGuid().ToString(),
                SKU = $"RET-{Guid.NewGuid().ToString().Substring(0, 5)}",
                ItemName = $"Customer Return - Order #{dto.OrderNumber}",
                Type = "Customer Return",
                Quantity = dto.ReturnedQuantity,
                Location = "Quarantine / Return Storage",
                Status = "Damaged Return",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = dto.ProcessedBy,
                UpdatedAt = DateTime.UtcNow,
                UpdatedBy = dto.ProcessedBy
            });

            _context.Transactions.Add(new backend.Model.Transaction
            {
                Id = Guid.NewGuid().ToString(),
                Timestamp = DateTime.UtcNow,
                TransactionType = "Customer Damage Return",
                Amount = dto.ReturnedQuantity * 1500,
                PaymentMethod = "Customer Return",
                ReferenceEntity = dto.OrderNumber,
                HandledBy = dto.ProcessedBy,
                Notes = $"Customer '{dto.CustomerName}' returned {dto.ReturnedQuantity} units for Order #{dto.OrderNumber}. Reason: {dto.Reason}. Processed by: {dto.ProcessedBy}. Notes: {dto.Notes}",
                Status = "Return Logged",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = dto.ProcessedBy,
                UpdatedAt = DateTime.UtcNow,
                UpdatedBy = dto.ProcessedBy
            });

            await _context.SaveChangesAsync();
            return (true, $"Processed customer return of {dto.ReturnedQuantity} units for Order #{dto.OrderNumber}. Marked as '{dto.Reason}'.");
        }

        public async Task<object> GetKpisAsync()
        {
            var totalMaterials = await _context.Materials.CountAsync();
            var totalAvailableQty = await _context.Materials.SumAsync(m => (decimal?)m.AvailableQty) ?? 0;
            var lowStockCount = await _context.Materials.CountAsync(m => m.AvailableQty < 100);

            return new[]
            {
                new { label = "Total Raw Materials", value = $"{totalMaterials} Types", helper = $"{totalAvailableQty:N0} units in stock", icon = "inventory_2", tone = "blue" },
                new { label = "Rack Utilization", value = "78%", helper = "32 of 40 Racks occupied", icon = "shelves", tone = "green" },
                new { label = "Shortage Alerts", value = $"{lowStockCount} Items", helper = "Needs supplier reorder", icon = "warning", tone = "amber" },
                new { label = "Pending Dispatches", value = "4 Orders", helper = "Ready for customer delivery", icon = "local_shipping", tone = "purple" }
            };
        }

        public async Task<object> GetShelvesPreviewAsync()
        {
            return new[]
            {
                new { code = "A-101", tone = "full" },
                new { code = "A-102", tone = "high" },
                new { code = "A-103", tone = "medium" },
                new { code = "A-104", tone = "low" },
                new { code = "A-201", tone = "high" },
                new { code = "A-202", tone = "full" },
                new { code = "A-203", tone = "medium" },
                new { code = "A-204", tone = "empty" },
                new { code = "A-301", tone = "medium" },
                new { code = "A-302", tone = "low" },
                new { code = "A-303", tone = "full" },
                new { code = "A-304", tone = "high" },
                new { code = "A-401", tone = "low" },
                new { code = "A-402", tone = "empty" },
                new { code = "A-403", tone = "high" },
                new { code = "A-404", tone = "full" }
            };
        }

        public async Task<object> GetStockAsync()
        {
            var rawMaterials = await _context.Materials.Select(m => new
            {
                sku = m.MaterialCode,
                item = m.Name,
                type = string.IsNullOrEmpty(m.Type) ? "Raw Material" : m.Type,
                quantity = $"{m.AvailableQty:N0} {m.Unit}",
                location = "Zone A - Rack 01",
                status = m.AvailableQty < 100 ? "Low Stock" : "In Stock"
            }).ToListAsync();

            var finishedGoods = await _context.Inventories.Where(i => i.Type == "Finished Goods").Select(i => new
            {
                sku = i.SKU,
                item = i.ItemName,
                type = "Finished Goods",
                quantity = $"{i.Quantity:N0} pcs",
                location = string.IsNullOrEmpty(i.Location) ? "Rack 02" : i.Location,
                status = i.Quantity < 20 ? "Low Stock" : "In Stock"
            }).ToListAsync();

            var combined = new List<object>();
            combined.AddRange(rawMaterials);
            combined.AddRange(finishedGoods);

            if (!combined.Any())
            {
                combined.Add(new { sku = "MAT-001", item = "Dyed Cotton", type = "Fabric", quantity = "1,000 m", location = "Zone A - Rack 01", status = "In Stock" });
                combined.Add(new { sku = "MAT-002", item = "Dyed Thread", type = "Thread", quantity = "5,000 spool", location = "Zone A - Rack 02", status = "In Stock" });
                combined.Add(new { sku = "MAT-003", item = "Buttons", type = "Accessory", quantity = "10,000 pcs", location = "Zone B - Shelf 04", status = "In Stock" });
                combined.Add(new { sku = "MAT-004", item = "Zipper", type = "Accessory", quantity = "2,000 pcs", location = "Zone B - Shelf 05", status = "In Stock" });
            }

            return combined;
        }

        public async Task<object> GetVisualizationDataAsync()
        {
            var kpis = new[]
            {
                new { label = "Active Capacity", value = "84%", hint = "Across 4 main storage zones", icon = "warehouse", tone = "blue", progress = 84 },
                new { label = "Occupied Shelves", value = "128 / 150", hint = "22 empty shelves available", icon = "shelves", tone = "green", progress = 85 },
                new { label = "Low Stock Locations", value = "3 Racks", hint = "Material reorder required", icon = "warning", tone = "soft", progress = 25 },
                new { label = "Quarantine Goods", value = "15 Units", hint = "Customer returns & damaged goods", icon = "report", tone = "soft", progress = 10 }
            };

            var rooms = new[]
            {
                new { floor = "Ground Floor", name = "Room A - Raw Fabrics", utilization = 88, shelves = "8 Racks / 32 Shelves", tone = "blue", active = true },
                new { floor = "Ground Floor", name = "Room B - Finished Garments", utilization = 75, shelves = "6 Racks / 24 Shelves", tone = "green", active = false },
                new { floor = "1st Floor", name = "Room C - Accessories & Trims", utilization = 62, shelves = "4 Racks / 16 Shelves", tone = "amber", active = false },
                new { floor = "1st Floor", name = "Room D - Returns & Quarantine", utilization = 30, shelves = "2 Racks / 8 Shelves", tone = "purple", active = false }
            };

            var materialsList = await _context.Materials.ToListAsync();
            var mat1 = materialsList.ElementAtOrDefault(0)?.Name ?? "Dyed Cotton Fabric";
            var qty1 = materialsList.ElementAtOrDefault(0)?.AvailableQty.ToString("N0") ?? "850";
            var unit1 = materialsList.ElementAtOrDefault(0)?.Unit ?? "m";

            var mat2 = materialsList.ElementAtOrDefault(1)?.Name ?? "Dyed Thread Spools";
            var qty2 = materialsList.ElementAtOrDefault(1)?.AvailableQty.ToString("N0") ?? "3,400";
            var unit2 = materialsList.ElementAtOrDefault(1)?.Unit ?? "spool";

            var shelves = new[]
            {
                new { code = "A-401", tone = "low", active = false, item = "Zippers 12inch", quantity = "150 pcs", capacity = "1,000 pcs", type = "Accessory" },
                new { code = "A-402", tone = "empty", active = false, item = "Empty Shelf", quantity = "0", capacity = "500 pcs", type = "Unassigned" },
                new { code = "A-403", tone = "high", active = false, item = mat2, quantity = $"{qty2} {unit2}", capacity = "4,000 spools", type = "Thread" },
                new { code = "A-404", tone = "full", active = false, item = mat1, quantity = $"{qty1} {unit1}", capacity = "1,000 m", type = "Fabric" },

                new { code = "A-301", tone = "medium", active = false, item = "Buttons 15mm", quantity = "4,500 pcs", capacity = "10,000 pcs", type = "Accessory" },
                new { code = "A-302", tone = "low", active = false, item = "Elastic Band 2inch", quantity = "80 m", capacity = "500 m", type = "Accessory" },
                new { code = "A-303", tone = "full", active = false, item = "Polo Shirt Finished", quantity = "250 pcs", capacity = "250 pcs", type = "Finished Goods" },
                new { code = "A-304", tone = "high", active = false, item = "Denim Fabric Roll", quantity = "620 m", capacity = "800 m", type = "Fabric" },

                new { code = "A-201", tone = "high", active = true, item = mat1, quantity = $"{qty1} {unit1}", capacity = "1,000 m", type = "Fabric" },
                new { code = "A-202", tone = "full", active = false, item = "Casual Shirts Finished", quantity = "400 pcs", capacity = "400 pcs", type = "Finished Goods" },
                new { code = "A-203", tone = "medium", active = false, item = "Polyester Thread", quantity = "1,200 spools", capacity = "3,000 spools", type = "Thread" },
                new { code = "A-204", tone = "empty", active = false, item = "Empty Shelf", quantity = "0", capacity = "500 pcs", type = "Unassigned" },

                new { code = "A-101", tone = "full", active = false, item = "Heavy Linen Fabric", quantity = "500 m", capacity = "500 m", type = "Fabric" },
                new { code = "A-102", tone = "high", active = false, item = "Tracksuit Finished", quantity = "180 pcs", capacity = "200 pcs", type = "Finished Goods" },
                new { code = "A-103", tone = "medium", active = false, item = "School Uniform Shirts", quantity = "310 pcs", capacity = "600 pcs", type = "Finished Goods" },
                new { code = "A-104", tone = "low", active = false, item = "Metallic Zippers", quantity = "45 pcs", capacity = "500 pcs", type = "Accessory" }
            };

            var lowStockItems = new List<object>();
            foreach (var m in materialsList.Where(x => x.AvailableQty < 200))
            {
                lowStockItems.Add(new
                {
                    location = "Zone A - Rack 01",
                    item = m.Name,
                    type = string.IsNullOrEmpty(m.Type) ? "Raw Material" : m.Type,
                    quantity = $"{m.AvailableQty:N0} {m.Unit}"
                });
            }

            if (!lowStockItems.Any())
            {
                lowStockItems.Add(new { location = "Zone B - Shelf A-104", item = "Metallic Zippers", type = "Accessory", quantity = "45 pcs" });
                lowStockItems.Add(new { location = "Zone A - Shelf A-302", item = "Elastic Band 2inch", type = "Accessory", quantity = "80 m" });
            }

            return new
            {
                kpis,
                rooms,
                shelves,
                locationRows = shelves,
                lowStockItems
            };
        }

        // </crudgen:methods>
    }
}
