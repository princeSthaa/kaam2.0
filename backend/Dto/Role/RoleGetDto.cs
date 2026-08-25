using backend.Dto.RolePageAccess;

namespace backend.Dto.Role
{
    public class RoleGetDto
    {
        public Guid Id { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int EmployeeCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<RolePageAccessGetDto> PageAccesses { get; set; } = new();
    }
}
