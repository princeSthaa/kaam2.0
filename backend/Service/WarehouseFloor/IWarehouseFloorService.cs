using backend.Dto.WarehouseFloor;

namespace backend.Service.WarehouseFloor
{
    public interface IWarehouseFloorService
    {
        Task<List<WarehouseFloorGetDto>> GetAllAsync(
            Guid? id = null,
            string? code = null,
            string? name = null,
            Guid? warehouseId = null,
            DateTime? createdAt = null,
            DateTime? updatedAt = null
        );

        Task<WarehouseFloorGetDto?> GetByIdAsync(Guid id);

        Task<WarehouseFloorDto> CreateAsync(WarehouseFloorDto dto);

        Task<bool> UpdateAsync(Guid id, WarehouseFloorDto warehouseDto);

        Task<bool> DeleteAsync(Guid id);
    }
}
