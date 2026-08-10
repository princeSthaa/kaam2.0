using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.WarehouseRack;

namespace backend.Service.WarehouseRack
{
    public interface IWarehouseRackService
    {
        Task<List<WarehouseRackDto>> GetAllAsync(
            Guid? id = null,
            string? code = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null,
            Guid? warehouseRoomId = null
        );

        Task<WarehouseRackDto?> GetByIdAsync(Guid id);
        Task<bool> CreateAsync(WarehouseRackDto warehouseRackDto);
        Task<bool> UpdateAsync(Guid id, WarehouseRackDto warehouseRackDto);
        Task<bool> DeleteAsync(Guid id);
    }
}
