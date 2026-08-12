using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Dapper;
using backend.Data;
using backend.Dto.PurchaseOrder;
using backend.Dto.PurchaseOrderReceipt;
using backend.Model;
using backend.Model.Enums;

namespace backend.Service.PurchaseOrder
{
    public class PurchaseOrderService : IPurchaseOrderService
    {
        private readonly AppDbContext _context;

        public PurchaseOrderService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<PurchaseOrderGetDto>> GetAllAsync(
            Guid? id = null,
            string? orderNumber = null,
            OrderStatus? status = null,
            Guid? supplierId = null,
            Guid? materialCategoryId = null
        )
        {
            var connection = _context.Database.GetDbConnection();
            
            var parameters = new DynamicParameters();
            parameters.Add("@Id", id);


            using var multi = await connection.QueryMultipleAsync(
                "sp_GetPurchaseOrders",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            var pos = (await multi.ReadAsync<PurchaseOrderGetDto>()).ToList();
            var items = (await multi.ReadAsync<PurchaseOrderItemDto>()).ToList();

            foreach (var po in pos)
            {
                po.Items = items.Where(i => i.PurchaseOrderId == po.Id).ToList();
            }

            // Filtering done in memory

            if (!string.IsNullOrWhiteSpace(orderNumber)) pos = pos.Where(p => p.OrderNumber == orderNumber).ToList();
            if (status.HasValue) pos = pos.Where(p => p.Status == status.Value).ToList();
            if (supplierId.HasValue) pos = pos.Where(p => p.SupplierId == supplierId.Value).ToList();
            if (materialCategoryId.HasValue) pos = pos.Where(p => p.MaterialCategoryId == materialCategoryId.Value).ToList();
            
            return pos;
        }

        public async Task<PurchaseOrderGetDto?> GetByIdAsync(Guid id)
        {
            var list = await GetAllAsync(id: id);
            return list.FirstOrDefault();
        }

        public async Task<PurchaseOrderGetDto?> CreateAsync(PurchaseOrderDto dto)
        {
            if (dto.MaterialCategoryId.HasValue && dto.MaterialCategoryId.Value != Guid.Empty)
            {
                var allowed = await _context.SupplierMaterialCategories
                    .AnyAsync(smc => smc.SupplierId == dto.SupplierId && smc.MaterialCategoryId == dto.MaterialCategoryId.Value);
                if (!allowed)
                {
                    var supplierHasCategories = await _context.SupplierMaterialCategories
                        .AnyAsync(smc => smc.SupplierId == dto.SupplierId);
                    if (supplierHasCategories)
                    {
                        throw new InvalidOperationException($"Supplier is not authorized for the selected material category.");
                    }
                }
            }

            var poId = dto.Id == Guid.Empty ? Guid.NewGuid() : dto.Id;
            var orderNumber = string.IsNullOrWhiteSpace(dto.OrderNumber) ? $"PO-{DateTime.UtcNow:yyyyMMddHHmmss}" : dto.OrderNumber;
            var status = dto.Status == OrderStatus.Pending ? OrderStatus.Pending : dto.Status;
            
            decimal totalAmount = 0;
            var itemDtos = new List<PurchaseOrderItemDto>();

            if (dto.Items != null && dto.Items.Any())
            {
                foreach (var itemDto in dto.Items)
                {
                    var totalPrice = itemDto.OrderedQuantity * itemDto.UnitPrice;
                    totalAmount += totalPrice;
                    itemDtos.Add(new PurchaseOrderItemDto
                    {
                        Id = itemDto.Id == Guid.Empty ? Guid.NewGuid() : itemDto.Id,
                        PurchaseOrderId = poId,
                        MaterialId = itemDto.MaterialId,
                        OrderedQuantity = itemDto.OrderedQuantity,
                        UnitPrice = itemDto.UnitPrice,
                        TotalPrice = totalPrice,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });
                }
            }

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertPurchaseOrder 
                    @Id = {poId}, 
                    @OrderNumber = {orderNumber}, 
                    @Status = {(int)status}, 
                    @TotalAmount = {totalAmount}, 
                    @SupplierId = {dto.SupplierId}, 
                    @MaterialCategoryId = {(object?)dto.MaterialCategoryId ?? DBNull.Value}, 
                    @ShippingMethod = {(object?)dto.ShippingMethod ?? DBNull.Value}, 
                    @ShippingAddress = {(object?)dto.ShippingAddress ?? DBNull.Value}, 
                    @PaymentTerms = {(object?)dto.PaymentTerms ?? DBNull.Value}, 
                    @ExpectedDeliveryDate = {dto.ExpectedDeliveryDate}, 
                    @CreatedAt = {DateTime.UtcNow}, 
                    @UpdatedAt = {DateTime.UtcNow}
            ");

            foreach (var i in itemDtos)
            {
                await _context.Database.ExecuteSqlInterpolatedAsync($@"
                    EXEC sp_InsertPurchaseOrderItem 
                        @Id = {i.Id}, 
                        @PurchaseOrderId = {i.PurchaseOrderId}, 
                        @MaterialId = {i.MaterialId}, 
                        @OrderedQuantity = {i.OrderedQuantity}, 
                        @UnitPrice = {i.UnitPrice}, 
                        @TotalPrice = {i.TotalPrice}, 
                        @CreatedAt = {i.CreatedAt}, 
                        @UpdatedAt = {i.UpdatedAt}
                ");
            }

            return await GetByIdAsync(poId);
        }

        public async Task<bool> UpdateAsync(Guid id, PurchaseOrderDto dto)
        {
            var po = await GetByIdAsync(id);
            if (po == null) return false;

            if (dto.MaterialCategoryId.HasValue && dto.MaterialCategoryId.Value != Guid.Empty && dto.SupplierId != Guid.Empty)
            {
                var allowed = await _context.SupplierMaterialCategories
                    .AnyAsync(smc => smc.SupplierId == dto.SupplierId && smc.MaterialCategoryId == dto.MaterialCategoryId.Value);
                var supplierHasCategories = await _context.SupplierMaterialCategories
                    .AnyAsync(smc => smc.SupplierId == dto.SupplierId);
                if (!allowed && supplierHasCategories)
                {
                    throw new InvalidOperationException($"Supplier is not authorized for the selected material category.");
                }
            }

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdatePurchaseOrder 
                    @Id = {id}, 
                    @OrderNumber = {dto.OrderNumber ?? po.OrderNumber}, 
                    @Status = {(int)po.Status}, 
                    @TotalAmount = {po.TotalAmount}, 
                    @SupplierId = {(dto.SupplierId != Guid.Empty ? dto.SupplierId : po.SupplierId)}, 
                    @MaterialCategoryId = {(object?)dto.MaterialCategoryId ?? DBNull.Value}, 
                    @ShippingMethod = {(object?)dto.ShippingMethod ?? (object?)po.ShippingMethod ?? DBNull.Value}, 
                    @ShippingAddress = {(object?)dto.ShippingAddress ?? (object?)po.ShippingAddress ?? DBNull.Value}, 
                    @PaymentTerms = {(object?)dto.PaymentTerms ?? (object?)po.PaymentTerms ?? DBNull.Value}, 
                    @ExpectedDeliveryDate = {(dto.ExpectedDeliveryDate != default ? dto.ExpectedDeliveryDate : po.ExpectedDeliveryDate)}, 
                    @UpdatedAt = {DateTime.UtcNow}
            ");

            await RecalculateOrderStatusAsync(id);
            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var po = await GetByIdAsync(id);
            if (po == null) return false;

            await _context.Database.ExecuteSqlInterpolatedAsync($@"EXEC sp_DeletePurchaseOrder @Id = {id}");
            return true;
        }

        #region AddItemAsync
        public async Task<PurchaseOrderItemDto?> AddItemAsync(Guid purchaseOrderId, PurchaseOrderItemDto itemDto)
        {
            var po = await GetByIdAsync(purchaseOrderId);
            if (po == null) return null;

            var totalPrice = itemDto.OrderedQuantity * itemDto.UnitPrice;
            var itemId = itemDto.Id == Guid.Empty ? Guid.NewGuid() : itemDto.Id;

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_InsertPurchaseOrderItem @Id, @PurchaseOrderId, @MaterialId, @OrderedQuantity, @UnitPrice, @TotalPrice, @CreatedAt, @UpdatedAt",
                new SqlParameter("@Id", itemId),
                new SqlParameter("@PurchaseOrderId", purchaseOrderId),
                new SqlParameter("@MaterialId", itemDto.MaterialId),
                new SqlParameter("@OrderedQuantity", itemDto.OrderedQuantity),
                new SqlParameter("@UnitPrice", itemDto.UnitPrice),
                new SqlParameter("@TotalPrice", totalPrice),
                new SqlParameter("@CreatedAt", DateTime.UtcNow),
                new SqlParameter("@UpdatedAt", DateTime.UtcNow)
            );

            var newTotal = po.TotalAmount + totalPrice;
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_UpdatePurchaseOrder @Id, @OrderNumber, @Status, @TotalAmount, @SupplierId, @MaterialCategoryId, @ShippingMethod, @ShippingAddress, @PaymentTerms, @ExpectedDeliveryDate, @UpdatedAt",
                new SqlParameter("@Id", po.Id),
                new SqlParameter("@OrderNumber", po.OrderNumber),
                new SqlParameter("@Status", (int)po.Status),
                new SqlParameter("@TotalAmount", newTotal),
                new SqlParameter("@SupplierId", po.SupplierId),
                new SqlParameter("@MaterialCategoryId", (object?)po.MaterialCategoryId ?? DBNull.Value),
                new SqlParameter("@ShippingMethod", (object?)po.ShippingMethod ?? DBNull.Value),
                new SqlParameter("@ShippingAddress", (object?)po.ShippingAddress ?? DBNull.Value),
                new SqlParameter("@PaymentTerms", (object?)po.PaymentTerms ?? DBNull.Value),
                new SqlParameter("@ExpectedDeliveryDate", po.ExpectedDeliveryDate),
                new SqlParameter("@UpdatedAt", DateTime.UtcNow)
            );

            await RecalculateOrderStatusAsync(purchaseOrderId);

            itemDto.Id = itemId;
            itemDto.PurchaseOrderId = purchaseOrderId;
            itemDto.TotalPrice = totalPrice;
            
            // To get material code/name
            var mat = await _context.Materials.FindAsync(itemDto.MaterialId);
            itemDto.MaterialCode = mat?.MaterialCode ?? string.Empty;
            itemDto.MaterialName = mat?.Name ?? string.Empty;

            return itemDto;
        }

