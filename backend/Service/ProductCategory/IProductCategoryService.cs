using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.ProductCategory;

namespace backend.Service.ProductCategory
{
    public interface IProductCategoryService
    {
        Task<List<ProductCategoryDto>> GetAllAsync();
        Task<ProductCategoryDto?> GetByIdAsync(Guid id);
        Task<ProductCategoryCreateDto> CreateAsync(ProductCategoryCreateDto dto);
        Task<bool> UpdateAsync(Guid id, ProductCategoryDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
