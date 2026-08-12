using System.Data;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.WarehouseShelf;

namespace backend.Service.WarehouseShelf
{
    public class WarehouseShelfService : IWarehouseShelfService
    {
        private readonly AppDbContext _context;

        public WarehouseShelfService(AppDbContext context)
        {
            _context = context;
        }

        // <crudgen:methods>
        public async Task<List<WarehouseShelfDto>> GetAllAsync(
            Guid? id = null,
            string? code = null,
            string? name = null,
            string? capacity = null,
            DateTime? createdAt = null,
            DateTime? updatedAt = null,
            Guid? warehouseRackId = null
        )
        {
            return await _context.Database.SqlQuery<WarehouseShelfDto>($@"
                EXEC sp_GetWarehouseShelves
                    @Id = {id},
                    @Code = {code},
                    @Name = {name},
                    @Capacity = {capacity},
                    @CreatedAt = {createdAt},
                    @UpdatedAt = {updatedAt},
                    @WarehouseRackId = {warehouseRackId}
            ")
            .ToListAsync();
        }

        public async Task<WarehouseShelfDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<WarehouseShelfDto> CreateAsync(WarehouseShelfDto dto)
        {
            dto.Id = Guid.NewGuid();
            dto.Code = $"SHF-{((await _context.WarehouseShelfs.CountAsync()) + 1):D2}";
            var now = DateTime.UtcNow;

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertWarehouseShelves
                    @Id = {dto.Id},
                    @Code = {dto.Code},
                    @Name = {dto.Name},
                    @Capacity = {dto.Capacity},
                    @WarehouseRackId = {dto.WarehouseRackId},
                    @CreatedAt = {now},
                    @UpdatedAt = {now}
            ");

            return dto;
        }

        public async Task<bool> UpdateAsync(Guid id, WarehouseShelfDto dto)
        {
            var now = DateTime.UtcNow;

            return await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateWarehouseShelves
                    @Id = {id},
                    @Name = {dto.Name},
                    @Capacity = {dto.Capacity},
                    @WarehouseRackId = {dto.WarehouseRackId},
                    @UpdatedAt = {now}
            ") > 0;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            return await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteWarehouseShelves
                    @Id = {id}
            ") > 0;
        }

    }
}

