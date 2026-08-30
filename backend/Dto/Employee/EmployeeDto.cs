
namespace backend.Dto.Employee
{
    public class EmployeeDto
    {
        public Guid Id { get; set; }

        public string? FirstName { get; set; }

        public string? LastName { get; set; }

        public string? PhoneNumber { get; set; }

        public string? Email { get; set; }

        public string? Password { get; set; }

        public Guid? EmployeeRoleId { get; set; }

        public Guid? DepartmentId { get; set; }

        public bool? IsActive { get; set; } = true;

        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
