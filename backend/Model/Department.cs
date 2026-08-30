using System.ComponentModel.DataAnnotations;

namespace backend.Model;

public class Department
{
    public Guid Id { get; set; }
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(10)]
    public string DepartmentCode { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    // Navigation
    public virtual ICollection<Employee> Employees { get; set; } = new List<Employee>();
}