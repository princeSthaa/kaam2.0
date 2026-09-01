namespace backend.Dto.RolePageAccess;

public class RolePageMatrixItemDto
{
    public Guid RoleId { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public Guid? RolePageAccessId { get; set; }
    public Guid PageId { get; set; }
    public string PageName { get; set; } = string.Empty;
    public string PageRoute { get; set; } = string.Empty;
    public Guid? ParentPageId { get; set; }
    public string? ParentPageName { get; set; }
    public int DisplayOrder { get; set; }
    public string? Icon { get; set; }
    public string? Actions { get; set; } // Comma-separated: "GET,POST,PUT,DELETE"
}

public class RolePageMatrixSaveDto
{
    public Guid RoleId { get; set; }
    public List<PagePermissionAssignmentDto> Assignments { get; set; } = new();
}

public class PagePermissionAssignmentDto
{
    public Guid PageId { get; set; }
    public List<string> Actions { get; set; } = new(); // ["GET", "POST", "PUT", "DELETE"]
}
