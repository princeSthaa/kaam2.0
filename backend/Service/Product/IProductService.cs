using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.Product;
using backend.Model;
using backend.Model.Enums;

namespace backend.Service.Product
{
    public interface IProductService
    {
        // <crudgen:method-signatures>
        Task<List<ProductDto>> GetAllAsync(
            Guid? id = null,
            string? name = null,
            string? imagePath = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null
        );

        Task<ProductDto?> GetByIdAsync(Guid id);

        Task<bool> CreateAsync(ProductDto productDto);

        Task<bool> UpdateAsync(Guid id, ProductDto productDto);

        Task<bool> DeleteAsync(Guid id);

        // </crudgen:method-signatures>
    }
}
