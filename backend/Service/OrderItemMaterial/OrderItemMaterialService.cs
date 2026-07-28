using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.OrderItemMaterial;
using backend.Model;

namespace backend.Service.OrderItemMaterial
{
    public class OrderItemMaterialService : IOrderItemMaterialService
    {
        private readonly AppDbContext _context;

        public OrderItemMaterialService(AppDbContext context)
        {
            _context = context;
        }

        // <crudgen:methods>
        public async Task<List<OrderItemMaterialGetDto>> GetAllAsync(
            Guid? id = null,
            decimal? requiredQuantity = null,
            string? unit = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null,
            Guid? orderItemId = null
        )
        {
            return await _context.Database
                .SqlQuery<OrderItemMaterialGetDto>($@"
                    EXEC sp_GetOrderItemMaterials

                        @Id = {id},
                        @RequiredQuantity = {requiredQuantity},
                        @Unit = {unit},
                        @CreatedAt = {createdAt},
                        @CreatedBy = {createdBy},
                        @UpdatedAt = {updatedAt},
                        @UpdatedBy = {updatedBy},
                        @OrderItemId = {orderItemId}
                ")
                .ToListAsync();
        }

        public async Task<OrderItemMaterialGetDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<bool> CreateAsync(OrderItemMaterialDto orderItemMaterialDto)
        {
            if (orderItemMaterialDto.Id == Guid.Empty)
            {
                orderItemMaterialDto.Id = Guid.NewGuid();
            }

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertOrderItemMaterial

                    @Id = {orderItemMaterialDto.Id},
                    @RequiredQuantity = {orderItemMaterialDto.RequiredQuantity},
                    @Unit = {orderItemMaterialDto.Unit},
                    @CreatedAt = {orderItemMaterialDto.CreatedAt},
                    @CreatedBy = {orderItemMaterialDto.CreatedBy},
                    @UpdatedAt = {orderItemMaterialDto.UpdatedAt},
                    @UpdatedBy = {orderItemMaterialDto.UpdatedBy},
                    @MaterialId = {orderItemMaterialDto.MaterialId},
                    @OrderItemId = {orderItemMaterialDto.OrderItemId}
            ");

            return true;
        }

        public async Task<bool> UpdateAsync(Guid id, OrderItemMaterialDto orderItemMaterialDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateOrderItemMaterial

                    @Id = {orderItemMaterialDto.Id},
                    @RequiredQuantity = {orderItemMaterialDto.RequiredQuantity},
                    @Unit = {orderItemMaterialDto.Unit},
                    @CreatedAt = {orderItemMaterialDto.CreatedAt},
                    @CreatedBy = {orderItemMaterialDto.CreatedBy},
                    @UpdatedAt = {orderItemMaterialDto.UpdatedAt},
                    @UpdatedBy = {orderItemMaterialDto.UpdatedBy},
                    @MaterialId = {orderItemMaterialDto.MaterialId},
                    @OrderItemId = {orderItemMaterialDto.OrderItemId}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteOrderItemMaterial
                    @Id = {id}
            ");

            return true;
        }

        // </crudgen:methods>
    }
}