        #endregion
        
        #region UpdateItemAsync
        public async Task<bool> UpdateItemAsync(Guid itemId, PurchaseOrderItemDto itemDto)
        {
            var items = await GetItemsByPurchaseOrderIdAsync(Guid.Empty); // Wait, this doesn't work well without PoId.
            // Alternative: find the item first
            PurchaseOrderItemDto? item = null;
            var connection = _context.Database.GetDbConnection();
            {
                if (connection.State != ConnectionState.Open) await connection.OpenAsync();
                using (var cmd = connection.CreateCommand())
                {
                    cmd.CommandText = "sp_GetPurchaseOrderItems";
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.Add(new SqlParameter("@Id", itemId));
                    using var reader = await cmd.ExecuteReaderAsync();
                    if (await reader.ReadAsync())
                    {
                        item = new PurchaseOrderItemDto
                        {
                            Id = reader.GetGuid(reader.GetOrdinal("Id")),
                            PurchaseOrderId = reader.GetGuid(reader.GetOrdinal("PurchaseOrderId")),
                            TotalPrice = reader.GetDecimal(reader.GetOrdinal("TotalPrice"))
                        };
                    }
                }
            }
            if (item == null) return false;

            var po = await GetByIdAsync(item.PurchaseOrderId);

            var newTotalPrice = itemDto.OrderedQuantity * itemDto.UnitPrice;
            
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_UpdatePurchaseOrderItem @Id, @OrderedQuantity, @UnitPrice, @TotalPrice, @UpdatedAt",
                new SqlParameter("@Id", itemId),
                new SqlParameter("@OrderedQuantity", itemDto.OrderedQuantity),
                new SqlParameter("@UnitPrice", itemDto.UnitPrice),
                new SqlParameter("@TotalPrice", newTotalPrice),
                new SqlParameter("@UpdatedAt", DateTime.UtcNow)
            );

