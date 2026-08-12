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
            string? name = null,
            string? capacity = null,
            DateTime? createdAt = null,
            DateTime? updatedAt = null,
            Guid? warehouseRackId = null
        );

        Task<WarehouseShelfDto?> GetByIdAsync(Guid id);

        Task<WarehouseShelfDto> CreateAsync(WarehouseShelfDto warehouseShelfDto);

        Task<bool> UpdateAsync(Guid id, WarehouseShelfDto warehouseShelfDto);

        Task<bool> DeleteAsync(Guid id);

        // </crudgen:method-signatures>
    }
}

