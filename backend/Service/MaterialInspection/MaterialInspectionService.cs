using Dapper;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.MaterialInspection;
using backend.Model;
using backend.Model.Enums;
using backend.Service.PurchaseOrder;

namespace backend.Service.MaterialInspection
{
    public class MaterialInspectionService : IMaterialInspectionService
    {
        private readonly AppDbContext _context;
        private readonly IPurchaseOrderService _purchaseOrderService;

        public MaterialInspectionService(AppDbContext context, IPurchaseOrderService purchaseOrderService)
        {
            _context = context;
            _purchaseOrderService = purchaseOrderService;
        }

        public async Task<List<MaterialInspectionDto>> GetAllAsync(
            Guid? purchaseOrderReceiptId = null,
            string? inspectionStatus = null
        )
        {
            var connection = _context.Database.GetDbConnection();
            var parameters = new DynamicParameters();

            using var multi = await connection.QueryMultipleAsync(
                "sp_GetMaterialInspections",
                parameters,
                commandType: System.Data.CommandType.StoredProcedure
            );

            var inspections = !multi.IsConsumed ? (await multi.ReadAsync<MaterialInspectionDto>()).ToList() : new List<MaterialInspectionDto>();
            var items = !multi.IsConsumed ? (await multi.ReadAsync<MaterialInspectionItemDto>()).ToList() : new List<MaterialInspectionItemDto>();

            foreach (var insp in inspections)
            {
                insp.Items = items.Where(i => i.MaterialInspectionId == insp.Id).ToList();
            }

            // Filtering done in memory

            if (purchaseOrderReceiptId.HasValue) inspections = inspections.Where(i => i.PurchaseOrderReceiptId == purchaseOrderReceiptId.Value).ToList();
            if (!string.IsNullOrWhiteSpace(inspectionStatus)) inspections = inspections.Where(i => i.InspectionStatus.ToString() == inspectionStatus).ToList();
            return inspections;
        }

        public async Task<MaterialInspectionDto?> GetByIdAsync(Guid id)
        {
            var query = _context.MaterialInspections
                .Include(i => i.Items)
                    .ThenInclude(item => item.Material)
                .Include(i => i.PurchaseOrderReceipt)
                    .ThenInclude(r => r!.PurchaseOrder)
                .Include(i => i.Supplier)
                .Where(i => i.Id == id);

            var inspection = await query.FirstOrDefaultAsync();
            if (inspection == null) return null;
            
            return new MaterialInspectionDto
            {
                Id = inspection.Id,
                PurchaseOrderReceiptId = inspection.PurchaseOrderReceiptId,
                ReceiptNumber = inspection.PurchaseOrderReceipt?.ReceiptNumber ?? string.Empty,
                PurchaseOrderId = inspection.PurchaseOrderReceipt?.PurchaseOrderId,
                OrderNumber = inspection.PurchaseOrderReceipt?.PurchaseOrder?.OrderNumber ?? string.Empty,
                SupplierId = inspection.SupplierId,
                SupplierCode = inspection.Supplier?.SupplierCode ?? string.Empty,
                SupplierName = inspection.Supplier?.Name ?? string.Empty,
                InspectionStatus = inspection.InspectionStatus,
                InspectorName = inspection.InspectorName,
                Notes = inspection.Notes,
                CreatedAt = inspection.CreatedAt,
                UpdatedAt = inspection.UpdatedAt,
                Items = inspection.Items.Select(item => new MaterialInspectionItemDto
                {
                    Id = item.Id,
                    MaterialInspectionId = item.MaterialInspectionId,
                    MaterialId = item.MaterialId,
                    MaterialCode = item.Material.MaterialCode,
                    MaterialName = item.Material.Name,
                    ReceivedQuantity = item.ReceivedQuantity,
                    AcceptedQuantity = item.AcceptedQuantity,
                    RejectedQuantity = item.RejectedQuantity,
                    InspectionStatus = item.InspectionStatus.ToString(),
                    Notes = item.Notes,
                    CreatedAt = item.CreatedAt,
                    UpdatedAt = item.UpdatedAt
                }).ToList()
            };
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            return false;
        }

