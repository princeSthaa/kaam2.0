using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.OrderItemSize;
using backend.Model;
using backend.Model.Enums;

namespace backend.Service.OrderItemSize
{
    public interface IOrderItemSizeService
    {
        // <crudgen:method-signatures>
        Task<List<OrderItemSizeGetDto>> GetAllAsync(
            Guid? id = null,
            ProductSize? size = null,
            int? quantity = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null,
            Guid? orderItemId = null
        );

        Task<OrderItemSizeGetDto?> GetByIdAsync(Guid id);

        Task<bool> CreateAsync(OrderItemSizeDto orderItemSizeDto);

        Task<bool> UpdateAsync(Guid id, OrderItemSizeDto orderItemSizeDto);

        Task<bool> DeleteAsync(Guid id);

        // </crudgen:method-signatures>
    }
}
