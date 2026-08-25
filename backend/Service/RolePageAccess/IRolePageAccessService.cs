using backend.Dto.RolePageAccess;

namespace backend.Service.RolePageAccess
{
    public interface IRolePageAccessService
    {
        Task<bool> CreateAsync(RolePageAccessDto dto);

        Task<List<RolePageAccessGetDto>> GetAllAsync(
            Guid? id = null,
            Guid? roleId = null,
            Guid? pageId = null,
            DateTime? createdAt = null,
            DateTime? updatedAt = null
        );

        Task<RolePageAccessGetDto?> GetByIdAsync(Guid id);

        Task<bool> UpdateAsync(Guid id, RolePageAccessDto dto);

        Task<bool> DeleteAsync(Guid id);
    }
}
