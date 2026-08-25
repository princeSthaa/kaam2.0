using System.ComponentModel.DataAnnotations;

namespace backend.Model;

public class Role
{
    public Guid Id { get; set; }

    [MaxLength(30)]
    public string RoleName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Description { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    // Navigation
    public virtual ICollection<Employee> Employees { get; set; } = new List<Employee>();

    public virtual ICollection<RolePageAccess> RolePageAccesses { get; set; } = new List<RolePageAccess>();
}