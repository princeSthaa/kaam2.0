using System.ComponentModel.DataAnnotations;

namespace backend.Dto.Permission
{
    public class PermissionDto
    {
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Name is required.")]
        [MaxLength(20)]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Action is required.")]
        [MaxLength(30)]
        public string Action { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Description { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
