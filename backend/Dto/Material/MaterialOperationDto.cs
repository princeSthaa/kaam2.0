using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Dto.Material
{
    public class SupplierMaterialRequestDto
    {
        [Required]
        public string MaterialId { get; set; } = string.Empty;
        public string MaterialName { get; set; } = string.Empty;

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Requested quantity must be greater than zero.")]
        public decimal RequestedQuantity { get; set; }

        public string SupplierName { get; set; } = string.Empty;
        public string Urgency { get; set; } = "Normal";
        public DateTime? RequiredDate { get; set; }
        public string Notes { get; set; } = string.Empty;
        public string RequestedBy { get; set; } = "Warehouse Manager";
    }

    public class MaterialIssueDto
    {
        [Required]
        public string MaterialId { get; set; } = string.Empty;

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Issue quantity must be greater than zero.")]
        public decimal IssueQuantity { get; set; }

        [Required]
        public string TargetDestination { get; set; } = string.Empty; // e.g. Factory Line 1, Main Assembly
        public string IssuedTo { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
    }
}
