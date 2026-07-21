using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.Warehouse;
using backend.Model;

namespace backend.Service.Warehouse
{
    public interface IWarehouseService
    {
        // <crudgen:method-signatures>
        Task<List<WarehouseDto>> GetAllAsync(
            string? id = null,
            string? code = null,
            string? name = null,
            string? location = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null
        );

        Task<bool> CreateAsync(WarehouseDto warehouseDto);

        Task<bool> UpdateAsync(string id, WarehouseDto warehouseDto);

        Task<bool> DeleteAsync(string id);

        // </crudgen:method-signatures>
    }
}
