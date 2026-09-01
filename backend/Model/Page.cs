using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model;

public class Page
{
    public Guid Id { get; set; }

    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(256)]
    public string Route { get; set; } = string.Empty;
    
    [MaxLength(40)]
    public string? Icon { get; set; }

    [Column(nameof(ParentPageId))]
    public Guid? ParentPageId { get; set; }
    public virtual Page? ParentPage { get; set; }

    public int DisplayOrder { get; set; }

    public bool IsActive { get; set; } 

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
    
    // Children
    public virtual ICollection<Page> ChildPages { get; set; } = new List<Page>();

    // Navigation
    public virtual ICollection<RolePageAccess> RolePageAccesses { get; set; } = new List<RolePageAccess>();
}
