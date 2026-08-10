using System;
using System.Collections.Generic;

namespace backend.Dto.PurchaseOrderReceipt
{
    public class PurchaseOrderReceiptDto
    {
        public Guid Id { get; set; }
        public Guid PurchaseOrderId { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public string ReceiptNumber { get; set; } = string.Empty;
        public DateTime ReceivedDate { get; set; }
        public string ReceivedBy { get; set; } = string.Empty;
        public string DeliveryNoteNumber { get; set; } = string.Empty;
        public string Remarks { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public List<PurchaseOrderReceiptItemDto> Items { get; set; } = new List<PurchaseOrderReceiptItemDto>();
    }
}
