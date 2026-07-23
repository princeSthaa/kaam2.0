using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.ProductionPlanStage;
using backend.Model;
using backend.Model.Enums;

namespace backend.Service.ProductionPlanStage
{
    public class ProductionPlanStageService : IProductionPlanStageService
    {
        private readonly AppDbContext _context;

        public ProductionPlanStageService(AppDbContext context)
        {
            _context = context;
        }

        // <crudgen:methods>
        public async Task<List<ProductionPlanStageDto>> GetAllAsync(
            string? id = null,
            string? stageId = null,
            string? stageName = null,
            string? operatorName = null,
            DateTime? plannedStartDate = null,
            DateTime? plannedEndDate = null,
            PlanStatus? status = null,
            int? completedQty = null,
            int? rejectedQty = null,
            DateTime? actualStartDate = null,
            DateTime? actualEndDate = null,
            string? remarks = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null,
            string? productionPlanId = null
        )
        {
            return await _context.Database
                .SqlQuery<ProductionPlanStageDto>($@"
                    EXEC sp_GetProductionPlanStages

                        @Id = {id},
                        @StageId = {stageId},
                        @StageName = {stageName},
                        @OperatorName = {operatorName},
                        @PlannedStartDate = {plannedStartDate},
                        @PlannedEndDate = {plannedEndDate},
                        @Status = {status},
                        @CompletedQty = {completedQty},
                        @RejectedQty = {rejectedQty},
                        @ActualStartDate = {actualStartDate},
                        @ActualEndDate = {actualEndDate},
                        @Remarks = {remarks},
                        @CreatedAt = {createdAt},
                        @CreatedBy = {createdBy},
                        @UpdatedAt = {updatedAt},
                        @UpdatedBy = {updatedBy},
                        @ProductionPlanId = {productionPlanId}
                ")
                .ToListAsync();
        }

        public async Task<bool> CreateAsync(ProductionPlanStageDto productionPlanStageDto)
        {
            // Generate an Id if not provided (SP requires @Id)
            if (string.IsNullOrWhiteSpace(productionPlanStageDto.Id))
            {
                var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
                var random = new Random().Next(10000, 99999).ToString();
                productionPlanStageDto.Id = $"STG-{timestamp}-{random}";
            }

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertProductionPlanStage

                    @Id = {productionPlanStageDto.Id},
                    @StageId = {productionPlanStageDto.StageId},
                    @StageName = {productionPlanStageDto.StageName},
                    @OperatorName = {productionPlanStageDto.OperatorName},
                    @PlannedStartDate = {productionPlanStageDto.PlannedStartDate},
                    @PlannedEndDate = {productionPlanStageDto.PlannedEndDate},
                    @Status = {productionPlanStageDto.Status},
                    @CompletedQty = {productionPlanStageDto.CompletedQty},
                    @RejectedQty = {productionPlanStageDto.RejectedQty},
                    @ActualStartDate = {productionPlanStageDto.ActualStartDate},
                    @ActualEndDate = {productionPlanStageDto.ActualEndDate},
                    @Remarks = {productionPlanStageDto.Remarks},
                    @CreatedAt = {productionPlanStageDto.CreatedAt},
                    @CreatedBy = {productionPlanStageDto.CreatedBy},
                    @UpdatedAt = {productionPlanStageDto.UpdatedAt},
                    @UpdatedBy = {productionPlanStageDto.UpdatedBy},
                    @WorkCenterId = {productionPlanStageDto.WorkCenterId},
                    @ProductionPlanId = {productionPlanStageDto.ProductionPlanId}
            ");

            return true;
        }

        public async Task<bool> UpdateAsync(string id, ProductionPlanStageDto productionPlanStageDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateProductionPlanStage

                    @Id = {id},
                    @StageId = {productionPlanStageDto.StageId},
                    @StageName = {productionPlanStageDto.StageName},
                    @OperatorName = {productionPlanStageDto.OperatorName},
                    @PlannedStartDate = {productionPlanStageDto.PlannedStartDate},
                    @PlannedEndDate = {productionPlanStageDto.PlannedEndDate},
                    @Status = {productionPlanStageDto.Status},
                    @CompletedQty = {productionPlanStageDto.CompletedQty},
                    @RejectedQty = {productionPlanStageDto.RejectedQty},
                    @ActualStartDate = {productionPlanStageDto.ActualStartDate},
                    @ActualEndDate = {productionPlanStageDto.ActualEndDate},
                    @Remarks = {productionPlanStageDto.Remarks},
                    @CreatedAt = {productionPlanStageDto.CreatedAt},
                    @CreatedBy = {productionPlanStageDto.CreatedBy},
                    @UpdatedAt = {productionPlanStageDto.UpdatedAt},
                    @UpdatedBy = {productionPlanStageDto.UpdatedBy},
                    @WorkCenterId = {productionPlanStageDto.WorkCenterId},
                    @ProductionPlanId = {productionPlanStageDto.ProductionPlanId}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteProductionPlanStage
                    @Id = {id}
            ");

            return true;
        }

        // </crudgen:methods>
    }
}

