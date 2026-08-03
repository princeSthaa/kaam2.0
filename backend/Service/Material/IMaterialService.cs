using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.Material;
using backend.Model;

namespace backend.Service.Material
{
    public interface IMaterialService
    {
        Task<List<MaterialGetDto>> GetAllAsync(
            Guid? id = null,
            string? materialCode = null,
            string? name = null,
            Guid? materialTypeId = null,
            Guid? materialCategoryId = null,
            decimal? availableQty = null,
            string? unit = null,
            string? imagePath = null,
            decimal? costPerUnit = null,
            DateTime? createdAt = null,
            DateTime? updatedAt = null
        );
        
        // <crudgen:method-signatures>
        Task<bool> CreateAsync(MaterialDto materialDto);

        Task<bool> UpdateAsync(Guid id, MaterialDto materialDto);

        Task<bool> DeleteAsync(Guid id);

        // </crudgen:method-signatures>
    }
}
