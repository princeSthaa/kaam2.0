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
        [MaxLength(500)]
        public string Notes { get; set; } = string.Empty;
        [MaxLength(100)]
        public string InspectorName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual ICollection<MaterialInspectionItem> Items { get; set; } = new List<MaterialInspectionItem>();
    }
}
