using backend.Data;
using backend.Dto.WarehouseRoom;
using Microsoft.EntityFrameworkCore;

namespace backend.Service.WarehouseRoom;

public class WarehouseRoomService : IWarehouseRoomService
{
    private readonly AppDbContext _context;

    public WarehouseRoomService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<WarehouseRoomDto>> GetAllAsync(
        Guid? id = null,
        string? name = null,
        string? code = null,
        DateTime? createdAt = null,
        DateTime? updatedAt = null,
        Guid? warehouseFloorId = null
    )
    {   
        return await _context.Database.SqlQuery<WarehouseRoomDto>($@"
            EXEC sp_GetWarehouseRooms
                @Id = {id},
                @Name = {name},
                @Code = {code},
                @CreatedAt = {createdAt},
                @UpdatedAt = {updatedAt},
                @WarehouseFloorId = {warehouseFloorId}
        ").ToListAsync();
    }

    public async Task<WarehouseRoomDto?> GetByIdAsync(Guid id)
    {
        var results = await GetAllAsync(id: id);

        return results.FirstOrDefault();
    }

    public async Task<WarehouseRoomDto> CreateAsync(WarehouseRoomDto dto)
    {
        dto.Id = Guid.NewGuid();
        dto.Code = $"Room-{((await _context.WarehouseRooms.CountAsync()) + 1 ):D2}";
        var now = DateTime.UtcNow;

        await _context.Database.ExecuteSqlInterpolatedAsync($@"
            EXEC sp_InsertWarehouseRooms
                @Id = {dto.Id},
                @Name = {dto.Name},
                @Code = {dto.Code},
                @WarehouseFloorId = {dto.WarehouseFloorId},
                @CreatedAt = {now},
                @UpdatedAt = {now}
        ");

        return dto;
    }

    public async Task<bool> UpdateAsync( Guid id, WarehouseRoomDto dto)
    {
        var now = DateTime.UtcNow;

        return await _context.Database.ExecuteSqlInterpolatedAsync($@"
            EXEC sp_UpdateWarehouseRooms
                @Id = {id},
                @Name = {dto.Name},
                @UpdatedAt = {now}
        ") > 0;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        return await _context.Database.ExecuteSqlInterpolatedAsync($@"
            EXEC sp_DeleteWarehouseRooms
                @Id = {id}
        ") > 0;
    }

}