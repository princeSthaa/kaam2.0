using System.ComponentModel.DataAnnotations;
using backend.Validation;

namespace backend.Dto.MaterialCategory
{
    public class MaterialCategoryDto
    {
        // <crudgen:properties>
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Name is required.")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "CreatedAt is required.")]
        public DateTime CreatedAt { get; set; }

        public string CreatedBy { get; set; } = string.Empty;

        public DateTime UpdatedAt { get; set; }

        public string UpdatedBy { get; set; } = string.Empty;

        [NotEmptyGuid]
        public Guid MaterialTypeId { get; set; }
        // </crudgen:properties>
    }
}
