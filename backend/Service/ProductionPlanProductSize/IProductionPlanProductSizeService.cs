using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.ProductionPlanProductSize;
using backend.Model;
using backend.Model.Enums;

namespace backend.Service.ProductionPlanProductSize
{
    public interface IProductionPlanProductSizeService
    {
        // <crudgen:method-signatures>
        Task<List<ProductionPlanProductSizeDto>> GetAllAsync(
            string? id = null,
            ProductSize? size = null,
            int? quantity = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null,
            string? productionPlanProductId = null
        );

        Task<bool> CreateAsync(ProductionPlanProductSizeDto productionPlanProductSizeDto);

        Task<bool> UpdateAsync(string id, ProductionPlanProductSizeDto productionPlanProductSizeDto);

        Task<bool> DeleteAsync(string id);

        // </crudgen:method-signatures>
    }
}

