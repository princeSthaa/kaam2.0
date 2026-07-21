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
            string? id = null,
            int? quantity = null,
            decimal? unitPrice = null,
            decimal? totalPrice = null,
            decimal? discount = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null,
            string? orderId = null
        );

        Task<bool> CreateAsync(OrderItemDto orderItemDto);

        Task<bool> UpdateAsync(string id, OrderItemDto orderItemDto);

        Task<bool> DeleteAsync(string id);

        // </crudgen:method-signatures>
    }
}

