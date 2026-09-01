using Dapper;
using System.Data;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.Role;
using backend.Dto.RolePageAccess;
using backend.Dto.RolePagePermission;

namespace backend.Service.Role
{
    public class RoleService : IRoleService
    {
        private readonly AppDbContext _context;

        public RoleService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> CreateAsync(RoleDto dto)
        {
            dto.Id = Guid.NewGuid();
            var now = DateTime.UtcNow;

            _context.Roles.Add(new backend.Model.Role
            {
                Id = dto.Id,
                RoleName = dto.RoleName,
                Description = dto.Description,
                ModulePageId = dto.ModulePageId,
                IsModuleAdmin = dto.IsModuleAdmin,
                IsSuperAdmin = dto.IsSuperAdmin,
                IsSystem = dto.IsSystem,
                CreatedAt = now,
                UpdatedAt = now
            });
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<RoleGetDto>> GetAllAsync(
            Guid? id = null,
            string? roleName = null,
            DateTime? createdAt = null,
            DateTime? updatedAt = null
        )
        {
            var connection = _context.Database.GetDbConnection();
            var parameters = new DynamicParameters();
            parameters.Add("@Id", id);
            parameters.Add("@RoleName", roleName);
            parameters.Add("@CreatedAt", createdAt);
            parameters.Add("@UpdatedAt", updatedAt);

            await using var multi = await connection.QueryMultipleAsync(
                "sp_GetRoles",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            var roles = !multi.IsConsumed ? (await multi.ReadAsync<RoleGetDto>()).ToList() : new List<RoleGetDto>();
            var pageAccesses = !multi.IsConsumed ? (await multi.ReadAsync<RolePageAccessGetDto>()).ToList() : new List<RolePageAccessGetDto>();
            var permissions = !multi.IsConsumed ? (await multi.ReadAsync<RolePagePermissionGetDto>()).ToList() : new List<RolePagePermissionGetDto>();

            foreach (var pa in pageAccesses)
            {
                pa.Permissions = permissions.Where(p => p.RolePageAccessId == pa.Id).ToList();
            }

            foreach (var r in roles)
            {
                r.PageAccesses = pageAccesses.Where(pa => pa.RoleId == r.Id).ToList();
            }

            var roleIds = roles.Select(x => x.Id).ToArray();
            var metadata = await _context.Roles.AsNoTracking().Include(x => x.ModulePage)
                .Where(x => roleIds.Contains(x.Id)).ToDictionaryAsync(x => x.Id);
            foreach (var role in roles.Where(x => metadata.ContainsKey(x.Id)))
            {
                var source = metadata[role.Id];
                role.ModulePageId = source.ModulePageId;
                role.ModuleName = source.ModulePage?.Name;
                role.ModuleRoute = source.ModulePage?.Route;
                role.IsModuleAdmin = source.IsModuleAdmin;
                role.IsSuperAdmin = source.IsSuperAdmin;
                role.IsSystem = source.IsSystem;
            }

            return roles;
        }

        public async Task<RoleGetDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<bool> UpdateAsync(Guid id, RoleDto dto)
        {
            var role = await _context.Roles.FirstOrDefaultAsync(x => x.Id == id);
            if (role is null) return false;
            role.RoleName = dto.RoleName;
            role.Description = dto.Description;
            role.ModulePageId = dto.ModulePageId;
            role.IsModuleAdmin = dto.IsModuleAdmin;
            role.IsSuperAdmin = dto.IsSuperAdmin;
            role.IsSystem = dto.IsSystem;
            role.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteRole
                    @Id = {id}
            ");

            return true;
        }
    }
}
