using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model
{
    [Table("Materials")]
    public class Material
    {
        [Key]
        public Guid Id { get; set; }

        [Required] [MaxLength(50)]
        public string MaterialCode { get; set; } = string.Empty;

        [Required] [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [ForeignKey(nameof(MaterialType))]
        public Guid? MaterialTypeId { get; set; }
        public virtual MaterialType? MaterialType { get; set; }

        [ForeignKey(nameof(MaterialCategory))]
        public Guid? MaterialCategoryId { get; set; }
        public virtual MaterialCategory? MaterialCategory { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal AvailableQty { get; set; }

        [Required] [MaxLength(30)]
        public string Unit { get; set; } = string.Empty;

        [MaxLength(500)]
        public string ImagePath { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal CostPerUnit { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }
        // This property is used to track the user who created the material 
        public virtual ICollection<MaterialRequestItem> MaterialRequestItems { get; set; } = new List<MaterialRequestItem>();

        public virtual ICollection<ProductMaterialRequirement> ProductMaterialRequirements { get; set; } = new List<ProductMaterialRequirement>();
    }
}
