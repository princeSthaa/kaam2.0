using backend.Dto.Rbac;
using backend.Model;

namespace backend.Service.Rbac;

public interface IRbacService
{
    Task<CurrentUserAccessDto?> GetProfileAsync(Guid employeeId);
    Task<backend.Model.Role?> GetRoleForEmployeeAsync(Guid employeeId);
    Task<HashSet<Guid>> GetVisibleRoleIdsAsync(Guid employeeId);
    Task<bool> CanManageRoleAsync(Guid employeeId, Guid roleId);
    Task<bool> CanAssignRoleAsync(Guid employeeId, Guid roleId);
    Task<bool> CanManageEmployeeAsync(Guid employeeId, Guid targetEmployeeId);
    Task<bool> CanDelegatePageAsync(Guid employeeId, Guid targetRoleId, Guid pageId, string? action = null);
}
