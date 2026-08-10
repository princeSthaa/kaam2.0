using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Model.Enums;

namespace backend.Model
{
    [Table("PurchaseOrderReceipts")]
    public class PurchaseOrderReceipt
    {
        [Key]
        public Guid Id { get; set; }

        [ForeignKey(nameof(PurchaseOrder))]
        public Guid PurchaseOrderId { get; set; }
        public virtual PurchaseOrder? PurchaseOrder { get; set; }

        [Required]
        [MaxLength(100)]
        public string ReceiptNumber { get; set; } = string.Empty;

        public DateTime ReceivedDate { get; set; } = DateTime.UtcNow;

        [MaxLength(200)]
        public string ReceivedBy { get; set; } = string.Empty;

        [MaxLength(100)]
        public string DeliveryNoteNumber { get; set; } = string.Empty;

        public string Remarks { get; set; } = string.Empty;

        public ReceiptStatus Status { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual ICollection<PurchaseOrderReceiptItem> Items { get; set; } = new List<PurchaseOrderReceiptItem>();
        public virtual MaterialInspection? MaterialInspection { get; set; }
    }
}
