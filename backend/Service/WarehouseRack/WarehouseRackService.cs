using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.WarehouseRack;
using backend.Model;

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
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null,
            Guid? warehouseRoomId = null
        )
        {
            var query = _context.WarehouseRacks.AsQueryable();

            if (id.HasValue) query = query.Where(q => q.Id == id.Value);
            if (!string.IsNullOrEmpty(code)) query = query.Where(q => q.Code == code);
            if (createdAt.HasValue) query = query.Where(q => q.CreatedAt.Date == createdAt.Value.Date);
            if (!string.IsNullOrEmpty(createdBy)) query = query.Where(q => q.CreatedBy == createdBy);
            if (updatedAt.HasValue) query = query.Where(q => q.UpdatedAt.Date == updatedAt.Value.Date);
            if (!string.IsNullOrEmpty(updatedBy)) query = query.Where(q => q.UpdatedBy == updatedBy);
            if (warehouseRoomId.HasValue) query = query.Where(q => q.WarehouseRoomId == warehouseRoomId.Value);

            return await query.Select(w => new WarehouseRackDto
            {
                Id = w.Id,
                Code = w.Code,
                CreatedAt = w.CreatedAt,
                CreatedBy = w.CreatedBy,
                UpdatedAt = w.UpdatedAt,
                UpdatedBy = w.UpdatedBy,
                WarehouseRoomId = w.WarehouseRoomId
            }).ToListAsync();
        }

        public async Task<WarehouseRackDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<bool> CreateAsync(WarehouseRackDto warehouseRackDto)
        {
            if (warehouseRackDto.Id == Guid.Empty)
            {
                warehouseRackDto.Id = Guid.NewGuid();
            }

            var rack = new backend.Model.WarehouseRack
            {
                Id = warehouseRackDto.Id,
                Code = warehouseRackDto.Code ?? string.Empty,
                WarehouseRoomId = warehouseRackDto.WarehouseRoomId,
                CreatedAt = warehouseRackDto.CreatedAt == default ? DateTime.UtcNow : warehouseRackDto.CreatedAt,
                CreatedBy = warehouseRackDto.CreatedBy ?? "System",
                UpdatedAt = warehouseRackDto.UpdatedAt == default ? DateTime.UtcNow : warehouseRackDto.UpdatedAt,
                UpdatedBy = warehouseRackDto.UpdatedBy ?? "System"
            };

            _context.WarehouseRacks.Add(rack);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateAsync(Guid id, WarehouseRackDto warehouseRackDto)
        {
            var rack = await _context.WarehouseRacks.FirstOrDefaultAsync(w => w.Id == id);
            if (rack == null) return false;

            rack.Code = warehouseRackDto.Code ?? rack.Code;
            rack.WarehouseRoomId = warehouseRackDto.WarehouseRoomId != Guid.Empty ? warehouseRackDto.WarehouseRoomId : rack.WarehouseRoomId;
            rack.UpdatedAt = DateTime.UtcNow;
            rack.UpdatedBy = warehouseRackDto.UpdatedBy ?? "System";

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var rack = await _context.WarehouseRacks.FirstOrDefaultAsync(w => w.Id == id);
            if (rack == null) return false;

            _context.WarehouseRacks.Remove(rack);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
