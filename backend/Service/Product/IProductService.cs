using backend.Dto.Product;

namespace backend.Service.Product
{
    public interface IProductService
    {

        Task<bool> CreateAsync(ProductDto productDto);

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

        Task<bool> UpdateAsync(Guid id, ProductDto productDto);

        Task<bool> DeleteAsync(Guid id);

        // </crudgen:method-signatures>
    }
}
