using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.ProductionPlanProductSize;
using backend.Model;
using backend.Model.Enums;

namespace backend.Service.ProductionPlanProductSize
{
    public class ProductionPlanProductSizeService : IProductionPlanProductSizeService
    {
        private readonly AppDbContext _context;

        public ProductionPlanProductSizeService(AppDbContext context)
        {
            _context = context;
        }

        // <crudgen:methods>
        public async Task<List<ProductionPlanProductSizeDto>> GetAllAsync(
            string? id = null,
            ProductSize? size = null,
            int? quantity = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null,
            string? productionPlanProductId = null
        )
        {
            return await _context.Database
                .SqlQuery<ProductionPlanProductSizeDto>($@"
                    EXEC sp_GetProductionPlanProductSizes

                        @Id = {id},
                        @Size = {size},
                        @Quantity = {quantity},
                        @CreatedAt = {createdAt},
                        @CreatedBy = {createdBy},
                        @UpdatedAt = {updatedAt},
                        @UpdatedBy = {updatedBy},
                        @ProductionPlanProductId = {productionPlanProductId}
                ")
                .ToListAsync();
        }

        public async Task<bool> CreateAsync(ProductionPlanProductSizeDto productionPlanProductSizeDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertProductionPlanProductSize

                    @Size = {productionPlanProductSizeDto.Size},
                    @Quantity = {productionPlanProductSizeDto.Quantity},
                    @CreatedAt = {productionPlanProductSizeDto.CreatedAt},
                    @CreatedBy = {productionPlanProductSizeDto.CreatedBy},
                    @UpdatedAt = {productionPlanProductSizeDto.UpdatedAt},
                    @UpdatedBy = {productionPlanProductSizeDto.UpdatedBy},
                    @ProductionPlanProductId = {productionPlanProductSizeDto.ProductionPlanProductId}
            ");

            return true;
        }

        public async Task<bool> UpdateAsync(string id, ProductionPlanProductSizeDto productionPlanProductSizeDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateProductionPlanProductSize

                    @Id = {id},
                    @Size = {productionPlanProductSizeDto.Size},
                    @Quantity = {productionPlanProductSizeDto.Quantity},
                    @CreatedAt = {productionPlanProductSizeDto.CreatedAt},
                    @CreatedBy = {productionPlanProductSizeDto.CreatedBy},
                    @UpdatedAt = {productionPlanProductSizeDto.UpdatedAt},
                    @UpdatedBy = {productionPlanProductSizeDto.UpdatedBy},
                    @ProductionPlanProductId = {productionPlanProductSizeDto.ProductionPlanProductId}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteProductionPlanProductSize
                    @Id = {id}
            ");

            return true;
        }

        // </crudgen:methods>
    }
}