            if (po != null)
            {
                var diff = newTotalPrice - item.TotalPrice;
                var newTotal = po.TotalAmount + diff;
                
                await _context.Database.ExecuteSqlRawAsync(
                    "EXEC sp_UpdatePurchaseOrder @Id, @OrderNumber, @Status, @TotalAmount, @SupplierId, @MaterialCategoryId, @ShippingMethod, @ShippingAddress, @PaymentTerms, @ExpectedDeliveryDate, @UpdatedAt",
                    new SqlParameter("@Id", po.Id),
                    new SqlParameter("@OrderNumber", po.OrderNumber),
                    new SqlParameter("@Status", (int)po.Status),
                    new SqlParameter("@TotalAmount", newTotal),
                    new SqlParameter("@SupplierId", po.SupplierId),
                    new SqlParameter("@MaterialCategoryId", (object?)po.MaterialCategoryId ?? DBNull.Value),
                    new SqlParameter("@ShippingMethod", (object?)po.ShippingMethod ?? DBNull.Value),
                    new SqlParameter("@ShippingAddress", (object?)po.ShippingAddress ?? DBNull.Value),
                    new SqlParameter("@PaymentTerms", (object?)po.PaymentTerms ?? DBNull.Value),
                    new SqlParameter("@ExpectedDeliveryDate", po.ExpectedDeliveryDate),
                    new SqlParameter("@UpdatedAt", DateTime.UtcNow)
                );
                await RecalculateOrderStatusAsync(po.Id);
            }

