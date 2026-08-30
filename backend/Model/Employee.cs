using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model;

public class Employee
{
    public Guid Id { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    [Column(nameof(EmployeeRoleId))]
    public Guid EmployeeRoleId { get; set; }
    public virtual Role? EmployeeRole { get; set; }

    public bool IsActive { get; set; }

    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    [Column(nameof(DepartmentId))]
    public Guid DepartmentId { get; set; }
    public virtual Department? Department { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    // Navigation

}