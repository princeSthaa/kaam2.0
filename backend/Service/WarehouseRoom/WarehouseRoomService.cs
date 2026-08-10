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
            var query = _context.WarehouseRooms.AsQueryable();

            if (id.HasValue) query = query.Where(q => q.Id == id.Value);
            if (!string.IsNullOrEmpty(name)) query = query.Where(q => q.Name.Contains(name));
            if (!string.IsNullOrEmpty(floor)) query = query.Where(q => q.Floor.Contains(floor));
            if (createdAt.HasValue) query = query.Where(q => q.CreatedAt.Date == createdAt.Value.Date);
            if (!string.IsNullOrEmpty(createdBy)) query = query.Where(q => q.CreatedBy == createdBy);
            if (updatedAt.HasValue) query = query.Where(q => q.UpdatedAt.Date == updatedAt.Value.Date);
            if (!string.IsNullOrEmpty(updatedBy)) query = query.Where(q => q.UpdatedBy == updatedBy);
            if (warehouseId.HasValue) query = query.Where(q => q.WarehouseId == warehouseId.Value);

            return await query.Select(w => new WarehouseRoomDto
            {
                Id = w.Id,
                Name = w.Name,
                Floor = w.Floor,
                CreatedAt = w.CreatedAt,
                CreatedBy = w.CreatedBy,
                UpdatedAt = w.UpdatedAt,
                UpdatedBy = w.UpdatedBy,
                WarehouseId = w.WarehouseId
            }).ToListAsync();
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

            var room = new backend.Model.WarehouseRoom
            {
                Id = warehouseRoomDto.Id,
                Name = warehouseRoomDto.Name ?? string.Empty,
                Floor = warehouseRoomDto.Floor ?? string.Empty,
                WarehouseId = warehouseRoomDto.WarehouseId,
                CreatedAt = warehouseRoomDto.CreatedAt == default ? DateTime.UtcNow : warehouseRoomDto.CreatedAt,
                CreatedBy = warehouseRoomDto.CreatedBy ?? "System",
                UpdatedAt = warehouseRoomDto.UpdatedAt == default ? DateTime.UtcNow : warehouseRoomDto.UpdatedAt,
                UpdatedBy = warehouseRoomDto.UpdatedBy ?? "System"
            };

            _context.WarehouseRooms.Add(room);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateAsync(Guid id, WarehouseRoomDto warehouseRoomDto)
        {
            var room = await _context.WarehouseRooms.FirstOrDefaultAsync(w => w.Id == id);
            if (room == null) return false;

            room.Name = warehouseRoomDto.Name ?? room.Name;
            room.Floor = warehouseRoomDto.Floor ?? room.Floor;
            room.WarehouseId = warehouseRoomDto.WarehouseId != Guid.Empty ? warehouseRoomDto.WarehouseId : room.WarehouseId;
            room.UpdatedAt = DateTime.UtcNow;
            room.UpdatedBy = warehouseRoomDto.UpdatedBy ?? "System";

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var room = await _context.WarehouseRooms.FirstOrDefaultAsync(w => w.Id == id);
            if (room == null) return false;

            _context.WarehouseRooms.Remove(room);
            await _context.SaveChangesAsync();
            return true;
        }
        // </crudgen:methods>
    }
}

