using System.ComponentModel.DataAnnotations;

namespace backend.Dto.RolePagePermission
{
    public class RolePagePermissionDto
    {
        public Guid Id { get; set; }

        [Required(ErrorMessage = "RolePageAccess is required.")]
        public Guid RolePageAccessId { get; set; }

        [Required(ErrorMessage = "Permission is required.")]
        public Guid PermissionId { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
