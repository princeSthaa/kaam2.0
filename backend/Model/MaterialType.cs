using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model
{
    [Table("MaterialTypes")]
    public class MaterialType
    {
        // <crudgen:properties>
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public virtual ICollection<MaterialCategory> MaterialCategories { get; set; } = new List<MaterialCategory>();
        public virtual ICollection<ProductMaterialRequirement> ProductMaterialRequirements { get; set; } = new List<ProductMaterialRequirement>();
        // </crudgen:properties>
    }
}
