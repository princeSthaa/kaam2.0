namespace backend.Dto.Department
{
    public class DepartmentGetDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string DepartmentCode { get; set; } = string.Empty;
        public int EmployeeCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
