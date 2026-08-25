using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.Permission;

namespace backend.Service.Permission
{
    public class PermissionService : IPermissionService
    {
        private readonly AppDbContext _context;

        public PermissionService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> CreateAsync(PermissionDto dto)
        {
            if (dto.Id == Guid.Empty)
            {
                dto.Id = Guid.NewGuid();
            }

            var now = DateTime.UtcNow;
            dto.CreatedAt = dto.CreatedAt == default ? now : dto.CreatedAt;
            dto.UpdatedAt = now;

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertPermission
                    @Id = {dto.Id},
                    @Name = {dto.Name},
                    @Action = {dto.Action},
                    @Description = {dto.Description},
                    @CreatedAt = {dto.CreatedAt},
                    @UpdatedAt = {dto.UpdatedAt}
            ");

            return true;
        }

        public async Task<List<PermissionGetDto>> GetAllAsync(
            Guid? id = null,
            string? name = null,
            string? action = null,
            DateTime? createdAt = null,
            DateTime? updatedAt = null
        )
        {
            return await _context.Database
                .SqlQuery<PermissionGetDto>($@"
                    EXEC sp_GetPermissions
                        @Id = {id},
                        @Name = {name},
                        @Action = {action},
                        @CreatedAt = {createdAt},
                        @UpdatedAt = {updatedAt}
                ")
                .ToListAsync();
        }

        public async Task<PermissionGetDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<bool> UpdateAsync(Guid id, PermissionDto dto)
        {
            var now = DateTime.UtcNow;

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdatePermission
                    @Id = {id},
                    @Name = {dto.Name},
                    @Action = {dto.Action},
                    @Description = {dto.Description},
                    @UpdatedAt = {now}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeletePermission
                    @Id = {id}
            ");

            return true;
        }
    }
}
