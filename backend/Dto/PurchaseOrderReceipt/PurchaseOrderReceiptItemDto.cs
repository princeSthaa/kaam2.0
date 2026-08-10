using System;

namespace backend.Dto.PurchaseOrderReceipt
{
    public class PurchaseOrderReceiptItemDto
    {
        public Guid Id { get; set; }
        public Guid PurchaseOrderReceiptId { get; set; }
        public Guid PurchaseOrderItemId { get; set; }
        public Guid MaterialId { get; set; }
        public string MaterialCode { get; set; } = string.Empty;
        public string MaterialName { get; set; } = string.Empty;
        public decimal ReceivedQuantity { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
