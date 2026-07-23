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
            Guid? id = null,
            string? orderNumber = null,
            OrderStatus? status = null,
            decimal? totalAmount = null,
            DateTime? dueDate = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null,
            Guid? customerId = null
        );

        Task<OrderDto?> GetByIdAsync(Guid id);

        Task<bool> CreateAsync(OrderDto orderDto);

        Task<bool> UpdateAsync(Guid id, OrderDto orderDto);

        Task<bool> DeleteAsync(Guid id);

        // </crudgen:method-signatures>
    }
}

