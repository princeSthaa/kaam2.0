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
            string? id = null,
            string? name = null,
            string? imagePath = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null
        );

        Task<bool> CreateAsync(ProductDto productDto);

        Task<bool> UpdateAsync(string id, ProductDto productDto);

        Task<bool> DeleteAsync(string id);

        // </crudgen:method-signatures>
    }
}
