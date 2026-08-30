namespace backend.Dto.Employee
{
    public class EmployeeGetDto
    {
        public Guid Id { get; set; }
        public string? FirstName { get; set; } = string.Empty;
        public string? LastName { get; set; } = string.Empty;
        public string? FullName => $"{FirstName} {LastName}".Trim();
        public string? PhoneNumber { get; set; } = string.Empty;
        public string? Email { get; set; } = string.Empty;
        // public string? Password { get; set; } = string.Empty;
        public Guid?EmployeeRoleId { get; set; }
        public string? RoleName { get; set; } = string.Empty;
        public Guid? DepartmentId { get; set; }
        public string? DepartmentName { get; set; } = string.Empty;
        public string? DepartmentCode { get; set; } = string.Empty;
        public bool? IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
