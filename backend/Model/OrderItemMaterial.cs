using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model
{
    [Table("OrderItemMaterials")]
    public class OrderItemMaterial
    {
        // <crudgen:properties>
        [Key]
        public Guid Id { get; set; }
        public Guid MaterialId { get; set; }
        public virtual Material Material { get; set; } = null!;
        [Column(TypeName = "decimal(18,2)")]
        public decimal RequiredQuantity { get; set; }
        public string Unit { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
        public string UpdatedBy { get; set; } = string.Empty;
        public Guid OrderItemId { get; set; }
        public virtual OrderItem OrderItem { get; set; } = null!;
        // </crudgen:properties>
    }
}
