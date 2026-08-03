using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.MaterialCategory;
using backend.Model;

namespace backend.Service.MaterialCategory
{
    public interface IMaterialCategoryService
    {
        // <crudgen:method-signatures>
        Task<List<MaterialCategoryGetDto>> GetAllAsync(
            Guid? id = null,
            string? name = null,
            DateTime? createdAt = null,
            DateTime? updatedAt = null,
            Guid? materialTypeId = null
        );

        Task<MaterialCategoryGetDto?> GetByIdAsync(Guid id);

        Task<bool> CreateAsync(MaterialCategoryDto materialCategoryDto);

        Task<bool> UpdateAsync(Guid id, MaterialCategoryDto materialCategoryDto);

        Task<bool> DeleteAsync(Guid id);

        // </crudgen:method-signatures>
    }
}
