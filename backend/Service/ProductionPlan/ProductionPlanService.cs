using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.ProductionPlan;
using backend.Model;
using backend.Model.Enums;

namespace backend.Service.ProductionPlan
{
    public class ProductionPlanService : IProductionPlanService
    {
        private readonly AppDbContext _context;

        public ProductionPlanService(AppDbContext context)
        {
            _context = context;
        }

        // <crudgen:methods>
        public async Task<List<ProductionPlanDto>> GetAllAsync(
            Guid? id = null,
            string? planId = null,
            string? batchId = null,
            string? planName = null,
            string? demandType = null,
            string? sourceId = null,
            string? sourceName = null,
            PlanPriority? priority = null,
            PlanStatus? status = null,
            DateTime? plannedStartDate = null,
            DateTime? plannedCompletionDate = null,
            int? quantity = null,
            decimal? estimatedCost = null,
            string? supervisor = null,
            string? productionLine = null,
            string? materialWarehouse = null,
            string? productionNotes = null,
            DateTime? planDate = null,
            string? outputDestination = null,
            DateTime? requiredDate = null,
            decimal? progress = null,
            bool? blocked = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null
        )
        {
            return await _context.Database
                .SqlQuery<ProductionPlanDto>($@"
                    EXEC sp_GetProductionPlans

                        @Id = {id},
                        @PlanId = {planId},
                        @BatchId = {batchId},
                        @PlanName = {planName},
                        @DemandType = {demandType},
                        @SourceId = {sourceId},
                        @SourceName = {sourceName},
                        @Priority = {priority},
                        @Status = {status},
                        @PlannedStartDate = {plannedStartDate},
                        @PlannedCompletionDate = {plannedCompletionDate},
                        @Quantity = {quantity},
                        @EstimatedCost = {estimatedCost},
                        @Supervisor = {supervisor},
                        @ProductionLine = {productionLine},
                        @MaterialWarehouse = {materialWarehouse},
                        @ProductionNotes = {productionNotes},
                        @PlanDate = {planDate},
                        @OutputDestination = {outputDestination},
                        @RequiredDate = {requiredDate},
                        @Progress = {progress},
                        @Blocked = {blocked},
                        @CreatedAt = {createdAt},
                        @CreatedBy = {createdBy},
                        @UpdatedAt = {updatedAt},
                        @UpdatedBy = {updatedBy}
                ")
                .ToListAsync();
        }

        public async Task<ProductionPlanDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<ProductionPlanDto?> GetByPlanIdAsync(string planId)
        {
            var results = await GetAllAsync(planId: planId);
            return results.FirstOrDefault();
        }

        public async Task<bool> CreateAsync(ProductionPlanDto productionPlanDto)
        {
            if (productionPlanDto.Id == Guid.Empty)
            {
                productionPlanDto.Id = Guid.NewGuid();
            }

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertProductionPlan

                    @Id = {productionPlanDto.Id},
                    @PlanId = {productionPlanDto.PlanId},
                    @BatchId = {productionPlanDto.BatchId},
                    @PlanName = {productionPlanDto.PlanName},
                    @DemandType = {productionPlanDto.DemandType},
                    @SourceId = {productionPlanDto.SourceId},
                    @SourceName = {productionPlanDto.SourceName},
                    @Priority = {productionPlanDto.Priority},
                    @Status = {productionPlanDto.Status},
                    @PlannedStartDate = {productionPlanDto.PlannedStartDate},
                    @PlannedCompletionDate = {productionPlanDto.PlannedCompletionDate},
                    @Quantity = {productionPlanDto.Quantity},
                    @EstimatedCost = {productionPlanDto.EstimatedCost},
                    @Supervisor = {productionPlanDto.Supervisor},
                    @ProductionLine = {productionPlanDto.ProductionLine},
                    @MaterialWarehouse = {productionPlanDto.MaterialWarehouse},
                    @ProductionNotes = {productionPlanDto.ProductionNotes},
                    @PlanDate = {productionPlanDto.PlanDate},
                    @OutputDestination = {productionPlanDto.OutputDestination},
                    @RequiredDate = {productionPlanDto.RequiredDate},
                    @Progress = {productionPlanDto.Progress},
                    @Blocked = {productionPlanDto.Blocked},
                    @CreatedAt = {productionPlanDto.CreatedAt},
                    @CreatedBy = {productionPlanDto.CreatedBy},
                    @UpdatedAt = {productionPlanDto.UpdatedAt},
                    @UpdatedBy = {productionPlanDto.UpdatedBy}
            ");

            return true;
        }

        public async Task<bool> UpdateAsync(Guid id, ProductionPlanDto productionPlanDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateProductionPlan

                    @Id = {productionPlanDto.Id},
                    @PlanId = {productionPlanDto.PlanId},
                    @BatchId = {productionPlanDto.BatchId},
                    @PlanName = {productionPlanDto.PlanName},
                    @DemandType = {productionPlanDto.DemandType},
                    @SourceId = {productionPlanDto.SourceId},
                    @SourceName = {productionPlanDto.SourceName},
                    @Priority = {productionPlanDto.Priority},
                    @Status = {productionPlanDto.Status},
                    @PlannedStartDate = {productionPlanDto.PlannedStartDate},
                    @PlannedCompletionDate = {productionPlanDto.PlannedCompletionDate},
                    @Quantity = {productionPlanDto.Quantity},
                    @EstimatedCost = {productionPlanDto.EstimatedCost},
                    @Supervisor = {productionPlanDto.Supervisor},
                    @ProductionLine = {productionPlanDto.ProductionLine},
                    @MaterialWarehouse = {productionPlanDto.MaterialWarehouse},
                    @ProductionNotes = {productionPlanDto.ProductionNotes},
                    @PlanDate = {productionPlanDto.PlanDate},
                    @OutputDestination = {productionPlanDto.OutputDestination},
                    @RequiredDate = {productionPlanDto.RequiredDate},
                    @Progress = {productionPlanDto.Progress},
                    @Blocked = {productionPlanDto.Blocked},
                    @CreatedAt = {productionPlanDto.CreatedAt},
                    @CreatedBy = {productionPlanDto.CreatedBy},
                    @UpdatedAt = {productionPlanDto.UpdatedAt},
                    @UpdatedBy = {productionPlanDto.UpdatedBy}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteProductionPlan
                    @Id = {id}
            ");

            return true;
        }

        // </crudgen:methods>
    }
}



