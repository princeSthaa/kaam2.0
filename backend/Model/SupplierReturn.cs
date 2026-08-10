using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model
{
    [Table("SupplierReturns")]
    public class SupplierReturn
    {
        [Key]
        public Guid Id { get; set; }

        [ForeignKey(nameof(Supplier))]
        public Guid SupplierId { get; set; }
        public virtual Supplier Supplier { get; set; } = null!;

        [ForeignKey(nameof(PurchaseOrderReceipt))]
        public Guid PurchaseOrderReceiptId { get; set; }
        public virtual PurchaseOrderReceipt PurchaseOrderReceipt { get; set; } = null!;

        [ForeignKey(nameof(MaterialInspection))]
        public Guid MaterialInspectionId { get; set; }
        public virtual MaterialInspection MaterialInspection { get; set; } = null!;

        [ForeignKey(nameof(MaterialInspectionItem))]
        public Guid MaterialInspectionItemId { get; set; }
        public virtual MaterialInspectionItem MaterialInspectionItem { get; set; } = null!;

        [ForeignKey(nameof(Material))]
        public Guid MaterialId { get; set; }
        public virtual Material Material { get; set; } = null!;

        [Column(TypeName = "decimal(18,2)")]
        public decimal ReturnedQuantity { get; set; }

        [MaxLength(50)]
        public string ReturnStatus { get; set; } = "Pending";
        
        public DateTime ReturnDate { get; set; } = DateTime.UtcNow;

        public string Reason { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public string UpdatedBy { get; set; } = string.Empty;
    }
}
