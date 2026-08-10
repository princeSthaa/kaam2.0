using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Model.Enums;

namespace backend.Model
{
    [Table("MaterialInspections")]
    public class MaterialInspection
    {
        [Key]
        public Guid Id { get; set; }

        [ForeignKey(nameof(PurchaseOrderReceipt))]
        public Guid PurchaseOrderReceiptId { get; set; }
        public virtual PurchaseOrderReceipt? PurchaseOrderReceipt { get; set; }

        [ForeignKey(nameof(Supplier))]
        public Guid? SupplierId { get; set; }
        public virtual Supplier? Supplier { get; set; }

        [MaxLength(50)]
        public InspectionStatus InspectionStatus { get; set; } = InspectionStatus.Pending;
        public string Notes { get; set; } = string.Empty;
        public string InspectorName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public string UpdatedBy { get; set; } = string.Empty;

        public virtual ICollection<MaterialInspectionItem> Items { get; set; } = new List<MaterialInspectionItem>();
    }
}
