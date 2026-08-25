using backend.Dto.Role;

namespace backend.Service.Role
{
    public interface IRoleService
    {
        Task<bool> CreateAsync(RoleDto dto);

        Task<List<RoleGetDto>> GetAllAsync(
            Guid? id = null,
            string? roleName = null,
            DateTime? createdAt = null,
            DateTime? updatedAt = null
        );

        Task<RoleGetDto?> GetByIdAsync(Guid id);

        Task<bool> UpdateAsync(Guid id, RoleDto dto);

        Task<bool> DeleteAsync(Guid id);
    }
}
