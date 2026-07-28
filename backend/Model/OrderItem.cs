using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model
{
    [Table("OrderItems")]
    public class OrderItem
    {
        // <crudgen:properties>
        [Key]
        public Guid Id { get; set; }
        public int Quantity { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }
        public Guid ProductId { get; set; }
        public virtual Product Product { get; set; } = null!;
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPrice { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal Discount { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
        public string UpdatedBy { get; set; } = string.Empty;
        public Guid OrderId { get; set; }
        public virtual Order Order { get; set; } = null!;
        public virtual ICollection<OrderItemSize> OrderItemSizes { get; set; } = new List<OrderItemSize>();
        public virtual ICollection<OrderItemMaterial> OrderItemMaterials { get; set; } = new List<OrderItemMaterial>();
        // </crudgen:properties>
    }
}
