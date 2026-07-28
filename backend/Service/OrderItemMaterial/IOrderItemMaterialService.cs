using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.OrderItemMaterial;
using backend.Model;

namespace backend.Service.OrderItemMaterial
{
    public interface IOrderItemMaterialService
    {
        // <crudgen:method-signatures>
        Task<List<OrderItemMaterialGetDto>> GetAllAsync(
            Guid? id = null,
            decimal? requiredQuantity = null,
            string? unit = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null,
            Guid? orderItemId = null
        );

        Task<OrderItemMaterialGetDto?> GetByIdAsync(Guid id);

        Task<bool> CreateAsync(OrderItemMaterialDto orderItemMaterialDto);

        Task<bool> UpdateAsync(Guid id, OrderItemMaterialDto orderItemMaterialDto);

        Task<bool> DeleteAsync(Guid id);

        // </crudgen:method-signatures>
    }
}
