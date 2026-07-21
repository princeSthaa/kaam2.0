using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.Inventory;
using backend.Model;

namespace backend.Service.Inventory
{
    public interface IInventoryService
    {
        // <crudgen:method-signatures>
        Task<List<InventoryDto>> GetAllAsync(
            string? id = null,
            string? sKU = null,
            string? itemName = null,
            string? type = null,
            decimal? quantity = null,
            string? location = null,
            string? status = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null
        );

        Task<bool> CreateAsync(InventoryDto inventoryDto);

        Task<bool> UpdateAsync(string id, InventoryDto inventoryDto);

        Task<bool> DeleteAsync(string id);

        // </crudgen:method-signatures>
    }
}
