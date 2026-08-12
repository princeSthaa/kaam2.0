using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.WarehouseRack;

namespace backend.Service.WarehouseRack
{
    public class WarehouseRackService : IWarehouseRackService
    {
        private readonly AppDbContext _context;

        public WarehouseRackService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<WarehouseRackDto>> GetAllAsync(
            Guid? id = null,
            string? code = null,
            string? name = null,
            DateTime? createdAt = null,
            DateTime? updatedAt = null,
            Guid? warehouseRoomId = null
        )
        {
            return await _context.Database.SqlQuery<WarehouseRackDto>($@"
                EXEC sp_GetWarehouseRacks
                    @Id = {id},
                    @Code = {code},
                    @Name = {name},
                    @CreatedAt = {createdAt},
                    @UpdatedAt = {updatedAt},
                    @WarehouseRoomId = {warehouseRoomId}
            ")
            .ToListAsync();
        }

        public async Task<WarehouseRackDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<WarehouseRackDto> CreateAsync(WarehouseRackDto dto)
        {
            dto.Id = Guid.NewGuid();
            dto.Code = $"RCK-{((await _context.WarehouseRacks.CountAsync()) + 1):D2}";
            var now = DateTime.UtcNow;

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertWarehouseRacks
                    @Id = {dto.Id},
                    @Code = {dto.Code},
                    @Name = {dto.Name},
                    @WarehouseRoomId = {dto.WarehouseRoomId},
                    @CreatedAt = {now},
                    @UpdatedAt = {now}
            ");

            return dto;
        }

        public async Task<bool> UpdateAsync(Guid id, WarehouseRackDto warehouseRackDto)
        {
            var now = DateTime.UtcNow;

            return await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateWarehouseRacks
                    @Id = {id},
                    @Name = {warehouseRackDto.Name},
                    @UpdatedAt = {now}
            ") > 0;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            return await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteWarehouseRacks
                    @Id = {id}
            ") > 0;
        }
    }
}
