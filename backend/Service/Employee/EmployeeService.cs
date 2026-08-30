using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.Employee;

namespace backend.Service.Employee
{
    public class EmployeeService : IEmployeeService
    {
        private readonly AppDbContext _context;

        public EmployeeService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> CreateAsync(EmployeeDto dto)
        {
            dto.Id = Guid.NewGuid();
            var now = DateTime.UtcNow;

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertEmployee
                    @Id = {dto.Id},
                    @FirstName = {dto.FirstName},
                    @LastName = {dto.LastName},
                    @PhoneNumber = {dto.PhoneNumber},
                    @Email = {dto.Email},
                    @Password = {dto.Password},
                    @EmployeeRoleId = {dto.EmployeeRoleId},
                    @DepartmentId = {dto.DepartmentId},
                    @IsActive = {dto.IsActive},
                    @CreatedAt = {now},
                    @UpdatedAt = {now}
            ");

            return true;
        }

        public async Task<List<EmployeeGetDto>> GetAllAsync(
            Guid? id = null,
            string? firstName = null,
            string? lastName = null,
            string? email = null,
            string? password = null,
            string? phoneNumber = null,
            Guid? employeeRoleId = null,
            Guid? departmentId = null,
            bool? isActive = null,
            DateTime? createdAt = null,
            DateTime? updatedAt = null
        )
        {
            return await _context.Database
                .SqlQuery<EmployeeGetDto>($@"
                    EXEC sp_GetEmployees
                        @Id = {id},
                        @FirstName = {firstName},
                        @LastName = {lastName},
                        @Email = {email},
                        @Password = {password},
                        @PhoneNumber = {phoneNumber},
                        @EmployeeRoleId = {employeeRoleId},
                        @DepartmentId = {departmentId},
                        @IsActive = {isActive},
                        @CreatedAt = {createdAt},
                        @UpdatedAt = {updatedAt}
                ")
                .ToListAsync();
        }

        public async Task<EmployeeGetDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<bool> UpdateAsync(Guid id, EmployeeDto dto)
        {
            var now = DateTime.UtcNow;

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateEmployee
                    @Id = {id},
                    @FirstName = {dto.FirstName},
                    @LastName = {dto.LastName},
                    @PhoneNumber = {dto.PhoneNumber},
                    @Email = {dto.Email},
                    @Password = {dto.Password},
                    @EmployeeRoleId = {dto.EmployeeRoleId},
                    @DepartmentId = {dto.DepartmentId},
                    @IsActive = {dto.IsActive},
                    @UpdatedAt = {now}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteEmployee
                    @Id = {id}
            ");

            return true;
        }
    }
}
