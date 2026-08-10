    using System;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    namespace backend.Model
    {
        [Table("PurchaseOrderItems")]
        public class PurchaseOrderItem
        {
            [Key]
            public Guid Id { get; set; }

            [ForeignKey(nameof(PurchaseOrder))]
            public Guid PurchaseOrderId { get; set; }
            public virtual PurchaseOrder? PurchaseOrder { get; set; }

            [ForeignKey(nameof(Material))]
            public Guid MaterialId { get; set; }
            public virtual Material? Material { get; set; }

            [Column(TypeName = "decimal(18,2)")]
            public decimal OrderedQuantity { get; set; }

            [Column(TypeName = "decimal(18,2)")]
            public decimal UnitPrice { get; set; }

            [Column(TypeName = "decimal(18,2)")]
            public decimal TotalPrice { get; set; }
            public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
            public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        }
    }
