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
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null
        )
        {
            return await _context.Database
                .SqlQuery<InventoryDto>($@"
                    EXEC sp_GetInventories

                        @Id = {id},
                        @SKU = {sKU},
                        @ItemName = {itemName},
                        @Type = {type},
                        @Quantity = {quantity},
                        @Location = {location},
                        @Status = {status},
                        @CreatedAt = {createdAt},
                        @CreatedBy = {createdBy},
                        @UpdatedAt = {updatedAt},
                        @UpdatedBy = {updatedBy}
                ")
                .ToListAsync();
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

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertInventory

                    @Id = {inventoryDto.Id},
                    @SKU = {inventoryDto.SKU},
                    @ItemName = {inventoryDto.ItemName},
                    @Type = {inventoryDto.Type},
                    @Quantity = {inventoryDto.Quantity},
                    @Location = {inventoryDto.Location},
                    @Status = {inventoryDto.Status},
                    @CreatedAt = {inventoryDto.CreatedAt},
                    @CreatedBy = {inventoryDto.CreatedBy},
                    @UpdatedAt = {inventoryDto.UpdatedAt},
                    @UpdatedBy = {inventoryDto.UpdatedBy}
            ");

            return true;
        }

        public async Task<bool> UpdateAsync(Guid id, InventoryDto inventoryDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateInventory

                    @Id = {inventoryDto.Id},
                    @SKU = {inventoryDto.SKU},
                    @ItemName = {inventoryDto.ItemName},
                    @Type = {inventoryDto.Type},
                    @Quantity = {inventoryDto.Quantity},
                    @Location = {inventoryDto.Location},
                    @Status = {inventoryDto.Status},
                    @CreatedAt = {inventoryDto.CreatedAt},
                    @CreatedBy = {inventoryDto.CreatedBy},
                    @UpdatedAt = {inventoryDto.UpdatedAt},
                    @UpdatedBy = {inventoryDto.UpdatedBy}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteInventory
                    @Id = {id}
            ");

            return true;
        }

        // </crudgen:methods>
    }
}
