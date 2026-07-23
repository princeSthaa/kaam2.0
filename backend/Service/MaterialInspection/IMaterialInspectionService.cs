using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.MaterialInspection;
using backend.Model;

namespace backend.Service.MaterialInspection
{
    public interface IMaterialInspectionService
    {
        // <crudgen:method-signatures>
        Task<List<MaterialInspectionDto>> GetAllAsync(
            Guid? id = null,
            string? materialId = null,
            string? materialName = null,
            string? supplierName = null,
            decimal? receivedQuantity = null,
            string? inspectionStatus = null,
            string? notes = null,
            string? inspectorName = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null
        );

        Task<MaterialInspectionDto?> GetByIdAsync(Guid id);

        Task<bool> CreateAsync(MaterialInspectionDto materialInspectionDto);

        Task<bool> UpdateAsync(Guid id, MaterialInspectionDto materialInspectionDto);

        Task<bool> DeleteAsync(Guid id);

        // </crudgen:method-signatures>
    }
}
