namespace backend.Dto.Rbac;

public class CurrentUserAccessDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public Guid RoleId { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public Guid? ModulePageId { get; set; }
    public string? ModuleName { get; set; }
    public string? ModuleRoute { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public bool IsModuleAdmin { get; set; }
    public bool IsSuperAdmin { get; set; }
    public List<RbacPageGrantDto> PageGrants { get; set; } = new();
}

public class RbacPageGrantDto
{
    public Guid PageId { get; set; }
    public string PageName { get; set; } = string.Empty;
    public string Route { get; set; } = string.Empty;
    public Guid? ParentPageId { get; set; }
    public List<string> Actions { get; set; } = new();
}
