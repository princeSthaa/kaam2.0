using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Dto.MaterialCategory;

namespace backend.Dto.MaterialType
{
    public class MaterialTypeDto
    {
        // <crudgen:properties>
        public Guid Id { get; set; }

        public string MaterialCode { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public string Unit { get; set; } = string.Empty;

        [Required(ErrorMessage = "Name is required.")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "CreatedAt is required.")]
        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        [NotMapped]
        public List<MaterialCategoryDto> MaterialCategories { get; set; } = new List<MaterialCategoryDto>();

        // </crudgen:properties>
    }
}
