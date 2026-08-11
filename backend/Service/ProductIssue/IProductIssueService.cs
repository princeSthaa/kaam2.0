
using backend.Dto.ProductIssue;

namespace backend.Service.ProductIssue;

public interface IProductIssueService
{
    Task<List<ProductIssueGetDto>> GetAllAsync(
        Guid? id = null,
        Guid? productDemandId = null,
        decimal? quantity = null,
        string? issuedBy = null,
        bool? isReceived = false,
        DateTime? createdAt = null,
        DateTime? updatedAt = null
    );

    Task<ProductIssueGetDto?> GetByIdAsync(Guid id);

    Task<ProductIssueDto> CreateAsync(ProductIssueDto dto);

    Task<bool> UpdateAsync(Guid id, ProductIssueDto dto);

    Task<bool> DeleteAsync(Guid id);

}