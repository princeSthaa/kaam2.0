using System.ComponentModel.DataAnnotations;

namespace backend.Dto.RolePageAccess
{
    public class RolePageAccessDto
    {
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Role is required.")]
        public Guid RoleId { get; set; }

        [Required(ErrorMessage = "Page is required.")]
        public Guid PageId { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