            return true;
        }
        
        #endregion

        #region Delete Item 
        public async Task<bool> DeleteItemAsync(Guid itemId)
        {
            PurchaseOrderItemDto? item = null;
            var connection = _context.Database.GetDbConnection();
            {
                if (connection.State != ConnectionState.Open) await connection.OpenAsync();
                using (var cmd = connection.CreateCommand())
                {
                    cmd.CommandText = "sp_GetPurchaseOrderItems";
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.Add(new SqlParameter("@Id", itemId));
                    using var reader = await cmd.ExecuteReaderAsync();
                    if (await reader.ReadAsync())
                    {
                        item = new PurchaseOrderItemDto
                        {
                            Id = reader.GetGuid(reader.GetOrdinal("Id")),
                            PurchaseOrderId = reader.GetGuid(reader.GetOrdinal("PurchaseOrderId")),
                            TotalPrice = reader.GetDecimal(reader.GetOrdinal("TotalPrice"))
                        };
                    }
                }
            }
            if (item == null) return false;

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_DeletePurchaseOrderItem @Id",
                new SqlParameter("@Id", itemId)
            );

            var po = await GetByIdAsync(item.PurchaseOrderId);
            if (po != null)
            {
                var newTotal = po.TotalAmount - item.TotalPrice;
                await _context.Database.ExecuteSqlRawAsync(
                    "EXEC sp_UpdatePurchaseOrder @Id, @OrderNumber, @Status, @TotalAmount, @SupplierId, @MaterialCategoryId, @ShippingMethod, @ShippingAddress, @PaymentTerms, @ExpectedDeliveryDate, @UpdatedAt",
                    new SqlParameter("@Id", po.Id),
                    new SqlParameter("@OrderNumber", po.OrderNumber),
                    new SqlParameter("@Status", (int)po.Status),
                    new SqlParameter("@TotalAmount", newTotal),
                    new SqlParameter("@SupplierId", po.SupplierId),
                    new SqlParameter("@MaterialCategoryId", (object?)po.MaterialCategoryId ?? DBNull.Value),
                    new SqlParameter("@ShippingMethod", (object?)po.ShippingMethod ?? DBNull.Value),
                    new SqlParameter("@ShippingAddress", (object?)po.ShippingAddress ?? DBNull.Value),
                    new SqlParameter("@PaymentTerms", (object?)po.PaymentTerms ?? DBNull.Value),
                    new SqlParameter("@ExpectedDeliveryDate", po.ExpectedDeliveryDate),
                    new SqlParameter("@UpdatedAt", DateTime.UtcNow)
                );
                await RecalculateOrderStatusAsync(po.Id);
            }

