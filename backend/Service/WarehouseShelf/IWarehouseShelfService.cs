using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.WarehouseShelf;
using backend.Model;

namespace backend.Service.WarehouseShelf
{
    public interface IWarehouseShelfService
    {
        // <crudgen:method-signatures>
        Task<List<WarehouseShelfDto>> GetAllAsync(
            string? id = null,
            string? code = null,
            string? capacity = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null,
            string? warehouseRoomId = null
        );

        Task<bool> CreateAsync(WarehouseShelfDto warehouseShelfDto);

        Task<bool> UpdateAsync(string id, WarehouseShelfDto warehouseShelfDto);

        Task<bool> DeleteAsync(string id);

        // </crudgen:method-signatures>
    }
}

