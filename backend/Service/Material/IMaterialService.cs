using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.Material;
using backend.Model;

namespace backend.Service.Material
{
    public interface IMaterialService
    {
        // <crudgen:method-signatures>
        Task<List<MaterialDto>> GetAllAsync(
            string? id = null,
            string? materialCode = null,
            string? name = null,
            string? type = null,
            decimal? availableQty = null,
            string? unit = null,
            decimal? costPerUnit = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null
        );

        Task<bool> CreateAsync(MaterialDto materialDto);

        Task<bool> UpdateAsync(string id, MaterialDto materialDto);

        Task<bool> DeleteAsync(string id);

        Task<bool> RequestSupplierAsync(SupplierMaterialRequestDto dto);

        Task<(bool Success, string Message, decimal RemainingQty)> IssueToFactoryAsync(MaterialIssueDto dto);

        // </crudgen:method-signatures>
    }
}
