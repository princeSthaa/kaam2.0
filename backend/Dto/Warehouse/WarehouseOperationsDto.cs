using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Dto.Warehouse
{
    public class SupplierInspectionDto
    {
        [Required]
        public string MaterialId { get; set; } = string.Empty;
        public string MaterialName { get; set; } = string.Empty;
        public string SupplierName { get; set; } = string.Empty;

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Received quantity must be greater than zero.")]
        public decimal ReceivedQuantity { get; set; }

        [Required]
        public string InspectionStatus { get; set; } = "Accepted"; // "Accepted" or "Purchase Return"

        public string Notes { get; set; } = string.Empty;
        public string InspectorName { get; set; } = "QA Inspector";
    }

    public class FinishedGoodsAcceptanceDto
    {
        [Required]
        public string ProductId { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1.")]
        public int Quantity { get; set; }

        public string SourceFactoryLine { get; set; } = string.Empty;
        public string Location { get; set; } = "Central Warehouse Rack A";
        public string AcceptedBy { get; set; } = "Warehouse Supervisor";
    }

    public class ProductSaleDispatchDto
    {
        [Required]
        public string ProductId { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Dispatch quantity must be at least 1.")]
        public int Quantity { get; set; }

        [Required]
        public string CustomerName { get; set; } = string.Empty;
        public string OrderNumber { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
    }

    public class CustomerReturnDto
    {
        [Required]
        public string OrderNumber { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string ProductId { get; set; } = string.Empty;

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Returned quantity must be at least 1.")]
        public int ReturnedQuantity { get; set; }

        public string Reason { get; set; } = "Damaged / Defective"; // "Damaged", "Defective", "Wrong Size"
        public string Notes { get; set; } = string.Empty;
        public string ProcessedBy { get; set; } = "Warehouse Representative";
    }
}
