using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.RolePagePermission;

namespace backend.Service.RolePagePermission
{
    public class RolePagePermissionService : IRolePagePermissionService
    {
        private readonly AppDbContext _context;

        public RolePagePermissionService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> CreateAsync(RolePagePermissionDto dto)
        {
            if (dto.Id == Guid.Empty)
            {
                dto.Id = Guid.NewGuid();
            }

            var now = DateTime.UtcNow;
            dto.CreatedAt = dto.CreatedAt == default ? now : dto.CreatedAt;
            dto.UpdatedAt = now;

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertRolePagePermission
                    @Id = {dto.Id},
                    @RolePageAccessId = {dto.RolePageAccessId},
                    @PermissionId = {dto.PermissionId},
                    @CreatedAt = {dto.CreatedAt},
                    @UpdatedAt = {dto.UpdatedAt}
            ");

            return true;
        }

        public async Task<List<RolePagePermissionGetDto>> GetAllAsync(
            Guid? id = null,
            Guid? rolePageAccessId = null,
            Guid? permissionId = null,
            DateTime? createdAt = null,
            DateTime? updatedAt = null
        )
        {
            return await _context.Database
                .SqlQuery<RolePagePermissionGetDto>($@"
                    EXEC sp_GetRolePagePermissions
                        @Id = {id},
                        @RolePageAccessId = {rolePageAccessId},
                        @PermissionId = {permissionId},
                        @CreatedAt = {createdAt},
                        @UpdatedAt = {updatedAt}
                ")
                .ToListAsync();
        }

        public async Task<RolePagePermissionGetDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<bool> UpdateAsync(Guid id, RolePagePermissionDto dto)
        {
            var now = DateTime.UtcNow;

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateRolePagePermission
                    @Id = {id},
                    @RolePageAccessId = {dto.RolePageAccessId},
                    @PermissionId = {dto.PermissionId},
                    @UpdatedAt = {now}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteRolePagePermission
                    @Id = {id}
            ");

            return true;
        }
    }
}
