using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model;

public class RolePageAccess
{
    public Guid Id { get; set; }

    [Column(nameof(RoleId))]
    public Guid RoleId { get; set; }
    public virtual Role? Role { get; set; } = null!;

    [Column(nameof(PageId))]
    public Guid PageId { get; set; }
    public virtual Page? Page { get; set; } = null!;

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    // Navigation
    public virtual ICollection<RolePagePermission> RolePagePermissions { get; set; } = new List<RolePagePermission>();
}