using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.ProductionPlan;
using backend.Model;
using backend.Model.Enums;

namespace backend.Service.ProductionPlan
{
    public interface IProductionPlanService
    {
        // <crudgen:method-signatures>
        Task<List<ProductionPlanDto>> GetAllAsync(
            string? id = null,
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
        );

        Task<bool> CreateAsync(ProductionPlanDto productionPlanDto);

        Task<bool> UpdateAsync(string id, ProductionPlanDto productionPlanDto);

        Task<bool> DeleteAsync(string id);

        // </crudgen:method-signatures>
    }
}
