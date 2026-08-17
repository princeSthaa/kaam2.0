using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.Inventory;
using backend.Model;

namespace backend.Service.Inventory
{
    public class InventoryService : IInventoryService
    {
        private readonly AppDbContext _context;

        public InventoryService(AppDbContext context)
        {
            _context = context;
        }

        // <crudgen:methods>
        public async Task<List<InventoryDto>> GetAllAsync(
            Guid? id = null,
            string? sKU = null,
            string? itemName = null,
            string? type = null,
            decimal? quantity = null,
            string? location = null,
            string? status = null,
            DateTime? createdAt = null,
            DateTime? updatedAt = null
        )
        {
            var query = _context.Inventories.AsQueryable();

            if (id.HasValue) query = query.Where(q => q.Id == id.Value);
            if (!string.IsNullOrEmpty(sKU)) query = query.Where(q => q.SKU == sKU);
            if (!string.IsNullOrEmpty(itemName)) query = query.Where(q => q.ItemName.Contains(itemName));
            if (!string.IsNullOrEmpty(type)) query = query.Where(q => q.Type == type);
            if (quantity.HasValue) query = query.Where(q => q.Quantity == quantity.Value);
            if (!string.IsNullOrEmpty(location)) query = query.Where(q => q.Location.Contains(location));
            if (!string.IsNullOrEmpty(status)) query = query.Where(q => q.Status == status);
            if (createdAt.HasValue) query = query.Where(q => q.CreatedAt.Date == createdAt.Value.Date);
            if (updatedAt.HasValue) query = query.Where(q => q.UpdatedAt.Date == updatedAt.Value.Date);

            return await query.Select(i => new InventoryDto
            {
                Id = i.Id,
                SKU = i.SKU,
                ItemName = i.ItemName,
                Type = i.Type,
                Quantity = i.Quantity,
                Location = i.Location,
                Status = i.Status,
                CreatedAt = i.CreatedAt,
                UpdatedAt = i.UpdatedAt
            }).ToListAsync();
        }

        public async Task<InventoryDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<bool> CreateAsync(InventoryDto inventoryDto)
        {
            if (inventoryDto.Id == Guid.Empty)
            {
                inventoryDto.Id = Guid.NewGuid();
            }

            var inventory = new backend.Model.Inventory
            {
                Id = inventoryDto.Id,
                SKU = inventoryDto.SKU ?? string.Empty,
                ItemName = inventoryDto.ItemName ?? string.Empty,
                Type = inventoryDto.Type ?? string.Empty,
                Quantity = inventoryDto.Quantity,
                Location = inventoryDto.Location ?? string.Empty,
                Status = inventoryDto.Status ?? string.Empty,
                CreatedAt = inventoryDto.CreatedAt == default ? DateTime.UtcNow : inventoryDto.CreatedAt,
                UpdatedAt = inventoryDto.UpdatedAt == default ? DateTime.UtcNow : inventoryDto.UpdatedAt,
            };

            _context.Inventories.Add(inventory);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateAsync(Guid id, InventoryDto inventoryDto)
        {
            var inventory = await _context.Inventories.FirstOrDefaultAsync(i => i.Id == id);
            if (inventory == null) return false;

            inventory.SKU = inventoryDto.SKU ?? inventory.SKU;
            inventory.ItemName = inventoryDto.ItemName ?? inventory.ItemName;
            inventory.Type = inventoryDto.Type ?? inventory.Type;
            inventory.Quantity = inventoryDto.Quantity;
            inventory.Location = inventoryDto.Location ?? inventory.Location;
            inventory.Status = inventoryDto.Status ?? inventory.Status;
            inventory.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var inventory = await _context.Inventories.FirstOrDefaultAsync(i => i.Id == id);
            if (inventory == null) return false;

            _context.Inventories.Remove(inventory);
            await _context.SaveChangesAsync();
            return true;
        }
        // </crudgen:methods>
    }
}
