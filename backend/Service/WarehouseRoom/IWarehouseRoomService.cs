using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.WarehouseRoom;
using backend.Model;

namespace backend.Service.WarehouseRoom
{
    public interface IWarehouseRoomService
    {
        // <crudgen:method-signatures>
        Task<List<WarehouseRoomDto>> GetAllAsync(
            Guid? id = null,
            string? name = null,
            string? floor = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null,
            Guid? warehouseId = null
        );

        Task<WarehouseRoomDto?> GetByIdAsync(Guid id);

        Task<bool> CreateAsync(WarehouseRoomDto warehouseRoomDto);

        Task<bool> UpdateAsync(Guid id, WarehouseRoomDto warehouseRoomDto);

        Task<bool> DeleteAsync(Guid id);

        // </crudgen:method-signatures>
    }
}

