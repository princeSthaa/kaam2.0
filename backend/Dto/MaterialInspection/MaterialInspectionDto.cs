using System;
using System.Collections.Generic;

namespace backend.Dto.MaterialInspection
{
    public class MaterialInspectionDto
    {
        public Guid Id { get; set; }
        public Guid PurchaseOrderReceiptId { get; set; }
        public string ReceiptNumber { get; set; } = string.Empty;
        public Guid? PurchaseOrderId { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public Guid? SupplierId { get; set; }
        public string SupplierCode { get; set; } = string.Empty;
        public string SupplierName { get; set; } = string.Empty;
        public string InspectionStatus { get; set; } = "Pending";
        public string InspectorName { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
        public string UpdatedBy { get; set; } = string.Empty;

        public List<MaterialInspectionItemDto> Items { get; set; } = new();
    }
}
