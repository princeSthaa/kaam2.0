using backend.Dto.Permission;

namespace backend.Service.Permission
{
    public interface IPermissionService
    {
        Task<bool> CreateAsync(PermissionDto dto);

        Task<List<PermissionGetDto>> GetAllAsync(
            Guid? id = null,
            string? name = null,
            string? action = null,
            DateTime? createdAt = null,
            DateTime? updatedAt = null
        );

        Task<PermissionGetDto?> GetByIdAsync(Guid id);

        Task<bool> UpdateAsync(Guid id, PermissionDto dto);

        Task<bool> DeleteAsync(Guid id);
    }
}
