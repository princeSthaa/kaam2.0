using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.MaterialRequest;
using backend.Model;

namespace backend.Service.MaterialRequest
{
    public interface IMaterialRequestService
    {
        // <crudgen:method-signatures>
        Task<List<MaterialRequestDto>> GetAllAsync(
            Guid? id = null,
            string? materialId = null,
            string? materialName = null,
            decimal? requestedQuantity = null,
            string? supplierName = null,
            string? urgency = null,
            DateTime? requiredDate = null,
            string? notes = null,
            string? requestedBy = null,
            string? status = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null
        );

        Task<MaterialRequestDto?> GetByIdAsync(Guid id);

        Task<bool> CreateAsync(MaterialRequestDto materialRequestDto);

        Task<bool> UpdateAsync(Guid id, MaterialRequestDto materialRequestDto);

        Task<bool> DeleteAsync(Guid id);

        // </crudgen:method-signatures>
    }
}
