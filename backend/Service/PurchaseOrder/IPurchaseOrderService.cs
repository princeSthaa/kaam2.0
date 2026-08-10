using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.PurchaseOrder;
using backend.Model.Enums;

namespace backend.Service.PurchaseOrder
{
    public interface IPurchaseOrderService
    {
        Task<List<PurchaseOrderGetDto>> GetAllAsync(
            Guid? id = null,
            string? orderNumber = null,
            OrderStatus? status = null,
            Guid? supplierId = null,
            Guid? materialCategoryId = null
        );

        Task<PurchaseOrderGetDto?> GetByIdAsync(Guid id);
        Task<PurchaseOrderGetDto?> CreateAsync(PurchaseOrderDto dto);
        Task<bool> UpdateAsync(Guid id, PurchaseOrderDto dto);
        Task<bool> DeleteAsync(Guid id);

        // Items
        Task<PurchaseOrderItemDto?> AddItemAsync(Guid purchaseOrderId, PurchaseOrderItemDto itemDto);
        Task<bool> UpdateItemAsync(Guid itemId, PurchaseOrderItemDto itemDto);
        Task<bool> DeleteItemAsync(Guid itemId);
        Task<List<PurchaseOrderItemDto>> GetItemsByPurchaseOrderIdAsync(Guid purchaseOrderId);

        // Recalculate Status
        Task RecalculateOrderStatusAsync(Guid purchaseOrderId);
    }
}
