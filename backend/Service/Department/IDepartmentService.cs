using backend.Dto.Department;

namespace backend.Service.Department
{
    public interface IDepartmentService
    {
        Task<bool> CreateAsync(DepartmentDto dto);

        Task<List<DepartmentGetDto>> GetAllAsync(
            Guid? id = null,
            string? name = null,
            string? departmentCode = null,
            DateTime? createdAt = null,
            DateTime? updatedAt = null
        );

        Task<DepartmentGetDto?> GetByIdAsync(Guid id);

        Task<bool> UpdateAsync(Guid id, DepartmentDto dto);

        Task<bool> DeleteAsync(Guid id);
    }
}
