using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.ProductionPlanStage;
using backend.Model;
using backend.Model.Enums;

namespace backend.Service.ProductionPlanStage
{
    public interface IProductionPlanStageService
    {
        // <crudgen:method-signatures>
        Task<List<ProductionPlanStageDto>> GetAllAsync(
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
        );

        Task<bool> CreateAsync(ProductionPlanStageDto productionPlanStageDto);

        Task<bool> UpdateAsync(string id, ProductionPlanStageDto productionPlanStageDto);

        Task<bool> DeleteAsync(string id);

        // </crudgen:method-signatures>
    }
}

