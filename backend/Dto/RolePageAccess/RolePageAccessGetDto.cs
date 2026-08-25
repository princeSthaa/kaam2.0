using backend.Dto.RolePagePermission;

namespace backend.Dto.RolePageAccess
{
    public class RolePageAccessGetDto
    {
        public Guid Id { get; set; }
        public Guid RoleId { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public Guid PageId { get; set; }
        public string PageName { get; set; } = string.Empty;
        public string PageRoute { get; set; } = string.Empty;
        public string? PageIcon { get; set; }
        public int PageDisplayOrder { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<RolePagePermissionGetDto> Permissions { get; set; } = new();
    }
}
