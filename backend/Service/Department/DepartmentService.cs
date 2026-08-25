using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.Department;

namespace backend.Service.Department
{
    public class DepartmentService : IDepartmentService
    {
        private readonly AppDbContext _context;

        public DepartmentService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> CreateAsync(DepartmentDto dto)
        {
            dto.Id = Guid.NewGuid();
            var now = DateTime.UtcNow;
            
            var count = await _context.Departments.CountAsync();
            dto.DepartmentCode = $"DEP-{(count+1):D2}";

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertDepartment
                    @Id = {dto.Id},
                    @Name = {dto.Name},
                    @DepartmentCode = {dto.DepartmentCode},
                    @CreatedAt = {now},
                    @UpdatedAt = {now}
            ");

            return true;
        }

        public async Task<List<DepartmentGetDto>> GetAllAsync(
            Guid? id = null,
            string? name = null,
            string? departmentCode = null,
            DateTime? createdAt = null,
            DateTime? updatedAt = null
        )
        {
            return await _context.Database
                .SqlQuery<DepartmentGetDto>($@"
                    EXEC sp_GetDepartments
                        @Id = {id},
                        @Name = {name},
                        @DepartmentCode = {departmentCode},
                        @CreatedAt = {createdAt},
                        @UpdatedAt = {updatedAt}
                ")
                .ToListAsync();
        }

        public async Task<DepartmentGetDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<bool> UpdateAsync(Guid id, DepartmentDto dto)
        {
            var now = DateTime.UtcNow;

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateDepartment
                    @Id = {id},
                    @Name = {dto.Name},
                    @DepartmentCode = {dto.DepartmentCode},
                    @UpdatedAt = {now}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteDepartment
                    @Id = {id}
            ");

            return true;
        }
    }
}
