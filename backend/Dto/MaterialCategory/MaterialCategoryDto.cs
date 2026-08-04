using System.ComponentModel.DataAnnotations;
using backend.Validation;

namespace backend.Dto.MaterialCategory
{
    public class MaterialCategoryDto
    {
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Name is required.")]
        public string Name { get; set; } = string.Empty;
        public string MaterialCode { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;

        [Required(ErrorMessage = "CreatedAt is required.")]
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        [NotEmptyGuid]
        public Guid MaterialTypeId { get; set; }
    }
}
