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
            string? id = null,
            decimal? qtyPerUnit = null,
            decimal? wastagePercent = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null
        );

        Task<bool> CreateAsync(BillOfMaterialDto billOfMaterialDto);

        Task<bool> UpdateAsync(string id, BillOfMaterialDto billOfMaterialDto);

        Task<bool> DeleteAsync(string id);

        // </crudgen:method-signatures>
    }
}
