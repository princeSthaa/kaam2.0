using Dapper;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.Warehouse;
using backend.Model;

namespace backend.Service.Warehouse
{
    public class WarehouseService : IWarehouseService
    {
        private readonly AppDbContext _context;

        public WarehouseService(AppDbContext context)
        {
            _context = context;
        }

        // <crudgen:methods>
        public async Task<List<WarehouseDto>> GetAllAsync(
            Guid? id = null,
            string? code = null,
            string? name = null,
            string? location = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null
        )
        {
            var connection = _context.Database.GetDbConnection();
            var parameters = new Dapper.DynamicParameters();
            parameters.Add("@Id", id);
            
            using var multi = await connection.QueryMultipleAsync(
                "sp_GetWarehouses",
                parameters,
                commandType: System.Data.CommandType.StoredProcedure
            );

            var warehouses = (await multi.ReadAsync<WarehouseDto>()).ToList();
            var rooms = (await multi.ReadAsync<backend.Dto.WarehouseRoom.WarehouseRoomDto>()).ToList();
            var racks = (await multi.ReadAsync<backend.Dto.WarehouseRack.WarehouseRackDto>()).ToList();
            var shelves = (await multi.ReadAsync<backend.Dto.WarehouseShelf.WarehouseShelfDto>()).ToList();

            foreach (var rack in racks)
            {
                rack.WarehouseShelves = shelves.Where(s => s.WarehouseRackId == rack.Id).ToList();
            }

            foreach (var room in rooms)
            {
                room.WarehouseRacks = racks.Where(r => r.WarehouseRoomId == room.Id).ToList();
            }

            foreach (var warehouse in warehouses)
            {
                warehouse.WarehouseRooms = rooms.Where(r => r.WarehouseId == warehouse.Id).ToList();
            }

            // Filtering done in memory

            if (!string.IsNullOrWhiteSpace(code)) warehouses = warehouses.Where(w => w.Code == code).ToList();
            if (!string.IsNullOrWhiteSpace(name)) warehouses = warehouses.Where(w => w.Name != null && w.Name.Contains(name)).ToList();
            if (!string.IsNullOrWhiteSpace(location)) warehouses = warehouses.Where(w => w.Location != null && w.Location.Contains(location)).ToList();
            return warehouses;
        }

        public async Task<WarehouseDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<bool> CreateAsync(WarehouseDto warehouseDto)
        {
            if (warehouseDto.Id == Guid.Empty)
            {
                warehouseDto.Id = Guid.NewGuid();
            }

            var warehouse = new backend.Model.Warehouse
            {
                Id = warehouseDto.Id,
                Code = warehouseDto.Code ?? string.Empty,
                Name = warehouseDto.Name ?? string.Empty,
                Location = warehouseDto.Location ?? string.Empty,
                CreatedAt = warehouseDto.CreatedAt == default ? DateTime.UtcNow : warehouseDto.CreatedAt,
                CreatedBy = warehouseDto.CreatedBy ?? "System",
                UpdatedAt = warehouseDto.UpdatedAt == default ? DateTime.UtcNow : warehouseDto.UpdatedAt,
                UpdatedBy = warehouseDto.UpdatedBy ?? "System"
            };

            _context.Warehouses.Add(warehouse);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateAsync(Guid id, WarehouseDto warehouseDto)
        {
            var warehouse = await _context.Warehouses.FirstOrDefaultAsync(w => w.Id == id);
            if (warehouse == null) return false;

            warehouse.Code = warehouseDto.Code ?? warehouse.Code;
            warehouse.Name = warehouseDto.Name ?? warehouse.Name;
            warehouse.Location = warehouseDto.Location ?? warehouse.Location;
            warehouse.UpdatedAt = DateTime.UtcNow;
            warehouse.UpdatedBy = warehouseDto.UpdatedBy ?? "System";

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var warehouse = await _context.Warehouses.FirstOrDefaultAsync(w => w.Id == id);
            if (warehouse == null) return false;

            _context.Warehouses.Remove(warehouse);
            await _context.SaveChangesAsync();
            return true;
        }
        // </crudgen:methods>
    }
}
