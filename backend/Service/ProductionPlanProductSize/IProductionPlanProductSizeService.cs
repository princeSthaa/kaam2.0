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
            Guid? id = null,
            ProductSize? size = null,
            int? quantity = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null,
            Guid? productionPlanProductId = null
        );

        Task<ProductionPlanProductSizeDto?> GetByIdAsync(Guid id);

        Task<bool> CreateAsync(ProductionPlanProductSizeDto productionPlanProductSizeDto);

        Task<bool> UpdateAsync(Guid id, ProductionPlanProductSizeDto productionPlanProductSizeDto);

        Task<bool> DeleteAsync(Guid id);

        // </crudgen:method-signatures>
    }
}

