using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.WarehouseRoom;
using backend.Model;

namespace backend.Service.WarehouseRoom
{
    public class WarehouseRoomService : IWarehouseRoomService
    {
        private readonly AppDbContext _context;

        public WarehouseRoomService(AppDbContext context)
        {
            _context = context;
        }

        // <crudgen:methods>
        public async Task<List<WarehouseRoomDto>> GetAllAsync(
            Guid? id = null,
            string? name = null,
            string? floor = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null,
            Guid? warehouseId = null
        )
        {
            return await _context.Database
                .SqlQuery<WarehouseRoomDto>($@"
                    EXEC sp_GetWarehouseRooms

                        @Id = {id},
                        @Name = {name},
                        @Floor = {floor},
                        @CreatedAt = {createdAt},
                        @CreatedBy = {createdBy},
                        @UpdatedAt = {updatedAt},
                        @UpdatedBy = {updatedBy},
                        @WarehouseId = {warehouseId}
                ")
                .ToListAsync();
        }

        public async Task<WarehouseRoomDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<bool> CreateAsync(WarehouseRoomDto warehouseRoomDto)
        {
            if (warehouseRoomDto.Id == Guid.Empty)
            {
                warehouseRoomDto.Id = Guid.NewGuid();
            }

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertWarehouseRoom

                    @Id = {warehouseRoomDto.Id},
                    @Name = {warehouseRoomDto.Name},
                    @Floor = {warehouseRoomDto.Floor},
                    @CreatedAt = {warehouseRoomDto.CreatedAt},
                    @CreatedBy = {warehouseRoomDto.CreatedBy},
                    @UpdatedAt = {warehouseRoomDto.UpdatedAt},
                    @UpdatedBy = {warehouseRoomDto.UpdatedBy},
                    @WarehouseId = {warehouseRoomDto.WarehouseId}
            ");

            return true;
        }

        public async Task<bool> UpdateAsync(Guid id, WarehouseRoomDto warehouseRoomDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateWarehouseRoom

                    @Id = {warehouseRoomDto.Id},
                    @Name = {warehouseRoomDto.Name},
                    @Floor = {warehouseRoomDto.Floor},
                    @CreatedAt = {warehouseRoomDto.CreatedAt},
                    @CreatedBy = {warehouseRoomDto.CreatedBy},
                    @UpdatedAt = {warehouseRoomDto.UpdatedAt},
                    @UpdatedBy = {warehouseRoomDto.UpdatedBy},
                    @WarehouseId = {warehouseRoomDto.WarehouseId}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteWarehouseRoom
                    @Id = {id}
            ");

            return true;
        }

        // </crudgen:methods>
    }
}

