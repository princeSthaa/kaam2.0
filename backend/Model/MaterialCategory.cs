using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model
{
    [Table("MaterialCategories")]
    public class MaterialCategory
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        
        [ForeignKey(nameof(MaterialType))]
        public Guid MaterialTypeId { get; set; }
        public virtual MaterialType MaterialType { get; set; } = null!;

        //These are navigation properties for the relationships with other entities. They allow you to navigate from a MaterialCategory to its related Materials and SupplierMaterialCategories.
        public virtual ICollection<Material> Materials { get; set; } = new List<Material>();
        public virtual ICollection<SupplierMaterialCategory> SupplierMaterialCategories{ get; set; } = new List<SupplierMaterialCategory>();
    }
}
