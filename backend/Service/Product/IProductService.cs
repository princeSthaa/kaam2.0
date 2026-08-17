using backend.Dto.Product;

namespace backend.Service.Product
{
    public interface IProductService
    {
        Task<bool> CreateAsync(ProductDto productDto);

        Task<List<ProductGetDto>> GetAllAsync(
            Guid? id = null,
            string? name = null,
            string? imagePath = null,
            DateTime? createdAt = null,
            DateTime? updatedAt = null
        );

        Task<ProductGetDto?> GetByIdAsync(Guid id);

        Task<bool> UpdateAsync(Guid id, ProductDto productDto);

        Task<bool> DeleteAsync(Guid id);
    }
}
