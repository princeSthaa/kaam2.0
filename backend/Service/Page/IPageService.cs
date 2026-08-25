using backend.Dto.Page;

namespace backend.Service.Page
{
    public interface IPageService
    {
        Task<bool> CreateAsync(PageDto dto);

        Task<List<PageGetDto>> GetAllAsync(
            Guid? id = null,
            string? name = null,
            string? route = null,
            Guid? parentPageId = null,
            bool? isActive = null,
            DateTime? createdAt = null,
            DateTime? updatedAt = null
        );

        Task<PageGetDto?> GetByIdAsync(Guid id);

        Task<bool> UpdateAsync(Guid id, PageDto dto);

        Task<bool> DeleteAsync(Guid id);
    }
}
