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

            var receipts = !multi.IsConsumed ? (await multi.ReadAsync<PurchaseOrderReceiptDto>()).ToList() : new List<PurchaseOrderReceiptDto>();
            var items = !multi.IsConsumed ? (await multi.ReadAsync<PurchaseOrderReceiptItemDto>()).ToList() : new List<PurchaseOrderReceiptItemDto>();

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
            // Load Purchase Order
            var po = await _purchaseOrderService.GetByIdAsync(dto.PurchaseOrderId);

            if (po == null)
                throw new InvalidOperationException($"Purchase Order with ID {dto.PurchaseOrderId} not found.");

            // Validate receipt items exist
            if (dto.Items == null || !dto.Items.Any())
                throw new InvalidOperationException("At least one receipt item is required.");

            // Aggregate incoming quantities by PO Item
            var incomingQuantities = dto.Items
                .GroupBy(x => x.PurchaseOrderItemId)
                .ToDictionary(
                    g => g.Key,
                    g => g.Sum(x => x.ReceivedQuantity)
                );

            // Validate every incoming item
            foreach (var itemDto in dto.Items)
            {
                if (itemDto.ReceivedQuantity <= 0)
                {
                    throw new InvalidOperationException($"Received quantity for Purchase Order Item {itemDto.PurchaseOrderItemId} must be greater than zero.");
                }

                var poItem = po.Items.FirstOrDefault(x => x.Id == itemDto.PurchaseOrderItemId);

                if (poItem == null)
                    throw new InvalidOperationException( $"Purchase Order Item {itemDto.PurchaseOrderItemId} does not belong to Purchase Order {dto.PurchaseOrderId}.");
            }

            // Validate cumulative quantities
            foreach (var entry in incomingQuantities)
            {
                var poItem = po.Items.First(x => x.Id == entry.Key);

                var alreadyReceived = po.Receipts?
                    .SelectMany(r => r.Items ?? new List<PurchaseOrderReceiptItemDto>())
                    .Where( ri => ri.PurchaseOrderItemId == poItem.Id)
                    .Sum( ri => ri.ReceivedQuantity ) ?? 0m;

                var currentReceiptQuantity = entry.Value;

                var totalReceivedAfterThisReceipt = alreadyReceived + currentReceiptQuantity;

                if (totalReceivedAfterThisReceipt > poItem.OrderedQuantity)
                {
                    throw new InvalidOperationException(
                        $"Cannot receive {currentReceiptQuantity} units " +
                        $"for Purchase Order Item {poItem.Id}. " +
                        $"Ordered: {poItem.OrderedQuantity}, " +
                        $"Already received: {alreadyReceived}, " +
                        $"Current receipt: {currentReceiptQuantity}, " +
                        $"Total after receipt: {totalReceivedAfterThisReceipt}."
                    );
                }
            }

            // Start transaction
            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var now = DateTime.UtcNow;

                // Generate Receipt information
                var receiptId = dto.Id == Guid.Empty ? Guid.NewGuid() : dto.Id;

                var receiptNumber = string.IsNullOrWhiteSpace(dto.ReceiptNumber) ? $"REC-{now:yyyyMMddHHmmss}" : dto.ReceiptNumber;

                var receiptStatus = ReceiptStatus.PendingInspection;

                var receivedDate = dto.ReceivedDate == default ? now : dto.ReceivedDate;

                // Create Purchase Order Receipt
                await _context.Database.ExecuteSqlInterpolatedAsync($@"
                    EXEC sp_InsertPurchaseOrderReceipt
                        @Id = {receiptId},
                        @PurchaseOrderId = {dto.PurchaseOrderId},
                        @ReceiptNumber = {receiptNumber},
                        @ReceivedDate = {receivedDate},
                        @ReceivedBy = {(object?)dto.ReceivedBy ?? DBNull.Value},
                        @DeliveryNoteNumber = {(object?)dto.DeliveryNoteNumber ?? DBNull.Value},
                        @Remarks = {(object?)dto.Remarks ?? DBNull.Value},
                        @Status = {(int)receiptStatus},
                        @CreatedAt = {now},
                        @UpdatedAt = {now}
                ");

                // Create Material Inspection
                var inspectionId = Guid.NewGuid();

                var inspectionNotes = $"Auto-created inspection for Receipt {receiptNumber}";

                await _context.Database.ExecuteSqlInterpolatedAsync($@"
                    EXEC sp_InsertMaterialInspection
                        @Id = {inspectionId},
                        @PurchaseOrderReceiptId = {receiptId},
                        @SupplierId = {po.SupplierId},
                        @InspectionStatus = {(int)InspectionStatus.Pending},
                        @Notes = {inspectionNotes},
                        @InspectorName = {""},
                        @CreatedAt = {now},
                        @UpdatedAt = {now}
                ");

                // Create Receipt Items + Inspection Items
                foreach (var itemDto in dto.Items)
                {
                    var poItem = po.Items.First( x => x.Id == itemDto.PurchaseOrderItemId );

                    var receiptItemId = itemDto.Id == Guid.Empty ? Guid.NewGuid(): itemDto.Id;

                    // Receipt Item
                    await _context.Database.ExecuteSqlInterpolatedAsync($@"
                        EXEC sp_InsertPurchaseOrderReceiptItems
                            @Id = {receiptItemId},
                            @PurchaseOrderReceiptId = {receiptId},
                            @PurchaseOrderItemId = {poItem.Id},
                            @MaterialId = {poItem.MaterialId},
                            @ReceivedQuantity = {itemDto.ReceivedQuantity},
                            @CreatedAt = {now},
                            @UpdatedAt = {now}
                    ");

                    // Inspection Item
                    var inspectionItemId = Guid.NewGuid();

                    await _context.Database.ExecuteSqlInterpolatedAsync($@"
                        EXEC sp_InsertMaterialInspectionItems
                            @Id = {inspectionItemId},
                            @MaterialInspectionId = {inspectionId},
                            @PurchaseOrderReceiptItemId = {receiptItemId},
                            @MaterialId = {poItem.MaterialId},
                            @ReceivedQuantity = {itemDto.ReceivedQuantity},
                            @AcceptedQuantity = {0},
                            @RejectedQuantity = {0},
                            @InspectionStatus = {(int)InspectionStatus.Pending},
                            @Notes = {""},
                            @CreatedAt = {now},
                            @UpdatedAt = {now}
                    ");
                }

                // Determine Purchase Order delivery status
                var allDelivered = true;
                var anyReceived = false;

                foreach (var poItem in po.Items)
                {
                    // Already received BEFORE this receipt
                    var alreadyReceived = po.Receipts?
                        .SelectMany(r => r.Items ?? new List<PurchaseOrderReceiptItemDto>())
                        .Where( ri => ri.PurchaseOrderItemId == poItem.Id)
                        .Sum( ri => ri.ReceivedQuantity) ?? 0m;

                    // Received IN THIS receipt
                    var currentReceived = incomingQuantities.TryGetValue(poItem.Id, out var currentQuantity)  ? currentQuantity : 0m;

                    var totalReceived = alreadyReceived + currentReceived;

                    // At least some quantity has been received
                    if (totalReceived > 0)
                        anyReceived = true;

                    // This PO item is not completely delivered
                    if (totalReceived < poItem.OrderedQuantity)
                        allDelivered = false;
                }

                //  Determine final PO status
                var newStatus = allDelivered ? OrderStatus.Delivered : anyReceived ? OrderStatus.PartiallyDelivered : OrderStatus.Pending;
                // Update Purchase Order status ONCE
                await _context.Database.ExecuteSqlInterpolatedAsync($@"
                    EXEC sp_UpdatePurchaseOrders
                        @Id = {dto.PurchaseOrderId},
                        @Status = {(int)newStatus},
                        @UpdatedAt = {DateTime.UtcNow}
                ");

                await transaction.CommitAsync();

                // Reload it because the receipt was created through
                // stored procedures.
                return await GetByIdAsync(receiptId);
            }
            catch
            {
                // Rollback EVERYTHING if anything failed
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> UpdateReceiptAsync(Guid id, PurchaseOrderReceiptDto dto)
        {
            var receipt = await GetByIdAsync(id);
            if (receipt == null) return false;

            var newStatus = dto.Status != null && Enum.TryParse<backend.Model.Enums.ReceiptStatus>(dto.Status, true, out var pStatus) 
                ? pStatus 
                : Enum.Parse<backend.Model.Enums.ReceiptStatus>(receipt.Status);

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdatePurchaseOrderReceipts 
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
