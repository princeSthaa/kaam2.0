using backend.Dto.RolePagePermission;

namespace backend.Service.RolePagePermission
{
    public interface IRolePagePermissionService
    {
        Task<bool> CreateAsync(RolePagePermissionDto dto);

        Task<List<RolePagePermissionGetDto>> GetAllAsync(
            Guid? id = null,
            Guid? rolePageAccessId = null,
            Guid? permissionId = null,
            DateTime? createdAt = null,
            DateTime? updatedAt = null
        );

        Task<RolePagePermissionGetDto?> GetByIdAsync(Guid id);

        Task<bool> UpdateAsync(Guid id, RolePagePermissionDto dto);

        Task<bool> DeleteAsync(Guid id);
    }
}
