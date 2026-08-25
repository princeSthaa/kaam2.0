using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model;

public class RolePagePermission
{
    public Guid Id { get; set; }

    [Column(nameof(RolePageAccessId))]
    public Guid RolePageAccessId { get; set; }
    public virtual RolePageAccess? RolePageAccess { get; set; }

    [Column(nameof(PermissionId))]
    public Guid PermissionId { get; set; }
    public virtual Permission? Permission { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

}