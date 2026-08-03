using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.MaterialRequest;

namespace backend.Service.MaterialRequest
{
    public interface IMaterialRequestService
    {
        Task<List<MaterialRequestDto>> GetAllAsync(
            Guid? id = null,
            Guid? supplierId = null,
            string? status = null,
            string? requestNumber = null
        );

        Task<MaterialRequestDto?> GetByIdAsync(Guid id);

        Task<MaterialRequestDto> CreateAsync(CreateMaterialRequestDto dto);

        Task<bool> UpdateAsync(Guid id, CreateMaterialRequestDto dto);

        Task<bool> UpdateStatusAsync(Guid id, backend.Model.Enums.MaterialRequestStatus status);

        Task<bool> DeleteAsync(Guid id);
    }
}
