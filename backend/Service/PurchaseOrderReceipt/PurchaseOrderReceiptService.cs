using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Dapper;
using backend.Data;
using backend.Dto.PurchaseOrderReceipt;
using backend.Service.PurchaseOrder;
using backend.Model.Enums;

namespace backend.Service.PurchaseOrderReceipt
{
    public class PurchaseOrderReceiptService : IPurchaseOrderReceiptService
    {
        private readonly AppDbContext _context;
        private readonly IPurchaseOrderService _purchaseOrderService;

        public PurchaseOrderReceiptService(AppDbContext context, IPurchaseOrderService purchaseOrderService)
        {
            _context = context;
            _purchaseOrderService = purchaseOrderService;
        }

        public async Task<List<PurchaseOrderReceiptDto>> GetAllAsync( Guid? id = null, Guid? purchaseOrderId = null, string? receiptNumber = null )
        {
            var connection = _context.Database.GetDbConnection();

            var parameters = new DynamicParameters();
            parameters.Add("@Id", id);

            using var multi = await connection.QueryMultipleAsync(
                "sp_GetPurchaseOrderReceipts",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            var receipts = (await multi.ReadAsync<PurchaseOrderReceiptDto>()).ToList();
            var items = (await multi.ReadAsync<PurchaseOrderReceiptItemDto>()).ToList();

            foreach (var r in receipts)
            {
                r.Items = items.Where(ri => ri.PurchaseOrderReceiptId == r.Id).ToList();
            }

            // Filtering done in memory

            if (purchaseOrderId.HasValue) receipts = receipts.Where(r => r.PurchaseOrderId == purchaseOrderId.Value).ToList();
            if (!string.IsNullOrWhiteSpace(receiptNumber)) receipts = receipts.Where(r => r.ReceiptNumber == receiptNumber).ToList();
            return receipts;
        }

        public async Task<PurchaseOrderReceiptDto?> GetByIdAsync(Guid id)
        {
            var list = await GetAllAsync(id: id);
            return list.FirstOrDefault();
        }

        public async Task<PurchaseOrderReceiptDto?> ReceiveMaterialsAsync(PurchaseOrderReceiptDto dto)
        {
            var po = await _purchaseOrderService.GetByIdAsync(
                dto.PurchaseOrderId
            );

            if (po == null)
            {
                throw new InvalidOperationException(
                    $"Purchase Order with ID {dto.PurchaseOrderId} not found."
                );
            }

            if (dto.Items == null || !dto.Items.Any())
            {
                throw new InvalidOperationException(
                    "At least one receipt item is required."
                );
            }

            // Validate every item BEFORE inserting anything.
            foreach (var itemDto in dto.Items)
            {
                var poItem = po.Items.FirstOrDefault(
                    i => i.Id == itemDto.PurchaseOrderItemId
                );

                if (poItem == null)
                {
                    throw new InvalidOperationException(
                        $"Purchase Order Item " +
                        $"{itemDto.PurchaseOrderItemId} does not belong " +
                        $"to Purchase Order {dto.PurchaseOrderId}."
                    );
                }

                if (itemDto.ReceivedQuantity <= 0)
                {
                    throw new InvalidOperationException(
                        $"Received quantity for material " +
                        $"{poItem.MaterialId} must be greater than zero."
                    );
                }

                // Find everything already received for this PO item.
                var alreadyReceived = po.Receipts?
                    .SelectMany(r => r.Items ?? new List<PurchaseOrderReceiptItemDto>())
                    .Where(ri => ri.PurchaseOrderItemId == poItem.Id)
                    .Sum(ri => ri.ReceivedQuantity) ?? 0m;

                var remainingQuantity =
                    poItem.OrderedQuantity - alreadyReceived;

                if (itemDto.ReceivedQuantity > remainingQuantity)
                {
                    throw new InvalidOperationException(
                        $"Cannot receive {itemDto.ReceivedQuantity} " +
                        $"units for Purchase Order Item " +
                        $"{poItem.Id}. " +
                        $"Ordered: {poItem.OrderedQuantity}, " +
                        $"Already received: {alreadyReceived}, " +
                        $"Remaining: {remainingQuantity}."
                    );
                }
            }

            // Everything passed validation.
            // Now create the receipt.
            var receiptId = dto.Id == Guid.Empty ? Guid.NewGuid() : dto.Id;

            var receiptNumber = string.IsNullOrWhiteSpace(dto.ReceiptNumber)
                    ? $"REC-{DateTime.UtcNow:yyyyMMddHHmmss}"
                    : dto.ReceiptNumber;
            
            if (!Enum.TryParse<ReceiptStatus>(dto.Status, true, out var receiptStatus))
            {
                throw new InvalidOperationException(
                    $"Invalid receipt status: {dto.Status}"
                );
            }

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertPurchaseOrderReceipt 
                    @Id = {receiptId}, 
                    @PurchaseOrderId = {dto.PurchaseOrderId}, 
                    @ReceiptNumber = {receiptNumber}, 
                    @ReceivedDate = {(dto.ReceivedDate == default ? DateTime.UtcNow : dto.ReceivedDate)}, 
                    @ReceivedBy = {(object?)dto.ReceivedBy ?? DBNull.Value}, 
                    @DeliveryNoteNumber = {(object?)dto.DeliveryNoteNumber ?? DBNull.Value}, 
                    @Remarks = {(object?)dto.Remarks ?? DBNull.Value}, 
                    @Status = {(int)receiptStatus}, 
                    @CreatedAt = {DateTime.UtcNow}, 
                    @UpdatedAt = {DateTime.UtcNow}
            ");

            // Create inspection for the receipt.
            var inspectionId = Guid.NewGuid();

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertMaterialInspection 
                    @Id = {inspectionId}, 
                    @PurchaseOrderReceiptId = {receiptId}, 
                    @SupplierId = {po.SupplierId}, 
                    @InspectionStatus = {"Pending"}, 
                    @Notes = {$"Auto-created inspection for Receipt {receiptNumber}"}, 
                    @InspectorName = {""}, 
                    @CreatedAt = {DateTime.UtcNow}, 
                    @CreatedBy = {(object?)dto.ReceivedBy ?? "System"}, 
                    @UpdatedAt = {DateTime.UtcNow}, 
                    @UpdatedBy = {(object?)dto.ReceivedBy ?? "System"}
            ");

            // Insert each receipt item.
            foreach (var itemDto in dto.Items)
            {
                // We already validated this above.
                var poItem = po.Items.First(
                    i => i.Id == itemDto.PurchaseOrderItemId
                );

                var receiptItemId = itemDto.Id == Guid.Empty
                    ? Guid.NewGuid()
                    : itemDto.Id;

                await _context.Database.ExecuteSqlInterpolatedAsync($@"
                    EXEC sp_InsertPurchaseOrderReceiptItem 
                        @Id = {receiptItemId}, 
                        @PurchaseOrderReceiptId = {receiptId}, 
                        @PurchaseOrderItemId = {poItem.Id}, 
                        @MaterialId = {poItem.MaterialId}, 
                        @ReceivedQuantity = {itemDto.ReceivedQuantity}, 
                        @CreatedAt = {DateTime.UtcNow}, 
                        @UpdatedAt = {DateTime.UtcNow}
                ");

                // Create inspection item.
                await _context.Database.ExecuteSqlInterpolatedAsync($@"
                    EXEC sp_InsertMaterialInspectionItem 
                        @Id = {Guid.NewGuid()}, 
                        @MaterialInspectionId = {inspectionId}, 
                        @PurchaseOrderReceiptItemId = {receiptItemId}, 
                        @MaterialId = {poItem.MaterialId}, 
                        @ReceivedQuantity = {itemDto.ReceivedQuantity},
                        @AcceptedQuantity = {0},
                        @RejectedQuantity = {0},
                        @InspectionStatus = {(int)backend.Model.Enums.InspectionStatus.Pending}, 
                        @Notes = {""}, 
                        @CreatedAt = {DateTime.UtcNow}, 
                        @CreatedBy = {(object?)dto.ReceivedBy ?? "System"}, 
                        @UpdatedAt = {DateTime.UtcNow}, 
                        @UpdatedBy = {(object?)dto.ReceivedBy ?? "System"}
                ");
            }

            // Recalculate the ENTIRE PO after all receipt items
            // have been successfully inserted.
            await _purchaseOrderService.RecalculateOrderStatusAsync(
                dto.PurchaseOrderId
            );

            return await GetByIdAsync(receiptId);
        }
        
        public async Task<bool> UpdateReceiptAsync(Guid id, PurchaseOrderReceiptDto dto)
        {
            var receipt = await GetByIdAsync(id);
            if (receipt == null) return false;

            var newStatus = dto.Status != null && Enum.TryParse<backend.Model.Enums.ReceiptStatus>(dto.Status, true, out var pStatus) 
                ? pStatus 
                : Enum.Parse<backend.Model.Enums.ReceiptStatus>(receipt.Status);

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdatePurchaseOrderReceipt 
                    @Id = {id}, 
                    @ReceiptNumber = {dto.ReceiptNumber ?? receipt.ReceiptNumber}, 
                    @ReceivedDate = {(dto.ReceivedDate == default ? receipt.ReceivedDate : dto.ReceivedDate)}, 
                    @ReceivedBy = {(object?)dto.ReceivedBy ?? (object?)receipt.ReceivedBy ?? DBNull.Value}, 
                    @DeliveryNoteNumber = {(object?)dto.DeliveryNoteNumber ?? (object?)receipt.DeliveryNoteNumber ?? DBNull.Value}, 
                    @Remarks = {(object?)dto.Remarks ?? (object?)receipt.Remarks ?? DBNull.Value}, 
                    @Status = {(object)(int)newStatus}, 
                    @UpdatedAt = {DateTime.UtcNow}
            ");

            await _purchaseOrderService.RecalculateOrderStatusAsync(receipt.PurchaseOrderId);
            return true;
        }

        public async Task<bool> DeleteReceiptAsync(Guid id)
        {
            var receipt = await GetByIdAsync(id);
            if (receipt == null) return false;

            await _context.Database.ExecuteSqlInterpolatedAsync($@"EXEC sp_DeletePurchaseOrderReceipt @Id = {id}");

            await _purchaseOrderService.RecalculateOrderStatusAsync(receipt.PurchaseOrderId);
            return true;
        }
    }
}
