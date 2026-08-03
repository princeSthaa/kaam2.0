using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Model
{
    [Index(nameof(SKU), IsUnique = true)]
    [Table("Products")]
    public class Product
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        [MaxLength(50)]
        public string SKU { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        public string ImagePath { get; set; } = string.Empty;

        public bool isActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        [ForeignKey(nameof(ProductCategory))]
        public Guid ProductCategoryId { get; set; }

        public virtual ProductCategory ProductCategory { get; set; } = null!;
        
        public virtual ICollection<ProductMaterialRequirement> MaterialRequirements { get; set; } = new List<ProductMaterialRequirement>();

        public ICollection<ProductProductionStage> ProductionStages { get; set; } = new List<ProductProductionStage>();


    }
}