            return true;
        }

        #endregion

        #region Get Items By Purchase Order Id
        public async Task<List<PurchaseOrderItemDto>> GetItemsByPurchaseOrderIdAsync(Guid purchaseOrderId)
        {
            var items = new List<PurchaseOrderItemDto>();
            var connection = _context.Database.GetDbConnection();
            if (connection.State != ConnectionState.Open) await connection.OpenAsync();

            using var cmd = connection.CreateCommand();
            cmd.CommandText = "sp_GetPurchaseOrderItems";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@PurchaseOrderId", purchaseOrderId == Guid.Empty ? DBNull.Value : purchaseOrderId));

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                items.Add(new PurchaseOrderItemDto
                {
                    Id = reader.GetGuid(reader.GetOrdinal("Id")),
                    PurchaseOrderId = reader.GetGuid(reader.GetOrdinal("PurchaseOrderId")),
                    MaterialId = reader.GetGuid(reader.GetOrdinal("MaterialId")),
                    MaterialCode = reader.IsDBNull(reader.GetOrdinal("MaterialCode")) ? "" : reader.GetString(reader.GetOrdinal("MaterialCode")),
                    MaterialName = reader.IsDBNull(reader.GetOrdinal("MaterialName")) ? "" : reader.GetString(reader.GetOrdinal("MaterialName")),
                    OrderedQuantity = reader.GetDecimal(reader.GetOrdinal("OrderedQuantity")),
                    UnitPrice = reader.GetDecimal(reader.GetOrdinal("UnitPrice")),
                    TotalPrice = reader.GetDecimal(reader.GetOrdinal("TotalPrice")),
                    CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                    UpdatedAt = reader.GetDateTime(reader.GetOrdinal("UpdatedAt"))
                });
            }
            return items;
        }
        
        #endregion

        #region Recalculate Order Status
        public async Task RecalculateOrderStatusAsync(Guid purchaseOrderId)
        {
            var po = await GetByIdAsync(purchaseOrderId);

            if (po == null || po.Status == OrderStatus.Cancelled)
                return;

            if (po.Items == null || !po.Items.Any())
                return;

            // Calculate received quantity for every PO item.
            var itemQuantities = po.Items.Select(poItem =>
            {
                var receivedQuantity = po.Receipts?
                    .SelectMany(r => r.Items ?? new List<PurchaseOrderReceiptItemDto>())
                    .Where(ri => ri.PurchaseOrderItemId == poItem.Id)
                    .Sum(ri => ri.ReceivedQuantity) ?? 0m;

                return new
                {
                    PurchaseOrderItemId = poItem.Id,
                    OrderedQuantity = poItem.OrderedQuantity,
                    ReceivedQuantity = receivedQuantity
                };
            }).ToList();

            decimal totalOrdered = itemQuantities.Sum(x => x.OrderedQuantity);
            decimal totalReceived = itemQuantities.Sum(x => x.ReceivedQuantity);

            var newStatus = po.Status;

            // Nothing has been received.
            if (totalReceived == 0)
            {
                newStatus = po.Status == OrderStatus.Pending
                    ? OrderStatus.Pending
                    : OrderStatus.Processing;
            }
            // At least one item still has quantity remaining.
            else if (itemQuantities.Any(
                x => x.ReceivedQuantity < x.OrderedQuantity))
            {
                newStatus = OrderStatus.PartiallyDelivered;
            }
            // Every PO item has been completely received.
            else if (itemQuantities.All(
                x => x.ReceivedQuantity == x.OrderedQuantity))
            {
                bool allInspectionsDone = true;

                var connection = _context.Database.GetDbConnection();

                if (connection.State != ConnectionState.Open)
                    await connection.OpenAsync();

                if (po.Receipts != null && po.Receipts.Any())
                {
                    foreach (var receipt in po.Receipts)
                    {
                        bool hasCompletedInspection = false;

                        using var cmd = connection.CreateCommand();

                        cmd.CommandText = "sp_GetMaterialInspections";
                        cmd.CommandType = CommandType.StoredProcedure;

                        cmd.Parameters.Add(
                            new SqlParameter(
                                "@PurchaseOrderReceiptId",
                                receipt.Id
                            )
                        );

                        using var reader = await cmd.ExecuteReaderAsync();

                        if (await reader.ReadAsync())
                        {
                            var status = reader.GetString(
                                reader.GetOrdinal("InspectionStatus")
                            );

                            if (status == "Completed" || status == "Approved")
                            {
                                hasCompletedInspection = true;
                            }
                        }

                        if (!hasCompletedInspection)
                        {
                            allInspectionsDone = false;
                            break;
                        }
                    }
                }
                else
                {
                    allInspectionsDone = false;
                }

                newStatus = allInspectionsDone
                    ? OrderStatus.Completed
                    : OrderStatus.Delivered;
            }
            // Defensive handling for invalid existing data.
            else if (totalReceived > totalOrdered)
            {
                newStatus = OrderStatus.PartiallyDelivered;
            }

            // Only update when the status actually changes.
            if (newStatus != po.Status)
            {
                await _context.Database.ExecuteSqlRawAsync(
                    "EXEC sp_UpdatePurchaseOrder " +
                    "@Id, @OrderNumber, @Status, @TotalAmount, " +
                    "@SupplierId, @MaterialCategoryId, @ShippingMethod, " +
                    "@ShippingAddress, @PaymentTerms, " +
                    "@ExpectedDeliveryDate, @UpdatedAt",

                    new SqlParameter("@Id", po.Id),
                    new SqlParameter("@OrderNumber", po.OrderNumber),
                    new SqlParameter("@Status", (int)newStatus),
                    new SqlParameter("@TotalAmount", po.TotalAmount),
                    new SqlParameter("@SupplierId", po.SupplierId),

                    new SqlParameter(
                        "@MaterialCategoryId",
                        (object?)po.MaterialCategoryId ?? DBNull.Value
                    ),

                    new SqlParameter(
                        "@ShippingMethod",
                        (object?)po.ShippingMethod ?? DBNull.Value
                    ),

                    new SqlParameter(
                        "@ShippingAddress",
                        (object?)po.ShippingAddress ?? DBNull.Value
                    ),

                    new SqlParameter(
                        "@PaymentTerms",
                        (object?)po.PaymentTerms ?? DBNull.Value
                    ),

                    new SqlParameter(
                        "@ExpectedDeliveryDate",
                        po.ExpectedDeliveryDate
                    ),

                    new SqlParameter(
                        "@UpdatedAt",
                        DateTime.UtcNow
                    )
                );
            }
        }

        #endregion 
    
    }
}
