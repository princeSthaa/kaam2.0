using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.MaterialType;
using backend.Model;

namespace backend.Service.MaterialType
{
    public interface IMaterialTypeService
    {
        // <crudgen:method-signatures>
        Task<List<MaterialTypeGetDto>> GetAllAsync(
            Guid? id = null,
            string? name = null,
            DateTime? createdAt = null,
            DateTime? updatedAt = null
        );

        Task<MaterialTypeGetDto?> GetByIdAsync(Guid id);

        Task<bool> CreateAsync(MaterialTypeDto materialTypeDto);

        Task<bool> UpdateAsync(Guid id, MaterialTypeDto materialTypeDto);

        Task<bool> DeleteAsync(Guid id);

        // </crudgen:method-signatures>
    }
}
