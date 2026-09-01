using backend.Dto.RolePageAccess;

namespace backend.Dto.Role
{
    public class RoleGetDto
    {
        public Guid Id { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Guid? ModulePageId { get; set; }
        public string? ModuleName { get; set; }
        public string? ModuleRoute { get; set; }
        public bool IsModuleAdmin { get; set; }
        public bool IsSuperAdmin { get; set; }
        public bool IsSystem { get; set; }
        public int EmployeeCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<RolePageAccessGetDto> PageAccesses { get; set; } = new();
    }
}
