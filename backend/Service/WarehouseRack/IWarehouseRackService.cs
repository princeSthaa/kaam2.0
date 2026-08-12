using backend.Dto.WarehouseRack;

namespace backend.Service.WarehouseRack
{
    public interface IWarehouseRackService
    {
        Task<List<WarehouseRackDto>> GetAllAsync(
            Guid? id = null,
            string? code = null,
            string? name = null,
            DateTime? createdAt = null,
            DateTime? updatedAt = null,
            Guid? warehouseRoomId = null
        );

        Task<WarehouseRackDto?> GetByIdAsync(Guid id);
        Task<WarehouseRackDto> CreateAsync(WarehouseRackDto warehouseRackDto);
        Task<bool> UpdateAsync(Guid id, WarehouseRackDto warehouseRackDto);
        Task<bool> DeleteAsync(Guid id);
    }
}
