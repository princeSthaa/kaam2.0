using System.ComponentModel.DataAnnotations;

namespace backend.Model;

public class Permission
{
    public Guid Id { get; set; }

    [MaxLength(20)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(30)]
    public string Action { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string Description { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    // Navigation
    public virtual ICollection<RolePagePermission> RolePagePermissions { get; set; } = new List<RolePagePermission>();
}