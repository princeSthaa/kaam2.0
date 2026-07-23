using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.WarehouseShelf;
using backend.Model;

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
            string? capacity = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null,
            Guid? warehouseRoomId = null
        )
        {
            return await _context.Database
                .SqlQuery<WarehouseShelfDto>($@"
                    EXEC sp_GetWarehouseShelfs

                        @Id = {id},
                        @Code = {code},
                        @Capacity = {capacity},
                        @CreatedAt = {createdAt},
                        @CreatedBy = {createdBy},
                        @UpdatedAt = {updatedAt},
                        @UpdatedBy = {updatedBy},
                        @WarehouseRoomId = {warehouseRoomId}
                ")
                .ToListAsync();
        }

        public async Task<WarehouseShelfDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<bool> CreateAsync(WarehouseShelfDto warehouseShelfDto)
        {
            if (warehouseShelfDto.Id == Guid.Empty)
            {
                warehouseShelfDto.Id = Guid.NewGuid();
            }

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertWarehouseShelf

                    @Id = {warehouseShelfDto.Id},
                    @Code = {warehouseShelfDto.Code},
                    @Capacity = {warehouseShelfDto.Capacity},
                    @CreatedAt = {warehouseShelfDto.CreatedAt},
                    @CreatedBy = {warehouseShelfDto.CreatedBy},
                    @UpdatedAt = {warehouseShelfDto.UpdatedAt},
                    @UpdatedBy = {warehouseShelfDto.UpdatedBy},
                    @WarehouseRoomId = {warehouseShelfDto.WarehouseRoomId}
            ");

            return true;
        }

        public async Task<bool> UpdateAsync(Guid id, WarehouseShelfDto warehouseShelfDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateWarehouseShelf

                    @Id = {warehouseShelfDto.Id},
                    @Code = {warehouseShelfDto.Code},
                    @Capacity = {warehouseShelfDto.Capacity},
                    @CreatedAt = {warehouseShelfDto.CreatedAt},
                    @CreatedBy = {warehouseShelfDto.CreatedBy},
                    @UpdatedAt = {warehouseShelfDto.UpdatedAt},
                    @UpdatedBy = {warehouseShelfDto.UpdatedBy},
                    @WarehouseRoomId = {warehouseShelfDto.WarehouseRoomId}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteWarehouseShelf
                    @Id = {id}
            ");

            return true;
        }

        // </crudgen:methods>
    }
}

