using backend.Dto.Employee;

namespace backend.Service.Employee
{
    public interface IEmployeeService
    {
        Task<bool> CreateAsync(EmployeeDto dto);

        Task<List<EmployeeGetDto>> GetAllAsync(
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
        );

        Task<EmployeeGetDto?> GetByIdAsync(Guid id);

        Task<bool> UpdateAsync(Guid id, EmployeeDto dto);

        Task<bool> DeleteAsync(Guid id);
    }
}
