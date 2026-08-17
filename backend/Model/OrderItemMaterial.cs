using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model
{
    [Table("OrderItemMaterials")]
    public class OrderItemMaterial
    {
        [Key]
        public Guid Id { get; set; }
        public Guid MaterialId { get; set; }
        public virtual Material Material { get; set; } = null!;
        [Column(TypeName = "decimal(18,2)")]
        public decimal RequiredQuantity { get; set; }
        [MaxLength(30)]
        public string Unit { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public Guid OrderItemId { get; set; }
        public virtual OrderItem OrderItem { get; set; } = null!;
    }
}
