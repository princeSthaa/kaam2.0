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
            Guid? id = null,
            string? code = null,
            string? capacity = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null,
            Guid? warehouseRoomId = null
        );

        Task<WarehouseShelfDto?> GetByIdAsync(Guid id);

        Task<bool> CreateAsync(WarehouseShelfDto warehouseShelfDto);

        Task<bool> UpdateAsync(Guid id, WarehouseShelfDto warehouseShelfDto);

        Task<bool> DeleteAsync(Guid id);

        // </crudgen:method-signatures>
    }
}

