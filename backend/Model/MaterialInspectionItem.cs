using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Model.Enums;

namespace backend.Model
{
    [Table("MaterialInspectionItems")]
    public class MaterialInspectionItem
    {
        [Key]
        public Guid Id { get; set; }

        [ForeignKey(nameof(MaterialInspection))]
        public Guid MaterialInspectionId { get; set; }
        public virtual MaterialInspection MaterialInspection { get; set; } = null!;

        [ForeignKey(nameof(Material))]
        public Guid MaterialId { get; set; }
        public virtual Material Material { get; set; } = null!;

        [Column(TypeName = "decimal(18,2)")]
        public decimal ReceivedQuantity { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal AcceptedQuantity { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal RejectedQuantity { get; set; }

        [MaxLength(50)]
        public InspectionStatus InspectionStatus { get; set; } = InspectionStatus.Pending;

        public string Notes { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public string UpdatedBy { get; set; } = string.Empty;

        public Guid PurchaseOrderReceiptItemId { get; set; }
        public virtual PurchaseOrderReceiptItem PurchaseOrderReceiptItem { get; set; } = null!;
    }
}
