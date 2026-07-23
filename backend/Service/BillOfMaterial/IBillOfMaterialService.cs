using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.BillOfMaterial;
using backend.Model;

namespace backend.Service.BillOfMaterial
{
    public interface IBillOfMaterialService
    {
        // <crudgen:method-signatures>
        Task<List<BillOfMaterialDto>> GetAllAsync(
            Guid? id = null,
            decimal? qtyPerUnit = null,
            decimal? wastagePercent = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null
        );

        Task<BillOfMaterialDto?> GetByIdAsync(Guid id);

        Task<bool> CreateAsync(BillOfMaterialDto billOfMaterialDto);

        Task<bool> UpdateAsync(Guid id, BillOfMaterialDto billOfMaterialDto);

        Task<bool> DeleteAsync(Guid id);

        // </crudgen:method-signatures>
    }
}
