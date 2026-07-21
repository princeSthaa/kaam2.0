using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.ProductionPlanProduct;
using backend.Model;
using backend.Model.Enums;

namespace backend.Service.ProductionPlanProduct
{
    public interface IProductionPlanProductService
    {
        // <crudgen:method-signatures>
        Task<List<ProductionPlanProductDto>> GetAllAsync(
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
        );

        Task<bool> CreateAsync(ProductionPlanProductDto productionPlanProductDto);

        Task<bool> UpdateAsync(string id, ProductionPlanProductDto productionPlanProductDto);

        Task<bool> DeleteAsync(string id);

        // </crudgen:method-signatures>
    }
}

