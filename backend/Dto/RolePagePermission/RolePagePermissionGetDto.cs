namespace backend.Dto.RolePagePermission
{
    public class RolePagePermissionGetDto
    {
        public Guid Id { get; set; }
        public Guid RolePageAccessId { get; set; }
        public Guid RoleId { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public Guid PageId { get; set; }
        public string PageName { get; set; } = string.Empty;
        public Guid PermissionId { get; set; }
        public string PermissionName { get; set; } = string.Empty;
        public string PermissionAction { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
