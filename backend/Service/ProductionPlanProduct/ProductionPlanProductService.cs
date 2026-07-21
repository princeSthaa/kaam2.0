using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.ProductionPlanProduct;
using backend.Model;
using backend.Model.Enums;

namespace backend.Service.ProductionPlanProduct
{
    public class ProductionPlanProductService : IProductionPlanProductService
    {
        private readonly AppDbContext _context;

        public ProductionPlanProductService(AppDbContext context)
        {
            _context = context;
        }

        // <crudgen:methods>
        public async Task<List<ProductionPlanProductDto>> GetAllAsync(
            string? id = null,
            string? lineId = null,
            string? orderNo = null,
            string? productId = null,
            string? productCode = null,
            string? productName = null,
            string? category = null,
            string? variant = null,
            int? quantity = null,
            DateTime? requiredDate = null,
            PlanStatus? status = null,
            string? productImage = null,
            DateTime? plannedStartDate = null,
            DateTime? plannedCompletionDate = null,
            PlanPriority? priority = null,
            string? productionNotes = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null,
            string? productionPlanId = null
        )
        {
            return await _context.Database
                .SqlQuery<ProductionPlanProductDto>($@"
                    EXEC sp_GetProductionPlanProducts

                        @Id = {id},
                        @LineId = {lineId},
                        @OrderNo = {orderNo},
                        @ProductId = {productId},
                        @ProductCode = {productCode},
                        @ProductName = {productName},
                        @Category = {category},
                        @Variant = {variant},
                        @Quantity = {quantity},
                        @RequiredDate = {requiredDate},
                        @Status = {status},
                        @ProductImage = {productImage},
                        @PlannedStartDate = {plannedStartDate},
                        @PlannedCompletionDate = {plannedCompletionDate},
                        @Priority = {priority},
                        @ProductionNotes = {productionNotes},
                        @CreatedAt = {createdAt},
                        @CreatedBy = {createdBy},
                        @UpdatedAt = {updatedAt},
                        @UpdatedBy = {updatedBy},
                        @ProductionPlanId = {productionPlanId}
                ")
                .ToListAsync();
        }

        public async Task<bool> CreateAsync(ProductionPlanProductDto productionPlanProductDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertProductionPlanProduct

                    @LineId = {productionPlanProductDto.LineId},
                    @OrderNo = {productionPlanProductDto.OrderNo},
                    @ProductId = {productionPlanProductDto.ProductId},
                    @ProductCode = {productionPlanProductDto.ProductCode},
                    @ProductName = {productionPlanProductDto.ProductName},
                    @Category = {productionPlanProductDto.Category},
                    @Variant = {productionPlanProductDto.Variant},
                    @Quantity = {productionPlanProductDto.Quantity},
                    @RequiredDate = {productionPlanProductDto.RequiredDate},
                    @Status = {productionPlanProductDto.Status},
                    @ProductImage = {productionPlanProductDto.ProductImage},
                    @PlannedStartDate = {productionPlanProductDto.PlannedStartDate},
                    @PlannedCompletionDate = {productionPlanProductDto.PlannedCompletionDate},
                    @Priority = {productionPlanProductDto.Priority},
                    @ProductionNotes = {productionPlanProductDto.ProductionNotes},
                    @CreatedAt = {productionPlanProductDto.CreatedAt},
                    @CreatedBy = {productionPlanProductDto.CreatedBy},
                    @UpdatedAt = {productionPlanProductDto.UpdatedAt},
                    @UpdatedBy = {productionPlanProductDto.UpdatedBy},
                    @ProductionPlanId = {productionPlanProductDto.ProductionPlanId}
            ");

            return true;
        }

        public async Task<bool> UpdateAsync(string id, ProductionPlanProductDto productionPlanProductDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateProductionPlanProduct

                    @Id = {id},
                    @LineId = {productionPlanProductDto.LineId},
                    @OrderNo = {productionPlanProductDto.OrderNo},
                    @ProductId = {productionPlanProductDto.ProductId},
                    @ProductCode = {productionPlanProductDto.ProductCode},
                    @ProductName = {productionPlanProductDto.ProductName},
                    @Category = {productionPlanProductDto.Category},
                    @Variant = {productionPlanProductDto.Variant},
                    @Quantity = {productionPlanProductDto.Quantity},
                    @RequiredDate = {productionPlanProductDto.RequiredDate},
                    @Status = {productionPlanProductDto.Status},
                    @ProductImage = {productionPlanProductDto.ProductImage},
                    @PlannedStartDate = {productionPlanProductDto.PlannedStartDate},
                    @PlannedCompletionDate = {productionPlanProductDto.PlannedCompletionDate},
                    @Priority = {productionPlanProductDto.Priority},
                    @ProductionNotes = {productionPlanProductDto.ProductionNotes},
                    @CreatedAt = {productionPlanProductDto.CreatedAt},
                    @CreatedBy = {productionPlanProductDto.CreatedBy},
                    @UpdatedAt = {productionPlanProductDto.UpdatedAt},
                    @UpdatedBy = {productionPlanProductDto.UpdatedBy},
                    @ProductionPlanId = {productionPlanProductDto.ProductionPlanId}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteProductionPlanProduct
                    @Id = {id}
            ");

            return true;
        }

        // </crudgen:methods>
    }
}

