using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model
{
    [Table("PurchaseOrderReceiptItems")]
    public class PurchaseOrderReceiptItem
    {
        [Key]
        public Guid Id { get; set; }

        [ForeignKey(nameof(PurchaseOrderReceipt))]
        public Guid PurchaseOrderReceiptId { get; set; }
        public virtual PurchaseOrderReceipt? PurchaseOrderReceipt { get; set; }

        [ForeignKey(nameof(PurchaseOrderItem))]
        public Guid PurchaseOrderItemId { get; set; }
        public virtual PurchaseOrderItem? PurchaseOrderItem { get; set; }

        [ForeignKey(nameof(Material))]
        public Guid MaterialId { get; set; }
        public virtual Material? Material { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal ReceivedQuantity { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