        public async Task<bool> UpdateInspectionAsync(Guid id, UpdateMaterialInspectionDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var inspection = await _context.MaterialInspections
                    .Include(i => i.Items)
                        .ThenInclude(item => item.Material)
                    .Include(i => i.PurchaseOrderReceipt)
                    .FirstOrDefaultAsync(i => i.Id == id);

                if (inspection == null)
                {
                    throw new KeyNotFoundException($"Material inspection with ID {id} not found.");
                }

                // Check if inspection is already in a final state (Accepted, Rejected, or PartiallyAccepted)
                if (inspection.InspectionStatus == InspectionStatus.Accepted || 
                    inspection.InspectionStatus == InspectionStatus.Rejected || 
                    inspection.InspectionStatus == InspectionStatus.PartiallyAccepted)
                {
                    throw new InvalidOperationException($"Material inspection {id} has already been completed.");
                }

                if (dto.InspectorName != null) inspection.InspectorName = dto.InspectorName;
                if (dto.Notes != null) inspection.Notes = dto.Notes;
                inspection.UpdatedAt = DateTime.UtcNow;

                if (dto.Items.Any())
                {
                    foreach (var itemDto in dto.Items)
                    {
                        var item = inspection.Items.FirstOrDefault(i => i.Id == itemDto.Id);
                        if (item == null)
                        {
                            throw new KeyNotFoundException($"Inspection item {itemDto.Id} not found in inspection {id}.");
                        }

                        await ProcessInspectionItemAsync(item, itemDto, inspection);
                    }
                }

                // Check if ALL items are now completed (Accepted, Rejected, or PartiallyAccepted)
                bool allCompleted = true;
                bool allAccepted = true;
                bool allRejected = true;
                
                foreach (var item in inspection.Items)
                {
                    if (item.InspectionStatus == InspectionStatus.Pending)
                    {
                        allCompleted = false;
                        allAccepted = false;
                        allRejected = false;
                        break;
                    }
                    
                    if (item.InspectionStatus != InspectionStatus.Accepted)
                        allAccepted = false;
                    
                    if (item.InspectionStatus != InspectionStatus.Rejected)
                        allRejected = false;
                }

                // Automatically set inspection status based on item results
                if (allCompleted && inspection.Items.Any())
                {
                    if (allAccepted)
                    {
                        inspection.InspectionStatus = InspectionStatus.Accepted;
                    }
                    else if (allRejected)
                    {
                        inspection.InspectionStatus = InspectionStatus.Rejected;
                    }
                    else
                    {
                        // Mix of accepted and rejected
                        inspection.InspectionStatus = InspectionStatus.PartiallyAccepted;
                    }
                }

                await _context.SaveChangesAsync();
                
                if (allCompleted && inspection.Items.Any() && inspection.PurchaseOrderReceipt != null && inspection.PurchaseOrderReceipt.PurchaseOrderId != Guid.Empty)
                {
                    await _purchaseOrderService.RecalculateOrderStatusAsync(inspection.PurchaseOrderReceipt.PurchaseOrderId);
                }
                await transaction.CommitAsync();
                
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> UpdateInspectionItemAsync(Guid itemId, UpdateMaterialInspectionItemDto dto)
        {
            throw new NotImplementedException("Use UpdateInspectionAsync instead.");
        }

        private async Task ProcessInspectionItemAsync(
            MaterialInspectionItem item, 
            UpdateMaterialInspectionItemDto dto, 
            backend.Model.MaterialInspection inspection)
        {
            if (item.InspectionStatus != InspectionStatus.Pending)
            {
                throw new InvalidOperationException($"Material inspection item {item.Id} has already been processed.");
            }

            var acceptedQuantity = dto.AcceptedQuantity ?? item.AcceptedQuantity;
            var rejectedQuantity = dto.RejectedQuantity ?? item.RejectedQuantity;

            if (acceptedQuantity < 0) throw new InvalidOperationException("Accepted quantity cannot be negative.");
            if (rejectedQuantity < 0) throw new InvalidOperationException("Rejected quantity cannot be negative.");

            var inspectedQuantity = acceptedQuantity + rejectedQuantity;

            if (inspectedQuantity > item.ReceivedQuantity)
                throw new InvalidOperationException($"Accepted ({acceptedQuantity}) + rejected ({rejectedQuantity}) cannot exceed received quantity ({item.ReceivedQuantity}).");

            if (inspectedQuantity < item.ReceivedQuantity)
                throw new InvalidOperationException($"Inspection is incomplete. Received: {item.ReceivedQuantity}, Inspected: {inspectedQuantity}. Must inspect all units.");

            InspectionStatus itemStatus;
            if (acceptedQuantity == item.ReceivedQuantity) itemStatus = InspectionStatus.Accepted;
            else if (rejectedQuantity == item.ReceivedQuantity) itemStatus = InspectionStatus.Rejected;
            else itemStatus = InspectionStatus.PartiallyAccepted;

            item.AcceptedQuantity = acceptedQuantity;
            item.RejectedQuantity = rejectedQuantity;
            item.InspectionStatus = itemStatus;
            item.Notes = dto.Notes ?? item.Notes;
            item.UpdatedAt = DateTime.UtcNow;

            if (acceptedQuantity > 0)
            {
                var material = item.Material;
                
                // Legacy Material.AvailableQty is intentionally no longer updated here.
                // Inventory.Quantity is the sole source of truth for stock quantities. // Inventory represents physical location. Null WarehouseShelfId represents staging.
                var inventory = await _context.Inventories.FirstOrDefaultAsync(x => x.MaterialId == material.Id && x.WarehouseShelfId == null);

                if (inventory == null)
                {
                    inventory = new backend.Model.Inventory
                    {
                        Id = Guid.NewGuid(),
                        MaterialId = material.Id,
                        WarehouseShelfId = null,
                        SKU = material.MaterialCode,
                        ItemName = material.Name,
                        Type = "Material",
                        Quantity = acceptedQuantity,
                        Location = string.Empty, 
                        Status = "Staging", // Explicit staging status for null shelf
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                    };
                    await _context.Inventories.AddAsync(inventory);
                }
                else
                {
                    inventory.Quantity += acceptedQuantity;
                    inventory.UpdatedAt = DateTime.UtcNow;
                }

                var invTransaction = new backend.Model.Transaction
                {
                    Id = Guid.NewGuid(),
                    Timestamp = DateTime.UtcNow,
                    TransactionType = "Material Received",
                    Amount = acceptedQuantity,
                    PaymentMethod = "N/A",
                    ReferenceEntity = $"Receipt-{inspection.PurchaseOrderReceiptId}",
                    HandledBy = "System",
                    Status = "Completed",
                    Notes = $"Accepted {acceptedQuantity} units after material inspection.",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                };
                await _context.Transactions.AddAsync(invTransaction);
            }

            if (rejectedQuantity > 0)
            {
                var supplierIdForReturn = inspection.SupplierId;
                if (!supplierIdForReturn.HasValue && inspection.PurchaseOrderReceipt?.PurchaseOrderId != null && inspection.PurchaseOrderReceipt.PurchaseOrderId != Guid.Empty)
                {
                    supplierIdForReturn = await _context.PurchaseOrders
                        .Where(po => po.Id == inspection.PurchaseOrderReceipt.PurchaseOrderId)
                        .Select(po => po.SupplierId)
                        .FirstOrDefaultAsync();
                }

                var supplierReturn = new SupplierReturn
                {
                    Id = Guid.NewGuid(),
                    SupplierId = supplierIdForReturn ?? Guid.Empty,
                    PurchaseOrderReceiptId = inspection.PurchaseOrderReceiptId,
                    MaterialInspectionId = inspection.Id,
                    MaterialInspectionItemId = item.Id,
                    MaterialId = item.MaterialId,
                    ReturnedQuantity = rejectedQuantity,
                    ReturnStatus = "Pending",
                    ReturnDate = DateTime.UtcNow,
                    Notes = item.Notes,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                };

                await _context.SupplierReturns.AddAsync(supplierReturn);
            }
        }
    }
}
