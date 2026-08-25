using Dapper;
using System.Data;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.RolePageAccess;
using backend.Dto.RolePagePermission;

namespace backend.Service.RolePageAccess
{
    public class RolePageAccessService : IRolePageAccessService
    {
        private readonly AppDbContext _context;

        public RolePageAccessService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> CreateAsync(RolePageAccessDto dto)
        {
            if (dto.Id == Guid.Empty)
            {
                dto.Id = Guid.NewGuid();
            }

            var now = DateTime.UtcNow;
            dto.CreatedAt = dto.CreatedAt == default ? now : dto.CreatedAt;
            dto.UpdatedAt = now;

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertRolePageAccess
                    @Id = {dto.Id},
                    @RoleId = {dto.RoleId},
                    @PageId = {dto.PageId},
                    @CreatedAt = {dto.CreatedAt},
                    @UpdatedAt = {dto.UpdatedAt}
            ");

            return true;
        }

        public async Task<List<RolePageAccessGetDto>> GetAllAsync(
            Guid? id = null,
            Guid? roleId = null,
            Guid? pageId = null,
            DateTime? createdAt = null,
            DateTime? updatedAt = null
        )
        {
            var connection = _context.Database.GetDbConnection();
            var parameters = new DynamicParameters();
            parameters.Add("@Id", id);
            parameters.Add("@RoleId", roleId);
            parameters.Add("@PageId", pageId);
            parameters.Add("@CreatedAt", createdAt);
            parameters.Add("@UpdatedAt", updatedAt);

            using var multi = await connection.QueryMultipleAsync(
                "sp_GetRolePageAccesses",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            var accesses = !multi.IsConsumed ? (await multi.ReadAsync<RolePageAccessGetDto>()).ToList() : new List<RolePageAccessGetDto>();
            var permissions = !multi.IsConsumed ? (await multi.ReadAsync<RolePagePermissionGetDto>()).ToList() : new List<RolePagePermissionGetDto>();

            foreach (var access in accesses)
            {
                access.Permissions = permissions.Where(p => p.RolePageAccessId == access.Id).ToList();
            }

            return accesses;
        }

        public async Task<RolePageAccessGetDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<bool> UpdateAsync(Guid id, RolePageAccessDto dto)
        {
            var now = DateTime.UtcNow;

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateRolePageAccess
                    @Id = {id},
                    @RoleId = {dto.RoleId},
                    @PageId = {dto.PageId},
                    @UpdatedAt = {now}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteRolePageAccess
                    @Id = {id}
            ");

            return true;
        }
    }
}
