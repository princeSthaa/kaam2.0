using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Dto.MaterialCategory;

namespace backend.Dto.MaterialType
{
    public class MaterialTypeDto
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

        [NotMapped]
        public List<MaterialCategoryDto> MaterialCategories { get; set; } = new List<MaterialCategoryDto>();

        // </crudgen:properties>
    }
}
