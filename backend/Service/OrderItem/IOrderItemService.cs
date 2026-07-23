using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.OrderItem;
using backend.Model;

namespace backend.Service.OrderItem
{
    public interface IOrderItemService
    {
        // <crudgen:method-signatures>
        Task<List<OrderItemDto>> GetAllAsync(
            Guid? id = null,
            int? quantity = null,
            decimal? unitPrice = null,
            decimal? totalPrice = null,
            decimal? discount = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null,
            Guid? orderId = null
        );

        Task<OrderItemDto?> GetByIdAsync(Guid id);

        Task<bool> CreateAsync(OrderItemDto orderItemDto);

        Task<bool> UpdateAsync(Guid id, OrderItemDto orderItemDto);

        Task<bool> DeleteAsync(Guid id);

        // </crudgen:method-signatures>
    }
}

