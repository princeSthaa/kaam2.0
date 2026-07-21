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
            string? id = null,
            string? name = null,
            string? floor = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null,
            string? warehouseId = null
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

        public async Task<bool> CreateAsync(WarehouseRoomDto warehouseRoomDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertWarehouseRoom

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

        public async Task<bool> UpdateAsync(string id, WarehouseRoomDto warehouseRoomDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateWarehouseRoom

                    @Id = {id},
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

        public async Task<bool> DeleteAsync(string id)
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

