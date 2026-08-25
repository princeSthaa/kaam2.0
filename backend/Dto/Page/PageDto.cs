using System.ComponentModel.DataAnnotations;

namespace backend.Dto.Page
{
    public class PageDto
    {
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Name is required.")]
        [MaxLength(40)]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Route is required.")]
        [MaxLength(40)]
        public string Route { get; set; } = string.Empty;

        public string? Icon { get; set; }

        public Guid? ParentPageId { get; set; }

        public int DisplayOrder { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
