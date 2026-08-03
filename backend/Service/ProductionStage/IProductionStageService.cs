using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.ProductionStage;

namespace backend.Service.ProductionStage
{
    public interface IProductionStageService
    {
        Task<List<ProductionStageDto>> GetAllAsync();
        Task<ProductionStageDto?> GetByIdAsync(Guid id);
        Task<ProductionStageDto> CreateAsync(ProductionStageDto dto);
        Task<bool> UpdateAsync(Guid id, ProductionStageDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
