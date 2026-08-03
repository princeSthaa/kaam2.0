using System.ComponentModel.DataAnnotations;
using backend.Validation;

namespace backend.Dto.MaterialCategory
{
    public class MaterialCategoryDto
    {
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Name is required.")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "CreatedAt is required.")]
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        [NotEmptyGuid]
        public Guid MaterialTypeId { get; set; }
    }
}
