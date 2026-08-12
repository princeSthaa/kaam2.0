using Dapper;
using System.Data;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.Warehouse;

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
            var floors = (await multi.ReadAsync<backend.Dto.WarehouseFloor.WarehouseFloorDto>()).ToList();
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

            foreach (var floor in floors)
            {
                floor.WarehouseRooms = rooms.Where(r => r.WarehouseFloorId == floor.Id).ToList();
            }

            foreach (var warehouse in warehouses)
            {
                warehouse.WarehouseFloors = floors.Where(f => f.WarehouseId == warehouse.Id).ToList();
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
            warehouseDto.Id = Guid.NewGuid();
            warehouseDto.Code =$"WAR-{((await _context.Warehouses.CountAsync()) + 1):D2}";
            warehouseDto.CreatedAt = DateTime.UtcNow;
            warehouseDto.UpdatedAt = DateTime.UtcNow;

            var warehouse = new backend.Model.Warehouse
            {
                Id = warehouseDto.Id,
                Code = warehouseDto.Code ?? string.Empty,
                Name = warehouseDto.Name ?? string.Empty,
                Location = warehouseDto.Location ?? string.Empty,
                CreatedAt = warehouseDto.CreatedAt,
                UpdatedAt = warehouseDto.UpdatedAt,
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
