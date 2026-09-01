using System.ComponentModel.DataAnnotations;

namespace backend.Dto.Role
{
    public class RoleDto
    {
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Role name is required.")]
        [MaxLength(30)]
        public string RoleName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Description { get; set; } = string.Empty;

        public Guid? ModulePageId { get; set; }

        public bool IsModuleAdmin { get; set; }

        public bool IsSuperAdmin { get; set; }

        public bool IsSystem { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
