
using backend.Dto.ProductDemand;

namespace backend.Service.ProductDemand;

public interface IProductDemandService
{
    Task<List<ProductDemandGetDto>> GetAllAsync(
        Guid? id = null,
        string? requestId = null,
        decimal? quantity = null,
        string? approvedBy = null,
        bool? isIssued = false,
        DateTime? createdAt = null,
        DateTime? updatedAt = null
    );

    Task<ProductDemandGetDto?> GetByIdAsync(Guid id);

    Task<ProductDemandDto> CreateAsync(ProductDemandDto dto);

    Task<bool> UpdateAsync(Guid id, ProductDemandDto dto);

    Task<bool> DeleteAsync(Guid id);

}