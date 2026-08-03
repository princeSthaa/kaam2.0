using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.MaterialInspection;

namespace backend.Service.MaterialInspection
{
    public interface IMaterialInspectionService
    {
        Task<List<MaterialInspectionDto>> GetAllAsync(
            Guid? materialRequestId = null,
            string? inspectionStatus = null
        );

        Task<MaterialInspectionDto?> GetByIdAsync(Guid id);

        Task<bool> UpdateInspectionAsync(Guid id, UpdateMaterialInspectionDto dto);

        Task<bool> UpdateInspectionItemAsync(Guid itemId, UpdateMaterialInspectionItemDto dto);

        Task<bool> DeleteAsync(Guid id);
    }
}
