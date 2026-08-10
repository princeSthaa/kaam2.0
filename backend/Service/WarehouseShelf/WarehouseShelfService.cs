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
            Guid? warehouseRackId = null
        )
        {
            var query = _context.WarehouseShelfs.AsQueryable();

            if (id.HasValue) query = query.Where(q => q.Id == id.Value);
            if (!string.IsNullOrEmpty(code)) query = query.Where(q => q.Code == code);
            if (!string.IsNullOrEmpty(capacity)) query = query.Where(q => q.Capacity.Contains(capacity));
            if (createdAt.HasValue) query = query.Where(q => q.CreatedAt.Date == createdAt.Value.Date);
            if (!string.IsNullOrEmpty(createdBy)) query = query.Where(q => q.CreatedBy == createdBy);
            if (updatedAt.HasValue) query = query.Where(q => q.UpdatedAt.Date == updatedAt.Value.Date);
            if (!string.IsNullOrEmpty(updatedBy)) query = query.Where(q => q.UpdatedBy == updatedBy);
            if (warehouseRackId.HasValue) query = query.Where(q => q.WarehouseRackId == warehouseRackId.Value);

            return await query.Select(w => new WarehouseShelfDto
            {
                Id = w.Id,
                Code = w.Code,
                Capacity = w.Capacity,
                CreatedAt = w.CreatedAt,
                CreatedBy = w.CreatedBy,
                UpdatedAt = w.UpdatedAt,
                UpdatedBy = w.UpdatedBy,
                WarehouseRackId = w.WarehouseRackId
            }).ToListAsync();
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

            var shelf = new backend.Model.WarehouseShelf
            {
                Id = warehouseShelfDto.Id,
                Code = warehouseShelfDto.Code ?? string.Empty,
                Capacity = warehouseShelfDto.Capacity ?? string.Empty,
                WarehouseRackId = warehouseShelfDto.WarehouseRackId,
                CreatedAt = warehouseShelfDto.CreatedAt == default ? DateTime.UtcNow : warehouseShelfDto.CreatedAt,
                CreatedBy = warehouseShelfDto.CreatedBy ?? "System",
                UpdatedAt = warehouseShelfDto.UpdatedAt == default ? DateTime.UtcNow : warehouseShelfDto.UpdatedAt,
                UpdatedBy = warehouseShelfDto.UpdatedBy ?? "System"
            };

            _context.WarehouseShelfs.Add(shelf);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateAsync(Guid id, WarehouseShelfDto warehouseShelfDto)
        {
            var shelf = await _context.WarehouseShelfs.FirstOrDefaultAsync(w => w.Id == id);
            if (shelf == null) return false;

            shelf.Code = warehouseShelfDto.Code ?? shelf.Code;
            shelf.Capacity = warehouseShelfDto.Capacity ?? shelf.Capacity;
            shelf.WarehouseRackId = warehouseShelfDto.WarehouseRackId != Guid.Empty ? warehouseShelfDto.WarehouseRackId : shelf.WarehouseRackId;
            shelf.UpdatedAt = DateTime.UtcNow;
            shelf.UpdatedBy = warehouseShelfDto.UpdatedBy ?? "System";

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var shelf = await _context.WarehouseShelfs.FirstOrDefaultAsync(w => w.Id == id);
            if (shelf == null) return false;

            _context.WarehouseShelfs.Remove(shelf);
            await _context.SaveChangesAsync();
            return true;
        }
        // </crudgen:methods>
    }
}

