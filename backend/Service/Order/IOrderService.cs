using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.Order;
using backend.Model;
using backend.Model.Enums;

namespace backend.Service.Order
{
    public interface IOrderService
    {
        // <crudgen:method-signatures>
        Task<List<OrderDto>> GetAllAsync(
            string? id = null,
            string? orderNumber = null,
            OrderStatus? status = null,
            decimal? totalAmount = null,
            DateTime? dueDate = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null,
            string? customerId = null
        );

        Task<bool> CreateAsync(OrderDto orderDto);

        Task<bool> UpdateAsync(string id, OrderDto orderDto);

        Task<bool> DeleteAsync(string id);

        // </crudgen:method-signatures>
    }
}

