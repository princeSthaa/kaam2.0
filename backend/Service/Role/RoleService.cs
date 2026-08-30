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

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertRole
                    @Id = {dto.Id},
                    @RoleName = {dto.RoleName},
                    @Description = {dto.Description},
                    @CreatedAt = {now},
                    @UpdatedAt = {now}
            ");

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

            return roles;
        }

        public async Task<RoleGetDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<bool> UpdateAsync(Guid id, RoleDto dto)
        {
            var now = DateTime.UtcNow;

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateRole
                    @Id = {id},
                    @RoleName = {dto.RoleName},
                    @Description = {dto.Description},
                    @UpdatedAt = {now}
            ");

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
