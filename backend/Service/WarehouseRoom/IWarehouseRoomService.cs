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
            string? id = null,
            string? name = null,
            string? floor = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null,
            string? warehouseId = null
        );

        Task<bool> CreateAsync(WarehouseRoomDto warehouseRoomDto);

        Task<bool> UpdateAsync(string id, WarehouseRoomDto warehouseRoomDto);

        Task<bool> DeleteAsync(string id);

        // </crudgen:method-signatures>
    }
}

